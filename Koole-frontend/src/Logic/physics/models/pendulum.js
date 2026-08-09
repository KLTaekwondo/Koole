// pendulum 模型数据
const GROUND_Y = 0.4

export default {
    id: "pendulum",
    level: "初中",
    category: "力学",
    name: "单摆",
    desc: "单摆在重力作用下的周期性摆动",
    knowledge: `## 单摆

小角度下做简谐振动。

- 周期：$T = 2\\pi\\sqrt{\\frac{L}{g}}$
- 角频率：$\\omega = \\sqrt{\\frac{g}{L}}$

其中：$T$ 是周期，$L$ 是摆长，$\\omega$ 是角频率，$\\theta$ 是摆角。

最重要的性质：周期只跟摆长和 g 有关，跟振幅、质量都没关系。这就是等时性。

小角度近似 $\\sin\\theta \\approx \\theta$ 只在 $\\theta < 5°$ 时准，误差不到 0.5%。但其实 30° 以内定性看都还行，就是数值不太准了。

能量转化很明显：最高点全是势能，最低点全是动能，机械能守恒。单摆测 g 的原理就在这里——量出 T 和 L 就能算。

> 摆长变 4 倍，周期才变 2 倍——平方根关系，记住这个比例。`,
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="2" x2="18" y2="16"/><circle cx="18" cy="18" r="2"/><line x1="12" y1="2" x2="12" y2="20" stroke-dasharray="2 2" opacity="0.3"/></svg>`,
    params: [
      { key: "length", label: "摆长 (m)", value: 5, min: 1, max: 15, step: 0.5 },
      { key: "initAngle", label: "初始角度 (°)", value: 30, min: 5, max: 60, step: 1 },
      { key: "gravity", label: "重力加速度 (m/s²)", value: 9.8, min: 1, max: 20, step: 0.1 },
    ],
    devNotes: `单摆用角加速度驱动：

\`\`\`js
alpha = -(gravity / length) * s.theta
s.omega += alpha * dt
s.theta += s.omega * dt
\`\`\`

摆球坐标：\`x = L·sin(θ)\`, \`y = L - L·cos(θ)\`

小角度近似（\`sin(θ) ≈ θ\`）只在 θ < 5° 时准，但我还是支持到 60°——虽然近似不准，但直观。周期用公式 \`T = 2π√(L/g)\` 直接显示，不从模拟数据提取。

理想单摆永不停止，所以 isFinished 返回 false，动画持续跑。
`,

    // ── 物理逻辑 ──
    createState: (p) => ({ theta: p.initAngle * Math.PI / 180, omega: 0, trail: [], _t: 0 }),
    step: (s, p, dt) => {
      const alpha = -(p.gravity / p.length) * s.theta
      s.omega += alpha * dt
      s.theta += s.omega * dt
      s._t += dt
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
    trailFields: (s) => ({ t: s._t, theta: s.theta * 180 / Math.PI, omega: s.omega }),
    chartDefs: [
      { title: "θ-t 图", xLabel: "t (s)", yLabel: "θ (°)", getData: (trail) => [{ name: "摆角", data: trail.map(p => [p.t, p.theta]) }] },
      { title: "ω-t 图", xLabel: "t (s)", yLabel: "ω (rad/s)", getData: (trail) => [{ name: "角速度", data: trail.map(p => [p.t, p.omega]) }] },
    ],
    getInfoLines: (s, p, t) => [
      `摆角: ${(s.theta * 180 / Math.PI).toFixed(1)}°`,
      `角速度: ${s.omega.toFixed(2)} rad/s`,
      `周期: ${(2 * Math.PI * Math.sqrt(p.length / p.gravity)).toFixed(2)} s`,
      `摆长: ${p.length} m`,
    ],

    // ── 渲染逻辑 ──
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
  }
