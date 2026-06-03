import { watch, nextTick } from "vue"
import { createCanvasManager } from "./canvas.js"
import { createCamera } from "./camera.js"
import { createPhysicsEngine } from "./PhysicsEngine.js"
import { createSimulationPlayer } from "./SimulationPlayer.js"
import { createRenderer } from "./renderer.js"
import { createSimulationState } from "./SimulationState.js"
import { createViewTransform } from "./ViewTransform.js"
import { theme } from "../theme.js"

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
    () => theme.value
  )

  // ── 参数更新 ──
  const updateParam = (key, val) => {
    const model = modelRef.value
    if (!model) return
    const param = model.params.find(p => p.key === key)
    if (!param) return
    param.value = val
    simState.params[key] = val
    if (!simState.running) {
      engine.initState()
      camera.followTarget.value = true
      camera.centerCameraOnBall()
      renderer.draw()
    }
  }

  // ── 重置 ──
  const resetSimulation = () => {
    player.stop()
    engine.initState()
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
    if (modelRef.value) {
      setParamsFromModel(modelRef.value)
      engine.initState()
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
    running,
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
  }
}
