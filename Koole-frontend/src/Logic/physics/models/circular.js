// circular 模型数据
const DRAW_SCALE = 30

export default {
    id: "circular",
    level: "高中",
    category: "力学",
    name: "圆周运动",
    desc: "质点做匀速圆周运动，显示向心力",
    knowledge: `## 匀速圆周运动

"匀速"只是速率不变，方向一直在转，所以必然有加速度。刚开始学的时候总觉得"匀速"就没加速度，其实是错的。

核心公式就这几个，记住就行：
- $v = \\omega r$，$a_c = \\frac{v^2}{r} = \\omega^2 r$，$F_c = \\frac{mv^2}{r}$
- $T = \\frac{2\\pi}{\\omega}$

其中：$v$ 是线速度，$\\omega$ 是角速度，$r$ 是半径，$a_c$ 是向心加速度，$F_c$ 是向心力，$m$ 是质量，$T$ 是周期。

有个坑要注意：向心力不是一个独立的力！它就是合力指向圆心的那个效果。做受力分析的时候别多画一个"向心力"进去，那是错的。可以是绳子拉力、可以是摩擦力、可以是重力的分力，反正它不是一个新力。

角速度和向心加速度是平方关系——ω 翻倍，a_c 翻四倍，这个比例做选择题经常考。

还有一个容易忘的：速率不变不代表平衡状态，有加速度就不是平衡。

> 红色箭头指向圆心（向心力），橙色箭头沿切线（速度），始终垂直——这个几何关系很基础。`,
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="2"/><line x1="12" y1="12" x2="8" y2="8" stroke="red"/></svg>`,
    params: [
      { key: "radius", label: "轨道半径 (m)", value: 5, min: 1, max: 15, step: 0.5 },
      { key: "omega", label: "角速度 (rad/s)", value: 2, min: 0.5, max: 6, step: 0.1 },
    ],
    devNotes: `圆周运动实现起来比想象中简单——用角度参数化就行，每帧累加角度，三角函数算位置。

速度分量是通过对位置求导得到的：\`vx = -v·sin(θ)\`, \`vy = v·cos(θ)\`。一开始我还想用差分法算速度，后来发现直接推导更精确。

踩了个坐标系的坑：数学里角度逆时针为正，Canvas 里顺时针为正，导致速度箭头方向反了。调了半天才反应过来。

动画时长设成 2 个周期（\`4π/ω\`），让用户看清重复 pattern。向心力用红色、切向速度用橙色，两个箭头始终垂直——这个视觉效果挺直观的。
`,

    // ── 物理逻辑 ──
    createState: (p) => ({ angle: 0, trail: [], _t: 0, _lapCount: 0 }),
    step: (s, p, dt) => {
      s.angle += p.omega * dt
      s._t += dt
    },
    isFinished: (s) => s._t >= (4 * Math.PI) / Math.abs(s.omega || 1),
    getBallPosition: (s, p) => ({
      x: p.radius * Math.cos(s.angle),
      y: p.radius * Math.sin(s.angle) + p.radius,
    }),
    getTrailPosition: (s, p) => ({
      x: p.radius * Math.cos(s.angle),
      y: p.radius * Math.sin(s.angle) + p.radius,
    }),
    trailFields: (s, p) => {
      const v = p.omega * p.radius
      const vx = -v * Math.sin(s.angle)
      const vy = v * Math.cos(s.angle)
      return { t: s._t, vx, vy, angle: s.angle }
    },
    chartDefs: [
      {
        title: "vx-t 图（水平速度分量）",
        xLabel: "t (s)",
        yLabel: "vx (m/s)",
        getData: (trail) => [{ name: "vx", data: trail.map(p => [p.t, p.vx]) }],
      },
      {
        title: "vy-t 图（竖直速度分量）",
        xLabel: "t (s)",
        yLabel: "vy (m/s)",
        getData: (trail) => [{ name: "vy", data: trail.map(p => [p.t, p.vy]) }],
      },
    ],
    getInfoLines: (s, p, t) => {
      const v = p.omega * p.radius
      const ac = v * v / p.radius
      const vx = -v * Math.sin(s.angle)
      const vy = v * Math.cos(s.angle)
      return [
        `轨道半径: ${p.radius} m`,
        `线速度: ${v.toFixed(2)} m/s`,
        `vx: ${vx.toFixed(2)} m/s`,
        `vy: ${vy.toFixed(2)} m/s`,
        `向心加速度: ${ac.toFixed(2)} m/s²`,
        `周期: ${(2 * Math.PI / p.omega).toFixed(2)} s`,
      ]
    },

    // ── 渲染逻辑 ──
    drawExtra: (ctx, s, p, w2s, getTheme) => {
      const center = w2s(0, p.radius)
      const ball = w2s(p.radius * Math.cos(s.angle), p.radius * Math.sin(s.angle) + p.radius)
      const rPx = p.radius * DRAW_SCALE
      ctx.beginPath()
      ctx.arc(center.x, center.y, rPx, 0, Math.PI * 2)
      ctx.strokeStyle = "rgba(52, 152, 219, 0.3)"
      ctx.lineWidth = 1.5
      ctx.setLineDash([6, 4])
      ctx.stroke()
      ctx.setLineDash([])
      ctx.beginPath()
      ctx.moveTo(center.x, center.y)
      ctx.lineTo(ball.x, ball.y)
      ctx.strokeStyle = "rgba(0,0,0,0.15)"
      ctx.lineWidth = 1
      ctx.stroke()
      const dx = center.x - ball.x
      const dy = center.y - ball.y
      const len = Math.sqrt(dx * dx + dy * dy)
      if (len > 1) {
        const nx = dx / len, ny = dy / len
        const arrowLen = Math.min(60, len * 0.6)
        const tipX = ball.x + nx * arrowLen
        const tipY = ball.y + ny * arrowLen
        ctx.beginPath()
        ctx.moveTo(ball.x, ball.y)
        ctx.lineTo(tipX, tipY)
        ctx.strokeStyle = "#e74c3c"
        ctx.lineWidth = 2.5
        ctx.stroke()
        const angle = Math.atan2(ny, nx)
        ctx.beginPath()
        ctx.moveTo(tipX, tipY)
        ctx.lineTo(tipX - 10 * Math.cos(angle - 0.35), tipY - 10 * Math.sin(angle - 0.35))
        ctx.lineTo(tipX - 10 * Math.cos(angle + 0.35), tipY - 10 * Math.sin(angle + 0.35))
        ctx.closePath()
        ctx.fillStyle = "#e74c3c"
        ctx.fill()
        ctx.fillStyle = "#e74c3c"
        ctx.font = "bold 12px sans-serif"
        const labelX = ball.x + nx * arrowLen * 0.5
        const labelY = ball.y + ny * arrowLen * 0.5
        ctx.fillText("F心", labelX + ny * 10, labelY - nx * 10)
      }
      const v = p.omega * p.radius
      const sc = 3
      const vLen = Math.min(v * sc, 80)
      const dir = p.omega > 0 ? 1 : -1
      const tx = dir * -Math.sin(s.angle) * vLen
      const ty = dir * -Math.cos(s.angle) * vLen
      ctx.beginPath()
      ctx.moveTo(ball.x, ball.y)
      ctx.lineTo(ball.x + tx, ball.y + ty)
      ctx.strokeStyle = "#e67e22"
      ctx.lineWidth = 2.5
      ctx.stroke()
      const vAng = Math.atan2(ty, tx)
      ctx.beginPath()
      ctx.moveTo(ball.x + tx, ball.y + ty)
      ctx.lineTo(ball.x + tx - 8 * Math.cos(vAng - 0.4), ball.y + ty - 8 * Math.sin(vAng - 0.4))
      ctx.lineTo(ball.x + tx - 8 * Math.cos(vAng + 0.4), ball.y + ty - 8 * Math.sin(vAng + 0.4))
      ctx.closePath()
      ctx.fillStyle = "#e67e22"
      ctx.fill()
      ctx.fillStyle = "#e67e22"
      ctx.font = "bold 11px sans-serif"
      ctx.fillText("V", ball.x + tx * 0.5 + 8, ball.y + ty * 0.5 - 6)
    },
  }
