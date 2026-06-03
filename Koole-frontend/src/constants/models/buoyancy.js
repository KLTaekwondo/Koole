// buoyancy 模型数据
export default {
    id: "buoyancy",
    level: "初中",
    category: "力学",
    name: "浮力",
    desc: "阿基米德原理：物体在液体中的浮沉与平衡",
    knowledge: `## 浮力

阿基米德原理：浮力 = 排开液体的重力。

- 浮力：$F_{浮} = \\rho_{液} g V_{排}$
- 物体重力：$G = \\rho_{物} g V_{物}$
- 漂浮时浸没比：$\\frac{V_{排}}{V_{物}} = \\frac{\\rho_{物}}{\\rho_{液}}$

其中：$F_{浮}$ 是浮力，$\\rho_{液}$ 是液体密度，$V_{排}$ 是排开液体体积，$G$ 是物体重力，$\\rho_{物}$ 是物体密度，$V_{物}$ 是物体体积。

浮沉条件很好记：密度比液体小就漂浮，相等就悬浮，大就沉底。比如木头密度是水的 0.6，就浸 60%。

浮力跟深度无关！漂浮时不管浸多深，浮力都等于重力。浮力本质是上下表面压力差，不是什么"液体的托力"。

轮船能浮是因为做成空心的增大了排水体积，不是钢铁变轻了。

> 密度比液体小时漂浮，浸没比例正好等于密度比——记住这个关系。`,
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="10" width="16" height="10" rx="1" fill="rgba(52,152,219,0.15)"/><rect x="8" y="4" width="8" height="8" rx="1"/><path d="M12 14l-2-2m2 2l2-2" stroke-width="1.5"/></svg>`,
    params: [
      { key: "rhoObj", label: "物体密度 (kg/m³)", value: 600, min: 100, max: 3000, step: 50 },
      { key: "rhoLiquid", label: "液体密度 (kg/m³)", value: 1000, min: 500, max: 2000, step: 50 },
      { key: "volume", label: "体积 (m³)", value: 0.125, min: 0.01, max: 1, step: 0.01 },
      { key: "gravity", label: "重力加速度 (m/s²)", value: 9.8, min: 1, max: 20, step: 0.1 },
      { key: "liquidH", label: "液面高度 (m)", value: 3, min: 1.5, max: 6, step: 0.5 },
    ],
    devNotes: `浮力的难点不在公式，在于部分浸没的计算：

\`\`\`js
hSub = Math.min(top, liquidH) - Math.max(bottom, 0)
Vsub = hSub * side * side
Fb = rhoLiquid * gravity * Vsub
G = rhoObj * gravity * volume
a = (G - Fb) / (rhoObj * volume)
if (hSub > 0) a -= vy * 5  // 液体阻尼
\`\`\`

用立方体近似物体，计算浸没高度。液体阻尼很重要——没有阻尼的话物体在液面附近永远振荡，不会稳定在漂浮位置。
`,

    // ── 物理逻辑 ──
    createState: (p) => {
      const side = Math.cbrt(p.volume)
      return { y: p.liquidH + side + 0.5, vy: 0, side, trail: [], _t: 0 }
    },
    step: (s, p, dt) => {
      const side = s.side
      const top = s.y + side
      const bottom = s.y
      let hSub = 0
      if (bottom < p.liquidH) {
        hSub = Math.min(top, p.liquidH) - Math.max(bottom, 0)
        hSub = Math.max(0, hSub)
      }
      const Vsub = hSub * side * side
      const Fb = p.rhoLiquid * p.gravity * Vsub
      const G = p.rhoObj * p.gravity * p.volume
      let a = (G - Fb) / (p.rhoObj * p.volume)
      if (hSub > 0) a -= s.vy * 5
      s.vy += a * dt
      s.y -= s.vy * dt
      if (s.y < 0) { s.y = 0; if (s.vy > 0) s.vy = 0 }
      if (s.y > p.liquidH + side + 1) { s.y = p.liquidH + side + 1; s.vy = 0 }
      s._t += dt
    },
    isFinished: (s, p) => {
      if (s.y <= 0.01 && Math.abs(s.vy) < 0.01) return true
      const side = s.side
      const hSub = Math.max(0, Math.min(s.y + side, p.liquidH) - Math.max(s.y, 0))
      const Vsub = hSub * side * side
      const Fb = p.rhoLiquid * p.gravity * Vsub
      const G = p.rhoObj * p.gravity * p.volume
      return Math.abs(s.vy) < 0.01 && Math.abs(G - Fb) < 0.1
    },
    getBallPosition: (s) => ({ x: 0, y: s.y + s.side / 2 }),
    getTrailPosition: (s) => ({ x: 0, y: s.y }),
    trailFields: (s, p) => {
      const side = s.side
      const hSub = Math.max(0, Math.min(s.y + side, p.liquidH) - Math.max(s.y, 0))
      const Vsub = hSub * side * side
      const Fb = p.rhoLiquid * p.gravity * Vsub
      const G = p.rhoObj * p.gravity * p.volume
      return { t: s._t, y: s.y, Fb, G, hSub }
    },
    chartDefs: [
      { title: "y-t 图（位置）", xLabel: "t (s)", yLabel: "y (m)", getData: (trail) => [{ name: "位置", data: trail.map(p => [p.t, p.y]) }] },
      { title: "F-t 图（力）", xLabel: "t (s)", yLabel: "F (N)", getData: (trail) => [
        { name: "浮力", data: trail.map(p => [p.t, p.Fb]) },
        { name: "重力", data: trail.map(p => [p.t, p.G]), lineStyle: "dashed" },
      ]},
    ],
    getInfoLines: (s, p, t) => {
      const side = s.side
      const hSub = Math.max(0, Math.min(s.y + side, p.liquidH) - Math.max(s.y, 0))
      const Vsub = hSub * side * side
      const Fb = p.rhoLiquid * p.gravity * Vsub
      const G = p.rhoObj * p.gravity * p.volume
      const ratio = p.rhoObj / p.rhoLiquid
      let status = ''
      if (ratio < 1) status = `漂浮（浸没 ${(ratio * 100).toFixed(0)}%）`
      else if (Math.abs(ratio - 1) < 0.001) status = '悬浮'
      else status = '下沉'
      return [
        `浮力: ${Fb.toFixed(1)} N`,
        `重力: ${G.toFixed(1)} N`,
        `合力: ${(Fb - G).toFixed(1)} N`,
        `浸没深度: ${hSub.toFixed(2)} m`,
        `V排: ${Vsub.toFixed(3)} m³ / V物: ${p.volume.toFixed(3)} m³`,
        `ρ物/ρ液: ${p.rhoObj}/${p.rhoLiquid} = ${ratio.toFixed(2)}`,
        `状态: ${status}`,
        `时间: ${t.toFixed(2)} s`,
      ]
    },

    // ── 渲染逻辑 ──
    drawObject: () => {},
    drawExtra: (ctx, s, p, w2s, getTheme) => {
      const isDark = getTheme && getTheme() === "dark"
      const TANK_W = 6
      const tankLeft = w2s(-TANK_W / 2, 0)
      const tankRight = w2s(TANK_W / 2, 0)
      const tankBottom = w2s(0, 0)
      const tankTop = w2s(0, p.liquidH + 2)
      const tw = tankRight.x - tankLeft.x
      const th = tankBottom.y - tankTop.y

      ctx.strokeStyle = isDark ? "#666" : "#8e9eab"
      ctx.lineWidth = 4
      ctx.beginPath()
      ctx.moveTo(tankLeft.x, tankTop.y)
      ctx.lineTo(tankLeft.x, tankBottom.y)
      ctx.lineTo(tankRight.x, tankBottom.y)
      ctx.lineTo(tankRight.x, tankTop.y)
      ctx.stroke()

      const liquidTop = w2s(0, p.liquidH)
      const grad = ctx.createLinearGradient(tankLeft.x, liquidTop.y, tankLeft.x, tankBottom.y)
      grad.addColorStop(0, isDark ? "rgba(30, 100, 160, 0.5)" : "rgba(52, 152, 219, 0.25)")
      grad.addColorStop(1, isDark ? "rgba(20, 70, 120, 0.7)" : "rgba(52, 152, 219, 0.45)")
      ctx.fillStyle = grad
      ctx.fillRect(tankLeft.x + 2, liquidTop.y, tw - 4, tankBottom.y - liquidTop.y)

      ctx.strokeStyle = isDark ? "rgba(100, 180, 255, 0.6)" : "rgba(52, 152, 219, 0.7)"
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(tankLeft.x, liquidTop.y)
      ctx.lineTo(tankRight.x, liquidTop.y)
      ctx.stroke()

      ctx.fillStyle = isDark ? "rgba(100,180,255,0.6)" : "rgba(52,152,219,0.6)"
      ctx.font = "11px sans-serif"
      ctx.textAlign = "left"
      ctx.fillText("液面", tankRight.x + 6, liquidTop.y + 4)

      const side = s.side
      const blkTop = w2s(-side / 2, s.y + side)
      const blkBot = w2s(side / 2, s.y)
      const bw = blkBot.x - blkTop.x
      const bh = blkBot.y - blkTop.y

      const bottom = s.y
      const top = s.y + side
      let hSub = 0
      if (bottom < p.liquidH) {
        hSub = Math.min(top, p.liquidH) - Math.max(bottom, 0)
        hSub = Math.max(0, hSub)
      }
      if (hSub > 0) {
        const subBot = Math.max(bottom, 0)
        const subTop = subBot + hSub
        const subTopS = w2s(0, subTop)
        const subBotS = w2s(0, subBot)
        ctx.fillStyle = "rgba(52, 152, 219, 0.2)"
        ctx.fillRect(blkTop.x, subTopS.y, bw, subBotS.y - subTopS.y)
      }

      const ratio = p.rhoObj / p.rhoLiquid
      const blkColor = ratio < 1 ? "#27ae60" : ratio > 1 ? "#e74c3c" : "#f39c12"
      ctx.fillStyle = blkColor
      ctx.fillRect(blkTop.x, blkTop.y, bw, bh)
      ctx.strokeStyle = "rgba(0,0,0,0.25)"
      ctx.lineWidth = 1.5
      ctx.strokeRect(blkTop.x, blkTop.y, bw, bh)

      ctx.fillStyle = "#fff"
      ctx.font = "bold 12px sans-serif"
      ctx.textAlign = "center"
      ctx.fillText(`ρ=${p.rhoObj}`, (blkTop.x + blkBot.x) / 2, (blkTop.y + blkBot.y) / 2 + 4)

      const G = p.rhoObj * p.gravity * p.volume
      const gLen = Math.min(G * 1.5, 80)
      const gStart = w2s(0, s.y)
      ctx.strokeStyle = "#e67e22"
      ctx.lineWidth = 2.5
      ctx.lineCap = "round"
      ctx.beginPath()
      ctx.moveTo(gStart.x, gStart.y + 4)
      ctx.lineTo(gStart.x, gStart.y + 4 + gLen)
      ctx.stroke()
      ctx.fillStyle = "#e67e22"
      ctx.beginPath()
      ctx.moveTo(gStart.x - 4, gStart.y + 4 + gLen - 5)
      ctx.lineTo(gStart.x, gStart.y + 4 + gLen)
      ctx.lineTo(gStart.x + 4, gStart.y + 4 + gLen - 5)
      ctx.fill()
      ctx.font = "bold 11px sans-serif"
      ctx.fillText(`G=${G.toFixed(1)}N`, gStart.x, gStart.y + 4 + gLen + 14)

      const hSubPhys = Math.max(0, Math.min(s.y + side, p.liquidH) - Math.max(s.y, 0))
      if (hSubPhys > 0.01) {
        const Vsub = hSubPhys * side * side
        const Fb = p.rhoLiquid * p.gravity * Vsub
        const fbLen = Math.min(Fb * 1.5, 80)
        const fbEnd = w2s(0, s.y + side)
        ctx.strokeStyle = "#3498db"
        ctx.lineWidth = 2.5
        ctx.beginPath()
        ctx.moveTo(fbEnd.x, fbEnd.y - 4 - fbLen)
        ctx.lineTo(fbEnd.x, fbEnd.y - 4)
        ctx.stroke()
        ctx.fillStyle = "#3498db"
        ctx.beginPath()
        ctx.moveTo(fbEnd.x - 4, fbEnd.y - 4 - fbLen + 5)
        ctx.lineTo(fbEnd.x, fbEnd.y - 4 - fbLen)
        ctx.lineTo(fbEnd.x + 4, fbEnd.y - 4 - fbLen + 5)
        ctx.fill()
        ctx.font = "bold 11px sans-serif"
        ctx.fillText(`F浮=${Fb.toFixed(1)}N`, fbEnd.x, fbEnd.y - 4 - fbLen - 6)
      }

      ctx.textAlign = "left"
      ctx.lineCap = "butt"
    },
  }
