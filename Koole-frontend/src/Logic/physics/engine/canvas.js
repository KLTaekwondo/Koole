import { ref, onMounted, onBeforeUnmount, nextTick } from "vue"

/**
 * Canvas 管理模块
 * 负责 DPR 适配、resize 监听、Canvas 尺寸管理
 * @param {Function} draw - 绘制回调函数
 * @param {Object} viewTransform - 视图变换（可选，resize 时同步尺寸）
 * @returns {Object} canvasRef, canvasAreaRef, resizeCanvas
 */
export function createCanvasManager(draw, viewTransform) {
  const canvasRef = ref(null)
  const canvasAreaRef = ref(null)

  const resizeCanvas = () => {
    const area = canvasAreaRef.value
    const canvas = canvasRef.value
    if (!area || !canvas) return
    const rect = area.getBoundingClientRect()
    const dpr = window.devicePixelRatio || 1
    const w = Math.floor(rect.width)
    const h = Math.floor(rect.height)
    canvas.width = w * dpr
    canvas.height = h * dpr
    canvas.style.width = w + "px"
    canvas.style.height = h + "px"
    if (viewTransform) viewTransform.updateViewSize(w, h)
    draw()
  }

  onMounted(async () => {
    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)
    await nextTick()
    draw()
  })

  onBeforeUnmount(() => {
    window.removeEventListener("resize", resizeCanvas)
  })

  return {
    canvasRef,
    canvasAreaRef,
    resizeCanvas,
  }
}
