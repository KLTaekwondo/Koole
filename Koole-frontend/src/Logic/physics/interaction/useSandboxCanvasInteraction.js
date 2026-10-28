import { reactive } from 'vue'
import { MAX_CAMERA_SCALE, MIN_CAMERA_SCALE } from '../physics.js'
import { getModelByObject } from '../sandbox/modelRegistry.js'

/**
 * 画布交互（无限画布）：统一 Pointer 事件状态机，鼠标 / 触摸 / 笔共用同一套逻辑。
 *
 * 事件模型：
 * - 所有 pointer 事件在 document 层常驻监听（pointerdown 用捕获阶段，其余冒泡阶段），
 *   setup 注册、cleanup 移除，不再按手势临时注册/移除——避免"某个阶段漏注册 move/up"
 *   这类隐藏 bug（例如捏合时未注册 move 导致缩放失效）。
 * - 指针状态机由 pointers（Map，记录全部按下的指针）与 gesture（当前手势）驱动：
 *   首指落在 canvas 上 → 命中物体进入拖拽 / 放置模式就地放置 / 空白平移画布；
 *   任意第二指落下（含画布之外）→ 切换为双指捏合缩放，取消单指拖拽与平移；
 *   抬起 / 取消 → 始终从 pointers 删除对应指针并收敛手势状态，不残留。
 * - 选中不依赖 click 事件：触摸 tap 的 click 合成会被 pointerdown 的 preventDefault
 *   抑制（桌面鼠标的 click 不受影响），因此"点选物体 / 点空白取消"统一在 pointerup
 *   里按"按下后未移动（tap）"判定完成，鼠标与触摸走同一条路。
 * - 触摸兼容依赖样式层 touch-action:none（画布与模型项，见 Sandbox.vue），浏览器
 *   手势被禁用后由 Pointer Events 全权接管；clickOnly 记录本次操作是否纯点击
 *   （pan/drag 移动超过 5px 记非点击），放置后用 justPlaced 抑制误选中。
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
  // Canvas 物体拖拽状态（物理循环读取：拖拽中物体不参与碰撞/钳制）
  const canvasDrag = reactive({
    active: false,
    object: null,
    offsetX: 0,
    offsetY: 0,
    mouseStartX: 0,
    mouseStartY: 0,
    tapTypeId: '', // 按下时命中的物体类型 ID（tap 选中用，不依赖 click 派发）
  })

  // 空白平移状态（记录起点与起点相机，绝对式计算避免累计误差）
  const pan = reactive({
    active: false,
    startClientX: 0,
    startClientY: 0,
    startCameraX: 0,
    startCameraY: 0,
  })

  // 全部按下的指针（含 UI 面板上的）：pointerId → { x, y, target }
  const pointers = new Map()

  // 当前手势：'idle'（无手势）| 'drag'（拖已有物体）| 'pan'（空白平移）| 'pinch'（双指捏合）
  let gesture = 'idle'

  // 双指捏合基准（第二指落下时记录，绝对式锚点）
  let pinchStart = null

  // 标记本次指针操作是否"纯点击"（按下后未移动），pointerup 里判定 tap 选中
  let clickOnly = true

  // pointerdown 里放置过物体 → 跳过随后的 tap 判定（避免误选中刚放置的物体）
  let justPlaced = false

  // 放置预览位置（屏幕坐标，canvas-container 的 pointermove 更新，绘制循环读取后转世界）
  let previewMouseX = -100
  let previewMouseY = -100

  /** 屏幕坐标（相对 canvas 左上角）→ 世界坐标（世界 y 向下为正，物理屏幕系） */
  function screenToWorld(sx, sy) {
    return { x: sx / camera.scale + camera.x, y: sy / camera.scale + camera.y }
  }

  /** 世界坐标命中检测：倒序遍历（后放置的在上层），返回命中的物体与其类型 */
  function hitTest(wx, wy) {
    for (let i = objects.length - 1; i >= 0; i--) {
      const obj = objects[i]
      const typeModel = getModelByObject(obj)
      if (typeModel && typeModel.hitTest(obj, wx, wy)) return { obj, typeModel }
    }
    return null
  }

  /** 以两指当前位置记录捏合起点（绝对式锚点，move 时按比例缩放） */
  function startPinch() {
    const rect = canvasRef.value?.getBoundingClientRect()
    if (!rect) return
    const [p1, p2] = [...pointers.values()]
    if (!p1 || !p2) return
    pinchStart = {
      rectLeft: rect.left,
      rectTop: rect.top,
      dist: Math.hypot(p1.x - p2.x, p1.y - p2.y),
      midX: (p1.x + p2.x) / 2,
      midY: (p1.y + p2.y) / 2,
      scale: camera.scale,
      cameraX: camera.x,
      cameraY: camera.y,
    }
  }

  /** 收敛所有单指手势状态（进入捏合 / 取消时统一调用） */
  function resetSingleGesture() {
    canvasDrag.active = false
    canvasDrag.object = null
    pan.active = false
    gesture = 'idle'
  }

  // ============================================================
  // document 常驻监听
  // ============================================================

  /**
   * 全局 pointerdown（捕获阶段，任何目标都先经过这里）：
   * - 记录所有指针（无论目标，覆盖层/面板上的第二指也不影响捏合）
   * - 双指及以上 → 进入捏合缩放
   * - 单指仅处理直接落在 canvas 上的按下；画布外的 UI 按钮、模型项交还各自监听器
   */
  function onPointerDown(e) {
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY, target: e.target })

    // 第二指及以上：进入/保持捏合手势（不依赖命中 canvas）
    if (pointers.size >= 2) {
      if (pointers.size === 2) {
        resetSingleGesture()
        justPlaced = false // 捏合不会有 click 来清 justPlaced，直接清掉
        gesture = 'pinch'
        startPinch()
      }
      e.preventDefault()
      return
    }

    // 单指：只处理落在画布可视区域内的按下。用坐标而非 e.target 判定，
    // 避免触摸命中层级差异（覆盖元素/子元素）导致画布交互失效；
    // 交互控件（按钮/输入/面板）仍交还各自监听器。
    const rect = canvasRef.value?.getBoundingClientRect()
    if (!rect) return
    const inCanvas = e.clientX >= rect.left && e.clientX <= rect.right &&
                     e.clientY >= rect.top && e.clientY <= rect.bottom
    if (!inCanvas) return
    if (e.target?.closest('button, input, select, textarea, .float-panel, .model-panel, .quick-toolbar, .legend-toggle')) return

    clickOnly = true
    const sx = e.clientX - rect.left
    const sy = e.clientY - rect.top
    const { x: wx, y: wy } = screenToWorld(sx, sy)

    // 命中已有物体：进入拖拽（不立即选中，避免属性面板弹出打断操作；想看属性再点一下）
    const hit = hitTest(wx, wy)
    if (hit) {
      canvasDrag.active = true
      canvasDrag.object = hit.obj
      canvasDrag.tapTypeId = hit.typeModel.id
      canvasDrag.offsetX = hit.obj.pos.x - wx
      canvasDrag.offsetY = hit.obj.pos.y - wy
      canvasDrag.mouseStartX = e.clientX
      canvasDrag.mouseStartY = e.clientY

      // 抓取时速度归零
      hit.obj.velocity.x = 0
      hit.obj.velocity.y = 0

      gesture = 'drag'
      e.preventDefault()
      return
    }

    // 放置模式：只有命中失败（空白处）才放置新物体；命中已有物体时上方已进入拖拽
    if (paletteActiveModel.value) {
      onAddObject(wx, wy, paletteActiveModel.value)
      paletteActiveModel.value = ''
      justPlaced = true
      e.preventDefault()
      return
    }

    // 空白处：进入平移模式
    pan.active = true
    pan.startClientX = e.clientX
    pan.startClientY = e.clientY
    pan.startCameraX = camera.x
    pan.startCameraY = camera.y
    gesture = 'pan'
    e.preventDefault()
  }

  /** 全局 pointermove：更新指针坐标后按当前手势处理（捏合 / 平移 / 拖拽） */
  function onPointerMove(e) {
    const p = pointers.get(e.pointerId)
    if (p) {
      p.x = e.clientX
      p.y = e.clientY
    }

    // 容错：检测到两指但尚未进入捏合（个别环境可能吞掉第二指 pointerdown），补建基准
    if (pointers.size >= 2 && (gesture !== 'pinch' || !pinchStart)) {
      gesture = 'pinch'
      startPinch()
    }

    // 双指捏合：以起始中点为锚做绝对式缩放 + 中点位移跟随平移
    if (gesture === 'pinch' && pinchStart && pointers.size >= 2) {
      const [p1, p2] = [...pointers.values()]
      const dist = Math.hypot(p1.x - p2.x, p1.y - p2.y)
      const midX = (p1.x + p2.x) / 2
      const midY = (p1.y + p2.y) / 2
      const st = pinchStart

      const newScale = Math.min(MAX_CAMERA_SCALE, Math.max(MIN_CAMERA_SCALE, (st.scale * dist) / st.dist))
      // 锚点（起始中点，画布局部坐标）在缩放前后保持同一世界点不变
      const sx = st.midX - st.rectLeft
      const sy = st.midY - st.rectTop
      const wx = st.cameraX + sx / st.scale
      const wy = st.cameraY + sy / st.scale
      // 中点位移（client 增量）跟随到相机，方向与 pan 一致
      const dMidX = midX - st.midX
      const dMidY = midY - st.midY

      camera.x = wx - sx / newScale - dMidX / newScale
      camera.y = wy - sy / newScale - dMidY / newScale
      camera.scale = newScale
      return
    }

    // 空白平移：按起点绝对式计算相机，保持拖拽点不漂移
    if (gesture === 'pan') {
      const dx = e.clientX - pan.startClientX
      const dy = e.clientY - pan.startClientY
      if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
        clickOnly = false
      }
      camera.x = pan.startCameraX - dx / camera.scale
      camera.y = pan.startCameraY - dy / camera.scale
      return
    }

    // 物体拖拽：无限画布自由移动（无边界钳制），松手后由物理钳回
    if (gesture === 'drag' && canvasDrag.active && canvasDrag.object) {
      const dx = e.clientX - canvasDrag.mouseStartX
      const dy = e.clientY - canvasDrag.mouseStartY
      if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
        clickOnly = false
      }

      const rect = canvasRef.value?.getBoundingClientRect()
      if (!rect) return
      const { x: wx, y: wy } = screenToWorld(e.clientX - rect.left, e.clientY - rect.top)
      canvasDrag.object.pos.x = wx + canvasDrag.offsetX
      canvasDrag.object.pos.y = wy + canvasDrag.offsetY
    }
  }

  /** 全局 pointerup：始终删除对应指针，再按手势收敛。
   *  "点选 / 点空白取消"在此按 tap（按下后未移动）判定完成，不依赖 click 事件——
   *  触摸 tap 的 click 合成会被 pointerdown 的 preventDefault 抑制，桌面鼠标不受影响。 */
  function onPointerUp(e) {
    pointers.delete(e.pointerId)

    // 捏合：任一指抬起且少于两指 → 结束捏合（剩下一指不产生新动作，等全部抬起）
    if (gesture === 'pinch') {
      if (pointers.size < 2) {
        pinchStart = null
        gesture = 'idle'
      }
      return
    }

    // 空白平移手势：tap（未移动）= 点空白，取消选中
    if (gesture === 'pan') {
      const wasTap = clickOnly && !justPlaced
      pan.active = false
      gesture = 'idle'
      if (wasTap) onDeselect()
      return
    }

    // 物体拖拽手势：tap（未移动）= 点选物体；拖拽（移动过）松手不自动选中
    if (gesture === 'drag') {
      const wasTap = clickOnly && !justPlaced && canvasDrag.object
      const tappedObj = canvasDrag.object
      const tappedTypeId = canvasDrag.tapTypeId
      canvasDrag.active = false
      canvasDrag.object = null
      gesture = 'idle'
      if (wasTap && tappedObj) onSelect(tappedObj, tappedTypeId)
      return
    }

    // 放置后（gesture 保持 idle）：消费 justPlaced，避免污染下一次 tap 判定
    if (justPlaced) justPlaced = false
  }

  /** 全局 pointercancel：删除指针并复位全部手势状态 */
  function onPointerCancel(e) {
    pointers.delete(e.pointerId)
    pinchStart = null
    justPlaced = false
    resetSingleGesture()
  }

  /** Esc：取消一切手势与残留指针 */
  function onKeyDown(e) {
    if (e.key !== 'Escape') return
    pinchStart = null
    pointers.clear()
    resetSingleGesture()
  }

  // ============================================================
  // canvas 元素上的事件（右键删除 / 放置预览 / 滚轮缩放）
  // ============================================================

  function onCanvasContextMenu(e) {
    e.preventDefault()
    // 右键删除：检查是否点击到物体
    const rect = canvasRef.value?.getBoundingClientRect()
    if (!rect) return
    const { x: wx, y: wy } = screenToWorld(e.clientX - rect.left, e.clientY - rect.top)

    const hit = hitTest(wx, wy)
    if (hit) {
      onSelect(hit.obj, hit.typeModel.id)
      onDelete()
    }
  }

  // 放置模式下的预览位置（canvas-container 上的 pointermove，屏幕坐标）
  function onCanvasPointerMove(e) {
    const rect = canvasRef.value?.getBoundingClientRect()
    if (!rect) return
    previewMouseX = e.clientX - rect.left
    previewMouseY = e.clientY - rect.top
  }

  // 滚轮缩放：以光标为锚点，缩放前后光标下的世界点不变（桌面）
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

  // ============================================================
  // 注册 / 清理
  // ============================================================
  document.addEventListener('pointerdown', onPointerDown, true)
  document.addEventListener('pointermove', onPointerMove)
  document.addEventListener('pointerup', onPointerUp)
  document.addEventListener('pointercancel', onPointerCancel)
  document.addEventListener('keydown', onKeyDown)

  function cleanup() {
    document.removeEventListener('pointerdown', onPointerDown, true)
    document.removeEventListener('pointermove', onPointerMove)
    document.removeEventListener('pointerup', onPointerUp)
    document.removeEventListener('pointercancel', onPointerCancel)
    document.removeEventListener('keydown', onKeyDown)
    pointers.clear()
  }

  return {
    onCanvasContextMenu,
    onCanvasPointerMove,
    onCanvasWheel,
    canvasDrag,
    getPreviewMouse: () => ({ x: previewMouseX, y: previewMouseY }),
    cleanupCanvasInteraction: cleanup,
  }
}
