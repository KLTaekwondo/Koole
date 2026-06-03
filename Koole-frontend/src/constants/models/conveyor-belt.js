// conveyor-belt 模型数据
const GROUND_Y = 0.4
const DRAW_SCALE = 30

export default {
    id: "conveyor-belt",
    level: "高中",
    category: "力学",
    name: "传送带",
    desc: "物块在传送带上的运动，摩擦力驱动的加速与匀速",
    knowledge: `## 传送带

摩擦力方向判断的经典模型。关键就一句话：摩擦力方向看**相对运动**，不看运动方向。

- 有相对滑动时加速度：$a = \\mu g$
- 物块比带慢 → 摩擦力向前（加速）
- 物块比带快 → 摩擦力向后（减速）
- 共速后相对运动消失，摩擦力变为零

其中：$a$ 是加速度，$\\mu$ 是动摩擦因数，$g$ 是重力加速度。

最容易错的地方：摩擦力方向不是运动方向！比如物块向右运动但比传送带慢，摩擦力还是向右的。

划痕长度 = 物块与传送带的**相对位移**，不是物块的位移，这个区别考试经常考。能量角度：摩擦力做功转化为物块动能和系统内能（发热）。

> 初速度设成负值试试——物块先被减速，停了再反向加速到跟带同速。`,
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="10" width="20" height="4" rx="1" fill="rgba(0,0,0,0.06)"/><circle cx="4" cy="12" r="2" fill="none"/><circle cx="20" cy="12" r="2" fill="none"/><rect x="9" y="6" width="5" height="5" rx="1" fill="rgba(0,0,0,0.1)"/><line x1="2" y1="17" x2="22" y2="17"/></svg>`,
    params: [
      { key: "beltSpeed", label: "传送带速度 (m/s)", value: 4, min: 0.5, max: 12, step: 0.5 },
      { key: "v0", label: "物块初速度 (m/s)", value: 0, min: -5, max: 12, step: 0.5 },
      { key: "mu", label: "动摩擦因数 μ", value: 0.3, min: 0.05, max: 1, step: 0.05 },
      { key: "beltLength", label: "传送带长度 (m)", value: 20, min: 5, max: 50, step: 1 },
      { key: "gravity", label: "重力加速度 (m/s²)", value: 9.8, min: 1, max: 20, step: 0.1 },
    ],
    devNotes: `传送带的核心是摩擦力方向判断：

\`\`\`js
dv = beltSpeed - s.v
if (Math.abs(dv) > 0.05) {
  a = Math.sign(dv) * mu * gravity
}
\`\`\`

\`Math.sign(dv)\` 一行搞定方向——物块比带慢就加速，比带就减速。

共速检测用速度差 < 0.05，共速后摩擦力消失。支持负初速度，可以观察"先减速→停→反向加速→共速"的完整过程。
`,

    // ── 物理逻辑 ──
    createState: (p) => ({ x: 0, v: p.v0, trail: [], _t: 0, _synced: false, events: [] }),
    step: (s, p, dt) => {
      const dv = p.beltSpeed - s.v
      if (Math.abs(dv) > 0.05) {
        const a = Math.sign(dv) * p.mu * p.gravity
        s.v = Math.abs(a * dt) > Math.abs(dv) ? p.beltSpeed : s.v + a * dt
      }
      s._t += dt
      if (!s._synced && Math.abs(p.beltSpeed - s.v) < 0.05) {
        s._synced = true
        s.events.push({ type: "sync", time: s._t, label: "共速" })
      }
      s.x += s.v * dt
      if (s.x >= p.beltLength) s.x = p.beltLength
      if (s.x < 0) s.x = 0
    },
    isFinished: (s, p) => s.x >= p.beltLength,
    getBallPosition: (s) => ({ x: s.x, y: GROUND_Y }),
    getTrailPosition: (s) => ({ x: s.x, y: GROUND_Y }),
    trailFields: (s) => ({ t: s._t, v: s.v }),
    chartDefs: [
      {
        title: "v-t 图",
        xLabel: "t (s)",
        yLabel: "v (m/s)",
        getData: (trail, params) => [
          { name: "物块速度", data: trail.map(p => [p.t, p.v]) },
          { name: "传送带速度", data: trail.map(p => [p.t, params.beltSpeed]), lineStyle: "dashed" },
        ],
      },
    ],
    getInfoLines: (s, p, t) => {
      const dv = p.beltSpeed - s.v
      const isSynced = Math.abs(dv) < 0.05
      return [
        `物块速度: ${s.v.toFixed(2)} m/s`,
        `传送带速度: ${p.beltSpeed.toFixed(1)} m/s`,
        `相对速度: ${isSynced ? 0 : dv.toFixed(2)} m/s`,
        `位移: ${s.x.toFixed(1)} / ${p.beltLength} m`,
        `加速度: ${(isSynced ? 0 : Math.sign(dv) * p.mu * p.gravity).toFixed(2)} m/s²`,
        `μ = ${p.mu.toFixed(2)}`,
        `状态: ${isSynced ? '匀速 ✓' : (dv > 0 ? '加速中 🔄' : '减速中 🔄')}`,
        `时间: ${t.toFixed(2)} s`,
      ]
    },

    // ── 渲染逻辑 ──
    drawObject: (ctx, s, p, w2s) => {
      const beltLen = p.beltLength
      const beltH = 0.3, blockH = 0.7, blockW = 0.7
      const beltLeft = w2s(-1, 0), beltRight = w2s(beltLen + 1, 0), beltBot = w2s(0, -beltH - 0.5)
      ctx.fillStyle = "#d5dbe0"
      ctx.fillRect(beltLeft.x, beltLeft.y, beltRight.x - beltLeft.x, beltBot.y - beltLeft.y)
      const beltSurface = w2s(0, 0), beltBottom = w2s(0, -beltH)
      ctx.fillStyle = "#555"
      ctx.fillRect(beltLeft.x, beltSurface.y, beltRight.x - beltLeft.x, beltBottom.y - beltSurface.y)
      for (const rx of [-0.5, beltLen + 0.5]) {
        const rp = w2s(rx, -beltH / 2)
        ctx.beginPath()
        ctx.arc(rp.x, rp.y, 12, 0, Math.PI * 2)
        ctx.fillStyle = "#7f8c8d"
        ctx.fill()
        ctx.strokeStyle = "#444"
        ctx.lineWidth = 1.5
        ctx.stroke()
        ctx.beginPath()
        ctx.arc(rp.x, rp.y, 5, 0, Math.PI * 2)
        ctx.fillStyle = "#444"
        ctx.fill()
      }
      ctx.strokeStyle = "rgba(255,255,255,0.15)"
      ctx.lineWidth = 1
      for (let wx = 0; wx < beltLen; wx += 1.2) {
        const px = w2s(wx, 0).x
        ctx.beginPath()
        ctx.moveTo(px, beltSurface.y)
        ctx.lineTo(px + 4, beltBottom.y)
        ctx.stroke()
      }
      if (Math.abs(p.beltSpeed) > 0.1) {
        const arrowPos = w2s(0, 0.15)
        const midX = (beltLeft.x + beltRight.x) / 2
        const aLen = 30, dir = Math.sign(p.beltSpeed)
        ctx.beginPath()
        ctx.moveTo(midX - aLen * dir, arrowPos.y)
        ctx.lineTo(midX + aLen * dir, arrowPos.y)
        ctx.strokeStyle = "rgba(52, 152, 219, 0.4)"
        ctx.lineWidth = 2
        ctx.stroke()
        ctx.beginPath()
        ctx.moveTo(midX + aLen * dir, arrowPos.y)
        ctx.lineTo(midX + aLen * dir - 8 * dir, arrowPos.y - 4)
        ctx.lineTo(midX + aLen * dir - 8 * dir, arrowPos.y + 4)
        ctx.closePath()
        ctx.fillStyle = "rgba(52, 152, 219, 0.4)"
        ctx.fill()
      }
      const blockWorldX = Math.max(0, Math.min(s.x, beltLen))
      const blkBottom = w2s(blockWorldX, 0)
      const blkScreenW = blockW * DRAW_SCALE, blkScreenH = blockH * DRAW_SCALE
      ctx.fillStyle = "#e74c3c"
      ctx.fillRect(blkBottom.x - blkScreenW / 2, blkBottom.y - blkScreenH, blkScreenW, blkScreenH)
      ctx.strokeStyle = "rgba(0,0,0,0.2)"
      ctx.lineWidth = 1.5
      ctx.strokeRect(blkBottom.x - blkScreenW / 2, blkBottom.y - blkScreenH, blkScreenW, blkScreenH)
      if (Math.abs(s.v) > 0.05) {
        const vLen = Math.min(Math.abs(s.v) * 3, 60)
        const vDir = s.v >= 0 ? 1 : -1
        const arrowX = blkBottom.x + blkScreenW / 2 + 4
        const arrowY = blkBottom.y - blkScreenH / 2
        ctx.beginPath()
        ctx.moveTo(arrowX, arrowY)
        ctx.lineTo(arrowX + vLen * vDir, arrowY)
        ctx.strokeStyle = "#e67e22"
        ctx.lineWidth = 2.5
        ctx.stroke()
        ctx.beginPath()
        ctx.moveTo(arrowX + vLen * vDir, arrowY)
        ctx.lineTo(arrowX + vLen * vDir - 8 * vDir, arrowY - 4)
        ctx.lineTo(arrowX + vLen * vDir - 8 * vDir, arrowY + 4)
        ctx.closePath()
        ctx.fillStyle = "#e67e22"
        ctx.fill()
        ctx.fillStyle = "#e67e22"
        ctx.font = "bold 11px sans-serif"
        ctx.fillText("v", arrowX + vLen * vDir * 0.5 - 4, arrowY - 8)
      }
    },
  }
