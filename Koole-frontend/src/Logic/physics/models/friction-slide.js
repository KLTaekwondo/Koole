// friction-slide 模型数据
const GROUND_Y = 0.4

export default {
    id: "friction-slide",
    level: "初中",
    category: "力学",
    name: "粗糙面滑动",
    desc: "物体在粗糙水平面上因摩擦力而减速直至停止",
    knowledge: `## 粗糙面滑动

匀减速运动。摩擦力做负功，把动能全部吃掉。

- 摩擦力：$f = \\mu mg$
- 减速度：$a = \\mu g$（注意跟质量无关！）
- 停止距离：$x = \\frac{v_0^2}{2\\mu g}$
- 停止时间：$t = \\frac{v_0}{\\mu g}$

其中：$f$ 是摩擦力，$\\mu$ 是摩擦系数，$m$ 是质量，$a$ 是减速度，$x$ 是停止距离，$v_0$ 是初速度，$t$ 是停止时间。

摩擦力大小只取决于 $\\mu$ 和 $N$，跟速度没关系——不管快还是慢，摩擦力一样大。

停止距离跟初速度是**平方**关系！速度翻倍刹车距离变 4 倍，这就是高速要保持车距的原因。减速度跟质量无关，所以不同质量的车在同一路面刹车距离一样（理想情况）。

能量角度：摩擦力做功 $W = -\\mu mgx$，把动能全转化成内能（发热）。

> 初速度从 8 调到 16，停止距离直接变 4 倍——平方关系。`,
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="2" y1="17" x2="22" y2="17"/><line x1="4" y1="17" x2="6" y2="13"/><line x1="9" y1="17" x2="11" y2="13"/><line x1="14" y1="17" x2="16" y2="13"/><line x1="19" y1="17" x2="21" y2="13"/><rect x="6" y="7" width="7" height="8" fill="rgba(0,0,0,0.1)"/><polyline points="20,6 22,12 18,12"/></svg>`,
    params: [
      { key: "v0", label: "初速度 (m/s)", value: 8, min: 1, max: 20, step: 0.5 },
      { key: "mu", label: "摩擦系数 μ", value: 0.3, min: 0.05, max: 1, step: 0.05 },
      { key: "gravity", label: "重力加速度 (m/s²)", value: 9.8, min: 1, max: 20, step: 0.1 },
    ],
    devNotes: `匀减速，逻辑简单：

\`\`\`js
a = mu * gravity
s.vx -= a * dt
s.x += s.vx * dt
\`\`\`

停止判断要注意：速度 ≤ 0 时强制归零，不然物体可能"倒退"。理论停止距离 \`v₀²/(2μg)\` 直接用公式算出来显示，比从模拟数据提取准确。

摩擦系数 0.05-1 覆盖了从冰面到橡胶的范围。
`,

    // ── 物理逻辑 ──
    createState: (p) => ({ x: 0, vx: p.v0, trail: [], _t: 0 }),
    step: (s, p, dt) => {
      const a = p.mu * p.gravity
      s.vx -= a * dt
      s._t += dt
      if (s.vx <= 0) { s.vx = 0; return }
      s.x += s.vx * dt
    },
    isFinished: (s) => s.vx <= 0,
    getBallPosition: (s) => ({ x: s.x, y: GROUND_Y }),
    getTrailPosition: (s) => ({ x: s.x, y: GROUND_Y }),
    trailFields: (s) => ({ t: s._t, vx: s.vx, x: s.x }),
    chartDefs: [
      { title: "v-t 图", xLabel: "t (s)", yLabel: "v (m/s)", getData: (trail) => [{ name: "速度", data: trail.map(p => [p.t, p.vx]) }] },
      { title: "x-t 图", xLabel: "t (s)", yLabel: "x (m)", getData: (trail) => [{ name: "位移", data: trail.map(p => [p.t, p.x]) }] },
    ],
    getInfoLines: (s, p, t) => {
      const a = p.mu * p.gravity
      return [
        `位移: ${s.x.toFixed(2)} m`,
        `速度: ${s.vx.toFixed(2)} m/s`,
        `减速度: ${a.toFixed(2)} m/s²`,
        `μ = ${p.mu},  g = ${p.gravity} m/s²`,
        `理论停止距离: ${(p.v0 * p.v0 / (2 * a)).toFixed(2)} m`,
        `预计剩余: ${s.vx > 0 ? (s.vx / a).toFixed(2) : 0} s`,
      ]
    },

    // ── 渲染逻辑 ──
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
  }
