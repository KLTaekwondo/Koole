// water-refraction 模型数据
export default {
    id: "water-refraction",
    level: "初中",
    category: "光学",
    name: "水中视深",
    desc: "观察水中物体的视深现象——光的折射使物体看起来比实际更浅",
    knowledge: `## 水中视深

从空气中观察水中物体时，光在空气-水面交界处发生折射，导致物体看起来比实际位置更浅（视深 < 实深）。

**折射定律（斯涅尔定律）：**
$$n_1 \\sin \\theta_1 = n_2 \\sin \\theta_2$$

**视深公式：**
$$d' = d \\cdot \\frac{n_2 \\cos \\theta_2}{n_1 \\cos \\theta_1}$$

当垂直向下观察（$\\theta_2 \\approx 0°$）时，近似为：
$$d' \\approx d \\cdot \\frac{n_2}{n_1}$$

其中 $d$ 是实深，$d'$ 是视深，$n_1$ 是水折射率，$n_2$ 是空气折射率（≈1.0），$\\theta_1$ 和 $\\theta_2$ 分别是水中和空气中的光线与法线夹角。

> 拖拽滑块调整观察角和水的深度，看看视深如何变化！`,
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="10" width="20" height="12" fill="rgba(52,152,219,0.2)" stroke="rgba(52,152,219,0.5)"/><line x1="8" y1="8" x2="14" y2="16" stroke="#e74c3c" stroke-width="1.5"/><line x1="14" y1="16" x2="19" y2="10" stroke="#e74c3c" stroke-width="1.5"/><line x1="14" y1="16" x2="14" y2="6" stroke-dasharray="3 2" opacity="0.4"/><circle cx="8" cy="6" r="2" fill="#e74c3c"/><polygon points="19,10 21,11 20,8" fill="#e74c3c"/></svg>`,
    params: [
      { key: "depth", label: "实深 (cm)", value: 100, min: 30, max: 250, step: 1 },
      { key: "viewAngle", label: "观察角 (°)", value: 30, min: 1, max: 75, step: 1 },
      { key: "refractiveIndex", label: "水折射率 n", value: 1.33, min: 1.05, max: 2.0, step: 0.01 },
    ],
    devNotes: `## 开发笔记

水中视深模型是静态光学图，展示光的折射导致的水中物体视深变化。

### 关键计算
- 斯涅尔定律: n₁ sinθ₁ = n₂ sinθ₂
- 视深公式: d' = d · (n₂/n₁) · (cosθ₂ / cosθ₁)
- 由观察角 θ₂ 反推水中光线角 θ₁ = arcsin(sinθ₂ / n₁)

### 渲染要点
- 水池用半透明蓝色填充，陆地用棕色
- 光线用红色实线，反向延长线用红色虚线
- 人眼用黑色箭头表示（箭头尖就是眼睛位置）
- 实深和视深用带箭头的竖直线标注对比`,
  }
