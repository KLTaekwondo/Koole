// connected-bodies 模型数据
export default {
    id: "connected-bodies",
    level: "高中",
    category: "力学",
    name: "连接体",
    desc: "两个物体通过定滑轮连接，整体法与隔离法分析",
    knowledge: `## 连接体（滑轮模型）

整体法与隔离法的经典应用。一个物体在桌上滑，一个悬着，用绳连着过定滑轮。

桌上的 $m_1$ 受绳拉力向右、摩擦力 $\\mu m_1 g$ 向左；悬着的 $m_2$ 受重力 $m_2 g$ 向下、绳拉力向上。

- 加速度：$a = \\frac{m_2 g - \\mu m_1 g}{m_1 + m_2}$
- 张力：$T = m_1(a + \\mu g)$

其中：$m_1$ 是桌面上物体的质量，$m_2$ 是悬挂物体的质量，$\\mu$ 是摩擦系数，$a$ 是加速度，$T$ 是绳中张力。

记住：整体法求加速度（两物体当一个整体），隔离法求张力（单独分析一个物体）。系统运动的条件是 $m_2 g > \\mu m_1 g$，不然拉不动。轻绳假设下绳中张力处处相等，两物体加速度大小相等。

> $m_2$ 太轻就拉不动——调参数找到那个临界质量比。`,
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="14" width="8" height="4" fill="rgba(0,0,0,0.08)"/><circle cx="12" cy="10" r="2" fill="none"/><rect x="14" y="4" width="6" height="6" rx="1" fill="rgba(0,0,0,0.1)"/><line x1="12" y1="12" x2="8" y2="14"/><line x1="12" y1="12" x2="17" y2="10"/></svg>`,
    params: [
      { key: "m1", label: "桌面质量 (kg)", value: 2, min: 0.3, max: 10, step: 0.2 },
      { key: "m2", label: "悬挂质量 (kg)", value: 1, min: 0.3, max: 10, step: 0.2 },
      { key: "mu", label: "桌面摩擦系数 μ", value: 0.2, min: 0, max: 1, step: 0.05 },
      { key: "gravity", label: "重力加速度 (m/s²)", value: 9.8, min: 1, max: 20, step: 0.1 },
    ],
    devNotes: `连接体的物理公式很直观，整体法求加速度，隔离法求张力：

\`\`\`js
a = (m2*g - mu*m1*g) / (m1 + m2)
T = m1 * (a + mu * g)
\`\`\`

主要处理几个边界情况：
- m2 太轻拉不动 → 加速度为 0，显示提示
- m1 不能跑到滑轮右边，m2 不能掉到地面以下 → 计算最大位移

摩擦系数可以调，观察它对运动的影响——摩擦越大，需要 m2 越重才能拉动。
`,
  }
