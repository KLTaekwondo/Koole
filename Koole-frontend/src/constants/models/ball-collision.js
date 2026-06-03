// ball-collision 模型数据
const GROUND_Y = 0.4

export default {
    id: "ball-collision",
    level: "高中",
    category: "力学",
    name: "两球碰撞",
    desc: "两个小球在水平方向上的弹性/非弹性碰撞",
    knowledge: `## 两球碰撞

动量守恒 + 能量守恒（弹性碰撞时）的综合应用。

动量**始终**守恒：
$$m_1 v_1 + m_2 v_2 = m_1 v_1' + m_2 v_2'$$

动能**仅弹性碰撞时**守恒：
$$\\frac{1}{2}m_1 v_1^2 + \\frac{1}{2}m_2 v_2^2 = \\frac{1}{2}m_1 v_1'^2 + \\frac{1}{2}m_2 v_2'^2$$

其中：$m_1$/$m_2$ 是两球质量，$v_1$/$v_2$ 是碰撞前速度，$v_1'$/$v_2'$ 是碰撞后速度。

完全弹性碰撞公式：
- $v_1' = \\frac{(m_1-m_2)v_1 + 2m_2 v_2}{m_1+m_2}$
- $v_2' = \\frac{(m_2-m_1)v_2 + 2m_1 v_1}{m_1+m_2}$

三种特殊情况做题常考：等质量速度交换，球1远重则球2以约 $2v_1$ 弹出，球1远轻则球1弹回。

> 等质量碰撞试试——速度完全交换，牛顿摆就是这个原理。`,
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="7" cy="12" r="3"/><circle cx="17" cy="12" r="3"/><line x1="10" y1="12" x2="14" y2="12"/><polygon points="14,10 14,14 16,12"/></svg>`,
    params: [
      { key: "m1", label: "球1质量 (kg)", value: 1, min: 0.1, max: 10, step: 0.1 },
      { key: "v1", label: "球1初速度 (m/s)", value: 3, min: -10, max: 10, step: 0.5 },
      { key: "m2", label: "球2质量 (kg)", value: 1, min: 0.1, max: 10, step: 0.1 },
      { key: "v2", label: "球2初速度 (m/s)", value: -2, min: -10, max: 10, step: 0.5 },
      { key: "restitution", label: "碰撞类型", value: 1, options: [
        { value: 1, label: "完全弹性碰撞" },
        { value: 0, label: "完全非弹性碰撞" },
      ]},
    ],
    devNotes: `碰撞检测用距离判断，碰撞后用弹性公式算新速度：

\`\`\`js
if (!s.collided && s.x2 - s.x1 < MIN_DIST && s.v1 > s.v2) {
  s.v1 = ((m1-m2)*v1 + 2*m2*v2) / (m1+m2)
  s.v2 = ((m2-m1)*v2 + 2*m1*v1) / (m1+m2)
}
\`\`\`

高速时球可能穿透——碰撞时修正重叠位置解决。

碰撞前后速度都记录下来（\`_preV1\`, \`_postV1\` 等），用于显示动量和动能对比。碰撞后继续模拟 1 秒让用户看清结果。
`,

    // ── 物理逻辑 ──
    createState: (p) => ({
      x1: -8, v1: p.v1, x2: 8, v2: p.v2,
      collided: false, trail: [], trail2: [], collisionTime: 999,
      _t: 0, _preV1: null, _preV2: null, _postV1: null, _postV2: null, _postTime: 0,
    }),
    step: (s, p, dt) => {
      const MIN_DIST = 1
      s.x1 += s.v1 * dt
      s.x2 += s.v2 * dt
      if (!s.collided && s.x2 - s.x1 < MIN_DIST && s.v1 > s.v2) {
        s.collided = true
        s.collisionTime = 0
        s._preV1 = s.v1
        s._preV2 = s.v2
        const overlap = MIN_DIST - (s.x2 - s.x1)
        s.x1 -= overlap / 2
        s.x2 += overlap / 2
        if (p.restitution === 1) {
          const v1 = s.v1, v2 = s.v2
          s.v1 = ((p.m1 - p.m2) * v1 + 2 * p.m2 * v2) / (p.m1 + p.m2)
          s.v2 = ((p.m2 - p.m1) * v2 + 2 * p.m1 * v1) / (p.m1 + p.m2)
        } else {
          const v = (p.m1 * s.v1 + p.m2 * s.v2) / (p.m1 + p.m2)
          s.v1 = v; s.v2 = v
        }
        s._postV1 = s.v1
        s._postV2 = s.v2
      }
      if (s.collided) {
        s.collisionTime += dt
        s._postTime += dt
      }
      s._t += dt
      if (!s.trail2) s.trail2 = []
      s.trail2.push({ x: s.x2, y: GROUND_Y })
      if (s.trail2.length > 5000) s.trail2.splice(0, s.trail2.length - 5000)
    },
    isFinished: (s) => s.collided && s._postTime >= 1.0,
    getBallPosition: (s) => ({ x: (s.x1 + s.x2) / 2, y: GROUND_Y }),
    getTrailPosition: (s) => ({ x: s.x1, y: GROUND_Y }),
    trailFields: (s) => ({ t: s._t, v1: s.v1, v2: s.v2 }),
    chartDefs: [
      {
        title: "v-t 图",
        xLabel: "t (s)",
        yLabel: "v (m/s)",
        getData: (trail) => [
          { name: "球1", data: trail.map(p => [p.t, p.v1]), color: "#0288D1" },
          { name: "球2", data: trail.map(p => [p.t, p.v2]), color: "#F57C00" },
        ],
      },
    ],
    getInfoLines: (s, p, t) => {
      const KE1 = 0.5 * p.m1 * s.v1 * s.v1
      const KE2 = 0.5 * p.m2 * s.v2 * s.v2
      const lines = [
        `球1: m=${p.m1.toFixed(1)}kg  v=${s.v1.toFixed(2)}m/s  KE=${KE1.toFixed(2)}J`,
        `球2: m=${p.m2.toFixed(1)}kg  v=${s.v2.toFixed(2)}m/s  KE=${KE2.toFixed(2)}J`,
        `总动量: ${(p.m1 * s.v1 + p.m2 * s.v2).toFixed(2)} kg·m/s`,
        `总动能: ${(KE1 + KE2).toFixed(2)} J`,
        `状态: ${s.collided ? '已碰撞' : '未碰撞'} 类型: ${p.restitution === 1 ? '完全弹性' : '完全非弹性'}`,
      ]
      if (s.collided && s._preV1 !== null) {
        const preP = p.m1 * s._preV1 + p.m2 * s._preV2
        const postP = p.m1 * s._postV1 + p.m2 * s._postV2
        const preKE = 0.5 * p.m1 * s._preV1 ** 2 + 0.5 * p.m2 * s._preV2 ** 2
        const postKE = 0.5 * p.m1 * s._postV1 ** 2 + 0.5 * p.m2 * s._postV2 ** 2
        lines.push('─── 碰撞分析 ───')
        lines.push(`碰撞前动量: ${preP.toFixed(2)} kg·m/s`)
        lines.push(`碰撞后动量: ${postP.toFixed(2)} kg·m/s`)
        lines.push(`动量变化: ${Math.abs(postP - preP).toFixed(4)} kg·m/s`)
        lines.push(`碰撞前动能: ${preKE.toFixed(2)} J`)
        lines.push(`碰撞后动能: ${postKE.toFixed(2)} J`)
        lines.push(`动能损失: ${(preKE - postKE).toFixed(2)} J (${preKE > 0 ? ((1 - postKE / preKE) * 100).toFixed(1) : 0}%)`)
      }
      return lines
    },

    // ── 渲染逻辑 ──
    drawObject: (ctx, s, p, w2s) => {
      const RADIUS_PX = 14
      const pos1 = w2s(s.x1, GROUND_Y)
      ctx.beginPath()
      ctx.arc(pos1.x, pos1.y, RADIUS_PX, 0, Math.PI * 2)
      const grad1 = ctx.createRadialGradient(pos1.x - 4, pos1.y - 4, 2, pos1.x, pos1.y, RADIUS_PX)
      grad1.addColorStop(0, '#4FC3F7')
      grad1.addColorStop(1, '#0288D1')
      ctx.fillStyle = grad1
      ctx.fill()
      ctx.strokeStyle = "rgba(0,0,0,0.2)"
      ctx.lineWidth = 1.5
      ctx.stroke()
      ctx.fillStyle = "#fff"
      ctx.font = "bold 12px sans-serif"
      ctx.textAlign = "center"
      ctx.fillText("1", pos1.x, pos1.y + 4)
      ctx.textAlign = "left"
      const pos2 = w2s(s.x2, GROUND_Y)
      ctx.beginPath()
      ctx.arc(pos2.x, pos2.y, RADIUS_PX, 0, Math.PI * 2)
      const grad2 = ctx.createRadialGradient(pos2.x - 4, pos2.y - 4, 2, pos2.x, pos2.y, RADIUS_PX)
      grad2.addColorStop(0, '#FFB74D')
      grad2.addColorStop(1, '#F57C00')
      ctx.fillStyle = grad2
      ctx.fill()
      ctx.strokeStyle = "rgba(0,0,0,0.2)"
      ctx.lineWidth = 1.5
      ctx.stroke()
      ctx.fillStyle = "#fff"
      ctx.font = "bold 12px sans-serif"
      ctx.textAlign = "center"
      ctx.fillText("2", pos2.x, pos2.y + 4)
      ctx.textAlign = "left"
    },
    drawExtra: (ctx, s, p, w2s, getTheme) => {
      const RADIUS_PX = 14
      ctx.globalAlpha = 0.5
      for (let i = 1; i < s.trail2.length; i++) {
        const p1 = w2s(s.trail2[i - 1].x, s.trail2[i - 1].y)
        const p2 = w2s(s.trail2[i].x, s.trail2[i].y)
        ctx.beginPath()
        ctx.moveTo(p1.x, p1.y)
        ctx.lineTo(p2.x, p2.y)
        ctx.strokeStyle = "rgba(245, 124, 0, 0.35)"
        ctx.lineWidth = 2
        ctx.stroke()
      }
      ctx.globalAlpha = 1.0
      const drawArrow = (pos, v, color) => {
        const len = Math.min(Math.abs(v) * 10, 70)
        if (len < 5) return
        const dir = v > 0 ? 1 : -1
        ctx.beginPath()
        ctx.moveTo(pos.x, pos.y - RADIUS_PX - 4)
        ctx.lineTo(pos.x + dir * len, pos.y - RADIUS_PX - 4)
        ctx.strokeStyle = color
        ctx.lineWidth = 2.5
        ctx.stroke()
        ctx.beginPath()
        ctx.moveTo(pos.x + dir * len, pos.y - RADIUS_PX - 4)
        ctx.lineTo(pos.x + dir * (len - 8), pos.y - RADIUS_PX - 8)
        ctx.lineTo(pos.x + dir * (len - 8), pos.y - RADIUS_PX)
        ctx.closePath()
        ctx.fillStyle = color
        ctx.fill()
        ctx.fillStyle = color
        ctx.font = "bold 11px sans-serif"
        ctx.textAlign = "center"
        ctx.fillText("v", pos.x + dir * len * 0.5, pos.y - RADIUS_PX - 10)
        ctx.textAlign = "left"
      }
      drawArrow(w2s(s.x1, GROUND_Y), s.v1, "#0288D1")
      drawArrow(w2s(s.x2, GROUND_Y), s.v2, "#F57C00")
      if (s.collided) {
        const midPx = w2s((s.x1 + s.x2) / 2, GROUND_Y)
        const elapsed = s.collisionTime
        const alpha = Math.max(0, 0.6 - elapsed * 2)
        if (alpha > 0) {
          ctx.beginPath()
          ctx.arc(midPx.x, midPx.y, 24 + elapsed * 20, 0, Math.PI * 2)
          ctx.strokeStyle = `rgba(230, 126, 34, ${alpha})`
          ctx.lineWidth = 2.5
          ctx.setLineDash([4, 4])
          ctx.stroke()
          ctx.setLineDash([])
          ctx.fillStyle = `rgba(230, 126, 34, ${alpha})`
          ctx.font = "bold 14px sans-serif"
          ctx.textAlign = "center"
          ctx.fillText("碰撞!", midPx.x, midPx.y - 36)
          ctx.textAlign = "left"
        }
        if (s._preV1 !== null) {
          const cw = ctx.canvas.width / (window.devicePixelRatio || 1)
          const ch = ctx.canvas.height / (window.devicePixelRatio || 1)
          const colW = [80, 75, 75, 75, 75]
          const rowH = 26
          const headers = ['物理量', '球1 碰撞前', '球1 碰撞后', '球2 碰撞前', '球2 碰撞后']
          const tableW = colW.reduce((a, b) => a + b, 0)
          const tableH = rowH * 6 + 4
          const tx = cw - tableW - 20
          const ty = ch - tableH - 20

          ctx.save()
          ctx.beginPath()
          ctx.moveTo(tx + 6, ty)
          ctx.lineTo(tx + tableW - 6, ty)
          ctx.arcTo(tx + tableW, ty, tx + tableW, ty + 6, 6)
          ctx.lineTo(tx + tableW, ty + tableH - 6)
          ctx.arcTo(tx + tableW, ty + tableH, tx + tableW - 6, ty + tableH, 6)
          ctx.lineTo(tx + 6, ty + tableH)
          ctx.arcTo(tx, ty + tableH, tx, ty + tableH - 6, 6)
          ctx.lineTo(tx, ty + 6)
          ctx.arcTo(tx, ty, tx + 6, ty, 6)
          ctx.closePath()
          ctx.fillStyle = getTheme && getTheme() === "dark" ? "rgba(30,30,30,0.92)" : "rgba(255,255,255,0.95)"
          ctx.fill()
          ctx.strokeStyle = getTheme && getTheme() === "dark" ? "rgba(100,100,100,0.6)" : "rgba(0,0,0,0.12)"
          ctx.lineWidth = 1
          ctx.stroke()

          ctx.font = "bold 11px sans-serif"
          ctx.fillStyle = getTheme && getTheme() === "dark" ? "rgba(52, 152, 219, 0.3)" : "rgba(52, 152, 219, 0.12)"
          ctx.fillRect(tx, ty, tableW, rowH)
          ctx.fillStyle = getTheme && getTheme() === "dark" ? "#ddd" : "#2c3e50"
          let cx = tx
          headers.forEach((h, i) => {
            ctx.textAlign = "center"
            ctx.fillText(h, cx + colW[i] / 2, ty + 17)
            cx += colW[i]
          })

          const rows = [
            ['质量 (kg)', `${p.m1.toFixed(1)}`, `${p.m1.toFixed(1)}`, `${p.m2.toFixed(1)}`, `${p.m2.toFixed(1)}`],
            ['速度 (m/s)', `${s._preV1.toFixed(2)}`, `${s._postV1.toFixed(2)}`, `${s._preV2.toFixed(2)}`, `${s._postV2.toFixed(2)}`],
            ['动量 (kg·m/s)', `${(p.m1 * s._preV1).toFixed(2)}`, `${(p.m1 * s._postV1).toFixed(2)}`, `${(p.m2 * s._preV2).toFixed(2)}`, `${(p.m2 * s._postV2).toFixed(2)}`],
            ['动能 (J)', `${(0.5 * p.m1 * s._preV1 ** 2).toFixed(2)}`, `${(0.5 * p.m1 * s._postV1 ** 2).toFixed(2)}`, `${(0.5 * p.m2 * s._preV2 ** 2).toFixed(2)}`, `${(0.5 * p.m2 * s._postV2 ** 2).toFixed(2)}`],
            ['总动量', '碰撞前:', `${(p.m1 * s._preV1 + p.m2 * s._preV2).toFixed(2)}`, '碰撞后:', `${(p.m1 * s._postV1 + p.m2 * s._postV2).toFixed(2)}`],
          ]
          rows.forEach((row, ri) => {
            const ry = ty + rowH + ri * rowH
            if (ri % 2 === 0) {
              ctx.fillStyle = getTheme && getTheme() === "dark" ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)"
              ctx.fillRect(tx, ry, tableW, rowH)
            }
            ctx.fillStyle = getTheme && getTheme() === "dark" ? "#ccc" : "#333"
            ctx.font = "11px sans-serif"
            let cx2 = tx
            row.forEach((cell, ci) => {
              ctx.textAlign = ci === 0 ? "left" : "center"
              ctx.fillText(cell, ci === 0 ? cx2 + 6 : cx2 + colW[ci] / 2, ry + 17)
              cx2 += colW[ci]
            })
          })

          ctx.font = "bold 12px sans-serif"
          ctx.fillStyle = "#e67e22"
          ctx.textAlign = "left"
          ctx.fillText("碰撞数据分析", tx, ty - 6)

          ctx.textAlign = "left"
          ctx.restore()
        }
      }
    },
  }
