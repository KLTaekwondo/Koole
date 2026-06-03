// pulley 模型数据
export default {
    id: "pulley",
    level: "初中",
    category: "力学",
    name: "定滑轮",
    desc: "定滑轮改变力的方向，不省力",
    knowledge: `## 定滑轮

轴固定不动的滑轮，本质是等臂杠杆。不省力（$F = mg$，其中 $F$ 是拉力，$m$ 是物体质量，$g$ 是重力加速度），不省距离，但能改变方向——向下拉绳子可以让物体上升。

跟动滑轮对比：定滑轮改变方向但不省力，动滑轮省力但不改变方向。

轻绳假设下绳中张力处处相等，滑轮两侧拉力相同。

> 改变质量试试，拉力始终等于重力——定滑轮就是这么"诚实"。`,
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="6" r="4"/><line x1="12" y1="2" x2="12" y2="1"/><line x1="8" y1="10" x2="8" y2="20"/><line x1="16" y1="10" x2="16" y2="16"/></svg>`,
    params: [
      { key: "mass", label: "物体质量 (kg)", value: 2, min: 0.5, max: 10, step: 0.5 },
      { key: "pullForce", label: "拉力 (N)", value: 20, min: 0, max: 100, step: 1 },
      { key: "pulleyH", label: "滑轮高度 (m)", value: 5, min: 3, max: 7, step: 0.5 },
      { key: "initHeight", label: "初始高度 (m)", value: 2, min: 0.5, max: 4, step: 0.5 },
      { key: "gravity", label: "重力加速度 (m/s²)", value: 9.8, min: 1, max: 20, step: 0.1 },
    ],
    devNotes: `定滑轮的关键是绳长守恒——手拉多长，物体就升多高：

\`\`\`js
netF = pullForce - weight
a = netF / mass
s.effortY = 2 * H - s.ropeLen - s.y  // 绳长约束
\`\`\`

手和物体的位置联动，绳长不变。边界限制：物体不能超过滑轮高度。
`,

    // ── 物理逻辑 ──
    createState: (p) => {
      const H = p.pulleyH || 5
      const y0 = Math.min(p.initHeight || 2, H - 0.5)
      const effortY0 = H - 2.5
      const ropeLen = (H - y0) + (H - effortY0)
      return { y: y0, effortY: effortY0, ropeLen, vy: 0, _t: 0, trail: [] }
    },
    step: (s, p, dt) => {
      const weight = p.mass * p.gravity
      const netF = p.pullForce - weight
      const a = netF / p.mass
      s.vy += a * dt
      s.y += s.vy * dt
      s._t += dt
      const H = p.pulleyH || 5
      const maxY = H - 0.5
      const minY = 0.5
      if (s.y > maxY) { s.y = maxY; if (s.vy > 0) s.vy = 0 }
      if (s.y < minY) { s.y = minY; if (s.vy < 0) s.vy = 0 }
      s.effortY = 2 * H - s.ropeLen - s.y
      if (s.effortY > H) s.effortY = H
      if (s.effortY < 0.3) s.effortY = 0.3
    },
    isFinished: () => false,
    getBallPosition: (s) => ({ x: -0.6, y: s.y }),
    getTrailPosition: () => null,
    trailFields: (s) => ({ t: s._t, y: s.y, vy: s.vy }),
    chartDefs: [
      { title: "y-t 图", xLabel: "t (s)", yLabel: "y (m)", getData: (trail) => [{ name: "高度", data: trail.map(p => [p.t, p.y]) }] },
      { title: "v-t 图", xLabel: "t (s)", yLabel: "v (m/s)", getData: (trail) => [{ name: "速度", data: trail.map(p => [p.t, p.vy]) }] },
    ],
    getInfoLines: (s, p, t) => {
      const weight = p.mass * p.gravity
      const netF = p.pullForce - weight
      const a = netF / p.mass
      return [
        `物体高度: ${s.y.toFixed(2)} m`,
        `速度: ${s.vy.toFixed(2)} m/s`,
        `重力: ${weight.toFixed(1)} N`,
        `拉力: ${p.pullForce.toFixed(1)} N`,
        `合力: ${netF.toFixed(1)} N`,
        `加速度: ${a.toFixed(2)} m/s²`,
        `状态: ${Math.abs(netF) < 0.05 ? '平衡 ✓' : (netF > 0 ? '上升 ↑' : '下降 ↓')}`,
        `时间: ${t.toFixed(2)} s`,
      ]
    },

    // ── 渲染逻辑 ──
    drawObject: () => {},
    drawExtra: (ctx, state, params, w2s, getTheme) => {
      const H = params.pulleyH || 5
      const pulleyS = w2s(0, H)
      const pr = 14
      const isDark = getTheme && getTheme() === "dark"

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

      const loadS = w2s(-0.6, state.y)
      const effortS = w2s(0.6, state.effortY)

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

      ctx.strokeStyle = colors.rope
      ctx.lineWidth = 2

      ctx.beginPath()
      ctx.arc(pulleyS.x, pulleyS.y, pr, Math.PI, 0, true)
      ctx.stroke()

      ctx.beginPath()
      ctx.moveTo(pulleyS.x - pr, pulleyS.y)
      ctx.lineTo(loadS.x, loadS.y - 16)
      ctx.stroke()

      ctx.beginPath()
      ctx.moveTo(effortS.x, effortS.y)
      ctx.lineTo(pulleyS.x + pr, pulleyS.y)
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
  }
