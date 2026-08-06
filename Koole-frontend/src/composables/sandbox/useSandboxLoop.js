/**
 * 动画循环与尺寸自适应：RAF 驱动、dt 上限、暂停恢复时间戳、
 * Canvas resize 监听，以及卸载时对 RAF 与 resize 监听器的统一清理。
 */
export function useSandboxLoop({ canvasRef, canvasContainerRef, onFrame, onResize }) {
  let animationId = null
  let lastTimestamp = 0
  let isUnmounted = false

  function resizeCanvas() {
    const canvas = canvasRef.value
    const container = canvasContainerRef.value
    if (!canvas || !container) return

    const rect = container.getBoundingClientRect()
    const width = Math.floor(rect.width)
    const height = Math.floor(rect.height)
    canvas.width = width
    canvas.height = height
    onResize?.(width, height)
  }

  function animate(now) {
    if (isUnmounted) return
    const dt = Math.min(0.033, (now - lastTimestamp) / 1000)
    if (dt > 0) {
      onFrame(dt)
    }
    lastTimestamp = now
    animationId = requestAnimationFrame(animate)
  }

  /** 恢复播放时重置时间戳，避免暂停期间 dt 跳变 */
  function resetTimestamp() {
    lastTimestamp = performance.now()
  }

  /** 启动：初始化尺寸、挂载 resize 监听、开始 RAF 循环 */
  function start() {
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)
    lastTimestamp = performance.now()
    animationId = requestAnimationFrame(animate)
  }

  /** 清理：取消 RAF、移除 resize 监听；页面卸载后循环立即停止 */
  function cleanup() {
    isUnmounted = true
    if (animationId) {
      cancelAnimationFrame(animationId)
      animationId = null
    }
    window.removeEventListener('resize', resizeCanvas)
  }

  return { resizeCanvas, resetTimestamp, start, cleanup }
}
