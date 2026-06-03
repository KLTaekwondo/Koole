// angled-projectile 模型数据
export default {
    id: "angled-projectile",
    level: "高中",
    category: "力学",
    name: "斜向上抛",
    desc: "物体以一定角度斜向上抛出，抛物线运动",
    knowledge: `## 斜向上抛运动

平抛的"升级版"，初速度有竖直分量。

- 水平：$x = v_0\\cos\\theta \\cdot t$（匀速）
- 竖直：$y = v_0\\sin\\theta \\cdot t - \\frac{1}{2}gt^2$（匀减速）
- 最大高度：$H = \\frac{v_0^2 \\sin^2\\theta}{2g}$
- 水平射程：$R = \\frac{v_0^2 \\sin 2\\theta}{g}$
- 飞行总时间：$T = \\frac{2v_0\\sin\\theta}{g}$

其中：$v_0$ 是初速度，$\\theta$ 是抛射角，$H$ 是最大高度，$R$ 是水平射程，$T$ 是总时间。

45° 射程最远是因为 $\\sin 2\\theta$ 最大——但仅限起落等高！如果起点比落点高，最佳角度会小于 45°，这个很多人忘。

还有个结论做选择题很好用：互补角（$\\theta$ 和 $90°-\\theta$）射程相同。试试 30° 和 60°，射程一样。

> 30° 和 60° 射程一样——互补角就是这么神奇。`,
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="2" y1="20" x2="22" y2="20"/><path d="M4 20 Q12 2 20 16" stroke-dasharray="3 2"/><circle cx="20" cy="16" r="2"/><line x1="4" y1="20" x2="10" y2="10"/><polyline points="11 6 10 10 14 9"/></svg>`,
    params: [
      { key: "initialVelocity", label: "初速度 (m/s)", value: 15, min: 5, max: 40, step: 0.5 },
      { key: "angle", label: "抛射角 (°)", value: 45, min: 5, max: 85, step: 1 },
      { key: "gravity", label: "重力加速度 (m/s²)", value: 9.8, min: 1, max: 20, step: 0.1 },
    ],
    devNotes: `在平抛基础上加了竖直初速度分量，物理逻辑不复杂，但符号处理要小心——向上为正，所以重力是负的。

\`\`\`js
vx = v0 * Math.cos(theta)
vy = v0 * Math.sin(theta)
s.vy -= gravity * dt  // 注意减号
\`\`\`

射程和最大高度我用公式直接算理论值显示，不从模拟数据里提取——公式更准，不受模拟精度影响。

抛射角限制在 5°-85°，接近 0° 或 90° 时动画效果不好（要么几乎水平要么几乎垂直）。
`,
  }
