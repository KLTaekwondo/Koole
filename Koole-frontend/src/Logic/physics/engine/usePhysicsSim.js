import { ref, watch, nextTick } from "vue"
import { createCanvasManager } from "./canvas.js"
import { createCamera } from "./camera.js"
import { createPhysicsEngine } from "./PhysicsEngine.js"
import { createSimulationPlayer } from "./SimulationPlayer.js"
import { createRenderer } from "./renderer.js"
import { createSimulationState } from "./SimulationState.js"
import { createViewTransform } from "./ViewTransform.js"
import { theme } from "../../../stores/theme.js"

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
  const updateParam = (key, val) => {
    const model = modelRef.value
    if (!model) return
    const param = model.params.find(p => p.key === key)
    if (!param) return
    param.value = val
    simState.params[key] = val
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

  return {
    canvasRef: canvasManager.canvasRef,
    canvasAreaRef: canvasManager.canvasAreaRef,
    simState,
    infoLines,
    running,
    explorationDone,
    followTarget: camera.followTarget,
    recordedTrails,
    updateParam,
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
