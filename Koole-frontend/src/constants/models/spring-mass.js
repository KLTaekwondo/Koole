// spring-mass 模型数据
export default {
    id: "spring-mass",
    level: "高中",
    category: "力学",
    name: "弹簧振子",
    desc: "物体在弹簧作用下的简谐振动，动能与势能相互转化",
    knowledge: `## 弹簧振子

核心就是胡克定律 $F = -kx$，回复力跟位移成正比、方向相反。

- 加速度：$a = -\\frac{k}{m}x$
- 位移：$x(t) = A\\cos(\\omega t + \\varphi)$
- 角频率：$\\omega = \\sqrt{\\frac{k}{m}}$
- 周期：$T = 2\\pi\\sqrt{\\frac{m}{k}}$（跟振幅无关！）

其中：$k$ 是劲度系数，$m$ 是质量，$x$ 是位移，$A$ 是振幅，$\\omega$ 是角频率，$\\varphi$ 是初相位，$T$ 是周期。

能量方面：
- 动能 $E_k = \\frac{1}{2}mv^2$
- 弹性势能 $E_p = \\frac{1}{2}kx^2$
- 总机械能 $E = \\frac{1}{2}kA^2$ 守恒

其中：$E_k$ 是动能，$E_p$ 是弹性势能，$v$ 是速度。

平衡位置（$x=0$）速度最大、势能为零；最大位移处速度为零、势能最大。动能和势能一直在互相转化，但总和不变。

> 能量条的变化很直观——动能和势能像跷跷板，总能量那条线始终不动。`,
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="6" x2="3" y2="20"/><polyline points="3,13 6,9 9,17 12,9 15,17 18,13"/><rect x="16" y="8" width="7" height="7" fill="rgba(0,0,0,0.1)"/></svg>`,
    params: [
      { key: "mass", label: "质量 (kg)", value: 1, min: 0.2, max: 5, step: 0.1 },
      { key: "k", label: "劲度系数 (N/m)", value: 10, min: 1, max: 30, step: 0.5 },
      { key: "initX", label: "初始位移 (m)", value: 2, min: 0.3, max: 5, step: 0.1 },
    ],
    devNotes: `弹簧振子的物理逻辑很简洁，就是胡克定律：

\`\`\`js
a = -(k / mass) * s.x
s.vx += a * dt
s.x += s.vx * dt
\`\`\`

动能和势能每帧都算，图表同时显示三条曲线（位置、速度、能量），能直观看到能量守恒。

弹簧的 zigzag 绘制花了不少时间——要根据物体位置动态调整弹簧的压缩和拉伸，画得好看不容易。物理逻辑和渲染逻辑分开，renderer 负责画弹簧，physics 只管算数。

动画跑 3 个周期就停，足够看清重复 pattern。
`,
  }
