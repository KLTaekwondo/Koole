// pulley-system 模型数据
const DRAW_SCALE = 30

export default {
    id: "pulley-system",
    level: "初中",
    category: "力学",
    name: "滑轮组",
    desc: "定滑轮+动滑轮组合，省力又改变方向",
    knowledge: `## 滑轮组

定滑轮 + 动滑轮组合，既省力又能改变方向。

拉力 $F = \\frac{mg}{n}$，其中 $F$ 是拉力，$m$ 是质量，$g$ 是重力加速度，$n$ 是承担物重的绳子段数（本模型 n=2）。省力但费距离——拉绳距离 = 物体上升距离 × n。

绳子段数越多越省力，但实际中摩擦也越大，不能无限加。

> n=2 时拉力是重力的一半，同时能向下拉——结合了两种滑轮的优点。`,
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="6" r="3"/><circle cx="16" cy="12" r="3"/><line x1="8" y1="3" x2="8" y2="1"/><line x1="5" y1="9" x2="5" y2="20"/><line x1="11" y1="9" x2="16" y2="9"/><line x1="16" y1="15" x2="16" y2="22"/></svg>`,
    params: [
      { key: "mass", label: "物体质量 (kg)", value: 4, min: 0.5, max: 10, step: 0.5 },
      { key: "pullForce", label: "拉力 (N)", value: 20, min: 0, max: 100, step: 1 },
      { key: "ceilingH", label: "天花板高度 (m)", value: 10, min: 5, max: 15, step: 0.5 },
      { key: "initHeight", label: "初始高度 (m)", value: 3, min: 0.5, max: 10.0, step: 0.5 },
      { key: "gravity", label: "重力加速度 (m/s²)", value: 9.8, min: 1, max: 20, step: 0.1 },
    ],
    devNotes: `滑轮组力学跟动滑轮一样（n=2），但绳子布局复杂一些：

\`\`\`js
netF = 2 * pullForce - weight
a = netF / mass
s.effortY = H + SLACK - 2 * s.y + ROPE_END_OFFSET
\`\`\`

绳子路径：天花板锚点 → 动滑轮 → 定滑轮 → 手。绳长计算要加 SLACK（余量）和 ROPE_END_OFFSET（绳端偏移），不然绳子会绷得太紧或太松。

边界检测：动滑轮不能撞天花板，手不能穿过地板。
`,

    // ── 物理逻辑 ──
    createState: (p) => {
      const H = p.ceilingH || 5
      const SLACK = 1.0
      const PULLEY_OFFSET = 1.2
      const PULLEY_RADIUS = 0.47
      const ROPE_END_OFFSET = 0.5
      const maxY = H - PULLEY_OFFSET - PULLEY_RADIUS - 0.1
      const y0 = Math.min(p.initHeight || 2, maxY)
      const effortY0 = H + SLACK - 2 * y0 + ROPE_END_OFFSET
      return { y: y0, effortY: Math.max(effortY0, 0.3), vy: 0, _t: 0, trail: [] }
    },
    step: (s, p, dt) => {
      const weight = p.mass * p.gravity
      const netF = 2 * p.pullForce - weight
      const a = netF / p.mass
      s.vy += a * dt
      s.y += s.vy * dt
      s._t += dt
      const H = p.ceilingH || 5
      const SLACK = 1.0
      const PULLEY_OFFSET = 1.2
      const PULLEY_RADIUS = 0.47
      const ROPE_END_OFFSET = 0.5
      const maxY = H - PULLEY_OFFSET - PULLEY_RADIUS - 0.1
      const minY = 0.5
      if (s.y > maxY) { s.y = maxY; if (s.vy > 0) s.vy = 0 }
      if (s.y < minY) { s.y = minY; if (s.vy < 0) s.vy = 0 }
      s.effortY = H + SLACK - 2 * s.y + ROPE_END_OFFSET
      if (s.effortY > H) s.effortY = H
      if (s.effortY < 0.3) s.effortY = 0.3
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
      const netF = 2 * p.pullForce - weight
      const a = netF / p.mass
      const H = p.ceilingH || 5
      const PULLEY_OFFSET = 1.2
      const PULLEY_RADIUS = 0.47
      const pulleyTop = s.y + PULLEY_OFFSET + PULLEY_RADIUS
      const atCeiling = pulleyTop >= H - 0.15
      const atFloor = s.effortY <= 0.35
      return [
        `重物高度: ${s.y.toFixed(2)} m`,
        `动滑轮高度: ${(s.y + PULLEY_OFFSET).toFixed(2)} m`,
        `手高度: ${s.effortY.toFixed(2)} m`,
        `速度: ${s.vy.toFixed(2)} m/s`,
        `重力: ${weight.toFixed(1)} N`,
        `拉力: ${p.pullForce.toFixed(1)} N × 2 = ${(2 * p.pullForce).toFixed(1)} N`,
        `合力: ${netF.toFixed(1)} N`,
        `加速度: ${a.toFixed(2)} m/s²`,
        `状态: ${atCeiling ? '■ 动滑轮触顶' : atFloor ? '■ 手已到底' : (Math.abs(netF) < 0.05 ? '平衡 ✓' : (netF > 0 ? '上升 ↑' : '下降 ↓'))}`,
        `时间: ${t.toFixed(2)} s`,
      ]
    },

    // ── 渲染逻辑 ──
    drawObject: () => {},
    drawExtra: (ctx, state, params, w2s, getTheme) => {
      const H = params.ceilingH || 5
      const pr = 14
      const isDark = getTheme && getTheme() === "dark"

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

      const prWorld = pr / DRAW_SCALE
      const anchorS = w2s(-1.0 - prWorld, H)
      const fixedS = w2s(0, H - 0.67)
      const movableS = w2s(-1.0, Math.min(state.y + 1.2, H - 0.3))
      const effortS = w2s(prWorld, state.effortY)
      const loadS = w2s(-1.0, state.y)

      ctx.strokeStyle = colors.ceiling
      ctx.lineWidth = 4
      ctx.beginPath()
      ctx.moveTo(anchorS.x - 20, anchorS.y)
      ctx.lineTo(effortS.x + 20, anchorS.y)
      ctx.stroke()

      ctx.fillStyle = colors.anchor
      ctx.beginPath()
      ctx.arc(anchorS.x, anchorS.y, 4, 0, Math.PI * 2)
      ctx.fill()

      ctx.strokeStyle = colors.bracket
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.moveTo(fixedS.x, fixedS.y)
      ctx.lineTo(fixedS.x, fixedS.y - 20)
      ctx.stroke()
      ctx.fillStyle = colors.bracketFill
      ctx.fillRect(fixedS.x - 14, fixedS.y - 20, 28, 4)

      ctx.strokeStyle = colors.rope
      ctx.lineWidth = 2

      ctx.beginPath()
      ctx.moveTo(anchorS.x, anchorS.y)
      ctx.lineTo(movableS.x - pr, movableS.y)
      ctx.stroke()

      ctx.beginPath()
      ctx.arc(movableS.x, movableS.y, pr, Math.PI, 0, false)
      ctx.stroke()

      ctx.beginPath()
      ctx.moveTo(movableS.x + pr, movableS.y)
      ctx.lineTo(fixedS.x - pr, fixedS.y)
      ctx.stroke()

      ctx.beginPath()
      ctx.arc(fixedS.x, fixedS.y, pr, Math.PI, 0, true)
      ctx.stroke()

      ctx.beginPath()
      ctx.moveTo(fixedS.x + pr, fixedS.y)
      ctx.lineTo(effortS.x, effortS.y)
      ctx.stroke()

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

      const boxW = 28
      const boxH = 24
      ctx.strokeStyle = colors.hook
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(movableS.x, movableS.y + pr)
      ctx.lineTo(loadS.x, loadS.y - boxH / 2)
      ctx.stroke()

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

      ctx.fillStyle = colors.labelColor
      ctx.font = "10px sans-serif"
      ctx.textAlign = "center"
      ctx.fillText("定滑轮", fixedS.x, fixedS.y + pr + 14)
      ctx.fillText("动滑轮", movableS.x, movableS.y + pr + 14)

      ctx.textAlign = "left"
    },
  }
