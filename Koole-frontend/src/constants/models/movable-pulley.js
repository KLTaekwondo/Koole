// movable-pulley 模型数据
export default {
    id: "movable-pulley",
    level: "初中",
    category: "力学",
    name: "动滑轮",
    desc: "动滑轮省一半力，但费一倍距离",
    knowledge: `## 动滑轮

轴随物体一起动的滑轮，本质是动力臂为阻力臂 2 倍的杠杆。

省一半力 $F = \\frac{mg}{2}$（$F$ 是拉力，$m$ 是质量，$g$ 是重力加速度），但费一倍距离 $s_{拉} = 2s_{物}$（$s_{拉}$ 是拉绳距离，$s_{物}$ 是物体上升距离），不能改变方向。省力的代价是费距离——能量守恒，没有免费的午餐。

> 改变质量，拉力始终是重力的一半——两段绳子分担了重量。`,
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><line x1="8" y1="4" x2="8" y2="8"/><line x1="16" y1="4" x2="16" y2="8"/><line x1="12" y1="16" x2="12" y2="22"/></svg>`,
    params: [
      { key: "mass", label: "物体质量 (kg)", value: 4, min: 0.5, max: 10, step: 0.5 },
      { key: "pullForce", label: "拉力 (N)", value: 25, min: 0, max: 100, step: 1 },
      { key: "ceilingH", label: "天花板高度 (m)", value: 10, min: 3, max: 15, step: 0.5 },
      { key: "initHeight", label: "初始高度 (m)", value: 3, min: 0.5, max: 10.0, step: 0.5 },
      { key: "gravity", label: "重力加速度 (m/s²)", value: 9.8, min: 1, max: 20, step: 0.1 },
    ],
    devNotes: `动滑轮的力学关键是两段绳子分担重量：

\`\`\`js
netF = 2 * pullForce - weight
a = netF / mass
s.effortY = s._effortY0 + 2 * (s.y - s._y0)  // 绳长守恒
\`\`\`

手拉 2m，重物只升 1m——距离换力。滑轮位置随重物联动。
`,
  }
