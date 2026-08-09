// underwater-light 模型数据
export default {
    id: "underwater-light",
    level: "初中",
    category: "光学",
    name: "水下灯光",
    desc: "水下光源射出光线，观察全反射与临界角",
    knowledge: `## 水下灯光

水下光源向水面射出光线——入射角小于临界角的光线能射出水面，大于临界角的被全反射回来。

临界角公式：$\\theta_c = \\arcsin\\frac{n_2}{n_1}$

其中：$n_1$ 是水的折射率（约 1.33），$n_2$ 是空气折射率（1.0），$\\theta_c$ 是临界角（约 48.6°）。

水面以上能被照亮的区域是有限的——以光源正上方为圆心、有一定半径的圆形区域。这就是为什么从水下往上看，只能看到一个"亮洞"，其余全是暗的（全反射）。

光纤通信就是利用全反射——光在光纤里不断全反射，几乎无损失地传播很远。

> 光源越深，水面光斑越大——因为临界角光线到达水面时水平位移更大。`,
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="0" y="8" width="24" height="16" fill="rgba(52,152,219,0.15)"/><line x1="12" y1="20" x2="6" y2="8" stroke="#f1c40f" stroke-width="1.5"/><line x1="12" y1="20" x2="12" y2="8" stroke="#f1c40f" stroke-width="1.5"/><line x1="12" y1="20" x2="18" y2="8" stroke="#f1c40f" stroke-width="1.5"/><circle cx="12" cy="20" r="2" fill="#f1c40f"/></svg>`,
    params: [
      { key: "depth", label: "水深 (cm)", value: 120, min: 30, max: 300, step: 5 },
      { key: "sourcePos", label: "光源水平位置 (%)", value: 35, min: 10, max: 60, step: 1 },
      { key: "refractiveIndex", label: "水折射率 n", value: 1.33, min: 1.05, max: 2.0, step: 0.01 },
    ],
    devNotes: `水下灯光模型的核心是临界角计算和光线簇绘制：

\`\`\`js
const theta_c = Math.asin(n2 / n1)  // 临界角
// 入射角 < 临界角 → 射出
// 入射角 > 临界角 → 全反射
\`\`\`

40 条光线从光源出发，按角度均匀分布。小于临界角的射出水面（暖黄色），大于临界角的被反射（红色虚线）。临界角那条光线特别用红色粗线标出。

墙上照亮区域用渐变色表示，光源用多层 glow 效果。
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
      const n1 = p.refractiveIndex
      const n2 = 1.0
      const theta_c = Math.asin(Math.min(1, n2 / n1))
      const theta_c_deg = theta_c * 180 / Math.PI
      return [
        `水深: ${p.depth} cm`,
        `光源水平位置: ${p.sourcePos}% 池宽`,
        `水折射率: ${n1.toFixed(2)}`,
        `空气折射率: ${n2.toFixed(2)}`,
        `全反射临界角: ${theta_c_deg.toFixed(1)}°`,
        `射出光锥半角: ${theta_c_deg.toFixed(1)}°`,
        `水面光斑理论半径: ${(p.depth * Math.tan(theta_c)).toFixed(0)} cm`,
      ]
    },

    // ── 渲染逻辑 ──
    drawObject: () => {},
    drawExtra: (ctx, s, p, w2s, getTheme) => {
      const isDark = getTheme && getTheme() === "dark"
      const dpr = window.devicePixelRatio || 1
      const cw = ctx.canvas.width / dpr
      const ch = ctx.canvas.height / dpr

      const surfaceY = ch * 0.33
      const D_px = p.depth * 0.5
      const groundLeft = cw * 0.68
      const sourceX = groundLeft * (p.sourcePos / 100)
      const sourceY = surfaceY + D_px
      const wallX = cw * 0.86
      const wallW = 16
      const wallTop = 18

      const n1 = p.refractiveIndex
      const n2 = 1.0
      const theta_c = Math.asin(Math.min(1, n2 / n1))
      const theta_c_deg = theta_c * 180 / Math.PI

      const waterFill = isDark ? "rgba(52,152,219,0.22)" : "rgba(52,152,219,0.12)"
      const waterLine = isDark ? "rgba(52,152,219,0.7)" : "rgba(52,152,219,0.5)"
      const rippleColor = isDark ? "rgba(52,152,219,0.12)" : "rgba(52,152,219,0.06)"
      const landFill = isDark ? "rgba(139,90,43,0.30)" : "rgba(139,90,43,0.10)"
      const landLine = isDark ? "rgba(139,90,43,0.7)" : "rgba(139,90,43,0.4)"
      const wallFill = isDark ? "rgba(180,180,180,0.12)" : "rgba(180,180,180,0.18)"
      const wallLine = isDark ? "rgba(180,180,180,0.4)" : "rgba(180,180,180,0.6)"
      const labelColor = isDark ? "rgba(255,255,255,0.85)" : "rgba(0,0,0,0.7)"
      const dimColor = isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.35)"
      const arrowColor = isDark ? "#eee" : "#333"
      const highlightColor = "#e74c3c"
      const tirColor = isDark ? "rgba(231,76,60,0.5)" : "rgba(231,76,60,0.45)"

      ctx.fillStyle = waterFill
      ctx.fillRect(0, surfaceY, cw, ch - surfaceY)

      ctx.strokeStyle = rippleColor
      ctx.lineWidth = 1
      for (let i = 0; i < 5; i++) {
        const wx = 50 + i * 80
        if (wx + 30 > groundLeft) break
        ctx.beginPath()
        ctx.moveTo(wx, surfaceY + 2)
        ctx.quadraticCurveTo(wx + 15, surfaceY - 5, wx + 30, surfaceY + 2)
        ctx.stroke()
      }

      ctx.fillStyle = landFill
      ctx.fillRect(groundLeft, surfaceY, cw - groundLeft, ch - surfaceY)
      ctx.strokeStyle = landLine
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(groundLeft, surfaceY)
      ctx.lineTo(cw, surfaceY)
      ctx.stroke()

      ctx.strokeStyle = waterLine
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.moveTo(0, surfaceY)
      ctx.lineTo(groundLeft, surfaceY)
      ctx.stroke()

      ctx.fillStyle = wallFill
      ctx.fillRect(wallX, wallTop, wallW, surfaceY - wallTop)
      ctx.strokeStyle = wallLine
      ctx.lineWidth = 1.5
      ctx.strokeRect(wallX, wallTop, wallW, surfaceY - wallTop)

      const numRays = 40
      const maxAngle = Math.min(theta_c + 22 * Math.PI / 180, 82 * Math.PI / 180)
      const escapeRays = []
      const tirRays = []

      for (let i = 0; i <= numRays; i++) {
        const theta = maxAngle * i / numRays
        if (theta < 0.001) continue
        const tanTheta = Math.tan(theta)
        const hitX = sourceX + D_px * tanTheta
        if (hitX > groundLeft) continue

        if (theta < theta_c) {
          const sinPhi = n1 * Math.sin(theta) / n2
          if (sinPhi > 1) continue
          const phi = Math.asin(sinPhi)
          const tanPhi = Math.tan(phi)
          const wallY = surfaceY - (wallX - hitX) / tanPhi
          escapeRays.push({ theta, hitX, phi, wallY, tanTheta })
        } else {
          tirRays.push({ theta, hitX, tanTheta })
        }
      }

      ctx.lineWidth = 1
      for (const r of tirRays) {
        const refLen = Math.min(D_px * 0.6, 80)
        const refX = r.hitX - refLen * Math.sin(r.theta)
        const refY = surfaceY + refLen * Math.cos(r.theta)
        ctx.setLineDash([4, 5])
        ctx.strokeStyle = tirColor
        ctx.beginPath()
        ctx.moveTo(sourceX, sourceY)
        ctx.lineTo(r.hitX, surfaceY)
        ctx.lineTo(refX, refY)
        ctx.stroke()
        ctx.setLineDash([])
      }

      ctx.lineWidth = 1.5
      for (const r of escapeRays) {
        if (r.wallY < wallTop || r.wallY > surfaceY + 20) continue
        const t = Math.max(0, Math.min(1, r.theta / theta_c))
        const alpha = 0.35 + 0.5 * (1 - t * t)
        ctx.strokeStyle = `rgba(241,196,15,${alpha})`
        ctx.beginPath()
        ctx.moveTo(sourceX, sourceY)
        ctx.lineTo(r.hitX, surfaceY)
        ctx.lineTo(wallX, r.wallY)
        ctx.stroke()
      }

      const validHits = escapeRays.filter(r => r.wallY >= wallTop && r.wallY <= surfaceY)
      if (validHits.length > 2) {
        const ys = validHits.map(r => r.wallY)
        const illMin = Math.min(...ys)
        const illMax = Math.max(...ys)
        const illH = illMax - illMin

        const grad = ctx.createLinearGradient(wallX, illMin, wallX, illMax)
        grad.addColorStop(0, "rgba(241,196,15,0.28)")
        grad.addColorStop(0.5, "rgba(241,196,15,0.15)")
        grad.addColorStop(1, "rgba(241,196,15,0.04)")
        ctx.fillStyle = grad
        ctx.fillRect(wallX + 1, illMin, wallW - 2, illH + 1)

        ctx.fillStyle = "#f1c40f"
        ctx.font = "bold 10px sans-serif"
        ctx.textAlign = "left"
        const labelMid = (illMin + illMax) / 2
        if (illH > 30) {
          ctx.fillText("← 照亮区域", wallX + wallW + 5, labelMid + 3)
        }
      }

      for (let r = 28; r >= 6; r -= 3) {
        ctx.beginPath()
        ctx.arc(sourceX, sourceY, r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(241,196,15,${(1 - r / 28) * 0.35})`
        ctx.fill()
      }
      ctx.beginPath()
      ctx.arc(sourceX, sourceY, 7, 0, Math.PI * 2)
      ctx.fillStyle = "#f1c40f"
      ctx.fill()
      ctx.beginPath()
      ctx.arc(sourceX, sourceY, 4, 0, Math.PI * 2)
      ctx.fillStyle = "#fff"
      ctx.fill()

      ctx.fillStyle = arrowColor
      ctx.font = "bold 12px sans-serif"
      ctx.textAlign = "center"
      ctx.fillText("光源", sourceX, sourceY + 20)

      if (theta_c_deg > 2) {
        const hitX_c = sourceX + D_px * Math.tan(theta_c)

        if (hitX_c <= groundLeft) {
          ctx.strokeStyle = highlightColor
          ctx.lineWidth = 3
          ctx.beginPath()
          ctx.moveTo(sourceX, sourceY)
          ctx.lineTo(hitX_c, surfaceY)
          ctx.stroke()

          ctx.setLineDash([5, 4])
          ctx.strokeStyle = "rgba(231,76,60,0.35)"
          ctx.lineWidth = 1.5
          ctx.beginPath()
          ctx.moveTo(hitX_c, surfaceY)
          ctx.lineTo(cw, surfaceY)
          ctx.stroke()
          ctx.setLineDash([])

          const midX = (sourceX + hitX_c) / 2
          const midY = (sourceY + surfaceY) / 2
          ctx.fillStyle = highlightColor
          ctx.font = "bold 11px sans-serif"
          ctx.textAlign = "center"
          ctx.fillText(`θ_c = ${theta_c_deg.toFixed(1)}°`, midX - 38, midY + 5)
        }
      }

      if (tirRays.length > 0) {
        const midIdx = Math.floor(tirRays.length / 2)
        const r = tirRays[midIdx]
        const labelX = (sourceX + r.hitX) / 2
        const labelY = (sourceY + surfaceY) / 2
        ctx.fillStyle = tirColor
        ctx.font = "10px sans-serif"
        ctx.textAlign = "center"
        ctx.fillText("全反射", labelX + 50, labelY + 4)
      }

      const rulerX = cw * 0.03

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
      ctx.lineTo(rulerX + 4, sourceY)
      ctx.stroke()

      ctx.fillStyle = arrowColor
      ctx.font = "bold 12px sans-serif"
      ctx.fillText(`${p.depth} cm`, rulerX + 2, sourceY + 4)

      ctx.fillStyle = dimColor
      ctx.font = "bold 12px sans-serif"
      ctx.textAlign = "left"
      ctx.fillText(`水 (n₁ = ${n1.toFixed(2)})`, cw * 0.39, surfaceY + 22)
      ctx.fillText(`空气 (n₂ = 1.00)`, cw * 0.39, surfaceY - 14)

      ctx.fillStyle = labelColor
      ctx.font = "bold 11px sans-serif"
      ctx.textAlign = "center"
      ctx.fillText("墙", wallX + wallW / 2, wallTop + 14)

      ctx.fillStyle = dimColor
      ctx.font = "10px sans-serif"
      ctx.textAlign = "right"
      const maxRadius = D_px * Math.tan(theta_c)
      ctx.fillText(`水面光斑半径 ≈ ${maxRadius.toFixed(0)} px | 临界角 ${theta_c_deg.toFixed(1)}°`, cw - 12, ch - 10)

      ctx.textAlign = "left"
    },
  }
