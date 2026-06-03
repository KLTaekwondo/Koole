import { DRAW_SCALE } from "../../constants/physicsModels.js"

/**
 * 渲染绘制模块
 * @param {Ref} canvasRef - Canvas 元素引用
 * @param {Object} viewTransform - 视图变换（提供 worldToScreen, offsetX, offsetY, viewWidth, viewHeight）
 * @param {Ref} modelRef - 当前模型引用
 * @param {Object} simState - 统一状态层
 * @param {Ref} recordedTrails - 录制轨迹引用
 * @param {Function} getTheme - 获取当前主题
 */
export function createRenderer(canvasRef, viewTransform, modelRef, simState, recordedTrails, getTheme) {
  const { worldToScreen, offsetX, offsetY, viewWidth, viewHeight } = viewTransform

  const drawGrid = (ctx, cw, ch) => {
    ctx.strokeStyle = getTheme() === "dark" ? "#444444" : "#e8e8e8"
    ctx.lineWidth = 0.5
    const startGX = Math.floor((-cw / 2 - offsetX.value) / DRAW_SCALE) * DRAW_SCALE
    const endGX = Math.ceil((cw / 2 - offsetX.value) / DRAW_SCALE) * DRAW_SCALE
    const startGY = Math.floor((-ch + 40 - offsetY.value) / DRAW_SCALE) * DRAW_SCALE
    const endGY = Math.ceil((40 - offsetY.value) / DRAW_SCALE) * DRAW_SCALE

    for (let wx = startGX; wx <= endGX; wx += DRAW_SCALE) {
      const sx = cw / 2 + wx * DRAW_SCALE + offsetX.value
      ctx.beginPath(); ctx.moveTo(sx, 0); ctx.lineTo(sx, ch); ctx.stroke()
    }
    for (let wy = startGY; wy <= endGY; wy += DRAW_SCALE) {
      const sy = ch - 40 - wy * DRAW_SCALE + offsetY.value
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

  const drawRecordedTrails = (ctx) => {
    recordedTrails.value.forEach(rec => {
      if (!rec.visible || rec.trail.length < 2) return
      ctx.globalAlpha = 0.75
      for (let i = 1; i < rec.trail.length; i++) {
        const p1 = worldToScreen(rec.trail[i - 1].x, rec.trail[i - 1].y)
        const p2 = worldToScreen(rec.trail[i].x, rec.trail[i].y)
        ctx.beginPath(); ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y)
        ctx.strokeStyle = rec.color; ctx.lineWidth = 2.5; ctx.stroke()
      }
      if (rec.trail2) {
        ctx.globalAlpha = 0.45
        for (let i = 1; i < rec.trail2.length; i++) {
          const p1 = worldToScreen(rec.trail2[i - 1].x, rec.trail2[i - 1].y)
          const p2 = worldToScreen(rec.trail2[i].x, rec.trail2[i].y)
          ctx.beginPath(); ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y)
          ctx.strokeStyle = rec.color; ctx.lineWidth = 2; ctx.setLineDash([4, 4]); ctx.stroke(); ctx.setLineDash([])
        }
      }
      if (rec.trailB) {
        ctx.globalAlpha = 0.45
        for (let i = 1; i < rec.trailB.length; i++) {
          const p1 = worldToScreen(rec.trailB[i - 1].x, rec.trailB[i - 1].y)
          const p2 = worldToScreen(rec.trailB[i].x, rec.trailB[i].y)
          ctx.beginPath(); ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y)
          ctx.strokeStyle = rec.color; ctx.lineWidth = 2; ctx.setLineDash([8, 4]); ctx.stroke(); ctx.setLineDash([])
        }
      }
      ctx.globalAlpha = 1.0
    })
  }

  const drawCurrentTrail = (ctx, state) => {
    for (let i = 1; i < state.trail.length; i++) {
      const p1 = worldToScreen(state.trail[i - 1].x, state.trail[i - 1].y)
      const p2 = worldToScreen(state.trail[i].x, state.trail[i].y)
      const alpha = 0.08 + 0.35 * (i / state.trail.length)
      ctx.beginPath(); ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y)
      ctx.strokeStyle = `rgba(231, 76, 60, ${alpha})`; ctx.lineWidth = 2.5; ctx.stroke()
    }
  }

  const drawObject = (ctx, model, state, params) => {
    if (model.drawObject) {
      model.drawObject(ctx, state, params, worldToScreen)
    } else {
      const ballPos = model.getBallPosition(state, params)
      const pos = worldToScreen(ballPos.x, ballPos.y)
      ctx.beginPath(); ctx.arc(pos.x, pos.y, 12, 0, Math.PI * 2)
      ctx.fillStyle = "#e74c3c"; ctx.fill()
      ctx.strokeStyle = "rgba(0,0,0,0.2)"; ctx.lineWidth = 1.5; ctx.stroke()
    }
  }

  const drawInfoPanel = (ctx, model, state, params, simTime) => {
    ctx.font = "bold 14px ui-monospace, SF Mono, 'Cascadia Code', Consolas, monospace"
    const infoLines = model.getInfoLines(state, params, simTime)
    const lineHeight = 22
    let maxW = 0
    infoLines.forEach(line => { const m = ctx.measureText(line); if (m.width > maxW) maxW = m.width })
    const padX = 12, padY = 8
    const bgW = maxW + padX * 2, bgH = infoLines.length * lineHeight + padY * 2
    const rx = 6, bx = 10, by = 10
    ctx.beginPath()
    ctx.moveTo(bx + rx, by); ctx.lineTo(bx + bgW - rx, by)
    ctx.arcTo(bx + bgW, by, bx + bgW, by + rx, rx)
    ctx.lineTo(bx + bgW, by + bgH - rx)
    ctx.arcTo(bx + bgW, by + bgH, bx + bgW - rx, by + bgH, rx)
    ctx.lineTo(bx + rx, by + bgH)
    ctx.arcTo(bx, by + bgH, bx, by + bgH - rx, rx)
    ctx.lineTo(bx, by + rx)
    ctx.arcTo(bx, by, bx + rx, by, rx)
    ctx.closePath()
    const isDark = getTheme() === "dark"
    ctx.fillStyle = isDark ? "rgba(20,20,20,0.92)" : "rgba(0,0,0,0.6)"
    ctx.fill()
    ctx.strokeStyle = isDark ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.3)"
    ctx.lineWidth = 1
    ctx.stroke()
    ctx.fillStyle = isDark ? "#ffffff" : "whitesmoke"
    infoLines.forEach((line, i) => { ctx.fillText(line, bx + padX, by + padY + 14 + i * lineHeight) })
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
    ctx.fillStyle = getTheme() === "dark" ? "#2a2a2a" : "#f8f9fa"
    ctx.fillRect(0, 0, cw, ch)
    drawGrid(ctx, cw, ch)
    if (!model || !simState.state) { ctx.restore(); return }
    drawGround(ctx, cw, ch)
    if (model.drawExtra) model.drawExtra(ctx, simState.state, simState.params, worldToScreen, getTheme)
    drawRecordedTrails(ctx)
    drawCurrentTrail(ctx, simState.state)
    drawObject(ctx, model, simState.state, simState.params)
    drawInfoPanel(ctx, model, simState.state, simState.params, simState.simTime)
    ctx.restore()
  }

  return { draw }
}
