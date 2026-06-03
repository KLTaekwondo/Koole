// underwater-light 模型数据
export default {
    id: "underwater-light",
    level: "初中",
    category: "光学",
    name: "水下光照",
    desc: "光从水中射向空气时的折射与全反射现象",
    knowledge: `## 水下光照

光从水中射向空气时发生折射，远离法线偏折。

**全反射临界角：**
$$\\theta_c = \\arcsin\\frac{n_2}{n_1}$$

其中 $n_1$ 是水折射率，$n_2$ 是空气折射率（≈1.0），$\\theta_c$ 是临界角。

折射率越大临界角越小，能射出去的光范围也越窄。

> 调水深、光源位置和折射率，看光斑范围怎么变。`,
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="10" width="20" height="12" fill="rgba(52,152,219,0.2)"/><line x1="2" y1="10" x2="22" y2="10" stroke="#3498db" stroke-width="1"/><circle cx="8" cy="18" r="3" fill="#f1c40f"/><path d="M10 14 Q14 12 18 8" stroke="#f39c12" stroke-width="1.5" fill="none"/><path d="M12 15 Q16 12 20 9" stroke="#f39c12" stroke-width="1" fill="none" opacity="0.5"/><rect x="19" y="3" width="3" height="7" fill="rgba(180,180,180,0.4)" stroke="rgba(180,180,180,0.6)"/></svg>`,
    params: [
      { key: "depth", label: "水深 (cm)", value: 100, min: 30, max: 250, step: 1 },
      { key: "sourcePos", label: "光源水平位置", value: 25, min: 5, max: 75, step: 1 },
      { key: "refractiveIndex", label: "水折射率 n", value: 1.33, min: 1.05, max: 2.0, step: 0.01 },
    ],
    devNotes: `## 开发笔记

水下光照跟水中视深一样是静态光学图，不过光路方向反过来了——这次是光从水里射出去。

光线数量纠结了一下，太多显得乱太少又看不出光簇效果。最后画了 40 条，小于临界角的用暖黄色、大于的用红色虚线，视觉上能一眼分清射出和全反射。

墙上照亮区域用渐变色块覆盖，一开始没做渐变就是个纯色矩形，看着像贴了块胶布。改成暖色渐变自然多了。`,
  }
