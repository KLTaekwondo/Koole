/**
 * 实验采样器 —— 把一次实验整理成「一条记录」
 *
 * 两种记录形态：
 *   series   ：有真实动力学过程，记录随时间变化的序列（曲线）
 *   snapshot ：几何/稳态关系，记录「参数 → 结果指标」，没有时间轴
 *
 * 三种结算触发：
 *   finish   ：模型自己结束（球落地、滑块到终点）
 *   window   ：跑满 windowSeconds（不可终止的模型：单摆、电路…）
 *   timeout  ：finish 模式下超过 maxSeconds 还没结束，兜底结算
 *   manual   ：用户手动点「记录」
 *
 * 这个文件不依赖 Vue / DOM，可以单独在 Node 里测试。
 */

export const SAMPLE_INTERVAL = 0.05      // 20 Hz
export const MAX_POINTS = 600            // 每条序列最多 600 点
export const DEFAULT_WINDOW_SECONDS = 10 // 时间窗口默认 10 秒
export const DEFAULT_MAX_SECONDS = 60    // finish 模式的兜底上限
export const MAX_AUTO_SEGMENTS = 3       // 滚动分段最多连记 3 条

/** 抽稀：点数超上限时隔点保留，始终保住首尾 */
export function decimatePoints(points, max = MAX_POINTS) {
  if (points.length <= max) return points
  const keep = []
  for (let i = 0; i < points.length; i += 2) keep.push(points[i])
  if (keep[keep.length - 1] !== points[points.length - 1]) keep.push(points[points.length - 1])
  return keep.length <= max ? keep : keep.slice(0, max - 1).concat([points[points.length - 1]])
}

/**
 * @param {Object} spec 模型的 dataSpec
 * @param {Object} meta { modelId, modelName }
 */
export function createExperimentSampler(spec = {}, meta = {}) {
  const kind = spec.kind === "snapshot" ? "snapshot" : "series"
  const settleMode = spec.settle === "window" ? "window" : "finish"
  const windowSeconds = Number(spec.windowSeconds) || DEFAULT_WINDOW_SECONDS
  const maxSeconds = Number(spec.maxSeconds) || DEFAULT_MAX_SECONDS
  const seriesSpec = Array.isArray(spec.series) ? spec.series : []
  const metricsSpec = Array.isArray(spec.metrics) ? spec.metrics : []
  const eventsSpec = Array.isArray(spec.events) ? spec.events : []

  let series = []
  let events = []
  let lastSampleAt = Number.NEGATIVE_INFINITY
  let startedAt = 0
  let windowStart = 0
  let autoSegments = 0
  let previousState = null

  const emptySeries = () => seriesSpec.map(s => ({
    key: s.key,
    label: s.label || s.key,
    unit: s.unit || "",
    points: [],
  }))

  const reset = (startT = 0) => {
    series = emptySeries()
    events = []
    lastSampleAt = Number.NEGATIVE_INFINITY
    startedAt = startT
    windowStart = startT
    previousState = null
  }

  reset(0)

  const buffered = () => ({
    duration: Math.max(0, (series[0]?.points.at(-1)?.[0] ?? 0) - startedAt),
    points: series[0]?.points.length || 0,
    autoSegments,
  })

  /** 每个模拟步调用一次；内部按 20Hz 降频采样 */
  const tick = ({ state, params, simTime }) => {
    // 事件检测：需要上一帧状态对比
    if (previousState) {
      for (const event of eventsSpec) {
        if (typeof event.detect !== "function") continue
        if (event.detect(state, previousState, params, simTime)) {
          events.push({ t: Number(simTime.toFixed(3)), label: event.label || event.key || "事件" })
          if (events.length > 40) events.shift()
        }
      }
    }
    previousState = { ...state }

    if (kind !== "series") return
    // 用容差判断，否则浮点误差会让采样实际降到 16Hz 左右
    if (simTime - lastSampleAt < SAMPLE_INTERVAL - 1e-6) return
    lastSampleAt = simTime

    for (const target of series) {
      const definition = seriesSpec.find(d => d.key === target.key)
      if (typeof definition?.sample !== "function") continue
      const value = definition.sample(state, params, simTime)
      if (typeof value === "number" && Number.isFinite(value)) {
        target.points.push([Number(simTime.toFixed(3)), Number(value.toFixed(4))])
        if (target.points.length > MAX_POINTS * 2) target.points = decimatePoints(target.points)
      }
    }
  }

  /** 是否该结算；返回 null 表示继续采样 */
  const shouldSettle = ({ simTime, isFinished }) => {
    if (kind === "snapshot") return null
    if (settleMode === "finish") {
      if (isFinished) return "finish"
      if (simTime - windowStart >= maxSeconds) return "timeout"
      return null
    }
    if (simTime - windowStart >= windowSeconds) return "window"
    return null
  }

  /** 结算成一条记录；返回 null 表示没有有效数据 */
  const settle = ({ state, params, simTime, trigger = "manual" }) => {
    const metrics = []
    for (const item of metricsSpec) {
      let value = null
      try {
        value = typeof item.compute === "function" ? item.compute(state, params, simTime) : null
      } catch {
        value = null
      }
      if (typeof value === "number" && Number.isFinite(value)) {
        metrics.push({ key: item.key, label: item.label || item.key, unit: item.unit || "", value: Number(value.toFixed(4)) })
      }
    }

    const cleanedSeries = series
      .filter(s => s.points.length >= 2)
      .map(s => ({ ...s, points: decimatePoints(s.points) }))

    const duration = Math.max(0, Number((simTime - startedAt).toFixed(2)))
    const hasData = cleanedSeries.length > 0 || metrics.length > 0
    if (!hasData) return null

    const record = {
      id: `run_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
      modelId: meta.modelId || "",
      modelName: meta.modelName || "",
      createdAt: Date.now(),
      label: "",
      note: "",
      kind,
      trigger,
      windowSeconds: settleMode === "window" ? windowSeconds : null,
      params: { ...params },
      duration,
      metrics,
      series: cleanedSeries,
      events: [...events],
    }

    // 结算后开始下一段
    autoSegments += trigger === "manual" ? 0 : 1
    reset(simTime)
    return record
  }

  return {
    kind,
    settleMode,
    windowSeconds,
    maxSeconds,
    maxAutoSegments: MAX_AUTO_SEGMENTS,
    reset,
    tick,
    shouldSettle,
    settle,
    buffered,
    get autoSegments() { return autoSegments },
    get canAutoRecord() { return autoSegments < MAX_AUTO_SEGMENTS },
    /** 参数稳定后的快照（snapshot 用） */
    snapshot({ state, params, simTime }) {
      return settle({ state, params, simTime, trigger: "manual" })
    },
  }
}
