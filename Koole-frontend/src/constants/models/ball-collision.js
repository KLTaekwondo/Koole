// ball-collision 模型数据
export default {
    id: "ball-collision",
    level: "高中",
    category: "力学",
    name: "两球碰撞",
    desc: "两个小球在水平方向上的弹性/非弹性碰撞",
    knowledge: `## 两球碰撞

动量守恒 + 能量守恒（弹性碰撞时）的综合应用。

动量**始终**守恒：
$$m_1 v_1 + m_2 v_2 = m_1 v_1' + m_2 v_2'$$

动能**仅弹性碰撞时**守恒：
$$\\frac{1}{2}m_1 v_1^2 + \\frac{1}{2}m_2 v_2^2 = \\frac{1}{2}m_1 v_1'^2 + \\frac{1}{2}m_2 v_2'^2$$

其中：$m_1$/$m_2$ 是两球质量，$v_1$/$v_2$ 是碰撞前速度，$v_1'$/$v_2'$ 是碰撞后速度。

完全弹性碰撞公式：
- $v_1' = \\frac{(m_1-m_2)v_1 + 2m_2 v_2}{m_1+m_2}$
- $v_2' = \\frac{(m_2-m_1)v_2 + 2m_1 v_1}{m_1+m_2}$

三种特殊情况做题常考：等质量速度交换，球1远重则球2以约 $2v_1$ 弹出，球1远轻则球1弹回。

> 等质量碰撞试试——速度完全交换，牛顿摆就是这个原理。`,
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="7" cy="12" r="3"/><circle cx="17" cy="12" r="3"/><line x1="10" y1="12" x2="14" y2="12"/><polygon points="14,10 14,14 16,12"/></svg>`,
    params: [
      { key: "m1", label: "球1质量 (kg)", value: 1, min: 0.1, max: 10, step: 0.1 },
      { key: "v1", label: "球1初速度 (m/s)", value: 3, min: -10, max: 10, step: 0.5 },
      { key: "m2", label: "球2质量 (kg)", value: 1, min: 0.1, max: 10, step: 0.1 },
      { key: "v2", label: "球2初速度 (m/s)", value: -2, min: -10, max: 10, step: 0.5 },
      { key: "restitution", label: "碰撞类型", value: 1, options: [
        { value: 1, label: "完全弹性碰撞" },
        { value: 0, label: "完全非弹性碰撞" },
      ]},
    ],
    devNotes: `碰撞检测用距离判断，碰撞后用弹性公式算新速度：

\`\`\`js
if (!s.collided && s.x2 - s.x1 < MIN_DIST && s.v1 > s.v2) {
  s.v1 = ((m1-m2)*v1 + 2*m2*v2) / (m1+m2)
  s.v2 = ((m2-m1)*v2 + 2*m1*v1) / (m1+m2)
}
\`\`\`

高速时球可能穿透——碰撞时修正重叠位置解决。

碰撞前后速度都记录下来（\`_preV1\`, \`_postV1\` 等），用于显示动量和动能对比。碰撞后继续模拟 1 秒让用户看清结果。
`,
  }
