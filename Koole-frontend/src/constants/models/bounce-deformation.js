// bounce-deformation 模型数据
export default {
    id: "bounce-deformation",
    level: "初中",
    category: "力学",
    name: "碰撞变形",
    desc: "弹性/非弹性碰撞，观察变形与能量损失",
    knowledge: `## 碰撞变形

恢复系数决定了碰撞有多"弹"：

- 恢复系数：$e = \\frac{v_{分离}}{v_{接近}}$
- 第 $n$ 次弹跳高度：$h_n = h_0 \\cdot e^{2n}$
- 每次碰撞能量损失比例：$(1-e^2)$

其中：$e$ 是恢复系数，$h_0$ 是初始高度，$h_n$ 是第 $n$ 次弹跳高度。

$e = 1$ 完全弹性反弹等高，$e = 0$ 完全非弹性直接"粘"住，中间的就是每次弹跳都矮一截。指数衰减——理论上弹无限次，但很快就看不出来了。

碰撞瞬间物体有形变，弹性好的能恢复，差的就永久变形了。动量在整个碰撞过程中守恒。

> 把 e 拉到 0 试试——物体直接"粘"在地上不弹了。`,
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="6" r="3"/><path d="M8 9v11"/><path d="M5 20h6"/><path d="M16 4l3 3-3 3"/><path d="M19 7h-6" opacity="0.4"/><line x1="2" y1="20" x2="22" y2="20"/></svg>`,
    params: [
      { key: "height", label: "初始高度 (m)", value: 10, min: 1, max: 30, step: 0.5 },
      { key: "restitution", label: "恢复系数 e", value: 0.8, min: 0, max: 1, step: 0.05 },
      { key: "gravity", label: "重力加速度 (m/s²)", value: 9.8, min: 1, max: 20, step: 0.1 },
    ],
    devNotes: `弹跳逻辑不复杂，形变效果是亮点：

\`\`\`js
if (s.y <= GROUND_Y && s.vy >= 0) {
  s.deform = Math.min(s.vy * 0.8, 12)  // 碰撞时压扁
  s.vy = -s.vy * p.restitution          // 反弹
  s.bounceCount++
}
s.deform *= 0.85  // 每帧恢复一点
\`\`\`

形变量跟碰撞速度成正比，然后每帧衰减——视觉上就是"压扁→恢复"的过程。

停止条件设成速度 < 0.3，不然会看到无限微小弹跳，很烦。
`,
  }
