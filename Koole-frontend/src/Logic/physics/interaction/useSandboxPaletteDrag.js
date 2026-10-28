import { getModel } from '../sandbox/modelRegistry.js'

/**
 * 模型库拖放：模型库 pointerdown 激活放置模式并开始拖拽，
 * document pointermove 跟随幽灵图标，pointerup 落在画布内则放置，Esc 取消。
 * 采用 Pointer Events，鼠标与触摸均可拖拽模型。
 * 监听器只在拖拽期间注册，结束时（放置 / Esc / pointerup）统一清理。
 */
export function useSandboxPaletteDrag({ paletteActiveModel, paletteDrag, camera, canvasRef, getCanvasSize, onDrop }) {
  function onPalettePointerDown(e, modelId) {
    const model = getModel(modelId)
    if (!model) return

    // 点击已激活的模型 → 取消放置模式，不触发拖拽
    if (paletteActiveModel.value === modelId) {
      paletteActiveModel.value = ''
      return
    }

    paletteActiveModel.value = modelId

    // 开始拖拽
    paletteDrag.active = true
    paletteDrag.x = e.clientX
    paletteDrag.y = e.clientY
    paletteDrag.modelId = modelId
    paletteDrag.icon = model.icon
    paletteDrag.name = model.name

    document.addEventListener('pointermove', onDocumentPointerMove)
    document.addEventListener('pointerup', onDocumentPointerUp)
    document.addEventListener('pointercancel', onDocumentPointerCancel)
    document.addEventListener('keydown', onDocumentKeyDown)
  }

  function onDocumentPointerMove(e) {
    if (!paletteDrag.active) return
    paletteDrag.x = e.clientX
    paletteDrag.y = e.clientY
  }

  function onDocumentPointerUp(e) {
    if (!paletteDrag.active) return

    const canvasRect = canvasRef.value?.getBoundingClientRect()
    if (canvasRect) {
      const cx = e.clientX - canvasRect.left
      const cy = e.clientY - canvasRect.top
      const { width, height } = getCanvasSize()
      // 命中判定用屏幕矩形，落点换算世界坐标（与渲染 ghost 同一公式）
      if (cx >= 0 && cx <= width && cy >= 0 && cy <= height) {
        onDrop(cx / camera.scale + camera.x, cy / camera.scale + camera.y, paletteDrag.modelId)
        // 真正拖放到画布内才退出放置模式
        paletteActiveModel.value = ''
      }
      // 落点在画布外（仅点了一下模型未拖放）：保留放置模式，可继续点击画布放置或再点同模型取消
    }

    paletteDrag.active = false
    cleanup()
  }

  function onDocumentPointerCancel() {
    if (!paletteDrag.active) return
    paletteDrag.active = false
    paletteActiveModel.value = ''
    cleanup()
  }

  function onDocumentKeyDown(e) {
    if (e.key !== 'Escape' || !paletteDrag.active) return
    paletteDrag.active = false
    paletteActiveModel.value = ''
    cleanup()
  }

  function cleanup() {
    document.removeEventListener('pointermove', onDocumentPointerMove)
    document.removeEventListener('pointerup', onDocumentPointerUp)
    document.removeEventListener('pointercancel', onDocumentPointerCancel)
    document.removeEventListener('keydown', onDocumentKeyDown)
  }

  return { onPalettePointerDown, cleanupPaletteDrag: cleanup }
}
