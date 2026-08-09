// two-force-balance 模型数据
export default {
    id: "two-force-balance",
    level: "初中",
    category: "力学",
    name: "二力平衡",
    desc: "同一物体受到两个相反方向的力，观察平衡和加速",
    knowledge: `## 二力平衡

一个物体只受两个力时，如果它还能保持静止或匀速直线运动，这两个力就是一对平衡力。

二力平衡的条件可以压成四个词：同体、等大、反向、共线。

- 平衡条件：$F_1 = F_2$
- 合力：$F_{合} = F_{右} - F_{左}$
- 加速度：$a = \\frac{F_{合}}{m}$

其中：$F_1$、$F_2$ 是作用在同一物体上的两个力，$F_{合}$ 是合力，$m$ 是物体质量，$a$ 是加速度。

这里最容易混的是“平衡力”和“相互作用力”。平衡力作用在同一个物体上；相互作用力作用在两个不同物体上。只要盯住“是不是同一个物体”，就不容易错。

两个力相等时，合力为零，物体的运动状态不改变；两个力不相等时，物体会向合力方向加速。

> 把左右拉力调成一样，物体不加速；只要差一点，速度就会慢慢变出来。`,
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="6" height="6" rx="1"/><path d="M9 12H3"/><path d="M3 12l3-3"/><path d="M3 12l3 3"/><path d="M15 12h6"/><path d="M21 12l-3-3"/><path d="M21 12l-3 3"/></svg>`,
    params: [
      { key: "leftForce", label: "左拉力 (N)", value: 8, min: 0, max: 20, step: 0.5 },
      { key: "rightForce", label: "右拉力 (N)", value: 8, min: 0, max: 20, step: 0.5 },
      { key: "mass", label: "质量 (kg)", value: 2, min: 0.5, max: 10, step: 0.5 },
      { key: "duration", label: "观察时间 (s)", value: 6, min: 2, max: 12, step: 1 },
    ],

    // ── 物理逻辑 ──
    createState: () => ({ x: 0, v: 0, a: 0, y: 0.4, _t: 0, trail: [] }),
    step: (s, p, dt) => {
      const netF = p.rightForce - p.leftForce
      s.a = netF / p.mass
      s.v += s.a * dt
      s.x += s.v * dt
      s._t += dt
    },
    isFinished: (s, p) => s._t >= p.duration,
    getBallPosition: (s) => ({ x: s.x, y: s.y }),
    getTrailPosition: (s) => ({ x: s.x, y: s.y }),
    trailFields: (s, p) => ({ t: s._t, x: s.x, v: s.v, a: s.a, netF: p.rightForce - p.leftForce }),
    chartDefs: [
      { title: "x-t 图", xLabel: "t (s)", yLabel: "x (m)", getData: (trail) => [{ name: "位置", data: trail.map(p => [p.t, p.x]) }] },
      { title: "v-t 图", xLabel: "t (s)", yLabel: "v (m/s)", getData: (trail) => [{ name: "速度", data: trail.map(p => [p.t, p.v]) }] },
    ],
    getInfoLines: (s, p, t) => {
      const netF = p.rightForce - p.leftForce
      const status = Math.abs(netF) < 0.001 ? "平衡：运动状态不改变" : (netF > 0 ? "向右加速" : "向左加速")
      return [
        `左拉力: ${p.leftForce.toFixed(1)} N`,
        `右拉力: ${p.rightForce.toFixed(1)} N`,
        `合力: ${netF.toFixed(1)} N`,
        `加速度: ${(netF / p.mass).toFixed(2)} m/s²`,
        `速度: ${s.v.toFixed(2)} m/s`,
        `位置: ${s.x.toFixed(2)} m`,
        `状态: ${status}`,
        `时间: ${Math.min(t, p.duration).toFixed(2)} s`,
      ]
    },

    // ── 渲染逻辑 ──
    drawObject: () => {},
    drawExtra: (ctx, s, p, w2s, getTheme) => {
      const isDark = getTheme && getTheme() === "dark"
      const block = w2s(s.x, 0.45)
      const ground = w2s(0, 0)
      const blockW = 70
      const blockH = 42

      ctx.strokeStyle = isDark ? "#666" : "#95a5a6"
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.moveTo(block.x - 260, ground.y)
      ctx.lineTo(block.x + 260, ground.y)
      ctx.stroke()

      if (s.trail && s.trail.length > 1) {
        ctx.strokeStyle = "rgba(52, 152, 219, 0.45)"
        ctx.lineWidth = 2
        ctx.beginPath()
        s.trail.forEach((pt, i) => {
          const ps = w2s(pt.x, pt.y)
          if (i === 0) ctx.moveTo(ps.x, ps.y + 26)
          else ctx.lineTo(ps.x, ps.y + 26)
        })
        ctx.stroke()
      }

      ctx.fillStyle = "#e67e22"
      ctx.fillRect(block.x - blockW / 2, block.y - blockH, blockW, blockH)
      ctx.strokeStyle = "rgba(0,0,0,0.25)"
      ctx.lineWidth = 1.5
      ctx.strokeRect(block.x - blockW / 2, block.y - blockH, blockW, blockH)
      ctx.fillStyle = "#fff"
      ctx.font = "bold 13px sans-serif"
      ctx.textAlign = "center"
      ctx.fillText(`${p.mass}kg`, block.x, block.y - 17)

      const drawArrow = (fromX, toX, color, label) => {
        const y = block.y - blockH / 2
        ctx.strokeStyle = color
        ctx.fillStyle = color
        ctx.lineWidth = 3
        ctx.beginPath()
        ctx.moveTo(fromX, y)
        ctx.lineTo(toX, y)
        ctx.stroke()
        const dir = Math.sign(toX - fromX) || 1
        ctx.beginPath()
        ctx.moveTo(toX, y)
        ctx.lineTo(toX - dir * 10, y - 6)
        ctx.lineTo(toX - dir * 10, y + 6)
        ctx.closePath()
        ctx.fill()
        ctx.font = "bold 12px sans-serif"
        ctx.fillText(label, (fromX + toX) / 2, y - 12)
      }

      const lLen = Math.max(18, p.leftForce * 5)
      const rLen = Math.max(18, p.rightForce * 5)
      drawArrow(block.x - blockW / 2 - 10, block.x - blockW / 2 - 10 - lLen, "#3498db", `F左=${p.leftForce}N`)
      drawArrow(block.x + blockW / 2 + 10, block.x + blockW / 2 + 10 + rLen, "#2ecc71", `F右=${p.rightForce}N`)

      const netF = p.rightForce - p.leftForce
      ctx.fillStyle = Math.abs(netF) < 0.001 ? (isDark ? "#ddd" : "#555") : "#e74c3c"
      ctx.font = "bold 14px sans-serif"
      ctx.textAlign = "center"
      ctx.fillText(Math.abs(netF) < 0.001 ? "合力为 0，平衡" : `合力 ${Math.abs(netF).toFixed(1)}N，${netF > 0 ? "向右" : "向左"}`, block.x, block.y - blockH - 32)
    },
  }
