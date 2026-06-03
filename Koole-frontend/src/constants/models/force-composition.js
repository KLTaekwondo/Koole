// force-composition 模型数据
export default {
    id: "force-composition",
    level: "初中",
    category: "力学",
    name: "力的合成",
    desc: "平行四边形法则：两个力的合力与分解",
    knowledge: `## 力的合成

平行四边形法则，合力用余弦定理：

- 合力大小：$F = \\sqrt{F_1^2 + F_2^2 + 2 F_1 F_2 \\cos\\theta}$
- 合力范围：$|F_1 - F_2| \\leq F \\leq F_1 + F_2$

其中：$F_1$/$F_2$ 是两个分力，$\\theta$ 是两力夹角，$F$ 是合力大小。

特殊情况记住：0° 合力最大 $F_1 + F_2$，90° 勾股定理 $\\sqrt{F_1^2 + F_2^2}$，180° 最小 $|F_1 - F_2|$。夹角越大合力越小。等大 120° 时合力等于分力，这个结论很巧妙。

三个力平衡时：任意两个力的合力与第三个力等大反向。

> 90° 验证勾股定理，180° 看合力最小——调参数很直观。`,
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="12" x2="4" y2="6"/><line x1="12" y1="12" x2="20" y2="6"/><line x1="12" y1="12" x2="12" y2="20" stroke="#2ecc71"/></svg>`,
    params: [
      { key: "F1", label: "力 F₁ (N)", value: 5, min: 1, max: 15, step: 0.5 },
      { key: "F2", label: "力 F₂ (N)", value: 5, min: 1, max: 15, step: 0.5 },
      { key: "angle", label: "夹角 θ (°)", value: 60, min: 0, max: 180, step: 5 },
    ],
    devNotes: `静态模型，没有动画，就是实时计算合力：

\`\`\`js
Fr = Math.sqrt(F1² + F2² + 2*F1*F2*Math.cos(theta))
\`\`\`

余弦定理直接用，记得转弧度。图表显示合力随夹角的变化曲线——从 0° 到 180° 递减，很直观。
`,
  }
