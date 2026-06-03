// concave-lens 模型数据
export default {
    id: "concave-lens",
    level: "初中",
    category: "光学",
    name: "凹透镜成像",
    desc: "凹透镜始终成正立缩小的虚像",
    knowledge: `## 凹透镜成像

凹透镜比凸透镜简单多了——不管物距多少，永远成**正立、缩小、虚像**。

公式跟凸透镜一样，但焦距 $f < 0$（虚焦点）：
$$\\frac{1}{f} = \\frac{1}{u} + \\frac{1}{v}$$

其中：$f$ 是焦距（凹透镜为负值），$u$ 是物距，$v$ 是像距（始终为负，表示虚像）。

跟凸透镜对比：凸透镜会聚、凹透镜发散；凸透镜可实可虚、凹透镜只能虚像。近视眼镜就是凹透镜。

三条特殊光线：平行光轴的折射反向延长线过焦点，过光心不变，射向焦点的折射平行光轴。

> 凹透镜的像永远在物体同侧、焦点以内——记住这个就够了。`,
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="12" rx="3" ry="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M6 6l-2-2M6 18l-2 2M18 6l2-2M18 18l2 2"/></svg>`,
    params: [
      { key: "focalLength", label: "焦距 |f| (cm)", value: 10, min: 3, max: 20, step: 1 },
      { key: "objectDist", label: "物距 u (cm)", value: 30, min: 3, max: 60, step: 1 },
      { key: "objectHeight", label: "物高 (cm)", value: 4, min: 1, max: 8, step: 0.5 },
      { key: "showRays", label: "显示光线", value: 1, min: 0, max: 1, step: 1 },
    ],
    devNotes: `跟凸透镜几乎一样，就是焦距取负：

\`\`\`js
f = -p.focalLength
v = (f * u) / (u - f)
\`\`\`

输入焦距取绝对值，计算时取负。虚像用虚线表示。

比凸透镜简单——不用处理各种成像情况，永远是"正立、缩小、虚像"。
`,

    // ── 物理逻辑 ──
    createState: (p) => ({ _t: 0, trail: [] }),
    step: (s, p, dt) => { s._t += dt },
    isFinished: () => false,
    getBallPosition: () => null,
    getTrailPosition: () => null,
    trailFields: () => null,
    chartDefs: [],
    getInfoLines: (s, p) => {
      const f = -p.focalLength
      const u = p.objectDist
      const h = p.objectHeight
      const v = (f * u) / (u - f)
      const absV = Math.abs(v)
      const magnification = absV / u
      const imageH = h * magnification
      return [
        `焦距: f = ${f} cm（凹透镜）`,
        `物距: u = ${u} cm`,
        `像距: |v| = ${absV.toFixed(1)} cm（同侧）`,
        `物高: ${h} cm  像高: ${imageH.toFixed(1)} cm`,
        `放大率: ${magnification.toFixed(2)}×`,
        `正立、缩小、虚像`,
      ]
    },

    // ── 渲染逻辑 ──
    drawObject: () => {},
    drawExtra: (ctx, s, p, w2s, getTheme) => {
      const isDark = getTheme() === "dark"
      const axisColor = isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.2)"
      const labelColor = isDark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.6)"
      const f = p.focalLength
      const u = p.objectDist
      const h = p.objectHeight
      const v = (-f * u) / (u + f)
      const absV = Math.abs(v)
      const magnification = absV / u
      const imageH = h * magnification

      const canvasW = ctx.canvas.width / (window.devicePixelRatio || 1)
      const canvasH = ctx.canvas.height / (window.devicePixelRatio || 1)
      const cx = canvasW / 2
      const cy = canvasH / 2
      const scale = 6

      const toScreen = (x, y) => ({ x: cx + x * scale, y: cy - y * scale })

      ctx.strokeStyle = axisColor
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(20, cy)
      ctx.lineTo(canvasW - 20, cy)
      ctx.stroke()

      const lensH = 80
      const edgeW = 15
      const midW = 3
      ctx.strokeStyle = "#9b59b6"
      ctx.lineWidth = 2.5
      ctx.beginPath()
      ctx.moveTo(cx - edgeW, cy - lensH)
      ctx.quadraticCurveTo(cx - midW, cy, cx - edgeW, cy + lensH)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(cx + edgeW, cy - lensH)
      ctx.quadraticCurveTo(cx + midW, cy, cx + edgeW, cy + lensH)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(cx - edgeW, cy - lensH)
      ctx.lineTo(cx + edgeW, cy - lensH)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(cx - edgeW, cy + lensH)
      ctx.lineTo(cx + edgeW, cy + lensH)
      ctx.stroke()
      ctx.fillStyle = "#9b59b6"
      ctx.beginPath()
      ctx.moveTo(cx, cy - lensH - 2)
      ctx.lineTo(cx - 5, cy - lensH + 6)
      ctx.lineTo(cx + 5, cy - lensH + 6)
      ctx.closePath()
      ctx.fill()
      ctx.beginPath()
      ctx.moveTo(cx, cy + lensH + 2)
      ctx.lineTo(cx - 5, cy + lensH - 6)
      ctx.lineTo(cx + 5, cy + lensH - 6)
      ctx.closePath()
      ctx.fill()
      ctx.fillStyle = labelColor
      ctx.font = "bold 11px sans-serif"
      ctx.textAlign = "left"
      ctx.fillText("O", cx + 10, cy + 16)

      const markPoint = (x, label, yOff) => {
        const pt = toScreen(x, 0)
        ctx.strokeStyle = "#e74c3c"
        ctx.lineWidth = 1.5
        ctx.beginPath()
        ctx.arc(pt.x, pt.y, 3.5, 0, Math.PI * 2)
        ctx.stroke()
        ctx.fillStyle = labelColor
        ctx.font = "bold 11px sans-serif"
        ctx.textAlign = "center"
        ctx.fillText(label, pt.x, pt.y + yOff)
      }
      markPoint(-f, "F", 20)
      markPoint(-2 * f, "2F", 20)
      markPoint(f, "F", 20)
      markPoint(2 * f, "2F", 20)

      const objX = -u
      const objTop = toScreen(objX, h)
      const objBottom = toScreen(objX, 0)
      ctx.strokeStyle = "#e74c3c"
      ctx.lineWidth = 2.5
      ctx.beginPath()
      ctx.moveTo(objBottom.x, objBottom.y)
      ctx.lineTo(objTop.x, objTop.y)
      ctx.stroke()
      ctx.fillStyle = "#e74c3c"
      ctx.beginPath()
      ctx.moveTo(objTop.x, objTop.y)
      ctx.lineTo(objTop.x - 5, objTop.y + 10)
      ctx.lineTo(objTop.x + 5, objTop.y + 10)
      ctx.closePath()
      ctx.fill()
      ctx.fillStyle = "#e74c3c"
      ctx.font = "bold 11px sans-serif"
      ctx.textAlign = "center"
      ctx.fillText("物体", objTop.x, objTop.y - 8)
      ctx.fillText(`u=${u}cm`, objBottom.x, objBottom.y + 16)

      if (p.showRays >= 0.5) {
        const t = s._t || 0
        const segLen = (a, b) => Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2)
        const totalLen = (pts) => { let d = 0; for (let i = 1; i < pts.length; i++) d += segLen(pts[i - 1], pts[i]); return d }
        const pointAt = (pts, ratio) => {
          const target = ratio * totalLen(pts)
          let d = 0
          for (let i = 1; i < pts.length; i++) {
            const seg = segLen(pts[i - 1], pts[i])
            if (d + seg >= target) {
              const local = (target - d) / seg
              return { x: pts[i - 1].x + (pts[i].x - pts[i - 1].x) * local, y: pts[i - 1].y + (pts[i].y - pts[i - 1].y) * local }
            }
            d += seg
          }
          return pts[pts.length - 1]
        }
        const drawArrow = (pts, color) => {
          const len = totalLen(pts)
          const count = Math.max(1, Math.floor(len / 120))
          for (let i = 1; i <= count; i++) {
            const ratio = i / (count + 1)
            const p1 = pointAt(pts, Math.max(0, ratio - 0.02))
            const p2 = pointAt(pts, ratio)
            const dx = p2.x - p1.x, dy = p2.y - p1.y
            const a = Math.atan2(dy, dx)
            ctx.fillStyle = color
            ctx.beginPath()
            ctx.moveTo(p2.x, p2.y)
            ctx.lineTo(p2.x - 7 * Math.cos(a - 0.4), p2.y - 7 * Math.sin(a - 0.4))
            ctx.lineTo(p2.x - 7 * Math.cos(a + 0.4), p2.y - 7 * Math.sin(a + 0.4))
            ctx.closePath()
            ctx.fill()
          }
        }
        const drawRayFull = (realPts, extPts, color, animDelay) => {
          const progress = Math.min(1, Math.max(0, (t - animDelay) / 0.8))
          ctx.strokeStyle = color
          ctx.globalAlpha = 0.5
          ctx.lineWidth = 1.5
          ctx.beginPath()
          realPts.forEach((pt, i) => { const s2 = toScreen(pt.x, pt.y); if (i === 0) ctx.moveTo(s2.x, s2.y); else ctx.lineTo(s2.x, s2.y) })
          ctx.stroke()
          if (extPts && extPts.length > 0) {
            ctx.globalAlpha = 0.25
            ctx.setLineDash([4, 3])
            ctx.beginPath()
            extPts.forEach((pt, i) => { const s2 = toScreen(pt.x, pt.y); if (i === 0) ctx.moveTo(s2.x, s2.y); else ctx.lineTo(s2.x, s2.y) })
            ctx.stroke()
            ctx.setLineDash([])
          }
          const allPts = [...realPts, ...(extPts || [])]
          if (progress > 0 && progress < 1) {
            const pos = pointAt(allPts.map(p => toScreen(p.x, p.y)), progress)
            ctx.fillStyle = color
            ctx.globalAlpha = 0.9
            ctx.beginPath()
            ctx.arc(pos.x, pos.y, 5, 0, Math.PI * 2)
            ctx.fill()
            ctx.globalAlpha = 0.2
            ctx.beginPath()
            ctx.arc(pos.x, pos.y, 12, 0, Math.PI * 2)
            ctx.fill()
          }
          ctx.globalAlpha = 1
          drawArrow(allPts.map(p => toScreen(p.x, p.y)), color)
        }

        const divergeX = 40
        const slope1 = h / f
        const divergeY = h + slope1 * divergeX
        drawRayFull(
          [{ x: objX, y: h }, { x: 0, y: h }, { x: divergeX, y: divergeY }],
          [{ x: 0, y: h }, { x: -f, y: 0 }],
          "#e74c3c", 0
        )

        const slope2 = -h / u
        const lineEndX = 40
        const lineEndY = slope2 * lineEndX
        drawRayFull(
          [{ x: objX, y: h }, { x: 0, y: 0 }, { x: lineEndX, y: lineEndY }],
          null,
          "#f39c12", 0.3
        )
      }

      const imgX = v
      const imgTop = toScreen(imgX, imageH)
      const imgBottom = toScreen(imgX, 0)
      ctx.strokeStyle = "rgba(46, 204, 113, 0.6)"
      ctx.lineWidth = 2
      ctx.setLineDash([6, 4])
      ctx.beginPath()
      ctx.moveTo(imgBottom.x, imgBottom.y)
      ctx.lineTo(imgTop.x, imgTop.y)
      ctx.stroke()
      ctx.setLineDash([])
      ctx.fillStyle = "rgba(46, 204, 113, 0.6)"
      ctx.beginPath()
      ctx.moveTo(imgTop.x, imgTop.y)
      ctx.lineTo(imgTop.x - 5, imgTop.y + 10)
      ctx.lineTo(imgTop.x + 5, imgTop.y + 10)
      ctx.closePath()
      ctx.fill()
      ctx.fillStyle = "#2ecc71"
      ctx.font = "bold 11px sans-serif"
      ctx.textAlign = "center"
      ctx.fillText("虚像", imgTop.x, imgTop.y - 8)
      ctx.fillText(`|v|=${absV.toFixed(1)}cm`, imgBottom.x, imgBottom.y + 16)

      ctx.textAlign = "left"
    },
  }
