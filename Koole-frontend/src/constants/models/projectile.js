// projectile 模型数据
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
  }
