// convex-lens 模型数据
export default {
    id: "convex-lens",
    level: "初中",
    category: "光学",
    name: "凸透镜成像",
    desc: "物距与像距的关系，观察实像与虚像",
    knowledge: `## 凸透镜成像

薄透镜公式：
$$\\frac{1}{f} = \\frac{1}{u} + \\frac{1}{v}$$

其中：$f$ 是焦距，$u$ 是物距（物体到透镜的距离），$v$ 是像距（像到透镜的距离，实像为正、虚像为负）。

成像规律表要背下来：
- $u > 2f$：倒立缩小实像（照相机）
- $u = 2f$：倒立等大实像（测焦距）
- $f < u < 2f$：倒立放大实像（投影仪）
- $u = f$：不成像（平行光源）
- $u < f$：正立放大虚像（放大镜）

口诀：**一倍焦距分虚实，二倍焦距分大小**。

三条特殊光线：平行光轴折射过焦点，过光心方向不变，过焦点折射平行光轴。

物距等于焦距时像"消失"了（在无穷远），小于焦距时变成正立放大虚像——这就是放大镜原理。

> 一倍焦距分虚实，二倍焦距分大小——记住这个口诀做题快很多。`,
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="12" rx="3" ry="10"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="12" y1="2" x2="12" y2="22"/></svg>`,
    params: [
      { key: "focalLength", label: "焦距 f (cm)", value: 10, min: 3, max: 20, step: 1 },
      { key: "objectDist", label: "物距 u (cm)", value: 30, min: 3, max: 60, step: 1 },
      { key: "objectHeight", label: "物高 (cm)", value: 4, min: 1, max: 8, step: 0.5 },
      { key: "showRays", label: "显示光线", value: 1, min: 0, max: 1, step: 1 },
    ],
    devNotes: `薄透镜公式直接算：

\`\`\`js
v = (f * u) / (u - f)
magnification = Math.abs(v) / u
imageH = h * magnification
\`\`\`

u ≈ f 时像距趋近无穷大，要特殊处理——不然数值爆炸。

三条特殊光线的绘制在 renderer 里，物理逻辑只管算像距和像高。虚像用 v < 0 判断。
`,
  }
