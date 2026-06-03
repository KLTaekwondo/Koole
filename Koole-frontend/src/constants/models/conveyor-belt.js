// conveyor-belt 模型数据
export default {
    id: "conveyor-belt",
    level: "高中",
    category: "力学",
    name: "传送带",
    desc: "物块在传送带上的运动，摩擦力驱动的加速与匀速",
    knowledge: `## 传送带

摩擦力方向判断的经典模型。关键就一句话：摩擦力方向看**相对运动**，不看运动方向。

- 有相对滑动时加速度：$a = \\mu g$
- 物块比带慢 → 摩擦力向前（加速）
- 物块比带快 → 摩擦力向后（减速）
- 共速后相对运动消失，摩擦力变为零

其中：$a$ 是加速度，$\\mu$ 是动摩擦因数，$g$ 是重力加速度。

最容易错的地方：摩擦力方向不是运动方向！比如物块向右运动但比传送带慢，摩擦力还是向右的。

划痕长度 = 物块与传送带的**相对位移**，不是物块的位移，这个区别考试经常考。能量角度：摩擦力做功转化为物块动能和系统内能（发热）。

> 初速度设成负值试试——物块先被减速，停了再反向加速到跟带同速。`,
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="10" width="20" height="4" rx="1" fill="rgba(0,0,0,0.06)"/><circle cx="4" cy="12" r="2" fill="none"/><circle cx="20" cy="12" r="2" fill="none"/><rect x="9" y="6" width="5" height="5" rx="1" fill="rgba(0,0,0,0.1)"/><line x1="2" y1="17" x2="22" y2="17"/></svg>`,
    params: [
      { key: "beltSpeed", label: "传送带速度 (m/s)", value: 4, min: 0.5, max: 12, step: 0.5 },
      { key: "v0", label: "物块初速度 (m/s)", value: 0, min: -5, max: 12, step: 0.5 },
      { key: "mu", label: "动摩擦因数 μ", value: 0.3, min: 0.05, max: 1, step: 0.05 },
      { key: "beltLength", label: "传送带长度 (m)", value: 20, min: 5, max: 50, step: 1 },
      { key: "gravity", label: "重力加速度 (m/s²)", value: 9.8, min: 1, max: 20, step: 0.1 },
    ],
    devNotes: `传送带的核心是摩擦力方向判断：

\`\`\`js
dv = beltSpeed - s.v
if (Math.abs(dv) > 0.05) {
  a = Math.sign(dv) * mu * gravity
}
\`\`\`

\`Math.sign(dv)\` 一行搞定方向——物块比带慢就加速，比带就减速。

共速检测用速度差 < 0.05，共速后摩擦力消失。支持负初速度，可以观察"先减速→停→反向加速→共速"的完整过程。
`,
  }
