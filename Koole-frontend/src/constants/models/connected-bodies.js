// connected-bodies 模型数据
const GROUND_Y = 0.4
const DRAW_SCALE = 30

export default {
    id: "connected-bodies",
    level: "高中",
    category: "力学",
    name: "连接体",
    desc: "两个物体通过定滑轮连接，整体法与隔离法分析",
    knowledge: `## 连接体（滑轮模型）

整体法与隔离法的经典应用。一个物体在桌上滑，一个悬着，用绳连着过定滑轮。

桌上的 $m_1$ 受绳拉力向右、摩擦力 $\\mu m_1 g$ 向左；悬着的 $m_2$ 受重力 $m_2 g$ 向下、绳拉力向上。

- 加速度：$a = \\frac{m_2 g - \\mu m_1 g}{m_1 + m_2}$
- 张力：$T = m_1(a + \\mu g)$

其中：$m_1$ 是桌面上物体的质量，$m_2$ 是悬挂物体的质量，$\\mu$ 是摩擦系数，$a$ 是加速度，$T$ 是绳中张力。

记住：整体法求加速度（两物体当一个整体），隔离法求张力（单独分析一个物体）。系统运动的条件是 $m_2 g > \\mu m_1 g$，不然拉不动。轻绳假设下绳中张力处处相等，两物体加速度大小相等。

> $m_2$ 太轻就拉不动——调参数找到那个临界质量比。`,
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="14" width="8" height="4" fill="rgba(0,0,0,0.08)"/><circle cx="12" cy="10" r="2" fill="none"/><rect x="14" y="4" width="6" height="6" rx="1" fill="rgba(0,0,0,0.1)"/><line x1="12" y1="12" x2="8" y2="14"/><line x1="12" y1="12" x2="17" y2="10"/></svg>`,
    params: [
      { key: "m1", label: "桌面质量 (kg)", value: 2, min: 0.3, max: 10, step: 0.2 },
      { key: "m2", label: "悬挂质量 (kg)", value: 1, min: 0.3, max: 10, step: 0.2 },
      { key: "mu", label: "桌面摩擦系数 μ", value: 0.2, min: 0, max: 1, step: 0.05 },
      { key: "gravity", label: "重力加速度 (m/s²)", value: 9.8, min: 1, max: 20, step: 0.1 },
    ],
    devNotes: `连接体的物理公式很直观，整体法求加速度，隔离法求张力：

\`\`\`js
a = (m2*g - mu*m1*g) / (m1 + m2)
T = m1 * (a + mu * g)
\`\`\`

主要处理几个边界情况：
- m2 太轻拉不动 → 加速度为 0，显示提示
- m1 不能跑到滑轮右边，m2 不能掉到地面以下 → 计算最大位移

摩擦系数可以调，观察它对运动的影响——摩擦越大，需要 m2 越重才能拉动。
`,

    // ── 物理逻辑 ──
    createState: (p) => ({ d: 0, v: 0, trail: [], _t: 0 }),
    step: (s, p, dt) => {
      const TABLE_W = 8, m1_hw = 0.45, m1_hh = 0.3, m2_r = 0.38
      const PULLEY_CENTER_Y = 5 + m1_hh
      const maxDist = Math.min(TABLE_W - m1_hw * 2, PULLEY_CENTER_Y - m2_r - GROUND_Y)
      const a = (p.m2 * p.gravity - p.mu * p.m1 * p.gravity) / (p.m1 + p.m2)
      s._t += dt
      if (a <= 0) {
        if (s.v > 0) { s.v += a * dt; if (s.v < 0) s.v = 0; s.d += s.v * dt }
        return
      }
      s.v += a * dt
      if (s.v < 0) s.v = 0
      s.d += s.v * dt
      if (s.d >= maxDist) { s.d = maxDist; s.v = 0 }
    },
    isFinished: (s) => {
      const TABLE_W = 8, m1_hw = 0.45, m1_hh = 0.3, m2_r = 0.38
      const maxDist = Math.min(TABLE_W - m1_hw * 2, 5 + m1_hh - m2_r - GROUND_Y)
      return s.d >= maxDist
    },
    getBallPosition: (s) => {
      const TABLE_W = 8, m1_hw = 0.45, m1_hh = 0.3, m2_r = 0.38
      const PULLEY_CENTER_Y = 5 + m1_hh
      const m1_x = Math.max(-TABLE_W + m1_hw, Math.min(-TABLE_W + m1_hw + s.d, -m1_hw))
      const m2_y = Math.max(PULLEY_CENTER_Y - m2_r - s.d, GROUND_Y)
      return { x: m1_x / 2, y: (PULLEY_CENTER_Y + m2_y) / 2 }
    },
    getTrailPosition: (s) => {
      const m2_y = Math.max(5 + 0.3 - 0.38 - s.d, GROUND_Y)
      return { x: 0, y: m2_y }
    },
    trailFields: (s) => ({ t: s._t, v: s.v, d: s.d }),
    chartDefs: [
      { title: "v-t 图", xLabel: "t (s)", yLabel: "v (m/s)", getData: (trail) => [{ name: "速度", data: trail.map(p => [p.t, p.v]) }] },
      { title: "d-t 图", xLabel: "t (s)", yLabel: "d (m)", getData: (trail) => [{ name: "位移", data: trail.map(p => [p.t, p.d]) }] },
    ],
    getInfoLines: (s, p, t) => {
      const TABLE_W = 8, m1_hw = 0.45, m1_hh = 0.3, m2_r = 0.38
      const PULLEY_CENTER_Y = 5 + m1_hh
      const m1_max = TABLE_W - m1_hw * 2
      const m2_max = PULLEY_CENTER_Y - m2_r - GROUND_Y
      const maxDist = Math.min(m1_max, m2_max)
      const a = (p.m2 * p.gravity - p.mu * p.m1 * p.gravity) / (p.m1 + p.m2)
      const av = a > 0 ? a : 0
      const T = av > 0 ? p.m1 * (av + p.mu * p.gravity) : p.m1 * p.gravity
      return [
        `加速度: ${av.toFixed(2)} m/s²`,
        `速度: ${s.v.toFixed(2)} m/s`,
        `移动距离: ${s.d.toFixed(1)} / ${maxDist.toFixed(1)} m`,
        `绳中拉力: ${T.toFixed(2)} N`,
        `m₁=${p.m1}kg  m₂=${p.m2}kg  μ=${p.mu.toFixed(2)}`,
        `时间: ${t.toFixed(2)} s`,
        ...(a <= 0 ? ['⚠ m₂ 太轻，无法拉动 m₁'] : []),
        ...(s.d >= m1_max && s.d < m2_max ? ['⚡ m₁ 已到滑轮处'] : []),
        ...(s.d >= m2_max ? ['⚡ m₂ 已落地'] : []),
      ]
    },

    // ── 渲染逻辑 ──
    drawObject: (ctx, s, p, w2s) => {
      const TABLE_H = 5, TABLE_W = 8
      const d = s.d
      const m1_hw = 0.45, m1_hh = 0.3
      const m2_r = 0.38
      const m1_start = -TABLE_W + m1_hw
      const m1_end = -m1_hw
      const m1_x = Math.max(m1_start, Math.min(m1_start + d, m1_end))
      const PULLEY_CENTER_Y = TABLE_H + m1_hh
      const PULLEY_OFFSET_X = 1.0
      const m2_y = Math.max(PULLEY_CENTER_Y - m2_r - d, GROUND_Y)
      const m2_x = PULLEY_OFFSET_X
      const ch = ctx.canvas.height / (window.devicePixelRatio || 1)
      const tL = w2s(-TABLE_W, 0), tR = w2s(0, 0), tT = w2s(-TABLE_W, TABLE_H)
      const tGrad = ctx.createLinearGradient(tL.x, tT.y, tL.x, tL.y)
      tGrad.addColorStop(0, "#b8956a")
      tGrad.addColorStop(0.12, "#d4b88c")
      tGrad.addColorStop(0.5, "#c4a67a")
      tGrad.addColorStop(1, "#8B7355")
      ctx.fillStyle = tGrad
      ctx.fillRect(tL.x, tT.y, tR.x - tL.x, tR.y - tT.y)
      ctx.fillStyle = "#e0c8a0"
      ctx.fillRect(tL.x, tT.y - 3, tR.x - tL.x, 5)
      ctx.fillStyle = "rgba(0,0,0,0.07)"
      ctx.fillRect(tL.x, tL.y - 2, tR.x - tL.x, 2)
      ctx.fillStyle = "#6b5b45"
      for (const lx of [-TABLE_W + 0.4, -0.4]) {
        const leg = w2s(lx, 0)
        ctx.fillRect(leg.x - 3, leg.y, 6, ch - leg.y)
        ctx.fillRect(leg.x - 5, leg.y + (ch - leg.y) - 6, 10, 6)
      }
      const PULLEY_RADIUS_PX = 8
      const pulleyPos = w2s(PULLEY_OFFSET_X, PULLEY_CENTER_Y)
      const tableTopRight = w2s(0, TABLE_H)
      const m1 = w2s(m1_x, TABLE_H + m1_hh)
      const m2 = w2s(m2_x, m2_y)
      ctx.lineCap = "round"
      ctx.strokeStyle = "#c4956a"
      ctx.lineWidth = 2.5
      ctx.beginPath()
      ctx.moveTo(pulleyPos.x, m1.y)
      ctx.lineTo(m1.x, m1.y)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(pulleyPos.x, pulleyPos.y + PULLEY_RADIUS_PX)
      ctx.lineTo(m2.x, m2.y)
      ctx.stroke()
      ctx.lineCap = "butt"
      ctx.strokeStyle = "#666"
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.moveTo(tableTopRight.x, tableTopRight.y)
      ctx.lineTo(pulleyPos.x, pulleyPos.y)
      ctx.stroke()
      ctx.fillStyle = "#777"
      ctx.fillRect(pulleyPos.x - 11, pulleyPos.y - 4, 22, 4)
      ctx.beginPath()
      ctx.arc(pulleyPos.x, pulleyPos.y, PULLEY_RADIUS_PX, 0, Math.PI * 2)
      ctx.fillStyle = "#555"
      ctx.fill()
      ctx.strokeStyle = "#444"
      ctx.lineWidth = 1.5
      ctx.stroke()
      ctx.beginPath()
      ctx.arc(pulleyPos.x, pulleyPos.y, 3.5, 0, Math.PI * 2)
      ctx.fillStyle = "#333"
      ctx.fill()
      const m1W = m1_hw * 2 * DRAW_SCALE, m1H = m1_hh * 2 * DRAW_SCALE
      const m1X = m1.x - m1_hw * DRAW_SCALE, m1Y = m1.y - m1_hh * DRAW_SCALE
      ctx.fillStyle = "rgba(0,0,0,0.1)"
      ctx.fillRect(m1X + 3, m1Y + 3, m1W, m1H)
      const m1Grad = ctx.createLinearGradient(m1X, m1Y, m1X, m1Y + m1H)
      m1Grad.addColorStop(0, "#5dade2")
      m1Grad.addColorStop(1, "#2980b9")
      ctx.fillStyle = m1Grad
      ctx.fillRect(m1X, m1Y, m1W, m1H)
      ctx.strokeStyle = "rgba(0,0,0,0.25)"
      ctx.lineWidth = 1.5
      ctx.strokeRect(m1X, m1Y, m1W, m1H)
      ctx.fillStyle = "#fff"
      ctx.font = "bold 12px sans-serif"
      ctx.textAlign = "center"
      ctx.fillText("m₁", m1.x, m1.y + 4)
      ctx.textAlign = "left"
      const m2R = m2_r * DRAW_SCALE
      ctx.beginPath()
      ctx.ellipse(m2.x + 3, m2.y + m2R * 0.3, m2R * 0.8, m2R * 0.2, 0, 0, Math.PI * 2)
      ctx.fillStyle = "rgba(0,0,0,0.08)"
      ctx.fill()
      ctx.beginPath()
      ctx.arc(m2.x, m2.y, m2R, 0, Math.PI * 2)
      const m2Grad = ctx.createRadialGradient(m2.x - 5, m2.y - 4, 2, m2.x, m2.y, m2R)
      m2Grad.addColorStop(0, "#f1948a")
      m2Grad.addColorStop(0.4, "#ec7063")
      m2Grad.addColorStop(1, "#c0392b")
      ctx.fillStyle = m2Grad
      ctx.fill()
      ctx.strokeStyle = "rgba(0,0,0,0.2)"
      ctx.lineWidth = 1.5
      ctx.stroke()
      ctx.fillStyle = "#fff"
      ctx.font = "bold 12px sans-serif"
      ctx.textAlign = "center"
      ctx.fillText("m₂", m2.x, m2.y + 4)
      ctx.textAlign = "left"
      if (s.v > 0.05) {
        const vLen = Math.min(s.v * 3, 60)
        const ax1 = m1.x + m1_hw * DRAW_SCALE + 4
        ctx.beginPath()
        ctx.moveTo(ax1, m1.y)
        ctx.lineTo(ax1 + vLen, m1.y)
        ctx.strokeStyle = "#e67e22"
        ctx.lineWidth = 2.5
        ctx.stroke()
        ctx.beginPath()
        ctx.moveTo(ax1 + vLen, m1.y)
        ctx.lineTo(ax1 + vLen - 8, m1.y - 4)
        ctx.lineTo(ax1 + vLen - 8, m1.y + 4)
        ctx.closePath()
        ctx.fillStyle = "#e67e22"
        ctx.fill()
        ctx.fillStyle = "#e67e22"
        ctx.font = "bold 11px sans-serif"
        ctx.textAlign = "center"
        ctx.fillText("v", ax1 + vLen * 0.5, m1.y - 8)
        const ax2 = m2.x + m2R + 6
        ctx.beginPath()
        ctx.moveTo(ax2, m2.y)
        ctx.lineTo(ax2, m2.y + vLen)
        ctx.strokeStyle = "#e67e22"
        ctx.lineWidth = 2.5
        ctx.stroke()
        ctx.beginPath()
        ctx.moveTo(ax2, m2.y + vLen)
        ctx.lineTo(ax2 - 4, m2.y + vLen - 8)
        ctx.lineTo(ax2 + 4, m2.y + vLen - 8)
        ctx.closePath()
        ctx.fillStyle = "#e67e22"
        ctx.fill()
        ctx.fillStyle = "#e67e22"
        ctx.fillText("v", ax2 + 10, m2.y + vLen * 0.5)
        ctx.textAlign = "left"
      }
    },
  }
