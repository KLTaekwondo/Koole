// mechanical-energy 模型数据
export default {
    id: "mechanical-energy",
    level: "初中",
    category: "力学",
    name: "机械能转化",
    desc: "小球沿斜面下滑，观察动能和重力势能转化",
    knowledge: `## 机械能转化

机械能主要包括动能和势能。物体在高处有重力势能，运动起来有动能。

- 动能：$E_k = \\frac{1}{2}mv^2$
- 重力势能：$E_p = mgh$
- 机械能：$E = E_k + E_p$

其中：$m$ 是质量，$v$ 是速度，$g$ 是重力加速度，$h$ 是相对参考面的高度。

小球从斜面滑下时，高度降低，重力势能减少；速度变大，动能增加。没有摩擦时，总机械能基本不变；有摩擦时，一部分机械能会转化成内能。

这里抓住“能量去哪了”就行：少掉的势能不会凭空消失，要么变成动能，要么被摩擦消耗掉。

> 把摩擦系数调大，小球到达底端时速度会变小，机械能损失会更明显。`,
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 19h18"/><path d="M5 17L19 7"/><circle cx="8" cy="14" r="2"/><path d="M15 5v8"/><path d="M12 10l3 3 3-3"/></svg>`,
    params: [
      { key: "mass", label: "质量 m (kg)", value: 1, min: 0.2, max: 5, step: 0.1 },
      { key: "height", label: "斜面高度 h (m)", value: 5, min: 1, max: 10, step: 0.5 },
      { key: "angle", label: "斜面角度 (°)", value: 30, min: 15, max: 55, step: 5 },
      { key: "friction", label: "摩擦系数 μ", value: 0.05, min: 0, max: 0.5, step: 0.01 },
      { key: "gravity", label: "重力加速度 (m/s²)", value: 9.8, min: 1, max: 20, step: 0.1 },
    ],

    // ── 物理逻辑 ──
    createState: (p) => {
      const rad = p.angle * Math.PI / 180
      const length = p.height / Math.sin(rad)
      const E0 = p.mass * p.gravity * p.height
      return { dist: 0, v: 0, a: 0, length, _t: 0, trail: [], E0, loss: 0 }
    },
    step: (s, p, dt) => {
      const rad = p.angle * Math.PI / 180
      s.length = p.height / Math.sin(rad)
      const a = p.gravity * (Math.sin(rad) - p.friction * Math.cos(rad))
      s.a = Math.max(0, a)
      s.v += s.a * dt
      s.dist += s.v * dt
      if (s.dist >= s.length) {
        s.dist = s.length
        s.v = Math.sqrt(Math.max(0, 2 * s.a * s.length))
      }
      s._t += dt
      const h = Math.max(0, p.height - s.dist * Math.sin(rad))
      const Ek = 0.5 * p.mass * s.v * s.v
      const Ep = p.mass * p.gravity * h
      s.loss = Math.max(0, s.E0 - Ek - Ep)
    },
    isFinished: (s) => s.dist >= s.length,
    getBallPosition: (s, p) => {
      const rad = p.angle * Math.PI / 180
      const x = s.dist * Math.cos(rad)
      const y = Math.max(0.4, p.height - s.dist * Math.sin(rad) + 0.4)
      return { x, y }
    },
    getTrailPosition: (s, p) => {
      const rad = p.angle * Math.PI / 180
      return { x: s.dist * Math.cos(rad), y: Math.max(0.4, p.height - s.dist * Math.sin(rad) + 0.4) }
    },
    trailFields: (s, p) => {
      const rad = p.angle * Math.PI / 180
      const h = Math.max(0, p.height - s.dist * Math.sin(rad))
      const Ek = 0.5 * p.mass * s.v * s.v
      const Ep = p.mass * p.gravity * h
      return { t: s._t, Ek, Ep, E: Ek + Ep, loss: s.loss, v: s.v }
    },
    chartDefs: [
      { title: "能量-t 图", xLabel: "t (s)", yLabel: "E (J)", getData: (trail) => [
        { name: "动能", data: trail.map(p => [p.t, p.Ek]) },
        { name: "势能", data: trail.map(p => [p.t, p.Ep]) },
        { name: "机械能", data: trail.map(p => [p.t, p.E]), lineStyle: "dashed" },
      ]},
      { title: "v-t 图", xLabel: "t (s)", yLabel: "v (m/s)", getData: (trail) => [{ name: "速度", data: trail.map(p => [p.t, p.v]) }] },
    ],
    getInfoLines: (s, p, t) => {
      const rad = p.angle * Math.PI / 180
      const h = Math.max(0, p.height - s.dist * Math.sin(rad))
      const Ek = 0.5 * p.mass * s.v * s.v
      const Ep = p.mass * p.gravity * h
      const E = Ek + Ep
      return [
        `高度: ${h.toFixed(2)} m`,
        `速度: ${s.v.toFixed(2)} m/s`,
        `动能: ${Ek.toFixed(2)} J`,
        `重力势能: ${Ep.toFixed(2)} J`,
        `机械能: ${E.toFixed(2)} J`,
        `摩擦损失: ${Math.max(0, s.E0 - E).toFixed(2)} J`,
        `状态: ${s.dist >= s.length ? '到达底端' : '下滑中'}`,
        `时间: ${t.toFixed(2)} s`,
      ]
    },

    // ── 渲染逻辑 ──
    drawObject: () => {},
    drawExtra: (ctx, s, p, w2s, getTheme) => {
      const isDark = getTheme && getTheme() === "dark"
      const rad = p.angle * Math.PI / 180
      const length = p.height / Math.sin(rad)
      const top = w2s(0, p.height)
      const bottom = w2s(length * Math.cos(rad), 0)
      const ballPos = w2s(s.dist * Math.cos(rad), Math.max(0.4, p.height - s.dist * Math.sin(rad) + 0.4))

      ctx.strokeStyle = isDark ? "#888" : "#7f8c8d"
      ctx.lineWidth = 5
      ctx.beginPath()
      ctx.moveTo(top.x, top.y)
      ctx.lineTo(bottom.x, bottom.y)
      ctx.stroke()
      ctx.strokeStyle = isDark ? "#555" : "#95a5a6"
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.moveTo(top.x - 20, bottom.y)
      ctx.lineTo(bottom.x + 60, bottom.y)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(top.x, top.y)
      ctx.lineTo(top.x, bottom.y)
      ctx.stroke()

      ctx.fillStyle = "#e74c3c"
      ctx.beginPath()
      ctx.arc(ballPos.x, ballPos.y, 13, 0, Math.PI * 2)
      ctx.fill()
      ctx.strokeStyle = "rgba(0,0,0,0.25)"
      ctx.lineWidth = 1.5
      ctx.stroke()

      const h = Math.max(0, p.height - s.dist * Math.sin(rad))
      const Ek = 0.5 * p.mass * s.v * s.v
      const Ep = p.mass * p.gravity * h
      const loss = Math.max(0, s.E0 - Ek - Ep)
      const maxE = Math.max(s.E0, 1)
      const bars = [
        { label: "Ek", value: Ek, color: "#e74c3c" },
        { label: "Ep", value: Ep, color: "#3498db" },
        { label: "损失", value: loss, color: "#f39c12" },
      ]
      const dpr = window.devicePixelRatio || 1
      const cw = ctx.canvas.width / dpr
      const barX = cw - 170
      const baseY = 110
      ctx.font = "bold 12px sans-serif"
      ctx.textAlign = "center"
      bars.forEach((bar, i) => {
        const x = barX + i * 48
        const bh = Math.min(90, bar.value / maxE * 90)
        ctx.fillStyle = bar.color
        ctx.fillRect(x, baseY + 90 - bh, 28, bh)
        ctx.fillStyle = isDark ? "#ddd" : "#333"
        ctx.fillText(bar.label, x + 14, baseY + 108)
        ctx.font = "10px sans-serif"
        ctx.fillText(`${bar.value.toFixed(1)}J`, x + 14, baseY + 122)
        ctx.font = "bold 12px sans-serif"
      })

      ctx.fillStyle = isDark ? "#ddd" : "#333"
      ctx.font = "bold 13px sans-serif"
      ctx.textAlign = "left"
      ctx.fillText(`h=${h.toFixed(2)}m`, ballPos.x + 18, ballPos.y - 12)
      ctx.fillText(`v=${s.v.toFixed(2)}m/s`, ballPos.x + 18, ballPos.y + 6)
    },
  }
