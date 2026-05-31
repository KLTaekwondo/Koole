/**
 * 轨迹录制与对比模块
 * 功能：录制模拟轨迹、多轨迹对比、轨迹显隐控制
 */
import { useTrailState } from "./useTrailState.js"

const TRAIL_COLORS = [
  "#3498db", // 蓝
  "#e74c3c", // 红
  "#2ecc71", // 绿
  "#f39c12", // 橙
  "#9b59b6", // 紫
  "#1abc9c", // 青
  "#e67e22", // 深橙
  "#34495e", // 深蓝灰
]

const MAX_RECORDS = 8

export function createTrailRecorder(modelRef, getParams, getState, getSimTime) {
  const { recordedTrails, clearRecords, removeRecord, toggleTrailVisibility } = useTrailState()
  let simCounter = 0

  function makeParamLabel(params) {
    return Object.entries(params)
      .filter(([key]) => !["gravity"].includes(key))
      .slice(0, 2)
      .map(([key, value]) => `${key}=${Number.isInteger(value) ? value : value.toFixed(1)}`)
      .join(", ")
  }

  /**
   * 提取关键结果数据（不同模型不同）
   */
  function extractResultData(model, state, params, simTime) {
    if (!model || !state) return {}
    const lines = model.getInfoLines(state, params, simTime)
    const result = {}
    for (const line of lines) {
      const colonIdx = line.indexOf(":")
      if (colonIdx > 0) {
        const key = line.substring(0, colonIdx).trim()
        const value = line.substring(colonIdx + 1).trim()
        result[key] = value
      }
    }
    return result
  }

  function recordCurrentTrail() {
    const state = getState()
    const params = getParams()
    const simTime = getSimTime()
    const model = modelRef.value
    if (!state || !model) return

    simCounter++

    const trailData = {
      simNumber: simCounter,
      modelId: model.id,
      params: { ...params },
      label: `模拟${simCounter}`,
      paramLabel: makeParamLabel(params),
      trail: [...(state.trail || [])],
      visible: true,
      color: TRAIL_COLORS[(simCounter - 1) % TRAIL_COLORS.length],
      resultData: extractResultData(model, state, params, simTime),
    }

    // 支持多物体轨迹
    if (state.trail2) trailData.trail2 = [...state.trail2]
    if (state.trailB) trailData.trailB = [...state.trailB]

    recordedTrails.value.push(trailData)

    // 超过上限移除最早的
    if (recordedTrails.value.length > MAX_RECORDS) {
      recordedTrails.value.splice(0, recordedTrails.value.length - MAX_RECORDS)
    }
  }

  function resetCounter() {
    simCounter = 0
  }

  return {
    recordedTrails,
    recordCurrentTrail,
    clearRecords,
    removeRecord,
    toggleTrailVisibility,
    resetCounter,
    makeParamLabel,
  }
}
