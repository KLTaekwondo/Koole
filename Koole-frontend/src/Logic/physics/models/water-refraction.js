// water-refraction 模型数据
export default {
    id: "water-refraction",
    level: "初中",
    category: "光学",
    name: "水中视深",
    desc: "观察水中物体的视深现象——光的折射使物体看起来比实际更浅",
    knowledge: `## 水中视深

光从水中射向空气时发生折射，导致从空气里看水下物体觉得比实际浅——这就是视深比实深小的原因。

**折射定律（斯涅尔定律）：**
$$n_1 \\sin \\theta_1 = n_2 \\sin \\theta_2$$

**视深公式：**
$$d' = d \\cdot \\frac{n_2 \\cos \\theta_2}{n_1 \\cos \\theta_1}$$

其中：$d$ 是实深，$d'$ 是视深，$n_1$ 是水折射率，$n_2$ 是空气折射率（≈1.0），$\\theta_1$ 和 $\\theta_2$ 分别是水中和空气中的光线与法线夹角。

垂直看的时候公式简化为 $d' \\approx d / n_1$——水的折射率 1.33 的话视深只有实深的七成五。实际生活里游泳池底看着比实际浅就是这个原因，看着水只到腰跳下去可能淹过头。

> 拖拽滑块调整观察角和水的深度，看看视深怎么变。`,
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="10" width="20" height="12" fill="rgba(52,152,219,0.2)" stroke="rgba(52,152,219,0.5)"/><line x1="8" y1="8" x2="14" y2="16" stroke="#e74c3c" stroke-width="1.5"/><line x1="14" y1="16" x2="19" y2="10" stroke="#e74c3c" stroke-width="1.5"/><line x1="14" y1="16" x2="14" y2="6" stroke-dasharray="3 2" opacity="0.4"/><circle cx="8" cy="6" r="2" fill="#e74c3c"/><polygon points="19,10 21,11 20,8" fill="#e74c3c"/></svg>`,
    params: [
      { key: "depth", label: "实深 (cm)", value: 100, min: 30, max: 250, step: 1 },
      { key: "viewAngle", label: "观察角 (°)", value: 30, min: 1, max: 75, step: 1 },
      { key: "refractiveIndex", label: "水折射率 n", value: 1.33, min: 1.05, max: 2.0, step: 0.01 },
    ],
    devNotes: `## 开发笔记

水中视深模型展示从空气中观察水中物体时的折射现象——由于光线从水进入空气时远离法线偏折，物体看起来比实际位置浅。

核心计算由观察角 θ₂ 反推水中光线角：

\`\`\`js
const sinTheta1 = n2 / n1 * Math.sin(theta2)
const theta1 = Math.asin(Math.min(1, Math.max(-1, sinTheta1)))
const appDepth = depth * (n2 * cosTheta2) / (n1 * cosTheta1)
\`\`\`

视深公式 d' = d · (n₂/n₁) · (cosθ₂ / cosθ₁)，垂直看近似 d' ≈ d / n₁。实物用黑/白色实心圆，虚像用红色虚线圆，深度刻度在左侧对比标注。`,

    // ── 物理逻辑 ──
    createState: () => ({ _t: 0, trail: [] }),
    step: (s, p, dt) => { s._t += dt },
    isFinished: () => false,
    getBallPosition: () => null,
    getTrailPosition: () => null,
    trailFields: () => null,
    chartDefs: [],
    getInfoLines: (s, p) => {
      const theta2 = p.viewAngle * Math.PI / 180
      const n1 = p.refractiveIndex
      const n2 = 1.0
      const sinTheta1 = n2 / n1 * Math.sin(theta2)
      const theta1 = Math.asin(Math.min(1, Math.max(-1, sinTheta1)))
      const theta1deg = theta1 * 180 / Math.PI
      const cosTheta1 = Math.cos(theta1)
      const cosTheta2 = Math.cos(theta2)

      const appDepth = p.depth * (n2 * cosTheta2) / (n1 * cosTheta1)
      const smallAngleDepth = p.depth / n1

      return [
        `实深: ${p.depth} cm`,
        `视深: ${appDepth.toFixed(1)} cm`,
        `相差: ${(p.depth - appDepth).toFixed(1)} cm`,
        `水中光线角 θ₁: ${theta1deg.toFixed(1)}°`,
        `观察角 θ₂: ${p.viewAngle}°`,
        `水折射率: ${n1.toFixed(2)}`,
        `小角度近似视深: ${smallAngleDepth.toFixed(1)} cm`,
      ]
    },

    // ── 渲染逻辑 ──
    drawObject: () => {},
    drawExtra: (ctx, s, p, w2s, getTheme) => {
      const isDark = getTheme && getTheme() === "dark"
      const dpr = window.devicePixelRatio || 1
      const cw = ctx.canvas.width / dpr
      const ch = ctx.canvas.height / dpr

      const surfaceY = ch * 0.38
      const landLeft = cw * 0.68
      const groundTop = surfaceY - 50
      const eyeHeight = 140

      const D_px = p.depth * 0.55
      const theta2 = p.viewAngle * Math.PI / 180
      const n1 = p.refractiveIndex
      const sinTheta1 = Math.sin(theta2) / n1
      const theta1 = Math.asin(Math.min(1, Math.max(-1, sinTheta1)))
      const tan1 = Math.tan(theta1)
      const tan2 = Math.tan(theta2)
      const cos1 = Math.cos(theta1)
      const cos2 = Math.cos(theta2)

      const objX = cw * 0.28
      const objY = surfaceY + D_px

      const hitOffset = D_px * tan1
      const hitX = objX + hitOffset
      const intY = surfaceY

      const eyeX = hitX + eyeHeight * tan2
      const eyeY = surfaceY - eyeHeight

      const groundLeft = Math.max(cw * 0.35, Math.min(landLeft, eyeX - 16))

      const appD_px = D_px * tan1 / tan2
      const appY = surfaceY + appD_px

      const waterFill = isDark ? "rgba(52,152,219,0.20)" : "rgba(52,152,219,0.10)"
      const waterLine = isDark ? "rgba(52,152,219,0.7)" : "rgba(52,152,219,0.5)"
      const rippleColor = isDark ? "rgba(52,152,219,0.15)" : "rgba(52,152,219,0.08)"
      const landFill = isDark ? "rgba(139,90,43,0.30)" : "rgba(139,90,43,0.10)"
      const landLine = isDark ? "rgba(139,90,43,0.7)" : "rgba(139,90,43,0.4)"
      const rayColor = "#e74c3c"
      const dashColor = isDark ? "rgba(231,76,60,0.5)" : "rgba(231,76,60,0.35)"
      const normalColor = isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.10)"
      const labelColor = isDark ? "rgba(255,255,255,0.85)" : "rgba(0,0,0,0.7)"
      const dimColor = isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.35)"
      const arrowColor = isDark ? "#eee" : "#333"

      ctx.fillStyle = waterFill
      ctx.fillRect(0, surfaceY, groundLeft, ch - surfaceY)

      ctx.fillStyle = landFill
      ctx.fillRect(groundLeft, groundTop, cw - groundLeft, ch - groundTop)
      ctx.strokeStyle = landLine
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(groundLeft, groundTop)
      ctx.lineTo(cw, groundTop)
      ctx.stroke()

      ctx.strokeStyle = waterLine
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.moveTo(0, surfaceY)
      ctx.lineTo(groundLeft, surfaceY)
      ctx.stroke()

      ctx.strokeStyle = rippleColor
      ctx.lineWidth = 1
      for (let i = 0; i < 5; i++) {
        const wx = 40 + i * 70
        if (wx + 30 > groundLeft) break
        ctx.beginPath()
        ctx.moveTo(wx, surfaceY + 2)
        ctx.quadraticCurveTo(wx + 15, surfaceY - 6, wx + 30, surfaceY + 2)
        ctx.stroke()
      }

      ctx.setLineDash([4, 4])
      ctx.strokeStyle = normalColor
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(hitX, surfaceY - 50)
      ctx.lineTo(hitX, surfaceY + D_px + 40)
      ctx.stroke()
      ctx.setLineDash([])

      ctx.strokeStyle = rayColor
      ctx.lineWidth = 2.5
      ctx.beginPath()
      ctx.moveTo(objX, objY)
      ctx.lineTo(hitX, intY)
      ctx.lineTo(eyeX, eyeY)
      ctx.stroke()

      const extEndY = surfaceY + D_px + 40
      const extEndX = hitX - (extEndY - surfaceY) * tan2
      ctx.setLineDash([6, 5])
      ctx.strokeStyle = dashColor
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.moveTo(hitX, intY)
      ctx.lineTo(extEndX, extEndY)
      ctx.stroke()
      ctx.setLineDash([])

      ctx.beginPath()
      ctx.arc(objX, objY, 6, 0, Math.PI * 2)
      ctx.fillStyle = arrowColor
      ctx.fill()
      ctx.strokeStyle = isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.15)"
      ctx.lineWidth = 1
      ctx.stroke()
      ctx.fillStyle = arrowColor
      ctx.font = "bold 11px sans-serif"
      ctx.textAlign = "center"
      ctx.fillText("实物", objX, objY + 18)

      if (appD_px > 6 && appY > surfaceY) {
        ctx.setLineDash([4, 4])
        ctx.strokeStyle = "#e74c3c"
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.arc(objX, appY, 8, 0, Math.PI * 2)
        ctx.stroke()
        ctx.setLineDash([])
        ctx.setLineDash([3, 4])
        ctx.strokeStyle = "rgba(231,76,60,0.15)"
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(objX, appY)
        ctx.lineTo(objX, objY)
        ctx.stroke()
        ctx.setLineDash([])
        ctx.fillStyle = "#e74c3c"
        ctx.font = "bold 11px sans-serif"
        ctx.textAlign = "center"
        ctx.fillText("虚像", objX, appY - 12)
      }
      ctx.textAlign = "left"

      ctx.fillStyle = arrowColor
      ctx.strokeStyle = arrowColor
      ctx.lineWidth = 2.5
      ctx.lineCap = "round"
      ctx.lineJoin = "round"

      const headR = 7
      const headCY = eyeY + 5
      ctx.beginPath()
      ctx.arc(eyeX, headCY, headR, 0, Math.PI * 2)
      ctx.stroke()

      const bodyEnd = eyeY + 45
      ctx.beginPath()
      ctx.moveTo(eyeX, headCY + headR)
      ctx.lineTo(eyeX, bodyEnd)
      ctx.stroke()

      const groundY = groundTop
      if (bodyEnd < groundY) {
        ctx.beginPath()
        ctx.moveTo(eyeX, bodyEnd)
        ctx.lineTo(eyeX - 10, groundY)
        ctx.stroke()
        ctx.beginPath()
        ctx.moveTo(eyeX, bodyEnd)
        ctx.lineTo(eyeX + 10, groundY)
        ctx.stroke()
      }

      ctx.beginPath()
      ctx.arc(eyeX, eyeY, 3, 0, Math.PI * 2)
      ctx.fill()

      ctx.fillStyle = labelColor
      ctx.font = "bold 11px sans-serif"
      ctx.textAlign = "center"
      ctx.fillText("人", eyeX, eyeY - 14)
      ctx.textAlign = "left"

      const rulerX = cw * 0.03
      const lineFrom = cw * 0.13
      const lineTo = cw * 0.50

      ctx.strokeStyle = labelColor
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.moveTo(rulerX, surfaceY)
      ctx.lineTo(rulerX + 8, surfaceY)
      ctx.stroke()
      ctx.fillStyle = dimColor
      ctx.font = "10px sans-serif"
      ctx.textAlign = "left"
      ctx.fillText("水面", rulerX + 12, surfaceY + 4)

      ctx.strokeStyle = "rgba(0,0,0,0.08)"
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(rulerX + 4, surfaceY + 2)
      ctx.lineTo(rulerX + 4, objY)
      ctx.stroke()

      ctx.fillStyle = arrowColor
      ctx.font = "bold 12px sans-serif"
      ctx.fillText(`${p.depth} cm`, rulerX + 2, objY + 4)
      ctx.setLineDash([4, 4])
      ctx.strokeStyle = arrowColor
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(lineFrom, objY)
      ctx.lineTo(lineTo, objY)
      ctx.stroke()
      ctx.setLineDash([])

      if (appD_px > 6 && appY > surfaceY) {
        const appDepthVal = p.depth * (cos2 / n1) / cos1
        ctx.fillStyle = "#e74c3c"
        ctx.font = "bold 12px sans-serif"
        ctx.fillText(`${appDepthVal.toFixed(1)} cm`, rulerX + 2, appY + 4)
        ctx.setLineDash([4, 4])
        ctx.strokeStyle = "#e74c3c"
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(lineFrom, appY)
        ctx.lineTo(lineTo, appY)
        ctx.stroke()
        ctx.setLineDash([])
      }

      const arcR2 = 30
      const arcR1 = 25
      if (p.viewAngle > 3) {
        ctx.strokeStyle = labelColor
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.arc(hitX, intY, arcR2, -Math.PI / 2, -Math.PI / 2 + theta2)
        ctx.stroke()
        const la2 = -Math.PI / 2 + theta2 / 2
        ctx.fillStyle = labelColor
        ctx.font = "11px sans-serif"
        ctx.textAlign = "center"
        ctx.fillText(`θ₂=${p.viewAngle}°`, hitX + (arcR2 + 16) * Math.cos(la2),
          intY + (arcR2 + 16) * Math.sin(la2))
      }

      if (theta1 > 0.04) {
        const theta1deg = theta1 * 180 / Math.PI
        ctx.strokeStyle = dimColor
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.arc(hitX, intY, arcR1, Math.PI / 2, Math.PI / 2 + theta1)
        ctx.stroke()
        const la1 = Math.PI / 2 + theta1 / 2
        ctx.fillStyle = dimColor
        ctx.font = "11px sans-serif"
        ctx.textAlign = "center"
        ctx.fillText(`θ₁=${theta1deg.toFixed(1)}°`, hitX + (arcR1 + 16) * Math.cos(la1),
          intY + (arcR1 + 16) * Math.sin(la1))
      }

      ctx.fillStyle = dimColor
      ctx.font = "bold 11px sans-serif"
      ctx.textAlign = "left"
      ctx.fillText(`空气 (n₂=1.0)`, cw * 0.40, surfaceY - 16)
      ctx.fillText(`水 (n₁=${n1.toFixed(2)})`, cw * 0.40, surfaceY + 20)

      ctx.textAlign = "left"
    },
  }
