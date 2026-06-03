// pulley 模型数据
export default {
    id: "pulley",
    level: "初中",
    category: "力学",
    name: "定滑轮",
    desc: "定滑轮改变力的方向，不省力",
    knowledge: `## 定滑轮

轴固定不动的滑轮，本质是等臂杠杆。不省力（$F = mg$，其中 $F$ 是拉力，$m$ 是物体质量，$g$ 是重力加速度），不省距离，但能改变方向——向下拉绳子可以让物体上升。

跟动滑轮对比：定滑轮改变方向但不省力，动滑轮省力但不改变方向。

轻绳假设下绳中张力处处相等，滑轮两侧拉力相同。

> 改变质量试试，拉力始终等于重力——定滑轮就是这么"诚实"。`,
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="6" r="4"/><line x1="12" y1="2" x2="12" y2="1"/><line x1="8" y1="10" x2="8" y2="20"/><line x1="16" y1="10" x2="16" y2="16"/></svg>`,
    params: [
      { key: "mass", label: "物体质量 (kg)", value: 2, min: 0.5, max: 10, step: 0.5 },
      { key: "pullForce", label: "拉力 (N)", value: 20, min: 0, max: 100, step: 1 },
      { key: "pulleyH", label: "滑轮高度 (m)", value: 5, min: 3, max: 7, step: 0.5 },
      { key: "initHeight", label: "初始高度 (m)", value: 2, min: 0.5, max: 4, step: 0.5 },
      { key: "gravity", label: "重力加速度 (m/s²)", value: 9.8, min: 1, max: 20, step: 0.1 },
    ],
    devNotes: `定滑轮的关键是绳长守恒——手拉多长，物体就升多高：

\`\`\`js
netF = pullForce - weight
a = netF / mass
s.effortY = 2 * H - s.ropeLen - s.y  // 绳长约束
\`\`\`

手和物体的位置联动，绳长不变。边界限制：物体不能超过滑轮高度。
`,
  }
