// plane-mirror 模型数据
export default {
    id: "plane-mirror",
    level: "初中",
    category: "光学",
    name: "平面镜成像",
    desc: "物体和平面镜中的像关于镜面对称",
    knowledge: `## 平面镜成像

平面镜成像的核心是“对称”。物体在镜前多远，像就在镜后多远。

- 像距 = 物距
- 像和物大小相等
- 像和物连线垂直镜面
- 平面镜成正立、等大的虚像

其中：物距是物体到镜面的距离，像距是像到镜面的距离。虚像不是光线真的会聚在那里，而是反射光线的反向延长线看起来从那里发出。

这个地方很适合画辅助线：真实光线在镜面反射，反向延长线交到镜后，就得到虚像位置。

这里容易看错的是“左右相反”。更准确地说，是物和像关于镜面对称，不是简单地把整个世界左右翻一下。

> 改变物距，观察虚像始终在镜后同样远的位置。`,
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="3" x2="12" y2="21"/><path d="M6 8v8"/><path d="M18 8v8" stroke-dasharray="3 3"/><path d="M6 10l6-2 6 2"/></svg>`,
    params: [
      { key: "objectDist", label: "物距 (cm)", value: 30, min: 8, max: 70, step: 2 },
      { key: "objectHeight", label: "物高 (cm)", value: 10, min: 4, max: 20, step: 1 },
      { key: "rayAngle", label: "入射点高度 (cm)", value: 8, min: -15, max: 18, step: 1 },
      { key: "showRays", label: "显示光线", value: 1, options: [{ label: "开", value: 1 }, { label: "关", value: 0 }] },
    ],

    // ── 物理逻辑 ──
    createState: (p) => ({ _t: 0, trail: [], imageDist: p.objectDist }),
    step: (s, p, dt) => {
      s._t += dt
      s.imageDist = p.objectDist
    },
    isFinished: () => false,
    getBallPosition: () => null,
    getTrailPosition: () => null,
    trailFields: () => null,
    chartDefs: [],
    getInfoLines: (s, p, t) => [
      `物距: ${p.objectDist} cm`,
      `像距: ${p.objectDist} cm`,
      `物高: ${p.objectHeight} cm`,
      `像高: ${p.objectHeight} cm`,
      `成像性质: 正立、等大、虚像`,
      `位置关系: 物和像关于镜面对称`,
      `时间: ${t.toFixed(2)} s`,
    ],

    // ── 渲染逻辑 ──
    drawObject: () => {},
    drawExtra: (ctx, s, p, w2s, getTheme) => {
      const isDark = getTheme && getTheme() === "dark"
      const dpr = window.devicePixelRatio || 1
      const cw = ctx.canvas.width / dpr
      const ch = ctx.canvas.height / dpr
      const cx = cw / 2
      const cy = ch / 2 + 35
      const scale = Math.min(5.5, cw / 170)
      const toScreen = (x, y) => ({ x: cx + x * scale, y: cy - y * scale })

      const mirrorTop = toScreen(0, 32)
      const mirrorBot = toScreen(0, -28)
      ctx.strokeStyle = "#3498db"
      ctx.lineWidth = 4
      ctx.beginPath()
      ctx.moveTo(mirrorTop.x, mirrorTop.y)
      ctx.lineTo(mirrorBot.x, mirrorBot.y)
      ctx.stroke()
      ctx.strokeStyle = isDark ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.2)"
      ctx.lineWidth = 1
      for (let y = -26; y <= 30; y += 6) {
        const a = toScreen(0, y)
        ctx.beginPath()
        ctx.moveTo(a.x, a.y)
        ctx.lineTo(a.x + 12, a.y - 10)
        ctx.stroke()
      }

      const objX = -p.objectDist
      const imgX = p.objectDist
      const h = p.objectHeight
      const objBottom = toScreen(objX, 0)
      const objTop = toScreen(objX, h)
      const imgBottom = toScreen(imgX, 0)
      const imgTop = toScreen(imgX, h)

      const drawPerson = (bottom, top, color, dashed = false) => {
        ctx.save()
        if (dashed) ctx.setLineDash([6, 4])
        ctx.strokeStyle = color
        ctx.fillStyle = color
        ctx.lineWidth = 3
        ctx.beginPath()
        ctx.moveTo(bottom.x, bottom.y)
        ctx.lineTo(top.x, top.y + 12)
        ctx.stroke()
        ctx.beginPath()
        ctx.arc(top.x, top.y + 6, 6, 0, Math.PI * 2)
        ctx.stroke()
        ctx.beginPath()
        ctx.moveTo(top.x, top.y + 20)
        ctx.lineTo(top.x - 10, top.y + 32)
        ctx.moveTo(top.x, top.y + 20)
        ctx.lineTo(top.x + 10, top.y + 32)
        ctx.moveTo(bottom.x, bottom.y)
        ctx.lineTo(bottom.x - 8, bottom.y + 16)
        ctx.moveTo(bottom.x, bottom.y)
        ctx.lineTo(bottom.x + 8, bottom.y + 16)
        ctx.stroke()
        ctx.restore()
      }
      drawPerson(objBottom, objTop, "#e74c3c")
      drawPerson(imgBottom, imgTop, "rgba(46, 204, 113, 0.62)", true)

      ctx.strokeStyle = isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.18)"
      ctx.setLineDash([5, 5])
      ctx.beginPath()
      ctx.moveTo(objTop.x, objTop.y)
      ctx.lineTo(imgTop.x, imgTop.y)
      ctx.stroke()
      ctx.setLineDash([])

      if (p.showRays) {
        const source = objTop
        const image = imgTop
        const hit1 = toScreen(0, p.rayAngle)
        const hit2 = toScreen(0, -p.rayAngle * 0.45)
        ;[hit1, hit2].forEach(hit => {
          ctx.strokeStyle = "#f39c12"
          ctx.lineWidth = 2
          ctx.beginPath()
          ctx.moveTo(source.x, source.y)
          ctx.lineTo(hit.x, hit.y)
          const outX = hit.x - (image.x - hit.x)
          const outY = hit.y - (image.y - hit.y)
          ctx.lineTo(outX, outY)
          ctx.stroke()
          ctx.strokeStyle = "rgba(46, 204, 113, 0.55)"
          ctx.setLineDash([5, 4])
          ctx.beginPath()
          ctx.moveTo(hit.x, hit.y)
          ctx.lineTo(image.x, image.y)
          ctx.stroke()
          ctx.setLineDash([])
        })
      }

      ctx.fillStyle = isDark ? "#ddd" : "#333"
      ctx.font = "bold 13px sans-serif"
      ctx.textAlign = "center"
      ctx.fillText("物", objTop.x, objTop.y - 12)
      ctx.fillText("虚像", imgTop.x, imgTop.y - 12)
      ctx.fillText("平面镜", cx + 36, mirrorTop.y + 12)
      ctx.font = "12px sans-serif"
      ctx.fillText(`物距=${p.objectDist}cm`, (objBottom.x + cx) / 2, cy + 28)
      ctx.fillText(`像距=${p.objectDist}cm`, (imgBottom.x + cx) / 2, cy + 28)
    },
  }
