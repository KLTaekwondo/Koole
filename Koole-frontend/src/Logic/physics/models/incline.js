// incline 模型数据
export default {
    id: "incline",
    level: "初中",
    category: "力学",
    name: "斜面滑动",
    desc: "物体在光滑斜面上的加速下滑",
    knowledge: `## 斜面滑动

力的分解最经典的应用。把重力 $mg$ 拆成两个方向：沿斜面向下的 $mg\\sin\\theta$ 让物体加速，垂直斜面向下的 $mg\\cos\\theta$ 被支持力抵消了（所以物体不会穿过斜面）。

- 加速度：$a = g\\sin\\theta$
- 末速度：$v = \\sqrt{2gL\\sin\\theta}$
- 滑行时间：$t = \\sqrt{\\frac{2L}{g\\sin\\theta}}$

其中：$a$ 是加速度，$\\theta$ 是斜面角度，$v$ 是末速度，$L$ 是斜面长度，$t$ 是滑行时间。

角度越大加速越快，$\\theta=90°$ 就退化成自由落体了。加速度跟质量没关系——光滑斜面上所有物体下滑一样快。本质上就是沿斜面方向做匀加速直线运动。

> 调大角度看看，速度箭头明显变长——$g\\sin\\theta$ 随角度增大而增大。`,
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="20,2 2,22 22,22" fill="rgba(0,0,0,0.05)"/><circle cx="14" cy="14" r="2"/></svg>`,
    params: [
      { key: "angle", label: "斜面角度 (°)", value: 30, min: 5, max: 75, step: 1 },
      { key: "rampHeight", label: "斜面高度 (m)", value: 10, min: 2, max: 30, step: 0.5 },
      { key: "gravity", label: "重力加速度 (m/s²)", value: 9.8, min: 1, max: 20, step: 0.1 },
    ],
    devNotes: `斜面的关键思路：先在一维（沿斜面方向）算物理，最后再转成二维屏幕坐标。

\`\`\`js
s.vel += p.gravity * Math.sin(theta) * dt
s.dist += s.vel * dt
x = s.dist * Math.cos(theta)
y = rampHeight - s.dist * Math.sin(theta)
\`\`\`

一开始想直接用 x、y 坐标算，发现力的分解要处理两个方向的分量，很绕。后来改成沿斜面距离做一维运动，逻辑清晰多了。

角度输入是度数但 Math.sin 要弧度，这个坑踩过好几次了，每次都要提醒自己 \`theta * Math.PI / 180\`。

斜面长度用 \`L = h/sin(θ)\` 从高度和角度推算，createState 时就算好，免得每帧重复计算。角度限制在 5°-75°，太小球几乎不动，太大斜面几乎垂直。
`,

    // ── 物理逻辑 ──
    createState: (p) => {
      const theta = p.angle * Math.PI / 180
      const rampLen = p.rampHeight / Math.sin(theta)
      return { dist: 0, vel: 0, rampLen, trail: [], _t: 0 }
    },
    step: (s, p, dt) => {
      const theta = p.angle * Math.PI / 180
      s.vel += p.gravity * Math.sin(theta) * dt
      s.dist += s.vel * dt
      s._t += dt
      if (s.dist >= s.rampLen) { s.dist = s.rampLen; s.vel = 0 }
    },
    isFinished: (s) => s.dist >= s.rampLen,
    getBallPosition: (s, p) => {
      const theta = p.angle * Math.PI / 180
      return { x: s.dist * Math.cos(theta), y: p.rampHeight - s.dist * Math.sin(theta) }
    },
    getTrailPosition: (s, p) => {
      const theta = p.angle * Math.PI / 180
      return { x: s.dist * Math.cos(theta), y: p.rampHeight - s.dist * Math.sin(theta) }
    },
    trailFields: (s) => ({ t: s._t, vel: s.vel, dist: s.dist }),
    chartDefs: [
      { title: "v-t 图", xLabel: "t (s)", yLabel: "v (m/s)", getData: (trail) => [{ name: "速度", data: trail.map(p => [p.t, p.vel]) }] },
      { title: "s-t 图", xLabel: "t (s)", yLabel: "s (m)", getData: (trail) => [{ name: "距离", data: trail.map(p => [p.t, p.dist]) }] },
    ],
    getInfoLines: (s, p, t) => [
      `下滑距离: ${s.dist.toFixed(1)} m`,
      `速度: ${s.vel.toFixed(2)} m/s`,
      `加速度: ${(p.gravity * Math.sin(p.angle * Math.PI / 180)).toFixed(2)} m/s²`,
      `时间: ${t.toFixed(2)} s`,
    ],

    // ── 渲染逻辑 ──
    drawExtra: (ctx, s, p, w2s) => {
      const theta = p.angle * Math.PI / 180
      const rampLen = s.rampLen
      const top = w2s(0, p.rampHeight)
      const bottom = w2s(0, 0)
      const rampEnd = w2s(rampLen * Math.cos(theta), 0)
      ctx.beginPath()
      ctx.moveTo(top.x, top.y)
      ctx.lineTo(rampEnd.x, rampEnd.y)
      ctx.lineTo(bottom.x, bottom.y)
      ctx.closePath()
      ctx.fillStyle = "rgba(52, 152, 219, 0.08)"
      ctx.fill()
      ctx.strokeStyle = "rgba(52, 152, 219, 0.5)"
      ctx.lineWidth = 2
      ctx.stroke()
      ctx.fillStyle = "rgba(0,0,0,0.4)"
      ctx.font = "12px sans-serif"
      ctx.fillText(`θ = ${p.angle}°`, bottom.x + 20, bottom.y - 10)
      if (s.vel > 0.2 && s.dist < s.rampLen) {
        const ballPos = w2s(s.dist * Math.cos(theta), p.rampHeight - s.dist * Math.sin(theta))
        const len = Math.min(s.vel * 3, 80)
        const dx = Math.cos(theta) * len
        const dy = Math.sin(theta) * len
        ctx.beginPath()
        ctx.moveTo(ballPos.x, ballPos.y)
        ctx.lineTo(ballPos.x + dx, ballPos.y + dy)
        ctx.strokeStyle = "#e74c3c"
        ctx.lineWidth = 2.5
        ctx.stroke()
        const a = Math.atan2(dy, dx)
        ctx.beginPath()
        ctx.moveTo(ballPos.x + dx, ballPos.y + dy)
        ctx.lineTo(ballPos.x + dx - 8 * Math.cos(a - 0.4), ballPos.y + dy - 8 * Math.sin(a - 0.4))
        ctx.lineTo(ballPos.x + dx - 8 * Math.cos(a + 0.4), ballPos.y + dy - 8 * Math.sin(a + 0.4))
        ctx.closePath()
        ctx.fillStyle = "#e74c3c"
        ctx.fill()
        ctx.fillStyle = "#e74c3c"
        ctx.font = "bold 11px sans-serif"
        ctx.fillText("V", ballPos.x + dx * 0.5 + 8, ballPos.y + dy * 0.5 - 6)
      }
    },
  }
