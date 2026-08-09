// convex-lens 模型数据
export default {
    id: "convex-lens",
    level: "初中",
    category: "光学",
    name: "凸透镜成像",
    desc: "物距与像距的关系，观察实像与虚像",
    knowledge: `## 凸透镜成像

薄透镜公式：
$$\\frac{1}{f} = \\frac{1}{u} + \\frac{1}{v}$$

其中：$f$ 是焦距，$u$ 是物距（物体到透镜的距离），$v$ 是像距（像到透镜的距离，实像为正、虚像为负）。

成像规律表要背下来：
- $u > 2f$：倒立缩小实像（照相机）
- $u = 2f$：倒立等大实像（测焦距）
- $f < u < 2f$：倒立放大实像（投影仪）
- $u = f$：不成像（平行光源）
- $u < f$：正立放大虚像（放大镜）

口诀：**一倍焦距分虚实，二倍焦距分大小**。

三条特殊光线：平行光轴折射过焦点，过光心方向不变，过焦点折射平行光轴。

物距等于焦距时像"消失"了（在无穷远），小于焦距时变成正立放大虚像——这就是放大镜原理。

> 一倍焦距分虚实，二倍焦距分大小——记住这个口诀做题快很多。`,
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="12" rx="3" ry="10"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="12" y1="2" x2="12" y2="22"/></svg>`,
    params: [
      { key: "focalLength", label: "焦距 f (cm)", value: 10, min: 3, max: 20, step: 1 },
      { key: "objectDist", label: "物距 u (cm)", value: 30, min: 3, max: 60, step: 1 },
      { key: "objectHeight", label: "物高 (cm)", value: 4, min: 1, max: 8, step: 0.5 },
      { key: "showRays", label: "显示光线", value: 1, min: 0, max: 1, step: 1 },
    ],
    devNotes: `薄透镜公式直接算：

\`\`\`js
v = (f * u) / (u - f)
magnification = Math.abs(v) / u
imageH = h * magnification
\`\`\`

u ≈ f 时像距趋近无穷大，要特殊处理——不然数值爆炸。

三条特殊光线的绘制在 renderer 里，物理逻辑只管算像距和像高。虚像用 v < 0 判断。
`,

    // ── 物理逻辑 ──
    createState: (p) => {
      const f = p.focalLength
      const u = p.objectDist
      let v = null
      let isVirtual = false
      if (Math.abs(u - f) < 0.01) {
        v = Infinity
      } else {
        v = (f * u) / (u - f)
        isVirtual = v < 0
      }
      return { _t: 0, trail: [], v, isVirtual }
    },
    step: (s, p, dt) => {
      s._t += dt
      const f = p.focalLength
      const u = p.objectDist
      if (Math.abs(u - f) < 0.01) {
        s.v = Infinity
        s.isVirtual = false
      } else {
        s.v = (f * u) / (u - f)
        s.isVirtual = s.v < 0
      }
    },
    isFinished: () => false,
    getBallPosition: () => null,
    getTrailPosition: () => null,
    trailFields: () => null,
    chartDefs: [],
    getInfoLines: (s, p) => {
      const f = p.focalLength
      const u = p.objectDist
      const h = p.objectHeight
      if (Math.abs(u - f) < 0.01) {
        return [
          `焦距: f = ${f} cm`,
          `物距: u = ${u} cm (= f，不成像)`,
          `物高: ${h} cm`,
          `⚠ 物体在焦点上，折射光线平行`,
        ]
      }
      const v = s.v
      const isVirtual = s.isVirtual
      const absV = Math.abs(v)
      const magnification = absV / u
      const imageH = h * magnification
      let desc = ""
      if (isVirtual) {
        desc = "正立、放大、虚像（同侧）"
      } else if (u > 2 * f) {
        desc = "倒立、缩小、实像（异侧）"
      } else if (Math.abs(u - 2 * f) < 0.01) {
        desc = "倒立、等大、实像（异侧）"
      } else {
        desc = "倒立、放大、实像（异侧）"
      }
      return [
        `焦距: f = ${f} cm`,
        `物距: u = ${u} cm`,
        `像距: ${isVirtual ? "" : "v = "}${isVirtual ? "|v| = " : ""}${absV.toFixed(1)} cm`,
        `物高: ${h} cm  像高: ${imageH.toFixed(1)} cm`,
        `放大率: ${magnification.toFixed(2)}×`,
        `${desc}`,
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
      let v, isVirtual
      if (Math.abs(u - f) < 0.01) {
        v = Infinity; isVirtual = false
      } else {
        v = (f * u) / (u - f)
        isVirtual = v < 0
      }
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
      ctx.strokeStyle = "#3498db"
      ctx.lineWidth = 2.5
      ctx.beginPath()
      ctx.ellipse(cx, cy, 6, lensH, 0, 0, Math.PI * 2)
      ctx.stroke()
      ctx.fillStyle = "#3498db"
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
        ctx.fillStyle = "#e74c3c"
        ctx.beginPath()
        ctx.arc(pt.x, pt.y, 3.5, 0, Math.PI * 2)
        ctx.fill()
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

      if (Math.abs(u - f) < 0.01) {
        ctx.fillStyle = isDark ? "rgba(255,200,0,0.8)" : "rgba(200,150,0,0.8)"
        ctx.font = "bold 12px sans-serif"
        ctx.textAlign = "center"
        ctx.fillText("物体在焦点上，折射光线平行，不成像", cx, cy - lensH - 20)
      } else {
        const absV = Math.abs(v)
        const magnification = absV / u
        const imageH = h * magnification
        const imgX = isVirtual ? -absV : absV
        const imgTop = toScreen(imgX, isVirtual ? imageH : -imageH)
        const imgBottom = toScreen(imgX, 0)

        if (isVirtual) {
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
        } else {
          ctx.strokeStyle = "#3498db"
          ctx.lineWidth = 2.5
          ctx.beginPath()
          ctx.moveTo(imgBottom.x, imgBottom.y)
          ctx.lineTo(imgTop.x, imgTop.y)
          ctx.stroke()
          ctx.fillStyle = "#3498db"
          ctx.beginPath()
          ctx.moveTo(imgTop.x, imgTop.y)
          ctx.lineTo(imgTop.x - 5, imgTop.y - 10)
          ctx.lineTo(imgTop.x + 5, imgTop.y - 10)
          ctx.closePath()
          ctx.fill()
          ctx.fillStyle = "#3498db"
          ctx.font = "bold 11px sans-serif"
          ctx.textAlign = "center"
          ctx.fillText("实像", imgTop.x, imgTop.y + 16)
          ctx.fillText(`v=${absV.toFixed(1)}cm`, imgBottom.x, imgBottom.y - 8)
        }
      }

      if (p.showRays >= 0.5 && Math.abs(u - f) >= 0.01) {
        const absV = Math.abs(v)
        const magnification = absV / u
        const imageH = h * magnification
        const imgX = isVirtual ? -absV : absV
        const imgY = isVirtual ? imageH : -imageH
        const t = s._t || 0

        const segLen = (a, b) => Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2)
        const totalLen = (pts) => {
          let d = 0
          for (let i = 1; i < pts.length; i++) d += segLen(pts[i - 1], pts[i])
          return d
        }
        const pointAt = (pts, ratio) => {
          const target = ratio * totalLen(pts)
          let d = 0
          for (let i = 1; i < pts.length; i++) {
            const seg = segLen(pts[i - 1], pts[i])
            if (d + seg >= target) {
              const local = (target - d) / seg
              return {
                x: pts[i - 1].x + (pts[i].x - pts[i - 1].x) * local,
                y: pts[i - 1].y + (pts[i].y - pts[i - 1].y) * local,
              }
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

        const rayAlpha = 0.4
        const drawRay = (points, color, animDelay, extPoints) => {
          const progress = Math.min(1, Math.max(0, (t - animDelay) / 0.8))
          ctx.strokeStyle = color
          ctx.globalAlpha = rayAlpha
          ctx.lineWidth = 1.5
          ctx.beginPath()
          points.forEach((pt, i) => {
            const s2 = toScreen(pt.x, pt.y)
            if (i === 0) ctx.moveTo(s2.x, s2.y); else ctx.lineTo(s2.x, s2.y)
          })
          ctx.stroke()
          if (extPoints && extPoints.length > 0) {
            ctx.globalAlpha = rayAlpha * 0.6
            ctx.setLineDash([4, 3])
            ctx.beginPath()
            extPoints.forEach((pt, i) => {
              const s2 = toScreen(pt.x, pt.y)
              if (i === 0) ctx.moveTo(s2.x, s2.y); else ctx.lineTo(s2.x, s2.y)
            })
            ctx.stroke()
            ctx.setLineDash([])
          }
          if (progress > 0 && progress < 1) {
            const pos = pointAt(points.map(p => toScreen(p.x, p.y)), progress)
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
          drawArrow(points.map(p => toScreen(p.x, p.y)), color)
        }

        const objX = -u

        if (isVirtual) {
          const farX = Math.max(f * 4, u * 3, 60)
          drawRay([
            { x: objX, y: h },
            { x: 0, y: h },
            { x: f, y: 0 },
            { x: farX, y: -h * (farX - f) / f },
          ], "#e74c3c", 0, [
            { x: 0, y: h },
            { x: imgX, y: imgY },
          ])

          drawRay([
            { x: objX, y: h },
            { x: 0, y: 0 },
            { x: farX, y: -h * farX / u },
          ], "#f39c12", 0.3, [
            { x: 0, y: 0 },
            { x: imgX, y: imgY },
          ])
        } else {
          drawRay([
            { x: objX, y: h },
            { x: 0, y: h },
            { x: imgX, y: imgY },
          ], "#e74c3c", 0)

          drawRay([
            { x: objX, y: h },
            { x: imgX, y: imgY },
          ], "#f39c12", 0.3)
        }
      }

      ctx.textAlign = "left"
    },
  }
