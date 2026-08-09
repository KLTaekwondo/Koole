// boat-river 模型数据
export default {
    id: "boat-river",
    level: "高中",
    category: "力学",
    name: "小船过河",
    desc: "小船在流水中的运动，合速度与渡河路径",
    knowledge: `## 小船过河

运动合成的经典问题。船速是船相对水的速度，水速是水相对岸的速度，合成才是船的实际运动。

速度分解：过河方向 $v_y = v_{船}\\cos\\theta$，顺流方向 $v_x = v_{船}\\sin\\theta + v_{水}$。

其中：$v_{船}$ 是船相对水的速度，$v_{水}$ 是水流速度，$\\theta$ 是船头与垂直河岸方向的偏角，$d$ 是河宽，$v_x$/$v_y$ 是实际运动的水平/垂直分速度。

两种典型问题要分清：
- **最短时间**：船头直指对岸（$\\theta=0°$），$t_{min} = \\frac{d}{v_{船}}$
- **最短路径**：船头偏向上游，$\\sin\\theta = \\frac{v_{水}}{v_{船}}$（前提 $v_{船} > v_{水}$）

容易搞混的地方：过河时间只看垂直河岸的速度分量，水速完全不影响过河时间！最短时间和最短路径是两回事，策略完全不同。船速 ≤ 水速时就没法垂直过河了。

> 偏角调成负值（偏向上游），船的路径变直——这就是最短路径策略。`,
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="18" x2="20" y2="18"/><polygon points="10 18 14 18 12 12"/><path d="M6 13 Q9 11 12 13 Q15 15 18 13" opacity="0.35" stroke-width="1.5"/></svg>`,
    params: [
      { key: "riverWidth", label: "河宽 (m)", value: 30, min: 8, max: 60, step: 1 },
      { key: "boatSpeed", label: "船速 (m/s)", value: 4, min: 1, max: 10, step: 0.5 },
      { key: "currentSpeed", label: "水流速度 (m/s)", value: 2, min: 0, max: 8, step: 0.5 },
      { key: "headingAngle", label: "船头偏角 (°)", value: 0, min: -60, max: 60, step: 1 },
    ],
    devNotes: `小船过河的物理不难，但偏角定义让我纠结了一会——最后选了"与垂直方向的夹角"，负值偏向上游，比较符合直觉。

\`\`\`js
vx = boatSpeed * sin(theta) + currentSpeed
vy = boatSpeed * cos(theta)
\`\`\`

船速 ≤ 水速时没法垂直过河，这种情况要处理好——显示"无法到达正对岸"的提示。

最短路径角 \`sin(θ) = v水/v船\` 实时计算并显示出来，用户可以直接看到理论最优角度。渡河进度百分比和下游偏移量也实时显示，帮助理解水速的影响。
`,

    // ── 物理逻辑 ──
    createState: (p) => ({ x: 0, y: 0, riverWidth: p.riverWidth, trail: [], _t: 0 }),
    step: (s, p, dt) => {
      if (s.y >= s.riverWidth) return
      const theta = p.headingAngle * Math.PI / 180
      s.x += (p.boatSpeed * Math.sin(theta) + p.currentSpeed) * dt
      s.y += p.boatSpeed * Math.cos(theta) * dt
      s._t += dt
      if (s.y >= s.riverWidth) s.y = s.riverWidth
    },
    isFinished: (s) => s.y >= s.riverWidth,
    getBallPosition: (s) => ({ x: s.x, y: s.y }),
    getTrailPosition: (s) => ({ x: s.x, y: s.y }),
    trailFields: (s) => ({ t: s._t }),
    chartDefs: [
      { title: "轨迹图", xLabel: "x (m)", yLabel: "y (m)", getData: (trail) => [{ name: "轨迹", data: trail.map(p => [p.x, p.y]) }] },
    ],
    getInfoLines: (s, p, t) => {
      const theta = p.headingAngle * Math.PI / 180
      const vx = p.boatSpeed * Math.sin(theta) + p.currentSpeed
      const vy = p.boatSpeed * Math.cos(theta)
      const remainingTime = vy > 0.01 ? (p.riverWidth - s.y) / vy : Infinity
      let minAngleInfo = ""
      if (p.boatSpeed > p.currentSpeed) {
        minAngleInfo = `最小偏移角: ${(-Math.asin(p.currentSpeed / p.boatSpeed) * 180 / Math.PI).toFixed(1)}°`
      }
      return [
        `渡河进度: ${Math.min(s.y / p.riverWidth * 100, 100).toFixed(0)}%`,
        `下游偏移: ${s.x.toFixed(1)} m`,
        `过河速度: ${vy.toFixed(2)} m/s`,
        `合速度: ${Math.sqrt(vx * vx + vy * vy).toFixed(2)} m/s`,
        `${vy > 0.01 ? "预计剩余: " + remainingTime.toFixed(2) + " s" : "无法到达对岸"}`,
        minAngleInfo,
      ].filter(Boolean)
    },

    // ── 渲染逻辑 ──
    drawObject: () => {},
    drawExtra: (ctx, s, p, w2s) => {
      const canvas = ctx.canvas
      const dpr = window.devicePixelRatio || 1
      const cw = canvas.width / dpr
      const ch = canvas.height / dpr
      const farPt = w2s(0, p.riverWidth)
      const nearPt = w2s(0, 0)
      ctx.fillStyle = "rgba(52, 152, 219, 0.08)"
      ctx.fillRect(0, 0, cw, ch)
      if (farPt.y > 0) {
        ctx.fillStyle = "#2c3e50"
        ctx.fillRect(0, 0, cw, farPt.y)
      }
      ctx.beginPath()
      ctx.moveTo(0, farPt.y)
      ctx.lineTo(cw, farPt.y)
      ctx.strokeStyle = "#2c3e50"
      ctx.lineWidth = 3
      ctx.stroke()
      for (const ratio of [0.2, 0.4, 0.6, 0.8]) {
        const basePt = w2s(0, p.riverWidth * ratio)
        if (basePt.y < 0 || basePt.y > ch) continue
        for (let x = 40; x < cw - 40; x += cw / 4) {
          ctx.beginPath()
          ctx.moveTo(x - 12, basePt.y)
          ctx.lineTo(x + 12, basePt.y)
          ctx.strokeStyle = "rgba(52, 152, 219, 0.25)"
          ctx.lineWidth = 1.2
          ctx.stroke()
          ctx.beginPath()
          ctx.moveTo(x + 12, basePt.y)
          ctx.lineTo(x + 6, basePt.y - 4)
          ctx.lineTo(x + 6, basePt.y + 4)
          ctx.closePath()
          ctx.fillStyle = "rgba(52, 152, 219, 0.25)"
          ctx.fill()
        }
      }
      ctx.fillStyle = "rgba(0,0,0,0.15)"
      ctx.font = "11px sans-serif"
      ctx.fillText("起点", nearPt.x - 14, nearPt.y + 22)
      if (farPt.y > 20) ctx.fillText("对岸", 6, farPt.y - 6)
      const pos = w2s(s.x, s.y)
      ctx.beginPath()
      ctx.moveTo(pos.x - 11, pos.y + 5)
      ctx.lineTo(pos.x - 7, pos.y - 4)
      ctx.lineTo(pos.x + 7, pos.y - 4)
      ctx.lineTo(pos.x + 11, pos.y + 5)
      ctx.closePath()
      ctx.fillStyle = "#8B4513"
      ctx.fill()
      ctx.strokeStyle = "rgba(0,0,0,0.25)"
      ctx.lineWidth = 1
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(pos.x, pos.y + 2)
      ctx.lineTo(pos.x, pos.y - 12)
      ctx.strokeStyle = "#666"
      ctx.lineWidth = 1.5
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(pos.x, pos.y - 12)
      ctx.lineTo(pos.x + 9, pos.y - 4)
      ctx.lineTo(pos.x, pos.y - 2)
      ctx.closePath()
      ctx.fillStyle = "rgba(255,255,255,0.65)"
      ctx.fill()
      ctx.strokeStyle = "rgba(0,0,0,0.15)"
      ctx.lineWidth = 0.5
      ctx.stroke()
      const theta = p.headingAngle * Math.PI / 180
      const vx = p.boatSpeed * Math.sin(theta) + p.currentSpeed
      const vy = p.boatSpeed * Math.cos(theta)
      const speed = Math.sqrt(vx * vx + vy * vy)
      if (speed > 0.05 && s.y < s.riverWidth - 1) {
        const sc = 12
        ctx.beginPath()
        ctx.moveTo(pos.x, pos.y)
        ctx.lineTo(pos.x, pos.y - vy * sc)
        ctx.strokeStyle = "#2ecc71"
        ctx.lineWidth = 2
        ctx.stroke()
        ctx.fillStyle = "#2ecc71"
        ctx.font = "11px sans-serif"
        ctx.fillText("Vy", pos.x + 6, pos.y - vy * sc * 0.5)
        ctx.beginPath()
        ctx.moveTo(pos.x, pos.y)
        ctx.lineTo(pos.x + vx * sc, pos.y)
        ctx.strokeStyle = "#3498db"
        ctx.lineWidth = 2
        ctx.stroke()
        ctx.fillStyle = "#3498db"
        ctx.fillText("Vx", pos.x + vx * sc * 0.5 - 10, pos.y + 14)
        const eX = pos.x + vx * sc, eY = pos.y - vy * sc
        ctx.beginPath()
        ctx.moveTo(pos.x, pos.y)
        ctx.lineTo(eX, eY)
        ctx.strokeStyle = "#e74c3c"
        ctx.lineWidth = 2.5
        ctx.stroke()
        const a = Math.atan2(-vy, vx)
        ctx.beginPath()
        ctx.moveTo(eX, eY)
        ctx.lineTo(eX - 7 * Math.cos(a - 0.4), eY - 7 * Math.sin(a - 0.4))
        ctx.lineTo(eX - 7 * Math.cos(a + 0.4), eY - 7 * Math.sin(a + 0.4))
        ctx.closePath()
        ctx.fillStyle = "#e74c3c"
        ctx.fill()
        ctx.fillStyle = "#e74c3c"
        ctx.fillText("V合", (eX + pos.x) / 2 + 8, (eY + pos.y) / 2 - 6)
      }
    },
  }
