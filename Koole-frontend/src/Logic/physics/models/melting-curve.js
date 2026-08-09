// melting-curve 模型数据
export default {
    id: "melting-curve",
    level: "初中",
    category: "热学",
    name: "晶体熔化曲线",
    desc: "对比晶体和非晶体受热时的温度变化",
    knowledge: `## 晶体熔化曲线

物质受热时，温度通常会上升。但晶体熔化时有一个很特别的阶段：继续吸热，温度却暂时不变。

- 吸热升温：$Q = cmΔt$
- 晶体熔化时：温度保持在熔点附近

其中：$Q$ 是吸收的热量，$c$ 是比热容，$m$ 是质量，$Δt$ 是温度变化量。

晶体有固定熔点，比如冰在标准大气压下约 0°C 熔化。熔化过程中，吸收的热量主要用来改变物质状态，所以温度会出现一段“平台”。

非晶体没有固定熔点，受热时会慢慢变软，温度一般持续上升，不会出现明显平台。

> 切换晶体和非晶体，看温度-时间图中有没有水平平台，这就是最直观的区别。`,
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19h16"/><path d="M4 19V5"/><path d="M6 16l4-4h4l4-6"/><path d="M10 12h4"/></svg>`,
    params: [
      { key: "type", label: "物质类型", value: 1, options: [{ label: "晶体", value: 1 }, { label: "非晶体", value: 0 }] },
      { key: "startTemp", label: "初温 (°C)", value: 20, min: -20, max: 60, step: 5 },
      { key: "meltingPoint", label: "熔点 (°C)", value: 60, min: 0, max: 100, step: 5 },
      { key: "heatRate", label: "升温速率 (°C/s)", value: 6, min: 1, max: 15, step: 0.5 },
      { key: "meltTime", label: "熔化用时 (s)", value: 5, min: 1, max: 12, step: 0.5 },
      { key: "duration", label: "观察时间 (s)", value: 16, min: 6, max: 28, step: 1 },
    ],

    // ── 物理逻辑 ──
    createState: (p) => ({ temp: p.startTemp, _t: 0, meltProgress: 0, phase: "升温", trail: [] }),
    step: (s, p, dt) => {
      s._t += dt
      if (!p.type) {
        s.temp = p.startTemp + p.heatRate * 0.82 * s._t
        s.phase = "逐渐软化"
        return
      }
      if (s.temp < p.meltingPoint && s.meltProgress <= 0) {
        s.temp = Math.min(p.meltingPoint, s.temp + p.heatRate * dt)
        s.phase = s.temp >= p.meltingPoint ? "开始熔化" : "固态升温"
        return
      }
      if (s.meltProgress < 1) {
        s.temp = p.meltingPoint
        s.meltProgress = Math.min(1, s.meltProgress + dt / p.meltTime)
        s.phase = "熔化中"
        return
      }
      s.temp += p.heatRate * 0.72 * dt
      s.phase = "液态升温"
    },
    isFinished: (s, p) => s._t >= p.duration,
    getBallPosition: () => null,
    getTrailPosition: () => null,
    trailFields: (s) => ({ t: s._t, temp: s.temp, progress: s.meltProgress }),
    chartDefs: [
      { title: "温度-时间图", xLabel: "t (s)", yLabel: "T (°C)", getData: (trail) => [{ name: "温度", data: trail.map(p => [p.t, p.temp]) }] },
    ],
    getInfoLines: (s, p, t) => [
      `类型: ${p.type ? '晶体' : '非晶体'}`,
      `温度: ${s.temp.toFixed(1)} °C`,
      `熔点: ${p.type ? `${p.meltingPoint} °C` : '无固定熔点'}`,
      `阶段: ${s.phase}`,
      `熔化进度: ${p.type ? `${(s.meltProgress * 100).toFixed(0)}%` : '不适用'}`,
      `时间: ${Math.min(t, p.duration).toFixed(2)} s`,
    ],

    // ── 渲染逻辑 ──
    drawObject: () => {},
    drawExtra: (ctx, s, p, w2s, getTheme) => {
      const isDark = getTheme && getTheme() === "dark"
      const dpr = window.devicePixelRatio || 1
      const cw = ctx.canvas.width / dpr
      const ch = ctx.canvas.height / dpr
      const left = 76
      const right = cw - 70
      const top = 70
      const bottom = ch - 70
      const width = right - left
      const height = bottom - top
      const maxTemp = Math.max(p.meltingPoint + p.heatRate * p.duration * 0.5, p.startTemp + p.heatRate * p.duration)
      const minTemp = Math.min(p.startTemp - 10, 0)
      const yOf = (temp) => bottom - (temp - minTemp) / (maxTemp - minTemp) * height
      const xOf = (time) => left + time / p.duration * width

      ctx.strokeStyle = isDark ? "rgba(255,255,255,0.28)" : "rgba(0,0,0,0.22)"
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.moveTo(left, top)
      ctx.lineTo(left, bottom)
      ctx.lineTo(right, bottom)
      ctx.stroke()

      ctx.fillStyle = isDark ? "#aaa" : "#666"
      ctx.font = "12px sans-serif"
      ctx.textAlign = "center"
      ctx.fillText("时间 t", (left + right) / 2, bottom + 34)
      ctx.save()
      ctx.translate(left - 46, (top + bottom) / 2)
      ctx.rotate(-Math.PI / 2)
      ctx.fillText("温度 T", 0, 0)
      ctx.restore()

      const mpY = yOf(p.meltingPoint)
      if (p.type) {
        ctx.strokeStyle = "rgba(231, 76, 60, 0.45)"
        ctx.setLineDash([6, 5])
        ctx.beginPath()
        ctx.moveTo(left, mpY)
        ctx.lineTo(right, mpY)
        ctx.stroke()
        ctx.setLineDash([])
        ctx.fillStyle = "#e74c3c"
        ctx.textAlign = "left"
        ctx.fillText(`熔点 ${p.meltingPoint}°C`, right - 92, mpY - 8)
      }

      const drawCurve = () => {
        ctx.strokeStyle = p.type ? "#e74c3c" : "#3498db"
        ctx.lineWidth = 3
        ctx.beginPath()
        const points = s.trail && s.trail.length ? s.trail : [{ t: 0, temp: p.startTemp }, { t: s._t, temp: s.temp }]
        points.forEach((pt, i) => {
          const x = xOf(Math.min(pt.t, p.duration))
          const y = yOf(pt.temp)
          if (i === 0) ctx.moveTo(x, y)
          else ctx.lineTo(x, y)
        })
        ctx.stroke()
      }
      drawCurve()

      const beakerX = cw - 150
      const beakerY = 66
      ctx.strokeStyle = isDark ? "#bbb" : "#555"
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(beakerX, beakerY)
      ctx.lineTo(beakerX + 18, beakerY + 78)
      ctx.lineTo(beakerX + 82, beakerY + 78)
      ctx.lineTo(beakerX + 100, beakerY)
      ctx.stroke()
      ctx.fillStyle = p.type ? "rgba(231,76,60,0.25)" : "rgba(52,152,219,0.25)"
      ctx.fillRect(beakerX + 22, beakerY + 38, 56, 38)
      ctx.fillStyle = isDark ? "#eee" : "#333"
      ctx.font = "bold 13px sans-serif"
      ctx.textAlign = "center"
      ctx.fillText(`${s.temp.toFixed(1)}°C`, beakerX + 50, beakerY + 100)
      ctx.fillText(s.phase, beakerX + 50, beakerY + 118)
    },
  }
