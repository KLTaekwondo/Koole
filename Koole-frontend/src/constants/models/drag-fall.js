// drag-fall 模型数据
export default {
    id: "drag-fall",
    level: "高中",
    category: "力学",
    name: "空气阻力落体",
    desc: "考虑空气阻力的自由落体，最终达到收尾速度",
    knowledge: `## 空气阻力落体

自由落体的"现实版"。加了阻力之后物体不会无限加速，而是趋近一个恒定的收尾速度。

受力：重力 $mg$ 向下，阻力 $f = bv$ 向上（阻力随速度增大）。

- 合力：$ma = mg - bv$
- 收尾速度：$v_t = \\frac{mg}{b}$
- 速度-时间关系：$v(t) = v_t(1 - e^{-\\frac{b}{m}t})$

其中：$m$ 是质量，$g$ 是重力加速度，$b$ 是阻力系数，$v$ 是速度，$v_t$ 是收尾速度（极限速度）。

指数趋近——理论上永远到不了收尾速度，但实际上很快就"差不多"了。

阻力系数 $b$ 越大收尾速度越小，质量越大收尾速度越大。跳伞、雨滴、灰尘沉降都是这个原理。

> "已接近收尾"百分比很直观——到 90% 之后加速极其缓慢，雨滴就是这么变匀速的。`,
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="2" x2="12" y2="14"/><path d="M12 14l-3 3"/><path d="M12 14l3 3"/><circle cx="12" cy="19" r="3"/><path d="M6 6 Q8 8 12 6 Q16 8 18 6" opacity="0.3"/><path d="M4 9 Q8 11 12 9 Q16 11 20 9" opacity="0.2"/></svg>`,
    params: [
      { key: "height", label: "初始高度 (m)", value: 50, min: 10, max: 100, step: 2 },
      { key: "mass", label: "质量 (kg)", value: 1, min: 0.1, max: 10, step: 0.1 },
      { key: "dragCoeff", label: "阻力系数 b", value: 0.5, min: 0.05, max: 3, step: 0.05 },
      { key: "gravity", label: "重力加速度 (m/s²)", value: 9.8, min: 1, max: 20, step: 0.1 },
    ],
    devNotes: `比自由落体复杂一点——加速度随速度变化，不是匀加速了。

\`\`\`js
a = gravity - (dragCoeff / mass) * s.vy
s.vy += a * dt
s.y -= s.vy * dt
\`\`\`

选了线性阻力模型 \`f = bv\` 而不是二次阻力 \`f = bv²\`，主要是计算简单，而且定性效果差不多。

收尾速度理论值 \`mg/b\` 直接算出来显示，同时显示"已接近收尾"百分比——到 90% 以后加速极其缓慢，这个可视化效果很直观。

初始高度设 50m，给足够时间看到加速→匀速的过渡过程。
`,
  }
