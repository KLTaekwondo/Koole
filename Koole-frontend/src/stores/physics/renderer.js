import { DRAW_SCALE } from "../../constants/physicsModels.js"

/**
 * 渲染绘制模块
 * 负责绘制网格、地面、轨迹、物理对象、信息面板
 * @param {Ref} canvasRef - Canvas 元素引用
 * @param {Object} camera - 相机模块（提供 worldToScreen, cameraX, cameraY）
 * @param {Ref} modelRef - 当前模型引用
 * @param {Function} getParams - 获取参数函数
 * @param {Function} getState - 获取状态函数
 * @param {Function} getSimTime - 获取模拟时间函数
 * @param {Ref} recordedTrails - 录制轨迹引用
 * @returns {Object} draw 函数
 */
export function createRenderer(canvasRef, camera, modelRef, getParams, getState, getSimTime, recordedTrails) {
  const { worldToScreen, cameraX, cameraY } = camera

  /**
   * 绘制网格
   */
  const drawGrid = (ctx, cw, ch) => {
    ctx.strokeStyle = "#e8e8e8"
    ctx.lineWidth = 0.5
    const startGX = Math.floor((-cw / 2 - cameraX.value) / DRAW_SCALE) * DRAW_SCALE
    const endGX = Math.ceil((cw / 2 - cameraX.value) / DRAW_SCALE) * DRAW_SCALE
    const startGY = Math.floor((-ch + 40 - cameraY.value) / DRAW_SCALE) * DRAW_SCALE
    const endGY = Math.ceil((40 - cameraY.value) / DRAW_SCALE) * DRAW_SCALE

    for (let wx = startGX; wx <= endGX; wx += DRAW_SCALE) {
      const sx = cw / 2 + wx * DRAW_SCALE + cameraX.value
      ctx.beginPath(); ctx.moveTo(sx, 0); ctx.lineTo(sx, ch); ctx.stroke()
    }
    for (let wy = startGY; wy <= endGY; wy += DRAW_SCALE) {
      const sy = ch - 40 - wy * DRAW_SCALE + cameraY.value
      ctx.beginPath(); ctx.moveTo(0, sy); ctx.lineTo(cw, sy); ctx.stroke()
    }
  }

  /**
   * 绘制地面
   */
  const drawGround = (ctx, cw, ch) => {
    const groundScreenY = ch - 40 + cameraY.value
    ctx.fillStyle = "#2c3e50"
    ctx.fillRect(0, groundScreenY, cw, ch - groundScreenY)
    ctx.fillStyle = "#34495e"
    ctx.fillRect(0, groundScreenY, cw, 2)
  }

  /**
   * 绘制录制轨迹
   */
  const drawRecordedTrails = (ctx) => {
    recordedTrails.value.forEach(rec => {
      if (!rec.visible || rec.trail.length < 2) return

      ctx.globalAlpha = 0.75
      // 主轨迹（球1 / 滑块）
      for (let i = 1; i < rec.trail.length; i++) {
        const p1 = worldToScreen(rec.trail[i - 1].x, rec.trail[i - 1].y)
        const p2 = worldToScreen(rec.trail[i].x, rec.trail[i].y)
        ctx.beginPath()
        ctx.moveTo(p1.x, p1.y)
        ctx.lineTo(p2.x, p2.y)
        ctx.strokeStyle = rec.color
        ctx.lineWidth = 2.5
        ctx.stroke()
      }

      // 额外轨迹（两球碰撞的球2）
      if (rec.trail2) {
        ctx.globalAlpha = 0.45
        for (let i = 1; i < rec.trail2.length; i++) {
          const p1 = worldToScreen(rec.trail2[i - 1].x, rec.trail2[i - 1].y)
          const p2 = worldToScreen(rec.trail2[i].x, rec.trail2[i].y)
          ctx.beginPath()
          ctx.moveTo(p1.x, p1.y)
          ctx.lineTo(p2.x, p2.y)
          ctx.strokeStyle = rec.color
          ctx.lineWidth = 2
          ctx.setLineDash([4, 4])
          ctx.stroke()
          ctx.setLineDash([])
        }
      }

      // 额外轨迹（板块模型的木板）
      if (rec.trailB) {
        ctx.globalAlpha = 0.45
        for (let i = 1; i < rec.trailB.length; i++) {
          const p1 = worldToScreen(rec.trailB[i - 1].x, rec.trailB[i - 1].y)
          const p2 = worldToScreen(rec.trailB[i].x, rec.trailB[i].y)
          ctx.beginPath()
          ctx.moveTo(p1.x, p1.y)
          ctx.lineTo(p2.x, p2.y)
          ctx.strokeStyle = rec.color
          ctx.lineWidth = 2
          ctx.setLineDash([8, 4])
          ctx.stroke()
          ctx.setLineDash([])
        }
      }

      ctx.globalAlpha = 1.0
    })
  }

  /**
   * 绘制当前运动轨迹
   */
  const drawCurrentTrail = (ctx, state) => {
    for (let i = 1; i < state.trail.length; i++) {
      const p1 = worldToScreen(state.trail[i - 1].x, state.trail[i - 1].y)
      const p2 = worldToScreen(state.trail[i].x, state.trail[i].y)
      const alpha = 0.08 + 0.35 * (i / state.trail.length)
      ctx.beginPath()
      ctx.moveTo(p1.x, p1.y)
      ctx.lineTo(p2.x, p2.y)
      ctx.strokeStyle = `rgba(231, 76, 60, ${alpha})`
      ctx.lineWidth = 2.5
      ctx.stroke()
    }
  }

  /**
   * 绘制物理对象
   */
  const drawObject = (ctx, model, state, params) => {
    if (model.drawObject) {
      model.drawObject(ctx, state, params, worldToScreen)
    } else {
      const ballPos = model.getBallPosition(state, params)
      const pos = worldToScreen(ballPos.x, ballPos.y)
      const radius = 12
      ctx.beginPath()
      ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2)
      ctx.fillStyle = "#e74c3c"
      ctx.fill()
      ctx.strokeStyle = "rgba(0,0,0,0.2)"
      ctx.lineWidth = 1.5
      ctx.stroke()
    }
  }

  /**
   * 绘制信息面板
   */
  const drawInfoPanel = (ctx, model, state, params, simTime) => {
    ctx.font = "bold 14px ui-monospace, SF Mono, 'Cascadia Code', Consolas, monospace"
    const infoLines = model.getInfoLines(state, params, simTime)
    const lineHeight = 22
    let maxW = 0
    infoLines.forEach(line => {
      const m = ctx.measureText(line)
      if (m.width > maxW) maxW = m.width
    })

    const padX = 12, padY = 8
    const bgW = maxW + padX * 2
    const bgH = infoLines.length * lineHeight + padY * 2
    const rx = 6
    const bx = 10, by = 10

    // 圆角矩形背景
    ctx.beginPath()
    ctx.moveTo(bx + rx, by)
    ctx.lineTo(bx + bgW - rx, by)
    ctx.arcTo(bx + bgW, by, bx + bgW, by + rx, rx)
    ctx.lineTo(bx + bgW, by + bgH - rx)
    ctx.arcTo(bx + bgW, by + bgH, bx + bgW - rx, by + bgH, rx)
    ctx.lineTo(bx + rx, by + bgH)
    ctx.arcTo(bx, by + bgH, bx, by + bgH - rx, rx)
    ctx.lineTo(bx, by + rx)
    ctx.arcTo(bx, by, bx + rx, by, rx)
    ctx.closePath()
    ctx.fillStyle = "rgba(0,0,0,0.55)"
    ctx.fill()

    ctx.fillStyle = "whitesmoke"
    infoLines.forEach((line, i) => {
      ctx.fillText(line, bx + padX, by + padY + 14 + i * lineHeight)
    })
  }

  /**
   * 主绘制函数
   */
  const draw = () => {
    const canvas = canvasRef.value
    const model = modelRef.value
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    const W = canvas.width
    const H = canvas.height
    const dpr = window.devicePixelRatio || 1

    ctx.save()
    ctx.scale(dpr, dpr)

    const cw = W / dpr
    const ch = H / dpr

    // 清空
    ctx.clearRect(0, 0, cw, ch)

    // 背景
    ctx.fillStyle = "#f8f9fa"
    ctx.fillRect(0, 0, cw, ch)

    // 网格
    drawGrid(ctx, cw, ch)

    if (!model || !getState()) { ctx.restore(); return }

    const state = getState()
    const params = getParams()

    // 地面
    drawGround(ctx, cw, ch)

    // 模型额外绘制
    if (model.drawExtra) {
      model.drawExtra(ctx, state, params, worldToScreen)
    }

    // 录制轨迹
    drawRecordedTrails(ctx)

    // 当前运动轨迹
    drawCurrentTrail(ctx, state)

    // 物理对象
    drawObject(ctx, model, state, params)

    // 信息面板
    drawInfoPanel(ctx, model, state, params, getSimTime())

    ctx.restore()
  }

  return {
    draw,
  }
}
