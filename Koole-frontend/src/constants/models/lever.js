// lever 模型数据
export default {
    id: "lever",
    level: "初中",
    category: "力学",
    name: "杠杆",
    desc: "杠杆平衡条件：力×力臂 = 力×力臂",
    knowledge: `## 杠杆

核心就一句话：$F_1 \\times L_1 = F_2 \\times L_2$。其中 $F_1$/$F_2$ 是两边的力，$L_1$/$L_2$ 是对应的力臂（支点到力的作用线的垂直距离）。力矩平衡了杠杆就平了。

三种杠杆其实很好记：
- 力臂长的那边省力（省力杠杆）——剪刀、钳子
- 力臂短的那边费力但省距离（费力杠杆）——钓鱼竿、筷子
- 一样长就是天平

力臂这个概念很多人搞错。力臂不是"支点到力的作用点的距离"，是支点到**力的作用线**的垂直距离。也就是说，同一个力，方向变了力臂就变了。这个点考试特别爱考，画图题经常让你标力臂。

> 调一下参数让两边力矩相等，杠杆就水平了——挺直观的。`,
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 4 8 10 16 10" fill="rgba(0,0,0,0.08)"/><line x1="2" y1="8" x2="22" y2="8"/><circle cx="4" cy="6" r="1.5"/><circle cx="20" cy="6" r="1.5"/></svg>`,
    params: [
      { key: "F1", label: "左侧力 F₁ (N)", value: 3, min: 0, max: 20, step: 0.5 },
      { key: "d1", label: "左侧力臂 L₁ (m)", value: 3, min: 0.5, max: 5, step: 0.1 },
      { key: "dir1", label: "F₁ 方向", value: 1, options: [{ label: "↓ 向下", value: 1 }, { label: "↑ 向上", value: -1 }] },
      { key: "F2", label: "右侧力 F₂ (N)", value: 2, min: 0, max: 20, step: 0.5 },
      { key: "d2", label: "右侧力臂 L₂ (m)", value: 2, min: 0.5, max: 5, step: 0.1 },
      { key: "dir2", label: "F₂ 方向", value: 1, options: [{ label: "↓ 向下", value: 1 }, { label: "↑ 向上", value: -1 }] },
    ],
    devNotes: `杠杆用力矩平衡驱动旋转：

\`\`\`js
tau = F2 * d2 * dir2 - F1 * d1 * dir1
alpha = tau / I - 0.8 * omega  // 阻尼
\`\`\`

阻尼项 \`-0.8 * omega\` 很重要，不然杠杆会永远振荡不停。力的方向（向上/向下）用 \`dir\` 参数支持。

力矩方向一开始搞混了——向下力在左边产生逆时针力矩，在右边产生顺时针力矩。画了个图才理清楚。
`,
  }
