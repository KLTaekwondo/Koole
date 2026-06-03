import { ref } from "vue"
import { DRAW_SCALE } from "../../constants/physicsModels.js"

/**
 * 相机控制模块
 * 负责拖拽平移、跟随目标
 * @param {Ref} canvasRef - Canvas 元素引用
 * @param {Ref} modelRef - 当前模型引用
 * @param {Object} simState - 统一状态层
 * @param {Object} viewTransform - 视图变换
 * @param {Function} draw - 重绘回调
 * @returns {Object} 相机状态和控制方法
 */
export function createCamera(canvasRef, modelRef, simState, viewTransform, draw) {
  const { offsetX, offsetY, viewWidth, viewHeight, worldToScreen } = viewTransform
  const followTarget = ref(true)

  let isDragging = false
  let dragStartX = 0, dragStartY = 0
  let dragOffX = 0, dragOffY = 0

  /**
   * 将相机中心对准物理对象
   */
  const centerCameraOnBall = () => {
    const model = modelRef.value
    if (!simState.state || !model) return
    const pos = model.getBallPosition(simState.state, simState.params)
    if (!pos) return
    offsetX.value = -pos.x * DRAW_SCALE
    offsetY.value = pos.y * DRAW_SCALE + 40 - viewHeight.value * 0.67
  }

  const resetCamera = () => {
    centerCameraOnBall()
  }

  const onMouseDown = (e) => {
    isDragging = true
    followTarget.value = false
    dragStartX = e.clientX
    dragStartY = e.clientY
    dragOffX = offsetX.value
    dragOffY = offsetY.value
    if (canvasRef.value) canvasRef.value.style.cursor = "grabbing"
  }

  const onMouseMove = (e) => {
    if (!isDragging) return
    offsetX.value = dragOffX + (e.clientX - dragStartX)
    offsetY.value = dragOffY + (e.clientY - dragStartY)
    draw()
  }

  const onMouseUp = () => {
    isDragging = false
    if (canvasRef.value) canvasRef.value.style.cursor = "grab"
  }

  return {
    followTarget,
    offsetX,
    offsetY,
    worldToScreen,
    centerCameraOnBall,
    resetCamera,
    onMouseDown,
    onMouseMove,
    onMouseUp,
  }
}
