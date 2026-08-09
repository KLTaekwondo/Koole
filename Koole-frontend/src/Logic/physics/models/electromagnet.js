// electromagnet 模型数据
export default {
    id: "electromagnet",
    level: "初中",
    category: "电与磁",
    name: "电磁铁",
    desc: "电流、线圈匝数和铁芯都会影响电磁铁磁性强弱",
    knowledge: `## 电磁铁

电磁铁就是通电后有磁性的线圈。电流走的是外面的线圈，不是直接穿过铁芯；铁芯的作用是被线圈磁化，让磁性明显增强。

电磁铁磁性强弱主要看三个因素：

- 电流越大，磁性越强
- 线圈匝数越多，磁性越强
- 插入铁芯后，磁性明显增强

电磁铁的磁极方向和电流方向有关，可以用右手螺旋定则判断。四指沿电流方向弯曲，大拇指指向的一端就是 N 极。

这里先抓住强弱关系就行：电流、匝数、铁芯都会影响磁性。电铃、继电器、起重电磁铁都靠这个原理工作。

> 增大电流或匝数，磁感线会更密；插入铁芯后，能吸起的铁钉数量明显增加。`,
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12h3"/><path d="M17 12h3"/><path d="M7 8c2 3 2 5 0 8"/><path d="M10 8c2 3 2 5 0 8"/><path d="M13 8c2 3 2 5 0 8"/><path d="M16 8c2 3 2 5 0 8"/><path d="M8 18h8"/></svg>`,
    params: [
      { key: "current", label: "电流 I (A)", value: 1.5, min: 0, max: 5, step: 0.1 },
      { key: "turns", label: "线圈匝数", value: 20, min: 5, max: 60, step: 1 },
      { key: "ironCore", label: "铁芯", value: 1, options: [{ label: "插入", value: 1 }, { label: "无", value: 0 }] },
      { key: "direction", label: "电流方向", value: 1, options: [{ label: "正向", value: 1 }, { label: "反向", value: -1 }] },
    ],

    // ── 物理逻辑 ──
    createState: () => ({ _t: 0, trail: [], pulse: 0 }),
    step: (s, p, dt) => {
      s._t += dt
      s.pulse += dt * (1 + p.current)
    },
    isFinished: () => false,
    getBallPosition: () => null,
    getTrailPosition: () => null,
    trailFields: () => null,
    chartDefs: [],
    getInfoLines: (s, p, t) => {
      const strength = p.current * p.turns * (p.ironCore ? 2.6 : 1)
      const nails = Math.floor(Math.min(12, strength / 18))
      return [
        `电流: ${p.current.toFixed(1)} A`,
        `线圈匝数: ${p.turns} 匝`,
        `铁芯: ${p.ironCore ? '有' : '无'}`,
        `磁性强度: ${strength.toFixed(1)}（相对值）`,
        `可吸起铁钉: 约 ${nails} 枚`,
        `磁极方向: ${p.direction > 0 ? '左 N 右 S' : '左 S 右 N'}`,
        `时间: ${t.toFixed(2)} s`,
      ]
    },

    // ── 渲染逻辑 ──
    drawObject: () => {},
    drawExtra: (ctx, s, p, w2s, getTheme) => {
      const isDark = getTheme && getTheme() === "dark"
      const dpr = window.devicePixelRatio || 1
      const cw = ctx.canvas.width / dpr
      const ch = ctx.canvas.height / dpr
      const cx = cw / 2
      const cy = ch / 2
      const tubeW = Math.min(380, cw * 0.62)
      const tubeH = 42
      const tubeLeft = cx - tubeW / 2
      const tubeRight = cx + tubeW / 2
      const strength = p.current * p.turns * (p.ironCore ? 2.6 : 1)
      const norm = Math.min(1, strength / (5 * 60 * 2.6))
      const fieldCount = Math.max(3, Math.round(4 + norm * 10))
      const nails = Math.floor(Math.min(12, strength / 18))
      const loops = Math.max(6, Math.round(p.turns / 4))
      const pitch = tubeW / loops
      const loopRx = Math.max(10, pitch * 0.42)
      const loopRy = 52
      const coilColor = "#e67e22"
      const labelColor = isDark ? "#ddd" : "#333"

      // 磁感线放在底层，弱一点，不抢线圈
      for (let i = 1; i <= fieldCount; i++) {
        const rX = tubeW * (0.34 + i * 0.035)
        const rY = 54 + i * 8
        ctx.beginPath()
        ctx.ellipse(cx, cy, rX, rY, 0, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(52,152,219,${0.06 + norm * 0.20})`
        ctx.lineWidth = 1.2
        ctx.stroke()
      }

      // 铁芯 / 管子。它会挡住绕到后面的线圈，所以后面的线圈不画。
      const tubeGrad = ctx.createLinearGradient(tubeLeft, cy - tubeH / 2, tubeLeft, cy + tubeH / 2)
      if (p.ironCore) {
        tubeGrad.addColorStop(0, isDark ? "#9fa6ad" : "#d2d9df")
        tubeGrad.addColorStop(0.48, isDark ? "#676d73" : "#9aa4ad")
        tubeGrad.addColorStop(1, isDark ? "#41474d" : "#6f7b86")
      } else {
        tubeGrad.addColorStop(0, isDark ? "#3b3b3b" : "#f4f4f4")
        tubeGrad.addColorStop(1, isDark ? "#272727" : "#d8d8d8")
      }
      ctx.fillStyle = tubeGrad
      ctx.strokeStyle = p.ironCore ? (isDark ? "#b6bec6" : "#65727e") : (isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.32)")
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.roundRect(tubeLeft - 8, cy - tubeH / 2, tubeW + 16, tubeH, tubeH / 2)
      ctx.fill()
      if (!p.ironCore) ctx.setLineDash([7, 5])
      ctx.stroke()
      ctx.setLineDash([])

      // 只画管子前面的半圈线圈：后半圈默认被管子挡住，不画出来
      ctx.strokeStyle = coilColor
      ctx.lineWidth = 4
      ctx.lineCap = "round"
      for (let i = 0; i < loops; i++) {
        const x = tubeLeft + pitch * (i + 0.5)
        ctx.beginPath()
        ctx.ellipse(x, cy, loopRx, loopRy, 0, 0, Math.PI)
        ctx.stroke()
      }

      // 外部接线只接到线圈两端，不穿过管子
      const firstX = tubeLeft + pitch * 0.5
      const lastX = tubeRight - pitch * 0.5
      const leftLead = { x: tubeLeft - 88, y: cy + loopRy }
      const rightLead = { x: tubeRight + 88, y: cy + loopRy }
      ctx.strokeStyle = isDark ? "rgba(255,255,255,0.75)" : "rgba(0,0,0,0.62)"
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.moveTo(leftLead.x, leftLead.y)
      ctx.lineTo(firstX - loopRx, cy)
      ctx.moveTo(lastX + loopRx, cy)
      ctx.lineTo(rightLead.x, rightLead.y)
      ctx.stroke()

      // 电源符号放在线圈外面，避免误会电流从铁芯中间走
      ctx.strokeStyle = "#2ecc71"
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.moveTo(leftLead.x - 16, leftLead.y - 18)
      ctx.lineTo(leftLead.x + 16, leftLead.y - 18)
      ctx.stroke()
      ctx.lineWidth = 5
      ctx.beginPath()
      ctx.moveTo(leftLead.x - 9, leftLead.y + 2)
      ctx.lineTo(leftLead.x + 9, leftLead.y + 2)
      ctx.stroke()
      ctx.fillStyle = "#2ecc71"
      ctx.font = "bold 13px sans-serif"
      ctx.textAlign = "center"
      ctx.fillText("+", leftLead.x - 26, leftLead.y - 14)
      ctx.fillText("−", leftLead.x - 26, leftLead.y + 7)

      // 电流亮点只出现在可见线圈前半圈和外部接线上，管子后面的部分不显示
      if (p.current > 0.05) {
        const dotCount = 10
        const dir = p.direction > 0 ? 1 : -1
        const pointOnVisibleWire = (phase) => {
          const u = dir > 0 ? phase : 1 - phase
          const leadPart = 0.12
          if (u < leadPart) {
            const k = u / leadPart
            return {
              x: leftLead.x + (firstX - loopRx - leftLead.x) * k,
              y: leftLead.y + (cy - leftLead.y) * k,
            }
          }
          if (u > 1 - leadPart) {
            const k = (u - (1 - leadPart)) / leadPart
            return {
              x: lastX + loopRx + (rightLead.x - (lastX + loopRx)) * k,
              y: cy + (rightLead.y - cy) * k,
            }
          }
          const coilU = (u - leadPart) / (1 - leadPart * 2)
          const raw = coilU * loops
          const turnIndex = Math.min(loops - 1, Math.max(0, Math.floor(raw)))
          const local = raw - turnIndex
          const x = tubeLeft + pitch * (turnIndex + 0.5)
          const theta = local * Math.PI
          return {
            x: x + Math.cos(theta) * loopRx,
            y: cy + Math.sin(theta) * loopRy,
          }
        }

        for (let i = 0; i < dotCount; i++) {
          const phase = ((s.pulse * 0.16 + i / dotCount) % 1 + 1) % 1
          const pt = pointOnVisibleWire(phase)
          ctx.beginPath()
          ctx.arc(pt.x, pt.y, 5.5, 0, Math.PI * 2)
          ctx.fillStyle = "rgba(241,196,15,0.30)"
          ctx.fill()
          ctx.beginPath()
          ctx.arc(pt.x, pt.y, 3, 0, Math.PI * 2)
          ctx.fillStyle = "#f1c40f"
          ctx.fill()
        }
      }

      const leftPole = p.direction > 0 ? "N" : "S"
      const rightPole = p.direction > 0 ? "S" : "N"
      ctx.fillStyle = leftPole === "N" ? "#e74c3c" : "#3498db"
      ctx.fillRect(tubeLeft - 54, cy - 15, 34, 30)
      ctx.fillStyle = rightPole === "N" ? "#e74c3c" : "#3498db"
      ctx.fillRect(tubeRight + 20, cy - 15, 34, 30)
      ctx.fillStyle = "#fff"
      ctx.font = "bold 15px sans-serif"
      ctx.textAlign = "center"
      ctx.fillText(leftPole, tubeLeft - 37, cy + 5)
      ctx.fillText(rightPole, tubeRight + 37, cy + 5)

      const nailStartX = cx - 120
      const nailY = cy + 132
      for (let i = 0; i < 12; i++) {
        const x = nailStartX + i * 22
        ctx.strokeStyle = i < nails ? "#555" : (isDark ? "rgba(255,255,255,0.22)" : "rgba(0,0,0,0.18)")
        ctx.lineWidth = 3
        ctx.beginPath()
        ctx.moveTo(x, nailY)
        ctx.lineTo(x + 7, nailY + 30)
        ctx.stroke()
        ctx.fillStyle = i < nails ? "#777" : (isDark ? "rgba(255,255,255,0.18)" : "rgba(0,0,0,0.14)")
        ctx.beginPath()
        ctx.arc(x - 1, nailY - 2, 4, 0, Math.PI * 2)
        ctx.fill()
      }

      ctx.fillStyle = labelColor
      ctx.font = "bold 14px sans-serif"
      ctx.textAlign = "center"
      ctx.fillText(`磁性强度 ≈ ${strength.toFixed(0)}，吸起约 ${nails} 枚铁钉`, cx, nailY + 58)
      ctx.font = "12px sans-serif"
      ctx.fillText(`只画线圈前半圈，管子后面的线被挡住`, cx, cy - 94)
      ctx.fillText(`I=${p.current.toFixed(1)}A，匝数=${p.turns}，${p.ironCore ? '有铁芯' : '无铁芯'}`, cx, cy - 76)
    },
  }
