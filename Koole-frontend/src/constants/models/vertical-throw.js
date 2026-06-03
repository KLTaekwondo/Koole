// vertical-throw 模型数据
export default {
    id: "vertical-throw",
    level: "高中",
    category: "力学",
    name: "竖直上抛",
    desc: "物体以初速度竖直上抛，先升后落",
    knowledge: `## 竖直上抛

先减速上升再加速下落，全程加速度都是 g 向下。

- $v = v_0 - gt$
- $h = v_0 t - \\frac{1}{2}gt^2$
- 最大高度：$H_{max} = \\frac{v_0^2}{2g}$
- 总时间：$T = \\frac{2v_0}{g}$

其中：$v_0$ 是初速度，$v$ 是瞬时速度，$h$ 是高度，$H_{max}$ 是最大高度，$T$ 是总时间。

高度跟初速度是平方关系——速度翻倍高度变 4 倍。

最高点速度为零，但加速度仍然是 g，不是零！这个很多人搞错。上升和下落是对称的，经过同一位置时速度大小相等、方向相反。

做题时可以分段：上升阶段取向上为正 $a = -g$，下落阶段直接当自由落体处理，这样算起来简单。

> 试试不同初速度——高度增长比速度增长快得多，平方关系的威力。`,
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="20" x2="12" y2="4"/><path d="M8 8l4-4 4 4"/><circle cx="12" cy="16" r="2"/></svg>`,
    params: [
      { key: "initialVelocity", label: "初速度 (m/s)", value: 15, min: 5, max: 40, step: 0.5 },
      { key: "gravity", label: "重力加速度 (m/s²)", value: 9.8, min: 1, max: 20, step: 0.1 },
    ],
    devNotes: `## 开发笔记

竖直上抛和自由落体方向相反，符号处理是关键。一开始用错了符号，球直接往下飞。

最高点检测想了挺久：速度从正变负的瞬间就是最高点。但不能只看速度等于零，因为帧率问题可能错过那个瞬间。最后用速度符号变化来判断，稳妥一些。

最大高度本来想从模拟数据里提取，后来发现直接用公式 v₀²/(2g) 算出来显示更准确，还不受模拟精度影响。有时候"作弊"用公式比老实模拟效果更好。
`,
  }
