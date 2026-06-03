// parallel-circuit 模型数据
export default {
    id: "parallel-circuit",
    level: "初中",
    category: "电学",
    name: "并联电路",
    desc: "并联电路中各支路电压相等，电流按电阻反比分配",
    knowledge: `## 并联电路

并联就是元件两端都连在一起、电压处处相等——各支路各走各的。

- 总电阻：$\\frac{1}{R} = \\frac{1}{R_1} + \\frac{1}{R_2}$
- 各支路电流：$I_1 = \\frac{U}{R_1}$，$I_2 = \\frac{U}{R_2}$
- 总电流：$I = I_1 + I_2$
- 电流分配：$I_1 : I_2 = R_2 : R_1$（反比！）

其中：$R$ 是总电阻，$U$ 是电源电压，$I$ 是总电流，$R_1$/$R_2$ 是各支路电阻，$I_1$/$I_2$ 是各支路电流。

并联的核心：电压相等，电阻小的支路分到的电流多。总电阻比最小的那个还小——这个结论很多人不信，算一下就明白了。

一条支路断了另一条照常工作，这就是家里电路并联的原因。一个灯坏了其他灯还亮。

> 调 R1 和 R2 看电流怎么反比分配的，总电阻永远比最小的那个还小。`,
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="2" y1="6" x2="2" y2="18"/><line x1="22" y1="6" x2="22" y2="18"/><line x1="2" y1="6" x2="22" y2="6"/><line x1="2" y1="18" x2="22" y2="18"/><rect x="7" y="4" width="4" height="4" rx="0.5"/><rect x="13" y="4" width="4" height="4" rx="0.5"/><rect x="7" y="16" width="4" height="4" rx="0.5"/><rect x="13" y="16" width="4" height="4" rx="0.5"/></svg>`,
    params: [
      { key: "voltage", label: "电源电压 U (V)", value: 6, min: 1.5, max: 12, step: 0.5 },
      { key: "R1", label: "电阻 R₁ (Ω)", value: 3, min: 1, max: 20, step: 0.5 },
      { key: "R2", label: "电阻 R₂ (Ω)", value: 6, min: 1, max: 20, step: 0.5 },
      { key: "switchOn", label: "开关", value: 1, options: [{ label: "闭合", value: 1 }, { label: "断开", value: 0 }] },
      { key: "showElectron", label: "显示电子流", value: 0, options: [{ label: "关", value: 0 }, { label: "开", value: 1 }] },
    ],
    devNotes: `## 开发笔记

并联跟串联最大的区别是电流分流——同一个节点电流分成两路，各走各的再汇合。

电路布局是 H 形：电池在左侧，上方和下方各一条横线连到右侧，中间两条竖线分别是 R1 和 R2。节点在右侧上方和下方，电流从左上分流，经过两个电阻后在右下汇合。

电流动画的难点是两条支路速度不一样——电阻小的支路电流大、亮点跑得快。每条支路独立算动画位置：

\`\`\`js
const I1 = voltage / R1  // 支路1电流
const I2 = voltage / R2  // 支路2电流
// 各支路亮点速度正比于各自的电流
\`\`\`

总电阻公式 $R = R_1 R_2 / (R_1 + R_2)$ 有个坑：当 R1 或 R2 趋近 0 时总电阻也趋近 0，电流会非常大。实际电路里这叫短路，但模拟器里不做限制，让调参的人自己发现。

参数和串联一样：电压、两个电阻、开关、电子流显示。
`,

    // ── 物理逻辑 ──
    createState: () => ({ _t: 0, trail: [], animT: 0, animT2: 0 }),
    step: (s, p, dt) => {
      s._t += dt
      if (p.switchOn) {
        const I1 = p.voltage / p.R1
        const I2 = p.voltage / p.R2
        s.animT += I1 * 80 * dt
        s.animT2 += I2 * 80 * dt
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
        ]
      }
      const I1 = p.voltage / p.R1
      const I2 = p.voltage / p.R2
      const I = I1 + I2
      const R = (p.R1 * p.R2) / (p.R1 + p.R2)
      const P = p.voltage * I
      return [
        `电源电压: ${p.voltage} V`,
        `总电阻: 1/R = 1/R₁ + 1/R₂ = ${R.toFixed(2)} Ω`,
        `R₁ 电流: I₁ = U/R₁ = ${I1.toFixed(3)} A`,
        `R₂ 电流: I₂ = U/R₂ = ${I2.toFixed(3)} A`,
        `总电流: I = I₁ + I₂ = ${I.toFixed(3)} A`,
        `电流比: I₁:I₂ = ${(I1/I2).toFixed(2)}（电阻反比 ${(p.R2/p.R1).toFixed(2)}）`,
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

      const marginLeft = 240
      const marginRight = 60
      const rectW = cw - marginLeft - marginRight
      const rectH = ch * 0.50
      const rectX = marginLeft
      const rectY = (ch - rectH) / 2 + 15

      const nodeTopY = rectY
      const nodeBotY = rectY + rectH
      const leftX = rectX
      const rightX = rectX + rectW
      const r1X = rightX - rectW * 0.15
      const r2X = rightX - rectW * 0.55

      const battTop = rectY + rectH * 0.3
      const battBot = rectY + rectH * 0.7

      const swTop = battBot + 15
      const swBot = swTop + 35

      const I1 = p.switchOn ? p.voltage / p.R1 : 0
      const I2 = p.switchOn ? p.voltage / p.R2 : 0
      const I = I1 + I2
      const R = p.switchOn ? (p.R1 * p.R2) / (p.R1 + p.R2) : 0

      ctx.strokeStyle = wireColor
      ctx.lineWidth = 3
      ctx.lineCap = "round"
      ctx.lineJoin = "round"
      ctx.beginPath()
      ctx.moveTo(leftX, battTop)
      ctx.lineTo(leftX, nodeTopY)
      ctx.moveTo(leftX, nodeBotY)
      ctx.lineTo(leftX, swTop)
      ctx.moveTo(leftX, swBot)
      ctx.lineTo(leftX, battBot)
      ctx.moveTo(leftX, nodeTopY)
      ctx.lineTo(r1X, nodeTopY)
      ctx.moveTo(leftX, nodeBotY)
      ctx.lineTo(r1X, nodeBotY)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(r1X, nodeTopY)
      ctx.lineTo(r1X, nodeBotY)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(r2X, nodeTopY)
      ctx.lineTo(r2X, nodeBotY)
      ctx.stroke()

      const battCY = (battTop + battBot) / 2
      ctx.strokeStyle = batteryColor
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.moveTo(leftX - 12, battTop + 6)
      ctx.lineTo(leftX + 12, battTop + 6)
      ctx.stroke()
      ctx.lineWidth = 5
      ctx.beginPath()
      ctx.moveTo(leftX - 7, battBot - 6)
      ctx.lineTo(leftX + 7, battBot - 6)
      ctx.stroke()
      ctx.fillStyle = batteryColor
      ctx.font = "bold 13px sans-serif"
      ctx.textAlign = "center"
      ctx.fillText("+", leftX - 20, battTop + 10)
      ctx.fillText("−", leftX - 20, battBot - 2)
      ctx.fillStyle = labelColor
      ctx.font = "bold 12px sans-serif"
      ctx.fillText(`${p.voltage}V`, leftX - 25, battCY + 4)

      const r1W = 50
      ctx.fillStyle = compBg
      ctx.strokeStyle = resistorColor
      ctx.lineWidth = 2
      ctx.fillRect(r1X - r1W / 2, nodeTopY, r1W, nodeBotY - nodeTopY)
      ctx.strokeRect(r1X - r1W / 2, nodeTopY, r1W, nodeBotY - nodeTopY)
      ctx.fillStyle = resistorColor
      ctx.font = "bold 12px sans-serif"
      ctx.textAlign = "center"
      ctx.fillText(`R₁=${p.R1}Ω`, r1X, (nodeTopY + nodeBotY) / 2 + 4)
      if (p.switchOn) {
        ctx.fillStyle = dimColor
        ctx.font = "11px sans-serif"
        ctx.fillText(`${I1.toFixed(2)}A`, r1X, nodeTopY - 8)
      }

      const r2W = 50
      ctx.fillStyle = compBg
      ctx.strokeStyle = resistorColor
      ctx.lineWidth = 2
      ctx.fillRect(r2X - r2W / 2, nodeTopY, r2W, nodeBotY - nodeTopY)
      ctx.strokeRect(r2X - r2W / 2, nodeTopY, r2W, nodeBotY - nodeTopY)
      ctx.fillStyle = resistorColor
      ctx.font = "bold 12px sans-serif"
      ctx.textAlign = "center"
      ctx.fillText(`R₂=${p.R2}Ω`, r2X, (nodeTopY + nodeBotY) / 2 + 4)
      if (p.switchOn) {
        ctx.fillStyle = dimColor
        ctx.font = "11px sans-serif"
        ctx.fillText(`${I2.toFixed(2)}A`, r2X, nodeTopY - 8)
      }

      const swCX = leftX
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

        const loop1 = [
          { x1: leftX, y1: battTop, x2: leftX, y2: nodeTopY },
          { x1: leftX, y1: nodeTopY, x2: r1X, y2: nodeTopY },
          { x1: r1X, y1: nodeTopY, x2: r1X, y2: nodeBotY },
          { x1: r1X, y1: nodeBotY, x2: leftX, y2: nodeBotY },
          { x1: leftX, y1: swBot, x2: leftX, y2: battBot },
        ]
        const loop1Lens = loop1.map(s => Math.sqrt((s.x2-s.x1)**2 + (s.y2-s.y1)**2))
        const loop1Len = loop1Lens.reduce((a,b) => a+b, 0)

        const loop2 = [
          { x1: leftX, y1: battTop, x2: leftX, y2: nodeTopY },
          { x1: leftX, y1: nodeTopY, x2: r2X, y2: nodeTopY },
          { x1: r2X, y1: nodeTopY, x2: r2X, y2: nodeBotY },
          { x1: r2X, y1: nodeBotY, x2: leftX, y2: nodeBotY },
          { x1: leftX, y1: swBot, x2: leftX, y2: battBot },
        ]
        const loop2Lens = loop2.map(s => Math.sqrt((s.x2-s.x1)**2 + (s.y2-s.y1)**2))
        const loop2Len = loop2Lens.reduce((a,b) => a+b, 0)

        drawFlowDots(loop1, loop1Lens, loop1Len, s.animT || 0, 4, "rgba(241,196,15,0.25)", currentColor)
        drawFlowDots(loop2, loop2Lens, loop2Len, s.animT2 || 0, 4, "rgba(241,196,15,0.25)", currentColor)

        if (p.showElectron) {
          const reverseSegs = segs => [...segs].reverse().map(s => ({ x1: s.x2, y1: s.y2, x2: s.x1, y2: s.y1 }))
          const reverseLens = lens => [...lens].reverse()
          drawFlowDots(reverseSegs(loop1), reverseLens(loop1Lens), loop1Len, s.animT || 0, 4, "rgba(52,152,219,0.25)", "#3498db")
          drawFlowDots(reverseSegs(loop2), reverseLens(loop2Lens), loop2Len, s.animT2 || 0, 4, "rgba(52,152,219,0.25)", "#3498db")
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
        ctx.fillText(`I = I₁ + I₂ = ${I.toFixed(3)} A    R = ${R.toFixed(2)} Ω`, cw / 2, nodeBotY + 30)
      } else {
        ctx.fillText(`断路 — 无电流`, cw / 2, nodeBotY + 30)
      }

      ctx.textAlign = "left"
    },
  }
