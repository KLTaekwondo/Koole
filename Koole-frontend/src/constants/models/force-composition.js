// force-composition 模型数据
export default {
    id: "force-composition",
    level: "初中",
    category: "力学",
    name: "力的合成",
    desc: "平行四边形法则：两个力的合力与分解",
    knowledge: `## 力的合成

平行四边形法则，合力用余弦定理：

- 合力大小：$F = \\sqrt{F_1^2 + F_2^2 + 2 F_1 F_2 \\cos\\theta}$
- 合力范围：$|F_1 - F_2| \\leq F \\leq F_1 + F_2$

其中：$F_1$/$F_2$ 是两个分力，$\\theta$ 是两力夹角，$F$ 是合力大小。

特殊情况记住：0° 合力最大 $F_1 + F_2$，90° 勾股定理 $\\sqrt{F_1^2 + F_2^2}$，180° 最小 $|F_1 - F_2|$。夹角越大合力越小。等大 120° 时合力等于分力，这个结论很巧妙。

三个力平衡时：任意两个力的合力与第三个力等大反向。

> 90° 验证勾股定理，180° 看合力最小——调参数很直观。`,
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="12" x2="4" y2="6"/><line x1="12" y1="12" x2="20" y2="6"/><line x1="12" y1="12" x2="12" y2="20" stroke="#2ecc71"/></svg>`,
    params: [
      { key: "F1", label: "力 F₁ (N)", value: 5, min: 1, max: 15, step: 0.5 },
      { key: "F2", label: "力 F₂ (N)", value: 5, min: 1, max: 15, step: 0.5 },
      { key: "angle", label: "夹角 θ (°)", value: 60, min: 0, max: 180, step: 5 },
    ],
    devNotes: `静态模型，没有动画，就是实时计算合力：

\`\`\`js
Fr = Math.sqrt(F1² + F2² + 2*F1*F2*Math.cos(theta))
\`\`\`

余弦定理直接用，记得转弧度。图表显示合力随夹角的变化曲线——从 0° 到 180° 递减，很直观。
`,

    // ── 物理逻辑 ──
    createState: (p) => {
      const rad = p.angle * Math.PI / 180
      const Fr = Math.sqrt(p.F1 ** 2 + p.F2 ** 2 + 2 * p.F1 * p.F2 * Math.cos(rad))
      const FrV = Math.sqrt(Math.max(0, Fr ** 2 - p.F1 ** 2))
      return { _t: 0, Fr, FrV, trail: [] }
    },
    step: (s, p, dt) => {
      const rad = p.angle * Math.PI / 180
      s.Fr = Math.sqrt(p.F1 ** 2 + p.F2 ** 2 + 2 * p.F1 * p.F2 * Math.cos(rad))
      s.FrV = Math.sqrt(Math.max(0, s.Fr ** 2 - p.F1 ** 2))
      s._t += dt
    },
    isFinished: () => false,
    getBallPosition: () => ({ x: 0, y: 0 }),
    getTrailPosition: () => null,
    trailFields: (s) => ({ t: s._t, Fr: s.Fr, FrV: s.FrV }),
    chartDefs: [
      {
        title: "合力随夹角变化",
        xLabel: "夹角 θ (°)",
        yLabel: "合力 F (N)",
        getData: (trail) => [{ name: "合力 F", data: trail.map(p => [p.t, p.Fr]) }],
      },
    ],
    getInfoLines: (s, p, t) => {
      const rad = p.angle * Math.PI / 180
      const Fr = Math.sqrt(p.F1 ** 2 + p.F2 ** 2 + 2 * p.F1 * p.F2 * Math.cos(rad))
      const FrV = Math.sqrt(Math.max(0, Fr ** 2 - p.F1 ** 2))
      return [
        `F₁ = ${p.F1.toFixed(1)} N`,
        `F₂ = ${p.F2.toFixed(1)} N`,
        `夹角: ${p.angle}°`,
        `合力: ${Fr.toFixed(2)} N`,
        `F合竖直分量: ${FrV.toFixed(2)} N`,
        `合力范围: ${Math.abs(p.F1 - p.F2).toFixed(1)} ~ ${(p.F1 + p.F2).toFixed(1)} N`,
        `时间: ${t.toFixed(2)} s`,
      ]
    },

    // ── 渲染逻辑 ──
    drawObject: () => {},
    drawExtra: (ctx, s, p, w2s, getTheme) => {
      const isDark = getTheme && getTheme() === "dark"
      const anchor = w2s(0, 0)
      const ox = anchor.x
      const oy = anchor.y
      const SC = 15
      const F1 = p.F1, F2 = p.F2
      const rad = p.angle * Math.PI / 180

      const f1x = F1 * SC, f1y = 0
      const f2x = F2 * SC * Math.cos(rad)
      const f2y = -F2 * SC * Math.sin(rad)

      const rx = f1x + f2x
      const ry = f2y
      const Fr = Math.sqrt(rx * rx + ry * ry)
      const frAngle = Math.atan2(ry, rx)

      ctx.beginPath()
      ctx.moveTo(ox + f1x, oy + f1y)
      ctx.lineTo(ox + rx, oy + ry)
      ctx.moveTo(ox + f2x, oy + f2y)
      ctx.lineTo(ox + rx, oy + ry)
      ctx.strokeStyle = isDark ? "rgba(200,200,200,0.25)" : "rgba(0,0,0,0.2)"
      ctx.lineWidth = 1
      ctx.setLineDash([5, 4])
      ctx.stroke()
      ctx.setLineDash([])

      if (Fr > 1) {
        ctx.beginPath()
        ctx.moveTo(ox, oy)
        ctx.lineTo(ox + rx, oy + ry)
        ctx.strokeStyle = "#2ecc71"
        ctx.lineWidth = 3
        ctx.stroke()
        ctx.beginPath()
        ctx.moveTo(ox + rx, oy + ry)
        ctx.lineTo(ox + rx - 10 * Math.cos(frAngle - 0.35), oy + ry - 10 * Math.sin(frAngle - 0.35))
        ctx.lineTo(ox + rx - 10 * Math.cos(frAngle + 0.35), oy + ry - 10 * Math.sin(frAngle + 0.35))
        ctx.closePath()
        ctx.fillStyle = "#2ecc71"
        ctx.fill()
        ctx.font = "bold 12px sans-serif"
        ctx.fillStyle = "#2ecc71"
        ctx.textAlign = "center"
        ctx.fillText(`F合=${(Fr / SC).toFixed(2)}N`, ox + rx * 0.5 + ry * 0.15, oy + ry * 0.5 - rx * 0.15 - 6)
      }

      ctx.beginPath()
      ctx.moveTo(ox, oy)
      ctx.lineTo(ox + f1x, oy)
      ctx.strokeStyle = "#3498db"
      ctx.lineWidth = 2.5
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(ox + f1x, oy)
      ctx.lineTo(ox + f1x - 8, oy - 4)
      ctx.lineTo(ox + f1x - 8, oy + 4)
      ctx.closePath()
      ctx.fillStyle = "#3498db"
      ctx.fill()
      ctx.font = "bold 11px sans-serif"
      ctx.fillStyle = "#3498db"
      ctx.textAlign = "center"
      ctx.fillText(`F₁=${F1}N`, ox + f1x * 0.5, oy + 16)

      ctx.beginPath()
      ctx.moveTo(ox, oy)
      ctx.lineTo(ox + f2x, oy + f2y)
      ctx.strokeStyle = "#e67e22"
      ctx.lineWidth = 2.5
      ctx.stroke()
      const a2 = Math.atan2(f2y, f2x)
      ctx.beginPath()
      ctx.moveTo(ox + f2x, oy + f2y)
      ctx.lineTo(ox + f2x - 8 * Math.cos(a2 - 0.35), oy + f2y - 8 * Math.sin(a2 - 0.35))
      ctx.lineTo(ox + f2x - 8 * Math.cos(a2 + 0.35), oy + f2y - 8 * Math.sin(a2 + 0.35))
      ctx.closePath()
      ctx.fillStyle = "#e67e22"
      ctx.fill()
      ctx.font = "bold 11px sans-serif"
      ctx.fillStyle = "#e67e22"
      ctx.textAlign = "center"
      const f2LabelX = ox + f2x * 0.5 - f2y * 0.15
      const f2LabelY = oy + f2y * 0.5 + f2x * 0.15 - 4
      ctx.fillText(`F₂=${F2}N`, f2LabelX, f2LabelY)

      const arcR1 = 30
      const f2Angle = -rad
      ctx.beginPath()
      ctx.arc(ox, oy, arcR1, 0, f2Angle, true)
      ctx.strokeStyle = isDark ? "rgba(200,200,200,0.4)" : "rgba(0,0,0,0.3)"
      ctx.lineWidth = 1
      ctx.stroke()
      const arcLabelAngle = f2Angle / 2
      ctx.font = "11px sans-serif"
      ctx.fillStyle = isDark ? "rgba(220,220,220,0.7)" : "rgba(0,0,0,0.5)"
      ctx.textAlign = "center"
      ctx.fillText(`θ=${p.angle}°`, ox + (arcR1 + 12) * Math.cos(arcLabelAngle), oy + (arcR1 + 12) * Math.sin(arcLabelAngle) + 4)

      if (Fr > 1 && p.angle > 0 && p.angle < 180) {
        const arcR2 = 48
        const alpha1 = Math.abs(frAngle)
        ctx.beginPath()
        ctx.arc(ox, oy, arcR2, 0, frAngle, frAngle < 0)
        ctx.strokeStyle = isDark ? "rgba(46,204,113,0.5)" : "rgba(46,204,113,0.6)"
        ctx.lineWidth = 1.5
        ctx.stroke()
        const a1LabelAngle = frAngle / 2
        ctx.font = "10px sans-serif"
        ctx.fillStyle = isDark ? "rgba(46,204,113,0.8)" : "rgba(46,204,113,0.8)"
        ctx.textAlign = "center"
        ctx.fillText(`α₁=${(alpha1 * 180 / Math.PI).toFixed(1)}°`, ox + (arcR2 + 14) * Math.cos(a1LabelAngle), oy + (arcR2 + 14) * Math.sin(a1LabelAngle) + 4)

        const arcR3 = 62
        const alpha2 = Math.abs(f2Angle - frAngle)
        ctx.beginPath()
        ctx.arc(ox, oy, arcR3, frAngle, f2Angle, true)
        ctx.strokeStyle = isDark ? "rgba(230,126,34,0.5)" : "rgba(230,126,34,0.6)"
        ctx.lineWidth = 1.5
        ctx.stroke()
        const a2LabelAngle = (frAngle + f2Angle) / 2
        ctx.font = "10px sans-serif"
        ctx.fillStyle = isDark ? "rgba(230,126,34,0.8)" : "rgba(230,126,34,0.8)"
        ctx.textAlign = "center"
        ctx.fillText(`α₂=${(alpha2 * 180 / Math.PI).toFixed(1)}°`, ox + (arcR3 + 14) * Math.cos(a2LabelAngle), oy + (arcR3 + 14) * Math.sin(a2LabelAngle) + 4)
      }

      ctx.font = "11px sans-serif"
      ctx.fillStyle = isDark ? "#aaa" : "#666"
      ctx.textAlign = "left"
      ctx.fillText(`F合 = ${(Fr / SC).toFixed(2)} N`, ox + 10, oy + 30)
      ctx.fillText(`范围: ${Math.abs(F1 - F2).toFixed(1)} ~ ${(F1 + F2).toFixed(1)} N`, ox + 10, oy + 46)
    },
  }
