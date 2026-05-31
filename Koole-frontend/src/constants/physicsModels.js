// 世界坐标系：x 向右为正，y 向上为正，地面 y=0
// 球半径为 12px，要使球贴地，球心应 y = 12/30 = 0.4

export const DRAW_SCALE = 30 // 像素/米
export const GROUND_Y = 0.4 // 球心贴地高度（球半径/DRAW_SCALE）
export const PHYSICS_MODELS = [
  // ── 1. 自由落体 ──
  {
    id: "free-fall",
    name: "自由落体",
    desc: "物体在重力作用下的竖直下落",
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="2" x2="12" y2="12"/><path d="M12 12l-3 3"/><path d="M12 12l3 3"/><circle cx="12" cy="18" r="3"/></svg>`,
    params: [
      { key: "height", label: "初始高度 (m)", value: 15, min: 1, max: 50, step: 0.5 },
      { key: "gravity", label: "重力加速度 (m/s²)", value: 9.8, min: 1, max: 20, step: 0.1 },
    ],
    createState: (p) => ({ y: p.height + GROUND_Y, vy: 0, trail: [] }),
    step: (s, p, dt) => {
      s.vy += p.gravity * dt
      s.y -= s.vy * dt
      if (s.y <= GROUND_Y && s.vy >= 0) { s.y = GROUND_Y; s.vy = 0 }
    },
    isFinished: (s) => s.y <= GROUND_Y && s.vy <= 0,
    getBallPosition: (s) => ({ x: 0, y: s.y }),
    getTrailPosition: (s) => ({ x: 0, y: s.y }),
    getInfoLines: (s, p, t) => [
      `下落高度: ${(p.height + GROUND_Y - s.y).toFixed(1)} m`,
      `速度: ${s.vy.toFixed(1)} m/s`,
      `时间: ${t.toFixed(2)} s`,
      `重力: ${p.gravity} m/s²`,
    ],
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
  {
    id: "projectile",
    name: "平抛运动",
    desc: "水平初速度与重力合成抛物线轨迹",
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 20h20"/><path d="M6 16l4-8 4 4 4-8" stroke-dasharray="2 2"/><circle cx="18" cy="8" r="2"/></svg>`,
    params: [
      { key: "height", label: "初始高度 (m)", value: 15, min: 1, max: 50, step: 0.5 },
      { key: "vx", label: "水平速度 (m/s)", value: 5, min: 1, max: 20, step: 0.5 },
      { key: "gravity", label: "重力加速度 (m/s²)", value: 9.8, min: 1, max: 20, step: 0.1 },
    ],
    createState: (p) => ({ x: 0, y: p.height + GROUND_Y, vx: p.vx, vy: 0, trail: [] }),
    step: (s, p, dt) => {
      s.vy += p.gravity * dt
      s.x += s.vx * dt
      s.y -= s.vy * dt
      if (s.y <= GROUND_Y && s.vy >= 0) { s.y = GROUND_Y; s.vy = 0 }
    },
    isFinished: (s) => s.y <= GROUND_Y,
    getBallPosition: (s) => ({ x: s.x, y: s.y }),
    getTrailPosition: (s) => ({ x: s.x, y: s.y }),
    getInfoLines: (s, p, t) => [
      `水平位移: ${s.x.toFixed(1)} m`,
      `下落高度: ${(p.height + GROUND_Y - s.y).toFixed(1)} m`,
      `水平速度: ${s.vx.toFixed(1)} m/s`,
      `竖直速度: ${s.vy.toFixed(1)} m/s`,
      `时间: ${t.toFixed(2)} s`,
    ],
    drawExtra: (ctx, s, p, w2s) => {
      const speed = Math.sqrt(s.vx * s.vx + s.vy * s.vy)
      if (speed < 0.2 || s.y <= 0) return
      const pos = w2s(s.x, s.y)
      // Vx (蓝色水平)
      const vxLen = s.vx * 5
      ctx.beginPath()
      ctx.moveTo(pos.x, pos.y)
      ctx.lineTo(pos.x + vxLen, pos.y)
      ctx.strokeStyle = "#3498db"
      ctx.lineWidth = 2
      ctx.stroke()
      // Vx 箭头
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
      // Vy (绿色竖直向下)
      const vyLen = s.vy * 5
      ctx.beginPath()
      ctx.moveTo(pos.x, pos.y)
      ctx.lineTo(pos.x, pos.y + vyLen)
      ctx.strokeStyle = "#2ecc71"
      ctx.lineWidth = 2
      ctx.stroke()
      // Vy 箭头
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
      // 合速度 V（红色）
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
  {
    id: "vertical-throw",
    name: "竖直上抛",
    desc: "物体以初速度竖直上抛，先升后落",
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="20" x2="12" y2="4"/><path d="M8 8l4-4 4 4"/><circle cx="12" cy="16" r="2"/></svg>`,
    params: [
      { key: "initialVelocity", label: "初速度 (m/s)", value: 15, min: 5, max: 40, step: 0.5 },
      { key: "gravity", label: "重力加速度 (m/s²)", value: 9.8, min: 1, max: 20, step: 0.1 },
    ],
    createState: (p) => ({ y: GROUND_Y, vy: p.initialVelocity, trail: [] }),
    step: (s, p, dt) => {
      s.vy -= p.gravity * dt
      s.y += s.vy * dt
      if (s.y <= GROUND_Y && s.vy <= 0) { s.y = GROUND_Y; s.vy = 0 }
    },
    isFinished: (s) => s.y <= GROUND_Y && s.vy <= 0,
    getBallPosition: (s) => ({ x: 0, y: s.y }),
    getTrailPosition: (s) => ({ x: 0, y: s.y }),
    getInfoLines: (s, p, t) => [
      `高度: ${s.y.toFixed(1)} m`,
      `速度: ${s.vy.toFixed(1)} m/s`,
      `时间: ${t.toFixed(2)} s`,
      `最大高度: ${(p.initialVelocity * p.initialVelocity / (2 * p.gravity)).toFixed(1)} m`,
    ],
    drawExtra: (ctx, s, p, w2s) => {
      if (Math.abs(s.vy) < 0.2 || s.y <= 0) return
      const pos = w2s(0, s.y)
      const len = Math.min(Math.abs(s.vy) * 5, 110)
      const sign = s.vy > 0 ? 1 : -1
      const tipX = pos.x
      const tipY = pos.y - len * sign
      ctx.beginPath()
      ctx.moveTo(pos.x, pos.y)
      ctx.lineTo(tipX, tipY)
      ctx.strokeStyle = "#e74c3c"
      ctx.lineWidth = 2.5
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(tipX, tipY)
      ctx.lineTo(tipX - 6, tipY + 10 * sign)
      ctx.lineTo(tipX + 6, tipY + 10 * sign)
      ctx.closePath()
      ctx.fillStyle = "#e74c3c"
      ctx.fill()
      ctx.fillStyle = "#e74c3c"
      ctx.font = "bold 11px sans-serif"
      ctx.fillText("V", pos.x + 10, (pos.y + tipY) / 2 + 4)
    },
  },

  // ── 4. 圆周运动 ──
  {
    id: "circular",
    name: "圆周运动",
    desc: "质点做匀速圆周运动，显示向心力",
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="2"/><line x1="12" y1="12" x2="8" y2="8" stroke="red"/></svg>`,
    params: [
      { key: "radius", label: "轨道半径 (m)", value: 5, min: 1, max: 15, step: 0.5 },
      { key: "omega", label: "角速度 (rad/s)", value: 2, min: 0.5, max: 6, step: 0.1 },
    ],
    createState: (p) => ({ angle: 0, trail: [] }),
    step: (s, p, dt) => {
      s.angle += p.omega * dt
    },
    isFinished: () => false,
    getBallPosition: (s, p) => ({
      x: p.radius * Math.cos(s.angle),
      y: p.radius * Math.sin(s.angle) + p.radius,
    }),
    getTrailPosition: (s, p) => null, // 轨迹就是圆形轨道本身，静态绘制
    getInfoLines: (s, p, t) => {
      const v = p.omega * p.radius
      const ac = v * v / p.radius
      return [
        `轨道半径: ${p.radius} m`,
        `线速度: ${v.toFixed(2)} m/s`,
        `角速度: ${p.omega.toFixed(1)} rad/s`,
        `向心加速度: ${ac.toFixed(2)} m/s²`,
        `周期: ${(2 * Math.PI / p.omega).toFixed(2)} s`,
      ]
    },
    // 额外绘制：轨道圆 + 向心力矢量
    drawExtra: (ctx, s, p, w2s) => {
      const center = w2s(0, p.radius)
      const ball = w2s(p.radius * Math.cos(s.angle), p.radius * Math.sin(s.angle) + p.radius)

      // 轨道圆（虚线）
      const rPx = p.radius * DRAW_SCALE
      ctx.beginPath()
      ctx.arc(center.x, center.y, rPx, 0, Math.PI * 2)
      ctx.strokeStyle = "rgba(52, 152, 219, 0.3)"
      ctx.lineWidth = 1.5
      ctx.setLineDash([6, 4])
      ctx.stroke()
      ctx.setLineDash([])

      // 半径线
      ctx.beginPath()
      ctx.moveTo(center.x, center.y)
      ctx.lineTo(ball.x, ball.y)
      ctx.strokeStyle = "rgba(0,0,0,0.15)"
      ctx.lineWidth = 1
      ctx.stroke()

      // 向心力矢量（指向圆心）
      const dx = center.x - ball.x
      const dy = center.y - ball.y
      const len = Math.sqrt(dx * dx + dy * dy)
      if (len > 1) {
        const nx = dx / len
        const ny = dy / len
        const arrowLen = Math.min(60, len * 0.6)
        ctx.beginPath()
        ctx.moveTo(ball.x, ball.y)
        ctx.lineTo(ball.x + nx * arrowLen, ball.y + ny * arrowLen)
        ctx.strokeStyle = "#e74c3c"
        ctx.lineWidth = 2.5
        ctx.stroke()
        // 箭头
        ctx.beginPath()
        ctx.moveTo(ball.x + nx * arrowLen, ball.y + ny * arrowLen)
        ctx.lineTo(ball.x + nx * arrowLen - 6, ball.y + ny * arrowLen - 4)
        ctx.lineTo(ball.x + nx * arrowLen - 6, ball.y + ny * arrowLen + 4)
        ctx.closePath()
        ctx.fillStyle = "#e74c3c"
        ctx.fill()
        // 标签
        ctx.fillStyle = "#e74c3c"
        ctx.font = "bold 12px sans-serif"
        ctx.fillText("F心", ball.x + nx * arrowLen * 0.5 - 12, ball.y + ny * arrowLen * 0.5 - 8)
      }
      // 切向速度箭头
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
  {
    id: "incline",
    name: "斜面滑动",
    desc: "物体在光滑斜面上的加速下滑",
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="20,2 2,22 22,22" fill="rgba(0,0,0,0.05)"/><circle cx="14" cy="14" r="2"/></svg>`,
    params: [
      { key: "angle", label: "斜面角度 (°)", value: 30, min: 5, max: 75, step: 1 },
      { key: "rampHeight", label: "斜面高度 (m)", value: 10, min: 2, max: 30, step: 0.5 },
      { key: "gravity", label: "重力加速度 (m/s²)", value: 9.8, min: 1, max: 20, step: 0.1 },
    ],
    createState: (p) => {
      const theta = p.angle * Math.PI / 180
      const rampLen = p.rampHeight / Math.sin(theta)
      return { dist: 0, vel: 0, rampLen, trail: [] }
    },
    step: (s, p, dt) => {
      const theta = p.angle * Math.PI / 180
      const accel = p.gravity * Math.sin(theta)
      s.vel += accel * dt
      s.dist += s.vel * dt
      if (s.dist >= s.rampLen) { s.dist = s.rampLen; s.vel = 0 }
    },
    isFinished: (s) => s.dist >= s.rampLen,
    getBallPosition: (s, p) => {
      const theta = p.angle * Math.PI / 180
      return {
        x: s.dist * Math.cos(theta),
        y: p.rampHeight - s.dist * Math.sin(theta),
      }
    },
    getTrailPosition: (s, p) => {
      const theta = p.angle * Math.PI / 180
      return {
        x: s.dist * Math.cos(theta),
        y: p.rampHeight - s.dist * Math.sin(theta),
      }
    },
    getInfoLines: (s, p, t) => [
      `下滑距离: ${s.dist.toFixed(1)} m`,
      `速度: ${s.vel.toFixed(2)} m/s`,
      `加速度: ${(p.gravity * Math.sin(p.angle * Math.PI / 180)).toFixed(2)} m/s²`,
      `时间: ${t.toFixed(2)} s`,
    ],
    drawExtra: (ctx, s, p, w2s) => {
      const theta = p.angle * Math.PI / 180
      const rampLen = s.rampLen
      // 斜面三角形（底部在地面 y=0）
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
      // 角度标注
      const labelX = bottom.x + 20
      const labelY = bottom.y - 10
      ctx.fillStyle = "rgba(0,0,0,0.4)"
      ctx.font = "12px sans-serif"
      ctx.fillText(`θ = ${p.angle}°`, labelX, labelY)
      // 速度方向箭头（沿斜面向下）
      if (s.vel > 0.2 && s.dist < s.rampLen) {
        const ballPos = w2s(s.dist * Math.cos(theta), p.rampHeight - s.dist * Math.sin(theta))
        const sc = 3
        const len = Math.min(s.vel * sc, 80)
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

  // ── 6. 单摆（简谐振动） ──
  {
    id: "pendulum",
    name: "单摆",
    desc: "单摆在重力作用下的周期性摆动",
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="2" x2="18" y2="16"/><circle cx="18" cy="18" r="2"/><line x1="12" y1="2" x2="12" y2="20" stroke-dasharray="2 2" opacity="0.3"/></svg>`,
    params: [
      { key: "length", label: "摆长 (m)", value: 5, min: 1, max: 15, step: 0.5 },
      { key: "initAngle", label: "初始角度 (°)", value: 30, min: 5, max: 60, step: 1 },
      { key: "gravity", label: "重力加速度 (m/s²)", value: 9.8, min: 1, max: 20, step: 0.1 },
    ],
    createState: (p) => {
      const theta0 = p.initAngle * Math.PI / 180
      return { theta: theta0, omega: 0, trail: [] }
    },
    step: (s, p, dt) => {
      const g = p.gravity
      const L = p.length
      // 小角近似：α = -(g/L) * θ
      const alpha = -(g / L) * s.theta
      s.omega += alpha * dt
      s.theta += s.omega * dt
    },
    isFinished: () => false,
    getBallPosition: (s, p) => ({
      x: p.length * Math.sin(s.theta),
      y: p.length - p.length * Math.cos(s.theta) + GROUND_Y,
    }),
    getTrailPosition: (s, p) => ({
      x: p.length * Math.sin(s.theta),
      y: p.length - p.length * Math.cos(s.theta) + GROUND_Y,
    }),
    getInfoLines: (s, p, t) => {
      const period = 2 * Math.PI * Math.sqrt(p.length / p.gravity)
      return [
        `摆角: ${(s.theta * 180 / Math.PI).toFixed(1)}°`,
        `角速度: ${s.omega.toFixed(2)} rad/s`,
        `周期: ${period.toFixed(2)} s`,
        `摆长: ${p.length} m`,
      ]
    },
    drawExtra: (ctx, s, p, w2s) => {
      const pivot = w2s(0, p.length)
      const ball = w2s(p.length * Math.sin(s.theta), p.length - p.length * Math.cos(s.theta) + GROUND_Y)

      // 摆线（细绳）
      ctx.beginPath()
      ctx.moveTo(pivot.x, pivot.y)
      ctx.lineTo(ball.x, ball.y)
      ctx.strokeStyle = "#999"
      ctx.lineWidth = 1.5
      ctx.stroke()

      // 竖直参考线
      ctx.beginPath()
      ctx.moveTo(pivot.x, pivot.y)
      ctx.lineTo(pivot.x, ball.y + 20)
      ctx.strokeStyle = "rgba(0,0,0,0.1)"
      ctx.lineWidth = 1
      ctx.setLineDash([3, 3])
      ctx.stroke()
      ctx.setLineDash([])

      // 角度弧
      const r = 30
      const startAngle = -Math.PI / 2
      const endAngle = -Math.PI / 2 + Math.min(Math.max(s.theta, -Math.PI / 2), Math.PI / 2)
      ctx.beginPath()
      ctx.arc(pivot.x, pivot.y, r, s.theta > 0 ? startAngle : endAngle, s.theta > 0 ? endAngle : startAngle)
      ctx.strokeStyle = "rgba(0,0,0,0.3)"
      ctx.lineWidth = 1
      ctx.stroke()
      // 切向速度箭头
      const tangSpeed = Math.abs(s.omega) * p.length
      if (tangSpeed > 0.05) {
        const sc = 8
        const len = Math.min(tangSpeed * sc, 70)
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

  // ── 7. 斜向上抛运动 ──
  {
    id: "angled-projectile",
    name: "斜向上抛",
    desc: "物体以一定角度斜向上抛出，抛物线运动",
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="2" y1="20" x2="22" y2="20"/><path d="M4 20 Q12 2 20 16" stroke-dasharray="3 2"/><circle cx="20" cy="16" r="2"/><line x1="4" y1="20" x2="10" y2="10"/><polyline points="11 6 10 10 14 9"/></svg>`,
    params: [
      { key: "initialVelocity", label: "初速度 (m/s)", value: 15, min: 5, max: 40, step: 0.5 },
      { key: "angle", label: "抛射角 (°)", value: 45, min: 5, max: 85, step: 1 },
      { key: "gravity", label: "重力加速度 (m/s²)", value: 9.8, min: 1, max: 20, step: 0.1 },
    ],
    createState: (p) => {
      const theta = p.angle * Math.PI / 180
      return { x: 0, y: GROUND_Y, vx: p.initialVelocity * Math.cos(theta), vy: p.initialVelocity * Math.sin(theta), trail: [] }
    },
    step: (s, p, dt) => {
      s.vy -= p.gravity * dt
      s.x += s.vx * dt
      s.y += s.vy * dt
      if (s.y <= GROUND_Y && s.vy <= 0) { s.y = GROUND_Y; s.vy = 0 }
    },
    isFinished: (s) => s.y <= GROUND_Y && s.vy <= 0,
    getBallPosition: (s) => ({ x: s.x, y: s.y }),
    getTrailPosition: (s) => ({ x: s.x, y: s.y }),
    getInfoLines: (s, p, t) => {
      const theta = p.angle * Math.PI / 180
      const v0 = p.initialVelocity
      const g = p.gravity
      const speed = Math.sqrt(s.vx * s.vx + s.vy * s.vy)
      const maxH = (v0 * Math.sin(theta)) ** 2 / (2 * g)
      const range = v0 * v0 * Math.sin(2 * theta) / g
      const totalTime = 2 * v0 * Math.sin(theta) / g
      return [
        `水平位移: ${s.x.toFixed(1)} m`,
        `高度: ${Math.max(s.y, 0).toFixed(1)} m`,
        `速度: ${speed.toFixed(1)} m/s`,
        `最大高度: ${maxH.toFixed(1)} m`,
        `射程: ${range.toFixed(1)} m`,
        `时间: ${t.toFixed(2)} / ${totalTime.toFixed(2)} s`,
      ]
    },
    drawExtra: (ctx, s, p, w2s) => {
      // 抛射角弧线标注
      const start = w2s(0, 0)
      const theta = p.angle * Math.PI / 180
      const arcR = 36
      ctx.beginPath()
      ctx.arc(start.x, start.y, arcR, -Math.PI / 2, -Math.PI / 2 + Math.min(theta, Math.PI / 2))
      ctx.strokeStyle = "rgba(0,0,0,0.2)"
      ctx.lineWidth = 1
      ctx.stroke()
      // 角度标签
      const midA = -Math.PI / 2 + theta / 2
      ctx.fillStyle = "rgba(0,0,0,0.35)"
      ctx.font = "11px sans-serif"
      ctx.fillText(`θ=${p.angle}°`, start.x + (arcR + 8) * Math.cos(midA) - 12, start.y + (arcR + 8) * Math.sin(midA) + 4)

      // 当前速度矢量分解（仅在空中时显示）
      const pos = w2s(s.x, s.y)
      const speed = Math.sqrt(s.vx * s.vx + s.vy * s.vy)
      if (speed > 0.1 && s.y > 0.5) {
        const sc = 8
        // Vx 水平分量（蓝）
        ctx.beginPath()
        ctx.moveTo(pos.x, pos.y)
        ctx.lineTo(pos.x + s.vx * sc, pos.y)
        ctx.strokeStyle = "#3498db"
        ctx.lineWidth = 2
        ctx.stroke()
        ctx.fillStyle = "#3498db"
        ctx.font = "11px sans-serif"
        ctx.fillText("Vx", pos.x + s.vx * sc * 0.5 - 8, pos.y + 14)
        // Vy 竖直分量（绿）
        ctx.beginPath()
        ctx.moveTo(pos.x, pos.y)
        ctx.lineTo(pos.x, pos.y - s.vy * sc)
        ctx.strokeStyle = "#2ecc71"
        ctx.lineWidth = 2
        ctx.stroke()
        ctx.fillStyle = "#2ecc71"
        ctx.fillText("Vy", pos.x + 6, pos.y - s.vy * sc * 0.5)
        // 合速度（红）
        ctx.beginPath()
        ctx.moveTo(pos.x, pos.y)
        ctx.lineTo(pos.x + s.vx * sc, pos.y - s.vy * sc)
        ctx.strokeStyle = "#e74c3c"
        ctx.lineWidth = 2.5
        ctx.stroke()
        // 合速度箭头
        const endX = pos.x + s.vx * sc
        const endY = pos.y - s.vy * sc
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

  // ── 8. 小船过河模型 ──
  {
    id: "boat-river",
    name: "小船过河",
    desc: "小船在流水中的运动，合速度与渡河路径",
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="18" x2="20" y2="18"/><polygon points="10 18 14 18 12 12"/><path d="M6 13 Q9 11 12 13 Q15 15 18 13" opacity="0.35" stroke-width="1.5"/></svg>`,
    params: [
      { key: "riverWidth", label: "河宽 (m)", value: 30, min: 8, max: 60, step: 1 },
      { key: "boatSpeed", label: "船速 (m/s)", value: 4, min: 1, max: 10, step: 0.5 },
      { key: "currentSpeed", label: "水流速度 (m/s)", value: 2, min: 0, max: 8, step: 0.5 },
      { key: "headingAngle", label: "船头偏角 (°)", value: 0, min: -60, max: 60, step: 1 },
    ],
    // 船头偏角：与垂直过河方向的夹角，正顺流偏，负逆流偏
    // 速度：vx(顺流)=boatSpeed*sinθ+currentSpeed, vy(过河)=boatSpeed*cosθ
    createState: (p) => ({ x: 0, y: 0, riverWidth: p.riverWidth, trail: [] }),
    step: (s, p, dt) => {
      if (s.y >= s.riverWidth) return // 已到对岸，完全停止
      const theta = p.headingAngle * Math.PI / 180
      const vx = p.boatSpeed * Math.sin(theta) + p.currentSpeed
      const vy = p.boatSpeed * Math.cos(theta)
      s.x += vx * dt
      s.y += vy * dt
      if (s.y >= s.riverWidth) { s.y = s.riverWidth }
    },
    isFinished: (s) => s.y >= s.riverWidth,
    getBallPosition: (s) => ({ x: s.x, y: s.y }),
    getTrailPosition: (s) => ({ x: s.x, y: s.y }),
    getInfoLines: (s, p, t) => {
      const theta = p.headingAngle * Math.PI / 180
      const vx = p.boatSpeed * Math.sin(theta) + p.currentSpeed
      const vy = p.boatSpeed * Math.cos(theta)
      const vResult = Math.sqrt(vx * vx + vy * vy)
      const progress = s.y / s.riverWidth * 100
      const remainingDist = s.riverWidth - s.y
      const remainingTime = vy > 0.01 ? remainingDist / vy : Infinity
      // 最小偏移角提示（船速 > 水速时）
      let minAngleInfo = ""
      if (p.boatSpeed > p.currentSpeed) {
        const minDeg = -Math.asin(p.currentSpeed / p.boatSpeed) * 180 / Math.PI
        minAngleInfo = `最小偏移角: ${minDeg.toFixed(1)}°`
      }
      return [
        `渡河进度: ${Math.min(progress, 100).toFixed(0)}%`,
        `下游偏移: ${s.x.toFixed(1)} m`,
        `过河速度: ${vy.toFixed(2)} m/s`,
        `合速度: ${vResult.toFixed(2)} m/s`,
        `${vy > 0.01 ? "预计剩余: " + remainingTime.toFixed(2) + " s" : "无法到达对岸"}`,
        minAngleInfo,
      ].filter(Boolean)
    },
    drawExtra: (ctx, s, p, w2s) => {
      const canvas = ctx.canvas
      const dpr = window.devicePixelRatio || 1
      const cw = canvas.width / dpr
      const ch = canvas.height / dpr

      const farPt = w2s(0, p.riverWidth)
      const nearPt = w2s(0, 0)

      // 1. 河水底色覆盖整个画布（盖住主画的灰色背景和地面）
      ctx.fillStyle = "rgba(52, 152, 219, 0.08)"
      ctx.fillRect(0, 0, cw, ch)

      // 2. 对岸土地（从画布顶部到对岸线）
      if (farPt.y > 0) {
        ctx.fillStyle = "#2c3e50"
        ctx.fillRect(0, 0, cw, farPt.y)
      }
      // 对岸线
      ctx.beginPath()
      ctx.moveTo(0, farPt.y)
      ctx.lineTo(cw, farPt.y)
      ctx.strokeStyle = "#2c3e50"
      ctx.lineWidth = 3
      ctx.stroke()

      // 3. 水流方向指示箭头（在河水区域均匀分布）
      const flowLevels = [0.2, 0.4, 0.6, 0.8]
      for (const ratio of flowLevels) {
        const wy = p.riverWidth * ratio
        const basePt = w2s(0, wy)
        // 只在可见范围内画箭头
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

      // 4. 起点 & 对岸标签
      ctx.fillStyle = "rgba(0,0,0,0.15)"
      ctx.font = "11px sans-serif"
      ctx.fillText("起点", nearPt.x - 14, nearPt.y + 22)
      if (farPt.y > 20) ctx.fillText("对岸", 6, farPt.y - 6)

      // 5. 船体简化形状
      const pos = w2s(s.x, s.y)
      // 船身梯形
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
      // 桅杆
      ctx.beginPath()
      ctx.moveTo(pos.x, pos.y + 2)
      ctx.lineTo(pos.x, pos.y - 12)
      ctx.strokeStyle = "#666"
      ctx.lineWidth = 1.5
      ctx.stroke()
      // 帆
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

      // 6. 速度矢量（运动时显示）
      const theta = p.headingAngle * Math.PI / 180
      const vx = p.boatSpeed * Math.sin(theta) + p.currentSpeed
      const vy = p.boatSpeed * Math.cos(theta)
      const speed = Math.sqrt(vx * vx + vy * vy)
      if (speed > 0.05 && s.y < s.riverWidth - 1) {
        const sc = 12
        // 过河分量 vy（绿）
        ctx.beginPath()
        ctx.moveTo(pos.x, pos.y)
        ctx.lineTo(pos.x, pos.y - vy * sc)
        ctx.strokeStyle = "#2ecc71"
        ctx.lineWidth = 2
        ctx.stroke()
        ctx.fillStyle = "#2ecc71"
        ctx.font = "11px sans-serif"
        ctx.fillText("Vy", pos.x + 6, pos.y - vy * sc * 0.5)
        // 顺流分量 vx（蓝）
        ctx.beginPath()
        ctx.moveTo(pos.x, pos.y)
        ctx.lineTo(pos.x + vx * sc, pos.y)
        ctx.strokeStyle = "#3498db"
        ctx.lineWidth = 2
        ctx.stroke()
        ctx.fillStyle = "#3498db"
        ctx.fillText("Vx", pos.x + vx * sc * 0.5 - 10, pos.y + 14)
        // 合速度（红）
        ctx.beginPath()
        ctx.moveTo(pos.x, pos.y)
        ctx.lineTo(pos.x + vx * sc, pos.y - vy * sc)
        ctx.strokeStyle = "#e74c3c"
        ctx.lineWidth = 2.5
        ctx.stroke()
        const eX = pos.x + vx * sc
        const eY = pos.y - vy * sc
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
  {
    id: "spring-mass",
    name: "弹簧振子",
    desc: "物体在弹簧作用下的简谐振动，动能与势能相互转化",
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="6" x2="3" y2="20"/><polyline points="3,13 6,9 9,17 12,9 15,17 18,13"/><rect x="16" y="8" width="7" height="7" fill="rgba(0,0,0,0.1)"/></svg>`,
    params: [
      { key: "mass", label: "质量 (kg)", value: 1, min: 0.2, max: 5, step: 0.1 },
      { key: "k", label: "劲度系数 (N/m)", value: 10, min: 1, max: 30, step: 0.5 },
      { key: "initX", label: "初始位移 (m)", value: 2, min: 0.3, max: 5, step: 0.1 },
    ],
    createState: (p) => ({ x: p.initX, vx: 0, trail: [] }),
    step: (s, p, dt) => {
      const a = -(p.k / p.mass) * s.x
      s.vx += a * dt
      s.x += s.vx * dt
    },
    isFinished: () => false,
    getBallPosition: (s) => ({ x: s.x, y: GROUND_Y }),
    getTrailPosition: (s) => ({ x: s.x, y: GROUND_Y }),
    getInfoLines: (s, p, t) => {
      const ke = 0.5 * p.mass * s.vx * s.vx
      const pe = 0.5 * p.k * s.x * s.x
      const period = 2 * Math.PI * Math.sqrt(p.mass / p.k)
      const freq = 1 / period
      return [
        `位移: ${s.x.toFixed(2)} m`,
        `速度: ${s.vx.toFixed(2)} m/s`,
        `加速度: ${(-(p.k / p.mass) * s.x).toFixed(2)} m/s²`,
        `动能: ${ke.toFixed(2)} J | 势能: ${pe.toFixed(2)} J`,
        `机械能: ${(ke + pe).toFixed(2)} J`,
        `周期: ${period.toFixed(2)} s | 频率: ${freq.toFixed(2)} Hz`,
      ]
    },
    drawExtra: (ctx, s, p, w2s) => {
      const massPos = w2s(s.x, GROUND_Y)
      const wallX = -p.initX - 0.8
      const wallPos = w2s(wallX, GROUND_Y)

      // 墙壁
      ctx.fillStyle = "#666"
      ctx.fillRect(wallPos.x - 3, wallPos.y - 16, 6, 32)
      ctx.strokeStyle = "#888"
      ctx.lineWidth = 1
      ctx.strokeRect(wallPos.x - 3, wallPos.y - 16, 6, 32)

      // 弹簧（锯齿线）从墙壁连到小球边
      const dx = massPos.x - wallPos.x
      const segs = Math.max(8, Math.round(Math.abs(dx) / 6))
      const amp = Math.min(7, Math.abs(dx) / segs * 3)
      ctx.beginPath()
      ctx.moveTo(wallPos.x, wallPos.y)
      for (let i = 1; i <= segs; i++) {
        const t = i / segs
        const sx = wallPos.x + dx * t
        const sy = wallPos.y + (i % 2 === 0 ? -amp : amp)
        ctx.lineTo(sx, sy)
      }
      ctx.lineTo(massPos.x - 12, massPos.y)
      ctx.strokeStyle = "#999"
      ctx.lineWidth = 1.8
      ctx.stroke()
    },
  },

  // ── 10. 粗糙面滑动 ──
  {
    id: "friction-slide",
    name: "粗糙面滑动",
    desc: "物体在粗糙水平面上因摩擦力而减速直至停止",
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="2" y1="17" x2="22" y2="17"/><line x1="4" y1="17" x2="6" y2="13"/><line x1="9" y1="17" x2="11" y2="13"/><line x1="14" y1="17" x2="16" y2="13"/><line x1="19" y1="17" x2="21" y2="13"/><rect x="6" y="7" width="7" height="8" fill="rgba(0,0,0,0.1)"/><polyline points="20,6 22,12 18,12"/></svg>`,
    params: [
      { key: "v0", label: "初速度 (m/s)", value: 8, min: 1, max: 20, step: 0.5 },
      { key: "mu", label: "摩擦系数 μ", value: 0.3, min: 0.05, max: 1, step: 0.05 },
      { key: "gravity", label: "重力加速度 (m/s²)", value: 9.8, min: 1, max: 20, step: 0.1 },
    ],
    createState: (p) => ({ x: 0, vx: p.v0, trail: [] }),
    step: (s, p, dt) => {
      const a = p.mu * p.gravity
      s.vx -= a * dt
      if (s.vx <= 0) { s.vx = 0; return }
      s.x += s.vx * dt
    },
    isFinished: (s) => s.vx <= 0,
    getBallPosition: (s) => ({ x: s.x, y: GROUND_Y }),
    getTrailPosition: (s) => ({ x: s.x, y: GROUND_Y }),
    getInfoLines: (s, p, t) => {
      const a = p.mu * p.gravity
      const stopDist = p.v0 * p.v0 / (2 * a)
      return [
        `位移: ${s.x.toFixed(2)} m`,
        `速度: ${s.vx.toFixed(2)} m/s`,
        `减速度: ${a.toFixed(2)} m/s²`,
        `μ = ${p.mu},  g = ${p.gravity} m/s²`,
        `理论停止距离: ${stopDist.toFixed(2)} m`,
        `预计剩余: ${s.vx > 0 ? (s.vx / a).toFixed(2) : 0} s`,
      ]
    },
    drawExtra: (ctx, s, p, w2s) => {
      // 粗糙面纹理标记（短斜线）
      const groundY = w2s(0, 0).y
      for (let wx = 0; wx < 30; wx += 2.5) {
        const sx = w2s(wx, 0).x
        if (sx < -20 || sx > ctx.canvas.width / (window.devicePixelRatio || 1) + 20) continue
        ctx.beginPath()
        ctx.moveTo(sx, groundY)
        ctx.lineTo(sx + 4, groundY - 5)
        ctx.strokeStyle = "rgba(0,0,0,0.08)"
        ctx.lineWidth = 0.8
        ctx.stroke()
      }
      // 摩擦标签
      ctx.fillStyle = "rgba(0,0,0,0.15)"
      ctx.font = "11px sans-serif"
      ctx.fillText(`μ = ${p.mu}`, w2s(0, 0).x + 4, groundY - 8)
    },
    // 绘制方块
    drawObject: (ctx, s, p, w2s) => {
      const pos = w2s(s.x, 0)
      const w = 28
      const h = 18
      const x = pos.x - w / 2
      const y = pos.y - h
      // 方块本体
      ctx.fillStyle = "#e74c3c"
      ctx.fillRect(x, y, w, h)
      // 边框
      ctx.strokeStyle = "rgba(0,0,0,0.2)"
      ctx.lineWidth = 1.5
      ctx.strokeRect(x, y, w, h)
      // 底部纹理线，模拟粗糙感
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
  {
    id: "drag-fall",
    name: "空气阻力落体",
    desc: "考虑空气阻力的自由落体，最终达到收尾速度",
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="2" x2="12" y2="14"/><path d="M12 14l-3 3"/><path d="M12 14l3 3"/><circle cx="12" cy="19" r="3"/><path d="M6 6 Q8 8 12 6 Q16 8 18 6" opacity="0.3"/><path d="M4 9 Q8 11 12 9 Q16 11 20 9" opacity="0.2"/></svg>`,
    params: [
      { key: "height", label: "初始高度 (m)", value: 50, min: 10, max: 100, step: 2 },
      { key: "mass", label: "质量 (kg)", value: 1, min: 0.1, max: 10, step: 0.1 },
      { key: "dragCoeff", label: "阻力系数 b", value: 0.5, min: 0.05, max: 3, step: 0.05 },
      { key: "gravity", label: "重力加速度 (m/s²)", value: 9.8, min: 1, max: 20, step: 0.1 },
    ],
    createState: (p) => ({ y: p.height + GROUND_Y, vy: 0, trail: [] }),
    step: (s, p, dt) => {
      // 重力 mg 向下，阻力 b*v 向上
      // a = g - (b/m) * v
      const a = p.gravity - (p.dragCoeff / p.mass) * s.vy
      s.vy += a * dt
      s.y -= s.vy * dt
      if (s.y <= GROUND_Y && s.vy >= 0) { s.y = GROUND_Y; s.vy = 0 }
    },
    isFinished: (s) => s.y <= GROUND_Y && s.vy <= 0,
    getBallPosition: (s) => ({ x: 0, y: s.y }),
    getTrailPosition: (s) => ({ x: 0, y: s.y }),
    getInfoLines: (s, p, t) => {
      const vt = p.mass * p.gravity / p.dragCoeff
      return [
        `下落高度: ${(p.height + GROUND_Y - s.y).toFixed(1)} m`,
        `速度: ${s.vy.toFixed(2)} m/s`,
        `时间: ${t.toFixed(2)} s`,
        `收尾速度: ${vt.toFixed(2)} m/s`,
        `已接近收尾: ${s.vy > 0 ? (s.vy / vt * 100).toFixed(0) : 0}%`,
      ]
    },
    drawExtra: (ctx, s, p, w2s) => {
      // 显示空气阻力流线
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
        // 收尾速度标签
        const vt = p.mass * p.gravity / p.dragCoeff
        ctx.fillStyle = "rgba(0,0,0,0.2)"
        ctx.font = "11px sans-serif"
        ctx.fillText(`v收尾 = ${vt.toFixed(1)} m/s`, pos.x + 16, pos.y - 8)
      }
    },
  },

  // 12. 碰撞变形模型
  {
    id: "bounce-deformation",
    name: "碰撞变形",
    desc: "弹性/非弹性碰撞，观察变形与能量损失",
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="6" r="3"/><path d="M8 9v11"/><path d="M5 20h6"/><path d="M16 4l3 3-3 3"/><path d="M19 7h-6" opacity="0.4"/><line x1="2" y1="20" x2="22" y2="20"/></svg>`,
    params: [
      { key: "height", label: "初始高度 (m)", value: 10, min: 1, max: 30, step: 0.5 },
      { key: "restitution", label: "恢复系数 e", value: 0.8, min: 0, max: 1, step: 0.05 },
      { key: "gravity", label: "重力加速度 (m/s²)", value: 9.8, min: 1, max: 20, step: 0.1 },
    ],
    createState: (p) => ({ y: p.height + GROUND_Y, vy: 0, trail: [], bounceCount: 0, deform: 0 }),
    step: (s, p, dt) => {
      s.vy += p.gravity * dt
      s.y -= s.vy * dt
      // 变形逐渐恢复
      s.deform *= 0.85
      if (s.y <= GROUND_Y && s.vy >= 0) {
        if (p.restitution > 0 && s.vy > 0.3) {
          // 碰撞瞬间产生变形
          s.deform = Math.min(s.vy * 0.8, 12)
          s.vy = -s.vy * p.restitution
          s.y = GROUND_Y
          s.bounceCount++
        } else {
          s.y = GROUND_Y
          s.vy = 0
        }
      }
    },
    isFinished: (s) => s.y <= GROUND_Y && Math.abs(s.vy) <= 0.3,
    getBallPosition: (s) => ({ x: 0, y: s.y }),
    getTrailPosition: (s) => ({ x: 0, y: s.y }),
    getInfoLines: (s, p, t) => {
      const mode = p.restitution === 1 ? '完全弹性' : p.restitution === 0 ? '完全非弹性' : '非弹性'
      return [
        `高度: ${(s.y - GROUND_Y).toFixed(2)} m`,
        `速度: ${s.vy.toFixed(2)} m/s`,
        `弹跳次数: ${s.bounceCount}`,
        `恢复系数: e = ${p.restitution.toFixed(2)}  (${mode})`,
        `变形: ${s.deform > 0.1 ? s.deform.toFixed(1) : '0'}`,
      ]
    },
    drawObject: (ctx, s, p, w2s) => {
      const pos = w2s(0, s.y)
      const radius = 12
      const deform = s.deform
      // 根据变形画椭圆
      ctx.beginPath()
      ctx.ellipse(pos.x, pos.y + deform * 0.3, radius + deform * 0.2, radius - deform * 0.4, 0, 0, Math.PI * 2)
      ctx.fillStyle = "#e74c3c"
      ctx.fill()
      ctx.strokeStyle = "rgba(0,0,0,0.2)"
      ctx.lineWidth = 1.5
      ctx.stroke()
      // 完全非弹性停住时显示挤压效果
      if (p.restitution === 0 && s.y <= GROUND_Y && Math.abs(s.vy) <= 0.3) {
        ctx.fillStyle = "rgba(0,0,0,0.1)"
        ctx.fillRect(pos.x - 16, pos.y - 1, 32, 2)
      }
      // 标注恢复系数
      if (deform > 1) {
        ctx.fillStyle = "rgba(0,0,0,0.3)"
        ctx.font = "11px sans-serif"
        ctx.fillText(`e=${p.restitution.toFixed(2)}`, pos.x + 16, pos.y - 8)
      }
    },
    drawExtra: (ctx, s, p, w2s) => {
      // 显示 bounce 轨迹高度标
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
  {
    id: "ball-collision",
    name: "两球碰撞",
    desc: "两个小球在水平方向上的弹性/非弹性碰撞",
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="7" cy="12" r="3"/><circle cx="17" cy="12" r="3"/><line x1="10" y1="12" x2="14" y2="12"/><polygon points="14,10 14,14 16,12"/></svg>`,
    params: [
      { key: "m1", label: "球1质量 (kg)", value: 1, min: 0.1, max: 10, step: 0.1 },
      { key: "v1", label: "球1初速度 (m/s)", value: 3, min: -10, max: 10, step: 0.5 },
      { key: "m2", label: "球2质量 (kg)", value: 1, min: 0.1, max: 10, step: 0.1 },
      { key: "v2", label: "球2初速度 (m/s)", value: -2, min: -10, max: 10, step: 0.5 },
      { key: "restitution", label: "碰撞类型", value: 1, options: [
        { value: 1, label: "完全弹性碰撞" },
        { value: 0, label: "完全非弹性碰撞" },
      ]},
    ],
    createState: (p) => ({
      x1: -8, v1: p.v1,
      x2: 8, v2: p.v2,
      collided: false,
      trail: [],
      trail2: [],
      collisionTime: 999, // 碰撞时刻，用 dt 累计
    }),
    step: (s, p, dt) => {
      const BALL_RADIUS = 0.5
      const MIN_DIST = BALL_RADIUS * 2

      s.x1 += s.v1 * dt
      s.x2 += s.v2 * dt

      // 碰撞检测：两球距离小于直径且正在接近
      if (!s.collided && s.x2 - s.x1 < MIN_DIST && s.v1 > s.v2) {
        s.collided = true
        s.collisionTime = 0

        // 分离防止重叠
        const overlap = MIN_DIST - (s.x2 - s.x1)
        s.x1 -= overlap / 2
        s.x2 += overlap / 2

        if (p.restitution === 1) {
          // 完全弹性碰撞：动量守恒 + 动能守恒
          const m1 = p.m1, m2 = p.m2
          const v1 = s.v1, v2 = s.v2
          s.v1 = ((m1 - m2) * v1 + 2 * m2 * v2) / (m1 + m2)
          s.v2 = ((m2 - m1) * v2 + 2 * m1 * v1) / (m1 + m2)
        } else {
          // 完全非弹性碰撞：动量守恒，粘在一起
          const m1 = p.m1, m2 = p.m2
          const v = (m1 * s.v1 + m2 * s.v2) / (m1 + m2)
          s.v1 = v
          s.v2 = v
        }
      }

      // 碰撞计时
      if (s.collided) s.collisionTime += dt

      // 记录球2轨迹（球1的轨迹由实验室自动处理）
      if (!s.trail2) s.trail2 = []
      s.trail2.push({ x: s.x2, y: GROUND_Y })
      if (s.trail2.length > 800) s.trail2.splice(0, s.trail2.length - 800)
    },
    isFinished: () => false,
    getBallPosition: (s) => ({ x: (s.x1 + s.x2) / 2, y: GROUND_Y }),
    getTrailPosition: (s, p) => ({ x: s.x1, y: GROUND_Y }),
    getInfoLines: (s, p, t) => {
      const KE1 = 0.5 * p.m1 * s.v1 * s.v1
      const KE2 = 0.5 * p.m2 * s.v2 * s.v2
      const momentum = p.m1 * s.v1 + p.m2 * s.v2
      const collisionType = p.restitution === 1 ? '完全弹性' : '完全非弹性'
      return [
        `球1: m=${p.m1.toFixed(1)}kg  v=${s.v1.toFixed(2)}m/s  KE=${KE1.toFixed(2)}J`,
        `球2: m=${p.m2.toFixed(1)}kg  v=${s.v2.toFixed(2)}m/s  KE=${KE2.toFixed(2)}J`,
        `总动量: ${momentum.toFixed(2)} kg·m/s`,
        `总动能: ${(KE1 + KE2).toFixed(2)} J`,
        `状态: ${s.collided ? '已碰撞' : '未碰撞'} 类型: ${collisionType}`,
      ]
    },
    drawObject: (ctx, s, p, w2s) => {
      const RADIUS_PX = 14

      // 绘制球1（蓝色）
      const pos1 = w2s(s.x1, GROUND_Y)
      ctx.beginPath()
      ctx.arc(pos1.x, pos1.y, RADIUS_PX, 0, Math.PI * 2)
      const grad1 = ctx.createRadialGradient(pos1.x - 4, pos1.y - 4, 2, pos1.x, pos1.y, RADIUS_PX)
      grad1.addColorStop(0, '#5dade2')
      grad1.addColorStop(1, '#2980b9')
      ctx.fillStyle = grad1
      ctx.fill()
      ctx.strokeStyle = "rgba(0,0,0,0.15)"
      ctx.lineWidth = 1.5
      ctx.stroke()
      ctx.fillStyle = "#fff"
      ctx.font = "bold 11px sans-serif"
      ctx.textAlign = "center"
      ctx.fillText("1", pos1.x, pos1.y + 4)
      ctx.textAlign = "left"

      // 绘制球2（红色）
      const pos2 = w2s(s.x2, GROUND_Y)
      ctx.beginPath()
      ctx.arc(pos2.x, pos2.y, RADIUS_PX, 0, Math.PI * 2)
      const grad2 = ctx.createRadialGradient(pos2.x - 4, pos2.y - 4, 2, pos2.x, pos2.y, RADIUS_PX)
      grad2.addColorStop(0, '#ec7063')
      grad2.addColorStop(1, '#c0392b')
      ctx.fillStyle = grad2
      ctx.fill()
      ctx.strokeStyle = "rgba(0,0,0,0.15)"
      ctx.lineWidth = 1.5
      ctx.stroke()
      ctx.fillStyle = "#fff"
      ctx.font = "bold 11px sans-serif"
      ctx.textAlign = "center"
      ctx.fillText("2", pos2.x, pos2.y + 4)
      ctx.textAlign = "left"
    },
    drawExtra: (ctx, s, p, w2s) => {
      // 绘制球2轨迹
      ctx.globalAlpha = 0.5
      for (let i = 1; i < s.trail2.length; i++) {
        const p1 = w2s(s.trail2[i - 1].x, s.trail2[i - 1].y)
        const p2 = w2s(s.trail2[i].x, s.trail2[i].y)
        ctx.beginPath()
        ctx.moveTo(p1.x, p1.y)
        ctx.lineTo(p2.x, p2.y)
        ctx.strokeStyle = "rgba(231, 76, 60, 0.35)"
        ctx.lineWidth = 2
        ctx.stroke()
      }
      ctx.globalAlpha = 1.0

      // 速度箭头
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

      const RADIUS_PX = 14
      const pos1 = w2s(s.x1, GROUND_Y)
      const pos2 = w2s(s.x2, GROUND_Y)
      drawArrow(pos1, s.v1, "#2980b9")
      drawArrow(pos2, s.v2, "#c0392b")

      // 碰撞时刻视觉效果
      if (s.collided) {
        const midX = (s.x1 + s.x2) / 2
        const midPx = w2s(midX, GROUND_Y)
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
      }
    },
  },
  // ── 14. 连接体（滑轮模型） ──
  {
    id: "connected-bodies",
    name: "连接体",
    desc: "两个物体通过定滑轮连接，整体法与隔离法分析",
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="14" width="8" height="4" fill="rgba(0,0,0,0.08)"/><circle cx="12" cy="10" r="2" fill="none"/><rect x="14" y="4" width="6" height="6" rx="1" fill="rgba(0,0,0,0.1)"/><line x1="12" y1="12" x2="8" y2="14"/><line x1="12" y1="12" x2="17" y2="10"/></svg>`,
    params: [
      { key: "m1", label: "桌面质量 (kg)", value: 2, min: 0.3, max: 10, step: 0.2 },
      { key: "m2", label: "悬挂质量 (kg)", value: 1, min: 0.3, max: 10, step: 0.2 },
      { key: "mu", label: "桌面摩擦系数 μ", value: 0.2, min: 0, max: 1, step: 0.05 },
      { key: "gravity", label: "重力加速度 (m/s²)", value: 9.8, min: 1, max: 20, step: 0.1 },
    ],
    createState: (p) => ({ d: 0, v: 0, trail: [] }),
    step: (s, p, dt) => {
      const TABLE_H = 5
      const TABLE_W = 8
      const m1_hw = 0.45
      const m2_r = 0.38
      // m₁ 最大移动距离（从桌面左端到滑轮下方）
      const m1_max_dist = TABLE_W - m1_hw * 2
      // m₂ 最大下落距离（桌面高度 - 球半径 - 地面高度）
      const m2_max_dist = TABLE_H - m2_r - GROUND_Y
      // 实际最大距离取两者最小值
      const maxDist = Math.min(m1_max_dist, m2_max_dist)

      const a = (p.m2 * p.gravity - p.mu * p.m1 * p.gravity) / (p.m1 + p.m2)
      if (a <= 0) {
        // m₂ 太轻无法拉动 m₁，减速到停止
        if (s.v > 0) {
          s.v += a * dt
          if (s.v < 0) s.v = 0
          s.d += s.v * dt
        }
        return
      }
      s.v += a * dt
      if (s.v < 0) s.v = 0
      s.d += s.v * dt
      // m₁ 到达滑轮或 m₂ 落地时停止
      if (s.d >= maxDist) { s.d = maxDist; s.v = 0 }
    },
    isFinished: (s) => {
      const TABLE_H = 5
      const TABLE_W = 8
      const m1_hw = 0.45
      const m2_r = 0.38
      const m1_max_dist = TABLE_W - m1_hw * 2
      const m2_max_dist = TABLE_H - m2_r - GROUND_Y
      const maxDist = Math.min(m1_max_dist, m2_max_dist)
      return s.d >= maxDist
    },
    getBallPosition: (s, p) => {
      // 相机跟踪 m₁ 和 m₂ 的中心点
      const TABLE_H = 5
      const TABLE_W = 8
      const m2_r = 0.38
      const m1_hw = 0.45
      const m1_x = Math.max(-TABLE_W + m1_hw, Math.min(-TABLE_W + m1_hw + s.d, -m1_hw))
      const m2_y = Math.max(TABLE_H - m2_r - s.d, GROUND_Y)
      return { x: (m1_x + 0) / 2, y: (TABLE_H + m2_y) / 2 }
    },
    getTrailPosition: (s, p) => {
      // 记录 m₂（悬挂重物）的下落轨迹
      const TABLE_H = 5
      const m2_r = 0.38
      const m2_y = Math.max(TABLE_H - m2_r - s.d, GROUND_Y)
      return { x: 0, y: m2_y }  // m₂ 在滑轮正下方（x=0）
    },
    getInfoLines: (s, p, t) => {
      const TABLE_H = 5
      const TABLE_W = 8
      const m1_hw = 0.45
      const m2_r = 0.38
      const m1_max_dist = TABLE_W - m1_hw * 2
      const m2_max_dist = TABLE_H - m2_r - GROUND_Y
      const maxDist = Math.min(m1_max_dist, m2_max_dist)
      const a = (p.m2 * p.gravity - p.mu * p.m1 * p.gravity) / (p.m1 + p.m2)
      const a_valid = a > 0 ? a : 0
      const T = a_valid > 0 ? p.m1 * (a_valid + p.mu * p.gravity) : p.m1 * p.gravity
      const isM1Stopped = s.d >= m1_max_dist
      const isM2Landed = s.d >= m2_max_dist
      return [
        `加速度: ${a_valid.toFixed(2)} m/s²`,
        `速度: ${s.v.toFixed(2)} m/s`,
        `移动距离: ${s.d.toFixed(1)} / ${maxDist.toFixed(1)} m`,
        `绳中拉力: ${T.toFixed(2)} N`,
        `m₁=${p.m1}kg  m₂=${p.m2}kg  μ=${p.mu.toFixed(2)}`,
        `时间: ${t.toFixed(2)} s`,
        ...(a <= 0 ? ['⚠ m₂ 太轻，无法拉动 m₁'] : []),
        ...(isM1Stopped && !isM2Landed ? ['⚡ m₁ 已到滑轮处'] : []),
        ...(isM2Landed ? ['⚡ m₂ 已落地'] : []),
      ]
    },
    drawObject: (ctx, s, p, w2s) => {
      const TABLE_H = 5, TABLE_W = 8  // 桌子更长
      const PULLEY_X = 0
      const d = s.d
      const m1_hw = 0.45, m1_hh = 0.3
      const m2_r = 0.38
      // m₁ 从桌面左端开始，向滑轮方向移动，最多到滑轮下方
      const m1_start = -TABLE_W + m1_hw
      const m1_end = -m1_hw  // 滑轮左侧边缘
      const m1_x = Math.max(m1_start, Math.min(m1_start + d, m1_end))
      // m₂ 在滑轮正下方悬挂，随下落距离下降，不低于地面
      const m2_y = Math.max(TABLE_H - m2_r - d, GROUND_Y)
      const m2_x = PULLEY_X  // m₂ 在滑轮正下方
      const ch = ctx.canvas.height / (window.devicePixelRatio || 1)

      // ── 1. 桌面 ──
      const tL = w2s(-TABLE_W, 0), tR = w2s(0, 0)
      const tT = w2s(-TABLE_W, TABLE_H)

      // 桌面主体（渐变）
      const tGrad = ctx.createLinearGradient(tL.x, tT.y, tL.x, tL.y)
      tGrad.addColorStop(0, "#b8956a")
      tGrad.addColorStop(0.12, "#d4b88c")
      tGrad.addColorStop(0.5, "#c4a67a")
      tGrad.addColorStop(1, "#8B7355")
      ctx.fillStyle = tGrad
      ctx.fillRect(tL.x, tT.y, tR.x - tL.x, tR.y - tT.y)

      // 桌面顶部边缘高光
      ctx.fillStyle = "#e0c8a0"
      ctx.fillRect(tL.x, tT.y - 3, tR.x - tL.x, 5)

      // 桌面底部阴影
      ctx.fillStyle = "rgba(0,0,0,0.07)"
      ctx.fillRect(tL.x, tL.y - 2, tR.x - tL.x, 2)

      // 桌腿
      ctx.fillStyle = "#6b5b45"
      for (const lx of [-TABLE_W + 0.4, -0.4]) {
        const leg = w2s(lx, 0)
        ctx.fillRect(leg.x - 3, leg.y, 6, ch - leg.y)
        // 桌脚
        ctx.fillRect(leg.x - 5, leg.y + (ch - leg.y) - 6, 10, 6)
      }

      // ── 2. 滑轮及支架 ──
      const px = w2s(PULLEY_X, TABLE_H)

      // 支架竖杆
      ctx.strokeStyle = "#666"
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.moveTo(px.x, px.y)
      ctx.lineTo(px.x, px.y - 14)
      ctx.stroke()

      // 支架横梁
      ctx.fillStyle = "#777"
      ctx.fillRect(px.x - 11, px.y - 16, 22, 4)

      // 滑轮外圈
      ctx.beginPath()
      ctx.arc(px.x, px.y, 8, 0, Math.PI * 2)
      ctx.fillStyle = "#555"
      ctx.fill()
      ctx.strokeStyle = "#444"
      ctx.lineWidth = 1.5
      ctx.stroke()

      // 滑轮内圈
      ctx.beginPath()
      ctx.arc(px.x, px.y, 3.5, 0, Math.PI * 2)
      ctx.fillStyle = "#333"
      ctx.fill()

      // ── 3. 绳子（滑轮 → m1, 滑轮 → m2）──
      const m1 = w2s(m1_x, TABLE_H + m1_hh)
      const m2 = w2s(m2_x, m2_y)
      ctx.lineCap = "round"
      ctx.strokeStyle = "#c4956a"
      ctx.lineWidth = 2.5

      ctx.beginPath()
      ctx.moveTo(px.x, px.y)
      ctx.lineTo(m1.x, m1.y)
      ctx.stroke()

      ctx.beginPath()
      ctx.moveTo(px.x, px.y)
      ctx.lineTo(m2.x, m2.y - m2_r * DRAW_SCALE)
      ctx.stroke()
      ctx.lineCap = "butt"

      // ── 4. m₁（桌面上滑块）──
      const m1W = m1_hw * 2 * DRAW_SCALE
      const m1H = m1_hh * 2 * DRAW_SCALE
      const m1X = m1.x - m1_hw * DRAW_SCALE
      const m1Y = m1.y - m1_hh * DRAW_SCALE

      // 投影
      ctx.fillStyle = "rgba(0,0,0,0.1)"
      ctx.fillRect(m1X + 3, m1Y + 3, m1W, m1H)

      // 主体
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

      // ── 5. m₂（悬挂球）──
      const m2R = m2_r * DRAW_SCALE

      // 球体投影
      ctx.beginPath()
      ctx.ellipse(m2.x + 3, m2.y + m2R * 0.3, m2R * 0.8, m2R * 0.2, 0, 0, Math.PI * 2)
      ctx.fillStyle = "rgba(0,0,0,0.08)"
      ctx.fill()

      // 球体
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

      // ── 6. 速度箭头 ──
      if (s.v > 0.05) {
        const vLen = Math.min(s.v * 3, 60)

        // m₁ → （向右）
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

        // m₂ ↓（向下）
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
  {
    id: "conveyor-belt",
    name: "传送带",
    desc: "物块在传送带上的运动，摩擦力驱动的加速与匀速",
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="10" width="20" height="4" rx="1" fill="rgba(0,0,0,0.06)"/><circle cx="4" cy="12" r="2" fill="none"/><circle cx="20" cy="12" r="2" fill="none"/><rect x="9" y="6" width="5" height="5" rx="1" fill="rgba(0,0,0,0.1)"/><line x1="2" y1="17" x2="22" y2="17"/></svg>`,
    params: [
      { key: "beltSpeed", label: "传送带速度 (m/s)", value: 4, min: 0.5, max: 12, step: 0.5 },
      { key: "v0", label: "物块初速度 (m/s)", value: 0, min: -5, max: 12, step: 0.5 },
      { key: "mu", label: "动摩擦因数 μ", value: 0.3, min: 0.05, max: 1, step: 0.05 },
      { key: "beltLength", label: "传送带长度 (m)", value: 20, min: 5, max: 50, step: 1 },
      { key: "gravity", label: "重力加速度 (m/s²)", value: 9.8, min: 1, max: 20, step: 0.1 },
    ],
    createState: (p) => ({ x: 0, v: p.v0, trail: [] }),
    step: (s, p, dt) => {
      const dv = p.beltSpeed - s.v
      if (Math.abs(dv) > 0.05) {
        const a = Math.sign(dv) * p.mu * p.gravity
        if (Math.abs(a * dt) > Math.abs(dv)) {
          s.v = p.beltSpeed
        } else {
          s.v += a * dt
        }
      }
      s.x += s.v * dt
      if (s.x >= p.beltLength) { s.x = p.beltLength }
      if (s.x < 0) s.x = 0
    },
    isFinished: (s, p) => s.x >= p.beltLength,
    getBallPosition: (s, p) => ({ x: s.x, y: GROUND_Y }),
    getTrailPosition: (s, p) => ({ x: s.x, y: GROUND_Y }),
    getInfoLines: (s, p, t) => {
      const dv = p.beltSpeed - s.v
      const isSynced = Math.abs(dv) < 0.05
      const phase = isSynced ? '匀速 ✓' : (dv > 0 ? '加速中 🔄' : '减速中 🔄')
      const a = isSynced ? 0 : Math.sign(dv) * p.mu * p.gravity
      return [
        `物块速度: ${s.v.toFixed(2)} m/s`,
        `传送带速度: ${p.beltSpeed.toFixed(1)} m/s`,
        `相对速度: ${isSynced ? 0 : dv.toFixed(2)} m/s`,
        `位移: ${s.x.toFixed(1)} / ${p.beltLength} m`,
        `加速度: ${a.toFixed(2)} m/s²`,
        `μ = ${p.mu.toFixed(2)}`,
        `状态: ${phase}`,
        `时间: ${t.toFixed(2)} s`,
      ]
    },
    drawObject: (ctx, s, p, w2s) => {
      const beltLen = p.beltLength
      const beltH = 0.3  // 传送带厚度
      const blockH = 0.7  // 物块高度
      const blockW = 0.7  // 物块宽度

      // 1. 传送带底座（在地面下方）
      const beltLeft = w2s(-1, 0)
      const beltRight = w2s(beltLen + 1, 0)
      const beltBot = w2s(0, -beltH - 0.5)
      ctx.fillStyle = "#d5dbe0"
      ctx.fillRect(beltLeft.x, beltLeft.y, beltRight.x - beltLeft.x, beltBot.y - beltLeft.y)

      // 2. 传送带表面（皮带）
      const beltSurface = w2s(0, 0)
      const beltBottom = w2s(0, -beltH)
      ctx.fillStyle = "#555"
      ctx.fillRect(beltLeft.x, beltSurface.y, beltRight.x - beltLeft.x, beltBottom.y - beltSurface.y)

      // 3. 滚筒
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

      // 4. 皮带纹理（斜线表示运动方向）
      ctx.strokeStyle = "rgba(255,255,255,0.15)"
      ctx.lineWidth = 1
      for (let wx = 0; wx < beltLen; wx += 1.2) {
        const px = w2s(wx, 0).x
        ctx.beginPath()
        ctx.moveTo(px, beltSurface.y)
        ctx.lineTo(px + 4, beltBottom.y)
        ctx.stroke()
      }

      // 5. 皮带速度方向指示
      if (Math.abs(p.beltSpeed) > 0.1) {
        const arrowPos = w2s(0, 0.15)
        const midX = (beltLeft.x + beltRight.x) / 2
        const aLen = 30
        const dir = Math.sign(p.beltSpeed)
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

      // 6. 物块（底部在传送带表面 y=0）
      const blockWorldX = Math.max(0, Math.min(s.x, beltLen))
      const blkBottom = w2s(blockWorldX, 0)  // 物块底部在 y=0
      const blkScreenW = blockW * DRAW_SCALE
      const blkScreenH = blockH * DRAW_SCALE
      ctx.fillStyle = "#e74c3c"
      ctx.fillRect(blkBottom.x - blkScreenW / 2, blkBottom.y - blkScreenH, blkScreenW, blkScreenH)
      ctx.strokeStyle = "rgba(0,0,0,0.2)"
      ctx.lineWidth = 1.5
      ctx.strokeRect(blkBottom.x - blkScreenW / 2, blkBottom.y - blkScreenH, blkScreenW, blkScreenH)

      // 7. 物块速度箭头
      if (Math.abs(s.v) > 0.05) {
        const sc = 3
        const vLen = Math.min(Math.abs(s.v) * sc, 60)
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
  {
    id: "block-board",
    name: "板块模型",
    desc: "滑块在木板上滑动，摩擦作用下的相对运动，高考经典",
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="14" width="18" height="6" rx="1" fill="rgba(0,0,0,0.06)"/><rect x="10" y="8" width="6" height="6" fill="rgba(0,0,0,0.12)"/><line x1="13" y1="11" x2="19" y2="11" stroke="#e67e22" stroke-width="2"/><line x1="13" y1="17" x2="8" y2="17" stroke="#3498db" stroke-width="2"/><polyline points="19,9 22,11 19,13"/><polyline points="8,15 5,17 8,19"/></svg>`,
    params: [
      { key: "M", label: "木板质量 (kg)", value: 3, min: 0.5, max: 20, step: 0.5 },
      { key: "m", label: "滑块质量 (kg)", value: 1, min: 0.2, max: 10, step: 0.2 },
      { key: "v0", label: "滑块初速度 (m/s)", value: 4, min: 1, max: 15, step: 0.5 },
      { key: "mu", label: "摩擦系数 μ", value: 0.3, min: 0.05, max: 0.8, step: 0.05 },
      { key: "boardLength", label: "木板长度 (m)", value: 6, min: 2, max: 15, step: 0.5 },
      { key: "gravity", label: "重力加速度 (m/s²)", value: 9.8, min: 1, max: 20, step: 0.1 },
    ],
    createState: (p) => ({
      xb: 0.5, vb: p.v0,  // 滑块中心初始位置（考虑宽度，左端对齐木板左端）
      xB: 0, vB: 0,
      trail: [], trailB: [],
    }),
    step: (s, p, dt) => {
      const relV = s.vb - s.vB
      if (Math.abs(relV) > 0.01) {
        const a_block = -Math.sign(relV) * p.mu * p.gravity
        const a_board = Math.sign(relV) * p.mu * p.m * p.gravity / p.M
        s.vb += a_block * dt
        s.vB += a_board * dt
      } else {
        const vcm = (p.m * s.vb + p.M * s.vB) / (p.m + p.M)
        s.vb = vcm; s.vB = vcm
      }
      s.xb += s.vb * dt
      s.xB += s.vB * dt
      if (s.xb - s.xB >= p.boardLength) {
        s.xb = s.xB + p.boardLength
        if (s.vb > s.vB) s.vb = s.vB
      }
      // 记录木板轨迹（滑块轨迹由实验室自动处理）
      if (s.trailB) {
        s.trailB.push({ x: s.xB, y: GROUND_Y + 0.15 })
        if (s.trailB.length > 800) s.trailB.splice(0, s.trailB.length - 800)
      }
    },
    isFinished: (s, p) => {
      return (s.xb - s.xB) >= p.boardLength || (Math.abs(s.vb - s.vB) < 0.01 && (s.xb - s.xB) < p.boardLength)
    },
    getBallPosition: (s, p) => ({ x: (s.xb + s.xB + p.boardLength) / 2, y: GROUND_Y }),
    getTrailPosition: (s, p) => ({ x: s.xb - 0.5, y: GROUND_Y + 0.4 }),  // 从滑块左端记录轨迹
    drawExtra: (ctx, s, p, w2s) => {
      // 绘制木板的运动轨迹（虚线）
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
    getInfoLines: (s, p, t) => {
      const relV = s.vb - s.vB
      const relDisp = s.xb - s.xB
      const isDone = Math.abs(relV) < 0.01
      const vcm = (p.m * p.v0) / (p.m + p.M)
      const a_block = relV > 0 ? -p.mu * p.gravity : p.mu * p.gravity
      const phase = isDone ? '已共速 ✓' : (relDisp >= p.boardLength ? '滑块滑落 ⚡' : '相对滑动中 🔄')
      return [
        `滑块速度: ${s.vb.toFixed(2)} m/s`,
        `木板速度: ${s.vB.toFixed(2)} m/s`,
        `相对速度: ${relV.toFixed(2)} m/s`,
        `相对位移: ${relDisp.toFixed(2)} / ${p.boardLength} m`,
        `滑块加速度: ${isDone ? 0 : a_block.toFixed(2)} m/s²`,
        `m=${p.m}kg  M=${p.M}kg  μ=${p.mu.toFixed(2)}`,
        `状态: ${phase}`,
        ...(isDone ? [`共速速度: ${vcm.toFixed(2)} m/s`] : []),
        `时间: ${t.toFixed(2)} s`,
      ]
    },
    drawObject: (ctx, s, p, w2s) => {
      const boardH = 0.5   // 木板厚度
      const blockH = 0.6   // 滑块高度
      const blockW = 1.0   // 滑块宽度

      // 1. 木板（底部在地面上）
      const boardBottomLeft = w2s(s.xB, 0)  // 木板底部左端
      const boardBottomRight = w2s(s.xB + p.boardLength, 0)  // 木板底部右端
      const boardScreenW = boardBottomRight.x - boardBottomLeft.x
      const boardScreenH = boardH * DRAW_SCALE

      // 木板主体（从底部向上画）
      ctx.fillStyle = "#6c7a89"
      ctx.fillRect(boardBottomLeft.x, boardBottomLeft.y - boardScreenH, boardScreenW, boardScreenH)
      ctx.strokeStyle = "rgba(0,0,0,0.2)"
      ctx.lineWidth = 1.5
      ctx.strokeRect(boardBottomLeft.x, boardBottomLeft.y - boardScreenH, boardScreenW, boardScreenH)

      // 木板标签
      ctx.fillStyle = "#fff"
      ctx.font = "bold 12px sans-serif"
      ctx.textAlign = "center"
      ctx.fillText("M", boardBottomLeft.x + boardScreenW / 2, boardBottomLeft.y - boardScreenH / 2 + 4)
      ctx.textAlign = "left"

      // 2. 滑块（底部在木板顶部）
      const blockBottom = w2s(s.xb, boardH + 0.01)  // 滑块底部在木板顶部
      const blkScreenW = blockW * DRAW_SCALE
      const blkScreenH = blockH * DRAW_SCALE

      ctx.fillStyle = "#e74c3c"
      ctx.fillRect(blockBottom.x - blkScreenW / 2, blockBottom.y - blkScreenH, blkScreenW, blkScreenH)
      ctx.strokeStyle = "rgba(0,0,0,0.25)"
      ctx.lineWidth = 1.5
      ctx.strokeRect(blockBottom.x - blkScreenW / 2, blockBottom.y - blkScreenH, blkScreenW, blkScreenH)

      // 滑块标签
      ctx.fillStyle = "#fff"
      ctx.font = "bold 12px sans-serif"
      ctx.textAlign = "center"
      ctx.fillText("m", blockBottom.x, blockBottom.y - blkScreenH / 2 + 4)
      ctx.textAlign = "left"

      // 3. 滑块速度箭头
      if (Math.abs(s.vb) > 0.05) {
        const vLen = Math.min(Math.abs(s.vb) * 3, 60)
        const dir = s.vb > 0 ? 1 : -1
        const ax = blockBottom.x + blkScreenW / 2 + 4
        const ay = blockBottom.y - blkScreenH / 2
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

      // 4. 木板速度箭头
      if (Math.abs(s.vB) > 0.05) {
        const vLen = Math.min(Math.abs(s.vB) * 3, 60)
        const dir = s.vB > 0 ? 1 : -1
        const ax = boardBottomRight.x + 4
        const ay = boardBottomRight.y - boardScreenH / 2
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
]