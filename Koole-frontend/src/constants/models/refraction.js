// refraction 模型数据
export default {
    id: "refraction",
    level: "初中",
    category: "光学",
    name: "光的折射",
    desc: "光线在两种介质界面上的折射与全反射",
    knowledge: `## 光的折射

斯涅尔定律（折射定律）：光从介质 1 进入介质 2 时，入射角和折射角满足

$$n_1 \\sin\\theta_1 = n_2 \\sin\\theta_2$$

其中：$n_1$/$n_2$ 是两种介质的折射率，$\\theta_1$ 是入射角，$\\theta_2$ 是折射角。

几个要点：
- 光从光疏介质进入光密介质（如空气→水），折射角 < 入射角，光线向法线偏折
- 光从光密介质进入光疏介质（如水→空气），折射角 > 入射角，光线远离法线
- 垂直入射（$\\theta_1=0°$）不发生偏折，$\\theta_2=0°$

**全反射**：光从光密介质射向光疏介质时，入射角增大到**临界角** $\\theta_c$ 后，折射光消失，全部反射回来。

$$\\theta_c = \\arcsin\\frac{n_2}{n_1} \\quad (n_1 > n_2)$$

全反射的两个条件：① 光从光密到光疏；② 入射角 ≥ 临界角。光纤、全反射棱镜都是这个原理。

> 调成"水→空气"（n₁=1.33, n₂=1.0），把入射角拉大到 49° 以上就能看到全反射。`,
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="2" x2="12" y2="22" stroke-dasharray="3 2" opacity="0.4"/><line x1="4" y1="6" x2="12" y2="12"/><line x1="12" y1="12" x2="20" y2="18"/><rect x="0" y="12" width="24" height="12" fill="rgba(52,152,219,0.1)"/></svg>`,
    params: [
      { key: "incidentAngle", label: "入射角 (°)", value: 30, min: 0, max: 89, step: 1 },
      { key: "n1", label: "介质1折射率 n₁", value: 1.0, min: 1.0, max: 2.5, step: 0.01 },
      { key: "n2", label: "介质2折射率 n₂", value: 1.33, min: 1.0, max: 2.5, step: 0.01 },
    ],
    devNotes: `## 开发笔记

光的折射模型跟其他力学模型不一样——没有动画，是静态的光路图。所以 step 里基本不用算什么，主要工作量在渲染器上。

核心计算就一行：\`Math.asin(n1 / n2 * Math.sin(theta1))\`。但要注意 Math.asin 的输入必须在 [-1, 1] 之间，n1/n2 * sin(θ1) 可能超过 1（全反射），要 clamp。

全反射判断：\`n1 > n2 && n1/n2 * sin(θ1) > 1\`。这时候折射角不存在，全部反射。

渲染上画了法线、入射光线、反射光线、折射光线，还有角度弧线标注。入射点固定在画布中间，法线垂直。两种介质用不同背景色区分。
`,
  }
