// angled-projectile 模型数据
const GROUND_Y = 0.4

export default {
    id: "angled-projectile",
    level: "高中",
    category: "力学",
    name: "斜向上抛",
    desc: "物体以一定角度斜向上抛出，抛物线运动",
    knowledge: `## 斜向上抛运动

平抛的"升级版"，初速度有竖直分量。

- 水平：$x = v_0\\cos\\theta \\cdot t$（匀速）
- 竖直：$y = v_0\\sin\\theta \\cdot t - \\frac{1}{2}gt^2$（匀减速）
- 最大高度：$H = \\frac{v_0^2 \\sin^2\\theta}{2g}$
- 水平射程：$R = \\frac{v_0^2 \\sin 2\\theta}{g}$
- 飞行总时间：$T = \\frac{2v_0\\sin\\theta}{g}$

其中：$v_0$ 是初速度，$\\theta$ 是抛射角，$H$ 是最大高度，$R$ 是水平射程，$T$ 是总时间。

45° 射程最远是因为 $\\sin 2\\theta$ 最大——但仅限起落等高！如果起点比落点高，最佳角度会小于 45°，这个很多人忘。

还有个结论做选择题很好用：互补角（$\\theta$ 和 $90°-\\theta$）射程相同。试试 30° 和 60°，射程一样。

> 30° 和 60° 射程一样——互补角就是这么神奇。`,
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="2" y1="20" x2="22" y2="20"/><path d="M4 20 Q12 2 20 16" stroke-dasharray="3 2"/><circle cx="20" cy="16" r="2"/><line x1="4" y1="20" x2="10" y2="10"/><polyline points="11 6 10 10 14 9"/></svg>`,
    params: [
      { key: "initialVelocity", label: "初速度 (m/s)", value: 15, min: 5, max: 40, step: 0.5 },
      { key: "angle", label: "抛射角 (°)", value: 45, min: 5, max: 85, step: 1 },
      { key: "gravity", label: "重力加速度 (m/s²)", value: 9.8, min: 1, max: 20, step: 0.1 },
    ],
    devNotes: `在平抛基础上加了竖直初速度分量，物理逻辑不复杂，但符号处理要小心——向上为正，所以重力是负的。

\`\`\`js
vx = v0 * Math.cos(theta)
vy = v0 * Math.sin(theta)
s.vy -= gravity * dt  // 注意减号
\`\`\`

射程和最大高度我用公式直接算理论值显示，不从模拟数据里提取——公式更准，不受模拟精度影响。

抛射角限制在 5°-85°，接近 0° 或 90° 时动画效果不好（要么几乎水平要么几乎垂直）。
`,

    // ── 物理逻辑 ──
    createState: (p) => {
      const theta = p.angle * Math.PI / 180
      return { x: 0, y: GROUND_Y, vx: p.initialVelocity * Math.cos(theta), vy: p.initialVelocity * Math.sin(theta), trail: [], _t: 0 }
    },
    step: (s, p, dt) => {
      s.vy -= p.gravity * dt
      s.x += s.vx * dt
      s.y += s.vy * dt
      s._t += dt
      if (s.y <= GROUND_Y && s.vy <= 0) { s.y = GROUND_Y; s.vy = 0 }
    },
    isFinished: (s) => s.y <= GROUND_Y && s.vy <= 0,
    getBallPosition: (s) => ({ x: s.x, y: s.y }),
    getTrailPosition: (s) => ({ x: s.x, y: s.y }),
    trailFields: (s) => ({ t: s._t, y: s.y }),
    chartDefs: [
      { title: "轨迹图", xLabel: "x (m)", yLabel: "y (m)", getData: (trail) => [{ name: "轨迹", data: trail.map(p => [p.x, p.y]) }] },
      { title: "y-t 图", xLabel: "t (s)", yLabel: "y (m)", getData: (trail) => [{ name: "高度", data: trail.map(p => [p.t, p.y]) }] },
    ],
    getInfoLines: (s, p, t) => {
      const theta = p.angle * Math.PI / 180
      const v0 = p.initialVelocity, g = p.gravity
      const speed = Math.sqrt(s.vx * s.vx + s.vy * s.vy)
      return [
        `水平位移: ${s.x.toFixed(1)} m`,
        `高度: ${Math.max(s.y, 0).toFixed(1)} m`,
        `速度: ${speed.toFixed(1)} m/s`,
        `最大高度: ${((v0 * Math.sin(theta)) ** 2 / (2 * g)).toFixed(1)} m`,
        `射程: ${(v0 * v0 * Math.sin(2 * theta) / g).toFixed(1)} m`,
        `时间: ${t.toFixed(2)} / ${(2 * v0 * Math.sin(theta) / g).toFixed(2)} s`,
      ]
    },

    // ── 渲染逻辑 ──
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
  }
