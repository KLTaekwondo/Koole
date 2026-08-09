// block-board 模型数据
const GROUND_Y = 0.4
const DRAW_SCALE = 30

export default {
    id: "block-board",
    level: "高中",
    category: "力学",
    name: "板块模型",
    desc: "滑块在木板上滑动，摩擦作用下的相对运动，高考经典",
    knowledge: `## 板块模型

高考力学压轴题的常客。滑块在木板上滑，摩擦力让滑块减速、木板加速，最终共速。

受力：滑块 m 受向左的摩擦力 $f = \\mu mg$（减速），木板 M 受向右的反作用力（加速）。

- 滑块加速度：$a_m = -\\mu g$
- 木板加速度：$a_M = \\frac{\\mu m g}{M}$
- 共速速度：$v_{共} = \\frac{mv_0}{m+M}$

其中：$m$ 是滑块质量，$M$ 是木板质量，$\\mu$ 是摩擦系数，$a_m$/$a_M$ 是滑块/木板加速度，$v_{共}$ 是共速后的速度，$v_0$ 是滑块初速度。

共速后相对运动消失，系统一起动。

有个公式很重要：$Q = f \\cdot \\Delta x_{相对}$——其中 $Q$ 是产生的热量，$f$ 是摩擦力，$\\Delta x_{相对}$ 是相对位移（不是各自位移！），不是各自位移！这个区别考试经常考。

共速后是否继续滑取决于最大静摩擦力。木板不够长的话滑块会滑落——这是常见的临界问题。

> 看速度曲线——滑块减速、木板加速，两条线交叉就是共速时刻。`,
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="14" width="18" height="6" rx="1" fill="rgba(0,0,0,0.06)"/><rect x="10" y="8" width="6" height="6" fill="rgba(0,0,0,0.12)"/><line x1="13" y1="11" x2="19" y2="11" stroke="#e67e22" stroke-width="2"/><line x1="13" y1="17" x2="8" y2="17" stroke="#3498db" stroke-width="2"/><polyline points="19,9 22,11 19,13"/><polyline points="8,15 5,17 8,19"/></svg>`,
    params: [
      { key: "M", label: "木板质量 (kg)", value: 3, min: 0.5, max: 20, step: 0.5 },
      { key: "m", label: "滑块质量 (kg)", value: 1, min: 0.2, max: 10, step: 0.2 },
      { key: "v0", label: "滑块初速度 (m/s)", value: 4, min: 1, max: 15, step: 0.5 },
      { key: "mu", label: "摩擦系数 μ", value: 0.3, min: 0.05, max: 0.8, step: 0.05 },
      { key: "boardLength", label: "木板长度 (m)", value: 6, min: 2, max: 15, step: 0.5 },
      { key: "gravity", label: "重力加速度 (m/s²)", value: 9.8, min: 1, max: 20, step: 0.1 },
    ],
    devNotes: `两个物体分别算加速度，共速后合并：

\`\`\`js
a_block = -mu * g
a_board = mu * m * g / M
v_cm = (m*v0) / (m+M)
\`\`\`

相对位移要算准——用 \`xb - xB\` 而不是各自位移。滑落检测：相对位移 >= 木板长度。

图表同时显示两个物体的速度曲线，交叉点就是共速时刻，很直观。
`,

    // ── 物理逻辑 ──
    createState: (p) => ({
      xb: 0.5, vb: p.v0, xB: 0, vB: 0,
      trail: [], trailB: [], _t: 0, _synced: false, events: [],
    }),
    step: (s, p, dt) => {
      const relV = s.vb - s.vB
      if (Math.abs(relV) > 0.01) {
        s.vb += -Math.sign(relV) * p.mu * p.gravity * dt
        s.vB += Math.sign(relV) * p.mu * p.m * p.gravity / p.M * dt
      } else {
        const vcm = (p.m * s.vb + p.M * s.vB) / (p.m + p.M)
        s.vb = vcm; s.vB = vcm
      }
      s._t += dt
      if (!s._synced && Math.abs(s.vb - s.vB) < 0.01) {
        s._synced = true
        s.events.push({ type: "sync", time: s._t, label: "共速" })
      }
      s.xb += s.vb * dt
      s.xB += s.vB * dt
      if (s.xb - s.xB >= p.boardLength) {
        s.xb = s.xB + p.boardLength
        if (s.vb > s.vB) s.vb = s.vB
      }
      if (s.trailB) {
        s.trailB.push({ x: s.xB, y: GROUND_Y + 0.15 })
        if (s.trailB.length > 5000) s.trailB.splice(0, s.trailB.length - 5000)
      }
    },
    isFinished: (s, p) => {
      return (s.xb - s.xB) >= p.boardLength || (Math.abs(s.vb - s.vB) < 0.01 && (s.xb - s.xB) < p.boardLength)
    },
    getBallPosition: (s, p) => ({ x: (s.xb + s.xB + p.boardLength) / 2, y: GROUND_Y }),
    getTrailPosition: (s) => ({ x: s.xb - 0.5, y: GROUND_Y + 0.4 }),
    trailFields: (s) => ({ t: s._t, vb: s.vb, vB: s.vB }),
    chartDefs: [
      {
        title: "v-t 图",
        xLabel: "t (s)",
        yLabel: "v (m/s)",
        getData: (trail) => [
          { name: "滑块", data: trail.map(p => [p.t, p.vb]) },
          { name: "木板", data: trail.map(p => [p.t, p.vB]) },
        ],
      },
    ],
    getInfoLines: (s, p, t) => {
      const relV = s.vb - s.vB
      const relDisp = s.xb - s.xB
      const isDone = Math.abs(relV) < 0.01
      const a_block = relV > 0 ? -p.mu * p.gravity : p.mu * p.gravity
      return [
        `滑块速度: ${s.vb.toFixed(2)} m/s`,
        `木板速度: ${s.vB.toFixed(2)} m/s`,
        `相对速度: ${relV.toFixed(2)} m/s`,
        `相对位移: ${relDisp.toFixed(2)} / ${p.boardLength} m`,
        `滑块加速度: ${isDone ? 0 : a_block.toFixed(2)} m/s²`,
        `m=${p.m}kg  M=${p.M}kg  μ=${p.mu.toFixed(2)}`,
        `状态: ${isDone ? '已共速 ✓' : (relDisp >= p.boardLength ? '滑块滑落 ⚡' : '相对滑动中 🔄')}`,
        ...(isDone ? [`共速速度: ${((p.m * p.v0) / (p.m + p.M)).toFixed(2)} m/s`] : []),
        `时间: ${t.toFixed(2)} s`,
      ]
    },

    // ── 渲染逻辑 ──
    drawExtra: (ctx, s, p, w2s) => {
      if (!s.trailB || s.trailB.length < 2) return
      ctx.globalAlpha = 0.45
      for (let i = 1; i < s.trailB.length; i++) {
        const p1 = w2s(s.trailB[i - 1].x, s.trailB[i - 1].y)
        const p2 = w2s(s.trailB[i].x, s.trailB[i].y)
        ctx.beginPath()
        ctx.moveTo(p1.x, p1.y)
        ctx.lineTo(p2.x, p2.y)
        ctx.strokeStyle = "rgba(108, 122, 137, 0.5)"
        ctx.lineWidth = 2
        ctx.setLineDash([6, 4])
        ctx.stroke()
        ctx.setLineDash([])
      }
      ctx.globalAlpha = 1.0
    },
    drawObject: (ctx, s, p, w2s) => {
      const boardH = 0.5, blockH = 0.6, blockW = 1.0
      const boardBottomLeft = w2s(s.xB, 0), boardBottomRight = w2s(s.xB + p.boardLength, 0)
      const boardScreenW = boardBottomRight.x - boardBottomLeft.x
      const boardScreenH = boardH * DRAW_SCALE
      ctx.fillStyle = "#6c7a89"
      ctx.fillRect(boardBottomLeft.x, boardBottomLeft.y - boardScreenH, boardScreenW, boardScreenH)
      ctx.strokeStyle = "rgba(0,0,0,0.2)"
      ctx.lineWidth = 1.5
      ctx.strokeRect(boardBottomLeft.x, boardBottomLeft.y - boardScreenH, boardScreenW, boardScreenH)
      ctx.fillStyle = "#fff"
      ctx.font = "bold 12px sans-serif"
      ctx.textAlign = "center"
      ctx.fillText("M", boardBottomLeft.x + boardScreenW / 2, boardBottomLeft.y - boardScreenH / 2 + 4)
      ctx.textAlign = "left"
      const blockBottom = w2s(s.xb, boardH + 0.01)
      const blkScreenW = blockW * DRAW_SCALE, blkScreenH = blockH * DRAW_SCALE
      ctx.fillStyle = "#e74c3c"
      ctx.fillRect(blockBottom.x - blkScreenW / 2, blockBottom.y - blkScreenH, blkScreenW, blkScreenH)
      ctx.strokeStyle = "rgba(0,0,0,0.25)"
      ctx.lineWidth = 1.5
      ctx.strokeRect(blockBottom.x - blkScreenW / 2, blockBottom.y - blkScreenH, blkScreenW, blkScreenH)
      ctx.fillStyle = "#fff"
      ctx.font = "bold 12px sans-serif"
      ctx.textAlign = "center"
      ctx.fillText("m", blockBottom.x, blockBottom.y - blkScreenH / 2 + 4)
      ctx.textAlign = "left"
      if (Math.abs(s.vb) > 0.05) {
        const vLen = Math.min(Math.abs(s.vb) * 3, 60)
        const dir = s.vb > 0 ? 1 : -1
        const ax = blockBottom.x + blkScreenW / 2 + 4, ay = blockBottom.y - blkScreenH / 2
        ctx.beginPath()
        ctx.moveTo(ax, ay)
        ctx.lineTo(ax + vLen * dir, ay)
        ctx.strokeStyle = "#e67e22"
        ctx.lineWidth = 2.5
        ctx.stroke()
        ctx.beginPath()
        ctx.moveTo(ax + vLen * dir, ay)
        ctx.lineTo(ax + vLen * dir - 7 * dir, ay - 4)
        ctx.lineTo(ax + vLen * dir - 7 * dir, ay + 4)
        ctx.closePath()
        ctx.fillStyle = "#e67e22"
        ctx.fill()
        ctx.fillStyle = "#e67e22"
        ctx.font = "bold 11px sans-serif"
        ctx.textAlign = "center"
        ctx.fillText("v块", ax + vLen * dir * 0.5, ay - 8)
        ctx.textAlign = "left"
      }
      if (Math.abs(s.vB) > 0.05) {
        const vLen = Math.min(Math.abs(s.vB) * 3, 60)
        const dir = s.vB > 0 ? 1 : -1
        const ax = boardBottomRight.x + 4, ay = boardBottomRight.y - boardScreenH / 2
        ctx.beginPath()
        ctx.moveTo(ax, ay)
        ctx.lineTo(ax + vLen * dir, ay)
        ctx.strokeStyle = "#3498db"
        ctx.lineWidth = 2.5
        ctx.stroke()
        ctx.beginPath()
        ctx.moveTo(ax + vLen * dir, ay)
        ctx.lineTo(ax + vLen * dir - 7 * dir, ay - 4)
        ctx.lineTo(ax + vLen * dir - 7 * dir, ay + 4)
        ctx.closePath()
        ctx.fillStyle = "#3498db"
        ctx.fill()
        ctx.fillStyle = "#3498db"
        ctx.font = "bold 11px sans-serif"
        ctx.textAlign = "center"
        ctx.fillText("v板", ax + vLen * dir * 0.5, ay - 8)
        ctx.textAlign = "left"
      }
    },
  }
