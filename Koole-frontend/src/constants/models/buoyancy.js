// buoyancy 模型数据
export default {
    id: "buoyancy",
    level: "初中",
    category: "力学",
    name: "浮力",
    desc: "阿基米德原理：物体在液体中的浮沉与平衡",
    knowledge: `## 浮力

阿基米德原理：浮力 = 排开液体的重力。

- 浮力：$F_{浮} = \\rho_{液} g V_{排}$
- 物体重力：$G = \\rho_{物} g V_{物}$
- 漂浮时浸没比：$\\frac{V_{排}}{V_{物}} = \\frac{\\rho_{物}}{\\rho_{液}}$

其中：$F_{浮}$ 是浮力，$\\rho_{液}$ 是液体密度，$V_{排}$ 是排开液体体积，$G$ 是物体重力，$\\rho_{物}$ 是物体密度，$V_{物}$ 是物体体积。

浮沉条件很好记：密度比液体小就漂浮，相等就悬浮，大就沉底。比如木头密度是水的 0.6，就浸 60%。

浮力跟深度无关！漂浮时不管浸多深，浮力都等于重力。浮力本质是上下表面压力差，不是什么"液体的托力"。

轮船能浮是因为做成空心的增大了排水体积，不是钢铁变轻了。

> 密度比液体小时漂浮，浸没比例正好等于密度比——记住这个关系。`,
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="10" width="16" height="10" rx="1" fill="rgba(52,152,219,0.15)"/><rect x="8" y="4" width="8" height="8" rx="1"/><path d="M12 14l-2-2m2 2l2-2" stroke-width="1.5"/></svg>`,
    params: [
      { key: "rhoObj", label: "物体密度 (kg/m³)", value: 600, min: 100, max: 3000, step: 50 },
      { key: "rhoLiquid", label: "液体密度 (kg/m³)", value: 1000, min: 500, max: 2000, step: 50 },
      { key: "volume", label: "体积 (m³)", value: 0.125, min: 0.01, max: 1, step: 0.01 },
      { key: "gravity", label: "重力加速度 (m/s²)", value: 9.8, min: 1, max: 20, step: 0.1 },
      { key: "liquidH", label: "液面高度 (m)", value: 3, min: 1.5, max: 6, step: 0.5 },
    ],
    devNotes: `浮力的难点不在公式，在于部分浸没的计算：

\`\`\`js
hSub = Math.min(top, liquidH) - Math.max(bottom, 0)
Vsub = hSub * side * side
Fb = rhoLiquid * gravity * Vsub
G = rhoObj * gravity * volume
a = (G - Fb) / (rhoObj * volume)
if (hSub > 0) a -= vy * 5  // 液体阻尼
\`\`\`

用立方体近似物体，计算浸没高度。液体阻尼很重要——没有阻尼的话物体在液面附近永远振荡，不会稳定在漂浮位置。
`,
  }
