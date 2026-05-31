import { ref } from "vue"
import { DRAW_SCALE } from "../../constants/physicsModels.js"

/**
 * 相机控制模块
 * 负责相机状态、拖拽平移、跟随目标、坐标转换
 * @param {Ref} canvasRef - Canvas 元素引用
 * @param {Ref} modelRef - 当前模型引用
 * @param {Function} getParams - 获取参数函数
 * @param {Function} getState - 获取状态函数
 * @returns {Object} 相机状态和控制方法
 */
export function createCamera(canvasRef, modelRef, getParams, getState) {
  const cameraX = ref(0)
  const cameraY = ref(0)
  const followTarget = ref(true)

  let isDragging = false
  let dragStartX = 0, dragStartY = 0
  let dragCamX = 0, dragCamY = 0

  /**
   * 世界坐标转屏幕坐标
   * @param {number} wx - 世界 X 坐标
   * @param {number} wy - 世界 Y 坐标
   * @returns {Object} 屏幕坐标 {x, y}
   */
  const worldToScreen = (wx, wy) => {
    const canvas = canvasRef.value
    if (!canvas) return { x: 0, y: 0 }
    const dpr = window.devicePixelRatio || 1
    const cw = canvas.width / dpr
    const ch = canvas.height / dpr
    return {
      x: cw / 2 + wx * DRAW_SCALE + cameraX.value,
      y: ch - 40 - wy * DRAW_SCALE + cameraY.value,
    }
  }

  /**
   * 将相机中心对准物理对象
   */
  const centerCameraOnBall = () => {
    const canvas = canvasRef.value
    const model = modelRef.value
    const state = getState()
    if (!canvas || !state || !model) return
    const dpr = window.devicePixelRatio || 1
    const cw = canvas.width / dpr
    const ch = canvas.height / dpr
    const p = getParams()
    const pos = model.getBallPosition(state, p)
    cameraX.value = -pos.x * DRAW_SCALE
    cameraY.value = pos.y * DRAW_SCALE + 40 - ch * 0.67
  }

  /**
   * 重置相机到默认位置
   */
  const resetCamera = () => {
    followTarget.value = true
    centerCameraOnBall()
  }

  const onMouseDown = (e) => {
    isDragging = true
    followTarget.value = false
    dragStartX = e.clientX
    dragStartY = e.clientY
    dragCamX = cameraX.value
    dragCamY = cameraY.value
    if (canvasRef.value) canvasRef.value.style.cursor = "grabbing"
  }

  const onMouseMove = (e) => {
    if (!isDragging) return
    cameraX.value = dragCamX + (e.clientX - dragStartX)
    cameraY.value = dragCamY + (e.clientY - dragStartY)
  }

  const onMouseUp = () => {
    isDragging = false
    if (canvasRef.value) canvasRef.value.style.cursor = "grab"
  }

  return {
    cameraX,
    cameraY,
    followTarget,
    worldToScreen,
    centerCameraOnBall,
    resetCamera,
    onMouseDown,
    onMouseMove,
    onMouseUp,
  }
}
