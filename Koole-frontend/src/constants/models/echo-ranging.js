// echo-ranging 模型数据
export default {
    id: "echo-ranging",
    level: "初中",
    category: "声学",
    name: "声波测距",
    desc: "小车发声波，遇墙反射回来，用回声测距",
    knowledge: `## 声波测距

利用回声测距离：

- 距离公式：$d = \\frac{v \\times t}{2}$（除以 2 因为声音走了来回两趟）

其中：$d$ 是到障碍物的距离，$v$ 是声速，$t$ 是声音往返的总时间。

声速：空气约 340 m/s（15°C），水约 1500 m/s。回声能被人耳区分的最短距离约 17 m（人耳区分原声和回声的间隔约 0.1s）。

应用：声呐测海深、倒车雷达、蝙蝠捕食。

> 看波的路径：发声→到墙→反射→回来。计时器记录的是总时间，所以要除以 2。`,
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="12" width="8" height="6" rx="1"/><line x1="14" y1="4" x2="14" y2="20"/><path d="M18 8 Q22 12 18 16" stroke-dasharray="2 2"/><circle cx="5" cy="10" r="1" fill="currentColor"/></svg>`,
    params: [
      { key: "wallDist", label: "墙的距离 (m)", value: 170, min: 20, max: 1000, step: 10 },
      { key: "v0", label: "车速 (m/s)", value: 20, min: 0, max: 50, step: 1 },
      { key: "soundSpeed", label: "声速 (m/s)", value: 100, min: 50, max: 400, step: 10 },
    ],
    devNotes: `声波往返的模拟：

\`\`\`js
s.waveX += s.dir * soundSpeed * dt
s.carX += v0 * dt
if (s.waveX >= wallDist) s.dir = -1        // 碰墙反射
if (s.dir === -1 && s.waveX <= s.carX) s.waveDone = true  // 回到车
\`\`\`

车在动，波也在动——回程时波要追上移动的车，这个细节让模型更真实。

车速可以调，观察车速对回声时间的影响。
`,

    // ── 物理逻辑 ──
    createState: (p) => ({
      waveX: 0,
      carX: 0,
      dir: 1,
      reflected: false,
      waveDone: false,
      totalTime: 0,
      waveTrail: [],
      trail: [],
      _t: 0,
    }),
    step: (s, p, dt) => {
      if (s.waveDone) return
      s.waveX += s.dir * p.soundSpeed * dt
      s.carX += p.v0 * dt
      s._t += dt
      s.waveTrail.push({ x: s.waveX, y: 0 })
      if (s.waveTrail.length > 5000) s.waveTrail.splice(0, s.waveTrail.length - 5000)
      if (s.dir === 1 && s.waveX >= p.wallDist) {
        s.waveX = p.wallDist
        s.dir = -1
        s.reflected = true
      }
      if (s.dir === -1 && s.waveX <= s.carX) {
        s.waveX = s.carX
        s.waveDone = true
        s.totalTime = s._t
      }
    },
    isFinished: (s) => s.waveDone,
    getBallPosition: (s) => ({ x: s.waveX, y: 0 }),
    getTrailPosition: (s) => ({ x: s.waveX, y: 0 }),
    trailFields: (s) => ({ t: s._t, x: s.waveX, carX: s.carX }),
    chartDefs: [
      {
        title: "位置-时间图",
        xLabel: "t (s)",
        yLabel: "x (m)",
        getData: (trail, params) => [
          { name: "声波", data: trail.map(p => [p.t, p.x]) },
          { name: "小车", data: trail.map(p => [p.t, p.carX]) },
          { name: "墙壁", data: trail.map(p => [p.t, params.wallDist]), lineStyle: "dashed" },
        ],
      },
    ],
    getInfoLines: (s, p, t) => {
      const tTotal = s.totalTime > 0 ? s.totalTime : t
      const d = tTotal * p.soundSpeed / 2
      return [
        `测距结果: d = v×t/2 = ${d.toFixed(1)} m`,
        `墙壁距离: ${p.wallDist} m`,
        `声速: ${p.soundSpeed} m/s`,
        `车速: ${p.v0} m/s`,
        `波位置: ${s.waveX.toFixed(1)} m`,
        `车位置: ${s.carX.toFixed(1)} m`,
        `方向: ${s.dir === 1 ? '→ 去程' : '← 回程'}`,
        `时间: ${t.toFixed(3)} s`,
        `状态: ${s.waveDone ? '✓ 回声已收到' : (s.reflected ? '回程中...' : '去程中...')}`,
      ]
    },

    // ── 渲染逻辑 ──
    drawObject: () => {},
    drawExtra: (ctx, s, p, w2s, getTheme) => {
      const isDark = getTheme && getTheme() === "dark"

      const gnd = w2s(0, 0)

      const wallS = w2s(p.wallDist, 0)
      ctx.fillStyle = isDark ? "#555" : "#7f8c8d"
      ctx.fillRect(wallS.x - 4, gnd.y - 80, 8, 80)
      ctx.fillStyle = isDark ? "#444" : "#95a5a6"
      ctx.fillRect(wallS.x - 2, gnd.y - 80, 4, 80)
      ctx.strokeStyle = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.08)"
      ctx.lineWidth = 0.5
      for (let i = 0; i < 8; i++) {
        const by = gnd.y - 75 + i * 10
        ctx.beginPath()
        ctx.moveTo(wallS.x - 3, by)
        ctx.lineTo(wallS.x + 3, by)
        ctx.stroke()
      }

      const carS = w2s(s.carX, 0)
      const carW = 28, carH = 16
      ctx.fillStyle = "#3498db"
      ctx.fillRect(carS.x - carW / 2, gnd.y - carH - 4, carW, carH)
      ctx.strokeStyle = "rgba(0,0,0,0.2)"
      ctx.lineWidth = 1.5
      ctx.strokeRect(carS.x - carW / 2, gnd.y - carH - 4, carW, carH)
      ctx.beginPath()
      ctx.arc(carS.x - 8, gnd.y - 2, 4, 0, Math.PI * 2)
      ctx.fillStyle = "#333"
      ctx.fill()
      ctx.beginPath()
      ctx.arc(carS.x + 8, gnd.y - 2, 4, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = "#fff"
      ctx.font = "bold 9px sans-serif"
      ctx.textAlign = "center"
      ctx.fillText("发声", carS.x, gnd.y - carH / 2 - 2)

      if (p.v0 > 0 && !s.waveDone) {
        const vLen = Math.min(p.v0 * 1.5, 40)
        ctx.strokeStyle = "#3498db"
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.moveTo(carS.x + carW / 2 + 2, gnd.y - carH / 2 - 4)
        ctx.lineTo(carS.x + carW / 2 + 2 + vLen, gnd.y - carH / 2 - 4)
        ctx.stroke()
        ctx.beginPath()
        ctx.moveTo(carS.x + carW / 2 + 2 + vLen, gnd.y - carH / 2 - 4)
        ctx.lineTo(carS.x + carW / 2 + 2 + vLen - 6, gnd.y - carH / 2 - 8)
        ctx.lineTo(carS.x + carW / 2 + 2 + vLen - 6, gnd.y - carH / 2)
        ctx.closePath()
        ctx.fillStyle = "#3498db"
        ctx.fill()
      }

      if (s.waveTrail && s.waveTrail.length > 1) {
        ctx.globalAlpha = 0.4
        for (let i = 1; i < s.waveTrail.length; i++) {
          const p1 = w2s(s.waveTrail[i - 1].x, 0)
          const p2 = w2s(s.waveTrail[i].x, 0)
          const isOutbound = s.waveTrail[i].x >= s.waveTrail[Math.max(0, i - 10)].x
          ctx.beginPath()
          ctx.moveTo(p1.x, gnd.y - 20)
          ctx.lineTo(p2.x, gnd.y - 20)
          ctx.strokeStyle = isOutbound ? "rgba(230,126,34,0.5)" : "rgba(46,204,113,0.5)"
          ctx.lineWidth = 3
          ctx.stroke()
        }
        ctx.globalAlpha = 1.0
      }

      const waveS = w2s(s.waveX, 0)
      const waveColor = s.dir === 1 ? "#e67e22" : "#2ecc71"
      const hexToRgba = (hex, a) => {
        const r = parseInt(hex.slice(1, 3), 16)
        const g = parseInt(hex.slice(3, 5), 16)
        const b = parseInt(hex.slice(5, 7), 16)
        return `rgba(${r},${g},${b},${a})`
      }
      for (let r = 0; r < 3; r++) {
        const radius = 8 + r * 6
        const alpha = 0.6 - r * 0.2
        ctx.beginPath()
        ctx.arc(waveS.x, gnd.y - 20, radius, 0, Math.PI * 2)
        ctx.strokeStyle = hexToRgba(waveColor, alpha)
        ctx.lineWidth = 2
        ctx.stroke()
      }
      ctx.beginPath()
      ctx.arc(waveS.x, gnd.y - 20, 3, 0, Math.PI * 2)
      ctx.fillStyle = waveColor
      ctx.fill()

      ctx.fillStyle = isDark ? "#aaa" : "#666"
      ctx.font = "11px sans-serif"
      ctx.textAlign = "center"
      ctx.fillText(`d = ${p.wallDist} m`, (carS.x + wallS.x) / 2, gnd.y - 55)
      ctx.textAlign = "left"
    },
  }
