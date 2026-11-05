import { DRAW_SCALE } from "../physicsModels.js"
import { createView } from "../render/ViewKit.js"

/**
 * 渲染绘制模块
 *
 * 两条绘制路径并存（迁移期）：
 *   - 新：模型提供 drawScene(view, state, params)，舞台由环境部件绘制（ViewKit）
 *   - 旧：模型提供 drawExtra(ctx, ...)，沿用桌面网格 + 地面 + 通用球体
 *
 * @param {Ref} canvasRef
 * @param {Object} viewTransform 提供 worldToScreen / offsetX / offsetY / viewWidth / viewHeight / pixelPerUnit
 * @param {Ref} modelRef
 * @param {Object} simState
 * @param {Ref} recordedTrails
 * @param {Function} getTheme
 * @param {Function} onInfoUpdate
 */
export function createRenderer(canvasRef, viewTransform, modelRef, simState, recordedTrails, getTheme, onInfoUpdate) {
  const { worldToScreen, offsetX, offsetY, viewWidth, viewHeight, pixelPerUnit } = viewTransform

  // 轨迹最多画最近这么多点：旧实现会一次画 5000 段，跑久了必然掉帧
  const MAX_DRAW_TRAIL = 900

  const drawGrid = (ctx, cw, ch) => {
    ctx.strokeStyle = getTheme() === "dark" ? "#444444" : "#e8e8e8"
    ctx.lineWidth = 0.5
    const unit = pixelPerUnit()
    const startGX = Math.floor((-cw / 2 - offsetX.value) / unit) * unit
    const endGX = Math.ceil((cw / 2 - offsetX.value) / unit) * unit
    const startGY = Math.floor((-ch + 40 - offsetY.value) / unit) * unit
    const endGY = Math.ceil((40 - offsetY.value) / unit) * unit

    for (let wx = startGX; wx <= endGX; wx += unit) {
      const sx = cw / 2 + wx + offsetX.value
      ctx.beginPath(); ctx.moveTo(sx, 0); ctx.lineTo(sx, ch); ctx.stroke()
    }
    for (let wy = startGY; wy <= endGY; wy += unit) {
      const sy = ch - 40 - wy + offsetY.value
      ctx.beginPath(); ctx.moveTo(0, sy); ctx.lineTo(cw, sy); ctx.stroke()
    }
  }

  const drawGround = (ctx, cw, ch) => {
    const groundScreenY = ch - 40 + offsetY.value
    ctx.fillStyle = getTheme() === "dark" ? "#444444" : "#2c3e50"
    ctx.fillRect(0, groundScreenY, cw, ch - groundScreenY)
    ctx.fillStyle = getTheme() === "dark" ? "#555555" : "#34495e"
    ctx.fillRect(0, groundScreenY, cw, 2)
  }

  /**
   * 轨迹描边：滚动窗口 + 渐隐。
   * 只画最近 MAX_DRAW_TRAIL 个点，按新旧分成 8 段：
   * 最老的一段几乎透明，最新的一段最亮 —— 视觉上就是「新点把老点顶出去」。
   * 每帧最多 8 次 stroke，和点数无关。
   */
  const strokeTrail = (ctx, points, { color, width = 2.5, dash = null } = {}) => {
    if (!points || points.length < 2) return
    const visible = points.length > MAX_DRAW_TRAIL ? points.slice(-MAX_DRAW_TRAIL) : points
    const buckets = 8
    const size = Math.ceil(visible.length / buckets)
    ctx.save()
    ctx.strokeStyle = color
    ctx.lineWidth = width
    ctx.lineJoin = "round"
    ctx.lineCap = "round"
    if (dash) ctx.setLineDash(dash)
    for (let b = 0; b < buckets; b++) {
      const start = b * size
      const end = Math.min(visible.length, start + size + 1)
      if (end - start < 2) continue
      ctx.beginPath()
      for (let i = start; i < end; i++) {
        const p = worldToScreen(visible[i].x, visible[i].y)
        if (i === start) ctx.moveTo(p.x, p.y)
        else ctx.lineTo(p.x, p.y)
      }
      const progress = (b + 1) / buckets
      ctx.globalAlpha = dash ? 0.16 + 0.3 * progress : 0.03 + 0.52 * progress
      ctx.stroke()
    }
    ctx.restore()
  }

  const drawRecordedTrails = (ctx) => {
    recordedTrails.value.forEach(rec => {
      if (!rec.visible) return
      strokeTrail(ctx, rec.trail, { color: rec.color, width: 2.5 })
      if (rec.trail2) strokeTrail(ctx, rec.trail2, { color: rec.color, width: 2, dash: [4, 4] })
      if (rec.trailB) strokeTrail(ctx, rec.trailB, { color: rec.color, width: 2, dash: [8, 4] })
    })
  }

  const drawCurrentTrail = (ctx, state) => {
    if (!state?.trail || state.trail.length < 2) return
    strokeTrail(ctx, state.trail, { color: "#e74c3c", width: 2.5 })
  }

  const drawObject = (ctx, model, state, params) => {
    if (model.drawObject) {
      model.drawObject(ctx, state, params, worldToScreen)
      return
    }
    const ballPos = model.getBallPosition(state, params)
    if (!ballPos) return
    const pos = worldToScreen(ballPos.x, ballPos.y)
    ctx.beginPath(); ctx.arc(pos.x, pos.y, 12, 0, Math.PI * 2)
    ctx.fillStyle = "#e74c3c"; ctx.fill()
    ctx.strokeStyle = "rgba(0,0,0,0.2)"; ctx.lineWidth = 1.5; ctx.stroke()
  }

  const draw = () => {
    const canvas = canvasRef.value
    const model = modelRef.value
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    const dpr = window.devicePixelRatio || 1
    const cw = canvas.width / dpr
    const ch = canvas.height / dpr
    ctx.save(); ctx.scale(dpr, dpr)
    ctx.clearRect(0, 0, cw, ch)

    // 新架构：模型声明环境（地面 / 水面 / 光轴），舞台由环境部件一次画完
    const useScene = model && typeof model.drawScene === "function"
    if (useScene) {
      const view = createView({ ctx, cw, ch, viewTransform, theme: getTheme() })
      model.drawScene(view, simState.state, simState.params)
      drawRecordedTrails(ctx)
      if (onInfoUpdate) onInfoUpdate(model.getInfoLines(simState.state, simState.params, simState.simTime))
      ctx.restore()
      return
    }

    // 旧架构：迁移期间原样保留
    ctx.fillStyle = getTheme() === "dark" ? "#2a2a2a" : "#f8f9fa"
    ctx.fillRect(0, 0, cw, ch)
    drawGrid(ctx, cw, ch)
    if (!model || !simState.state) { ctx.restore(); return }
    drawGround(ctx, cw, ch)
    if (model.drawExtra) model.drawExtra(ctx, simState.state, simState.params, worldToScreen, getTheme)
    drawRecordedTrails(ctx)
    drawCurrentTrail(ctx, simState.state)
    drawObject(ctx, model, simState.state, simState.params)
    if (onInfoUpdate) onInfoUpdate(model.getInfoLines(simState.state, simState.params, simState.simTime))
    ctx.restore()
  }

  return { draw }
}
