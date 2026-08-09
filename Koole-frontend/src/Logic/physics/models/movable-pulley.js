// movable-pulley 模型数据
export default {
    id: "movable-pulley",
    level: "初中",
    category: "力学",
    name: "动滑轮",
    desc: "动滑轮省一半力，但费一倍距离",
    knowledge: `## 动滑轮

轴随物体一起动的滑轮，本质是动力臂为阻力臂 2 倍的杠杆。

省一半力 $F = \\frac{mg}{2}$（$F$ 是拉力，$m$ 是质量，$g$ 是重力加速度），但费一倍距离 $s_{拉} = 2s_{物}$（$s_{拉}$ 是拉绳距离，$s_{物}$ 是物体上升距离），不能改变方向。省力的代价是费距离——能量守恒，没有免费的午餐。

> 改变质量，拉力始终是重力的一半——两段绳子分担了重量。`,
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><line x1="8" y1="4" x2="8" y2="8"/><line x1="16" y1="4" x2="16" y2="8"/><line x1="12" y1="16" x2="12" y2="22"/></svg>`,
    params: [
      { key: "mass", label: "物体质量 (kg)", value: 4, min: 0.5, max: 10, step: 0.5 },
      { key: "pullForce", label: "拉力 (N)", value: 25, min: 0, max: 100, step: 1 },
      { key: "ceilingH", label: "天花板高度 (m)", value: 10, min: 3, max: 15, step: 0.5 },
      { key: "initHeight", label: "初始高度 (m)", value: 3, min: 0.5, max: 10.0, step: 0.5 },
      { key: "gravity", label: "重力加速度 (m/s²)", value: 9.8, min: 1, max: 20, step: 0.1 },
    ],
    devNotes: `动滑轮的力学关键是两段绳子分担重量：

\`\`\`js
netF = 2 * pullForce - weight
a = netF / mass
s.effortY = s._effortY0 + 2 * (s.y - s._y0)  // 绳长守恒
\`\`\`

手拉 2m，重物只升 1m——距离换力。滑轮位置随重物联动。
`,

    // ── 物理逻辑 ──
    createState: (p) => {
      const H = p.ceilingH || 5
      const y0 = Math.min(p.initHeight || 2, H - 1.5)
      const PULLEY_OFFSET = 1.0
      const effortY0 = Math.min(y0 + PULLEY_OFFSET + 0.3, H - 0.5)
      return { y: y0, _y0: y0, _effortY0: effortY0, effortY: effortY0, vy: 0, _t: 0, trail: [] }
    },
    step: (s, p, dt) => {
      const weight = p.mass * p.gravity
      const netF = 2 * p.pullForce - weight
      const a = netF / p.mass
      s.vy += a * dt
      s.y += s.vy * dt
      s._t += dt
      const H = p.ceilingH || 5
      const PULLEY_OFFSET = 1.0
      const maxY = H - PULLEY_OFFSET - 0.3
      const minY = 0.5
      if (s.y > maxY) { s.y = maxY; if (s.vy > 0) s.vy = 0 }
      if (s.y < minY) { s.y = minY; if (s.vy < 0) s.vy = 0 }
      s.effortY = s._effortY0 + 2 * (s.y - s._y0)
    },
    isFinished: () => false,
    getBallPosition: (s) => ({ x: 0, y: s.y }),
    getTrailPosition: () => null,
    trailFields: (s) => ({ t: s._t, y: s.y, vy: s.vy, effortY: s.effortY }),
    chartDefs: [
      { title: "y-t 图", xLabel: "t (s)", yLabel: "y (m)", getData: (trail) => [
        { name: "重物高度", data: trail.map(p => [p.t, p.y]) },
      ]},
      { title: "v-t 图", xLabel: "t (s)", yLabel: "v (m/s)", getData: (trail) => [
        { name: "重物速度", data: trail.map(p => [p.t, p.vy]) },
      ]},
      { title: "手位置-t 图", xLabel: "t (s)", yLabel: "手高度 (m)", getData: (trail) => [
        { name: "手高度", data: trail.map(p => [p.t, p.effortY]) },
      ]},
    ],
    getInfoLines: (s, p, t) => {
      const weight = p.mass * p.gravity
      const H = p.ceilingH || 5
      const PULLEY_OFFSET = 1.0
      const maxY = H - PULLEY_OFFSET - 0.3
      const netF = 2 * p.pullForce - weight
      const a = netF / p.mass
      return [
        `重物高度: ${s.y.toFixed(2)} / ${maxY.toFixed(2)} m`,
        `手高度: ${s.effortY.toFixed(2)} m`,
        `速度: ${s.vy.toFixed(2)} m/s`,
        `重力: ${weight.toFixed(1)} N`,
        `拉力: ${p.pullForce.toFixed(1)} N × 2 = ${(2 * p.pullForce).toFixed(1)} N`,
        `合力: ${netF.toFixed(1)} N`,
        `加速度: ${a.toFixed(2)} m/s²`,
        `状态: ${Math.abs(netF) < 0.05 ? '平衡 ✓' : (netF > 0 ? '上升 ↑' : '下降 ↓')}`,
        `时间: ${t.toFixed(2)} s`,
      ]
    },

    // ── 渲染逻辑 ──
    drawObject: () => {},
    drawExtra: (ctx, state, params, w2s, getTheme) => {
      const H = params.ceilingH || 5
      const pr = 14
      const isDark = getTheme && getTheme() === "dark"

      const anchorS = w2s(-1.5, H)
      const pulleyS = w2s(-1.0, state.y + 1.0)
      const loadS = w2s(-1.0, state.y)
      const effortS = w2s(-0.5, state.effortY)

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

      ctx.strokeStyle = colors.ceiling
      ctx.lineWidth = 4
      ctx.beginPath()
      ctx.moveTo(anchorS.x - 10, anchorS.y)
      ctx.lineTo(effortS.x, anchorS.y)
      ctx.stroke()

      ctx.fillStyle = colors.anchor
      ctx.beginPath()
      ctx.arc(anchorS.x, anchorS.y, 4, 0, Math.PI * 2)
      ctx.fill()

      ctx.strokeStyle = colors.rope
      ctx.lineWidth = 2

      const handAbovePulley = effortS.y < pulleyS.y - 2
      ctx.beginPath()
      if (handAbovePulley) {
        ctx.arc(pulleyS.x, pulleyS.y, pr, Math.PI, 0, false)
      } else {
        ctx.arc(pulleyS.x, pulleyS.y, pr, 0, Math.PI, false)
      }
      ctx.stroke()

      ctx.beginPath()
      ctx.moveTo(anchorS.x, anchorS.y)
      ctx.lineTo(pulleyS.x - pr, pulleyS.y)
      ctx.stroke()

      ctx.beginPath()
      ctx.moveTo(pulleyS.x + pr, pulleyS.y)
      ctx.lineTo(effortS.x, effortS.y)
      ctx.stroke()

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

      ctx.strokeStyle = colors.hook
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(pulleyS.x, pulleyS.y + pr)
      ctx.lineTo(loadS.x, loadS.y - 12)
      ctx.stroke()

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
  }
