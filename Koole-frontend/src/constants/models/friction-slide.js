// friction-slide 模型数据
export default {
    id: "friction-slide",
    level: "初中",
    category: "力学",
    name: "粗糙面滑动",
    desc: "物体在粗糙水平面上因摩擦力而减速直至停止",
    knowledge: `## 粗糙面滑动

匀减速运动。摩擦力做负功，把动能全部吃掉。

- 摩擦力：$f = \\mu mg$
- 减速度：$a = \\mu g$（注意跟质量无关！）
- 停止距离：$x = \\frac{v_0^2}{2\\mu g}$
- 停止时间：$t = \\frac{v_0}{\\mu g}$

其中：$f$ 是摩擦力，$\\mu$ 是摩擦系数，$m$ 是质量，$a$ 是减速度，$x$ 是停止距离，$v_0$ 是初速度，$t$ 是停止时间。

摩擦力大小只取决于 $\\mu$ 和 $N$，跟速度没关系——不管快还是慢，摩擦力一样大。

停止距离跟初速度是**平方**关系！速度翻倍刹车距离变 4 倍，这就是高速要保持车距的原因。减速度跟质量无关，所以不同质量的车在同一路面刹车距离一样（理想情况）。

能量角度：摩擦力做功 $W = -\\mu mgx$，把动能全转化成内能（发热）。

> 初速度从 8 调到 16，停止距离直接变 4 倍——平方关系。`,
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="2" y1="17" x2="22" y2="17"/><line x1="4" y1="17" x2="6" y2="13"/><line x1="9" y1="17" x2="11" y2="13"/><line x1="14" y1="17" x2="16" y2="13"/><line x1="19" y1="17" x2="21" y2="13"/><rect x="6" y="7" width="7" height="8" fill="rgba(0,0,0,0.1)"/><polyline points="20,6 22,12 18,12"/></svg>`,
    params: [
      { key: "v0", label: "初速度 (m/s)", value: 8, min: 1, max: 20, step: 0.5 },
      { key: "mu", label: "摩擦系数 μ", value: 0.3, min: 0.05, max: 1, step: 0.05 },
      { key: "gravity", label: "重力加速度 (m/s²)", value: 9.8, min: 1, max: 20, step: 0.1 },
    ],
    devNotes: `匀减速，逻辑简单：

\`\`\`js
a = mu * gravity
s.vx -= a * dt
s.x += s.vx * dt
\`\`\`

停止判断要注意：速度 ≤ 0 时强制归零，不然物体可能"倒退"。理论停止距离 \`v₀²/(2μg)\` 直接用公式算出来显示，比从模拟数据提取准确。

摩擦系数 0.05-1 覆盖了从冰面到橡胶的范围。
`,
  }
