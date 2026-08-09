// projectile 模型数据
const GROUND_Y = 0.4

export default {
    id: "projectile",
    level: "高中",
    category: "力学",
    name: "平抛运动",
    desc: "水平初速度与重力合成抛物线轨迹",
    knowledge: `## 平抛运动

水平匀速 + 竖直自由落体 = 抛物线。

- 水平：$x = v_0 t$
- 竖直：$y = \\frac{1}{2}gt^2$
- 飞行时间：$t = \\sqrt{\\frac{2h}{g}}$
- 水平射程：$R = v_0 \\sqrt{\\frac{2h}{g}}$
- 合速度：$v = \\sqrt{v_x^2 + v_y^2}$

其中：$v_0$ 是水平初速度，$x$/$y$ 是水平/竖直位移，$h$ 是初始高度，$R$ 是水平射程，$v_x$/$v_y$ 是水平/竖直分速度。

核心思想就是"两个方向互不影响"。$v_x$ 永远不变，$v_y$ 越来越大——看动画里蓝色箭头不动、绿色箭头变长就很直观。

轨迹是抛物线：消去 t 就得到 $y = \\frac{g}{2v_0^2}x^2$。

> Vx 和 Vy 的箭头对比很直观——蓝色不变，绿色越来越长，合速度方向一直在偏。`,
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 20h20"/><path d="M6 16l4-8 4 4 4-8" stroke-dasharray="2 2"/><circle cx="18" cy="8" r="2"/></svg>`,
    params: [
      { key: "height", label: "初始高度 (m)", value: 15, min: 1, max: 50, step: 0.5 },
      { key: "vx", label: "水平速度 (m/s)", value: 5, min: 1, max: 20, step: 0.5 },
      { key: "gravity", label: "重力加速度 (m/s²)", value: 9.8, min: 1, max: 20, step: 0.1 },
    ],
    devNotes: `## 开发笔记

平抛运动是自由落体的"升级版"，加了水平方向的匀速运动。

物理逻辑很简单，两个方向独立算互不影响。但速度分解的可视化花了不少心思——要同时显示 Vx、Vy 和合速度 V，还得用不同颜色区分。

轨迹绘制是个意外收获。本来只是想显示当前位置，后来发现把历史位置点连起来，抛物线轨迹特别直观。这个功能后来成了所有抛射类模型的标配。

箭头方向也踩过坑：Vy 向下为正（Canvas 坐标系），Vx 水平向右。一开始箭头方向反了，调了半天才发现是坐标系的问题。
`,

    // ── 物理逻辑 ──
    createState: (p) => ({ x: 0, y: p.height + GROUND_Y, vx: p.vx, vy: 0, trail: [], _t: 0 }),
    step: (s, p, dt) => {
      s.vy += p.gravity * dt
      s.x += s.vx * dt
      s.y -= s.vy * dt
      s._t += dt
      if (s.y <= GROUND_Y && s.vy >= 0) { s.y = GROUND_Y; s.vy = 0 }
    },
    isFinished: (s) => s.y <= GROUND_Y,
    getBallPosition: (s) => ({ x: s.x, y: s.y }),
    getTrailPosition: (s) => ({ x: s.x, y: s.y }),
    trailFields: (s) => ({ t: s._t, y: s.y }),
    chartDefs: [
      { title: "轨迹图", xLabel: "x (m)", yLabel: "y (m)", getData: (trail) => [{ name: "轨迹", data: trail.map(p => [p.x, p.y]) }] },
      { title: "x-t 图", xLabel: "t (s)", yLabel: "x (m)", getData: (trail) => [{ name: "水平位移", data: trail.map(p => [p.t, p.x]) }] },
      { title: "y-t 图", xLabel: "t (s)", yLabel: "y (m)", getData: (trail) => [{ name: "高度", data: trail.map(p => [p.t, p.y]) }] },
    ],
    getInfoLines: (s, p, t) => [
      `水平位移: ${s.x.toFixed(1)} m`,
      `下落高度: ${(p.height + GROUND_Y - s.y).toFixed(1)} m`,
      `水平速度: ${s.vx.toFixed(1)} m/s`,
      `竖直速度: ${s.vy.toFixed(1)} m/s`,
      `时间: ${t.toFixed(2)} s`,
    ],

    // ── 渲染逻辑 ──
    drawExtra: (ctx, s, p, w2s) => {
      const speed = Math.sqrt(s.vx * s.vx + s.vy * s.vy)
      if (speed < 0.2 || s.y <= 0) return
      const pos = w2s(s.x, s.y)
      const vxLen = s.vx * 5
      ctx.beginPath()
      ctx.moveTo(pos.x, pos.y)
      ctx.lineTo(pos.x + vxLen, pos.y)
      ctx.strokeStyle = "#3498db"
      ctx.lineWidth = 2
      ctx.stroke()
      if (vxLen > 10) {
        ctx.beginPath()
        ctx.moveTo(pos.x + vxLen, pos.y)
        ctx.lineTo(pos.x + vxLen - 7, pos.y - 4)
        ctx.lineTo(pos.x + vxLen - 7, pos.y + 4)
        ctx.closePath()
        ctx.fillStyle = "#3498db"
        ctx.fill()
      }
      ctx.fillStyle = "#3498db"
      ctx.font = "11px sans-serif"
      ctx.fillText("Vx", pos.x + vxLen * 0.5 - 10, pos.y + 16)
      const vyLen = s.vy * 5
      ctx.beginPath()
      ctx.moveTo(pos.x, pos.y)
      ctx.lineTo(pos.x, pos.y + vyLen)
      ctx.strokeStyle = "#2ecc71"
      ctx.lineWidth = 2
      ctx.stroke()
      if (vyLen > 10) {
        ctx.beginPath()
        ctx.moveTo(pos.x, pos.y + vyLen)
        ctx.lineTo(pos.x - 4, pos.y + vyLen - 7)
        ctx.lineTo(pos.x + 4, pos.y + vyLen - 7)
        ctx.closePath()
        ctx.fillStyle = "#2ecc71"
        ctx.fill()
      }
      ctx.fillStyle = "#2ecc71"
      ctx.fillText("Vy", pos.x + 10, pos.y + vyLen * 0.5)
      const endX = pos.x + vxLen
      const endY = pos.y + vyLen
      ctx.beginPath()
      ctx.moveTo(pos.x, pos.y)
      ctx.lineTo(endX, endY)
      ctx.strokeStyle = "#e74c3c"
      ctx.lineWidth = 2.5
      ctx.stroke()
      const a = Math.atan2(vyLen, vxLen)
      ctx.beginPath()
      ctx.moveTo(endX, endY)
      ctx.lineTo(endX - 9 * Math.cos(a - 0.4), endY - 9 * Math.sin(a - 0.4))
      ctx.lineTo(endX - 9 * Math.cos(a + 0.4), endY - 9 * Math.sin(a + 0.4))
      ctx.closePath()
      ctx.fillStyle = "#e74c3c"
      ctx.fill()
      ctx.fillStyle = "#e74c3c"
      ctx.fillText("V", (endX + pos.x) / 2 + 10, (endY + pos.y) / 2 - 8)
    },
  }
