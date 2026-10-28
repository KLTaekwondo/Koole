// 光学成像模型的共用动画工具（凸透镜 / 凹透镜 / 平面镜）
// 目标演示效果：光线从物体出发逐步"生长"到透镜/镜面 → 继续延伸或反向延长 →
// 光斑到达像点后，成像才淡入出现（"光路经过后成像"的因果顺序清晰，教学友好）。
// 三个成像模型共用，保证演示风格一致。

/** 钳制到 [0, 1] */
export function clamp01(v) { return Math.min(1, Math.max(0, v)) }

/** 单条光线的生长时长（秒）：progress = (t - delay) / RAY_DURATION */
export const RAY_DURATION = 0.8

/** 屏幕坐标折线总长 */
function segTotal(pts) {
  let d = 0
  for (let i = 1; i < pts.length; i++) d += Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y)
  return d
}

/** 画一条线段（r 为 0~1 比例），dashed 时用虚线样式 */
function strokeSeg(ctx, a, b, r, color, width, alpha, dashed) {
  ctx.strokeStyle = color
  ctx.globalAlpha = alpha
  ctx.lineWidth = width
  ctx.setLineDash(dashed ? [5, 4] : [])
  ctx.beginPath()
  ctx.moveTo(a.x, a.y)
  ctx.lineTo(a.x + (b.x - a.x) * r, a.y + (b.y - a.y) * r)
  ctx.stroke()
}

/** 在生长末端画光斑（外圈淡光 + 核心亮点） */
function drawTip(ctx, a, b, r, color, tip) {
  const x = a.x + (b.x - a.x) * r
  const y = a.y + (b.y - a.y) * r
  ctx.fillStyle = color
  ctx.globalAlpha = 0.16
  ctx.beginPath(); ctx.arc(x, y, tip * 2.6, 0, Math.PI * 2); ctx.fill()
  ctx.globalAlpha = 0.92
  ctx.beginPath(); ctx.arc(x, y, tip, 0, Math.PI * 2); ctx.fill()
}

/**
 * 按 progress(0~1) 绘制一条"生长中"的光线：
 * @param {CanvasRenderingContext2D} ctx
 * @param {Array<{x,y}>} realPts 实线段（屏幕坐标）
 * @param {Array<{x,y}> | null} virtualPts 反向延长虚线（可为 null）
 * @param {number} progress 0~1，实线+虚线按总长比例生长，末端带光斑
 * @param {Object} opts { color, width, alpha, dashAlpha, tip }
 */
export function drawGrowingRay(ctx, realPts, virtualPts, progress, opts = {}) {
  const { color, width = 2, alpha = 0.85, dashAlpha = 0.45, tip = 5 } = opts
  const p = clamp01(progress)
  if (p <= 0 || realPts.length < 2) return
  const realLen = segTotal(realPts)
  const virtLen = virtualPts && virtualPts.length > 1 ? segTotal(virtualPts) : 0
  const total = realLen + virtLen
  const target = total * p
  let d = 0
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'

  // 实线部分
  for (let i = 1; i < realPts.length; i++) {
    const a = realPts[i - 1], b = realPts[i]
    const seg = Math.hypot(b.x - a.x, b.y - a.y)
    if (d + seg >= target) {
      const r = seg ? (target - d) / seg : 0
      strokeSeg(ctx, a, b, r, color, width, alpha, false)
      drawTip(ctx, a, b, r, color, tip)
      ctx.setLineDash([]); ctx.globalAlpha = 1
      return
    }
    strokeSeg(ctx, a, b, 1, color, width, alpha, false)
    d += seg
  }

  // 反向延长虚线（实线走完后继续生长）
  if (virtualPts && virtualPts.length > 1) {
    for (let i = 1; i < virtualPts.length; i++) {
      const a = virtualPts[i - 1], b = virtualPts[i]
      const seg = Math.hypot(b.x - a.x, b.y - a.y)
      if (d + seg >= target) {
        const r = seg ? (target - d) / seg : 0
        strokeSeg(ctx, a, b, r, color, width, dashAlpha, true)
        drawTip(ctx, a, b, r, color, tip)
        ctx.setLineDash([]); ctx.globalAlpha = 1
        return
      }
      strokeSeg(ctx, a, b, 1, color, width, dashAlpha, true)
      d += seg
    }
  }
  ctx.setLineDash([])
  ctx.globalAlpha = 1
}

/**
 * 成像淡入进度：t >= revealTime 后 fade 秒内从 0 淡入到 1。
 * 用于"光路到达像点后像才出现"。
 */
export function imageReveal(t, revealTime = 0, fade = 0.4) {
  if (t >= revealTime + fade) return 1
  if (t <= revealTime) return 0
  return (t - revealTime) / fade
}
