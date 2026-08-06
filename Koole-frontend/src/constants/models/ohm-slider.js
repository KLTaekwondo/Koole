// ohm-slider 模型数据
export default {
    id: "ohm-slider",
    level: "初中",
    category: "电学",
    name: "欧姆定律与滑动变阻器",
    desc: "滑片改变接入电阻，电流和电压随之变化",
    knowledge: `## 欧姆定律与滑动变阻器

欧姆定律说的是电流、电压、电阻之间的关系。电压推动电流，电阻阻碍电流。

- 欧姆定律：$I = U / R$
- 总电阻：$R = R_0 + R_p$
- 定值电阻电压：$U_0 = IR_0$
- 滑动变阻器电压：$U_p = IR_p$

其中：$I$ 是电流，$U$ 是电源电压，$R$ 是总电阻，$R_0$ 是定值电阻，$R_p$ 是滑动变阻器接入电路的电阻。

滑片移动时，本质上是改变接入电路的电阻长度。接入电阻变大，总电阻变大，电流变小；接入电阻变小，总电阻变小，电流变大。

这里容易看错的是：滑动变阻器不是“自己产生电压”，它只是改变电路电阻，然后电流和分压一起变化。

> 把滑片往右调，让接入电阻变大，观察电流表读数和灯泡亮度一起变小。`,
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12h4"/><path d="M17 12h4"/><path d="M7 12l2-4 3 8 3-8 2 4"/><path d="M10 6l7 10"/><circle cx="17" cy="16" r="1"/></svg>`,
    params: [
      { key: "voltage", label: "电源电压 U (V)", value: 6, min: 1.5, max: 12, step: 0.5 },
      { key: "fixedR", label: "定值电阻 R₀ (Ω)", value: 5, min: 1, max: 20, step: 0.5 },
      { key: "sliderMax", label: "变阻器最大电阻 (Ω)", value: 20, min: 5, max: 50, step: 1 },
      { key: "sliderPercent", label: "滑片位置 (%)", value: 50, min: 0, max: 100, step: 1 },
      { key: "switchOn", label: "开关", value: 1, options: [{ label: "闭合", value: 1 }, { label: "断开", value: 0 }] },
    ],

    // ── 物理逻辑 ──
    createState: () => ({ _t: 0, animT: 0, trail: [] }),
    step: (s, p, dt) => {
      s._t += dt
      if (!p.switchOn) return
      const Rp = p.sliderMax * p.sliderPercent / 100
      const R = Math.max(0.1, p.fixedR + Rp)
      const I = p.voltage / R
      s.animT += I * 100 * dt
    },
    isFinished: () => false,
    getBallPosition: () => null,
    getTrailPosition: () => null,
    trailFields: () => null,
    chartDefs: [],
    getInfoLines: (s, p, t) => {
      const Rp = p.sliderMax * p.sliderPercent / 100
      const R = p.fixedR + Rp
      if (!p.switchOn) {
        return [
          `电源电压: ${p.voltage} V`,
          `定值电阻: ${p.fixedR.toFixed(1)} Ω`,
          `接入电阻: ${Rp.toFixed(1)} Ω`,
          `开关: 断开`,
          `电流: 0 A`,
          `时间: ${t.toFixed(2)} s`,
        ]
      }
      const I = p.voltage / Math.max(0.1, R)
      const U0 = I * p.fixedR
      const Up = I * Rp
      const P = p.voltage * I
      return [
        `电源电压: ${p.voltage} V`,
        `接入电阻: Rp = ${Rp.toFixed(1)} Ω`,
        `总电阻: R = R₀ + Rp = ${R.toFixed(1)} Ω`,
        `电流: I = U/R = ${I.toFixed(3)} A`,
        `定值电阻电压: ${U0.toFixed(2)} V`,
        `变阻器电压: ${Up.toFixed(2)} V`,
        `总功率: ${P.toFixed(3)} W`,
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
      const wireColor = isDark ? "rgba(255,255,255,0.72)" : "rgba(0,0,0,0.62)"
      const labelColor = isDark ? "rgba(255,255,255,0.86)" : "rgba(0,0,0,0.76)"
      const dimColor = isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.45)"
      const currentColor = "#f1c40f"
      const batteryColor = "#2ecc71"
      const resistorColor = "#e67e22"
      const sliderColor = "#9b59b6"
      const switchColor = p.switchOn ? "#2ecc71" : "#e74c3c"

      const left = 80
      const right = cw - 80
      const top = ch * 0.30
      const bottom = ch * 0.68
      const midX = (left + right) / 2
      const r0Left = left + (right - left) * 0.30
      const r0Right = left + (right - left) * 0.55
      const sliderLeft = left + (right - left) * 0.25
      const sliderRight = left + (right - left) * 0.75
      const sliderY = bottom
      const knobX = sliderLeft + (sliderRight - sliderLeft) * p.sliderPercent / 100
      const battTop = top + 35
      const battBot = bottom - 35
      const swTop = top + 18
      const swBot = top + 72

      const Rp = p.sliderMax * p.sliderPercent / 100
      const R = p.fixedR + Rp
      const I = p.switchOn ? p.voltage / Math.max(0.1, R) : 0
      const brightness = Math.min(1, I / 1.1)

      ctx.strokeStyle = wireColor
      ctx.lineWidth = 3
      ctx.lineCap = "round"
      ctx.lineJoin = "round"
      ctx.beginPath()
      ctx.moveTo(left, battTop)
      ctx.lineTo(left, top)
      ctx.lineTo(r0Left, top)
      ctx.moveTo(r0Right, top)
      ctx.lineTo(right, top)
      ctx.lineTo(right, swTop)
      ctx.moveTo(right, swBot)
      ctx.lineTo(right, bottom)
      ctx.lineTo(sliderRight, bottom)
      ctx.moveTo(sliderLeft, bottom)
      ctx.lineTo(left, bottom)
      ctx.lineTo(left, battBot)
      ctx.stroke()

      ctx.strokeStyle = batteryColor
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.moveTo(left - 12, battTop + 8)
      ctx.lineTo(left + 12, battTop + 8)
      ctx.stroke()
      ctx.lineWidth = 5
      ctx.beginPath()
      ctx.moveTo(left - 7, battBot - 8)
      ctx.lineTo(left + 7, battBot - 8)
      ctx.stroke()
      ctx.fillStyle = batteryColor
      ctx.font = "bold 13px sans-serif"
      ctx.textAlign = "center"
      ctx.fillText("+", left - 22, battTop + 12)
      ctx.fillText("−", left - 22, battBot - 4)
      ctx.fillStyle = labelColor
      ctx.font = "bold 12px sans-serif"
      ctx.fillText(`${p.voltage}V`, left - 26, (battTop + battBot) / 2)

      ctx.fillStyle = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.04)"
      ctx.strokeStyle = resistorColor
      ctx.lineWidth = 2
      ctx.fillRect(r0Left, top - 16, r0Right - r0Left, 32)
      ctx.strokeRect(r0Left, top - 16, r0Right - r0Left, 32)
      ctx.fillStyle = resistorColor
      ctx.font = "bold 12px sans-serif"
      ctx.textAlign = "center"
      ctx.fillText(`R₀=${p.fixedR}Ω`, (r0Left + r0Right) / 2, top + 4)

      const lampX = left + (right - left) * 0.72
      ctx.beginPath()
      ctx.arc(lampX, top, 22, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(241,196,15,${0.15 + brightness * 0.65})`
      ctx.fill()
      ctx.strokeStyle = "#f39c12"
      ctx.lineWidth = 2
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(lampX - 10, top - 8)
      ctx.lineTo(lampX + 10, top + 8)
      ctx.moveTo(lampX + 10, top - 8)
      ctx.lineTo(lampX - 10, top + 8)
      ctx.stroke()
      ctx.fillStyle = labelColor
      ctx.font = "11px sans-serif"
      ctx.fillText("亮度≈电流", lampX, top + 38)

      ctx.strokeStyle = sliderColor
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.moveTo(sliderLeft, sliderY)
      ctx.lineTo(sliderRight, sliderY)
      ctx.stroke()
      for (let x = sliderLeft; x <= sliderRight; x += 18) {
        ctx.beginPath()
        ctx.moveTo(x, sliderY - 7)
        ctx.lineTo(x + 8, sliderY + 7)
        ctx.stroke()
      }
      ctx.fillStyle = sliderColor
      ctx.beginPath()
      ctx.arc(knobX, sliderY - 28, 8, 0, Math.PI * 2)
      ctx.fill()
      ctx.strokeStyle = sliderColor
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(knobX, sliderY - 20)
      ctx.lineTo(knobX, sliderY)
      ctx.stroke()
      ctx.fillStyle = labelColor
      ctx.font = "bold 12px sans-serif"
      ctx.fillText(`Rp=${Rp.toFixed(1)}Ω`, midX, sliderY + 34)

      ctx.strokeStyle = switchColor
      ctx.fillStyle = switchColor
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.arc(right, swTop + 4, 4, 0, Math.PI * 2)
      ctx.arc(right, swBot - 4, 4, 0, Math.PI * 2)
      ctx.fill()
      ctx.beginPath()
      ctx.moveTo(right, swTop + 4)
      ctx.lineTo(p.switchOn ? right : right + 20, p.switchOn ? swBot - 4 : swBot - 12)
      ctx.stroke()
      ctx.font = "bold 11px sans-serif"
      ctx.textAlign = "left"
      ctx.fillText(p.switchOn ? "ON" : "OFF", right + 10, (swTop + swBot) / 2 + 4)

      if (p.switchOn && I > 0.001) {
        const dots = 8
        const path = [
          { x1: left, y1: battTop, x2: left, y2: top },
          { x1: left, y1: top, x2: r0Left, y2: top },
          { x1: r0Right, y1: top, x2: right, y2: top },
          { x1: right, y1: swBot, x2: right, y2: bottom },
          { x1: right, y1: bottom, x2: sliderRight, y2: bottom },
          { x1: sliderLeft, y1: bottom, x2: left, y2: bottom },
          { x1: left, y1: bottom, x2: left, y2: battBot },
        ]
        const lens = path.map(seg => Math.hypot(seg.x2 - seg.x1, seg.y2 - seg.y1))
        const total = lens.reduce((a, b) => a + b, 0)
        for (let d = 0; d < dots; d++) {
          let pos = ((s.animT || 0) + d * total / dots) % total
          let acc = 0
          for (let i = 0; i < path.length; i++) {
            if (pos <= acc + lens[i]) {
              const t = (pos - acc) / lens[i]
              const x = path[i].x1 + (path[i].x2 - path[i].x1) * t
              const y = path[i].y1 + (path[i].y2 - path[i].y1) * t
              ctx.beginPath()
              ctx.arc(x, y, 5, 0, Math.PI * 2)
              ctx.fillStyle = "rgba(241,196,15,0.3)"
              ctx.fill()
              ctx.beginPath()
              ctx.arc(x, y, 2.8, 0, Math.PI * 2)
              ctx.fillStyle = currentColor
              ctx.fill()
              break
            }
            acc += lens[i]
          }
        }
      }

      ctx.fillStyle = dimColor
      ctx.font = "bold 13px sans-serif"
      ctx.textAlign = "center"
      ctx.fillText(p.switchOn ? `I=${I.toFixed(3)}A，R=${R.toFixed(1)}Ω` : "断路：无电流", cw / 2, ch - 26)
    },
  }
