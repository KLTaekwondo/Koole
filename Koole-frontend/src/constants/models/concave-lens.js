// concave-lens 模型数据
export default {
    id: "concave-lens",
    level: "初中",
    category: "光学",
    name: "凹透镜成像",
    desc: "凹透镜始终成正立缩小的虚像",
    knowledge: `## 凹透镜成像

凹透镜比凸透镜简单多了——不管物距多少，永远成**正立、缩小、虚像**。

公式跟凸透镜一样，但焦距 $f < 0$（虚焦点）：
$$\\frac{1}{f} = \\frac{1}{u} + \\frac{1}{v}$$

其中：$f$ 是焦距（凹透镜为负值），$u$ 是物距，$v$ 是像距（始终为负，表示虚像）。

跟凸透镜对比：凸透镜会聚、凹透镜发散；凸透镜可实可虚、凹透镜只能虚像。近视眼镜就是凹透镜。

三条特殊光线：平行光轴的折射反向延长线过焦点，过光心不变，射向焦点的折射平行光轴。

> 凹透镜的像永远在物体同侧、焦点以内——记住这个就够了。`,
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="12" rx="3" ry="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M6 6l-2-2M6 18l-2 2M18 6l2-2M18 18l2 2"/></svg>`,
    params: [
      { key: "focalLength", label: "焦距 |f| (cm)", value: 10, min: 3, max: 20, step: 1 },
      { key: "objectDist", label: "物距 u (cm)", value: 30, min: 3, max: 60, step: 1 },
      { key: "objectHeight", label: "物高 (cm)", value: 4, min: 1, max: 8, step: 0.5 },
      { key: "showRays", label: "显示光线", value: 1, min: 0, max: 1, step: 1 },
    ],
    devNotes: `跟凸透镜几乎一样，就是焦距取负：

\`\`\`js
f = -p.focalLength
v = (f * u) / (u - f)
\`\`\`

输入焦距取绝对值，计算时取负。虚像用虚线表示。

比凸透镜简单——不用处理各种成像情况，永远是"正立、缩小、虚像"。
`,
  }
