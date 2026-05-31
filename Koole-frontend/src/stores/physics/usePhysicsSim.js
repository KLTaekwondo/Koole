import { watch, nextTick } from "vue"
import { createCanvasManager } from "./canvas.js"
import { createCamera } from "./camera.js"
import { createPhysicsEngine } from "./engine.js"
import { createTrailRecorder } from "./trailRecorder.js"
import { createRenderer } from "./renderer.js"

/**
 * 物理模拟器编排层
 * 组装各模块，处理依赖关系，管理生命周期
 * @param {Ref} modelRef - 当前模型引用
 * @returns {Object} 对外暴露的统一接口
 */
export function usePhysicsSim(modelRef) {
  // ── 共享工具函数 ──
  const getParams = () => {
    const model = modelRef.value
    if (!model) return {}
    const obj = {}
    model.params.forEach(p => { obj[p.key] = p.value })
    return obj
  }

  const displayParamValue = (param) => {
    if (param.options) {
      const opt = param.options.find(o => o.value === param.value)
      return opt ? opt.label : param.value
    }
    const v = param.value
    return Number.isInteger(v) ? v : v.toFixed(1)
  }

  // ── 创建各模块 ──

  // 1. Canvas 管理（需要 draw 回调，先创建占位）
  const canvasManager = createCanvasManager(() => renderer.draw())

  // 2. 相机控制
  const camera = createCamera(
    canvasManager.canvasRef,
    modelRef,
    getParams,
    () => engine.getState()
  )

  // 3. 轨迹录制
  const trailRecorder = createTrailRecorder(
    modelRef,
    getParams,
    () => engine.getState(),
    () => engine.getSimTime()
  )

  // 4. 物理引擎（需要 onStep 和 onFinished 回调）
  const engine = createPhysicsEngine(
    modelRef,
    getParams,
    // onStep: 跟随目标 + 绘制
    () => {
      if (camera.followTarget.value) camera.centerCameraOnBall()
      renderer.draw()
    },
    // onFinished: 录制轨迹 + 绘制
    () => {
      trailRecorder.recordCurrentTrail()
      renderer.draw()
    }
  )

  // 5. 渲染绘制
  const renderer = createRenderer(
    canvasManager.canvasRef,
    camera,
    modelRef,
    getParams,
    () => engine.getState(),
    () => engine.getSimTime(),
    trailRecorder.recordedTrails
  )

  // ── 参数更新 ──
  const updateParam = (key, val) => {
    const model = modelRef.value
    if (!model) return
    const param = model.params.find(p => p.key === key)
    if (!param) return
    param.value = val
    if (!engine.running.value) {
      engine.resetSimulation()
      camera.followTarget.value = true
      camera.centerCameraOnBall()
      renderer.draw()
    }
  }

  // ── 重置（带相机重置）──
  const resetSimulation = () => {
    engine.resetSimulation()
    camera.followTarget.value = true
    camera.centerCameraOnBall()
    renderer.draw()
  }

  // ── 清空记录（带重绘）──
  const clearRecords = () => {
    trailRecorder.clearRecords()
    renderer.draw()
  }

  // ── 删除单条记录（带重绘）──
  const removeRecord = (index) => {
    trailRecorder.removeRecord(index)
    renderer.draw()
  }

  // ── 切换轨迹可见性（带重绘）──
  const toggleTrailVisibility = (index) => {
    trailRecorder.toggleTrailVisibility(index)
    renderer.draw()
  }

  // ── 重置相机（带重绘）──
  const resetCamera = () => {
    camera.resetCamera()
    renderer.draw()
  }

  // ── 模型切换时重新初始化 ──
  watch(() => modelRef.value?.id, async () => {
    engine.running.value = false
    engine.resetSimulation()
    camera.followTarget.value = true
    trailRecorder.clearRecords()
    trailRecorder.resetCounter()
    if (modelRef.value) {
      engine.initState()
    }
    await nextTick()
    canvasManager.resizeCanvas()
    camera.centerCameraOnBall()
    renderer.draw()
  }, { immediate: true })

  // ── 对外暴露统一接口 ──
  return {
    // refs
    canvasRef: canvasManager.canvasRef,
    canvasAreaRef: canvasManager.canvasAreaRef,
    // 状态
    running: engine.running,
    followTarget: camera.followTarget,
    recordedTrails: trailRecorder.recordedTrails,
    cameraX: camera.cameraX,
    cameraY: camera.cameraY,
    // 方法
    updateParam,
    displayParamValue,
    toggleSimulation: engine.toggleSimulation,
    resetSimulation,
    resetCamera,
    clearRecords,
    removeRecord,
    toggleTrailVisibility,
    // canvas 事件
    onMouseDown: camera.onMouseDown,
    onMouseMove: camera.onMouseMove,
    onMouseUp: camera.onMouseUp,
  }
}
