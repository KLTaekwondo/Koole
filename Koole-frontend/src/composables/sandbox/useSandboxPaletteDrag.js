import { getModel } from '../../physics/sandbox/modelRegistry.js'

/**
 * 模型库拖放：模型库 mousedown 激活放置模式并开始拖拽，
 * document mousemove 跟随幽灵图标，mouseup 落在画布内则放置，Esc 取消。
 * 监听器只在拖拽期间注册，结束时（放置 / Esc / mouseup）统一清理。
 */
export function useSandboxPaletteDrag({ paletteActiveModel, paletteDrag, camera, canvasRef, getCanvasSize, onDrop }) {
  function onPaletteMouseDown(e, modelId) {
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

    document.addEventListener('mousemove', onDocumentMouseMove)
    document.addEventListener('mouseup', onDocumentMouseUp)
    document.addEventListener('keydown', onDocumentKeyDown)
  }

  function onDocumentMouseMove(e) {
    if (!paletteDrag.active) return
    paletteDrag.x = e.clientX
    paletteDrag.y = e.clientY
  }

  function onDocumentMouseUp(e) {
    if (!paletteDrag.active) return

    const canvasRect = canvasRef.value?.getBoundingClientRect()
    if (canvasRect) {
      const cx = e.clientX - canvasRect.left
      const cy = e.clientY - canvasRect.top
      const { width, height } = getCanvasSize()
      // 命中判定用屏幕矩形，落点换算世界坐标（与渲染 ghost 同一公式）
      if (cx >= 0 && cx <= width && cy >= 0 && cy <= height) {
        onDrop(cx / camera.scale + camera.x, cy / camera.scale + camera.y, paletteDrag.modelId)
      }
    }

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
    document.removeEventListener('mousemove', onDocumentMouseMove)
    document.removeEventListener('mouseup', onDocumentMouseUp)
    document.removeEventListener('keydown', onDocumentKeyDown)
  }

  return { onPaletteMouseDown, cleanupPaletteDrag: cleanup }
}
