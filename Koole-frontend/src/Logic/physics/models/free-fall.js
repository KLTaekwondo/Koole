import { freeFallScene } from "../render/scenes/freeFallScene.js"

// free-fall 模型数据
const GROUND_Y = 0.4

export default {
    id: "free-fall",
    level: "初中",
    category: "力学",
    name: "自由落体",
    desc: "物体在重力作用下的竖直下落",
    knowledge: `## 自由落体

匀变速直线运动的特例——只受重力，初速为零。

- $v = gt$
- $h = \\frac{1}{2}gt^2$
- $v^2 = 2gh$

其中：$v$ 是末速度，$h$ 是下落高度，$t$ 是时间，$g$ 是重力加速度。

$g \\approx 9.8 \\, m/s^2$ 方向竖直向下，跟质量无关。伽利略比萨斜塔实验说的就是这个——不同质量的球同时落地。

有个结论做题经常用：初速度为零的匀加速运动，连续相等时间间隔内的位移之比 =$1:3:5:7:\\cdots$，选择题很爱考。

> 把 g 调成 1.6（月球）或 3.7（火星），下落明显慢了——不同星球重力差这么多。`,
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="2" x2="12" y2="12"/><path d="M12 12l-3 3"/><path d="M12 12l3 3"/><circle cx="12" cy="18" r="3"/></svg>`,
    exploration: {
      task: "改变下落高度，比较下落时间和落地速度，想想这跟质量有关系吗？",
      hint: "先记录默认高度的下落时间，把高度调大一倍再试一次，对比两次的时间。",
      check: (p, t, touched) => touched && t > 1,
    },
    // 只保留最近 1200 点轨迹，够看出下落路线
    trailLimit: 1200,

    // ── 实验记录：可终止模型，落地即结算 ──
    dataSpec: {
        kind: "series",
        settle: "finish",
        series: [
            { key: "height", label: "离地高度", unit: "m", sample: (s) => s.y - GROUND_Y },
            { key: "speed", label: "速度", unit: "m/s", sample: (s) => s.vy },
        ],
        metrics: [
            { key: "fallTime", label: "下落时间", unit: "s", compute: (s) => s._t },
            { key: "landSpeed", label: "落地速度", unit: "m/s", compute: (s) => s.vy },
            { key: "dropHeight", label: "下落高度", unit: "m", compute: (s, p) => p.height },
        ],
        events: [
            { key: "touchdown", label: "落地", detect: (s, prev) => prev.y > GROUND_Y && s.y <= GROUND_Y },
        ],
    },
    params: [
      { key: "height", label: "初始高度 (m)", value: 15, min: 1, max: 50, step: 0.5 },
      { key: "gravity", label: "重力加速度 (m/s²)", value: 9.8, min: 1, max: 20, step: 0.1 },
    ],
    devNotes: `## 开发笔记

自由落体是我做的第一个模型，算是整个模拟器的原型。

最开始纠结了很久用什么数值方法，欧拉法虽然简单但精度一般，RK4 又太复杂。后来想通了——帧率 60fps 的情况下欧拉法完全够用，没必要过度设计。

坐标系转换踩了个大坑：Canvas 的 y 轴向下，物理世界 y 轴向上。一开始没注意，球直接飞到屏幕外面去了。后来封装了个 w2s 函数统一处理，世界坐标转屏幕坐标。

速度箭头的长度一开始没限制，速度快了箭头直接戳出画面。加了个 Math.min 限制最大长度，视觉效果好多了。
`,

    // ── 物理逻辑 ──
    createState: (p) => ({ y: p.height + GROUND_Y, vy: 0, trail: [], _t: 0 }),
    step: (s, p, dt) => {
      s.vy += p.gravity * dt
      s.y -= s.vy * dt
      s._t += dt
      if (s.y <= GROUND_Y && s.vy >= 0) { s.y = GROUND_Y; s.vy = 0 }
    },
    isFinished: (s) => s.y <= GROUND_Y && s.vy <= 0,
    getBallPosition: (s) => ({ x: 0, y: s.y }),
    getTrailPosition: (s) => ({ x: 0, y: s.y }),
    trailFields: (s) => ({ t: s._t, vy: s.vy, y: s.y }),
    chartDefs: [
      { title: "y-t 图", xLabel: "t (s)", yLabel: "y (m)", getData: (trail) => [{ name: "高度", data: trail.map(p => [p.t, p.y]) }] },
      { title: "v-t 图", xLabel: "t (s)", yLabel: "v (m/s)", getData: (trail) => [{ name: "速度", data: trail.map(p => [p.t, p.vy]) }] },
    ],
    getInfoLines: (s, p, t) => [
      `下落高度: ${(p.height + GROUND_Y - s.y).toFixed(1)} m`,
      `速度: ${s.vy.toFixed(1)} m/s`,
      `时间: ${t.toFixed(2)} s`,
      `重力: ${p.gravity} m/s²`,
    ],

    // ── 渲染逻辑 ──
    // 新架构：舞台（地面/网格）交给 landscape 环境，球半径走世界单位
    environment: "landscape",
    drawScene(view, state, params) {
      freeFallScene.drawScene(view, state, params)
    },

    // 旧绘制：保留作对照，迁移完成后删除
    drawExtra: (ctx, s, p, w2s) => {
      if (s.vy < 0.2 || s.y <= 0) return
      const pos = w2s(0, s.y)
      const len = Math.min(s.vy * 5, 110)
      ctx.beginPath()
      ctx.moveTo(pos.x, pos.y)
      ctx.lineTo(pos.x, pos.y + len)
      ctx.strokeStyle = "#e74c3c"
      ctx.lineWidth = 2.5
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(pos.x, pos.y + len)
      ctx.lineTo(pos.x - 6, pos.y + len - 10)
      ctx.lineTo(pos.x + 6, pos.y + len - 10)
      ctx.closePath()
      ctx.fillStyle = "#e74c3c"
      ctx.fill()
      ctx.fillStyle = "#e74c3c"
      ctx.font = "bold 11px sans-serif"
      ctx.fillText("V", pos.x + 10, pos.y + len * 0.5 + 4)
    },
  }
