import { reactive } from 'vue'
import { MAX_CAMERA_SCALE, MIN_CAMERA_SCALE } from '../../constants/physics.js'
import { getModelByObject } from '../../physics/sandbox/modelRegistry.js'

/**
 * Canvas 交互（无限画布）：屏幕坐标换算世界坐标、倒序命中、点击放置、
 * 物体拖拽（世界量 offset，不再钳制）、空白拖拽平移画布（pan）、
 * 滚轮以光标为锚缩放、纯点击判定（拖拽/平移不触发选中）、右键删除。
 * document 拖拽监听只在 mousedown 命中物体或空白时注册，结束后统一清理。
 */
export function useSandboxCanvasInteraction({
  objects,
  paletteActiveModel,
  camera,
  canvasRef,
  onAddObject,
  onSelect,
  onDeselect,
  onDelete,
}) {
  // Canvas 物体拖拽状态
  const canvasDrag = reactive({
    active: false,
    object: null,
    offsetX: 0,
    offsetY: 0,
    mouseStartX: 0,
    mouseStartY: 0,
  })

  // 空白平移状态（记录起点与起点相机，绝对式计算避免累计误差）
  const pan = reactive({
    active: false,
    startClientX: 0,
    startClientY: 0,
    startCameraX: 0,
    startCameraY: 0,
  })

  // 标记本次鼠标操作是否是"纯点击"（而非拖拽/平移），click 事件里判断
  let clickOnly = true

  // mousedown 时记录被拖拽物体的类型，mouseup 时选中用
  let dragStartTypeId = ''

  // 放置预览位置（屏幕坐标，mousemove 更新，绘制循环读取后转世界）
  let previewMouseX = -100
  let previewMouseY = -100

  /** 屏幕坐标（相对 canvas 左上角）→ 世界坐标 */
  function screenToWorld(sx, sy) {
    return { x: sx / camera.scale + camera.x, y: sy / camera.scale + camera.y }
  }

  function onCanvasMouseDown(e) {
    clickOnly = true

    const rect = canvasRef.value?.getBoundingClientRect()
    if (!rect) return
    const sx = e.clientX - rect.left
    const sy = e.clientY - rect.top
    const { x: wx, y: wy } = screenToWorld(sx, sy)

    // 放置模式：点击画布直接放置
    if (paletteActiveModel.value) {
      onAddObject(wx, wy, paletteActiveModel.value)
      paletteActiveModel.value = ''
      return
    }

    // 查找物体，准备拖拽（倒序遍历，后放置的在上层）
    for (let i = objects.length - 1; i >= 0; i--) {
      const obj = objects[i]
      const typeModel = getModelByObject(obj)
      if (typeModel && typeModel.hitTest(obj, wx, wy)) {
        // ⚠ 拖拽期间不 selectObject，防止属性面板展开导致画布偏移
        dragStartTypeId = typeModel.id

        canvasDrag.active = true
        canvasDrag.object = obj
        canvasDrag.offsetX = obj.pos.x - wx
        canvasDrag.offsetY = obj.pos.y - wy
        canvasDrag.mouseStartX = e.clientX
        canvasDrag.mouseStartY = e.clientY

        // 抓取时速度归零
        obj.velocity.x = 0
        obj.velocity.y = 0

        document.addEventListener('mousemove', onDocumentMouseMove)
        document.addEventListener('mouseup', onDocumentMouseUp)
        document.addEventListener('keydown', onDocumentKeyDown)
        return
      }
    }

    // 空白处：进入平移模式（注册 document 监听，防止鼠标滑出画布丢失 mouseup）
    pan.active = true
    pan.startClientX = e.clientX
    pan.startClientY = e.clientY
    pan.startCameraX = camera.x
    pan.startCameraY = camera.y
    document.addEventListener('mousemove', onDocumentMouseMove)
    document.addEventListener('mouseup', onDocumentMouseUp)
    document.addEventListener('keydown', onDocumentKeyDown)
  }

  function onCanvasClick(e) {
    // 如果是拖拽/平移操作，不处理点击事件
    if (!clickOnly) return

    const rect = canvasRef.value?.getBoundingClientRect()
    if (!rect) return
    const { x: wx, y: wy } = screenToWorld(e.clientX - rect.left, e.clientY - rect.top)

    // 放置模式（mousedown 时如果放置了物体，这里忽略）
    if (paletteActiveModel.value) return

    // 命中检测
    for (let i = objects.length - 1; i >= 0; i--) {
      const obj = objects[i]
      const typeModel = getModelByObject(obj)
      if (typeModel && typeModel.hitTest(obj, wx, wy)) {
        onSelect(obj, typeModel.id)
        return
      }
    }

    // 点击空白取消选中
    onDeselect()
  }

  function onCanvasContextMenu(e) {
    e.preventDefault()
    // 右键删除：检查是否点击到物体
    const rect = canvasRef.value?.getBoundingClientRect()
    if (!rect) return
    const { x: wx, y: wy } = screenToWorld(e.clientX - rect.left, e.clientY - rect.top)

    for (let i = objects.length - 1; i >= 0; i--) {
      const obj = objects[i]
      const typeModel = getModelByObject(obj)
      if (typeModel && typeModel.hitTest(obj, wx, wy)) {
        onSelect(obj, typeModel.id)
        onDelete()
        return
      }
    }
  }

  // 放置模式下的鼠标预览（canvas 容器上的 mousemove，屏幕坐标）
  function onCanvasMouseMove(e) {
    const rect = canvasRef.value?.getBoundingClientRect()
    if (!rect) return
    previewMouseX = e.clientX - rect.left
    previewMouseY = e.clientY - rect.top
  }

  // —— document 拖拽/平移跟随 ——
  function onDocumentMouseMove(e) {
    // 空白平移：按起点绝对式计算相机，保持拖拽点不漂移
    if (pan.active) {
      const dx = e.clientX - pan.startClientX
      const dy = e.clientY - pan.startClientY
      if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
        clickOnly = false
      }
      camera.x = pan.startCameraX - dx / camera.scale
      camera.y = pan.startCameraY - dy / camera.scale
      return
    }

    if (!canvasDrag.active || !canvasDrag.object) return

    // 移动超过 5px 就标记为拖拽而非点击
    const dx = e.clientX - canvasDrag.mouseStartX
    const dy = e.clientY - canvasDrag.mouseStartY
    if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
      clickOnly = false
    }

    const rect = canvasRef.value?.getBoundingClientRect()
    if (!rect) return
    const { x: wx, y: wy } = screenToWorld(e.clientX - rect.left, e.clientY - rect.top)
    const obj = canvasDrag.object
    // 无限画布：拖拽自由（无边界钳制），拖到地面以下松手后由物理钳回
    obj.pos.x = wx + canvasDrag.offsetX
    obj.pos.y = wy + canvasDrag.offsetY
  }

  function onDocumentMouseUp() {
    if (pan.active) {
      pan.active = false
      cleanup()
      return
    }

    if (!canvasDrag.active) return

    const obj = canvasDrag.object
    const typeId = dragStartTypeId
    canvasDrag.active = false
    canvasDrag.object = null
    dragStartTypeId = ''
    // 拖拽完成后选中该物体（此时才展开属性面板，避免拖拽期间画布偏移）
    if (obj && typeId) {
      onSelect(obj, typeId)
    }
    cleanup()
  }

  function onDocumentKeyDown(e) {
    if (e.key !== 'Escape') return
    if (pan.active) pan.active = false
    if (canvasDrag.active) {
      canvasDrag.active = false
      canvasDrag.object = null
    }
    dragStartTypeId = ''
    cleanup()
  }

  // 滚轮缩放：以光标为锚点，缩放前后光标下的世界点不变
  function onCanvasWheel(e) {
    e.preventDefault()
    const rect = canvasRef.value?.getBoundingClientRect()
    if (!rect) return
    const mx = e.clientX - rect.left
    const my = e.clientY - rect.top

    const factor = e.deltaY < 0 ? 1.1 : 1 / 1.1
    const newScale = Math.min(MAX_CAMERA_SCALE, Math.max(MIN_CAMERA_SCALE, camera.scale * factor))
    if (newScale === camera.scale) return

    camera.x += mx / camera.scale - mx / newScale
    camera.y += my / camera.scale - my / newScale
    camera.scale = newScale
  }

  function cleanup() {
    document.removeEventListener('mousemove', onDocumentMouseMove)
    document.removeEventListener('mouseup', onDocumentMouseUp)
    document.removeEventListener('keydown', onDocumentKeyDown)
  }

  return {
    onCanvasMouseDown,
    onCanvasClick,
    onCanvasContextMenu,
    onCanvasMouseMove,
    onCanvasWheel,
    canvasDrag,
    getPreviewMouse: () => ({ x: previewMouseX, y: previewMouseY }),
    cleanupCanvasInteraction: cleanup,
  }
}
