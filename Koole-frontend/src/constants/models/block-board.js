// block-board 模型数据
export default {
    id: "block-board",
    level: "高中",
    category: "力学",
    name: "板块模型",
    desc: "滑块在木板上滑动，摩擦作用下的相对运动，高考经典",
    knowledge: `## 板块模型

高考力学压轴题的常客。滑块在木板上滑，摩擦力让滑块减速、木板加速，最终共速。

受力：滑块 m 受向左的摩擦力 $f = \\mu mg$（减速），木板 M 受向右的反作用力（加速）。

- 滑块加速度：$a_m = -\\mu g$
- 木板加速度：$a_M = \\frac{\\mu m g}{M}$
- 共速速度：$v_{共} = \\frac{mv_0}{m+M}$

其中：$m$ 是滑块质量，$M$ 是木板质量，$\\mu$ 是摩擦系数，$a_m$/$a_M$ 是滑块/木板加速度，$v_{共}$ 是共速后的速度，$v_0$ 是滑块初速度。

共速后相对运动消失，系统一起动。

有个公式很重要：$Q = f \\cdot \\Delta x_{相对}$——其中 $Q$ 是产生的热量，$f$ 是摩擦力，$\\Delta x_{相对}$ 是相对位移（不是各自位移！），不是各自位移！这个区别考试经常考。

共速后是否继续滑取决于最大静摩擦力。木板不够长的话滑块会滑落——这是常见的临界问题。

> 看速度曲线——滑块减速、木板加速，两条线交叉就是共速时刻。`,
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="14" width="18" height="6" rx="1" fill="rgba(0,0,0,0.06)"/><rect x="10" y="8" width="6" height="6" fill="rgba(0,0,0,0.12)"/><line x1="13" y1="11" x2="19" y2="11" stroke="#e67e22" stroke-width="2"/><line x1="13" y1="17" x2="8" y2="17" stroke="#3498db" stroke-width="2"/><polyline points="19,9 22,11 19,13"/><polyline points="8,15 5,17 8,19"/></svg>`,
    params: [
      { key: "M", label: "木板质量 (kg)", value: 3, min: 0.5, max: 20, step: 0.5 },
      { key: "m", label: "滑块质量 (kg)", value: 1, min: 0.2, max: 10, step: 0.2 },
      { key: "v0", label: "滑块初速度 (m/s)", value: 4, min: 1, max: 15, step: 0.5 },
      { key: "mu", label: "摩擦系数 μ", value: 0.3, min: 0.05, max: 0.8, step: 0.05 },
      { key: "boardLength", label: "木板长度 (m)", value: 6, min: 2, max: 15, step: 0.5 },
      { key: "gravity", label: "重力加速度 (m/s²)", value: 9.8, min: 1, max: 20, step: 0.1 },
    ],
    devNotes: `两个物体分别算加速度，共速后合并：

\`\`\`js
a_block = -mu * g
a_board = mu * m * g / M
v_cm = (m*v0) / (m+M)
\`\`\`

相对位移要算准——用 \`xb - xB\` 而不是各自位移。滑落检测：相对位移 >= 木板长度。

图表同时显示两个物体的速度曲线，交叉点就是共速时刻，很直观。
`,
  }
