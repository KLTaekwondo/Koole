// pulley-system 模型数据
export default {
    id: "pulley-system",
    level: "初中",
    category: "力学",
    name: "滑轮组",
    desc: "定滑轮+动滑轮组合，省力又改变方向",
    knowledge: `## 滑轮组

定滑轮 + 动滑轮组合，既省力又能改变方向。

拉力 $F = \\frac{mg}{n}$，其中 $F$ 是拉力，$m$ 是质量，$g$ 是重力加速度，$n$ 是承担物重的绳子段数（本模型 n=2）。省力但费距离——拉绳距离 = 物体上升距离 × n。

绳子段数越多越省力，但实际中摩擦也越大，不能无限加。

> n=2 时拉力是重力的一半，同时能向下拉——结合了两种滑轮的优点。`,
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="6" r="3"/><circle cx="16" cy="12" r="3"/><line x1="8" y1="3" x2="8" y2="1"/><line x1="5" y1="9" x2="5" y2="20"/><line x1="11" y1="9" x2="16" y2="9"/><line x1="16" y1="15" x2="16" y2="22"/></svg>`,
    params: [
      { key: "mass", label: "物体质量 (kg)", value: 4, min: 0.5, max: 10, step: 0.5 },
      { key: "pullForce", label: "拉力 (N)", value: 20, min: 0, max: 100, step: 1 },
      { key: "ceilingH", label: "天花板高度 (m)", value: 10, min: 5, max: 15, step: 0.5 },
      { key: "initHeight", label: "初始高度 (m)", value: 3, min: 0.5, max: 10.0, step: 0.5 },
      { key: "gravity", label: "重力加速度 (m/s²)", value: 9.8, min: 1, max: 20, step: 0.1 },
    ],
    devNotes: `滑轮组力学跟动滑轮一样（n=2），但绳子布局复杂一些：

\`\`\`js
netF = 2 * pullForce - weight
a = netF / mass
s.effortY = H + SLACK - 2 * s.y + ROPE_END_OFFSET
\`\`\`

绳子路径：天花板锚点 → 动滑轮 → 定滑轮 → 手。绳长计算要加 SLACK（余量）和 ROPE_END_OFFSET（绳端偏移），不然绳子会绷得太紧或太松。

边界检测：动滑轮不能撞天花板，手不能穿过地板。
`,
  }
