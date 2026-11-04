import { ref, watch, nextTick } from "vue"
import { createCanvasManager } from "./canvas.js"
import { createCamera } from "./camera.js"
import { createPhysicsEngine } from "./PhysicsEngine.js"
import { createSimulationPlayer } from "./SimulationPlayer.js"
import { createRenderer } from "./renderer.js"
import { createSimulationState } from "./SimulationState.js"
import { createViewTransform } from "./ViewTransform.js"
import { theme } from "../../../stores/theme.js"
import { useLearning } from "../../../stores/learning.js"

/**
 * 物理模拟器编排层
 * 组装各模块，管理生命周期
 * @param {Ref} modelRef - 当前模型引用
 * @returns {Object} 对外暴露的统一接口
 */
export function usePhysicsSim(modelRef) {
  // ── 统一状态层 ──
  const {
    simState,
    running,
    recordedTrails,
    setParamsFromModel,
    displayParamValue,
    recordCurrentTrail,
    clearRecords,
    removeRecord,
    toggleTrailVisibility,
    resetCounter,
  } = createSimulationState()

  // ── 视图变换 ──
  const viewTransform = createViewTransform()

  // ── 信息浮层数据 ──
  const infoLines = ref([])

  // ── 探索任务完成状态（任务式引导） ──
  // 模型 exploration.check(params, simTime, paramTouched) 为真即解锁；
  // 改参数与播放中都会评估。paramTouched = 本次会话是否改过参数（多数模型
  // 完成条件为"改过参数 + 播放过一段时间"，体现"动手调节 + 观察"两个动作）。
  const explorationDone = ref(false)
  const paramTouched = ref(false)
  const checkExploration = () => {
    const model = modelRef.value
    if (!model?.exploration?.check) return
    if (model.exploration.check(simState.params, simState.simTime, paramTouched.value)) {
      explorationDone.value = true
    }
  }

  // ── 学习进度（探索记录） ──
  // 探索完成后写入 localStorage；再次打开该模型时直接显示已完成（知识讲解也保持解锁）。
  const { markExplored, markVisited, isExplored } = useLearning()
  watch(explorationDone, done => {
    if (done && modelRef.value?.id) markExplored(modelRef.value.id)
  })

  // ── 创建各模块 ──

  // 1. Canvas（resize 时同步 ViewTransform）
  const canvasManager = createCanvasManager(() => renderer.draw(), viewTransform)

  // 2. 相机（拖拽更新 ViewTransform.offsetX/Y）
  const camera = createCamera(canvasManager.canvasRef, modelRef, simState, viewTransform, () => renderer.draw())

  // 3. 纯物理引擎
  const engine = createPhysicsEngine(modelRef, simState)

  // 4. 播放控制器
  const player = createSimulationPlayer(
    engine,
    simState,
    () => {
      if (camera.followTarget.value) camera.centerCameraOnBall()
      checkExploration()
      renderer.draw()
    },
    () => {
      recordCurrentTrail(modelRef.value, simState.simTime)
      renderer.draw()
    }
  )

  // 5. 渲染器（使用 ViewTransform 的 worldToScreen）
  const renderer = createRenderer(
    canvasManager.canvasRef,
    viewTransform,
    modelRef,
    simState,
    recordedTrails,
    () => theme.value,
    (lines) => { infoLines.value = lines }
  )

  // ── 参数更新 ──
  // 参数值归一化：数字型夹到 [min, max]，options 型取最接近的合法选项
  const normalizeParamValue = (param, value) => {
    const num = Number(value)
    if (!Number.isFinite(num)) return param.value
    if (Array.isArray(param.options) && param.options.length) {
      return param.options.reduce((best, option) => (
        Math.abs(option.value - num) < Math.abs(best.value - num) ? option : best
      ), param.options[0]).value
    }
    const min = typeof param.min === "number" ? param.min : -Infinity
    const max = typeof param.max === "number" ? param.max : Infinity
    return Math.min(max, Math.max(min, num))
  }

  const applyParamValue = (key, value) => {
    const model = modelRef.value
    const param = model?.params.find(p => p.key === key)
    if (!param) return false
    const next = normalizeParamValue(param, value)
    param.value = next
    simState.params[key] = next
    return true
  }

  const updateParam = (key, val) => {
    const model = modelRef.value
    if (!model || !applyParamValue(key, val)) return
    paramTouched.value = true
    // 光学演示型（autoPlay）：改参数即重播——重置 _t 让光线从头走一遍；
    // 普通模型：暂停时改参数重建状态，运行中改参数直接沿用（物理不打断）。
    if (!simState.running || model.autoPlay) {
      engine.initState()
      if (model.autoPlay && !simState.running) player.toggleSimulation()
      camera.followTarget.value = true
      camera.centerCameraOnBall()
      checkExploration()
      renderer.draw()
    }
  }

  // 分享链接还原：批量写入参数，但不把 paramTouched 置真，
  // 避免「打开别人分享的链接」直接把探索任务刷成完成。
  const applyParams = (values) => {
    const model = modelRef.value
    if (!model || !values) return
    let changed = false
    Object.entries(values).forEach(([key, value]) => {
      if (applyParamValue(key, value)) changed = true
    })
    if (!changed) return
    engine.initState()
    camera.followTarget.value = true
    camera.centerCameraOnBall()
    renderer.draw()
  }

  // ── 重置 ──
  // 模型初始默认参数快照（key → value），模型切换时保存（此刻 params 为默认值），
  // 重置时把 param.value 与 simState.params 一并恢复，再重建物理初始状态。
  let initialParams = {}

  const resetSimulation = () => {
    player.stop()
    // 恢复参数为模型初始默认值，并同步到引擎
    const model = modelRef.value
    if (model) {
      model.params.forEach(p => {
        if (p.key in initialParams) p.value = initialParams[p.key]
      })
      setParamsFromModel(model)
    }
    paramTouched.value = false
    engine.initState()
    // 光学演示型（autoPlay）：重置后重新开始动画
    if (model?.autoPlay && !simState.running) player.toggleSimulation()
    camera.followTarget.value = true
    camera.centerCameraOnBall()
    renderer.draw()
  }

  const resetCamera = () => {
    camera.resetCamera()
    renderer.draw()
  }

  // ── 模型切换 ──
  watch(() => modelRef.value?.id, async () => {
    player.stop()
    resetCounter()
    clearRecords()
    explorationDone.value = false
    paramTouched.value = false
    if (modelRef.value) {
      // 记录初始默认参数（此刻 params 为 loadModel 拷贝的模型默认值）
      initialParams = {}
      modelRef.value.params.forEach(p => { initialParams[p.key] = p.value })
      setParamsFromModel(modelRef.value)
      engine.initState()
      // 之前探索过的模型：直接标记完成（知识讲解保持解锁），并记录最近浏览
      if (isExplored(modelRef.value.id)) explorationDone.value = true
      markVisited(modelRef.value.id)
      // 光学演示型模型（autoPlay）：进页面自动开始动画，step 驱动 _t 时钟
      if (modelRef.value.autoPlay && !simState.running) {
        player.toggleSimulation()
      }
    }
    await nextTick()
    canvasManager.resizeCanvas()
    camera.followTarget.value = true
    camera.centerCameraOnBall()
    renderer.draw()
  }, { immediate: true })

  // ── 画面缩放（只影响渲染，不改物理） ──
  const zoom = viewTransform.zoom
  const zoomBy = (factor) => {
    viewTransform.zoomBy(factor)
    renderer.draw()
  }
  const setZoom = (value) => {
    viewTransform.setZoom(value)
    renderer.draw()
  }
  const resetZoom = () => {
    viewTransform.resetZoom()
    renderer.draw()
  }
  /** 滚轮缩放：向上放大，向下缩小 */
  const onWheelZoom = (event) => {
    const factor = event.deltaY > 0 ? 0.9 : 1.1
    zoomBy(factor)
  }

  // 缩放变化时：如果正在跟随目标，重新对中，避免物体被放大后跑出画面
  watch(zoom, () => {
    if (camera.followTarget.value) camera.centerCameraOnBall()
    renderer.draw()
  })
  /** 双指捏合缩放（触屏） */
  let pinchStartDistance = 0
  let pinchStartZoom = 1
  const distanceOf = (touches) => {
    const [a, b] = touches
    return Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY)
  }
  const onPinchStart = (event) => {
    if (event.touches?.length !== 2) return
    pinchStartDistance = distanceOf(event.touches)
    pinchStartZoom = zoom.value
  }
  const onPinchMove = (event) => {
    if (event.touches?.length !== 2 || !pinchStartDistance) return
    setZoom(pinchStartZoom * (distanceOf(event.touches) / pinchStartDistance))
  }
  const onPinchEnd = () => {
    pinchStartDistance = 0
  }

  return {
    canvasRef: canvasManager.canvasRef,
    canvasAreaRef: canvasManager.canvasAreaRef,
    simState,
    infoLines,
    running,
    explorationDone,
    followTarget: camera.followTarget,
    recordedTrails,
    zoom,
    zoomBy,
    setZoom,
    resetZoom,
    onWheelZoom,
    onPinchStart,
    onPinchMove,
    onPinchEnd,
    updateParam,
    applyParams,
    displayParamValue,
    toggleSimulation: player.toggleSimulation,
    resetSimulation,
    resetCamera,
    clearRecords: () => { clearRecords(); renderer.draw() },
    removeRecord: (i) => { removeRecord(i); renderer.draw() },
    toggleTrailVisibility: (i) => { toggleTrailVisibility(i); renderer.draw() },
    onMouseDown: camera.onMouseDown,
    onMouseMove: camera.onMouseMove,
    onMouseUp: camera.onMouseUp,
    onTouchStart: camera.onTouchStart,
    onTouchMove: camera.onTouchMove,
    onTouchEnd: camera.onTouchEnd,
  }
}
