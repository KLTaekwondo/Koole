// solid-pressure 模型数据
export default {
    id: "solid-pressure",
    level: "初中",
    category: "力学",
    name: "固体压强",
    desc: "压力和受力面积共同决定压强大小",
    knowledge: `## 固体压强

压强描述的是压力作用得有多“集中”。同样的压力，压在小面积上更明显；同样的面积，压力越大压得越深。

- 压强公式：$p = F / S$

其中：$p$ 是压强，$F$ 是压力，$S$ 是受力面积。压强单位是 Pa，1 Pa = 1 N/m²。

这个关系很直观：刀刃要磨薄、图钉尖要做尖，都是为了减小受力面积，让压强变大；坦克履带很宽，是为了增大受力面积，让压强变小。

这里容易看错的是“压力”和“压强”。压力大不一定压强大，还要看面积。抓住 $F / S$ 这个比值就行。

> 保持压力不变，把受力面积调小，压痕会明显变深。`,
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="7" y="5" width="10" height="7" rx="1"/><path d="M12 12v6"/><path d="M9 16l3 3 3-3"/><path d="M4 20h16"/></svg>`,
    params: [
      { key: "force", label: "压力 F (N)", value: 80, min: 10, max: 300, step: 5 },
      { key: "area", label: "受力面积 S (m²)", value: 0.08, min: 0.01, max: 0.30, step: 0.01 },
    ],

    // ── 物理逻辑 ──
    createState: (p) => ({ _t: 0, trail: [], pressure: p.force / p.area }),
    step: (s, p, dt) => {
      s._t += dt
      s.pressure = p.force / p.area
    },
    isFinished: () => false,
    getBallPosition: () => ({ x: 0, y: 0.5 }),
    getTrailPosition: () => null,
    trailFields: (s) => ({ t: s._t, pressure: s.pressure }),
    chartDefs: [],
    getInfoLines: (s, p, t) => {
      const pressure = p.force / p.area
      return [
        `压力: ${p.force.toFixed(1)} N`,
        `受力面积: ${p.area.toFixed(3)} m²`,
        `压强: p = F/S = ${pressure.toFixed(0)} Pa`,
        `换算: ${(pressure / 1000).toFixed(2)} kPa`,
        `面积变化: 面积越小，压强越大`,
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
      const cx = cw / 2
      const baseY = ch * 0.68
      const pressure = p.force / p.area
      const maxPressure = 300 / 0.01
      const pressureRatio = Math.min(1, pressure / maxPressure)
      const blockW = 55 + p.area * 380
      const blockH = 70
      const dent = 8 + pressureRatio * 46

      ctx.fillStyle = isDark ? "#3a3025" : "#d8b384"
      ctx.fillRect(60, baseY, cw - 120, 90)
      ctx.strokeStyle = isDark ? "#6b5a45" : "#b88655"
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(60, baseY)
      ctx.lineTo(cx - blockW / 2, baseY)
      ctx.quadraticCurveTo(cx, baseY + dent, cx + blockW / 2, baseY)
      ctx.lineTo(cw - 60, baseY)
      ctx.stroke()

      ctx.fillStyle = "#e67e22"
      ctx.fillRect(cx - blockW / 2, baseY - blockH, blockW, blockH)
      ctx.strokeStyle = "rgba(0,0,0,0.25)"
      ctx.lineWidth = 1.5
      ctx.strokeRect(cx - blockW / 2, baseY - blockH, blockW, blockH)

      ctx.fillStyle = "#fff"
      ctx.font = "bold 13px sans-serif"
      ctx.textAlign = "center"
      ctx.fillText(`S=${p.area.toFixed(2)}m²`, cx, baseY - blockH / 2 + 4)

      const arrowTop = baseY - blockH - 80
      ctx.strokeStyle = "#e74c3c"
      ctx.fillStyle = "#e74c3c"
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.moveTo(cx, arrowTop)
      ctx.lineTo(cx, baseY - blockH - 10)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(cx, baseY - blockH - 10)
      ctx.lineTo(cx - 8, baseY - blockH - 22)
      ctx.lineTo(cx + 8, baseY - blockH - 22)
      ctx.closePath()
      ctx.fill()
      ctx.font = "bold 13px sans-serif"
      ctx.fillText(`F=${p.force}N`, cx, arrowTop - 8)

      ctx.fillStyle = isDark ? "#eee" : "#333"
      ctx.font = "bold 15px sans-serif"
      ctx.fillText(`p = ${pressure.toFixed(0)} Pa`, cx, baseY + 62)

      ctx.fillStyle = isDark ? "#aaa" : "#666"
      ctx.font = "12px sans-serif"
      ctx.fillText(`压痕深浅表示压强大小`, cx, baseY + 82)
    },
  }
