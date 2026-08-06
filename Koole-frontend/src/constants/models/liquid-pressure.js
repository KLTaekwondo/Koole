// liquid-pressure 模型数据
export default {
    id: "liquid-pressure",
    level: "初中",
    category: "力学",
    name: "液体压强",
    desc: "液体内部压强随深度和液体密度增大",
    knowledge: `## 液体压强

液体内部有压强，而且越深压强越大。这个很好想：越往下，上面压着的液体越多。

- 液体压强：$p = \\rho gh$

其中：$p$ 是液体压强，$\\rho$ 是液体密度，$g$ 是重力加速度，$h$ 是液面到该点的深度。

同种液体里，深度是关键；同一深度下，密度越大的液体压强越大。盐水比清水密度大，所以同样深度下压强也更大。

还有一个容易忽略的点：液体内部同一深度向各个方向都有压强，不只是向下压。

> 把探头往下移，压强箭头会变长；把液体密度调大，同一深度下压强也会变大。`,
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 5v14h14V5"/><path d="M5 11h14"/><circle cx="12" cy="15" r="2"/><path d="M12 15h5"/></svg>`,
    params: [
      { key: "rho", label: "液体密度 ρ (kg/m³)", value: 1000, min: 600, max: 1400, step: 50 },
      { key: "depth", label: "探头深度 h (m)", value: 2, min: 0.2, max: 5, step: 0.1 },
      { key: "gravity", label: "重力加速度 (m/s²)", value: 9.8, min: 1, max: 20, step: 0.1 },
    ],

    // ── 物理逻辑 ──
    createState: (p) => ({ _t: 0, trail: [], pressure: p.rho * p.gravity * p.depth }),
    step: (s, p, dt) => {
      s._t += dt
      s.pressure = p.rho * p.gravity * p.depth
    },
    isFinished: () => false,
    getBallPosition: () => ({ x: 0, y: 2.5 }),
    getTrailPosition: () => null,
    trailFields: (s) => ({ t: s._t, pressure: s.pressure }),
    chartDefs: [],
    getInfoLines: (s, p, t) => {
      const pressure = p.rho * p.gravity * p.depth
      return [
        `液体密度: ${p.rho} kg/m³`,
        `探头深度: ${p.depth.toFixed(1)} m`,
        `压强: p = ρgh = ${pressure.toFixed(0)} Pa`,
        `换算: ${(pressure / 1000).toFixed(2)} kPa`,
        `规律: 深度越大，压强越大`,
        `时间: ${t.toFixed(2)} s`,
      ]
    },

    // ── 渲染逻辑 ──
    drawObject: () => {},
    drawExtra: (ctx, s, p, w2s, getTheme) => {
      const isDark = getTheme && getTheme() === "dark"
      const dpr = window.devicePixelRatio || 1
      const cw = ctx.canvas.width / dpr
      const ch = ctx.canvas.height / dpr
      const tankW = Math.min(420, cw * 0.62)
      const tankH = Math.min(380, ch * 0.68)
      const left = (cw - tankW) / 2
      const top = (ch - tankH) / 2 + 20
      const right = left + tankW
      const bottom = top + tankH
      const waterTop = top + 25
      const waterH = bottom - waterTop
      const probeY = waterTop + (p.depth / 5) * waterH
      const pressure = p.rho * p.gravity * p.depth
      const arrowLen = Math.min(95, 18 + pressure / 800)

      ctx.strokeStyle = isDark ? "#777" : "#7f8c8d"
      ctx.lineWidth = 4
      ctx.beginPath()
      ctx.moveTo(left, top)
      ctx.lineTo(left, bottom)
      ctx.lineTo(right, bottom)
      ctx.lineTo(right, top)
      ctx.stroke()

      const grad = ctx.createLinearGradient(left, waterTop, left, bottom)
      grad.addColorStop(0, isDark ? "rgba(52,152,219,0.35)" : "rgba(52,152,219,0.22)")
      grad.addColorStop(1, isDark ? "rgba(41,128,185,0.65)" : "rgba(52,152,219,0.48)")
      ctx.fillStyle = grad
      ctx.fillRect(left + 2, waterTop, tankW - 4, waterH)
      ctx.strokeStyle = "rgba(52,152,219,0.8)"
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(left + 2, waterTop)
      ctx.lineTo(right - 2, waterTop)
      ctx.stroke()

      const probeX = (left + right) / 2
      ctx.strokeStyle = isDark ? "#ddd" : "#555"
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(probeX, waterTop - 45)
      ctx.lineTo(probeX, probeY)
      ctx.stroke()
      ctx.fillStyle = "#e67e22"
      ctx.beginPath()
      ctx.arc(probeX, probeY, 12, 0, Math.PI * 2)
      ctx.fill()
      ctx.strokeStyle = "rgba(0,0,0,0.25)"
      ctx.stroke()

      const drawPressureArrow = (angle, label) => {
        const x2 = probeX + Math.cos(angle) * arrowLen
        const y2 = probeY + Math.sin(angle) * arrowLen
        ctx.strokeStyle = "#e74c3c"
        ctx.fillStyle = "#e74c3c"
        ctx.lineWidth = 2.5
        ctx.beginPath()
        ctx.moveTo(probeX, probeY)
        ctx.lineTo(x2, y2)
        ctx.stroke()
        ctx.beginPath()
        ctx.arc(x2, y2, 4, 0, Math.PI * 2)
        ctx.fill()
        ctx.font = "bold 11px sans-serif"
        ctx.textAlign = "center"
        ctx.fillText(label, x2, y2 - 8)
      }
      drawPressureArrow(0, "p")
      drawPressureArrow(Math.PI / 2, "p")
      drawPressureArrow(Math.PI, "p")
      drawPressureArrow(-Math.PI / 2, "p")

      ctx.strokeStyle = isDark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.3)"
      ctx.setLineDash([5, 5])
      ctx.beginPath()
      ctx.moveTo(probeX + 26, waterTop)
      ctx.lineTo(probeX + 26, probeY)
      ctx.stroke()
      ctx.setLineDash([])
      ctx.fillStyle = isDark ? "#ddd" : "#333"
      ctx.font = "bold 13px sans-serif"
      ctx.textAlign = "left"
      ctx.fillText(`h=${p.depth.toFixed(1)}m`, probeX + 34, (waterTop + probeY) / 2)
      ctx.fillText(`p=${pressure.toFixed(0)}Pa`, left + 16, top + 18)
      ctx.font = "12px sans-serif"
      ctx.fillText(`ρ=${p.rho}kg/m³`, left + 16, top + 38)
    },
  }
