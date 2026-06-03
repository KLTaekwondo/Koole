// bounce-deformation 模型数据
const GROUND_Y = 0.4

export default {
    id: "bounce-deformation",
    level: "初中",
    category: "力学",
    name: "碰撞变形",
    desc: "弹性/非弹性碰撞，观察变形与能量损失",
    knowledge: `## 碰撞变形

恢复系数决定了碰撞有多"弹"：

- 恢复系数：$e = \\frac{v_{分离}}{v_{接近}}$
- 第 $n$ 次弹跳高度：$h_n = h_0 \\cdot e^{2n}$
- 每次碰撞能量损失比例：$(1-e^2)$

其中：$e$ 是恢复系数，$h_0$ 是初始高度，$h_n$ 是第 $n$ 次弹跳高度。

$e = 1$ 完全弹性反弹等高，$e = 0$ 完全非弹性直接"粘"住，中间的就是每次弹跳都矮一截。指数衰减——理论上弹无限次，但很快就看不出来了。

碰撞瞬间物体有形变，弹性好的能恢复，差的就永久变形了。动量在整个碰撞过程中守恒。

> 把 e 拉到 0 试试——物体直接"粘"在地上不弹了。`,
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="6" r="3"/><path d="M8 9v11"/><path d="M5 20h6"/><path d="M16 4l3 3-3 3"/><path d="M19 7h-6" opacity="0.4"/><line x1="2" y1="20" x2="22" y2="20"/></svg>`,
    params: [
      { key: "height", label: "初始高度 (m)", value: 10, min: 1, max: 30, step: 0.5 },
      { key: "restitution", label: "恢复系数 e", value: 0.8, min: 0, max: 1, step: 0.05 },
      { key: "gravity", label: "重力加速度 (m/s²)", value: 9.8, min: 1, max: 20, step: 0.1 },
    ],
    devNotes: `弹跳逻辑不复杂，形变效果是亮点：

\`\`\`js
if (s.y <= GROUND_Y && s.vy >= 0) {
  s.deform = Math.min(s.vy * 0.8, 12)  // 碰撞时压扁
  s.vy = -s.vy * p.restitution          // 反弹
  s.bounceCount++
}
s.deform *= 0.85  // 每帧恢复一点
\`\`\`

形变量跟碰撞速度成正比，然后每帧衰减——视觉上就是"压扁→恢复"的过程。

停止条件设成速度 < 0.3，不然会看到无限微小弹跳，很烦。
`,

    // ── 物理逻辑 ──
    createState: (p) => ({ y: p.height + GROUND_Y, vy: 0, trail: [], bounceCount: 0, deform: 0, _t: 0 }),
    step: (s, p, dt) => {
      s.vy += p.gravity * dt
      s.y -= s.vy * dt
      s.deform *= 0.85
      s._t += dt
      if (s.y <= GROUND_Y && s.vy >= 0) {
        if (p.restitution > 0 && s.vy > 0.3) {
          s.deform = Math.min(s.vy * 0.8, 12)
          s.vy = -s.vy * p.restitution
          s.y = GROUND_Y
          s.bounceCount++
        } else {
          s.y = GROUND_Y
          s.vy = 0
        }
      }
    },
    isFinished: (s) => s.y <= GROUND_Y && Math.abs(s.vy) <= 0.3,
    getBallPosition: (s) => ({ x: 0, y: s.y }),
    getTrailPosition: (s) => ({ x: 0, y: s.y }),
    trailFields: (s) => ({ t: s._t, vy: s.vy, y: s.y }),
    chartDefs: [
      { title: "y-t 图", xLabel: "t (s)", yLabel: "y (m)", getData: (trail) => [{ name: "高度", data: trail.map(p => [p.t, p.y]) }] },
      { title: "v-t 图", xLabel: "t (s)", yLabel: "v (m/s)", getData: (trail) => [{ name: "速度", data: trail.map(p => [p.t, p.vy]) }] },
    ],
    getInfoLines: (s, p, t) => {
      const mode = p.restitution === 1 ? '完全弹性' : p.restitution === 0 ? '完全非弹性' : '非弹性'
      return [
        `高度: ${(s.y - GROUND_Y).toFixed(2)} m`,
        `速度: ${s.vy.toFixed(2)} m/s`,
        `弹跳次数: ${s.bounceCount}`,
        `恢复系数: e = ${p.restitution.toFixed(2)}  (${mode})`,
        `变形: ${s.deform > 0.1 ? s.deform.toFixed(1) : '0'}`,
      ]
    },

    // ── 渲染逻辑 ──
    drawObject: (ctx, s, p, w2s) => {
      const pos = w2s(0, s.y)
      const radius = 12
      const deform = s.deform
      ctx.beginPath()
      ctx.ellipse(pos.x, pos.y + deform * 0.3, radius + deform * 0.2, radius - deform * 0.4, 0, 0, Math.PI * 2)
      ctx.fillStyle = "#e74c3c"
      ctx.fill()
      ctx.strokeStyle = "rgba(0,0,0,0.2)"
      ctx.lineWidth = 1.5
      ctx.stroke()
      if (p.restitution === 0 && s.y <= GROUND_Y && Math.abs(s.vy) <= 0.3) {
        ctx.fillStyle = "rgba(0,0,0,0.1)"
        ctx.fillRect(pos.x - 16, pos.y - 1, 32, 2)
      }
      if (deform > 1) {
        ctx.fillStyle = "rgba(0,0,0,0.3)"
        ctx.font = "11px sans-serif"
        ctx.fillText(`e=${p.restitution.toFixed(2)}`, pos.x + 16, pos.y - 8)
      }
    },
    drawExtra: (ctx, s, p, w2s) => {
      if (s.bounceCount > 0) {
        const groundY = w2s(0, 0).y
        ctx.fillStyle = "rgba(0,0,0,0.08)"
        ctx.font = "12px sans-serif"
        for (let i = 1; i <= Math.min(s.bounceCount, 5); i++) {
          const h = p.height * Math.pow(p.restitution, 2 * i)
          if (h < 0.5) break
          const peakY = w2s(0, GROUND_Y + h).y
          ctx.beginPath()
          ctx.setLineDash([2, 3])
          ctx.moveTo(30, peakY)
          ctx.lineTo(90, peakY)
          ctx.strokeStyle = "rgba(0,0,0,0.1)"
          ctx.lineWidth = 0.8
          ctx.stroke()
          ctx.setLineDash([])
          ctx.fillText(`#${i} ${h.toFixed(1)}m`, 92, peakY + 3)
        }
      }
    },
  }
