// series-circuit 模型数据
export default {
    id: "series-circuit",
    level: "初中",
    category: "电学",
    name: "串联电路",
    desc: "串联电路中电流处处相等，电压按电阻分配",
    knowledge: `## 串联电路

串联就是元件首尾相连、只有一条路走——电流处处相等。

- 总电阻：$R = R_1 + R_2$
- 电流：$I = \\frac{U}{R}$
- 各电阻电压：$U_1 = IR_1$，$U_2 = IR_2$
- 电压关系：$U = U_1 + U_2$

其中：$R$ 是总电阻，$U$ 是电源电压，$I$ 是电流，$R_1$/$R_2$ 是各电阻阻值，$U_1$/$U_2$ 是各电阻分到的电压。

电流方向规定为正电荷移动方向（从正极到负极），电子实际移动方向刚好反过来（从负极到正极）。两种说法都对，看题目的问法。

串联的核心规律：电流处处相等，电阻越大分到的电压越多。电阻比等于电压比——$R_1 : R_2 = U_1 : U_2$，这个做题很好用。

一个电阻短路（R=0）的话电流全走短路那条，另一个电阻直接没用了。开关断开的话整个回路没电流。

圣诞灯串就是串联——一个灯坏了整串全灭，因为断路了。

> 调 R1 和 R2 的比值，看电压怎么按比例分配的。`,
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="10" width="6" height="4" rx="0.5"/><rect x="14" y="10" width="6" height="4" rx="0.5"/><line x1="10" y1="12" x2="14" y2="12"/><line x1="2" y1="12" x2="4" y2="12"/><line x1="20" y1="12" x2="22" y2="12"/><line x1="2" y1="8" x2="2" y2="16"/><line x1="22" y1="8" x2="22" y2="16"/></svg>`,
    params: [
      { key: "voltage", label: "电源电压 U (V)", value: 6, min: 1.5, max: 12, step: 0.5 },
      { key: "R1", label: "电阻 R₁ (Ω)", value: 3, min: 1, max: 20, step: 0.5 },
      { key: "R2", label: "电阻 R₂ (Ω)", value: 6, min: 1, max: 20, step: 0.5 },
      { key: "switchOn", label: "开关", value: 1, options: [{ label: "闭合", value: 1 }, { label: "断开", value: 0 }] },
      { key: "showElectron", label: "显示电子流", value: 0, options: [{ label: "关", value: 0 }, { label: "开", value: 1 }] },
    ],
    devNotes: `## 开发笔记

串联电路是静态电学图，但有电流动画——导线上的亮点沿回路移动，速度正比于电流大小。

电路布局用矩形回路：电池在左侧，两个电阻在上方，开关在右侧，导线连成闭合矩形。元件位置用画布尺寸的比例计算，自适应不同屏幕。

电流动画核心：每帧沿导线路径移动亮点位置，用取模实现循环：

\`\`\`js
const totalLen = perimeterLength
animT = (animT + speed * dt) % totalLen
// 根据 animT 算出亮点在矩形回路上的 (x, y)
\`\`\`

开关断开时电流为零、亮点停止，直观体现"断路没电流"。各元件旁标注电压和电流值，配合参数变化实时更新。

电子流和电流方向相反——电流是正电荷移动方向（正极→负极），电子实际从负极跑到正极。用参数开关切换显示电子流，蓝色亮点逆时针流动。

参数里开关和电子流显示都用 options 类型（闭合/断开、开/关），跟杠杆的力方向一样。
`,

    // ── 物理逻辑 ──
    createState: () => ({ _t: 0, trail: [], animT: 0 }),
    step: (s, p, dt) => {
      s._t += dt
      if (p.switchOn) {
        const R = p.R1 + p.R2
        const I = p.voltage / R
        s.animT += I * 80 * dt
      }
    },
    isFinished: () => false,
    getBallPosition: () => null,
    getTrailPosition: () => null,
    trailFields: () => null,
    chartDefs: [],
    getInfoLines: (s, p) => {
      if (!p.switchOn) {
        return [
          `电源电压: ${p.voltage} V`,
          `R₁: ${p.R1} Ω    R₂: ${p.R2} Ω`,
          `开关: 断开`,
          `电流: 0 A（断路）`,
          `电子流向: 无（断路）`,
        ]
      }
      const R = p.R1 + p.R2
      const I = p.voltage / R
      const U1 = I * p.R1
      const U2 = I * p.R2
      const P = p.voltage * I
      return [
        `电源电压: ${p.voltage} V`,
        `总电阻: R = R₁ + R₂ = ${R.toFixed(1)} Ω`,
        `电流: I = U/R = ${I.toFixed(3)} A`,
        `R₁ 电压: U₁ = IR₁ = ${U1.toFixed(2)} V`,
        `R₂ 电压: U₂ = IR₂ = ${U2.toFixed(2)} V`,
        `验证: U₁ + U₂ = ${(U1 + U2).toFixed(2)} V`,
        `总功率: P = UI = ${P.toFixed(3)} W`,
      ]
    },

    // ── 渲染逻辑 ──
    drawObject: () => {},
    drawExtra: (ctx, s, p, w2s, getTheme) => {
      const isDark = getTheme && getTheme() === "dark"
      const dpr = window.devicePixelRatio || 1
      const cw = ctx.canvas.width / dpr
      const ch = ctx.canvas.height / dpr

      const wireColor = isDark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.6)"
      const labelColor = isDark ? "rgba(255,255,255,0.85)" : "rgba(0,0,0,0.75)"
      const dimColor = isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.35)"
      const compBg = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.04)"
      const currentColor = "#f1c40f"
      const batteryColor = "#2ecc71"
      const resistorColor = "#e67e22"
      const switchColor = p.switchOn ? "#2ecc71" : "#e74c3c"

      const margin = 60
      const rectW = cw - margin * 2
      const rectH = ch * 0.45
      const rectX = margin
      const rectY = (ch - rectH) / 2 + 20

      const tl = { x: rectX, y: rectY }
      const tr = { x: rectX + rectW, y: rectY }
      const br = { x: rectX + rectW, y: rectY + rectH }
      const bl = { x: rectX, y: rectY + rectH }

      const R = p.R1 + p.R2
      const I = p.switchOn ? p.voltage / R : 0
      const U1 = I * p.R1
      const U2 = I * p.R2

      const battTop = rectY + rectH * 0.3
      const battBot = rectY + rectH * 0.7
      const r1Left = rectX + rectW * 0.2
      const r1Right = rectX + rectW * 0.4
      const r2Left = rectX + rectW * 0.6
      const r2Right = rectX + rectW * 0.8
      const r1Gap = r1Right - r1Left
      const r2Gap = r2Right - r2Left
      const swTop = rectY + rectH * 0.35
      const swBot = rectY + rectH * 0.65

      ctx.strokeStyle = wireColor
      ctx.lineWidth = 3
      ctx.lineCap = "round"
      ctx.lineJoin = "round"
      ctx.beginPath()
      ctx.moveTo(tl.x, battTop)
      ctx.lineTo(tl.x, tl.y)
      ctx.lineTo(r1Left, tl.y)
      ctx.moveTo(r1Right, tl.y)
      ctx.lineTo(r2Left, tl.y)
      ctx.moveTo(r2Right, tl.y)
      ctx.lineTo(tr.x, tr.y)
      ctx.lineTo(tr.x, swTop)
      ctx.moveTo(tr.x, swBot)
      ctx.lineTo(br.x, br.y)
      ctx.lineTo(bl.x, bl.y)
      ctx.lineTo(tl.x, battBot)
      ctx.stroke()

      const battCX = tl.x
      const battCY = (battTop + battBot) / 2
      ctx.strokeStyle = batteryColor
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.moveTo(battCX - 12, battTop + 6)
      ctx.lineTo(battCX + 12, battTop + 6)
      ctx.stroke()
      ctx.lineWidth = 5
      ctx.beginPath()
      ctx.moveTo(battCX - 7, battBot - 6)
      ctx.lineTo(battCX + 7, battBot - 6)
      ctx.stroke()
      ctx.fillStyle = batteryColor
      ctx.font = "bold 13px sans-serif"
      ctx.textAlign = "center"
      ctx.fillText("+", battCX - 20, battTop + 10)
      ctx.fillText("−", battCX - 20, battBot - 2)
      ctx.fillStyle = labelColor
      ctx.font = "bold 12px sans-serif"
      ctx.fillText(`${p.voltage}V`, battCX - 25, battCY + 4)

      const r1CX = (r1Left + r1Right) / 2
      const r1CY = tl.y
      ctx.fillStyle = compBg
      ctx.strokeStyle = resistorColor
      ctx.lineWidth = 2
      ctx.fillRect(r1Left, r1CY - 14, r1Gap, 28)
      ctx.strokeRect(r1Left, r1CY - 14, r1Gap, 28)
      ctx.fillStyle = resistorColor
      ctx.font = "bold 12px sans-serif"
      ctx.textAlign = "center"
      ctx.fillText(`R₁=${p.R1}Ω`, r1CX, r1CY + 4)
      if (p.switchOn) {
        ctx.fillStyle = dimColor
        ctx.font = "11px sans-serif"
        ctx.fillText(`${U1.toFixed(1)}V`, r1CX, r1CY + 26)
      }

      const r2CX = (r2Left + r2Right) / 2
      const r2CY = tl.y
      ctx.fillStyle = compBg
      ctx.strokeStyle = resistorColor
      ctx.lineWidth = 2
      ctx.fillRect(r2Left, r2CY - 14, r2Gap, 28)
      ctx.strokeRect(r2Left, r2CY - 14, r2Gap, 28)
      ctx.fillStyle = resistorColor
      ctx.font = "bold 12px sans-serif"
      ctx.textAlign = "center"
      ctx.fillText(`R₂=${p.R2}Ω`, r2CX, r2CY + 4)
      if (p.switchOn) {
        ctx.fillStyle = dimColor
        ctx.font = "11px sans-serif"
        ctx.fillText(`${U2.toFixed(1)}V`, r2CX, r2CY + 26)
      }

      const swCX = tr.x
      const swMid = (swTop + swBot) / 2
      ctx.strokeStyle = switchColor
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.arc(swCX, swTop + 4, 4, 0, Math.PI * 2)
      ctx.fillStyle = switchColor
      ctx.fill()
      ctx.beginPath()
      ctx.arc(swCX, swBot - 4, 4, 0, Math.PI * 2)
      ctx.fill()
      if (p.switchOn) {
        ctx.beginPath()
        ctx.moveTo(swCX, swTop + 4)
        ctx.lineTo(swCX, swBot - 4)
        ctx.stroke()
      } else {
        ctx.beginPath()
        ctx.moveTo(swCX, swTop + 4)
        ctx.lineTo(swCX + 16, swBot - 10)
        ctx.stroke()
      }
      ctx.fillStyle = switchColor
      ctx.font = "bold 11px sans-serif"
      ctx.textAlign = "left"
      ctx.fillText(p.switchOn ? "ON" : "OFF", swCX + 10, swMid + 4)

      if (p.switchOn && I > 0.001) {
        const segments = [
          { x1: tl.x, y1: battTop, x2: tl.x, y2: tl.y },
          { x1: tl.x, y1: tl.y, x2: r1Left, y2: tl.y },
          { x1: r1Right, y1: tl.y, x2: r2Left, y2: tl.y },
          { x1: r2Left, y1: tl.y, x2: r2Right, y2: tl.y },
          { x1: r2Right, y1: tl.y, x2: tr.x, y2: tr.y },
          { x1: tr.x, y1: tr.y, x2: tr.x, y2: swTop },
          { x1: tr.x, y1: swBot, x2: br.x, y2: br.y },
          { x1: br.x, y1: br.y, x2: bl.x, y2: bl.y },
          { x1: bl.x, y1: bl.y, x2: tl.x, y2: battBot },
        ]
        const segLens = segments.map(seg => {
          const dx = seg.x2 - seg.x1, dy = seg.y2 - seg.y1
          return Math.sqrt(dx * dx + dy * dy)
        })
        const totalLen = segLens.reduce((a, b) => a + b, 0)

        const drawFlowDots = (segs, lens, tLen, animOffset, numDots, glowColor, coreColor) => {
          const animPos = ((animOffset) % tLen + tLen) % tLen
          for (let d = 0; d < numDots; d++) {
            let pos = (animPos + d * tLen / numDots) % tLen
            let acc = 0
            for (let i = 0; i < segs.length; i++) {
              if (pos <= acc + lens[i]) {
                const t = (pos - acc) / lens[i]
                const dotX = segs[i].x1 + (segs[i].x2 - segs[i].x1) * t
                const dotY = segs[i].y1 + (segs[i].y2 - segs[i].y1) * t
                ctx.beginPath()
                ctx.arc(dotX, dotY, 6, 0, Math.PI * 2)
                ctx.fillStyle = glowColor
                ctx.fill()
                ctx.beginPath()
                ctx.arc(dotX, dotY, 3, 0, Math.PI * 2)
                ctx.fillStyle = coreColor
                ctx.fill()
                break
              }
              acc += lens[i]
            }
          }
        }

        drawFlowDots(segments, segLens, totalLen, s.animT || 0, 6, "rgba(241,196,15,0.25)", currentColor)

        if (p.showElectron) {
          const revSegments = [...segments].reverse().map(seg => ({ x1: seg.x2, y1: seg.y2, x2: seg.x1, y2: seg.y1 }))
          const revLens = [...segLens].reverse()
          drawFlowDots(revSegments, revLens, totalLen, s.animT || 0, 6, "rgba(52,152,219,0.25)", "#3498db")
        }
      }

      const legendX = cw - 16
      const legendY = 16
      ctx.font = "11px sans-serif"
      ctx.textAlign = "right"
      ctx.beginPath()
      ctx.arc(legendX - 90, legendY + 4, 4, 0, Math.PI * 2)
      ctx.fillStyle = currentColor
      ctx.fill()
      ctx.fillStyle = labelColor
      ctx.fillText("电流 I（+ → −）", legendX, legendY + 8)
      if (p.showElectron) {
        ctx.beginPath()
        ctx.arc(legendX - 90, legendY + 22, 4, 0, Math.PI * 2)
        ctx.fillStyle = "#3498db"
        ctx.fill()
        ctx.fillStyle = labelColor
        ctx.fillText("电子 e⁻（− → +）", legendX, legendY + 26)
      }

      ctx.fillStyle = labelColor
      ctx.font = "bold 13px sans-serif"
      ctx.textAlign = "center"
      if (p.switchOn) {
        ctx.fillText(`I = ${I.toFixed(3)} A`, cw / 2, rectY + rectH + 30)
      } else {
        ctx.fillText(`断路 — 无电流`, cw / 2, rectY + rectH + 30)
      }

      ctx.textAlign = "left"
    },
  }
