// ── 模型渲染逻辑 ──
// 所有 Canvas 绘制代码集中在这里

const DRAW_SCALE = 30
const GROUND_Y = 0.4

export const MODEL_RENDERERS = {
  // ── 1. 自由落体 ──
  "free-fall": {
    drawExtra: (ctx, s, p, w2s) => {
      if (s.vy < 0.2 || s.y <= 0) return
      const pos = w2s(0, s.y)
      const len = Math.min(s.vy * 5, 110)
      ctx.beginPath()
      ctx.moveTo(pos.x, pos.y)
      ctx.lineTo(pos.x, pos.y + len)
      ctx.strokeStyle = "#e74c3c"
      ctx.lineWidth = 2.5
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(pos.x, pos.y + len)
      ctx.lineTo(pos.x - 6, pos.y + len - 10)
      ctx.lineTo(pos.x + 6, pos.y + len - 10)
      ctx.closePath()
      ctx.fillStyle = "#e74c3c"
      ctx.fill()
      ctx.fillStyle = "#e74c3c"
      ctx.font = "bold 11px sans-serif"
      ctx.fillText("V", pos.x + 10, pos.y + len * 0.5 + 4)
    },
  },

  // ── 2. 平抛运动 ──
  "projectile": {
    drawExtra: (ctx, s, p, w2s) => {
      const speed = Math.sqrt(s.vx * s.vx + s.vy * s.vy)
      if (speed < 0.2 || s.y <= 0) return
      const pos = w2s(s.x, s.y)
      const vxLen = s.vx * 5
      ctx.beginPath()
      ctx.moveTo(pos.x, pos.y)
      ctx.lineTo(pos.x + vxLen, pos.y)
      ctx.strokeStyle = "#3498db"
      ctx.lineWidth = 2
      ctx.stroke()
      if (vxLen > 10) {
        ctx.beginPath()
        ctx.moveTo(pos.x + vxLen, pos.y)
        ctx.lineTo(pos.x + vxLen - 7, pos.y - 4)
        ctx.lineTo(pos.x + vxLen - 7, pos.y + 4)
        ctx.closePath()
        ctx.fillStyle = "#3498db"
        ctx.fill()
      }
      ctx.fillStyle = "#3498db"
      ctx.font = "11px sans-serif"
      ctx.fillText("Vx", pos.x + vxLen * 0.5 - 10, pos.y + 16)
      const vyLen = s.vy * 5
      ctx.beginPath()
      ctx.moveTo(pos.x, pos.y)
      ctx.lineTo(pos.x, pos.y + vyLen)
      ctx.strokeStyle = "#2ecc71"
      ctx.lineWidth = 2
      ctx.stroke()
      if (vyLen > 10) {
        ctx.beginPath()
        ctx.moveTo(pos.x, pos.y + vyLen)
        ctx.lineTo(pos.x - 4, pos.y + vyLen - 7)
        ctx.lineTo(pos.x + 4, pos.y + vyLen - 7)
        ctx.closePath()
        ctx.fillStyle = "#2ecc71"
        ctx.fill()
      }
      ctx.fillStyle = "#2ecc71"
      ctx.fillText("Vy", pos.x + 10, pos.y + vyLen * 0.5)
      const endX = pos.x + vxLen
      const endY = pos.y + vyLen
      ctx.beginPath()
      ctx.moveTo(pos.x, pos.y)
      ctx.lineTo(endX, endY)
      ctx.strokeStyle = "#e74c3c"
      ctx.lineWidth = 2.5
      ctx.stroke()
      const a = Math.atan2(vyLen, vxLen)
      ctx.beginPath()
      ctx.moveTo(endX, endY)
      ctx.lineTo(endX - 9 * Math.cos(a - 0.4), endY - 9 * Math.sin(a - 0.4))
      ctx.lineTo(endX - 9 * Math.cos(a + 0.4), endY - 9 * Math.sin(a + 0.4))
      ctx.closePath()
      ctx.fillStyle = "#e74c3c"
      ctx.fill()
      ctx.fillStyle = "#e74c3c"
      ctx.fillText("V", (endX + pos.x) / 2 + 10, (endY + pos.y) / 2 - 8)
    },
  },

  // ── 3. 竖直上抛 ──
  "vertical-throw": {
    drawExtra: (ctx, s, p, w2s) => {
      if (Math.abs(s.vy) < 0.2 || s.y <= 0) return
      const pos = w2s(0, s.y)
      const len = Math.min(Math.abs(s.vy) * 5, 110)
      const sign = s.vy > 0 ? 1 : -1
      const tipY = pos.y - len * sign
      ctx.beginPath()
      ctx.moveTo(pos.x, pos.y)
      ctx.lineTo(pos.x, tipY)
      ctx.strokeStyle = "#e74c3c"
      ctx.lineWidth = 2.5
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(pos.x, tipY)
      ctx.lineTo(pos.x - 6, tipY + 10 * sign)
      ctx.lineTo(pos.x + 6, tipY + 10 * sign)
      ctx.closePath()
      ctx.fillStyle = "#e74c3c"
      ctx.fill()
      ctx.fillStyle = "#e74c3c"
      ctx.font = "bold 11px sans-serif"
      ctx.fillText("V", pos.x + 10, (pos.y + tipY) / 2 + 4)
    },
  },

  // ── 4. 圆周运动 ──
  "circular": {
    drawExtra: (ctx, s, p, w2s, getTheme) => {
      const center = w2s(0, p.radius)
      const ball = w2s(p.radius * Math.cos(s.angle), p.radius * Math.sin(s.angle) + p.radius)
      const rPx = p.radius * DRAW_SCALE
      ctx.beginPath()
      ctx.arc(center.x, center.y, rPx, 0, Math.PI * 2)
      ctx.strokeStyle = "rgba(52, 152, 219, 0.3)"
      ctx.lineWidth = 1.5
      ctx.setLineDash([6, 4])
      ctx.stroke()
      ctx.setLineDash([])
      ctx.beginPath()
      ctx.moveTo(center.x, center.y)
      ctx.lineTo(ball.x, ball.y)
      ctx.strokeStyle = "rgba(0,0,0,0.15)"
      ctx.lineWidth = 1
      ctx.stroke()
      const dx = center.x - ball.x
      const dy = center.y - ball.y
      const len = Math.sqrt(dx * dx + dy * dy)
      if (len > 1) {
        const nx = dx / len, ny = dy / len
        const arrowLen = Math.min(60, len * 0.6)
        const tipX = ball.x + nx * arrowLen
        const tipY = ball.y + ny * arrowLen
        ctx.beginPath()
        ctx.moveTo(ball.x, ball.y)
        ctx.lineTo(tipX, tipY)
        ctx.strokeStyle = "#e74c3c"
        ctx.lineWidth = 2.5
        ctx.stroke()
        // 箭头三角形：随方向旋转
        const angle = Math.atan2(ny, nx)
        ctx.beginPath()
        ctx.moveTo(tipX, tipY)
        ctx.lineTo(tipX - 10 * Math.cos(angle - 0.35), tipY - 10 * Math.sin(angle - 0.35))
        ctx.lineTo(tipX - 10 * Math.cos(angle + 0.35), tipY - 10 * Math.sin(angle + 0.35))
        ctx.closePath()
        ctx.fillStyle = "#e74c3c"
        ctx.fill()
        ctx.fillStyle = "#e74c3c"
        ctx.font = "bold 12px sans-serif"
        const labelX = ball.x + nx * arrowLen * 0.5
        const labelY = ball.y + ny * arrowLen * 0.5
        ctx.fillText("F心", labelX + ny * 10, labelY - nx * 10)
      }
      const v = p.omega * p.radius
      const sc = 3
      const vLen = Math.min(v * sc, 80)
      const dir = p.omega > 0 ? 1 : -1
      const tx = dir * -Math.sin(s.angle) * vLen
      const ty = dir * -Math.cos(s.angle) * vLen
      ctx.beginPath()
      ctx.moveTo(ball.x, ball.y)
      ctx.lineTo(ball.x + tx, ball.y + ty)
      ctx.strokeStyle = "#e67e22"
      ctx.lineWidth = 2.5
      ctx.stroke()
      const vAng = Math.atan2(ty, tx)
      ctx.beginPath()
      ctx.moveTo(ball.x + tx, ball.y + ty)
      ctx.lineTo(ball.x + tx - 8 * Math.cos(vAng - 0.4), ball.y + ty - 8 * Math.sin(vAng - 0.4))
      ctx.lineTo(ball.x + tx - 8 * Math.cos(vAng + 0.4), ball.y + ty - 8 * Math.sin(vAng + 0.4))
      ctx.closePath()
      ctx.fillStyle = "#e67e22"
      ctx.fill()
      ctx.fillStyle = "#e67e22"
      ctx.font = "bold 11px sans-serif"
      ctx.fillText("V", ball.x + tx * 0.5 + 8, ball.y + ty * 0.5 - 6)
    },
  },

  // ── 5. 斜面滑动 ──
  "incline": {
    drawExtra: (ctx, s, p, w2s) => {
      const theta = p.angle * Math.PI / 180
      const rampLen = s.rampLen
      const top = w2s(0, p.rampHeight)
      const bottom = w2s(0, 0)
      const rampEnd = w2s(rampLen * Math.cos(theta), 0)
      ctx.beginPath()
      ctx.moveTo(top.x, top.y)
      ctx.lineTo(rampEnd.x, rampEnd.y)
      ctx.lineTo(bottom.x, bottom.y)
      ctx.closePath()
      ctx.fillStyle = "rgba(52, 152, 219, 0.08)"
      ctx.fill()
      ctx.strokeStyle = "rgba(52, 152, 219, 0.5)"
      ctx.lineWidth = 2
      ctx.stroke()
      ctx.fillStyle = "rgba(0,0,0,0.4)"
      ctx.font = "12px sans-serif"
      ctx.fillText(`θ = ${p.angle}°`, bottom.x + 20, bottom.y - 10)
      if (s.vel > 0.2 && s.dist < s.rampLen) {
        const ballPos = w2s(s.dist * Math.cos(theta), p.rampHeight - s.dist * Math.sin(theta))
        const len = Math.min(s.vel * 3, 80)
        const dx = Math.cos(theta) * len
        const dy = Math.sin(theta) * len
        ctx.beginPath()
        ctx.moveTo(ballPos.x, ballPos.y)
        ctx.lineTo(ballPos.x + dx, ballPos.y + dy)
        ctx.strokeStyle = "#e74c3c"
        ctx.lineWidth = 2.5
        ctx.stroke()
        const a = Math.atan2(dy, dx)
        ctx.beginPath()
        ctx.moveTo(ballPos.x + dx, ballPos.y + dy)
        ctx.lineTo(ballPos.x + dx - 8 * Math.cos(a - 0.4), ballPos.y + dy - 8 * Math.sin(a - 0.4))
        ctx.lineTo(ballPos.x + dx - 8 * Math.cos(a + 0.4), ballPos.y + dy - 8 * Math.sin(a + 0.4))
        ctx.closePath()
        ctx.fillStyle = "#e74c3c"
        ctx.fill()
        ctx.fillStyle = "#e74c3c"
        ctx.font = "bold 11px sans-serif"
        ctx.fillText("V", ballPos.x + dx * 0.5 + 8, ballPos.y + dy * 0.5 - 6)
      }
    },
  },

  // ── 6. 单摆 ──
  "pendulum": {
    drawExtra: (ctx, s, p, w2s) => {
      const pivot = w2s(0, p.length)
      const ball = w2s(p.length * Math.sin(s.theta), p.length - p.length * Math.cos(s.theta) + GROUND_Y)
      ctx.beginPath()
      ctx.moveTo(pivot.x, pivot.y)
      ctx.lineTo(ball.x, ball.y)
      ctx.strokeStyle = "#999"
      ctx.lineWidth = 1.5
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(pivot.x, pivot.y)
      ctx.lineTo(pivot.x, ball.y + 20)
      ctx.strokeStyle = "rgba(0,0,0,0.1)"
      ctx.lineWidth = 1
      ctx.setLineDash([3, 3])
      ctx.stroke()
      ctx.setLineDash([])
      const r = 30
      const startAngle = -Math.PI / 2
      const endAngle = -Math.PI / 2 + Math.min(Math.max(s.theta, -Math.PI / 2), Math.PI / 2)
      ctx.beginPath()
      ctx.arc(pivot.x, pivot.y, r, s.theta > 0 ? startAngle : endAngle, s.theta > 0 ? endAngle : startAngle)
      ctx.strokeStyle = "rgba(0,0,0,0.3)"
      ctx.lineWidth = 1
      ctx.stroke()
      const tangSpeed = Math.abs(s.omega) * p.length
      if (tangSpeed > 0.05) {
        const len = Math.min(tangSpeed * 8, 70)
        const dir = s.omega > 0 ? 1 : -1
        const dx = Math.cos(s.theta) * dir * len
        const dy = -Math.sin(s.theta) * dir * len
        ctx.beginPath()
        ctx.moveTo(ball.x, ball.y)
        ctx.lineTo(ball.x + dx, ball.y + dy)
        ctx.strokeStyle = "#e67e22"
        ctx.lineWidth = 2.5
        ctx.stroke()
        const a = Math.atan2(dy, dx)
        ctx.beginPath()
        ctx.moveTo(ball.x + dx, ball.y + dy)
        ctx.lineTo(ball.x + dx - 8 * Math.cos(a - 0.4), ball.y + dy - 8 * Math.sin(a - 0.4))
        ctx.lineTo(ball.x + dx - 8 * Math.cos(a + 0.4), ball.y + dy - 8 * Math.sin(a + 0.4))
        ctx.closePath()
        ctx.fillStyle = "#e67e22"
        ctx.fill()
        ctx.fillStyle = "#e67e22"
        ctx.font = "bold 11px sans-serif"
        ctx.fillText("V", ball.x + dx * 0.5 + 8, ball.y + dy * 0.5 - 6)
      }
    },
  },

  // ── 7. 斜向上抛 ──
  "angled-projectile": {
    drawExtra: (ctx, s, p, w2s) => {
      const start = w2s(0, 0)
      const theta = p.angle * Math.PI / 180
      const arcR = 36
      ctx.beginPath()
      ctx.arc(start.x, start.y, arcR, -Math.PI / 2, -Math.PI / 2 + Math.min(theta, Math.PI / 2))
      ctx.strokeStyle = "rgba(0,0,0,0.2)"
      ctx.lineWidth = 1
      ctx.stroke()
      const midA = -Math.PI / 2 + theta / 2
      ctx.fillStyle = "rgba(0,0,0,0.35)"
      ctx.font = "11px sans-serif"
      ctx.fillText(`θ=${p.angle}°`, start.x + (arcR + 8) * Math.cos(midA) - 12, start.y + (arcR + 8) * Math.sin(midA) + 4)
      const pos = w2s(s.x, s.y)
      const speed = Math.sqrt(s.vx * s.vx + s.vy * s.vy)
      if (speed > 0.1 && s.y > 0.5) {
        const sc = 8
        ctx.beginPath()
        ctx.moveTo(pos.x, pos.y)
        ctx.lineTo(pos.x + s.vx * sc, pos.y)
        ctx.strokeStyle = "#3498db"
        ctx.lineWidth = 2
        ctx.stroke()
        ctx.fillStyle = "#3498db"
        ctx.font = "11px sans-serif"
        ctx.fillText("Vx", pos.x + s.vx * sc * 0.5 - 8, pos.y + 14)
        ctx.beginPath()
        ctx.moveTo(pos.x, pos.y)
        ctx.lineTo(pos.x, pos.y - s.vy * sc)
        ctx.strokeStyle = "#2ecc71"
        ctx.lineWidth = 2
        ctx.stroke()
        ctx.fillStyle = "#2ecc71"
        ctx.fillText("Vy", pos.x + 6, pos.y - s.vy * sc * 0.5)
        const endX = pos.x + s.vx * sc
        const endY = pos.y - s.vy * sc
        ctx.beginPath()
        ctx.moveTo(pos.x, pos.y)
        ctx.lineTo(endX, endY)
        ctx.strokeStyle = "#e74c3c"
        ctx.lineWidth = 2.5
        ctx.stroke()
        const angle = Math.atan2(-s.vy, s.vx)
        ctx.beginPath()
        ctx.moveTo(endX, endY)
        ctx.lineTo(endX - 8 * Math.cos(angle - 0.4), endY - 8 * Math.sin(angle - 0.4))
        ctx.lineTo(endX - 8 * Math.cos(angle + 0.4), endY - 8 * Math.sin(angle + 0.4))
        ctx.closePath()
        ctx.fillStyle = "#e74c3c"
        ctx.fill()
        ctx.fillStyle = "#e74c3c"
        ctx.fillText("V", endX * 0.5 + pos.x * 0.5 + 8, endY * 0.5 + pos.y * 0.5 - 6)
      }
    },
  },

  // ── 8. 小船过河 ──
  "boat-river": {
    drawExtra: (ctx, s, p, w2s) => {
      const canvas = ctx.canvas
      const dpr = window.devicePixelRatio || 1
      const cw = canvas.width / dpr
      const ch = canvas.height / dpr
      const farPt = w2s(0, p.riverWidth)
      const nearPt = w2s(0, 0)
      ctx.fillStyle = "rgba(52, 152, 219, 0.08)"
      ctx.fillRect(0, 0, cw, ch)
      if (farPt.y > 0) {
        ctx.fillStyle = "#2c3e50"
        ctx.fillRect(0, 0, cw, farPt.y)
      }
      ctx.beginPath()
      ctx.moveTo(0, farPt.y)
      ctx.lineTo(cw, farPt.y)
      ctx.strokeStyle = "#2c3e50"
      ctx.lineWidth = 3
      ctx.stroke()
      for (const ratio of [0.2, 0.4, 0.6, 0.8]) {
        const basePt = w2s(0, p.riverWidth * ratio)
        if (basePt.y < 0 || basePt.y > ch) continue
        for (let x = 40; x < cw - 40; x += cw / 4) {
          ctx.beginPath()
          ctx.moveTo(x - 12, basePt.y)
          ctx.lineTo(x + 12, basePt.y)
          ctx.strokeStyle = "rgba(52, 152, 219, 0.25)"
          ctx.lineWidth = 1.2
          ctx.stroke()
          ctx.beginPath()
          ctx.moveTo(x + 12, basePt.y)
          ctx.lineTo(x + 6, basePt.y - 4)
          ctx.lineTo(x + 6, basePt.y + 4)
          ctx.closePath()
          ctx.fillStyle = "rgba(52, 152, 219, 0.25)"
          ctx.fill()
        }
      }
      ctx.fillStyle = "rgba(0,0,0,0.15)"
      ctx.font = "11px sans-serif"
      ctx.fillText("起点", nearPt.x - 14, nearPt.y + 22)
      if (farPt.y > 20) ctx.fillText("对岸", 6, farPt.y - 6)
      const pos = w2s(s.x, s.y)
      ctx.beginPath()
      ctx.moveTo(pos.x - 11, pos.y + 5)
      ctx.lineTo(pos.x - 7, pos.y - 4)
      ctx.lineTo(pos.x + 7, pos.y - 4)
      ctx.lineTo(pos.x + 11, pos.y + 5)
      ctx.closePath()
      ctx.fillStyle = "#8B4513"
      ctx.fill()
      ctx.strokeStyle = "rgba(0,0,0,0.25)"
      ctx.lineWidth = 1
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(pos.x, pos.y + 2)
      ctx.lineTo(pos.x, pos.y - 12)
      ctx.strokeStyle = "#666"
      ctx.lineWidth = 1.5
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(pos.x, pos.y - 12)
      ctx.lineTo(pos.x + 9, pos.y - 4)
      ctx.lineTo(pos.x, pos.y - 2)
      ctx.closePath()
      ctx.fillStyle = "rgba(255,255,255,0.65)"
      ctx.fill()
      ctx.strokeStyle = "rgba(0,0,0,0.15)"
      ctx.lineWidth = 0.5
      ctx.stroke()
      const theta = p.headingAngle * Math.PI / 180
      const vx = p.boatSpeed * Math.sin(theta) + p.currentSpeed
      const vy = p.boatSpeed * Math.cos(theta)
      const speed = Math.sqrt(vx * vx + vy * vy)
      if (speed > 0.05 && s.y < s.riverWidth - 1) {
        const sc = 12
        ctx.beginPath()
        ctx.moveTo(pos.x, pos.y)
        ctx.lineTo(pos.x, pos.y - vy * sc)
        ctx.strokeStyle = "#2ecc71"
        ctx.lineWidth = 2
        ctx.stroke()
        ctx.fillStyle = "#2ecc71"
        ctx.font = "11px sans-serif"
        ctx.fillText("Vy", pos.x + 6, pos.y - vy * sc * 0.5)
        ctx.beginPath()
        ctx.moveTo(pos.x, pos.y)
        ctx.lineTo(pos.x + vx * sc, pos.y)
        ctx.strokeStyle = "#3498db"
        ctx.lineWidth = 2
        ctx.stroke()
        ctx.fillStyle = "#3498db"
        ctx.fillText("Vx", pos.x + vx * sc * 0.5 - 10, pos.y + 14)
        const eX = pos.x + vx * sc, eY = pos.y - vy * sc
        ctx.beginPath()
        ctx.moveTo(pos.x, pos.y)
        ctx.lineTo(eX, eY)
        ctx.strokeStyle = "#e74c3c"
        ctx.lineWidth = 2.5
        ctx.stroke()
        const a = Math.atan2(-vy, vx)
        ctx.beginPath()
        ctx.moveTo(eX, eY)
        ctx.lineTo(eX - 7 * Math.cos(a - 0.4), eY - 7 * Math.sin(a - 0.4))
        ctx.lineTo(eX - 7 * Math.cos(a + 0.4), eY - 7 * Math.sin(a + 0.4))
        ctx.closePath()
        ctx.fillStyle = "#e74c3c"
        ctx.fill()
        ctx.fillStyle = "#e74c3c"
        ctx.fillText("V合", (eX + pos.x) / 2 + 8, (eY + pos.y) / 2 - 6)
      }
    },
  },

  // ── 9. 弹簧振子 ──
  "spring-mass": {
    drawExtra: (ctx, s, p, w2s) => {
      const massPos = w2s(s.x, GROUND_Y)
      const wallX = -p.initX - 0.8
      const wallPos = w2s(wallX, GROUND_Y)
      ctx.fillStyle = "#666"
      ctx.fillRect(wallPos.x - 3, wallPos.y - 16, 6, 32)
      ctx.strokeStyle = "#888"
      ctx.lineWidth = 1
      ctx.strokeRect(wallPos.x - 3, wallPos.y - 16, 6, 32)
      const dx = massPos.x - wallPos.x
      const segs = Math.max(8, Math.round(Math.abs(dx) / 6))
      const amp = Math.min(7, Math.abs(dx) / segs * 3)
      ctx.beginPath()
      ctx.moveTo(wallPos.x, wallPos.y)
      for (let i = 1; i <= segs; i++) {
        const t = i / segs
        ctx.lineTo(wallPos.x + dx * t, wallPos.y + (i % 2 === 0 ? -amp : amp))
      }
      ctx.lineTo(massPos.x - 12, massPos.y)
      ctx.strokeStyle = "#999"
      ctx.lineWidth = 1.8
      ctx.stroke()
    },
  },

  // ── 10. 粗糙面滑动 ──
  "friction-slide": {
    drawExtra: (ctx, s, p, w2s) => {
      const groundY = w2s(0, 0).y
      const cw = ctx.canvas.width / (window.devicePixelRatio || 1)
      for (let wx = 0; wx < 30; wx += 2.5) {
        const sx = w2s(wx, 0).x
        if (sx < -20 || sx > cw + 20) continue
        ctx.beginPath()
        ctx.moveTo(sx, groundY)
        ctx.lineTo(sx + 4, groundY - 5)
        ctx.strokeStyle = "rgba(0,0,0,0.08)"
        ctx.lineWidth = 0.8
        ctx.stroke()
      }
      ctx.fillStyle = "rgba(0,0,0,0.15)"
      ctx.font = "11px sans-serif"
      ctx.fillText(`μ = ${p.mu}`, w2s(0, 0).x + 4, groundY - 8)
    },
    drawObject: (ctx, s, p, w2s) => {
      const pos = w2s(s.x, 0)
      const w = 28, h = 18
      const x = pos.x - w / 2, y = pos.y - h
      ctx.fillStyle = "#e74c3c"
      ctx.fillRect(x, y, w, h)
      ctx.strokeStyle = "rgba(0,0,0,0.2)"
      ctx.lineWidth = 1.5
      ctx.strokeRect(x, y, w, h)
      ctx.strokeStyle = "rgba(0,0,0,0.12)"
      ctx.lineWidth = 0.6
      for (let i = 0; i < 3; i++) {
        const lx = x + 6 + i * 8
        ctx.beginPath()
        ctx.moveTo(lx, y + h - 4)
        ctx.lineTo(lx + 4, y + h - 8)
        ctx.stroke()
      }
    },
  },

  // ── 11. 空气阻力落体 ──
  "drag-fall": {
    drawExtra: (ctx, s, p, w2s) => {
      if (s.vy > 0.5) {
        const pos = w2s(0, s.y)
        const intensity = Math.min(s.vy / (p.mass * p.gravity / p.dragCoeff), 1)
        for (let i = 0; i < 3; i++) {
          const offset = (i - 1) * 14
          ctx.beginPath()
          ctx.moveTo(pos.x + offset - 8, pos.y + 6)
          ctx.quadraticCurveTo(pos.x + offset, pos.y + 20 + intensity * 15, pos.x + offset + 8, pos.y + 6)
          ctx.strokeStyle = `rgba(52, 152, 219, ${0.1 + intensity * 0.25})`
          ctx.lineWidth = 1.2
          ctx.stroke()
        }
        ctx.fillStyle = "rgba(0,0,0,0.2)"
        ctx.font = "11px sans-serif"
        ctx.fillText(`v收尾 = ${(p.mass * p.gravity / p.dragCoeff).toFixed(1)} m/s`, pos.x + 16, pos.y - 8)
      }
    },
  },

  // ── 12. 碰撞变形 ──
  "bounce-deformation": {
    drawObject: (ctx, s, p, w2s) => {
      const pos = w2s(0, s.y)
      const radius = 12
      const deform = s.deform
      ctx.beginPath()
      ctx.ellipse(pos.x, pos.y + deform * 0.3, radius + deform * 0.2, radius - deform * 0.4, 0, 0, Math.PI * 2)
      ctx.fillStyle = "#e74c3c"
      ctx.fill()
      ctx.strokeStyle = "rgba(0,0,0,0.2)"
      ctx.lineWidth = 1.5
      ctx.stroke()
      if (p.restitution === 0 && s.y <= GROUND_Y && Math.abs(s.vy) <= 0.3) {
        ctx.fillStyle = "rgba(0,0,0,0.1)"
        ctx.fillRect(pos.x - 16, pos.y - 1, 32, 2)
      }
      if (deform > 1) {
        ctx.fillStyle = "rgba(0,0,0,0.3)"
        ctx.font = "11px sans-serif"
        ctx.fillText(`e=${p.restitution.toFixed(2)}`, pos.x + 16, pos.y - 8)
      }
    },
    drawExtra: (ctx, s, p, w2s) => {
      if (s.bounceCount > 0) {
        const groundY = w2s(0, 0).y
        ctx.fillStyle = "rgba(0,0,0,0.08)"
        ctx.font = "12px sans-serif"
        for (let i = 1; i <= Math.min(s.bounceCount, 5); i++) {
          const h = p.height * Math.pow(p.restitution, 2 * i)
          if (h < 0.5) break
          const peakY = w2s(0, GROUND_Y + h).y
          ctx.beginPath()
          ctx.setLineDash([2, 3])
          ctx.moveTo(30, peakY)
          ctx.lineTo(90, peakY)
          ctx.strokeStyle = "rgba(0,0,0,0.1)"
          ctx.lineWidth = 0.8
          ctx.stroke()
          ctx.setLineDash([])
          ctx.fillText(`#${i} ${h.toFixed(1)}m`, 92, peakY + 3)
        }
      }
    },
  },

  // ── 13. 两球碰撞 ──
  "ball-collision": {
    drawObject: (ctx, s, p, w2s) => {
      const RADIUS_PX = 14
      const pos1 = w2s(s.x1, GROUND_Y)
      ctx.beginPath()
      ctx.arc(pos1.x, pos1.y, RADIUS_PX, 0, Math.PI * 2)
      const grad1 = ctx.createRadialGradient(pos1.x - 4, pos1.y - 4, 2, pos1.x, pos1.y, RADIUS_PX)
      grad1.addColorStop(0, '#4FC3F7')
      grad1.addColorStop(1, '#0288D1')
      ctx.fillStyle = grad1
      ctx.fill()
      ctx.strokeStyle = "rgba(0,0,0,0.2)"
      ctx.lineWidth = 1.5
      ctx.stroke()
      ctx.fillStyle = "#fff"
      ctx.font = "bold 12px sans-serif"
      ctx.textAlign = "center"
      ctx.fillText("1", pos1.x, pos1.y + 4)
      ctx.textAlign = "left"
      const pos2 = w2s(s.x2, GROUND_Y)
      ctx.beginPath()
      ctx.arc(pos2.x, pos2.y, RADIUS_PX, 0, Math.PI * 2)
      const grad2 = ctx.createRadialGradient(pos2.x - 4, pos2.y - 4, 2, pos2.x, pos2.y, RADIUS_PX)
      grad2.addColorStop(0, '#FFB74D')
      grad2.addColorStop(1, '#F57C00')
      ctx.fillStyle = grad2
      ctx.fill()
      ctx.strokeStyle = "rgba(0,0,0,0.2)"
      ctx.lineWidth = 1.5
      ctx.stroke()
      ctx.fillStyle = "#fff"
      ctx.font = "bold 12px sans-serif"
      ctx.textAlign = "center"
      ctx.fillText("2", pos2.x, pos2.y + 4)
      ctx.textAlign = "left"
    },
    drawExtra: (ctx, s, p, w2s, getTheme) => {
      const RADIUS_PX = 14
      ctx.globalAlpha = 0.5
      for (let i = 1; i < s.trail2.length; i++) {
        const p1 = w2s(s.trail2[i - 1].x, s.trail2[i - 1].y)
        const p2 = w2s(s.trail2[i].x, s.trail2[i].y)
        ctx.beginPath()
        ctx.moveTo(p1.x, p1.y)
        ctx.lineTo(p2.x, p2.y)
        ctx.strokeStyle = "rgba(245, 124, 0, 0.35)"
        ctx.lineWidth = 2
        ctx.stroke()
      }
      ctx.globalAlpha = 1.0
      const drawArrow = (pos, v, color) => {
        const len = Math.min(Math.abs(v) * 10, 70)
        if (len < 5) return
        const dir = v > 0 ? 1 : -1
        ctx.beginPath()
        ctx.moveTo(pos.x, pos.y - RADIUS_PX - 4)
        ctx.lineTo(pos.x + dir * len, pos.y - RADIUS_PX - 4)
        ctx.strokeStyle = color
        ctx.lineWidth = 2.5
        ctx.stroke()
        ctx.beginPath()
        ctx.moveTo(pos.x + dir * len, pos.y - RADIUS_PX - 4)
        ctx.lineTo(pos.x + dir * (len - 8), pos.y - RADIUS_PX - 8)
        ctx.lineTo(pos.x + dir * (len - 8), pos.y - RADIUS_PX)
        ctx.closePath()
        ctx.fillStyle = color
        ctx.fill()
        ctx.fillStyle = color
        ctx.font = "bold 11px sans-serif"
        ctx.textAlign = "center"
        ctx.fillText("v", pos.x + dir * len * 0.5, pos.y - RADIUS_PX - 10)
        ctx.textAlign = "left"
      }
      drawArrow(w2s(s.x1, GROUND_Y), s.v1, "#0288D1")
      drawArrow(w2s(s.x2, GROUND_Y), s.v2, "#F57C00")
      if (s.collided) {
        const midPx = w2s((s.x1 + s.x2) / 2, GROUND_Y)
        const elapsed = s.collisionTime
        const alpha = Math.max(0, 0.6 - elapsed * 2)
        if (alpha > 0) {
          ctx.beginPath()
          ctx.arc(midPx.x, midPx.y, 24 + elapsed * 20, 0, Math.PI * 2)
          ctx.strokeStyle = `rgba(230, 126, 34, ${alpha})`
          ctx.lineWidth = 2.5
          ctx.setLineDash([4, 4])
          ctx.stroke()
          ctx.setLineDash([])
          ctx.fillStyle = `rgba(230, 126, 34, ${alpha})`
          ctx.font = "bold 14px sans-serif"
          ctx.textAlign = "center"
          ctx.fillText("碰撞!", midPx.x, midPx.y - 36)
          ctx.textAlign = "left"
        }
        // ── 碰撞数据表格 ──
        if (s._preV1 !== null) {
          const cw = ctx.canvas.width / (window.devicePixelRatio || 1)
          const ch = ctx.canvas.height / (window.devicePixelRatio || 1)
          // 表格位置：画布右侧居中
          const colW = [80, 75, 75, 75, 75]
          const rowH = 26
          const headers = ['物理量', '球1 碰撞前', '球1 碰撞后', '球2 碰撞前', '球2 碰撞后']
          const tableW = colW.reduce((a, b) => a + b, 0)
          const tableH = rowH * 6 + 4
          const tx = cw - tableW - 20
          const ty = ch - tableH - 20

          // 表格背景
          ctx.save()
          ctx.beginPath()
          ctx.moveTo(tx + 6, ty)
          ctx.lineTo(tx + tableW - 6, ty)
          ctx.arcTo(tx + tableW, ty, tx + tableW, ty + 6, 6)
          ctx.lineTo(tx + tableW, ty + tableH - 6)
          ctx.arcTo(tx + tableW, ty + tableH, tx + tableW - 6, ty + tableH, 6)
          ctx.lineTo(tx + 6, ty + tableH)
          ctx.arcTo(tx, ty + tableH, tx, ty + tableH - 6, 6)
          ctx.lineTo(tx, ty + 6)
          ctx.arcTo(tx, ty, tx + 6, ty, 6)
          ctx.closePath()
          ctx.fillStyle = getTheme && getTheme() === "dark" ? "rgba(30,30,30,0.92)" : "rgba(255,255,255,0.95)"
          ctx.fill()
          ctx.strokeStyle = getTheme && getTheme() === "dark" ? "rgba(100,100,100,0.6)" : "rgba(0,0,0,0.12)"
          ctx.lineWidth = 1
          ctx.stroke()

          // 表头
          ctx.font = "bold 11px sans-serif"
          ctx.fillStyle = getTheme && getTheme() === "dark" ? "rgba(52, 152, 219, 0.3)" : "rgba(52, 152, 219, 0.12)"
          ctx.fillRect(tx, ty, tableW, rowH)
          ctx.fillStyle = getTheme && getTheme() === "dark" ? "#ddd" : "#2c3e50"
          let cx = tx
          headers.forEach((h, i) => {
            ctx.textAlign = "center"
            ctx.fillText(h, cx + colW[i] / 2, ty + 17)
            cx += colW[i]
          })

          // 数据行
          const rows = [
            ['质量 (kg)', `${p.m1.toFixed(1)}`, `${p.m1.toFixed(1)}`, `${p.m2.toFixed(1)}`, `${p.m2.toFixed(1)}`],
            ['速度 (m/s)', `${s._preV1.toFixed(2)}`, `${s._postV1.toFixed(2)}`, `${s._preV2.toFixed(2)}`, `${s._postV2.toFixed(2)}`],
            ['动量 (kg·m/s)', `${(p.m1 * s._preV1).toFixed(2)}`, `${(p.m1 * s._postV1).toFixed(2)}`, `${(p.m2 * s._preV2).toFixed(2)}`, `${(p.m2 * s._postV2).toFixed(2)}`],
            ['动能 (J)', `${(0.5 * p.m1 * s._preV1 ** 2).toFixed(2)}`, `${(0.5 * p.m1 * s._postV1 ** 2).toFixed(2)}`, `${(0.5 * p.m2 * s._preV2 ** 2).toFixed(2)}`, `${(0.5 * p.m2 * s._postV2 ** 2).toFixed(2)}`],
            ['总动量', '碰撞前:', `${(p.m1 * s._preV1 + p.m2 * s._preV2).toFixed(2)}`, '碰撞后:', `${(p.m1 * s._postV1 + p.m2 * s._postV2).toFixed(2)}`],
          ]
          rows.forEach((row, ri) => {
            const ry = ty + rowH + ri * rowH
            // 交替行背景
            if (ri % 2 === 0) {
              ctx.fillStyle = getTheme && getTheme() === "dark" ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)"
              ctx.fillRect(tx, ry, tableW, rowH)
            }
            ctx.fillStyle = getTheme && getTheme() === "dark" ? "#ccc" : "#333"
            ctx.font = "11px sans-serif"
            let cx2 = tx
            row.forEach((cell, ci) => {
              ctx.textAlign = ci === 0 ? "left" : "center"
              ctx.fillText(cell, ci === 0 ? cx2 + 6 : cx2 + colW[ci] / 2, ry + 17)
              cx2 += colW[ci]
            })
          })

          // 表格标题
          ctx.font = "bold 12px sans-serif"
          ctx.fillStyle = "#e67e22"
          ctx.textAlign = "left"
          ctx.fillText("碰撞数据分析", tx, ty - 6)

          ctx.textAlign = "left"
          ctx.restore()
        }
      }
    },
  },

  // ── 14. 连接体 ──
  "connected-bodies": {
    drawObject: (ctx, s, p, w2s) => {
      const TABLE_H = 5, TABLE_W = 8
      const d = s.d
      const m1_hw = 0.45, m1_hh = 0.3
      const m2_r = 0.38
      const m1_start = -TABLE_W + m1_hw
      const m1_end = -m1_hw
      const m1_x = Math.max(m1_start, Math.min(m1_start + d, m1_end))
      const PULLEY_CENTER_Y = TABLE_H + m1_hh
      const PULLEY_OFFSET_X = 1.0
      const m2_y = Math.max(PULLEY_CENTER_Y - m2_r - d, GROUND_Y)
      const m2_x = PULLEY_OFFSET_X
      const ch = ctx.canvas.height / (window.devicePixelRatio || 1)
      const tL = w2s(-TABLE_W, 0), tR = w2s(0, 0), tT = w2s(-TABLE_W, TABLE_H)
      const tGrad = ctx.createLinearGradient(tL.x, tT.y, tL.x, tL.y)
      tGrad.addColorStop(0, "#b8956a")
      tGrad.addColorStop(0.12, "#d4b88c")
      tGrad.addColorStop(0.5, "#c4a67a")
      tGrad.addColorStop(1, "#8B7355")
      ctx.fillStyle = tGrad
      ctx.fillRect(tL.x, tT.y, tR.x - tL.x, tR.y - tT.y)
      ctx.fillStyle = "#e0c8a0"
      ctx.fillRect(tL.x, tT.y - 3, tR.x - tL.x, 5)
      ctx.fillStyle = "rgba(0,0,0,0.07)"
      ctx.fillRect(tL.x, tL.y - 2, tR.x - tL.x, 2)
      ctx.fillStyle = "#6b5b45"
      for (const lx of [-TABLE_W + 0.4, -0.4]) {
        const leg = w2s(lx, 0)
        ctx.fillRect(leg.x - 3, leg.y, 6, ch - leg.y)
        ctx.fillRect(leg.x - 5, leg.y + (ch - leg.y) - 6, 10, 6)
      }
      const PULLEY_RADIUS_PX = 8
      const pulleyPos = w2s(PULLEY_OFFSET_X, PULLEY_CENTER_Y)
      const tableTopRight = w2s(0, TABLE_H)
      const m1 = w2s(m1_x, TABLE_H + m1_hh)
      const m2 = w2s(m2_x, m2_y)
      ctx.lineCap = "round"
      ctx.strokeStyle = "#c4956a"
      ctx.lineWidth = 2.5
      ctx.beginPath()
      ctx.moveTo(pulleyPos.x, m1.y)
      ctx.lineTo(m1.x, m1.y)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(pulleyPos.x, pulleyPos.y + PULLEY_RADIUS_PX)
      ctx.lineTo(m2.x, m2.y)
      ctx.stroke()
      ctx.lineCap = "butt"
      ctx.strokeStyle = "#666"
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.moveTo(tableTopRight.x, tableTopRight.y)
      ctx.lineTo(pulleyPos.x, pulleyPos.y)
      ctx.stroke()
      ctx.fillStyle = "#777"
      ctx.fillRect(pulleyPos.x - 11, pulleyPos.y - 4, 22, 4)
      ctx.beginPath()
      ctx.arc(pulleyPos.x, pulleyPos.y, PULLEY_RADIUS_PX, 0, Math.PI * 2)
      ctx.fillStyle = "#555"
      ctx.fill()
      ctx.strokeStyle = "#444"
      ctx.lineWidth = 1.5
      ctx.stroke()
      ctx.beginPath()
      ctx.arc(pulleyPos.x, pulleyPos.y, 3.5, 0, Math.PI * 2)
      ctx.fillStyle = "#333"
      ctx.fill()
      const m1W = m1_hw * 2 * DRAW_SCALE, m1H = m1_hh * 2 * DRAW_SCALE
      const m1X = m1.x - m1_hw * DRAW_SCALE, m1Y = m1.y - m1_hh * DRAW_SCALE
      ctx.fillStyle = "rgba(0,0,0,0.1)"
      ctx.fillRect(m1X + 3, m1Y + 3, m1W, m1H)
      const m1Grad = ctx.createLinearGradient(m1X, m1Y, m1X, m1Y + m1H)
      m1Grad.addColorStop(0, "#5dade2")
      m1Grad.addColorStop(1, "#2980b9")
      ctx.fillStyle = m1Grad
      ctx.fillRect(m1X, m1Y, m1W, m1H)
      ctx.strokeStyle = "rgba(0,0,0,0.25)"
      ctx.lineWidth = 1.5
      ctx.strokeRect(m1X, m1Y, m1W, m1H)
      ctx.fillStyle = "#fff"
      ctx.font = "bold 12px sans-serif"
      ctx.textAlign = "center"
      ctx.fillText("m₁", m1.x, m1.y + 4)
      ctx.textAlign = "left"
      const m2R = m2_r * DRAW_SCALE
      ctx.beginPath()
      ctx.ellipse(m2.x + 3, m2.y + m2R * 0.3, m2R * 0.8, m2R * 0.2, 0, 0, Math.PI * 2)
      ctx.fillStyle = "rgba(0,0,0,0.08)"
      ctx.fill()
      ctx.beginPath()
      ctx.arc(m2.x, m2.y, m2R, 0, Math.PI * 2)
      const m2Grad = ctx.createRadialGradient(m2.x - 5, m2.y - 4, 2, m2.x, m2.y, m2R)
      m2Grad.addColorStop(0, "#f1948a")
      m2Grad.addColorStop(0.4, "#ec7063")
      m2Grad.addColorStop(1, "#c0392b")
      ctx.fillStyle = m2Grad
      ctx.fill()
      ctx.strokeStyle = "rgba(0,0,0,0.2)"
      ctx.lineWidth = 1.5
      ctx.stroke()
      ctx.fillStyle = "#fff"
      ctx.font = "bold 12px sans-serif"
      ctx.textAlign = "center"
      ctx.fillText("m₂", m2.x, m2.y + 4)
      ctx.textAlign = "left"
      if (s.v > 0.05) {
        const vLen = Math.min(s.v * 3, 60)
        const ax1 = m1.x + m1_hw * DRAW_SCALE + 4
        ctx.beginPath()
        ctx.moveTo(ax1, m1.y)
        ctx.lineTo(ax1 + vLen, m1.y)
        ctx.strokeStyle = "#e67e22"
        ctx.lineWidth = 2.5
        ctx.stroke()
        ctx.beginPath()
        ctx.moveTo(ax1 + vLen, m1.y)
        ctx.lineTo(ax1 + vLen - 8, m1.y - 4)
        ctx.lineTo(ax1 + vLen - 8, m1.y + 4)
        ctx.closePath()
        ctx.fillStyle = "#e67e22"
        ctx.fill()
        ctx.fillStyle = "#e67e22"
        ctx.font = "bold 11px sans-serif"
        ctx.textAlign = "center"
        ctx.fillText("v", ax1 + vLen * 0.5, m1.y - 8)
        const ax2 = m2.x + m2R + 6
        ctx.beginPath()
        ctx.moveTo(ax2, m2.y)
        ctx.lineTo(ax2, m2.y + vLen)
        ctx.strokeStyle = "#e67e22"
        ctx.lineWidth = 2.5
        ctx.stroke()
        ctx.beginPath()
        ctx.moveTo(ax2, m2.y + vLen)
        ctx.lineTo(ax2 - 4, m2.y + vLen - 8)
        ctx.lineTo(ax2 + 4, m2.y + vLen - 8)
        ctx.closePath()
        ctx.fillStyle = "#e67e22"
        ctx.fill()
        ctx.fillStyle = "#e67e22"
        ctx.fillText("v", ax2 + 10, m2.y + vLen * 0.5)
        ctx.textAlign = "left"
      }
    },
  },

  // ── 15. 传送带 ──
  "conveyor-belt": {
    drawObject: (ctx, s, p, w2s) => {
      const beltLen = p.beltLength
      const beltH = 0.3, blockH = 0.7, blockW = 0.7
      const beltLeft = w2s(-1, 0), beltRight = w2s(beltLen + 1, 0), beltBot = w2s(0, -beltH - 0.5)
      ctx.fillStyle = "#d5dbe0"
      ctx.fillRect(beltLeft.x, beltLeft.y, beltRight.x - beltLeft.x, beltBot.y - beltLeft.y)
      const beltSurface = w2s(0, 0), beltBottom = w2s(0, -beltH)
      ctx.fillStyle = "#555"
      ctx.fillRect(beltLeft.x, beltSurface.y, beltRight.x - beltLeft.x, beltBottom.y - beltSurface.y)
      for (const rx of [-0.5, beltLen + 0.5]) {
        const rp = w2s(rx, -beltH / 2)
        ctx.beginPath()
        ctx.arc(rp.x, rp.y, 12, 0, Math.PI * 2)
        ctx.fillStyle = "#7f8c8d"
        ctx.fill()
        ctx.strokeStyle = "#444"
        ctx.lineWidth = 1.5
        ctx.stroke()
        ctx.beginPath()
        ctx.arc(rp.x, rp.y, 5, 0, Math.PI * 2)
        ctx.fillStyle = "#444"
        ctx.fill()
      }
      ctx.strokeStyle = "rgba(255,255,255,0.15)"
      ctx.lineWidth = 1
      for (let wx = 0; wx < beltLen; wx += 1.2) {
        const px = w2s(wx, 0).x
        ctx.beginPath()
        ctx.moveTo(px, beltSurface.y)
        ctx.lineTo(px + 4, beltBottom.y)
        ctx.stroke()
      }
      if (Math.abs(p.beltSpeed) > 0.1) {
        const arrowPos = w2s(0, 0.15)
        const midX = (beltLeft.x + beltRight.x) / 2
        const aLen = 30, dir = Math.sign(p.beltSpeed)
        ctx.beginPath()
        ctx.moveTo(midX - aLen * dir, arrowPos.y)
        ctx.lineTo(midX + aLen * dir, arrowPos.y)
        ctx.strokeStyle = "rgba(52, 152, 219, 0.4)"
        ctx.lineWidth = 2
        ctx.stroke()
        ctx.beginPath()
        ctx.moveTo(midX + aLen * dir, arrowPos.y)
        ctx.lineTo(midX + aLen * dir - 8 * dir, arrowPos.y - 4)
        ctx.lineTo(midX + aLen * dir - 8 * dir, arrowPos.y + 4)
        ctx.closePath()
        ctx.fillStyle = "rgba(52, 152, 219, 0.4)"
        ctx.fill()
      }
      const blockWorldX = Math.max(0, Math.min(s.x, beltLen))
      const blkBottom = w2s(blockWorldX, 0)
      const blkScreenW = blockW * DRAW_SCALE, blkScreenH = blockH * DRAW_SCALE
      ctx.fillStyle = "#e74c3c"
      ctx.fillRect(blkBottom.x - blkScreenW / 2, blkBottom.y - blkScreenH, blkScreenW, blkScreenH)
      ctx.strokeStyle = "rgba(0,0,0,0.2)"
      ctx.lineWidth = 1.5
      ctx.strokeRect(blkBottom.x - blkScreenW / 2, blkBottom.y - blkScreenH, blkScreenW, blkScreenH)
      if (Math.abs(s.v) > 0.05) {
        const vLen = Math.min(Math.abs(s.v) * 3, 60)
        const vDir = s.v >= 0 ? 1 : -1
        const arrowX = blkBottom.x + blkScreenW / 2 + 4
        const arrowY = blkBottom.y - blkScreenH / 2
        ctx.beginPath()
        ctx.moveTo(arrowX, arrowY)
        ctx.lineTo(arrowX + vLen * vDir, arrowY)
        ctx.strokeStyle = "#e67e22"
        ctx.lineWidth = 2.5
        ctx.stroke()
        ctx.beginPath()
        ctx.moveTo(arrowX + vLen * vDir, arrowY)
        ctx.lineTo(arrowX + vLen * vDir - 8 * vDir, arrowY - 4)
        ctx.lineTo(arrowX + vLen * vDir - 8 * vDir, arrowY + 4)
        ctx.closePath()
        ctx.fillStyle = "#e67e22"
        ctx.fill()
        ctx.fillStyle = "#e67e22"
        ctx.font = "bold 11px sans-serif"
        ctx.fillText("v", arrowX + vLen * vDir * 0.5 - 4, arrowY - 8)
      }
    },
  },

  // ── 16. 板块模型 ──
  "block-board": {
    drawExtra: (ctx, s, p, w2s) => {
      if (!s.trailB || s.trailB.length < 2) return
      ctx.globalAlpha = 0.45
      for (let i = 1; i < s.trailB.length; i++) {
        const p1 = w2s(s.trailB[i - 1].x, s.trailB[i - 1].y)
        const p2 = w2s(s.trailB[i].x, s.trailB[i].y)
        ctx.beginPath()
        ctx.moveTo(p1.x, p1.y)
        ctx.lineTo(p2.x, p2.y)
        ctx.strokeStyle = "rgba(108, 122, 137, 0.5)"
        ctx.lineWidth = 2
        ctx.setLineDash([6, 4])
        ctx.stroke()
        ctx.setLineDash([])
      }
      ctx.globalAlpha = 1.0
    },
    drawObject: (ctx, s, p, w2s) => {
      const boardH = 0.5, blockH = 0.6, blockW = 1.0
      const boardBottomLeft = w2s(s.xB, 0), boardBottomRight = w2s(s.xB + p.boardLength, 0)
      const boardScreenW = boardBottomRight.x - boardBottomLeft.x
      const boardScreenH = boardH * DRAW_SCALE
      ctx.fillStyle = "#6c7a89"
      ctx.fillRect(boardBottomLeft.x, boardBottomLeft.y - boardScreenH, boardScreenW, boardScreenH)
      ctx.strokeStyle = "rgba(0,0,0,0.2)"
      ctx.lineWidth = 1.5
      ctx.strokeRect(boardBottomLeft.x, boardBottomLeft.y - boardScreenH, boardScreenW, boardScreenH)
      ctx.fillStyle = "#fff"
      ctx.font = "bold 12px sans-serif"
      ctx.textAlign = "center"
      ctx.fillText("M", boardBottomLeft.x + boardScreenW / 2, boardBottomLeft.y - boardScreenH / 2 + 4)
      ctx.textAlign = "left"
      const blockBottom = w2s(s.xb, boardH + 0.01)
      const blkScreenW = blockW * DRAW_SCALE, blkScreenH = blockH * DRAW_SCALE
      ctx.fillStyle = "#e74c3c"
      ctx.fillRect(blockBottom.x - blkScreenW / 2, blockBottom.y - blkScreenH, blkScreenW, blkScreenH)
      ctx.strokeStyle = "rgba(0,0,0,0.25)"
      ctx.lineWidth = 1.5
      ctx.strokeRect(blockBottom.x - blkScreenW / 2, blockBottom.y - blkScreenH, blkScreenW, blkScreenH)
      ctx.fillStyle = "#fff"
      ctx.font = "bold 12px sans-serif"
      ctx.textAlign = "center"
      ctx.fillText("m", blockBottom.x, blockBottom.y - blkScreenH / 2 + 4)
      ctx.textAlign = "left"
      if (Math.abs(s.vb) > 0.05) {
        const vLen = Math.min(Math.abs(s.vb) * 3, 60)
        const dir = s.vb > 0 ? 1 : -1
        const ax = blockBottom.x + blkScreenW / 2 + 4, ay = blockBottom.y - blkScreenH / 2
        ctx.beginPath()
        ctx.moveTo(ax, ay)
        ctx.lineTo(ax + vLen * dir, ay)
        ctx.strokeStyle = "#e67e22"
        ctx.lineWidth = 2.5
        ctx.stroke()
        ctx.beginPath()
        ctx.moveTo(ax + vLen * dir, ay)
        ctx.lineTo(ax + vLen * dir - 7 * dir, ay - 4)
        ctx.lineTo(ax + vLen * dir - 7 * dir, ay + 4)
        ctx.closePath()
        ctx.fillStyle = "#e67e22"
        ctx.fill()
        ctx.fillStyle = "#e67e22"
        ctx.font = "bold 11px sans-serif"
        ctx.textAlign = "center"
        ctx.fillText("v块", ax + vLen * dir * 0.5, ay - 8)
        ctx.textAlign = "left"
      }
      if (Math.abs(s.vB) > 0.05) {
        const vLen = Math.min(Math.abs(s.vB) * 3, 60)
        const dir = s.vB > 0 ? 1 : -1
        const ax = boardBottomRight.x + 4, ay = boardBottomRight.y - boardScreenH / 2
        ctx.beginPath()
        ctx.moveTo(ax, ay)
        ctx.lineTo(ax + vLen * dir, ay)
        ctx.strokeStyle = "#3498db"
        ctx.lineWidth = 2.5
        ctx.stroke()
        ctx.beginPath()
        ctx.moveTo(ax + vLen * dir, ay)
        ctx.lineTo(ax + vLen * dir - 7 * dir, ay - 4)
        ctx.lineTo(ax + vLen * dir - 7 * dir, ay + 4)
        ctx.closePath()
        ctx.fillStyle = "#3498db"
        ctx.fill()
        ctx.fillStyle = "#3498db"
        ctx.font = "bold 11px sans-serif"
        ctx.textAlign = "center"
        ctx.fillText("v板", ax + vLen * dir * 0.5, ay - 8)
        ctx.textAlign = "left"
      }
    },
  },

  // ── 17. 杠杆 ──
  "lever": {
    drawExtra: (ctx, state, params, w2s) => {
      const pivotW = { x: 0, y: 1.2 }
      const pivotS = w2s(pivotW.x, pivotW.y)
      const halfLen = 5 // 杠杆半长 5m
      const barLen = halfLen * DRAW_SCALE

      ctx.save()
      ctx.translate(pivotS.x, pivotS.y)
      ctx.rotate(state.angle) // 正角度 = 顺时针（右侧下沉）

      // 杠杆杆身
      ctx.beginPath()
      ctx.moveTo(-barLen, 0)
      ctx.lineTo(barLen, 0)
      ctx.strokeStyle = "#2c3e50"
      ctx.lineWidth = 6
      ctx.lineCap = "round"
      ctx.stroke()

      // 刻度线
      ctx.strokeStyle = "rgba(0,0,0,0.15)"
      ctx.lineWidth = 1
      for (let i = -5; i <= 5; i++) {
        if (i === 0) continue
        const sx = i * DRAW_SCALE
        ctx.beginPath()
        ctx.moveTo(sx, -6)
        ctx.lineTo(sx, 6)
        ctx.stroke()
      }

      // 力箭头（在杠杆坐标系中，向下 = 屏幕 y 正方向）
      function drawForceArrow(dist, force, dir, color) {
        if (force <= 0) return
        const sx = dist * DRAW_SCALE
        const arrowLen = force * 6 // 1N = 6px
        const startY = dir > 0 ? 8 : -8
        const endY = dir > 0 ? 8 + arrowLen : -8 - arrowLen
        ctx.beginPath()
        ctx.moveTo(sx, startY)
        ctx.lineTo(sx, endY)
        ctx.strokeStyle = color
        ctx.lineWidth = 3
        ctx.lineCap = "round"
        ctx.stroke()
        // 箭头头部
        const tipY = endY
        const baseY = dir > 0 ? tipY - 6 : tipY + 6
        ctx.beginPath()
        ctx.moveTo(sx - 5, baseY)
        ctx.lineTo(sx, tipY)
        ctx.lineTo(sx + 5, baseY)
        ctx.fillStyle = color
        ctx.fill()
        // 力的标签
        ctx.font = "bold 11px sans-serif"
        ctx.fillStyle = color
        ctx.textAlign = "center"
        const labelY = dir > 0 ? endY + 14 : endY - 8
        ctx.fillText(`${force}N`, sx, labelY)
      }

      const dir1 = params.dir1 || 1
      const dir2 = params.dir2 || 1
      drawForceArrow(-params.d1, params.F1, dir1, "#e74c3c")  // 左侧红色
      drawForceArrow(params.d2, params.F2, dir2, "#3498db")    // 右侧蓝色

      ctx.restore()

      // 支点三角形（不随杠杆旋转）
      const triH = 18
      const triW = 14
      ctx.beginPath()
      ctx.moveTo(pivotS.x, pivotS.y)
      ctx.lineTo(pivotS.x - triW, pivotS.y + triH)
      ctx.lineTo(pivotS.x + triW, pivotS.y + triH)
      ctx.closePath()
      ctx.fillStyle = "#7f8c8d"
      ctx.fill()

      // 距离标注（在支点下方）
      ctx.font = "11px sans-serif"
      ctx.fillStyle = "#999"
      ctx.textAlign = "center"
      ctx.fillText(`L₁=${params.d1}m`, pivotS.x - params.d1 * DRAW_SCALE * 0.5, pivotS.y + 38)
      ctx.fillText(`L₂=${params.d2}m`, pivotS.x + params.d2 * DRAW_SCALE * 0.5, pivotS.y + 38)

      // 力矩对比
      const tau1 = params.F1 * params.d1
      const tau2 = params.F2 * params.d2
      ctx.font = "bold 12px sans-serif"
      ctx.fillStyle = "#e74c3c"
      ctx.fillText(`τ₁=${tau1.toFixed(1)}`, pivotS.x - barLen * 0.6, pivotS.y - 18)
      ctx.fillStyle = "#3498db"
      ctx.fillText(`τ₂=${tau2.toFixed(1)}`, pivotS.x + barLen * 0.6, pivotS.y - 18)
      ctx.textAlign = "left"
    },
  },

  // ── 18. 定滑轮 ──
  "pulley": {
    drawObject: () => {},  // 禁用默认球，由 drawExtra 自绘方块
    drawExtra: (ctx, state, params, w2s, getTheme) => {
      const H = params.pulleyH || 5
      const pulleyS = w2s(0, H)
      const pr = 14
      const isDark = getTheme && getTheme() === "dark"

      // 颜色主题
      const colors = {
        bracket: isDark ? "#666" : "#7f8c8d",
        rope: isDark ? "#8899aa" : "#2c3e50",
        wheelStroke: isDark ? "#8899aa" : "#2c3e50",
        wheelFill: isDark ? "#3a3a3a" : "#fff",
        axle: isDark ? "#8899aa" : "#7f8c8d",
        loadFill: "#e74c3c",
        loadStroke: "#c0392b",
        loadText: "#fff",
        handFill: "#3498db",
        handStroke: "#2980b9",
        handText: "#fff",
        forceColor: "#3498db",
        gravityColor: "#e67e22",
      }

      // 重物位置（左侧）
      const loadS = w2s(-0.6, state.y)
      // 拉力侧位置（右侧，随重物反向移动）
      const effortS = w2s(0.6, state.effortY)

      // 支架
      ctx.strokeStyle = colors.bracket
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.moveTo(pulleyS.x, pulleyS.y - pr)
      ctx.lineTo(pulleyS.x, pulleyS.y - pr - 25)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(pulleyS.x - 20, pulleyS.y - pr - 25)
      ctx.lineTo(pulleyS.x + 20, pulleyS.y - pr - 25)
      ctx.stroke()

      // ── 绳子路径（绕过定滑轮顶部）──
      ctx.strokeStyle = colors.rope
      ctx.lineWidth = 2

      // 弧：绕过定滑轮顶部（π → 0 逆时针 = 顶部，绳子从左上到右下）
      ctx.beginPath()
      ctx.arc(pulleyS.x, pulleyS.y, pr, Math.PI, 0, true)
      ctx.stroke()

      // 左侧绳子（滑轮 → 重物）
      ctx.beginPath()
      ctx.moveTo(pulleyS.x - pr, pulleyS.y)
      ctx.lineTo(loadS.x, loadS.y - 16)
      ctx.stroke()

      // 右侧绳子（拉力侧 → 滑轮）
      ctx.beginPath()
      ctx.moveTo(effortS.x, effortS.y)
      ctx.lineTo(pulleyS.x + pr, pulleyS.y)
      ctx.stroke()

      // 滑轮轮子（画在绳子上方）
      ctx.beginPath()
      ctx.arc(pulleyS.x, pulleyS.y, pr, 0, Math.PI * 2)
      ctx.strokeStyle = colors.wheelStroke
      ctx.lineWidth = 3
      ctx.stroke()
      ctx.fillStyle = colors.wheelFill
      ctx.fill()
      ctx.beginPath()
      ctx.arc(pulleyS.x, pulleyS.y, 3, 0, Math.PI * 2)
      ctx.fillStyle = colors.axle
      ctx.fill()

      // 重物
      const boxW = 26, boxH = 22
      ctx.fillStyle = colors.loadFill
      ctx.fillRect(loadS.x - boxW / 2, loadS.y - boxH / 2, boxW, boxH)
      ctx.strokeStyle = colors.loadStroke
      ctx.lineWidth = 1.5
      ctx.strokeRect(loadS.x - boxW / 2, loadS.y - boxH / 2, boxW, boxH)
      ctx.fillStyle = colors.loadText
      ctx.font = "bold 10px sans-serif"
      ctx.textAlign = "center"
      ctx.fillText(`${params.mass}kg`, loadS.x, loadS.y + 4)

      // 拉力侧（手 + 向下拉的箭头）
      // 手的位置圆圈
      ctx.beginPath()
      ctx.arc(effortS.x, effortS.y, 8, 0, Math.PI * 2)
      ctx.fillStyle = colors.handFill
      ctx.fill()
      ctx.strokeStyle = colors.handStroke
      ctx.lineWidth = 1.5
      ctx.stroke()
      ctx.fillStyle = colors.handText
      ctx.font = "bold 9px sans-serif"
      ctx.fillText("手", effortS.x, effortS.y + 3)

      // 向下拉的箭头
      const arrowLen = Math.min(params.pullForce * 1.2, 60)
      ctx.strokeStyle = colors.forceColor
      ctx.lineWidth = 2.5
      ctx.lineCap = "round"
      ctx.beginPath()
      ctx.moveTo(effortS.x, effortS.y + 10)
      ctx.lineTo(effortS.x, effortS.y + 10 + arrowLen)
      ctx.stroke()
      ctx.fillStyle = colors.forceColor
      ctx.beginPath()
      ctx.moveTo(effortS.x - 5, effortS.y + 10 + arrowLen - 6)
      ctx.lineTo(effortS.x, effortS.y + 10 + arrowLen)
      ctx.lineTo(effortS.x + 5, effortS.y + 10 + arrowLen - 6)
      ctx.fill()
      ctx.font = "bold 11px sans-serif"
      ctx.fillText(`F=${params.pullForce}N`, effortS.x, effortS.y + 10 + arrowLen + 14)

      // 重力箭头
      const gLen = Math.min(params.mass * params.gravity * 1.5, 60)
      ctx.strokeStyle = colors.gravityColor
      ctx.lineWidth = 2.5
      ctx.beginPath()
      ctx.moveTo(loadS.x, loadS.y + boxH / 2)
      ctx.lineTo(loadS.x, loadS.y + boxH / 2 + gLen)
      ctx.stroke()
      ctx.fillStyle = colors.gravityColor
      ctx.beginPath()
      ctx.moveTo(loadS.x - 4, loadS.y + boxH / 2 + gLen - 5)
      ctx.lineTo(loadS.x, loadS.y + boxH / 2 + gLen)
      ctx.lineTo(loadS.x + 4, loadS.y + boxH / 2 + gLen - 5)
      ctx.fill()
      ctx.font = "10px sans-serif"
      ctx.fillText(`mg=${(params.mass * params.gravity).toFixed(1)}N`, loadS.x, loadS.y + boxH / 2 + gLen + 12)

      ctx.textAlign = "left"
    },
  },

  // ── 动滑轮 ──
  // 布局：左锚点 → 绳子下到动滑轮（绕过底部）→ 滑块在滑轮正下方 → 右侧绳子向上到手
  "movable-pulley": {
    drawObject: () => {},
    drawExtra: (ctx, state, params, w2s, getTheme) => {
      const H = params.ceilingH || 5
      const pr = 14
      const isDark = getTheme && getTheme() === "dark"

      // 锚点在左天花板
      const anchorS = w2s(-1.5, H)
      // 动滑轮：重物上方 1.0m（短挂钩连接）
      const pulleyS = w2s(-1.0, state.y + 1.0)
      // 重物：滑轮正下方
      const loadS = w2s(-1.0, state.y)
      // 手：滑轮上方（绳长守恒）
      const effortS = w2s(-0.5, state.effortY)

      // 颜色主题
      const colors = {
        ceiling: isDark ? "#555" : "#8e9eab",
        anchor: isDark ? "#aaa" : "#555",
        rope: isDark ? "#8899aa" : "#5d6d7e",
        wheelStroke: isDark ? "#8899aa" : "#2c3e50",
        wheelFill: isDark ? "#3a3a3a" : "#ecf0f1",
        axle: isDark ? "#8899aa" : "#7f8c8d",
        hook: isDark ? "#8899aa" : "#7f8c8d",
        loadFill: "#e74c3c",
        loadStroke: "#c0392b",
        loadText: "#fff",
        handFill: "#3498db",
        handStroke: "#2980b9",
        handText: "#fff",
        forceColor: "#3498db",
        gravityColor: "#e67e22",
      }

      // 天花板
      ctx.strokeStyle = colors.ceiling
      ctx.lineWidth = 4
      ctx.beginPath()
      ctx.moveTo(anchorS.x - 10, anchorS.y)
      ctx.lineTo(effortS.x, anchorS.y)
      ctx.stroke()

      // 锚点标记
      ctx.fillStyle = colors.anchor
      ctx.beginPath()
      ctx.arc(anchorS.x, anchorS.y, 4, 0, Math.PI * 2)
      ctx.fill()

      // ── 绳子路径 ──
      ctx.strokeStyle = colors.rope
      ctx.lineWidth = 2

      // 根据手在滑轮的上/下选择绳弧方向
      // 手在上方：绳子从锚点↓→底部半圆→↑到手（包裹底部）
      // 手在下方：绳子从锚点↓→顶部半圆→↓到手（搭在顶部）
      const handAbovePulley = effortS.y < pulleyS.y - 2
      ctx.beginPath()
      if (handAbovePulley) {
        // 底部弧（左→右顺时针穿过底部）
        ctx.arc(pulleyS.x, pulleyS.y, pr, Math.PI, 0, false)
      } else {
        // 顶部弧（左→右逆时针穿过顶部）
        ctx.arc(pulleyS.x, pulleyS.y, pr, 0, Math.PI, false)
      }
      ctx.stroke()

      // 绳子：锚点 → 动滑轮左侧
      ctx.beginPath()
      ctx.moveTo(anchorS.x, anchorS.y)
      ctx.lineTo(pulleyS.x - pr, pulleyS.y)
      ctx.stroke()

      // 绳子：动滑轮右侧 → 手
      ctx.beginPath()
      ctx.moveTo(pulleyS.x + pr, pulleyS.y)
      ctx.lineTo(effortS.x, effortS.y)
      ctx.stroke()

      // ── 动滑轮轮子（画在绳子上方，遮盖内部弧线）──
      ctx.beginPath()
      ctx.arc(pulleyS.x, pulleyS.y, pr, 0, Math.PI * 2)
      ctx.strokeStyle = colors.wheelStroke
      ctx.lineWidth = 3
      ctx.stroke()
      ctx.fillStyle = colors.wheelFill
      ctx.fill()
      // 轮轴
      ctx.beginPath()
      ctx.arc(pulleyS.x, pulleyS.y, 3, 0, Math.PI * 2)
      ctx.fillStyle = colors.axle
      ctx.fill()

      // 挂钩线（滑轮 → 重物）
      ctx.strokeStyle = colors.hook
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(pulleyS.x, pulleyS.y + pr)
      ctx.lineTo(loadS.x, loadS.y - 12)
      ctx.stroke()

      // 重物方块（滑轮正下方）
      const boxW = 28, boxH = 24
      ctx.fillStyle = colors.loadFill
      ctx.fillRect(loadS.x - boxW / 2, loadS.y - boxH / 2, boxW, boxH)
      ctx.strokeStyle = colors.loadStroke
      ctx.lineWidth = 1.5
      ctx.strokeRect(loadS.x - boxW / 2, loadS.y - boxH / 2, boxW, boxH)
      ctx.fillStyle = colors.loadText
      ctx.font = "bold 10px sans-serif"
      ctx.textAlign = "center"
      ctx.fillText(`${params.mass}kg`, loadS.x, loadS.y + 4)

      // 手（右侧）
      ctx.beginPath()
      ctx.arc(effortS.x, effortS.y, 8, 0, Math.PI * 2)
      ctx.fillStyle = colors.handFill
      ctx.fill()
      ctx.strokeStyle = colors.handStroke
      ctx.lineWidth = 1.5
      ctx.stroke()
      ctx.fillStyle = colors.handText
      ctx.font = "bold 9px sans-serif"
      ctx.fillText("手", effortS.x, effortS.y + 3)

      // 拉力箭头（向上）
      const arrowLen = Math.min(params.pullForce * 1.0, 50)
      ctx.strokeStyle = colors.forceColor
      ctx.lineWidth = 2.5
      ctx.lineCap = "round"
      ctx.beginPath()
      ctx.moveTo(effortS.x, effortS.y - 10)
      ctx.lineTo(effortS.x, effortS.y - 10 - arrowLen)
      ctx.stroke()
      ctx.fillStyle = colors.forceColor
      ctx.beginPath()
      ctx.moveTo(effortS.x - 5, effortS.y - 10 - arrowLen + 6)
      ctx.lineTo(effortS.x, effortS.y - 10 - arrowLen)
      ctx.lineTo(effortS.x + 5, effortS.y - 10 - arrowLen + 6)
      ctx.fill()
      ctx.font = "bold 11px sans-serif"
      ctx.fillText(`F=${params.pullForce}N`, effortS.x, effortS.y - 10 - arrowLen - 8)

      // 重力箭头
      const gLen = Math.min(params.mass * params.gravity * 1.2, 50)
      ctx.strokeStyle = colors.gravityColor
      ctx.lineWidth = 2.5
      ctx.beginPath()
      ctx.moveTo(loadS.x, loadS.y + boxH / 2)
      ctx.lineTo(loadS.x, loadS.y + boxH / 2 + gLen)
      ctx.stroke()
      ctx.fillStyle = colors.gravityColor
      ctx.beginPath()
      ctx.moveTo(loadS.x - 4, loadS.y + boxH / 2 + gLen - 5)
      ctx.lineTo(loadS.x, loadS.y + boxH / 2 + gLen)
      ctx.lineTo(loadS.x + 4, loadS.y + boxH / 2 + gLen - 5)
      ctx.fill()
      ctx.font = "10px sans-serif"
      ctx.fillText(`mg=${(params.mass * params.gravity).toFixed(1)}N`, loadS.x, loadS.y + boxH / 2 + gLen + 12)

      ctx.textAlign = "left"
    },
  },

  // ── 滑轮组（定滑轮+动滑轮）──
  // 布局：天花板锚点 → 绳子下到动滑轮（绕过底部）→ 绳子上到定滑轮（绕过顶部）→ 绳子下到手
  // 修正 v2024-06: 重物在动滑轮正下方，增大两轮水平间距
  "pulley-system": {
    drawObject: () => {},
    drawExtra: (ctx, state, params, w2s, getTheme) => {
      const H = params.ceilingH || 5
      const pr = 14
      const isDark = getTheme && getTheme() === "dark"

      // 颜色主题
      const colors = {
        ceiling: isDark ? "#555" : "#8e9eab",
        anchor: isDark ? "#aaa" : "#555",
        rope: isDark ? "#8899aa" : "#5d6d7e",
        wheelStroke: isDark ? "#8899aa" : "#2c3e50",
        wheelFill: isDark ? "#3a3a3a" : "#ecf0f1",
        axle: isDark ? "#8899aa" : "#7f8c8d",
        hook: isDark ? "#8899aa" : "#7f8c8d",
        bracket: isDark ? "#666" : "#8e9eab",
        bracketFill: isDark ? "#888" : "#555",
        loadFill: "#e74c3c",
        loadStroke: "#c0392b",
        loadText: "#fff",
        handFill: "#3498db",
        handStroke: "#2980b9",
        handText: "#fff",
        forceColor: "#3498db",
        gravityColor: "#e67e22",
        labelColor: isDark ? "#aaa" : "#7f8c8d",
      }

      // ── 位置（绳子两侧竖直，中间斜拉）──
      // 锚点 → 动滑轮：竖直（锚点位于动滑轮左切点正上方）
      // 定滑轮 → 手：竖直（手位于定滑轮右切点正下方）
      // 动滑轮 → 定滑轮：斜拉（左右两轮之间）
      const prWorld = pr / DRAW_SCALE
      const anchorS = w2s(-1.0 - prWorld, H)            // 天花板锚点（动滑轮左切点正上方）
      const fixedS = w2s(0, H - 0.67)                 // 定滑轮（支架固定于顶板，轮子在顶板下方 0.67m）
      const movableS = w2s(-1.0, Math.min(state.y + 1.2, H - 0.3))  // 动滑轮（重物上方，但不穿天花板）
      const effortS = w2s(prWorld, state.effortY) // 手（定滑轮右切点正下方）
      const loadS = w2s(-1.0, state.y)                  // 重物（动滑轮正下方）

      // 天花板（覆盖整个场景宽度）
      ctx.strokeStyle = colors.ceiling
      ctx.lineWidth = 4
      ctx.beginPath()
      ctx.moveTo(anchorS.x - 20, anchorS.y)
      ctx.lineTo(effortS.x + 20, anchorS.y)
      ctx.stroke()

      // 锚点标记（天花板固定点）
      ctx.fillStyle = colors.anchor
      ctx.beginPath()
      ctx.arc(anchorS.x, anchorS.y, 4, 0, Math.PI * 2)
      ctx.fill()

      // 定滑轮支架（从天花板垂下）
      ctx.strokeStyle = colors.bracket
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.moveTo(fixedS.x, fixedS.y)
      ctx.lineTo(fixedS.x, fixedS.y - 20)
      ctx.stroke()
      // 水平安装板
      ctx.fillStyle = colors.bracketFill
      ctx.fillRect(fixedS.x - 14, fixedS.y - 20, 28, 4)

      // ── 绳子路径（先画在滑轮下方/上方）──
      ctx.strokeStyle = colors.rope
      ctx.lineWidth = 2

      // 锚点 → 动滑轮左侧（竖直）
      ctx.beginPath()
      ctx.moveTo(anchorS.x, anchorS.y)
      ctx.lineTo(movableS.x - pr, movableS.y)
      ctx.stroke()

      // 弧：绕过动滑轮底部（π → 0 顺时针 = 底部）
      ctx.beginPath()
      ctx.arc(movableS.x, movableS.y, pr, Math.PI, 0, false)
      ctx.stroke()

      // 绳子：动滑轮右侧 → 定滑轮左侧（斜拉）
      ctx.beginPath()
      ctx.moveTo(movableS.x + pr, movableS.y)
      ctx.lineTo(fixedS.x - pr, fixedS.y)
      ctx.stroke()

      // 弧：绕过定滑轮顶部（π → 0 逆时针 = 顶部）
      ctx.beginPath()
      ctx.arc(fixedS.x, fixedS.y, pr, Math.PI, 0, true)
      ctx.stroke()

      // 定滑轮右侧 → 手（竖直）
      ctx.beginPath()
      ctx.moveTo(fixedS.x + pr, fixedS.y)
      ctx.lineTo(effortS.x, effortS.y)
      ctx.stroke()

      // ── 定滑轮轮子（画在绳子上方，遮盖弧线）──
      ctx.beginPath()
      ctx.arc(fixedS.x, fixedS.y, pr, 0, Math.PI * 2)
      ctx.strokeStyle = colors.wheelStroke
      ctx.lineWidth = 3
      ctx.stroke()
      ctx.fillStyle = colors.wheelFill
      ctx.fill()
      ctx.beginPath()
      ctx.arc(fixedS.x, fixedS.y, 3, 0, Math.PI * 2)
      ctx.fillStyle = colors.axle
      ctx.fill()

      // ── 动滑轮轮子（画在绳子上方，遮盖弧线）──
      ctx.beginPath()
      ctx.arc(movableS.x, movableS.y, pr, 0, Math.PI * 2)
      ctx.strokeStyle = colors.wheelStroke
      ctx.lineWidth = 3
      ctx.stroke()
      ctx.fillStyle = colors.wheelFill
      ctx.fill()
      ctx.beginPath()
      ctx.arc(movableS.x, movableS.y, 3, 0, Math.PI * 2)
      ctx.fillStyle = colors.axle
      ctx.fill()

      // 挂钩线（动滑轮底部 → 重物顶部）
      const boxW = 28
      const boxH = 24
      ctx.strokeStyle = colors.hook
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(movableS.x, movableS.y + pr)
      ctx.lineTo(loadS.x, loadS.y - boxH / 2)
      ctx.stroke()

      // 重物方块
      ctx.fillStyle = colors.loadFill
      ctx.fillRect(loadS.x - boxW / 2, loadS.y - boxH / 2, boxW, boxH)
      ctx.strokeStyle = colors.loadStroke
      ctx.lineWidth = 1.5
      ctx.strokeRect(loadS.x - boxW / 2, loadS.y - boxH / 2, boxW, boxH)
      ctx.fillStyle = colors.loadText
      ctx.font = "bold 10px sans-serif"
      ctx.textAlign = "center"
      ctx.fillText(`${params.mass}kg`, loadS.x, loadS.y + 4)

      // 手
      ctx.beginPath()
      ctx.arc(effortS.x, effortS.y, 8, 0, Math.PI * 2)
      ctx.fillStyle = colors.handFill
      ctx.fill()
      ctx.strokeStyle = colors.handStroke
      ctx.lineWidth = 1.5
      ctx.stroke()
      ctx.fillStyle = colors.handText
      ctx.font = "bold 9px sans-serif"
      ctx.fillText("手", effortS.x, effortS.y + 3)

      // 拉力箭头（向下）
      const arrowLen = Math.min(params.pullForce * 1.0, 50)
      ctx.strokeStyle = colors.forceColor
      ctx.lineWidth = 2.5
      ctx.lineCap = "round"
      ctx.beginPath()
      ctx.moveTo(effortS.x, effortS.y + 10)
      ctx.lineTo(effortS.x, effortS.y + 10 + arrowLen)
      ctx.stroke()
      ctx.fillStyle = colors.forceColor
      ctx.beginPath()
      ctx.moveTo(effortS.x - 5, effortS.y + 10 + arrowLen - 6)
      ctx.lineTo(effortS.x, effortS.y + 10 + arrowLen)
      ctx.lineTo(effortS.x + 5, effortS.y + 10 + arrowLen - 6)
      ctx.fill()
      ctx.font = "bold 11px sans-serif"
      ctx.fillText(`F=${params.pullForce}N`, effortS.x, effortS.y + 10 + arrowLen + 14)

      // 重力箭头
      const gLen = Math.min(params.mass * params.gravity * 1.2, 50)
      ctx.strokeStyle = colors.gravityColor
      ctx.lineWidth = 2.5
      ctx.beginPath()
      ctx.moveTo(loadS.x, loadS.y + boxH / 2)
      ctx.lineTo(loadS.x, loadS.y + boxH / 2 + gLen)
      ctx.stroke()
      ctx.fillStyle = colors.gravityColor
      ctx.beginPath()
      ctx.moveTo(loadS.x - 4, loadS.y + boxH / 2 + gLen - 5)
      ctx.lineTo(loadS.x, loadS.y + boxH / 2 + gLen)
      ctx.lineTo(loadS.x + 4, loadS.y + boxH / 2 + gLen - 5)
      ctx.fill()
      ctx.font = "10px sans-serif"
      ctx.fillText(`mg=${(params.mass * params.gravity).toFixed(1)}N`, loadS.x, loadS.y + boxH / 2 + gLen + 12)

      // 标签（定滑轮在下方标注，动滑轮在下方标注避免与绳子重叠）
      ctx.fillStyle = colors.labelColor
      ctx.font = "10px sans-serif"
      ctx.textAlign = "center"
      ctx.fillText("定滑轮", fixedS.x, fixedS.y + pr + 14)
      ctx.fillText("动滑轮", movableS.x, movableS.y + pr + 14)

      ctx.textAlign = "left"
    },
  },

  // ── 浮力 ──
  "buoyancy": {
    drawObject: () => {},
    drawExtra: (ctx, s, p, w2s, getTheme) => {
      const isDark = getTheme && getTheme() === "dark"
      const TANK_W = 6
      const tankLeft = w2s(-TANK_W / 2, 0)
      const tankRight = w2s(TANK_W / 2, 0)
      const tankBottom = w2s(0, 0)
      const tankTop = w2s(0, p.liquidH + 2)
      const tw = tankRight.x - tankLeft.x
      const th = tankBottom.y - tankTop.y

      // 容器壁
      ctx.strokeStyle = isDark ? "#666" : "#8e9eab"
      ctx.lineWidth = 4
      ctx.beginPath()
      ctx.moveTo(tankLeft.x, tankTop.y)
      ctx.lineTo(tankLeft.x, tankBottom.y)
      ctx.lineTo(tankRight.x, tankBottom.y)
      ctx.lineTo(tankRight.x, tankTop.y)
      ctx.stroke()

      // 液体
      const liquidTop = w2s(0, p.liquidH)
      const grad = ctx.createLinearGradient(tankLeft.x, liquidTop.y, tankLeft.x, tankBottom.y)
      grad.addColorStop(0, isDark ? "rgba(30, 100, 160, 0.5)" : "rgba(52, 152, 219, 0.25)")
      grad.addColorStop(1, isDark ? "rgba(20, 70, 120, 0.7)" : "rgba(52, 152, 219, 0.45)")
      ctx.fillStyle = grad
      ctx.fillRect(tankLeft.x + 2, liquidTop.y, tw - 4, tankBottom.y - liquidTop.y)

      // 液面线
      ctx.strokeStyle = isDark ? "rgba(100, 180, 255, 0.6)" : "rgba(52, 152, 219, 0.7)"
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(tankLeft.x, liquidTop.y)
      ctx.lineTo(tankRight.x, liquidTop.y)
      ctx.stroke()

      // 液面标签
      ctx.fillStyle = isDark ? "rgba(100,180,255,0.6)" : "rgba(52,152,219,0.6)"
      ctx.font = "11px sans-serif"
      ctx.textAlign = "left"
      ctx.fillText("液面", tankRight.x + 6, liquidTop.y + 4)

      // 物块
      const side = s.side
      const blkTop = w2s(-side / 2, s.y + side)
      const blkBot = w2s(side / 2, s.y)
      const bw = blkBot.x - blkTop.x
      const bh = blkBot.y - blkTop.y

      // 浸没部分（半透明蓝色覆盖）
      const bottom = s.y
      const top = s.y + side
      let hSub = 0
      if (bottom < p.liquidH) {
        hSub = Math.min(top, p.liquidH) - Math.max(bottom, 0)
        hSub = Math.max(0, hSub)
      }
      if (hSub > 0) {
        const subBot = Math.max(bottom, 0)
        const subTop = subBot + hSub
        const subTopS = w2s(0, subTop)
        const subBotS = w2s(0, subBot)
        ctx.fillStyle = "rgba(52, 152, 219, 0.2)"
        ctx.fillRect(blkTop.x, subTopS.y, bw, subBotS.y - subTopS.y)
      }

      // 物块主体
      const ratio = p.rhoObj / p.rhoLiquid
      const blkColor = ratio < 1 ? "#27ae60" : ratio > 1 ? "#e74c3c" : "#f39c12"
      ctx.fillStyle = blkColor
      ctx.fillRect(blkTop.x, blkTop.y, bw, bh)
      ctx.strokeStyle = "rgba(0,0,0,0.25)"
      ctx.lineWidth = 1.5
      ctx.strokeRect(blkTop.x, blkTop.y, bw, bh)

      // 物块标签
      ctx.fillStyle = "#fff"
      ctx.font = "bold 12px sans-serif"
      ctx.textAlign = "center"
      ctx.fillText(`ρ=${p.rhoObj}`, (blkTop.x + blkBot.x) / 2, (blkTop.y + blkBot.y) / 2 + 4)

      // 力箭头：重力（向下）
      const G = p.rhoObj * p.gravity * p.volume
      const gLen = Math.min(G * 1.5, 80)
      const gStart = w2s(0, s.y)
      ctx.strokeStyle = "#e67e22"
      ctx.lineWidth = 2.5
      ctx.lineCap = "round"
      ctx.beginPath()
      ctx.moveTo(gStart.x, gStart.y + 4)
      ctx.lineTo(gStart.x, gStart.y + 4 + gLen)
      ctx.stroke()
      ctx.fillStyle = "#e67e22"
      ctx.beginPath()
      ctx.moveTo(gStart.x - 4, gStart.y + 4 + gLen - 5)
      ctx.lineTo(gStart.x, gStart.y + 4 + gLen)
      ctx.lineTo(gStart.x + 4, gStart.y + 4 + gLen - 5)
      ctx.fill()
      ctx.font = "bold 11px sans-serif"
      ctx.fillText(`G=${G.toFixed(1)}N`, gStart.x, gStart.y + 4 + gLen + 14)

      // 力箭头：浮力（向上）
      const hSubPhys = Math.max(0, Math.min(s.y + side, p.liquidH) - Math.max(s.y, 0))
      if (hSubPhys > 0.01) {
        const Vsub = hSubPhys * side * side
        const Fb = p.rhoLiquid * p.gravity * Vsub
        const fbLen = Math.min(Fb * 1.5, 80)
        const fbEnd = w2s(0, s.y + side)
        ctx.strokeStyle = "#3498db"
        ctx.lineWidth = 2.5
        ctx.beginPath()
        ctx.moveTo(fbEnd.x, fbEnd.y - 4 - fbLen)
        ctx.lineTo(fbEnd.x, fbEnd.y - 4)
        ctx.stroke()
        ctx.fillStyle = "#3498db"
        ctx.beginPath()
        ctx.moveTo(fbEnd.x - 4, fbEnd.y - 4 - fbLen + 5)
        ctx.lineTo(fbEnd.x, fbEnd.y - 4 - fbLen)
        ctx.lineTo(fbEnd.x + 4, fbEnd.y - 4 - fbLen + 5)
        ctx.fill()
        ctx.font = "bold 11px sans-serif"
        ctx.fillText(`F浮=${Fb.toFixed(1)}N`, fbEnd.x, fbEnd.y - 4 - fbLen - 6)
      }

      ctx.textAlign = "left"
      ctx.lineCap = "butt"
    },
  },

  // ── 力的合成（平行四边形法则）──
  "force-composition": {
    drawObject: () => {},
    drawExtra: (ctx, s, p, w2s, getTheme) => {
      const isDark = getTheme && getTheme() === "dark"
      const anchor = w2s(0, 0)
      const ox = anchor.x
      const oy = anchor.y
      const SC = 15  // 1N = 15px
      const F1 = p.F1, F2 = p.F2
      const rad = p.angle * Math.PI / 180

      // F1: 水平向右
      const f1x = F1 * SC, f1y = 0
      // F2: 与 F1 夹角 θ（逆时针）
      const f2x = F2 * SC * Math.cos(rad)
      const f2y = -F2 * SC * Math.sin(rad)

      // 合力 = F1 + F2（向量加法）
      const rx = f1x + f2x
      const ry = f2y
      const Fr = Math.sqrt(rx * rx + ry * ry)
      const frAngle = Math.atan2(ry, rx)  // 合力与水平方向夹角

      // ── 平行四边形（虚线）──
      ctx.beginPath()
      ctx.moveTo(ox + f1x, oy + f1y)
      ctx.lineTo(ox + rx, oy + ry)
      ctx.moveTo(ox + f2x, oy + f2y)
      ctx.lineTo(ox + rx, oy + ry)
      ctx.strokeStyle = isDark ? "rgba(200,200,200,0.25)" : "rgba(0,0,0,0.2)"
      ctx.lineWidth = 1
      ctx.setLineDash([5, 4])
      ctx.stroke()
      ctx.setLineDash([])

      // ── 合力 F（绿色粗箭头）──
      if (Fr > 1) {
        ctx.beginPath()
        ctx.moveTo(ox, oy)
        ctx.lineTo(ox + rx, oy + ry)
        ctx.strokeStyle = "#2ecc71"
        ctx.lineWidth = 3
        ctx.stroke()
        ctx.beginPath()
        ctx.moveTo(ox + rx, oy + ry)
        ctx.lineTo(ox + rx - 10 * Math.cos(frAngle - 0.35), oy + ry - 10 * Math.sin(frAngle - 0.35))
        ctx.lineTo(ox + rx - 10 * Math.cos(frAngle + 0.35), oy + ry - 10 * Math.sin(frAngle + 0.35))
        ctx.closePath()
        ctx.fillStyle = "#2ecc71"
        ctx.fill()
        ctx.font = "bold 12px sans-serif"
        ctx.fillStyle = "#2ecc71"
        ctx.textAlign = "center"
        ctx.fillText(`F合=${(Fr / SC).toFixed(2)}N`, ox + rx * 0.5 + ry * 0.15, oy + ry * 0.5 - rx * 0.15 - 6)
      }

      // ── F1（蓝色箭头）──
      ctx.beginPath()
      ctx.moveTo(ox, oy)
      ctx.lineTo(ox + f1x, oy)
      ctx.strokeStyle = "#3498db"
      ctx.lineWidth = 2.5
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(ox + f1x, oy)
      ctx.lineTo(ox + f1x - 8, oy - 4)
      ctx.lineTo(ox + f1x - 8, oy + 4)
      ctx.closePath()
      ctx.fillStyle = "#3498db"
      ctx.fill()
      ctx.font = "bold 11px sans-serif"
      ctx.fillStyle = "#3498db"
      ctx.textAlign = "center"
      ctx.fillText(`F₁=${F1}N`, ox + f1x * 0.5, oy + 16)

      // ── F2（橙色箭头）──
      ctx.beginPath()
      ctx.moveTo(ox, oy)
      ctx.lineTo(ox + f2x, oy + f2y)
      ctx.strokeStyle = "#e67e22"
      ctx.lineWidth = 2.5
      ctx.stroke()
      const a2 = Math.atan2(f2y, f2x)
      ctx.beginPath()
      ctx.moveTo(ox + f2x, oy + f2y)
      ctx.lineTo(ox + f2x - 8 * Math.cos(a2 - 0.35), oy + f2y - 8 * Math.sin(a2 - 0.35))
      ctx.lineTo(ox + f2x - 8 * Math.cos(a2 + 0.35), oy + f2y - 8 * Math.sin(a2 + 0.35))
      ctx.closePath()
      ctx.fillStyle = "#e67e22"
      ctx.fill()
      ctx.font = "bold 11px sans-serif"
      ctx.fillStyle = "#e67e22"
      ctx.textAlign = "center"
      const f2LabelX = ox + f2x * 0.5 - f2y * 0.15
      const f2LabelY = oy + f2y * 0.5 + f2x * 0.15 - 4
      ctx.fillText(`F₂=${F2}N`, f2LabelX, f2LabelY)

      // ── 夹角弧线：F1 与 F2 之间（θ）──
      const arcR1 = 30
      const f2Angle = -rad  // F2 与水平方向夹角（canvas 坐标系）
      ctx.beginPath()
      ctx.arc(ox, oy, arcR1, 0, f2Angle, true)
      ctx.strokeStyle = isDark ? "rgba(200,200,200,0.4)" : "rgba(0,0,0,0.3)"
      ctx.lineWidth = 1
      ctx.stroke()
      const arcLabelAngle = f2Angle / 2
      ctx.font = "11px sans-serif"
      ctx.fillStyle = isDark ? "rgba(220,220,220,0.7)" : "rgba(0,0,0,0.5)"
      ctx.textAlign = "center"
      ctx.fillText(`θ=${p.angle}°`, ox + (arcR1 + 12) * Math.cos(arcLabelAngle), oy + (arcR1 + 12) * Math.sin(arcLabelAngle) + 4)

      // ── 夹角弧线：F1 与 F合 之间（α₁）──
      if (Fr > 1 && p.angle > 0 && p.angle < 180) {
        const arcR2 = 48
        const alpha1 = Math.abs(frAngle)
        ctx.beginPath()
        ctx.arc(ox, oy, arcR2, 0, frAngle, frAngle < 0)
        ctx.strokeStyle = isDark ? "rgba(46,204,113,0.5)" : "rgba(46,204,113,0.6)"
        ctx.lineWidth = 1.5
        ctx.stroke()
        const a1LabelAngle = frAngle / 2
        ctx.font = "10px sans-serif"
        ctx.fillStyle = isDark ? "rgba(46,204,113,0.8)" : "rgba(46,204,113,0.8)"
        ctx.textAlign = "center"
        ctx.fillText(`α₁=${(alpha1 * 180 / Math.PI).toFixed(1)}°`, ox + (arcR2 + 14) * Math.cos(a1LabelAngle), oy + (arcR2 + 14) * Math.sin(a1LabelAngle) + 4)

        // ── 夹角弧线：F合 与 F2 之间（α₂）──
        const arcR3 = 62
        const alpha2 = Math.abs(f2Angle - frAngle)
        ctx.beginPath()
        ctx.arc(ox, oy, arcR3, frAngle, f2Angle, true)
        ctx.strokeStyle = isDark ? "rgba(230,126,34,0.5)" : "rgba(230,126,34,0.6)"
        ctx.lineWidth = 1.5
        ctx.stroke()
        const a2LabelAngle = (frAngle + f2Angle) / 2
        ctx.font = "10px sans-serif"
        ctx.fillStyle = isDark ? "rgba(230,126,34,0.8)" : "rgba(230,126,34,0.8)"
        ctx.textAlign = "center"
        ctx.fillText(`α₂=${(alpha2 * 180 / Math.PI).toFixed(1)}°`, ox + (arcR3 + 14) * Math.cos(a2LabelAngle), oy + (arcR3 + 14) * Math.sin(a2LabelAngle) + 4)
      }

      // ── 数值标注 ──
      ctx.font = "11px sans-serif"
      ctx.fillStyle = isDark ? "#aaa" : "#666"
      ctx.textAlign = "left"
      ctx.fillText(`F合 = ${(Fr / SC).toFixed(2)} N`, ox + 10, oy + 30)
      ctx.fillText(`范围: ${Math.abs(F1 - F2).toFixed(1)} ~ ${(F1 + F2).toFixed(1)} N`, ox + 10, oy + 46)
    },
  },

  // ── 波的叠加 ──
  "string-wave": {
    drawObject: () => {},
    drawExtra: (ctx, s, p, w2s, getTheme) => {
      const { N, L, _t } = s
      const A = p.amplitude
      const wavelength = L / p.waveCount
      const k = 2 * Math.PI / wavelength
      const omega = k * p.waveSpeed
      const phiL = p.phaseL * Math.PI / 180
      const phiR = p.phaseR * Math.PI / 180
      const CY = 6
      const isDark = getTheme() === "dark"
      const axisColor = isDark ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.18)"
      const labelColor = isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.35)"
      const tickColor = isDark ? "rgba(255,255,255,0.18)" : "rgba(0,0,0,0.12)"
      const tickLabelColor = isDark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.25)"
      const dashColor = isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.15)"
      const legendTextColor = isDark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.6)"

      const eqL = w2s(0, CY), eqR = w2s(L, CY)

      // ── 坐标轴 ──
      ctx.strokeStyle = axisColor
      ctx.lineWidth = 1
      ctx.fillStyle = labelColor
      ctx.font = "10px sans-serif"
      ctx.textAlign = "center"

      // x 轴（沿平衡线向右延伸）
      const axisExtend = 2
      const axL = w2s(-axisExtend, CY), axR = w2s(L + axisExtend, CY)
      ctx.beginPath()
      ctx.moveTo(axL.x, axL.y)
      ctx.lineTo(axR.x, axR.y)
      ctx.stroke()
      // x 轴箭头
      ctx.beginPath()
      ctx.moveTo(axR.x, axR.y)
      ctx.lineTo(axR.x - 8, axR.y - 4)
      ctx.lineTo(axR.x - 8, axR.y + 4)
      ctx.closePath()
      ctx.fillStyle = axisColor
      ctx.fill()
      ctx.fillStyle = labelColor
      ctx.fillText("x", axR.x + 10, axR.y + 4)

      // y 轴（左端向上延伸）
      const ayB = w2s(0, CY - 3), ayT = w2s(0, CY + 5)
      ctx.beginPath()
      ctx.moveTo(ayB.x, ayB.y)
      ctx.lineTo(ayT.x, ayT.y)
      ctx.stroke()
      // y 轴箭头
      ctx.beginPath()
      ctx.moveTo(ayT.x, ayT.y)
      ctx.lineTo(ayT.x - 4, ayT.y + 8)
      ctx.lineTo(ayT.x + 4, ayT.y + 8)
      ctx.closePath()
      ctx.fillStyle = axisColor
      ctx.fill()
      ctx.fillStyle = labelColor
      ctx.textAlign = "left"
      ctx.fillText("y", ayT.x + 6, ayT.y + 4)

      // x 刻度（每2米一个标记）
      ctx.textAlign = "center"
      for (let xi = 0; xi <= L; xi += 2) {
        const pt = w2s(xi, CY)
        ctx.beginPath()
        ctx.moveTo(pt.x, pt.y + 3)
        ctx.lineTo(pt.x, pt.y - 3)
        ctx.strokeStyle = tickColor
        ctx.stroke()
        if (xi > 0 && xi < L) {
          ctx.fillStyle = tickLabelColor
          ctx.fillText(`${xi}`, pt.x, pt.y + 14)
        }
      }
      // 原点标注
      ctx.textAlign = "right"
      ctx.fillStyle = tickLabelColor
      ctx.fillText("0", w2s(0, CY).x - 6, w2s(0, CY).y + 14)

      // y 刻度
      ctx.textAlign = "right"
      for (let yi = -2; yi <= 4; yi += 1) {
        if (yi === 0) continue
        const pt = w2s(0, CY + yi)
        ctx.beginPath()
        ctx.moveTo(pt.x + 3, pt.y)
        ctx.lineTo(pt.x - 3, pt.y)
        ctx.strokeStyle = tickColor
        ctx.stroke()
        if (yi !== 0) {
          ctx.fillStyle = tickLabelColor
          ctx.fillText(`${yi}`, pt.x - 6, pt.y + 3)
        }
      }

      // 平衡线（虚线）
      ctx.setLineDash([4, 4])
      ctx.strokeStyle = dashColor
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(eqL.x, eqL.y)
      ctx.lineTo(eqR.x, eqR.y)
      ctx.stroke()
      ctx.setLineDash([])

      ctx.textAlign = "left"

      // 左波（红色，向右传播）
      ctx.lineWidth = 2
      ctx.strokeStyle = "rgba(231, 76, 60, 0.5)"
      ctx.beginPath()
      for (let i = 0; i < N; i++) {
        const x = i * L / (N - 1)
        const y1 = A * Math.sin(k * x - omega * _t + phiL)
        const pt = w2s(x, CY + y1)
        if (i === 0) ctx.moveTo(pt.x, pt.y); else ctx.lineTo(pt.x, pt.y)
      }
      ctx.stroke()

      // 右波（蓝色，向左传播）
      ctx.lineWidth = 2
      ctx.strokeStyle = "rgba(52, 152, 219, 0.5)"
      ctx.beginPath()
      for (let i = 0; i < N; i++) {
        const x = i * L / (N - 1)
        const y2 = A * Math.sin(k * x + omega * _t + phiR)
        const pt = w2s(x, CY + y2)
        if (i === 0) ctx.moveTo(pt.x, pt.y); else ctx.lineTo(pt.x, pt.y)
      }
      ctx.stroke()

      // 叠加结果（绿色，加粗）
      ctx.lineWidth = 3.5
      ctx.strokeStyle = "#2ecc71"
      ctx.beginPath()
      for (let i = 0; i < N; i++) {
        const x = i * L / (N - 1)
        const y = A * Math.sin(k * x - omega * _t + phiL) + A * Math.sin(k * x + omega * _t + phiR)
        const pt = w2s(x, CY + y)
        if (i === 0) ctx.moveTo(pt.x, pt.y); else ctx.lineTo(pt.x, pt.y)
      }
      ctx.stroke()

      // 填充叠加区域
      ctx.globalAlpha = 0.05
      ctx.fillStyle = "#2ecc71"
      ctx.beginPath()
      for (let i = 0; i < N; i++) {
        const x = i * L / (N - 1)
        const y = A * Math.sin(k * x - omega * _t + phiL) + A * Math.sin(k * x + omega * _t + phiR)
        const pt = w2s(x, CY + y)
        if (i === 0) ctx.moveTo(pt.x, pt.y); else ctx.lineTo(pt.x, pt.y)
      }
      ctx.lineTo(eqR.x, eqR.y)
      ctx.lineTo(eqL.x, eqL.y)
      ctx.closePath()
      ctx.fill()
      ctx.globalAlpha = 1

      // 图例（右上角）
      const canvasW = ctx.canvas.width / (window.devicePixelRatio || 1)
      const items = [
        { color: "#e74c3c", label: "→ 左波（向右）" },
        { color: "#3498db", label: "← 右波（向左）" },
        { color: "#2ecc71", label: "= 叠加结果" },
      ]
      ctx.font = "bold 11px sans-serif"
      let maxLabelW = 0
      items.forEach(item => { const m = ctx.measureText(item.label); if (m.width > maxLabelW) maxLabelW = m.width })
      const legendW = maxLabelW + 30
      const lx = canvasW - legendW - 14
      const ly = 14
      // 背景
      ctx.fillStyle = isDark ? "rgba(30,30,30,0.85)" : "rgba(255,255,255,0.85)"
      ctx.strokeStyle = isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"
      ctx.lineWidth = 1
      const legendH = items.length * 18 + 8
      ctx.beginPath()
      ctx.moveTo(lx + 6, ly); ctx.lineTo(lx + legendW - 6, ly)
      ctx.arcTo(lx + legendW, ly, lx + legendW, ly + 6, 6)
      ctx.lineTo(lx + legendW, ly + legendH - 6)
      ctx.arcTo(lx + legendW, ly + legendH, lx + legendW - 6, ly + legendH, 6)
      ctx.lineTo(lx + 6, ly + legendH)
      ctx.arcTo(lx, ly + legendH, lx, ly + legendH - 6, 6)
      ctx.lineTo(lx, ly + 6)
      ctx.arcTo(lx, ly, lx + 6, ly, 6)
      ctx.closePath()
      ctx.fill()
      ctx.stroke()
      items.forEach((item, idx) => {
        const iy = ly + 10 + idx * 18
        ctx.fillStyle = item.color
        ctx.fillRect(lx + 8, iy - 5, 14, 3)
        ctx.fillStyle = legendTextColor
        ctx.textAlign = "left"
        ctx.fillText(item.label, lx + 28, iy)
      })

      ctx.textAlign = "left"
    },
  },

  // ── 凸透镜成像 ──
  "convex-lens": {
    drawObject: () => {},
    drawExtra: (ctx, s, p, w2s, getTheme) => {
      const isDark = getTheme() === "dark"
      const axisColor = isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.2)"
      const labelColor = isDark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.6)"
      const f = p.focalLength
      const u = p.objectDist
      const h = p.objectHeight
      // 直接在渲染器里算像距，不依赖 state
      let v, isVirtual
      if (Math.abs(u - f) < 0.01) {
        v = Infinity; isVirtual = false
      } else {
        v = (f * u) / (u - f)
        isVirtual = v < 0
      }
      // 光心在画布中心 (0, 0)，主光轴为 x 轴
      // 用屏幕坐标：光心 = (400, 300) 附近，1cm = 6px
      const canvasW = ctx.canvas.width / (window.devicePixelRatio || 1)
      const canvasH = ctx.canvas.height / (window.devicePixelRatio || 1)
      const cx = canvasW / 2
      const cy = canvasH / 2
      const scale = 6 // 1cm = 6px

      const toScreen = (x, y) => ({ x: cx + x * scale, y: cy - y * scale })

      // ── 主光轴 ──
      ctx.strokeStyle = axisColor
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(20, cy)
      ctx.lineTo(canvasW - 20, cy)
      ctx.stroke()

      // ── 凸透镜（竖直椭圆）──
      const lensH = 80
      ctx.strokeStyle = "#3498db"
      ctx.lineWidth = 2.5
      ctx.beginPath()
      ctx.ellipse(cx, cy, 6, lensH, 0, 0, Math.PI * 2)
      ctx.stroke()
      // 透镜上下箭头
      ctx.fillStyle = "#3498db"
      ctx.beginPath()
      ctx.moveTo(cx, cy - lensH - 2)
      ctx.lineTo(cx - 5, cy - lensH + 6)
      ctx.lineTo(cx + 5, cy - lensH + 6)
      ctx.closePath()
      ctx.fill()
      ctx.beginPath()
      ctx.moveTo(cx, cy + lensH + 2)
      ctx.lineTo(cx - 5, cy + lensH - 6)
      ctx.lineTo(cx + 5, cy + lensH - 6)
      ctx.closePath()
      ctx.fill()
      // 标注 "光心 O"
      ctx.fillStyle = labelColor
      ctx.font = "bold 11px sans-serif"
      ctx.textAlign = "left"
      ctx.fillText("O", cx + 10, cy + 16)

      // ── 焦点 F 和 2F ──
      const markPoint = (x, label, yOff) => {
        const pt = toScreen(x, 0)
        ctx.fillStyle = "#e74c3c"
        ctx.beginPath()
        ctx.arc(pt.x, pt.y, 3.5, 0, Math.PI * 2)
        ctx.fill()
        ctx.fillStyle = labelColor
        ctx.font = "bold 11px sans-serif"
        ctx.textAlign = "center"
        ctx.fillText(label, pt.x, pt.y + yOff)
      }
      // 左侧焦点和 2F
      markPoint(-f, "F", 20)
      markPoint(-2 * f, "2F", 20)
      // 右侧焦点和 2F
      markPoint(f, "F", 20)
      markPoint(2 * f, "2F", 20)

      // ── 物体（红色箭头，在左侧）──
      const objX = -u
      const objTop = toScreen(objX, h)
      const objBottom = toScreen(objX, 0)
      ctx.strokeStyle = "#e74c3c"
      ctx.lineWidth = 2.5
      ctx.beginPath()
      ctx.moveTo(objBottom.x, objBottom.y)
      ctx.lineTo(objTop.x, objTop.y)
      ctx.stroke()
      // 箭头
      ctx.fillStyle = "#e74c3c"
      ctx.beginPath()
      ctx.moveTo(objTop.x, objTop.y)
      ctx.lineTo(objTop.x - 5, objTop.y + 10)
      ctx.lineTo(objTop.x + 5, objTop.y + 10)
      ctx.closePath()
      ctx.fill()
      // 标注
      ctx.fillStyle = "#e74c3c"
      ctx.font = "bold 11px sans-serif"
      ctx.textAlign = "center"
      ctx.fillText("物体", objTop.x, objTop.y - 8)
      ctx.fillText(`u=${u}cm`, objBottom.x, objBottom.y + 16)

      // ── 像（根据物距计算）──
      if (Math.abs(u - f) < 0.01) {
        // 在焦点上，不成像
        ctx.fillStyle = isDark ? "rgba(255,200,0,0.8)" : "rgba(200,150,0,0.8)"
        ctx.font = "bold 12px sans-serif"
        ctx.textAlign = "center"
        ctx.fillText("物体在焦点上，折射光线平行，不成像", cx, cy - lensH - 20)
      } else {
        const absV = Math.abs(v)
        const magnification = absV / u
        const imageH = h * magnification
        const imgX = isVirtual ? -absV : absV
        const imgTop = toScreen(imgX, isVirtual ? imageH : -imageH)
        const imgBottom = toScreen(imgX, 0)

        if (isVirtual) {
          // 虚像：绿色虚线
          ctx.strokeStyle = "rgba(46, 204, 113, 0.6)"
          ctx.lineWidth = 2
          ctx.setLineDash([6, 4])
          ctx.beginPath()
          ctx.moveTo(imgBottom.x, imgBottom.y)
          ctx.lineTo(imgTop.x, imgTop.y)
          ctx.stroke()
          ctx.setLineDash([])
          // 箭头
          ctx.fillStyle = "rgba(46, 204, 113, 0.6)"
          ctx.beginPath()
          ctx.moveTo(imgTop.x, imgTop.y)
          ctx.lineTo(imgTop.x - 5, imgTop.y + 10)
          ctx.lineTo(imgTop.x + 5, imgTop.y + 10)
          ctx.closePath()
          ctx.fill()
          ctx.fillStyle = "#2ecc71"
          ctx.font = "bold 11px sans-serif"
          ctx.textAlign = "center"
          ctx.fillText("虚像", imgTop.x, imgTop.y - 8)
          ctx.fillText(`|v|=${absV.toFixed(1)}cm`, imgBottom.x, imgBottom.y + 16)
        } else {
          // 实像：蓝色实线
          ctx.strokeStyle = "#3498db"
          ctx.lineWidth = 2.5
          ctx.beginPath()
          ctx.moveTo(imgBottom.x, imgBottom.y)
          ctx.lineTo(imgTop.x, imgTop.y)
          ctx.stroke()
          // 箭头（倒立，箭头朝下）
          ctx.fillStyle = "#3498db"
          ctx.beginPath()
          ctx.moveTo(imgTop.x, imgTop.y)
          ctx.lineTo(imgTop.x - 5, imgTop.y - 10)
          ctx.lineTo(imgTop.x + 5, imgTop.y - 10)
          ctx.closePath()
          ctx.fill()
          ctx.fillStyle = "#3498db"
          ctx.font = "bold 11px sans-serif"
          ctx.textAlign = "center"
          ctx.fillText("实像", imgTop.x, imgTop.y + 16)
          ctx.fillText(`v=${absV.toFixed(1)}cm`, imgBottom.x, imgBottom.y - 8)
        }
      }

      // ── 三条特殊光线 ──
      if (p.showRays >= 0.5 && Math.abs(u - f) >= 0.01) {
        const absV = Math.abs(v)
        const magnification = absV / u
        const imageH = h * magnification
        const imgX = isVirtual ? -absV : absV
        const imgY = isVirtual ? imageH : -imageH
        const t = s._t || 0

        // 计算折线总长度（屏幕坐标）
        const segLen = (a, b) => Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2)
        const totalLen = (pts) => {
          let d = 0
          for (let i = 1; i < pts.length; i++) d += segLen(pts[i - 1], pts[i])
          return d
        }
        // 沿折线按比例取点
        const pointAt = (pts, ratio) => {
          const target = ratio * totalLen(pts)
          let d = 0
          for (let i = 1; i < pts.length; i++) {
            const seg = segLen(pts[i - 1], pts[i])
            if (d + seg >= target) {
              const local = (target - d) / seg
              return {
                x: pts[i - 1].x + (pts[i].x - pts[i - 1].x) * local,
                y: pts[i - 1].y + (pts[i].y - pts[i - 1].y) * local,
              }
            }
            d += seg
          }
          return pts[pts.length - 1]
        }
        // 画方向箭头
        const drawArrow = (pts, color) => {
          const len = totalLen(pts)
          const count = Math.max(1, Math.floor(len / 120))
          for (let i = 1; i <= count; i++) {
            const ratio = i / (count + 1)
            const p1 = pointAt(pts, Math.max(0, ratio - 0.02))
            const p2 = pointAt(pts, ratio)
            const dx = p2.x - p1.x, dy = p2.y - p1.y
            const a = Math.atan2(dy, dx)
            ctx.fillStyle = color
            ctx.beginPath()
            ctx.moveTo(p2.x, p2.y)
            ctx.lineTo(p2.x - 7 * Math.cos(a - 0.4), p2.y - 7 * Math.sin(a - 0.4))
            ctx.lineTo(p2.x - 7 * Math.cos(a + 0.4), p2.y - 7 * Math.sin(a + 0.4))
            ctx.closePath()
            ctx.fill()
          }
        }

        const rayAlpha = 0.4
        const drawRay = (points, color, animDelay, extPoints) => {
          const progress = Math.min(1, Math.max(0, (t - animDelay) / 0.8))
          // 光线路径（实线）
          ctx.strokeStyle = color
          ctx.globalAlpha = rayAlpha
          ctx.lineWidth = 1.5
          ctx.beginPath()
          points.forEach((pt, i) => {
            const s2 = toScreen(pt.x, pt.y)
            if (i === 0) ctx.moveTo(s2.x, s2.y); else ctx.lineTo(s2.x, s2.y)
          })
          ctx.stroke()
          // 延长线（虚线）
          if (extPoints && extPoints.length > 0) {
            ctx.globalAlpha = rayAlpha * 0.6
            ctx.setLineDash([4, 3])
            ctx.beginPath()
            extPoints.forEach((pt, i) => {
              const s2 = toScreen(pt.x, pt.y)
              if (i === 0) ctx.moveTo(s2.x, s2.y); else ctx.lineTo(s2.x, s2.y)
            })
            ctx.stroke()
            ctx.setLineDash([])
          }
          // 动画：光点沿路径传播
          if (progress > 0 && progress < 1) {
            const pos = pointAt(points.map(p => toScreen(p.x, p.y)), progress)
            ctx.fillStyle = color
            ctx.globalAlpha = 0.9
            ctx.beginPath()
            ctx.arc(pos.x, pos.y, 5, 0, Math.PI * 2)
            ctx.fill()
            // 光晕
            ctx.globalAlpha = 0.2
            ctx.beginPath()
            ctx.arc(pos.x, pos.y, 12, 0, Math.PI * 2)
            ctx.fill()
          }
          ctx.globalAlpha = 1
          // 方向箭头
          drawArrow(points.map(p => toScreen(p.x, p.y)), color)
        }

        const objX = -u

        if (isVirtual) {
          // 虚像：实际光线经过右侧焦点，反向延长线交于虚像点
          const farX = Math.max(f * 4, u * 3, 60)
          // 光线 1：平行入射 → 经过右侧焦点 F'(f, 0)
          drawRay([
            { x: objX, y: h },
            { x: 0, y: h },
            { x: f, y: 0 },
            { x: farX, y: -h * (farX - f) / f },
          ], "#e74c3c", 0, [
            { x: 0, y: h },
            { x: imgX, y: imgY },
          ])

          // 光线 2：过光心 → 直线传播（无限延伸）
          drawRay([
            { x: objX, y: h },
            { x: 0, y: 0 },
            { x: farX, y: -h * farX / u },
          ], "#f39c12", 0.3, [
            { x: 0, y: 0 },
            { x: imgX, y: imgY },
          ])
        } else {
          // 实像：正常光线
          // 光线 1：平行主光轴 → 过焦点
          drawRay([
            { x: objX, y: h },
            { x: 0, y: h },
            { x: imgX, y: imgY },
          ], "#e74c3c", 0)

          // 光线 2：过光心 → 直线传播
          drawRay([
            { x: objX, y: h },
            { x: imgX, y: imgY },
          ], "#f39c12", 0.3)
        }
      }

      ctx.textAlign = "left"
    },
  },

  // ── 凹透镜成像 ──
  "concave-lens": {
    drawObject: () => {},
    drawExtra: (ctx, s, p, w2s, getTheme) => {
      const isDark = getTheme() === "dark"
      const axisColor = isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.2)"
      const labelColor = isDark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.6)"
      const f = p.focalLength // 焦距正值，凹透镜焦点在左侧 x = -f
      const u = p.objectDist
      const h = p.objectHeight
      // 1/f_lens = 1/u + 1/v，凹透镜 f_lens = -f
      const v = (-f * u) / (u + f) // v < 0，像在同侧
      const absV = Math.abs(v)
      const magnification = absV / u
      const imageH = h * magnification

      const canvasW = ctx.canvas.width / (window.devicePixelRatio || 1)
      const canvasH = ctx.canvas.height / (window.devicePixelRatio || 1)
      const cx = canvasW / 2
      const cy = canvasH / 2
      const scale = 6

      const toScreen = (x, y) => ({ x: cx + x * scale, y: cy - y * scale })

      // ── 主光轴 ──
      ctx.strokeStyle = axisColor
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(20, cy)
      ctx.lineTo(canvasW - 20, cy)
      ctx.stroke()

      // ── 凹透镜（中间薄，上下厚）──
      const lensH = 80
      const edgeW = 15 // 边缘半厚（上下宽）
      const midW = 3   // 中间半厚（中间窄）
      ctx.strokeStyle = "#9b59b6"
      ctx.lineWidth = 2.5
      // 左侧弧线：从左上(cx-edgeW, top) 向右凹到 中间(cx-midW, cy) 再回到 左下(cx-edgeW, bottom)
      ctx.beginPath()
      ctx.moveTo(cx - edgeW, cy - lensH)
      ctx.quadraticCurveTo(cx - midW, cy, cx - edgeW, cy + lensH)
      ctx.stroke()
      // 右侧弧线：从右上(cx+edgeW, top) 向左凹到 中间(cx+midW, cy) 再回到 右下(cx+edgeW, bottom)
      ctx.beginPath()
      ctx.moveTo(cx + edgeW, cy - lensH)
      ctx.quadraticCurveTo(cx + midW, cy, cx + edgeW, cy + lensH)
      ctx.stroke()
      // 上边连线
      ctx.beginPath()
      ctx.moveTo(cx - edgeW, cy - lensH)
      ctx.lineTo(cx + edgeW, cy - lensH)
      ctx.stroke()
      // 下边连线
      ctx.beginPath()
      ctx.moveTo(cx - edgeW, cy + lensH)
      ctx.lineTo(cx + edgeW, cy + lensH)
      ctx.stroke()
      // 箭头
      ctx.fillStyle = "#9b59b6"
      ctx.beginPath()
      ctx.moveTo(cx, cy - lensH - 2)
      ctx.lineTo(cx - 5, cy - lensH + 6)
      ctx.lineTo(cx + 5, cy - lensH + 6)
      ctx.closePath()
      ctx.fill()
      ctx.beginPath()
      ctx.moveTo(cx, cy + lensH + 2)
      ctx.lineTo(cx - 5, cy + lensH - 6)
      ctx.lineTo(cx + 5, cy + lensH - 6)
      ctx.closePath()
      ctx.fill()
      ctx.fillStyle = labelColor
      ctx.font = "bold 11px sans-serif"
      ctx.textAlign = "left"
      ctx.fillText("O", cx + 10, cy + 16)

      // ── 焦点 F（凹透镜焦点在左侧，空心圆）──
      const markPoint = (x, label, yOff) => {
        const pt = toScreen(x, 0)
        ctx.strokeStyle = "#e74c3c"
        ctx.lineWidth = 1.5
        ctx.beginPath()
        ctx.arc(pt.x, pt.y, 3.5, 0, Math.PI * 2)
        ctx.stroke() // 空心
        ctx.fillStyle = labelColor
        ctx.font = "bold 11px sans-serif"
        ctx.textAlign = "center"
        ctx.fillText(label, pt.x, pt.y + yOff)
      }
      markPoint(-f, "F", 20)
      markPoint(-2 * f, "2F", 20)
      markPoint(f, "F", 20)
      markPoint(2 * f, "2F", 20)

      // ── 物体（红色箭头）──
      const objX = -u
      const objTop = toScreen(objX, h)
      const objBottom = toScreen(objX, 0)
      ctx.strokeStyle = "#e74c3c"
      ctx.lineWidth = 2.5
      ctx.beginPath()
      ctx.moveTo(objBottom.x, objBottom.y)
      ctx.lineTo(objTop.x, objTop.y)
      ctx.stroke()
      ctx.fillStyle = "#e74c3c"
      ctx.beginPath()
      ctx.moveTo(objTop.x, objTop.y)
      ctx.lineTo(objTop.x - 5, objTop.y + 10)
      ctx.lineTo(objTop.x + 5, objTop.y + 10)
      ctx.closePath()
      ctx.fill()
      ctx.fillStyle = "#e74c3c"
      ctx.font = "bold 11px sans-serif"
      ctx.textAlign = "center"
      ctx.fillText("物体", objTop.x, objTop.y - 8)
      ctx.fillText(`u=${u}cm`, objBottom.x, objBottom.y + 16)

      // ── 光线绘制 ──
      if (p.showRays >= 0.5) {
        const t = s._t || 0
        const segLen = (a, b) => Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2)
        const totalLen = (pts) => { let d = 0; for (let i = 1; i < pts.length; i++) d += segLen(pts[i - 1], pts[i]); return d }
        const pointAt = (pts, ratio) => {
          const target = ratio * totalLen(pts)
          let d = 0
          for (let i = 1; i < pts.length; i++) {
            const seg = segLen(pts[i - 1], pts[i])
            if (d + seg >= target) {
              const local = (target - d) / seg
              return { x: pts[i - 1].x + (pts[i].x - pts[i - 1].x) * local, y: pts[i - 1].y + (pts[i].y - pts[i - 1].y) * local }
            }
            d += seg
          }
          return pts[pts.length - 1]
        }
        const drawArrow = (pts, color) => {
          const len = totalLen(pts)
          const count = Math.max(1, Math.floor(len / 120))
          for (let i = 1; i <= count; i++) {
            const ratio = i / (count + 1)
            const p1 = pointAt(pts, Math.max(0, ratio - 0.02))
            const p2 = pointAt(pts, ratio)
            const dx = p2.x - p1.x, dy = p2.y - p1.y
            const a = Math.atan2(dy, dx)
            ctx.fillStyle = color
            ctx.beginPath()
            ctx.moveTo(p2.x, p2.y)
            ctx.lineTo(p2.x - 7 * Math.cos(a - 0.4), p2.y - 7 * Math.sin(a - 0.4))
            ctx.lineTo(p2.x - 7 * Math.cos(a + 0.4), p2.y - 7 * Math.sin(a + 0.4))
            ctx.closePath()
            ctx.fill()
          }
        }
        const drawRayFull = (realPts, extPts, color, animDelay) => {
          const progress = Math.min(1, Math.max(0, (t - animDelay) / 0.8))
          // 实际光线（实线）
          ctx.strokeStyle = color
          ctx.globalAlpha = 0.5
          ctx.lineWidth = 1.5
          ctx.beginPath()
          realPts.forEach((pt, i) => { const s2 = toScreen(pt.x, pt.y); if (i === 0) ctx.moveTo(s2.x, s2.y); else ctx.lineTo(s2.x, s2.y) })
          ctx.stroke()
          // 延长线（虚线）
          if (extPts && extPts.length > 0) {
            ctx.globalAlpha = 0.25
            ctx.setLineDash([4, 3])
            ctx.beginPath()
            extPts.forEach((pt, i) => { const s2 = toScreen(pt.x, pt.y); if (i === 0) ctx.moveTo(s2.x, s2.y); else ctx.lineTo(s2.x, s2.y) })
            ctx.stroke()
            ctx.setLineDash([])
          }
          // 动画光点
          const allPts = [...realPts, ...(extPts || [])]
          if (progress > 0 && progress < 1) {
            const pos = pointAt(allPts.map(p => toScreen(p.x, p.y)), progress)
            ctx.fillStyle = color
            ctx.globalAlpha = 0.9
            ctx.beginPath()
            ctx.arc(pos.x, pos.y, 5, 0, Math.PI * 2)
            ctx.fill()
            ctx.globalAlpha = 0.2
            ctx.beginPath()
            ctx.arc(pos.x, pos.y, 12, 0, Math.PI * 2)
            ctx.fill()
          }
          ctx.globalAlpha = 1
          drawArrow(allPts.map(p => toScreen(p.x, p.y)), color)
        }

        // ── 光线1：平行入射 → 发散，反向延长线过左侧焦点 ──
        // 入射：物体最高点水平射到镜面 (0, h)
        // 折射：从 (0, h) 发散，方向由 (0, h) 和 (-f, 0) 的连线决定
        // 发散光线往右延伸，延长线往左延伸过焦点
        const divergeX = 40 // 发散光线延伸到的 x 坐标
        const slope1 = h / f // 斜率 = h / f（从 (0,h) 到 (-f,0)）
        const divergeY = h + slope1 * divergeX // 发散光线在 divergeX 处的 y
        drawRayFull(
          [{ x: objX, y: h }, { x: 0, y: h }, { x: divergeX, y: divergeY }],
          [{ x: 0, y: h }, { x: -f, y: 0 }], // 延长线过焦点
          "#e74c3c", 0
        )

        // ── 光线2：物体最高点过光心 → 直线传播 ──
        // 直线从 (-u, h) 过 (0, 0)，延伸到右侧
        const slope2 = -h / u
        const lineEndX = 40
        const lineEndY = slope2 * lineEndX
        drawRayFull(
          [{ x: objX, y: h }, { x: 0, y: 0 }, { x: lineEndX, y: lineEndY }],
          null,
          "#f39c12", 0.3
        )
      }

      // ── 虚像（绿色虚线，正立缩小，同侧）──
      const imgX = v // v < 0，像在同侧
      const imgTop = toScreen(imgX, imageH)
      const imgBottom = toScreen(imgX, 0)
      ctx.strokeStyle = "rgba(46, 204, 113, 0.6)"
      ctx.lineWidth = 2
      ctx.setLineDash([6, 4])
      ctx.beginPath()
      ctx.moveTo(imgBottom.x, imgBottom.y)
      ctx.lineTo(imgTop.x, imgTop.y)
      ctx.stroke()
      ctx.setLineDash([])
      // 箭头（正立）
      ctx.fillStyle = "rgba(46, 204, 113, 0.6)"
      ctx.beginPath()
      ctx.moveTo(imgTop.x, imgTop.y)
      ctx.lineTo(imgTop.x - 5, imgTop.y + 10)
      ctx.lineTo(imgTop.x + 5, imgTop.y + 10)
      ctx.closePath()
      ctx.fill()
      ctx.fillStyle = "#2ecc71"
      ctx.font = "bold 11px sans-serif"
      ctx.textAlign = "center"
      ctx.fillText("虚像", imgTop.x, imgTop.y - 8)
      ctx.fillText(`|v|=${absV.toFixed(1)}cm`, imgBottom.x, imgBottom.y + 16)

      ctx.textAlign = "left"
    },
  },

  // ── 声波测距（回声）──
  "echo-ranging": {
    drawObject: () => {},
    drawExtra: (ctx, s, p, w2s, getTheme) => {
      const isDark = getTheme && getTheme() === "dark"

      // 地面位置
      const gnd = w2s(0, 0)

      // 墙壁
      const wallS = w2s(p.wallDist, 0)
      ctx.fillStyle = isDark ? "#555" : "#7f8c8d"
      ctx.fillRect(wallS.x - 4, gnd.y - 80, 8, 80)
      ctx.fillStyle = isDark ? "#444" : "#95a5a6"
      ctx.fillRect(wallS.x - 2, gnd.y - 80, 4, 80)
      ctx.strokeStyle = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.08)"
      ctx.lineWidth = 0.5
      for (let i = 0; i < 8; i++) {
        const by = gnd.y - 75 + i * 10
        ctx.beginPath()
        ctx.moveTo(wallS.x - 3, by)
        ctx.lineTo(wallS.x + 3, by)
        ctx.stroke()
      }

      // 小车（随位置移动）
      const carS = w2s(s.carX, 0)
      const carW = 28, carH = 16
      ctx.fillStyle = "#3498db"
      ctx.fillRect(carS.x - carW / 2, gnd.y - carH - 4, carW, carH)
      ctx.strokeStyle = "rgba(0,0,0,0.2)"
      ctx.lineWidth = 1.5
      ctx.strokeRect(carS.x - carW / 2, gnd.y - carH - 4, carW, carH)
      ctx.beginPath()
      ctx.arc(carS.x - 8, gnd.y - 2, 4, 0, Math.PI * 2)
      ctx.fillStyle = "#333"
      ctx.fill()
      ctx.beginPath()
      ctx.arc(carS.x + 8, gnd.y - 2, 4, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = "#fff"
      ctx.font = "bold 9px sans-serif"
      ctx.textAlign = "center"
      ctx.fillText("发声", carS.x, gnd.y - carH / 2 - 2)

      // 车速箭头
      if (p.v0 > 0 && !s.waveDone) {
        const vLen = Math.min(p.v0 * 1.5, 40)
        ctx.strokeStyle = "#3498db"
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.moveTo(carS.x + carW / 2 + 2, gnd.y - carH / 2 - 4)
        ctx.lineTo(carS.x + carW / 2 + 2 + vLen, gnd.y - carH / 2 - 4)
        ctx.stroke()
        ctx.beginPath()
        ctx.moveTo(carS.x + carW / 2 + 2 + vLen, gnd.y - carH / 2 - 4)
        ctx.lineTo(carS.x + carW / 2 + 2 + vLen - 6, gnd.y - carH / 2 - 8)
        ctx.lineTo(carS.x + carW / 2 + 2 + vLen - 6, gnd.y - carH / 2)
        ctx.closePath()
        ctx.fillStyle = "#3498db"
        ctx.fill()
      }

      // 波的轨迹（尾迹）
      if (s.waveTrail && s.waveTrail.length > 1) {
        ctx.globalAlpha = 0.4
        for (let i = 1; i < s.waveTrail.length; i++) {
          const p1 = w2s(s.waveTrail[i - 1].x, 0)
          const p2 = w2s(s.waveTrail[i].x, 0)
          // 去程橙色，回程绿色
          const isOutbound = s.waveTrail[i].x >= s.waveTrail[Math.max(0, i - 10)].x
          ctx.beginPath()
          ctx.moveTo(p1.x, gnd.y - 20)
          ctx.lineTo(p2.x, gnd.y - 20)
          ctx.strokeStyle = isOutbound ? "rgba(230,126,34,0.5)" : "rgba(46,204,113,0.5)"
          ctx.lineWidth = 3
          ctx.stroke()
        }
        ctx.globalAlpha = 1.0
      }

      // 波的位置（多层波纹）
      const waveS = w2s(s.waveX, 0)
      const waveColor = s.dir === 1 ? "#e67e22" : "#2ecc71"
      const hexToRgba = (hex, a) => {
        const r = parseInt(hex.slice(1, 3), 16)
        const g = parseInt(hex.slice(3, 5), 16)
        const b = parseInt(hex.slice(5, 7), 16)
        return `rgba(${r},${g},${b},${a})`
      }
      for (let r = 0; r < 3; r++) {
        const radius = 8 + r * 6
        const alpha = 0.6 - r * 0.2
        ctx.beginPath()
        ctx.arc(waveS.x, gnd.y - 20, radius, 0, Math.PI * 2)
        ctx.strokeStyle = hexToRgba(waveColor, alpha)
        ctx.lineWidth = 2
        ctx.stroke()
      }
      ctx.beginPath()
      ctx.arc(waveS.x, gnd.y - 20, 3, 0, Math.PI * 2)
      ctx.fillStyle = waveColor
      ctx.fill()

      // 距离标注
      ctx.fillStyle = isDark ? "#aaa" : "#666"
      ctx.font = "11px sans-serif"
      ctx.textAlign = "center"
      ctx.fillText(`d = ${p.wallDist} m`, (carS.x + wallS.x) / 2, gnd.y - 55)
      ctx.textAlign = "left"
    },
  },

  // ── 光的折射 ──
  "refraction": {
    drawObject: () => {},
    drawExtra: (ctx, s, p, w2s, getTheme) => {
      const isDark = getTheme && getTheme() === "dark"
      const dpr = window.devicePixelRatio || 1
      const cw = ctx.canvas.width / dpr
      const ch = ctx.canvas.height / dpr

      // ── 布局 ──
      const intY = ch * 0.50                 // 界面 Y
      const hitX = cw / 2                      // 入射点 X
      const rayLen = Math.min(cw, ch) * 0.32   // 光线长度

      // ── 物理参数 ──
      const theta1 = p.incidentAngle * Math.PI / 180
      const n1 = p.n1
      const n2 = p.n2
      const sinTheta2 = n1 / n2 * Math.sin(theta1)
      const totalReflection = n1 > n2 && sinTheta2 > 1
      const theta2 = totalReflection ? null : Math.asin(Math.min(1, Math.max(-1, sinTheta2)))

      // ── 颜色 ──
      const bg1Color = isDark ? "rgba(220,220,220,0.06)" : "rgba(220,220,220,0.08)"
      const bg2Color = isDark ? "rgba(52,152,219,0.12)" : "rgba(52,152,219,0.05)"
      const intColor = isDark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.25)"
      const normalColor = isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.10)"
      const incidentColor = "#e74c3c"
      const reflectedColor = "#f39c12"
      const refractedColor = "#3498db"
      const labelColor = isDark ? "rgba(255,255,255,0.85)" : "rgba(0,0,0,0.7)"
      const dimColor = isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.35)"

      // 画箭头辅助函数
      const drawArrow = (fromX, fromY, toX, toY, color, ratio = 0.55) => {
        const dx = toX - fromX, dy = toY - fromY
        const len = Math.sqrt(dx * dx + dy * dy)
        if (len < 1) return
        const ax = fromX + dx * ratio, ay = fromY + dy * ratio
        const nx = dx / len, ny = dy / len
        const sz = 8
        ctx.fillStyle = color
        ctx.beginPath()
        ctx.moveTo(ax, ay)
        ctx.lineTo(ax - nx * sz - ny * sz * 0.5, ay - ny * sz + nx * sz * 0.5)
        ctx.lineTo(ax - nx * sz + ny * sz * 0.5, ay - ny * sz - nx * sz * 0.5)
        ctx.closePath()
        ctx.fill()
      }

      // ── 1. 两种介质背景 ──
      ctx.fillStyle = bg1Color
      ctx.fillRect(0, 0, cw, intY)
      ctx.fillStyle = bg2Color
      ctx.fillRect(0, intY, cw, ch - intY)

      // ── 2. 界面线 ──
      ctx.strokeStyle = intColor
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(30, intY)
      ctx.lineTo(cw - 30, intY)
      ctx.stroke()

      // ── 3. 法线（虚线）──
      ctx.setLineDash([5, 5])
      ctx.strokeStyle = normalColor
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(hitX, intY - rayLen - 20)
      ctx.lineTo(hitX, intY + rayLen + 20)
      ctx.stroke()
      ctx.setLineDash([])

      // "法线" 标签
      ctx.fillStyle = dimColor
      ctx.font = "11px sans-serif"
      ctx.textAlign = "left"
      ctx.fillText("法线", hitX + 8, intY - rayLen - 5)

      // ── 4. 入射光线（左上 → 入射点）──
      const srcX = hitX - rayLen * Math.sin(theta1)
      const srcY = intY - rayLen * Math.cos(theta1)
      ctx.strokeStyle = incidentColor
      ctx.lineWidth = 2.5
      ctx.beginPath()
      ctx.moveTo(srcX, srcY)
      ctx.lineTo(hitX, intY)
      ctx.stroke()
      drawArrow(srcX, srcY, hitX, intY, incidentColor, 0.5)

      // ── 5. 反射光线（入射点 → 右上）──
      const refX = hitX + rayLen * Math.sin(theta1)
      const refY = intY - rayLen * Math.cos(theta1)
      ctx.strokeStyle = reflectedColor
      ctx.lineWidth = 2.5
      ctx.beginPath()
      ctx.moveTo(hitX, intY)
      ctx.lineTo(refX, refY)
      ctx.stroke()
      drawArrow(hitX, intY, refX, refY, reflectedColor, 0.5)

      // ── 6. 折射光线（入射点 → 右下）──
      if (!totalReflection && theta2 !== null) {
        const transX = hitX + rayLen * Math.sin(theta2)
        const transY = intY + rayLen * Math.cos(theta2)
        ctx.strokeStyle = refractedColor
        ctx.lineWidth = 2.5
        ctx.beginPath()
        ctx.moveTo(hitX, intY)
        ctx.lineTo(transX, transY)
        ctx.stroke()
        drawArrow(hitX, intY, transX, transY, refractedColor, 0.5)
      }

      // ── 7. 角度弧标注 ──
      const arcR = 32
      // θ₁ 入射角（法线左侧，入射光线与法线之间）
      if (p.incidentAngle > 2) {
        ctx.strokeStyle = incidentColor
        ctx.lineWidth = 1.5
        ctx.beginPath()
        ctx.arc(hitX, intY, arcR, -Math.PI / 2 - theta1, -Math.PI / 2)
        ctx.stroke()
        const la = -Math.PI / 2 - theta1 / 2
        ctx.fillStyle = incidentColor
        ctx.font = "bold 11px sans-serif"
        ctx.textAlign = "center"
        ctx.fillText(`θ₁=${p.incidentAngle}°`, hitX + (arcR + 18) * Math.cos(la),
          intY + (arcR + 18) * Math.sin(la))

        // 反射角（法线右侧，与入射角相同）
        ctx.strokeStyle = reflectedColor
        ctx.lineWidth = 1.5
        ctx.beginPath()
        ctx.arc(hitX, intY, arcR, -Math.PI / 2, -Math.PI / 2 + theta1)
        ctx.stroke()
        const la2 = -Math.PI / 2 + theta1 / 2
        ctx.fillStyle = reflectedColor
        ctx.fillText(`θ₁=${p.incidentAngle}°`, hitX + (arcR + 18) * Math.cos(la2),
          intY + (arcR + 18) * Math.sin(la2))
      }

      // θ₂ 折射角（法线右侧下方）
      if (!totalReflection && theta2 !== null && theta2 > 0.02) {
        const theta2deg = theta2 * 180 / Math.PI
        ctx.strokeStyle = refractedColor
        ctx.lineWidth = 1.5
        ctx.beginPath()
        ctx.arc(hitX, intY, arcR, Math.PI / 2 - theta2, Math.PI / 2)
        ctx.stroke()
        const la3 = Math.PI / 2 - theta2 / 2
        ctx.fillStyle = refractedColor
        ctx.font = "bold 11px sans-serif"
        ctx.textAlign = "center"
        ctx.fillText(`θ₂=${theta2deg.toFixed(1)}°`, hitX + (arcR + 18) * Math.cos(la3),
          intY + (arcR + 18) * Math.sin(la3))
      }

      // ── 8. 全反射提示 ──
      if (totalReflection) {
        ctx.fillStyle = "#e74c3c"
        ctx.font = "bold 16px sans-serif"
        ctx.textAlign = "center"
        ctx.fillText("⚠ 全反射 — 无折射光线", hitX, intY + rayLen * 0.55)
        // 在折射方向画一个 X
        const xLen = 16
        ctx.strokeStyle = "rgba(231,76,60,0.4)"
        ctx.lineWidth = 2.5
        const xDirX = hitX + rayLen * 0.35 * Math.sin(theta1)
        const xDirY = intY + rayLen * 0.35 * Math.cos(theta1)
        ctx.beginPath()
        ctx.moveTo(xDirX - xLen, xDirY - xLen)
        ctx.lineTo(xDirX + xLen, xDirY + xLen)
        ctx.moveTo(xDirX + xLen, xDirY - xLen)
        ctx.lineTo(xDirX - xLen, xDirY + xLen)
        ctx.stroke()
      }

      // ── 9. 入射点标记 ──
      ctx.beginPath()
      ctx.arc(hitX, intY, 3, 0, Math.PI * 2)
      ctx.fillStyle = isDark ? "#fff" : "#333"
      ctx.fill()

      // ── 10. 介质标签 ──
      ctx.fillStyle = dimColor
      ctx.font = "bold 12px sans-serif"
      ctx.textAlign = "left"
      ctx.fillText(`介质 1  n₁ = ${n1.toFixed(2)}`, cw * 0.05, intY - 20)
      ctx.fillText(`介质 2  n₂ = ${n2.toFixed(2)}`, cw * 0.05, intY + 28)

      // ── 11. 图例 ──
      const legendX = cw - 140
      const legendY = 16
      const items = [
        { color: incidentColor, label: "入射光" },
        { color: reflectedColor, label: "反射光" },
      ]
      if (!totalReflection && theta2 !== null) {
        items.push({ color: refractedColor, label: "折射光" })
      }
      ctx.font = "11px sans-serif"
      ctx.textAlign = "left"
      ctx.fillStyle = isDark ? "rgba(30,30,30,0.8)" : "rgba(255,255,255,0.8)"
      ctx.fillRect(legendX, legendY, 125, items.length * 18 + 8)
      items.forEach((item, i) => {
        const iy = legendY + 10 + i * 18
        ctx.fillStyle = item.color
        ctx.fillRect(legendX + 8, iy - 5, 16, 3)
        ctx.fillStyle = labelColor
        ctx.fillText(item.label, legendX + 30, iy)
      })

      ctx.textAlign = "left"
    },
  },

  // ── 水中视深 ──
  "water-refraction": {
    drawObject: () => {},
    drawExtra: (ctx, s, p, w2s, getTheme) => {
      const isDark = getTheme && getTheme() === "dark"
      const dpr = window.devicePixelRatio || 1
      const cw = ctx.canvas.width / dpr
      const ch = ctx.canvas.height / dpr

      // ── 布局常量 ──
      const surfaceY = ch * 0.38             // 水面 Y（屏幕坐标，越大越靠下）
      const landLeft = cw * 0.68             // 陆地左边界
      const groundTop = surfaceY - 50        // 地面顶部
      const eyeHeight = 140                  // 眼睛离水面高度（像素）

      // ── 物理参数 ──
      const D_px = p.depth * 0.55            // 实深 → 像素
      const theta2 = p.viewAngle * Math.PI / 180
      const n1 = p.refractiveIndex
      const sinTheta1 = Math.sin(theta2) / n1
      const theta1 = Math.asin(Math.min(1, Math.max(-1, sinTheta1)))
      const tan1 = Math.tan(theta1)
      const tan2 = Math.tan(theta2)
      const cos1 = Math.cos(theta1)
      const cos2 = Math.cos(theta2)

      // 物体位置
      const objX = cw * 0.28
      const objY = surfaceY + D_px

      // 光线入射水面点
      const hitOffset = D_px * tan1
      const hitX = objX + hitOffset
      const intY = surfaceY

      // 人眼位置
      const eyeX = hitX + eyeHeight * tan2
      const eyeY = surfaceY - eyeHeight

      // 动态陆地边界：确保人站在岸上，水域至少保留 35% 宽度
      const groundLeft = Math.max(cw * 0.35, Math.min(landLeft, eyeX - 16))

      // 视深（反向延长线与 x=objX 垂直线交点）
      const appD_px = D_px * tan1 / tan2
      const appY = surfaceY + appD_px

      // ── 调色板 ──
      const waterFill = isDark ? "rgba(52,152,219,0.20)" : "rgba(52,152,219,0.10)"
      const waterLine = isDark ? "rgba(52,152,219,0.7)" : "rgba(52,152,219,0.5)"
      const rippleColor = isDark ? "rgba(52,152,219,0.15)" : "rgba(52,152,219,0.08)"
      const landFill = isDark ? "rgba(139,90,43,0.30)" : "rgba(139,90,43,0.10)"
      const landLine = isDark ? "rgba(139,90,43,0.7)" : "rgba(139,90,43,0.4)"
      const rayColor = "#e74c3c"
      const dashColor = isDark ? "rgba(231,76,60,0.5)" : "rgba(231,76,60,0.35)"
      const normalColor = isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.10)"
      const labelColor = isDark ? "rgba(255,255,255,0.85)" : "rgba(0,0,0,0.7)"
      const dimColor = isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.35)"
      const arrowColor = isDark ? "#eee" : "#333"

      // ── 1. 水池（到陆地边缘）──
      ctx.fillStyle = waterFill
      ctx.fillRect(0, surfaceY, groundLeft, ch - surfaceY)

      // ── 2. 陆地（延伸到人脚下）──
      ctx.fillStyle = landFill
      ctx.fillRect(groundLeft, groundTop, cw - groundLeft, ch - groundTop)
      ctx.strokeStyle = landLine
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(groundLeft, groundTop)
      ctx.lineTo(cw, groundTop)
      ctx.stroke()

      // ── 3. 水面线（到陆地边缘）──
      ctx.strokeStyle = waterLine
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.moveTo(0, surfaceY)
      ctx.lineTo(groundLeft, surfaceY)
      ctx.stroke()

      // 水面波纹（不画到陆地上）
      ctx.strokeStyle = rippleColor
      ctx.lineWidth = 1
      for (let i = 0; i < 5; i++) {
        const wx = 40 + i * 70
        if (wx + 30 > groundLeft) break
        ctx.beginPath()
        ctx.moveTo(wx, surfaceY + 2)
        ctx.quadraticCurveTo(wx + 15, surfaceY - 6, wx + 30, surfaceY + 2)
        ctx.stroke()
      }

      // ── 4. 法线（虚线）──
      ctx.setLineDash([4, 4])
      ctx.strokeStyle = normalColor
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(hitX, surfaceY - 50)
      ctx.lineTo(hitX, surfaceY + D_px + 40)
      ctx.stroke()
      ctx.setLineDash([])

      // ── 5. 实线光线：物体 → 入射点 → 眼睛 ──
      ctx.strokeStyle = rayColor
      ctx.lineWidth = 2.5
      ctx.beginPath()
      ctx.moveTo(objX, objY)
      ctx.lineTo(hitX, intY)
      ctx.lineTo(eyeX, eyeY)
      ctx.stroke()

      // ── 6. 虚线反向延长线（从入射点沿观察角进入水中）──
      const extEndY = surfaceY + D_px + 40
      const extEndX = hitX - (extEndY - surfaceY) * tan2
      ctx.setLineDash([6, 5])
      ctx.strokeStyle = dashColor
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.moveTo(hitX, intY)
      ctx.lineTo(extEndX, extEndY)
      ctx.stroke()
      ctx.setLineDash([])

      // ── 7. 实物（黑色/白色）──
      ctx.beginPath()
      ctx.arc(objX, objY, 6, 0, Math.PI * 2)
      ctx.fillStyle = arrowColor
      ctx.fill()
      ctx.strokeStyle = isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.15)"
      ctx.lineWidth = 1
      ctx.stroke()
      ctx.fillStyle = arrowColor
      ctx.font = "bold 11px sans-serif"
      ctx.textAlign = "center"
      ctx.fillText("实物", objX, objY + 18)

      // ── 7.5. 虚像（红色虚线，观察者看到的物体位置）──
      if (appD_px > 6 && appY > surfaceY) {
        // 虚像：红色空心虚线圆
        ctx.setLineDash([4, 4])
        ctx.strokeStyle = "#e74c3c"
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.arc(objX, appY, 8, 0, Math.PI * 2)
        ctx.stroke()
        ctx.setLineDash([])
        // 实物到虚像的连线
        ctx.setLineDash([3, 4])
        ctx.strokeStyle = "rgba(231,76,60,0.15)"
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(objX, appY)
        ctx.lineTo(objX, objY)
        ctx.stroke()
        ctx.setLineDash([])
        // 标注
        ctx.fillStyle = "#e74c3c"
        ctx.font = "bold 11px sans-serif"
        ctx.textAlign = "center"
        ctx.fillText("虚像", objX, appY - 12)
      }
      ctx.textAlign = "left"

      // ── 8. 人物（站在岸上，眼睛接收光线）──
      ctx.fillStyle = arrowColor
      ctx.strokeStyle = arrowColor
      ctx.lineWidth = 2.5
      ctx.lineCap = "round"
      ctx.lineJoin = "round"

      // 头（圆形）
      const headR = 7
      const headCY = eyeY + 5    // 眼睛在头部偏上位置
      ctx.beginPath()
      ctx.arc(eyeX, headCY, headR, 0, Math.PI * 2)
      ctx.stroke()

      // 身体
      const bodyEnd = eyeY + 45
      ctx.beginPath()
      ctx.moveTo(eyeX, headCY + headR)
      ctx.lineTo(eyeX, bodyEnd)
      ctx.stroke()

      // 腿（双脚分开，脚踩在地面上）
      const groundY = groundTop
      if (bodyEnd < groundY) {
        ctx.beginPath()
        ctx.moveTo(eyeX, bodyEnd)
        ctx.lineTo(eyeX - 10, groundY)
        ctx.stroke()
        ctx.beginPath()
        ctx.moveTo(eyeX, bodyEnd)
        ctx.lineTo(eyeX + 10, groundY)
        ctx.stroke()
      }

      // 光线终点标记（小圆点表示眼睛）
      ctx.beginPath()
      ctx.arc(eyeX, eyeY, 3, 0, Math.PI * 2)
      ctx.fill()

      // 标注
      ctx.fillStyle = labelColor
      ctx.font = "bold 11px sans-serif"
      ctx.textAlign = "center"
      ctx.fillText("人", eyeX, eyeY - 14)
      ctx.textAlign = "left"

      // ── 9. 深度刻度尺（最左侧）──
      const rulerX = cw * 0.03        // 深度数据位置
      const lineFrom = cw * 0.13      // 水平线起点
      const lineTo = cw * 0.50        // 水平线终点

      // 水面标记
      ctx.strokeStyle = labelColor
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.moveTo(rulerX, surfaceY)
      ctx.lineTo(rulerX + 8, surfaceY)
      ctx.stroke()
      ctx.fillStyle = dimColor
      ctx.font = "10px sans-serif"
      ctx.textAlign = "left"
      ctx.fillText("水面", rulerX + 12, surfaceY + 4)

      // 左侧刻度竖线（水面到实深）
      ctx.strokeStyle = "rgba(0,0,0,0.08)"
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(rulerX + 4, surfaceY + 2)
      ctx.lineTo(rulerX + 4, objY)
      ctx.stroke()

      // 实深：数据+线（实物色）
      ctx.fillStyle = arrowColor
      ctx.font = "bold 12px sans-serif"
      ctx.fillText(`${p.depth} cm`, rulerX + 2, objY + 4)
      ctx.setLineDash([4, 4])
      ctx.strokeStyle = arrowColor
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(lineFrom, objY)
      ctx.lineTo(lineTo, objY)
      ctx.stroke()
      ctx.setLineDash([])

      // 视深：数据+线（红色）
      if (appD_px > 6 && appY > surfaceY) {
        const appDepthVal = p.depth * (cos2 / n1) / cos1
        ctx.fillStyle = "#e74c3c"
        ctx.font = "bold 12px sans-serif"
        ctx.fillText(`${appDepthVal.toFixed(1)} cm`, rulerX + 2, appY + 4)
        ctx.setLineDash([4, 4])
        ctx.strokeStyle = "#e74c3c"
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(lineFrom, appY)
        ctx.lineTo(lineTo, appY)
        ctx.stroke()
        ctx.setLineDash([])
      }

      // ── 11. 角度标注 ──
      const arcR2 = 30
      const arcR1 = 25
      // θ₂（空气中，法线与折射光线夹角）
      if (p.viewAngle > 3) {
        ctx.strokeStyle = labelColor
        ctx.lineWidth = 1
        ctx.beginPath()
        // 屏幕坐标 y↓：法线向上 = -π/2，折射光线方向 = -π/2 + θ₂
        ctx.arc(hitX, intY, arcR2, -Math.PI / 2, -Math.PI / 2 + theta2)
        ctx.stroke()
        // 标签
        const la2 = -Math.PI / 2 + theta2 / 2
        ctx.fillStyle = labelColor
        ctx.font = "11px sans-serif"
        ctx.textAlign = "center"
        ctx.fillText(`θ₂=${p.viewAngle}°`, hitX + (arcR2 + 16) * Math.cos(la2),
          intY + (arcR2 + 16) * Math.sin(la2))
      }

      // θ₁（水中，法线与水中光线夹角）
      if (theta1 > 0.04) {
        const theta1deg = theta1 * 180 / Math.PI
        ctx.strokeStyle = dimColor
        ctx.lineWidth = 1
        ctx.beginPath()
        // 屏幕坐标 y↓：法线向下 = π/2，水中光线方向 = π/2 + θ₁
        ctx.arc(hitX, intY, arcR1, Math.PI / 2, Math.PI / 2 + theta1)
        ctx.stroke()
        // 标签
        const la1 = Math.PI / 2 + theta1 / 2
        ctx.fillStyle = dimColor
        ctx.font = "11px sans-serif"
        ctx.textAlign = "center"
        ctx.fillText(`θ₁=${theta1deg.toFixed(1)}°`, hitX + (arcR1 + 16) * Math.cos(la1),
          intY + (arcR1 + 16) * Math.sin(la1))
      }

      // ── 12. 介质标签 ──
      ctx.fillStyle = dimColor
      ctx.font = "bold 11px sans-serif"
      ctx.textAlign = "left"
      ctx.fillText(`空气 (n₂=1.0)`, cw * 0.40, surfaceY - 16)
      ctx.fillText(`水 (n₁=${n1.toFixed(2)})`, cw * 0.40, surfaceY + 20)

      ctx.textAlign = "left"
    },
  },

  // ── 水下光照 ──
  "underwater-light": {
    drawObject: () => {},
    drawExtra: (ctx, s, p, w2s, getTheme) => {
      const isDark = getTheme && getTheme() === "dark"
      const dpr = window.devicePixelRatio || 1
      const cw = ctx.canvas.width / dpr
      const ch = ctx.canvas.height / dpr

      // ── 布局常量 ──
      const surfaceY = ch * 0.33                // 水面 Y
      const D_px = p.depth * 0.5                // 水深（像素）
      const groundLeft = cw * 0.68              // 岸边界（水面到此为止）
      const sourceX = groundLeft * (p.sourcePos / 100)  // 光源 X（占水池宽度百分比）
      const sourceY = surfaceY + D_px           // 光源 Y（水面下）
      const wallX = cw * 0.86                   // 墙 X 位置
      const wallW = 16                          // 墙厚
      const wallTop = 18                        // 墙顶 Y

      // ── 物理计算 ──
      const n1 = p.refractiveIndex              // 水折射率
      const n2 = 1.0                            // 空气折射率
      const theta_c = Math.asin(Math.min(1, n2 / n1))  // 全反射临界角
      const theta_c_deg = theta_c * 180 / Math.PI

      // ── 调色板 ──
      const waterFill = isDark ? "rgba(52,152,219,0.22)" : "rgba(52,152,219,0.12)"
      const waterLine = isDark ? "rgba(52,152,219,0.7)" : "rgba(52,152,219,0.5)"
      const rippleColor = isDark ? "rgba(52,152,219,0.12)" : "rgba(52,152,219,0.06)"
      const landFill = isDark ? "rgba(139,90,43,0.30)" : "rgba(139,90,43,0.10)"
      const landLine = isDark ? "rgba(139,90,43,0.7)" : "rgba(139,90,43,0.4)"
      const wallFill = isDark ? "rgba(180,180,180,0.12)" : "rgba(180,180,180,0.18)"
      const wallLine = isDark ? "rgba(180,180,180,0.4)" : "rgba(180,180,180,0.6)"
      const labelColor = isDark ? "rgba(255,255,255,0.85)" : "rgba(0,0,0,0.7)"
      const dimColor = isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.35)"
      const arrowColor = isDark ? "#eee" : "#333"
      const highlightColor = "#e74c3c"
      const tirColor = isDark ? "rgba(231,76,60,0.5)" : "rgba(231,76,60,0.45)"

      // ── 1. 水池 ──
      ctx.fillStyle = waterFill
      ctx.fillRect(0, surfaceY, cw, ch - surfaceY)

      // 水面波纹
      ctx.strokeStyle = rippleColor
      ctx.lineWidth = 1
      for (let i = 0; i < 5; i++) {
        const wx = 50 + i * 80
        if (wx + 30 > groundLeft) break
        ctx.beginPath()
        ctx.moveTo(wx, surfaceY + 2)
        ctx.quadraticCurveTo(wx + 15, surfaceY - 5, wx + 30, surfaceY + 2)
        ctx.stroke()
      }

      // ── 2. 陆地 ──
      ctx.fillStyle = landFill
      ctx.fillRect(groundLeft, surfaceY, cw - groundLeft, ch - surfaceY)
      ctx.strokeStyle = landLine
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(groundLeft, surfaceY)
      ctx.lineTo(cw, surfaceY)
      ctx.stroke()

      // ── 3. 水面线 ──
      ctx.strokeStyle = waterLine
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.moveTo(0, surfaceY)
      ctx.lineTo(groundLeft, surfaceY)
      ctx.stroke()

      // ── 4. 墙 ──
      ctx.fillStyle = wallFill
      ctx.fillRect(wallX, wallTop, wallW, surfaceY - wallTop)
      ctx.strokeStyle = wallLine
      ctx.lineWidth = 1.5
      ctx.strokeRect(wallX, wallTop, wallW, surfaceY - wallTop)

      // ── 5. 光线簇 ──
      const numRays = 40
      const maxAngle = Math.min(theta_c + 22 * Math.PI / 180, 82 * Math.PI / 180)
      const escapeRays = []  // { theta, hitX, phi, wallY }
      const tirRays = []     // { theta, hitX }

      // 计算所有光线
      for (let i = 0; i <= numRays; i++) {
        const theta = maxAngle * i / numRays
        if (theta < 0.001) continue
        const tanTheta = Math.tan(theta)
        const hitX = sourceX + D_px * tanTheta
        if (hitX > groundLeft) continue

        if (theta < theta_c) {
          const sinPhi = n1 * Math.sin(theta) / n2
          if (sinPhi > 1) continue
          const phi = Math.asin(sinPhi)
          const tanPhi = Math.tan(phi)
          const wallY = surfaceY - (wallX - hitX) / tanPhi
          escapeRays.push({ theta, hitX, phi, wallY, tanTheta })
        } else {
          tirRays.push({ theta, hitX, tanTheta })
        }
      }

      // ── 5a. 全反射光线（画在下面）──
      ctx.lineWidth = 1
      for (const r of tirRays) {
        const refLen = Math.min(D_px * 0.6, 80)
        const refX = r.hitX - refLen * Math.sin(r.theta)
        const refY = surfaceY + refLen * Math.cos(r.theta)
        ctx.setLineDash([4, 5])
        ctx.strokeStyle = tirColor
        ctx.beginPath()
        ctx.moveTo(sourceX, sourceY)
        ctx.lineTo(r.hitX, surfaceY)
        ctx.lineTo(refX, refY)
        ctx.stroke()
        ctx.setLineDash([])
      }

      // ── 5b. 射出光线（暖黄色）──
      ctx.lineWidth = 1.5
      for (const r of escapeRays) {
        if (r.wallY < wallTop || r.wallY > surfaceY + 20) continue
        const t = Math.max(0, Math.min(1, r.theta / theta_c))
        const alpha = 0.35 + 0.5 * (1 - t * t)
        ctx.strokeStyle = `rgba(241,196,15,${alpha})`
        ctx.beginPath()
        ctx.moveTo(sourceX, sourceY)
        ctx.lineTo(r.hitX, surfaceY)
        ctx.lineTo(wallX, r.wallY)
        ctx.stroke()
      }

      // ── 6. 墙上照亮区域 ──
      const validHits = escapeRays.filter(r => r.wallY >= wallTop && r.wallY <= surfaceY)
      if (validHits.length > 2) {
        const ys = validHits.map(r => r.wallY)
        const illMin = Math.min(...ys)
        const illMax = Math.max(...ys)
        const illH = illMax - illMin

        const grad = ctx.createLinearGradient(wallX, illMin, wallX, illMax)
        grad.addColorStop(0, "rgba(241,196,15,0.28)")
        grad.addColorStop(0.5, "rgba(241,196,15,0.15)")
        grad.addColorStop(1, "rgba(241,196,15,0.04)")
        ctx.fillStyle = grad
        ctx.fillRect(wallX + 1, illMin, wallW - 2, illH + 1)

        ctx.fillStyle = "#f1c40f"
        ctx.font = "bold 10px sans-serif"
        ctx.textAlign = "left"
        const labelMid = (illMin + illMax) / 2
        if (illH > 30) {
          ctx.fillText("← 照亮区域", wallX + wallW + 5, labelMid + 3)
        }
      }

      // ── 7. 光源（亮黄色）──
      for (let r = 28; r >= 6; r -= 3) {
        ctx.beginPath()
        ctx.arc(sourceX, sourceY, r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(241,196,15,${(1 - r / 28) * 0.35})`
        ctx.fill()
      }
      ctx.beginPath()
      ctx.arc(sourceX, sourceY, 7, 0, Math.PI * 2)
      ctx.fillStyle = "#f1c40f"
      ctx.fill()
      ctx.beginPath()
      ctx.arc(sourceX, sourceY, 4, 0, Math.PI * 2)
      ctx.fillStyle = "#fff"
      ctx.fill()

      ctx.fillStyle = arrowColor
      ctx.font = "bold 12px sans-serif"
      ctx.textAlign = "center"
      ctx.fillText("光源", sourceX, sourceY + 20)

      // ── 8. 临界角光线突出显示 ──
      if (theta_c_deg > 2) {
        const hitX_c = sourceX + D_px * Math.tan(theta_c)

        if (hitX_c <= groundLeft) {
          // 水中的临界角光线（红色实线）
          ctx.strokeStyle = highlightColor
          ctx.lineWidth = 3
          ctx.beginPath()
          ctx.moveTo(sourceX, sourceY)
          ctx.lineTo(hitX_c, surfaceY)
          ctx.stroke()

          // 贴水面折射光（红色虚线）
          ctx.setLineDash([5, 4])
          ctx.strokeStyle = "rgba(231,76,60,0.35)"
          ctx.lineWidth = 1.5
          ctx.beginPath()
          ctx.moveTo(hitX_c, surfaceY)
          ctx.lineTo(cw, surfaceY)
          ctx.stroke()
          ctx.setLineDash([])

          // 临界角标签
          const midX = (sourceX + hitX_c) / 2
          const midY = (sourceY + surfaceY) / 2
          ctx.fillStyle = highlightColor
          ctx.font = "bold 11px sans-serif"
          ctx.textAlign = "center"
          ctx.fillText(`θ_c = ${theta_c_deg.toFixed(1)}°`, midX - 38, midY + 5)
        }
      }

      // ── 9. 全反射标注 ──
      if (tirRays.length > 0) {
        const midIdx = Math.floor(tirRays.length / 2)
        const r = tirRays[midIdx]
        const labelX = (sourceX + r.hitX) / 2
        const labelY = (sourceY + surfaceY) / 2
        ctx.fillStyle = tirColor
        ctx.font = "10px sans-serif"
        ctx.textAlign = "center"
        ctx.fillText("全反射", labelX + 50, labelY + 4)
      }

      // ── 10. 深度刻度尺 ──
      const rulerX = cw * 0.03

      // 水面标记
      ctx.strokeStyle = labelColor
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.moveTo(rulerX, surfaceY)
      ctx.lineTo(rulerX + 8, surfaceY)
      ctx.stroke()
      ctx.fillStyle = dimColor
      ctx.font = "10px sans-serif"
      ctx.textAlign = "left"
      ctx.fillText("水面", rulerX + 12, surfaceY + 4)

      // 刻度竖线
      ctx.strokeStyle = "rgba(0,0,0,0.08)"
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(rulerX + 4, surfaceY + 2)
      ctx.lineTo(rulerX + 4, sourceY)
      ctx.stroke()

      // 水深数值（实物色）
      ctx.fillStyle = arrowColor
      ctx.font = "bold 12px sans-serif"
      ctx.fillText(`${p.depth} cm`, rulerX + 2, sourceY + 4)

      // ── 11. 介质标签 ──
      ctx.fillStyle = dimColor
      ctx.font = "bold 12px sans-serif"
      ctx.textAlign = "left"
      ctx.fillText(`水 (n₁ = ${n1.toFixed(2)})`, cw * 0.39, surfaceY + 22)
      ctx.fillText(`空气 (n₂ = 1.00)`, cw * 0.39, surfaceY - 14)

      // ── 12. 墙标注 ──
      ctx.fillStyle = labelColor
      ctx.font = "bold 11px sans-serif"
      ctx.textAlign = "center"
      ctx.fillText("墙", wallX + wallW / 2, wallTop + 14)

      // ── 13. 底部信息 ──
      ctx.fillStyle = dimColor
      ctx.font = "10px sans-serif"
      ctx.textAlign = "right"
      const maxRadius = D_px * Math.tan(theta_c)
      ctx.fillText(`水面光斑半径 ≈ ${maxRadius.toFixed(0)} px | 临界角 ${theta_c_deg.toFixed(1)}°`, cw - 12, ch - 10)

      ctx.textAlign = "left"
    },
  },

}
