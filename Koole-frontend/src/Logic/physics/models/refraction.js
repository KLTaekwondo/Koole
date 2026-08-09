// refraction 模型数据
export default {
    id: "refraction",
    level: "初中",
    category: "光学",
    name: "光的折射",
    desc: "光线在两种介质界面上的折射与全反射",
    knowledge: `## 光的折射

光从一种介质进入另一种介质时在交界处发生偏折——偏折方向和大小由两种介质的折射率决定。

$$n_1 \\sin\\theta_1 = n_2 \\sin\\theta_2$$

其中：$n_1$/$n_2$ 是两种介质的折射率，$\\theta_1$ 是入射角，$\\theta_2$ 是折射角。

光从空气射进水（光疏→光密）时折射角小于入射角，光线向法线靠拢；反过来从水射向空气（光密→光疏）时折射角大于入射角，远离法线。垂直入射不偏折。

**全反射**：光从光密介质射向光疏介质时，入射角大到临界角 $\\theta_c = \\arcsin(n_2/n_1)$ 以后折射光消失，全部反射回来。光纤通信和全反射棱镜都是这个原理。

> 调成水→空气（n₁=1.33, n₂=1.0），入射角拉到 49° 以上就能看到全反射。`,
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="2" x2="12" y2="22" stroke-dasharray="3 2" opacity="0.4"/><line x1="4" y1="6" x2="12" y2="12"/><line x1="12" y1="12" x2="20" y2="18"/><rect x="0" y="12" width="24" height="12" fill="rgba(52,152,219,0.1)"/></svg>`,
    params: [
      { key: "incidentAngle", label: "入射角 (°)", value: 30, min: 0, max: 89, step: 1 },
      { key: "n1", label: "介质1折射率 n₁", value: 1.0, min: 1.0, max: 2.5, step: 0.01 },
      { key: "n2", label: "介质2折射率 n₂", value: 1.33, min: 1.0, max: 2.5, step: 0.01 },
    ],
    devNotes: `## 开发笔记

光的折射模型跟其他力学模型不一样——没有动画，是静态的光路图。所以 step 里基本不用算什么，主要工作量在渲染器上。

核心计算就一行，但要注意全反射时 Math.asin 的输入不能超过 [-1, 1]：

\`\`\`js
const sinTheta2 = n1 / n2 * Math.sin(theta1)
const theta2 = Math.asin(Math.min(1, Math.max(-1, sinTheta2)))
// sinTheta2 > 1 时全反射，折射角不存在
\`\`\`

渲染上画了法线、入射光线、反射光线、折射光线，还有角度弧线标注。入射点固定在画布中间，法线垂直。两种介质用不同背景色区分。
`,

    // ── 物理逻辑 ──
    createState: () => ({ _t: 0, trail: [] }),
    step: (s, p, dt) => { s._t += dt },
    isFinished: () => false,
    getBallPosition: () => null,
    getTrailPosition: () => null,
    trailFields: () => null,
    chartDefs: [],
    getInfoLines: (s, p) => {
      const theta1 = p.incidentAngle * Math.PI / 180
      const sinTheta2 = (p.n1 / p.n2) * Math.sin(theta1)
      const totalReflection = p.n1 > p.n2 && sinTheta2 > 1
      const hasCriticalAngle = p.n1 > p.n2
      const criticalAngle = hasCriticalAngle ? Math.asin(p.n2 / p.n1) * 180 / Math.PI : null

      if (totalReflection) {
        return [
          `入射角: ${p.incidentAngle}°`,
          `n₁ = ${p.n1.toFixed(2)}  n₂ = ${p.n2.toFixed(2)}`,
          `n₁/n₂ × sin(θ₁) = ${sinTheta2.toFixed(3)} > 1`,
          `临界角: ${criticalAngle.toFixed(1)}°`,
          `⚠ 全反射！无折射光线`,
          `反射角: ${p.incidentAngle}°`,
        ]
      }

      const theta2 = Math.asin(sinTheta2) * 180 / Math.PI
      const n1sin = p.n1 * Math.sin(theta1)
      const n2sin = p.n2 * Math.sin(theta2 * Math.PI / 180)
      const lines = [
        `入射角 θ₁: ${p.incidentAngle}°`,
        `折射角 θ₂: ${theta2.toFixed(1)}°`,
        `n₁ = ${p.n1.toFixed(2)}  n₂ = ${p.n2.toFixed(2)}`,
        `n₁sinθ₁ = ${n1sin.toFixed(3)}  n₂sinθ₂ = ${n2sin.toFixed(3)}`,
      ]
      if (hasCriticalAngle) {
        lines.push(`临界角: ${criticalAngle.toFixed(1)}°（距全反射还差 ${(criticalAngle - p.incidentAngle).toFixed(1)}°）`)
      }
      if (p.incidentAngle === 0) {
        lines.push(`垂直入射，不发生偏折`)
      } else if (p.n1 < p.n2) {
        lines.push(`光疏→光密，向法线偏折`)
      } else if (p.n1 > p.n2) {
        lines.push(`光密→光疏，远离法线偏折`)
      } else {
        lines.push(`n₁ = n₂，不发生偏折`)
      }
      return lines
    },

    // ── 渲染逻辑 ──
    drawObject: () => {},
    drawExtra: (ctx, s, p, w2s, getTheme) => {
      const isDark = getTheme && getTheme() === "dark"
      const dpr = window.devicePixelRatio || 1
      const cw = ctx.canvas.width / dpr
      const ch = ctx.canvas.height / dpr

      const intY = ch * 0.50
      const hitX = cw / 2
      const rayLen = Math.min(cw, ch) * 0.32

      const theta1 = p.incidentAngle * Math.PI / 180
      const n1 = p.n1
      const n2 = p.n2
      const sinTheta2 = n1 / n2 * Math.sin(theta1)
      const totalReflection = n1 > n2 && sinTheta2 > 1
      const theta2 = totalReflection ? null : Math.asin(Math.min(1, Math.max(-1, sinTheta2)))

      const bg1Color = isDark ? "rgba(220,220,220,0.06)" : "rgba(220,220,220,0.08)"
      const bg2Color = isDark ? "rgba(52,152,219,0.12)" : "rgba(52,152,219,0.05)"
      const intColor = isDark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.25)"
      const normalColor = isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.10)"
      const incidentColor = "#e74c3c"
      const reflectedColor = "#f39c12"
      const refractedColor = "#3498db"
      const labelColor = isDark ? "rgba(255,255,255,0.85)" : "rgba(0,0,0,0.7)"
      const dimColor = isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.35)"

      const drawArrow = (fromX, fromY, toX, toY, color, ratio = 0.55) => {
        const dx = toX - fromX, dy = toY - fromY
        const len = Math.sqrt(dx * dx + dy * dy)
        if (len < 1) return
        const ax = fromX + dx * ratio, ay = fromY + dy * ratio
        const nx = dx / len, ny = dy / len
        const sz = 8
        ctx.fillStyle = color
        ctx.beginPath()
        ctx.moveTo(ax, ay)
        ctx.lineTo(ax - nx * sz - ny * sz * 0.5, ay - ny * sz + nx * sz * 0.5)
        ctx.lineTo(ax - nx * sz + ny * sz * 0.5, ay - ny * sz - nx * sz * 0.5)
        ctx.closePath()
        ctx.fill()
      }

      ctx.fillStyle = bg1Color
      ctx.fillRect(0, 0, cw, intY)
      ctx.fillStyle = bg2Color
      ctx.fillRect(0, intY, cw, ch - intY)

      ctx.strokeStyle = intColor
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(30, intY)
      ctx.lineTo(cw - 30, intY)
      ctx.stroke()

      ctx.setLineDash([5, 5])
      ctx.strokeStyle = normalColor
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(hitX, intY - rayLen - 20)
      ctx.lineTo(hitX, intY + rayLen + 20)
      ctx.stroke()
      ctx.setLineDash([])

      ctx.fillStyle = dimColor
      ctx.font = "11px sans-serif"
      ctx.textAlign = "left"
      ctx.fillText("法线", hitX + 8, intY - rayLen - 5)

      const srcX = hitX - rayLen * Math.sin(theta1)
      const srcY = intY - rayLen * Math.cos(theta1)
      ctx.strokeStyle = incidentColor
      ctx.lineWidth = 2.5
      ctx.beginPath()
      ctx.moveTo(srcX, srcY)
      ctx.lineTo(hitX, intY)
      ctx.stroke()
      drawArrow(srcX, srcY, hitX, intY, incidentColor, 0.5)

      const refX = hitX + rayLen * Math.sin(theta1)
      const refY = intY - rayLen * Math.cos(theta1)
      ctx.strokeStyle = reflectedColor
      ctx.lineWidth = 2.5
      ctx.beginPath()
      ctx.moveTo(hitX, intY)
      ctx.lineTo(refX, refY)
      ctx.stroke()
      drawArrow(hitX, intY, refX, refY, reflectedColor, 0.5)

      if (!totalReflection && theta2 !== null) {
        const transX = hitX + rayLen * Math.sin(theta2)
        const transY = intY + rayLen * Math.cos(theta2)
        ctx.strokeStyle = refractedColor
        ctx.lineWidth = 2.5
        ctx.beginPath()
        ctx.moveTo(hitX, intY)
        ctx.lineTo(transX, transY)
        ctx.stroke()
        drawArrow(hitX, intY, transX, transY, refractedColor, 0.5)
      }

      const arcR = 32
      if (p.incidentAngle > 2) {
        ctx.strokeStyle = incidentColor
        ctx.lineWidth = 1.5
        ctx.beginPath()
        ctx.arc(hitX, intY, arcR, -Math.PI / 2 - theta1, -Math.PI / 2)
        ctx.stroke()
        const la = -Math.PI / 2 - theta1 / 2
        ctx.fillStyle = incidentColor
        ctx.font = "bold 11px sans-serif"
        ctx.textAlign = "center"
        ctx.fillText(`θ₁=${p.incidentAngle}°`, hitX + (arcR + 18) * Math.cos(la),
          intY + (arcR + 18) * Math.sin(la))

        ctx.strokeStyle = reflectedColor
        ctx.lineWidth = 1.5
        ctx.beginPath()
        ctx.arc(hitX, intY, arcR, -Math.PI / 2, -Math.PI / 2 + theta1)
        ctx.stroke()
        const la2 = -Math.PI / 2 + theta1 / 2
        ctx.fillStyle = reflectedColor
        ctx.fillText(`θ₁=${p.incidentAngle}°`, hitX + (arcR + 18) * Math.cos(la2),
          intY + (arcR + 18) * Math.sin(la2))
      }

      if (!totalReflection && theta2 !== null && theta2 > 0.02) {
        const theta2deg = theta2 * 180 / Math.PI
        ctx.strokeStyle = refractedColor
        ctx.lineWidth = 1.5
        ctx.beginPath()
        ctx.arc(hitX, intY, arcR, Math.PI / 2 - theta2, Math.PI / 2)
        ctx.stroke()
        const la3 = Math.PI / 2 - theta2 / 2
        ctx.fillStyle = refractedColor
        ctx.font = "bold 11px sans-serif"
        ctx.textAlign = "center"
        ctx.fillText(`θ₂=${theta2deg.toFixed(1)}°`, hitX + (arcR + 18) * Math.cos(la3),
          intY + (arcR + 18) * Math.sin(la3))
      }

      if (totalReflection) {
        ctx.fillStyle = "#e74c3c"
        ctx.font = "bold 16px sans-serif"
        ctx.textAlign = "center"
        ctx.fillText("⚠ 全反射 — 无折射光线", hitX, intY + rayLen * 0.55)
        const xLen = 16
        ctx.strokeStyle = "rgba(231,76,60,0.4)"
        ctx.lineWidth = 2.5
        const xDirX = hitX + rayLen * 0.35 * Math.sin(theta1)
        const xDirY = intY + rayLen * 0.35 * Math.cos(theta1)
        ctx.beginPath()
        ctx.moveTo(xDirX - xLen, xDirY - xLen)
        ctx.lineTo(xDirX + xLen, xDirY + xLen)
        ctx.moveTo(xDirX + xLen, xDirY - xLen)
        ctx.lineTo(xDirX - xLen, xDirY + xLen)
        ctx.stroke()
      }

      ctx.beginPath()
      ctx.arc(hitX, intY, 3, 0, Math.PI * 2)
      ctx.fillStyle = isDark ? "#fff" : "#333"
      ctx.fill()

      ctx.fillStyle = dimColor
      ctx.font = "bold 12px sans-serif"
      ctx.textAlign = "left"
      ctx.fillText(`介质 1  n₁ = ${n1.toFixed(2)}`, cw * 0.05, intY - 20)
      ctx.fillText(`介质 2  n₂ = ${n2.toFixed(2)}`, cw * 0.05, intY + 28)

      const legendX = cw - 140
      const legendY = 16
      const items = [
        { color: incidentColor, label: "入射光" },
        { color: reflectedColor, label: "反射光" },
      ]
      if (!totalReflection && theta2 !== null) {
        items.push({ color: refractedColor, label: "折射光" })
      }
      ctx.font = "11px sans-serif"
      ctx.textAlign = "left"
      ctx.fillStyle = isDark ? "rgba(30,30,30,0.8)" : "rgba(255,255,255,0.8)"
      ctx.fillRect(legendX, legendY, 125, items.length * 18 + 8)
      items.forEach((item, i) => {
        const iy = legendY + 10 + i * 18
        ctx.fillStyle = item.color
        ctx.fillRect(legendX + 8, iy - 5, 16, 3)
        ctx.fillStyle = labelColor
        ctx.fillText(item.label, legendX + 30, iy)
      })

      ctx.textAlign = "left"
    },
  }
