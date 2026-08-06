// uniform-motion 模型数据
export default {
    id: "uniform-motion",
    level: "初中",
    category: "力学",
    name: "匀速直线运动",
    desc: "速度不变的直线运动，路程与时间成正比",
    knowledge: `## 匀速直线运动

匀速直线运动指物体沿直线运动，并且速度大小保持不变。抓住一句话就够了：相同时间内通过的路程相同。

- 路程公式：$s = vt$
- 速度公式：$v = \\frac{s}{t}$

其中：$s$ 是路程，$v$ 是速度，$t$ 是运动时间。

这个模型最适合看图像。$s$-$t$ 图像是一条斜直线，斜率越大，速度越大；$v$-$t$ 图像是一条水平线，因为速度没有变。

这里容易看错的是“快慢”和“位置”。车的位置一直在变，但速度可以一直不变，所以它不是“静止”，只是“匀速”。

> 把速度调大，观察小车跑得更快，同时 $s$-$t$ 图像变得更陡。`,
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="14" height="6" rx="1"/><circle cx="7" cy="18" r="2"/><circle cx="15" cy="18" r="2"/><path d="M17 13h4"/><path d="M3 8h10"/></svg>`,
    params: [
      { key: "speed", label: "速度 v (m/s)", value: 4, min: 0.5, max: 12, step: 0.5 },
      { key: "duration", label: "运动时间 (s)", value: 8, min: 2, max: 20, step: 1 },
    ],

    // ── 物理逻辑 ──
    createState: () => ({ x: 0, y: 0.4, _t: 0, trail: [] }),
    step: (s, p, dt) => {
      s._t += dt
      s.x = p.speed * s._t
    },
    isFinished: (s, p) => s._t >= p.duration,
    getBallPosition: (s) => ({ x: s.x, y: s.y }),
    getTrailPosition: (s) => ({ x: s.x, y: s.y }),
    trailFields: (s, p) => ({ t: s._t, x: s.x, v: p.speed }),
    chartDefs: [
      { title: "s-t 图", xLabel: "t (s)", yLabel: "s (m)", getData: (trail) => [{ name: "路程", data: trail.map(p => [p.t, p.x]) }] },
      { title: "v-t 图", xLabel: "t (s)", yLabel: "v (m/s)", getData: (trail) => [{ name: "速度", data: trail.map(p => [p.t, p.v]) }] },
    ],
    getInfoLines: (s, p, t) => [
      `速度: ${p.speed.toFixed(1)} m/s`,
      `时间: ${Math.min(t, p.duration).toFixed(2)} s`,
      `路程: ${s.x.toFixed(2)} m`,
      `关系: s = vt = ${(p.speed * Math.min(t, p.duration)).toFixed(2)} m`,
      `状态: ${s._t >= p.duration ? '到达设定时间' : '匀速运动中'}`,
    ],

    // ── 渲染逻辑 ──
    drawObject: () => {},
    drawExtra: (ctx, s, p, w2s, getTheme) => {
      const isDark = getTheme && getTheme() === "dark"
      const ground = w2s(0, 0)
      const start = w2s(0, 0.4)
      const car = w2s(s.x, 0.4)
      const roadEnd = w2s(Math.max(p.speed * p.duration, 20), 0)

      ctx.strokeStyle = isDark ? "#666" : "#95a5a6"
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.moveTo(start.x - 40, ground.y)
      ctx.lineTo(roadEnd.x + 80, ground.y)
      ctx.stroke()

      ctx.strokeStyle = isDark ? "rgba(255,255,255,0.18)" : "rgba(0,0,0,0.14)"
      ctx.lineWidth = 1
      ctx.font = "11px sans-serif"
      ctx.fillStyle = isDark ? "#aaa" : "#666"
      ctx.textAlign = "center"
      const maxS = Math.max(p.speed * p.duration, 10)
      for (let m = 0; m <= maxS; m += 2) {
        const tick = w2s(m, 0)
        ctx.beginPath()
        ctx.moveTo(tick.x, ground.y - 5)
        ctx.lineTo(tick.x, ground.y + 5)
        ctx.stroke()
        ctx.fillText(`${m}m`, tick.x, ground.y + 20)
      }

      if (s.trail && s.trail.length > 1) {
        ctx.strokeStyle = "rgba(231, 76, 60, 0.55)"
        ctx.lineWidth = 2.5
        ctx.beginPath()
        s.trail.forEach((pt, i) => {
          const ps = w2s(pt.x, pt.y)
          if (i === 0) ctx.moveTo(ps.x, ps.y + 14)
          else ctx.lineTo(ps.x, ps.y + 14)
        })
        ctx.stroke()
      }

      const carW = 46
      const carH = 22
      ctx.fillStyle = "#3498db"
      ctx.fillRect(car.x - carW / 2, car.y - carH, carW, carH)
      ctx.strokeStyle = "rgba(0,0,0,0.25)"
      ctx.lineWidth = 1.5
      ctx.strokeRect(car.x - carW / 2, car.y - carH, carW, carH)
      ctx.fillStyle = "#2ecc71"
      ctx.fillRect(car.x - 8, car.y - carH - 10, 18, 10)
      ctx.beginPath()
      ctx.arc(car.x - 13, car.y + 1, 5, 0, Math.PI * 2)
      ctx.arc(car.x + 13, car.y + 1, 5, 0, Math.PI * 2)
      ctx.fillStyle = "#333"
      ctx.fill()

      const vLen = Math.min(p.speed * 8, 90)
      ctx.strokeStyle = "#e67e22"
      ctx.lineWidth = 2.5
      ctx.beginPath()
      ctx.moveTo(car.x + carW / 2 + 8, car.y - 14)
      ctx.lineTo(car.x + carW / 2 + 8 + vLen, car.y - 14)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(car.x + carW / 2 + 8 + vLen, car.y - 14)
      ctx.lineTo(car.x + carW / 2 + 8 + vLen - 8, car.y - 19)
      ctx.lineTo(car.x + carW / 2 + 8 + vLen - 8, car.y - 9)
      ctx.closePath()
      ctx.fillStyle = "#e67e22"
      ctx.fill()
      ctx.fillStyle = "#e67e22"
      ctx.font = "bold 12px sans-serif"
      ctx.textAlign = "left"
      ctx.fillText(`v=${p.speed}m/s`, car.x + carW / 2 + 12, car.y - 24)
    },
  }
