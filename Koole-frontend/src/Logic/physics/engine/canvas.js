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

  let resizeObserver = null

  onMounted(async () => {
    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)
    // 容器尺寸变化（全屏切换、上滑面板、导航收起）不会触发 window resize，
    // 只监听窗口会让 canvas 的像素尺寸和显示尺寸对不上，这里补一个 ResizeObserver。
    if (typeof ResizeObserver !== "undefined") {
      let frame = 0
      resizeObserver = new ResizeObserver(() => {
        cancelAnimationFrame(frame)
        frame = requestAnimationFrame(resizeCanvas)
      })
      if (canvasAreaRef.value) resizeObserver.observe(canvasAreaRef.value)
    }
    await nextTick()
    draw()
  })

  onBeforeUnmount(() => {
    window.removeEventListener("resize", resizeCanvas)
    resizeObserver?.disconnect()
    resizeObserver = null
  })

  return {
    canvasRef,
    canvasAreaRef,
    resizeCanvas,
  }
}
