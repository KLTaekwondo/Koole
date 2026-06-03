// string-wave 模型数据
export default {
    id: "string-wave",
    level: "高中",
    category: "波",
    name: "波的叠加",
    desc: "两列波从两端相向传播，观察干涉与叠加",
    knowledge: `## 波的叠加

两列波相遇位移直接相加：$y = y_1 + y_2$，这就是叠加原理。

公式表：波速 $v = \\lambda f$，角频率 $\\omega = 2\\pi f$，波数 $k = 2\\pi / \\lambda$。

其中：$v$ 是波速，$\\lambda$ 是波长，$f$ 是频率，$\\omega$ 是角频率，$k$ 是波数，$A$ 是振幅，$y$ 是位移。

三者关系 $v = \\lambda f$ 里，波速由介质决定，频率由波源决定，波长随介质变化。这个区别很重要——波进不同介质时频率不变、波速变了、波长也跟着变。

叠加效果：波峰+波峰加强，波谷+波谷加强，波峰+波谷减弱（可能完全抵消）。

驻波是重点：两列等幅反向行波叠加 $y = 2A\\sin(kx)\\cos(\\omega t)$。波节始终不动，波腹振幅最大（2A），相邻波节间距 $\\lambda/2$。

干涉条件：频率相同 + 相位差恒定 + 振动方向相同 → 相干波。

> 调相位差看看：同相时形成驻波，反相时波节位置互换——挺神奇的。`,
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12 Q5 6 8 12 Q11 18 14 12" stroke="#e74c3c"/><path d="M22 12 Q19 6 16 12 Q13 18 10 12" stroke="#3498db"/><path d="M2 12 Q5 6 8 12 Q11 18 14 12 Q17 6 20 12 Q23 18 26 12" stroke="#2ecc71" stroke-width="2.5"/></svg>`,
    params: [
      { key: "waveCount", label: "弦上波数", value: 3, min: 1, max: 6, step: 0.5 },
      { key: "amplitude", label: "振幅 (m)", value: 2, min: 0.3, max: 4, step: 0.1 },
      { key: "waveSpeed", label: "波速 (m/s)", value: 3, min: 1, max: 15, step: 0.5 },
      { key: "phaseL", label: "左波相位 (°)", value: 0, min: 0, max: 360, step: 15 },
      { key: "phaseR", label: "右波相位 (°)", value: 0, min: 0, max: 360, step: 15 },
    ],
    devNotes: `波的叠加就是两列波各自算位移然后相加：

\`\`\`js
yL = A * Math.sin(k*x - omega*t + phiL)  // 左波
yR = A * Math.sin(k*x + omega*t + phiR)  // 右波
yS = yL + yR                              // 叠加
\`\`\`

100 个采样点让波形平滑。快照每 0.2 秒存一次，数据量可控。

同相时形成驻波，这个效果是这个模型最酷的地方——调节相位差观察波节和波腹的变化。
`,

    // ── 物理逻辑 ──
    createState: (p) => {
      const N = 500, L = 25
      return { N, L, _t: 0, trail: [], _snap: null }
    },
    step: (s, p, dt) => {
      s._t += dt
      const L = s.L, A = p.amplitude
      const wl = L / p.waveCount
      const k = 2 * Math.PI / wl
      const omega = k * p.waveSpeed
      const phiL = p.phaseL * Math.PI / 180
      const phiR = p.phaseR * Math.PI / 180
      const t = s._t
      const nSamples = 100
      const yL = [], yR = [], yS = []
      for (let i = 0; i <= nSamples; i++) {
        const x = i * L / nSamples
        yL.push(A * Math.sin(k * x - omega * t + phiL))
        yR.push(A * Math.sin(k * x + omega * t + phiR))
        yS.push(yL[i] + yR[i])
      }
      s._snap = { yL, yR, yS }
      if (s.trail.length === 0 || t - s.trail[s.trail.length - 1].t >= 0.2) {
        s.trail.push({ t, yL: [...yL], yR: [...yR], yS: [...yS] })
      } else {
        s.trail[s.trail.length - 1].t = t
      }
    },
    isFinished: (s) => s._t >= 10,
    getBallPosition: () => ({ x: 12.5, y: 6 }),
    getTrailPosition: () => null,
    trailFields: (s) => ({ t: s._t }),
    chartDefs: [
      {
        title: "波形对比",
        xLabel: "x (m)",
        yLabel: "y (m)",
        getData: (trail) => {
          if (!trail || trail.length === 0) return []
          const last = trail[trail.length - 1]
          const L = 25, n = last.yL.length
          const xVals = Array.from({ length: n }, (_, i) => +(i * L / (n - 1)).toFixed(1))
          return [
            { name: "左波", data: xVals.map((x, i) => [x, last.yL[i]]), color: "#e74c3c" },
            { name: "右波", data: xVals.map((x, i) => [x, last.yR[i]]), color: "#3498db" },
            { name: "叠加", data: xVals.map((x, i) => [x, last.yS[i]]), color: "#2ecc71", lineStyle: "dashed" },
          ]
        },
      },
    ],
    getInfoLines: (s, p, t) => {
      const L = 25
      const wavelength = L / p.waveCount
      const frequency = p.waveSpeed / wavelength
      const cx = L / 2
      const k = 2 * Math.PI / wavelength
      const omega = k * p.waveSpeed
      const phiL = p.phaseL * Math.PI / 180
      const phiR = p.phaseR * Math.PI / 180
      const yL = p.amplitude * Math.sin(k * cx - omega * t + phiL)
      const yR = p.amplitude * Math.sin(k * cx + omega * t + phiR)
      const yS = yL + yR
      return [
        `波长: λ = ${wavelength.toFixed(1)} m  频率: f = ${frequency.toFixed(2)} Hz`,
        `波速: v = ${p.waveSpeed} m/s  振幅: A = ${p.amplitude.toFixed(1)} m`,
        `左波相位: ${p.phaseL}°  右波相位: ${p.phaseR}°`,
        `中点左波: ${yL.toFixed(2)} m  右波: ${yR.toFixed(2)} m`,
        `中点叠加: ${yS.toFixed(2)} m`,
        `叠加最大: ${(2 * p.amplitude).toFixed(1)} m（同相）`,
        `时间: ${t.toFixed(2)} s`,
      ]
    },

    // ── 渲染逻辑 ──
    drawObject: () => {},
    drawExtra: (ctx, s, p, w2s, getTheme) => {
      const { N, L, _t } = s
      const A = p.amplitude
      const wavelength = L / p.waveCount
      const k = 2 * Math.PI / wavelength
      const omega = k * p.waveSpeed
      const phiL = p.phaseL * Math.PI / 180
      const phiR = p.phaseR * Math.PI / 180
      const CY = 6
      const isDark = getTheme() === "dark"
      const axisColor = isDark ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.18)"
      const labelColor = isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.35)"
      const tickColor = isDark ? "rgba(255,255,255,0.18)" : "rgba(0,0,0,0.12)"
      const tickLabelColor = isDark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.25)"
      const dashColor = isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.15)"
      const legendTextColor = isDark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.6)"

      const eqL = w2s(0, CY), eqR = w2s(L, CY)

      ctx.strokeStyle = axisColor
      ctx.lineWidth = 1
      ctx.fillStyle = labelColor
      ctx.font = "10px sans-serif"
      ctx.textAlign = "center"

      const axisExtend = 2
      const axL = w2s(-axisExtend, CY), axR = w2s(L + axisExtend, CY)
      ctx.beginPath()
      ctx.moveTo(axL.x, axL.y)
      ctx.lineTo(axR.x, axR.y)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(axR.x, axR.y)
      ctx.lineTo(axR.x - 8, axR.y - 4)
      ctx.lineTo(axR.x - 8, axR.y + 4)
      ctx.closePath()
      ctx.fillStyle = axisColor
      ctx.fill()
      ctx.fillStyle = labelColor
      ctx.fillText("x", axR.x + 10, axR.y + 4)

      const ayB = w2s(0, CY - 3), ayT = w2s(0, CY + 5)
      ctx.beginPath()
      ctx.moveTo(ayB.x, ayB.y)
      ctx.lineTo(ayT.x, ayT.y)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(ayT.x, ayT.y)
      ctx.lineTo(ayT.x - 4, ayT.y + 8)
      ctx.lineTo(ayT.x + 4, ayT.y + 8)
      ctx.closePath()
      ctx.fillStyle = axisColor
      ctx.fill()
      ctx.fillStyle = labelColor
      ctx.textAlign = "left"
      ctx.fillText("y", ayT.x + 6, ayT.y + 4)

      ctx.textAlign = "center"
      for (let xi = 0; xi <= L; xi += 2) {
        const pt = w2s(xi, CY)
        ctx.beginPath()
        ctx.moveTo(pt.x, pt.y + 3)
        ctx.lineTo(pt.x, pt.y - 3)
        ctx.strokeStyle = tickColor
        ctx.stroke()
        if (xi > 0 && xi < L) {
          ctx.fillStyle = tickLabelColor
          ctx.fillText(`${xi}`, pt.x, pt.y + 14)
        }
      }

      ctx.textAlign = "right"
      ctx.fillStyle = tickLabelColor
      ctx.fillText("0", w2s(0, CY).x - 6, w2s(0, CY).y + 14)

      ctx.textAlign = "right"
      for (let yi = -2; yi <= 4; yi += 1) {
        if (yi === 0) continue
        const pt = w2s(0, CY + yi)
        ctx.beginPath()
        ctx.moveTo(pt.x + 3, pt.y)
        ctx.lineTo(pt.x - 3, pt.y)
        ctx.strokeStyle = tickColor
        ctx.stroke()
        if (yi !== 0) {
          ctx.fillStyle = tickLabelColor
          ctx.fillText(`${yi}`, pt.x - 6, pt.y + 3)
        }
      }

      ctx.setLineDash([4, 4])
      ctx.strokeStyle = dashColor
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(eqL.x, eqL.y)
      ctx.lineTo(eqR.x, eqR.y)
      ctx.stroke()
      ctx.setLineDash([])

      ctx.textAlign = "left"

      ctx.lineWidth = 2
      ctx.strokeStyle = "rgba(231, 76, 60, 0.5)"
      ctx.beginPath()
      for (let i = 0; i < N; i++) {
        const x = i * L / (N - 1)
        const y1 = A * Math.sin(k * x - omega * _t + phiL)
        const pt = w2s(x, CY + y1)
        if (i === 0) ctx.moveTo(pt.x, pt.y); else ctx.lineTo(pt.x, pt.y)
      }
      ctx.stroke()

      ctx.lineWidth = 2
      ctx.strokeStyle = "rgba(52, 152, 219, 0.5)"
      ctx.beginPath()
      for (let i = 0; i < N; i++) {
        const x = i * L / (N - 1)
        const y2 = A * Math.sin(k * x + omega * _t + phiR)
        const pt = w2s(x, CY + y2)
        if (i === 0) ctx.moveTo(pt.x, pt.y); else ctx.lineTo(pt.x, pt.y)
      }
      ctx.stroke()

      ctx.lineWidth = 3.5
      ctx.strokeStyle = "#2ecc71"
      ctx.beginPath()
      for (let i = 0; i < N; i++) {
        const x = i * L / (N - 1)
        const y = A * Math.sin(k * x - omega * _t + phiL) + A * Math.sin(k * x + omega * _t + phiR)
        const pt = w2s(x, CY + y)
        if (i === 0) ctx.moveTo(pt.x, pt.y); else ctx.lineTo(pt.x, pt.y)
      }
      ctx.stroke()

      ctx.globalAlpha = 0.05
      ctx.fillStyle = "#2ecc71"
      ctx.beginPath()
      for (let i = 0; i < N; i++) {
        const x = i * L / (N - 1)
        const y = A * Math.sin(k * x - omega * _t + phiL) + A * Math.sin(k * x + omega * _t + phiR)
        const pt = w2s(x, CY + y)
        if (i === 0) ctx.moveTo(pt.x, pt.y); else ctx.lineTo(pt.x, pt.y)
      }
      ctx.lineTo(eqR.x, eqR.y)
      ctx.lineTo(eqL.x, eqL.y)
      ctx.closePath()
      ctx.fill()
      ctx.globalAlpha = 1

      const canvasW = ctx.canvas.width / (window.devicePixelRatio || 1)
      const items = [
        { color: "#e74c3c", label: "→ 左波（向右）" },
        { color: "#3498db", label: "← 右波（向左）" },
        { color: "#2ecc71", label: "= 叠加结果" },
      ]
      ctx.font = "bold 11px sans-serif"
      let maxLabelW = 0
      items.forEach(item => { const m = ctx.measureText(item.label); if (m.width > maxLabelW) maxLabelW = m.width })
      const legendW = maxLabelW + 30
      const lx = canvasW - legendW - 14
      const ly = 14
      ctx.fillStyle = isDark ? "rgba(30,30,30,0.85)" : "rgba(255,255,255,0.85)"
      ctx.strokeStyle = isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"
      ctx.lineWidth = 1
      const legendH = items.length * 18 + 8
      ctx.beginPath()
      ctx.moveTo(lx + 6, ly); ctx.lineTo(lx + legendW - 6, ly)
      ctx.arcTo(lx + legendW, ly, lx + legendW, ly + 6, 6)
      ctx.lineTo(lx + legendW, ly + legendH - 6)
      ctx.arcTo(lx + legendW, ly + legendH, lx + legendW - 6, ly + legendH, 6)
      ctx.lineTo(lx + 6, ly + legendH)
      ctx.arcTo(lx, ly + legendH, lx, ly + legendH - 6, 6)
      ctx.lineTo(lx, ly + 6)
      ctx.arcTo(lx, ly, lx + 6, ly, 6)
      ctx.closePath()
      ctx.fill()
      ctx.stroke()
      items.forEach((item, idx) => {
        const iy = ly + 10 + idx * 18
        ctx.fillStyle = item.color
        ctx.fillRect(lx + 8, iy - 5, 14, 3)
        ctx.fillStyle = legendTextColor
        ctx.textAlign = "left"
        ctx.fillText(item.label, lx + 28, iy)
      })

      ctx.textAlign = "left"
    },
  }
