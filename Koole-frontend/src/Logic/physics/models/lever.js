// lever 模型数据
const GROUND_Y = 0.4
const DRAW_SCALE = 30

export default {
    id: "lever",
    level: "初中",
    category: "力学",
    name: "杠杆",
    desc: "杠杆平衡条件：力×力臂 = 力×力臂",
    knowledge: `## 杠杆

核心就一句话：$F_1 \\times L_1 = F_2 \\times L_2$。其中 $F_1$/$F_2$ 是两边的力，$L_1$/$L_2$ 是对应的力臂（支点到力的作用线的垂直距离）。力矩平衡了杠杆就平了。

三种杠杆其实很好记：
- 力臂长的那边省力（省力杠杆）——剪刀、钳子
- 力臂短的那边费力但省距离（费力杠杆）——钓鱼竿、筷子
- 一样长就是天平

力臂这个概念很多人搞错。力臂不是"支点到力的作用点的距离"，是支点到**力的作用线**的垂直距离。也就是说，同一个力，方向变了力臂就变了。这个点考试特别爱考，画图题经常让你标力臂。

> 调一下参数让两边力矩相等，杠杆就水平了——挺直观的。`,
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 4 8 10 16 10" fill="rgba(0,0,0,0.08)"/><line x1="2" y1="8" x2="22" y2="8"/><circle cx="4" cy="6" r="1.5"/><circle cx="20" cy="6" r="1.5"/></svg>`,
    params: [
      { key: "F1", label: "左侧力 F₁ (N)", value: 3, min: 0, max: 20, step: 0.5 },
      { key: "d1", label: "左侧力臂 L₁ (m)", value: 3, min: 0.5, max: 5, step: 0.1 },
      { key: "dir1", label: "F₁ 方向", value: 1, options: [{ label: "↓ 向下", value: 1 }, { label: "↑ 向上", value: -1 }] },
      { key: "F2", label: "右侧力 F₂ (N)", value: 2, min: 0, max: 20, step: 0.5 },
      { key: "d2", label: "右侧力臂 L₂ (m)", value: 2, min: 0.5, max: 5, step: 0.1 },
      { key: "dir2", label: "F₂ 方向", value: 1, options: [{ label: "↓ 向下", value: 1 }, { label: "↑ 向上", value: -1 }] },
    ],
    devNotes: `杠杆用力矩平衡驱动旋转：

\`\`\`js
tau = F2 * d2 * dir2 - F1 * d1 * dir1
alpha = tau / I - 0.8 * omega  // 阻尼
\`\`\`

阻尼项 \`-0.8 * omega\` 很重要，不然杠杆会永远振荡不停。力的方向（向上/向下）用 \`dir\` 参数支持。

力矩方向一开始搞混了——向下力在左边产生逆时针力矩，在右边产生顺时针力矩。画了个图才理清楚。
`,

    // ── 物理逻辑 ──
    createState: (p) => ({
      angle: 0, omega: 0, _t: 0,
      trail: [],
    }),
    step: (s, p, dt) => {
      const tau1 = p.F1 * p.d1 * (p.dir1 || 1)
      const tau2 = p.F2 * p.d2 * (p.dir2 || 1)
      const tau = tau2 - tau1
      const I = 2.0
      const alpha = tau / I - 0.8 * s.omega
      s.omega += alpha * dt
      s.angle += s.omega * dt
      s._t += dt
      const pivotY = 1.2
      const halfLen = 5
      const maxAngle = Math.asin((pivotY - GROUND_Y) / halfLen)
      if (s.angle > maxAngle) { s.angle = maxAngle; s.omega = 0 }
      if (s.angle < -maxAngle) { s.angle = -maxAngle; s.omega = 0 }
    },
    isFinished: () => false,
    getBallPosition: () => ({ x: 0, y: 1.2 }),
    getTrailPosition: () => null,
    trailFields: (s) => ({ t: s._t, angle: s.angle * 180 / Math.PI }),
    chartDefs: [
      { title: "θ-t 图", xLabel: "t (s)", yLabel: "θ (°)", getData: (trail) => [{ name: "摆角", data: trail.map(p => [p.t, p.angle]) }] },
    ],
    getInfoLines: (s, p, t) => {
      const tau1 = p.F1 * p.d1 * (p.dir1 || 1)
      const tau2 = p.F2 * p.d2 * (p.dir2 || 1)
      const diff = tau2 - tau1
      const balanced = Math.abs(diff) < 0.1
      return [
        `左侧力矩: ${tau1.toFixed(1)} N·m`,
        `右侧力矩: ${tau2.toFixed(1)} N·m`,
        `力矩差: ${diff.toFixed(1)} N·m`,
        `状态: ${balanced ? '平衡 ✓' : (diff > 0 ? '右侧下沉 ↘' : '左侧下沉 ↙')}`,
        `杠杆角度: ${(s.angle * 180 / Math.PI).toFixed(1)}°`,
        `时间: ${t.toFixed(2)} s`,
      ]
    },

    // ── 渲染逻辑 ──
    drawExtra: (ctx, state, params, w2s) => {
      const pivotW = { x: 0, y: 1.2 }
      const pivotS = w2s(pivotW.x, pivotW.y)
      const halfLen = 5
      const barLen = halfLen * DRAW_SCALE

      ctx.save()
      ctx.translate(pivotS.x, pivotS.y)
      ctx.rotate(state.angle)

      ctx.beginPath()
      ctx.moveTo(-barLen, 0)
      ctx.lineTo(barLen, 0)
      ctx.strokeStyle = "#2c3e50"
      ctx.lineWidth = 6
      ctx.lineCap = "round"
      ctx.stroke()

      ctx.strokeStyle = "rgba(0,0,0,0.15)"
      ctx.lineWidth = 1
      for (let i = -5; i <= 5; i++) {
        if (i === 0) continue
        const sx = i * DRAW_SCALE
        ctx.beginPath()
        ctx.moveTo(sx, -6)
        ctx.lineTo(sx, 6)
        ctx.stroke()
      }

      function drawForceArrow(dist, force, dir, color) {
        if (force <= 0) return
        const sx = dist * DRAW_SCALE
        const arrowLen = force * 6
        const startY = dir > 0 ? 8 : -8
        const endY = dir > 0 ? 8 + arrowLen : -8 - arrowLen
        ctx.beginPath()
        ctx.moveTo(sx, startY)
        ctx.lineTo(sx, endY)
        ctx.strokeStyle = color
        ctx.lineWidth = 3
        ctx.lineCap = "round"
        ctx.stroke()
        const tipY = endY
        const baseY = dir > 0 ? tipY - 6 : tipY + 6
        ctx.beginPath()
        ctx.moveTo(sx - 5, baseY)
        ctx.lineTo(sx, tipY)
        ctx.lineTo(sx + 5, baseY)
        ctx.fillStyle = color
        ctx.fill()
        ctx.font = "bold 11px sans-serif"
        ctx.fillStyle = color
        ctx.textAlign = "center"
        const labelY = dir > 0 ? endY + 14 : endY - 8
        ctx.fillText(`${force}N`, sx, labelY)
      }

      const dir1 = params.dir1 || 1
      const dir2 = params.dir2 || 1
      drawForceArrow(-params.d1, params.F1, dir1, "#e74c3c")
      drawForceArrow(params.d2, params.F2, dir2, "#3498db")

      ctx.restore()

      const triH = 18
      const triW = 14
      ctx.beginPath()
      ctx.moveTo(pivotS.x, pivotS.y)
      ctx.lineTo(pivotS.x - triW, pivotS.y + triH)
      ctx.lineTo(pivotS.x + triW, pivotS.y + triH)
      ctx.closePath()
      ctx.fillStyle = "#7f8c8d"
      ctx.fill()

      ctx.font = "11px sans-serif"
      ctx.fillStyle = "#999"
      ctx.textAlign = "center"
      ctx.fillText(`L₁=${params.d1}m`, pivotS.x - params.d1 * DRAW_SCALE * 0.5, pivotS.y + 38)
      ctx.fillText(`L₂=${params.d2}m`, pivotS.x + params.d2 * DRAW_SCALE * 0.5, pivotS.y + 38)

      const tau1 = params.F1 * params.d1
      const tau2 = params.F2 * params.d2
      ctx.font = "bold 12px sans-serif"
      ctx.fillStyle = "#e74c3c"
      ctx.fillText(`τ₁=${tau1.toFixed(1)}`, pivotS.x - barLen * 0.6, pivotS.y - 18)
      ctx.fillStyle = "#3498db"
      ctx.fillText(`τ₂=${tau2.toFixed(1)}`, pivotS.x + barLen * 0.6, pivotS.y - 18)
      ctx.textAlign = "left"
    },
  }
