// sound-properties 模型数据
export default {
    id: "sound-properties",
    level: "初中",
    category: "声学",
    name: "声音三要素",
    desc: "频率、振幅和波形分别影响音调、响度和音色",
    knowledge: `## 声音三要素

声音来自物体振动。看一段波形，基本就能读出声音的三个特征：音调、响度、音色。

- 频率越高，音调越高
- 振幅越大，响度越大
- 波形不同，音色不同

其中：频率表示每秒振动次数，单位是 Hz；振幅表示偏离平衡位置的最大距离；音色和发声体、波形有关。

这个模型里，频率调大后，波峰会变密；振幅调大后，波形会变高；切换不同波形，听感上就像不同乐器的区别。

这里容易混的是“响度”和“音调”。响度说的是声音大不大，主要看振幅；音调说的是声音高不高，主要看频率。

> 先只调频率，再只调振幅，对比波形变化，两个概念就分开了。`,
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12c2-6 4-6 6 0s4 6 6 0 4-6 8 0"/><path d="M4 19h16"/></svg>`,
    params: [
      { key: "frequency", label: "频率 f (Hz)", value: 4, min: 1, max: 12, step: 0.5 },
      { key: "amplitude", label: "振幅 A", value: 1, min: 0.2, max: 2, step: 0.1 },
      { key: "waveType", label: "波形", value: 0, options: [{ label: "正弦波", value: 0 }, { label: "方波", value: 1 }, { label: "锯齿波", value: 2 }] },
    ],

    // ── 物理逻辑 ──
    createState: () => ({ _t: 0, phase: 0, trail: [] }),
    step: (s, p, dt) => {
      s._t += dt
      s.phase += p.frequency * dt * Math.PI * 2
    },
    isFinished: () => false,
    getBallPosition: () => null,
    getTrailPosition: () => null,
    trailFields: () => null,
    chartDefs: [],
    getInfoLines: (s, p, t) => {
      const type = p.waveType === 0 ? "正弦波" : p.waveType === 1 ? "方波" : "锯齿波"
      return [
        `频率: ${p.frequency.toFixed(1)} Hz`,
        `音调: ${p.frequency > 7 ? '较高' : p.frequency < 3 ? '较低' : '中等'}`,
        `振幅: ${p.amplitude.toFixed(1)}`,
        `响度: ${p.amplitude > 1.3 ? '较大' : p.amplitude < 0.6 ? '较小' : '中等'}`,
        `波形: ${type}`,
        `音色: 波形改变，音色改变`,
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
      const left = 60
      const right = cw - 60
      const midY = ch / 2
      const ampPx = p.amplitude * 55
      const width = right - left

      const sample = (x01) => {
        const cycles = p.frequency / 2.2
        const phase = x01 * cycles * Math.PI * 2 - s.phase
        if (p.waveType === 1) return Math.sin(phase) >= 0 ? 1 : -1
        if (p.waveType === 2) {
          const u = ((phase / (Math.PI * 2)) % 1 + 1) % 1
          return 2 * u - 1
        }
        return Math.sin(phase)
      }

      ctx.strokeStyle = isDark ? "rgba(255,255,255,0.18)" : "rgba(0,0,0,0.14)"
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(left, midY)
      ctx.lineTo(right, midY)
      ctx.stroke()

      for (let i = 0; i <= 8; i++) {
        const x = left + width * i / 8
        ctx.beginPath()
        ctx.moveTo(x, midY - 120)
        ctx.lineTo(x, midY + 120)
        ctx.stroke()
      }

      ctx.strokeStyle = "#e74c3c"
      ctx.lineWidth = 3
      ctx.beginPath()
      for (let i = 0; i <= 600; i++) {
        const x01 = i / 600
        const x = left + x01 * width
        const y = midY - sample(x01) * ampPx
        if (i === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
      ctx.stroke()

      ctx.strokeStyle = "#3498db"
      ctx.lineWidth = 2
      ctx.setLineDash([5, 4])
      ctx.beginPath()
      ctx.moveTo(left + 20, midY)
      ctx.lineTo(left + 20, midY - ampPx)
      ctx.stroke()
      ctx.setLineDash([])
      ctx.fillStyle = "#3498db"
      ctx.font = "bold 12px sans-serif"
      ctx.textAlign = "left"
      ctx.fillText(`振幅 A=${p.amplitude.toFixed(1)}`, left + 28, midY - ampPx / 2)

      const wavelength = width / Math.max(1, p.frequency / 2.2)
      ctx.strokeStyle = "#2ecc71"
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(left + 80, midY + 105)
      ctx.lineTo(left + 80 + wavelength, midY + 105)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(left + 80, midY + 105)
      ctx.lineTo(left + 88, midY + 100)
      ctx.moveTo(left + 80, midY + 105)
      ctx.lineTo(left + 88, midY + 110)
      ctx.moveTo(left + 80 + wavelength, midY + 105)
      ctx.lineTo(left + wavelength + 72, midY + 100)
      ctx.moveTo(left + 80 + wavelength, midY + 105)
      ctx.lineTo(left + wavelength + 72, midY + 110)
      ctx.stroke()
      ctx.fillStyle = "#2ecc71"
      ctx.font = "bold 12px sans-serif"
      ctx.textAlign = "center"
      ctx.fillText("频率越高，波峰越密", left + 80 + wavelength / 2, midY + 128)

      const type = p.waveType === 0 ? "正弦波" : p.waveType === 1 ? "方波" : "锯齿波"
      ctx.fillStyle = isDark ? "#ddd" : "#333"
      ctx.font = "bold 16px sans-serif"
      ctx.textAlign = "center"
      ctx.fillText(`${type} · f=${p.frequency.toFixed(1)}Hz`, cw / 2, 42)
    },
  }
