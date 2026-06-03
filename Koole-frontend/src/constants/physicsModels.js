// ── 模型 UI 元数据 ──
// 只包含界面展示相关的信息，物理逻辑在 modelPhysics.js，渲染在 modelRenderers.js

export const DRAW_SCALE = 30 // 像素/米
export const GROUND_Y = 0.4 // 球心贴地高度（球半径/DRAW_SCALE）

export const PHYSICS_MODELS = [
  {
    id: "free-fall",
    level: "初中",
    category: "力学",
    name: "自由落体",
    desc: "物体在重力作用下的竖直下落",
    knowledge: `## 自由落体运动

物体仅在重力作用下从静止开始下落的运动，是匀变速直线运动的特例。

### 核心公式

- $v = gt$ — 速度与时间关系
- $h = \\frac{1}{2}gt^2$ — 下落高度与时间关系
- $v^2 = 2gh$ — 速度与高度关系

**变量说明**：$g$ 为重力加速度，$t$ 为时间，$h$ 为下落高度，$v$ 为速度

### 关键知识点

- **加速度恒定**：重力加速度 $g \\approx 9.8 \\, m/s^2$，方向竖直向下
- **初速度为零**：自由落体的初始条件是 $v_0 = 0$
- **与质量无关**：在忽略空气阻力时，所有物体下落快慢相同（伽利略比萨斜塔实验）
- **等时性**：连续相等时间间隔内，位移之比为 $1:3:5:7:\\cdots$

> 💡 试试改变重力加速度，观察在月球（$g=1.6$）和火星（$g=3.7$）上的下落差异。`,
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="2" x2="12" y2="12"/><path d="M12 12l-3 3"/><path d="M12 12l3 3"/><circle cx="12" cy="18" r="3"/></svg>`,
    params: [
      { key: "height", label: "初始高度 (m)", value: 15, min: 1, max: 50, step: 0.5 },
      { key: "gravity", label: "重力加速度 (m/s²)", value: 9.8, min: 1, max: 20, step: 0.1 },
    ],
  },

  {
    id: "projectile",
    level: "高中",
    category: "力学",
    name: "平抛运动",
    desc: "水平初速度与重力合成抛物线轨迹",
    knowledge: `## 平抛运动

物体以水平初速度抛出后，仅在重力作用下的运动。可分解为水平匀速和竖直自由落体两个独立分运动。

### 运动分解

- **水平 (x)**：匀速直线 — $x = v_0 t$
- **竖直 (y)**：自由落体 — $y = \\frac{1}{2}gt^2$

**变量说明**：$v_0$ 为水平初速度，$g$ 为重力加速度，$t$ 为时间，$x$ 为水平位移，$y$ 为竖直位移

### 关键公式

- **飞行时间**：$t = \\sqrt{\\frac{2h}{g}}$
- **水平射程**：$R = v_0 \\sqrt{\\frac{2h}{g}}$
- **合速度**：$v = \\sqrt{v_x^2 + v_y^2}$
- **速度偏角**：$\\tan\\theta = \\frac{v_y}{v_x} = \\frac{gt}{v_0}$

### 关键知识点

- **轨迹是抛物线**：消去时间 $t$ 得 $y = \\frac{g}{2v_0^2}x^2$
- **独立性原理**：水平和竖直方向的运动互不影响
- **速度方向**时刻变化，但水平分速度始终不变

> 💡 观察蓝色 Vx 始终不变，绿色 Vy 持续增大——这就是运动分解的直观体现。`,
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 20h20"/><path d="M6 16l4-8 4 4 4-8" stroke-dasharray="2 2"/><circle cx="18" cy="8" r="2"/></svg>`,
    params: [
      { key: "height", label: "初始高度 (m)", value: 15, min: 1, max: 50, step: 0.5 },
      { key: "vx", label: "水平速度 (m/s)", value: 5, min: 1, max: 20, step: 0.5 },
      { key: "gravity", label: "重力加速度 (m/s²)", value: 9.8, min: 1, max: 20, step: 0.1 },
    ],
  },

  {
    id: "vertical-throw",
    level: "高中",
    category: "力学",
    name: "竖直上抛",
    desc: "物体以初速度竖直上抛，先升后落",
    knowledge: `## 竖直上抛运动

物体以初速度竖直向上抛出，在重力作用下先上升后下落的匀变速直线运动。

### 核心公式

- $v = v_0 - gt$ — 速度随时间变化
- $h = v_0 t - \\frac{1}{2}gt^2$ — 高度随时间变化
- $H_{max} = \\frac{v_0^2}{2g}$ — 最大高度

**变量说明**：$v_0$ 为初速度，$g$ 为重力加速度，$t$ 为时间，$h$ 为高度，$v$ 为速度，$H_{max}$ 为最大高度

### 关键知识点

- **对称性**：上升和下落经过同一位置时速度大小相等、方向相反
- **最高点**：速度为零，加速度仍为 $g$（方向向下）
- **总时间**：$T = \\frac{2v_0}{g}$
- **分段处理**：上升阶段取向上为正，$a = -g$；下落阶段可转为自由落体

> 💡 对比不同初速度下的最大高度——高度与初速度的**平方**成正比。`,
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="20" x2="12" y2="4"/><path d="M8 8l4-4 4 4"/><circle cx="12" cy="16" r="2"/></svg>`,
    params: [
      { key: "initialVelocity", label: "初速度 (m/s)", value: 15, min: 5, max: 40, step: 0.5 },
      { key: "gravity", label: "重力加速度 (m/s²)", value: 9.8, min: 1, max: 20, step: 0.1 },
    ],
  },

  {
    id: "circular",
    level: "高中",
    category: "力学",
    name: "圆周运动",
    desc: "质点做匀速圆周运动，显示向心力",
    knowledge: `## 匀速圆周运动

质点沿圆周运动，且速度大小恒定（速率不变），但速度方向时刻变化，因此存在加速度。

### 核心公式

- $v = \\omega r$ — 线速度与角速度关系
- $a_c = \\frac{v^2}{r} = \\omega^2 r$ — 向心加速度
- $F_c = \\frac{mv^2}{r}$ — 向心力
- $T = \\frac{2\\pi}{\\omega}$ — 周期

**变量说明**：$v$ 为线速度，$\\omega$ 为角速度，$r$ 为半径，$a_c$ 为向心加速度，$F_c$ 为向心力，$m$ 为质量，$T$ 为周期

### 关键知识点

- **向心加速度**：始终指向圆心，只改变速度方向，不改变速度大小
- **向心力不是新力**：它是合力的效果，可以由重力、摩擦力、弹力等提供
- **变速率**：角速度越大，向心加速度越大（平方关系）
- **非平衡态**：虽然速率不变，但有加速度，所以不是平衡状态

> 💡 红色箭头是向心力（指向圆心），橙色箭头是切向速度——两者始终垂直。`,
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="2"/><line x1="12" y1="12" x2="8" y2="8" stroke="red"/></svg>`,
    params: [
      { key: "radius", label: "轨道半径 (m)", value: 5, min: 1, max: 15, step: 0.5 },
      { key: "omega", label: "角速度 (rad/s)", value: 2, min: 0.5, max: 6, step: 0.1 },
    ],
  },

  {
    id: "incline",
    level: "初中",
    category: "力学",
    name: "斜面滑动",
    desc: "物体在光滑斜面上的加速下滑",
    knowledge: `## 斜面滑动

物体在光滑斜面上受重力作用下滑的经典模型，是力的分解的重要应用。

### 力的分解

将重力 $mg$ 分解为沿斜面和垂直斜面两个方向：

- **沿斜面向下**：$mg\\sin\\theta$ — 使物体加速下滑
- **垂直斜面向下**：$mg\\cos\\theta$ — 压紧斜面（被支持力平衡）

**变量说明**：$m$ 为质量，$g$ 为重力加速度，$\\theta$ 为斜面角度

### 运动公式

- **加速度**：$a = g\\sin\\theta$
- **末速度**：$v = \\sqrt{2gL\\sin\\theta}$（$L$ 为斜面长度）
- **滑行时间**：$t = \\sqrt{\\frac{2L}{g\\sin\\theta}}$

### 关键知识点

- **角度越大，加速度越大**：$\\theta=90°$ 时退化为自由落体
- **与质量无关**：光滑斜面上，不同质量物体下滑加速度相同
- **等效替代**：斜面上的运动可等效为水平方向加速度 $g\\sin\\theta$ 的匀加速运动

> 💡 调整斜面角度，观察速度箭头的变化——角度越大，加速越快。`,
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="20,2 2,22 22,22" fill="rgba(0,0,0,0.05)"/><circle cx="14" cy="14" r="2"/></svg>`,
    params: [
      { key: "angle", label: "斜面角度 (°)", value: 30, min: 5, max: 75, step: 1 },
      { key: "rampHeight", label: "斜面高度 (m)", value: 10, min: 2, max: 30, step: 0.5 },
      { key: "gravity", label: "重力加速度 (m/s²)", value: 9.8, min: 1, max: 20, step: 0.1 },
    ],
  },

  {
    id: "pendulum",
    level: "初中",
    category: "力学",
    name: "单摆",
    desc: "单摆在重力作用下的周期性摆动",
    knowledge: `## 单摆运动

在小角度近似下，单摆做简谐振动，是周期运动的经典模型。

### 核心公式

- $T = 2\\pi\\sqrt{\\frac{L}{g}}$ — 周期公式（小角度近似）
- $\\omega = \\sqrt{\\frac{g}{L}}$ — 角频率
- $\\theta(t) = \\theta_0 \\cos(\\omega t)$ — 角度随时间变化

**变量说明**：$T$ 为周期，$L$ 为摆长，$g$ 为重力加速度，$\\omega$ 为角频率，$\\theta_0$ 为初始角度，$t$ 为时间

### 关键知识点

- **等时性**：周期只与摆长和重力加速度有关，与振幅和质量无关
- **小角度近似**：当摆角 $\\theta < 5°$ 时，误差小于 0.5%
- **能量转化**：最高点势能最大，最低点动能最大，机械能守恒
- **单摆测 g**：通过测量 $T$ 和 $L$ 可精确计算重力加速度

> 💡 改变摆长观察周期变化——摆长变为 4 倍，周期才变为 2 倍。`,
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="2" x2="18" y2="16"/><circle cx="18" cy="18" r="2"/><line x1="12" y1="2" x2="12" y2="20" stroke-dasharray="2 2" opacity="0.3"/></svg>`,
    params: [
      { key: "length", label: "摆长 (m)", value: 5, min: 1, max: 15, step: 0.5 },
      { key: "initAngle", label: "初始角度 (°)", value: 30, min: 5, max: 60, step: 1 },
      { key: "gravity", label: "重力加速度 (m/s²)", value: 9.8, min: 1, max: 20, step: 0.1 },
    ],
  },

  {
    id: "angled-projectile",
    level: "高中",
    category: "力学",
    name: "斜向上抛",
    desc: "物体以一定角度斜向上抛出，抛物线运动",
    knowledge: `## 斜向上抛运动

物体以初速度 $v_0$ 和抛射角 $\\theta$ 斜向上抛出，在重力作用下的抛物线运动。

### 运动分解

- **水平**：$v_{0x} = v_0\\cos\\theta$ — $x = v_0\\cos\\theta \\cdot t$
- **竖直**：$v_{0y} = v_0\\sin\\theta$ — $y = v_0\\sin\\theta \\cdot t - \\frac{1}{2}gt^2$

**变量说明**：$v_0$ 为初速度，$\\theta$ 为抛射角，$g$ 为重力加速度，$t$ 为时间，$x$ 为水平位移，$y$ 为竖直位移

### 重要结论

- **最大高度**：$H = \\frac{v_0^2 \\sin^2\\theta}{2g}$
- **水平射程**：$R = \\frac{v_0^2 \\sin 2\\theta}{g}$
- **飞行总时间**：$T = \\frac{2v_0\\sin\\theta}{g}$
- **最佳抛射角**：$\\theta = 45°$ 时射程最远（同一高度）

### 关键知识点

- **对称性**：轨迹关于最高点左右对称（起落等高时）
- **最大射程条件**：$\\sin 2\\theta = 1$ 即 $\\theta = 45°$
- **互补角**：$\\theta$ 和 $90°-\\theta$ 的射程相同

> 💡 45° 不一定是最优——如果起点高于落点，最佳角度会小于 45°。`,
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="2" y1="20" x2="22" y2="20"/><path d="M4 20 Q12 2 20 16" stroke-dasharray="3 2"/><circle cx="20" cy="16" r="2"/><line x1="4" y1="20" x2="10" y2="10"/><polyline points="11 6 10 10 14 9"/></svg>`,
    params: [
      { key: "initialVelocity", label: "初速度 (m/s)", value: 15, min: 5, max: 40, step: 0.5 },
      { key: "angle", label: "抛射角 (°)", value: 45, min: 5, max: 85, step: 1 },
      { key: "gravity", label: "重力加速度 (m/s²)", value: 9.8, min: 1, max: 20, step: 0.1 },
    ],
  },

  {
    id: "boat-river",
    level: "高中",
    category: "力学",
    name: "小船过河",
    desc: "小船在流水中的运动，合速度与渡河路径",
    knowledge: `## 小船过河模型

小船在流水中渡河，涉及运动合成与分解的经典问题。船速和水速的合成决定了实际运动轨迹。

### 速度分解

- **过河速度**：$v_y = v_{船}\\cos\\theta$ — 垂直河岸的分速度
- **顺流速度**：$v_x = v_{船}\\sin\\theta + v_{水}$ — 沿河岸的分速度

**变量说明**：$v_{船}$ 为船速，$v_{水}$ 为水流速度，$\\theta$ 为船头偏角，$v_x$ 为顺流速度，$v_y$ 为过河速度

其中 $\\theta$ 为船头与垂直河岸方向的偏角。

### 两种典型问题

**最短时间过河**：船头垂直河岸（$\\theta=0°$）
$$t_{min} = \\frac{d}{v_{船}}$$

**最短路径过河**（正对岸）：船头偏向上游
$$\\sin\\theta = \\frac{v_{水}}{v_{船}} \\quad (v_{船} > v_{水})$$

### 关键知识点

- **独立性**：过河时间只由垂直河岸的速度分量决定
- **最短路径 ≠ 最短时间**：两者策略不同
- **无法到达对岸**：当 $v_{船} \\leq v_{水}$ 时，无法垂直过河

> 💡 调整船头偏角，观察合速度方向（红色）与实际路径的关系。`,
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="18" x2="20" y2="18"/><polygon points="10 18 14 18 12 12"/><path d="M6 13 Q9 11 12 13 Q15 15 18 13" opacity="0.35" stroke-width="1.5"/></svg>`,
    params: [
      { key: "riverWidth", label: "河宽 (m)", value: 30, min: 8, max: 60, step: 1 },
      { key: "boatSpeed", label: "船速 (m/s)", value: 4, min: 1, max: 10, step: 0.5 },
      { key: "currentSpeed", label: "水流速度 (m/s)", value: 2, min: 0, max: 8, step: 0.5 },
      { key: "headingAngle", label: "船头偏角 (°)", value: 0, min: -60, max: 60, step: 1 },
    ],
  },

  {
    id: "spring-mass",
    level: "高中",
    category: "力学",
    name: "弹簧振子",
    desc: "物体在弹簧作用下的简谐振动，动能与势能相互转化",
    knowledge: `## 弹簧振子

物体在弹簧弹力作用下做简谐振动，是能量转化和简谐运动的理想模型。

### 运动方程

- **回复力**：$F = -kx$（胡克定律）
- **加速度**：$a = -\\frac{k}{m}x$
- **位移**：$x(t) = A\\cos(\\omega t + \\varphi)$
- **角频率**：$\\omega = \\sqrt{\\frac{k}{m}}$

### 能量关系

- **动能**：$E_k = \\frac{1}{2}mv^2$
- **弹性势能**：$E_p = \\frac{1}{2}kx^2$
- **机械能**：$E = \\frac{1}{2}kA^2$（守恒）

**变量说明**：$m$ 为质量，$v$ 为速度，$k$ 为劲度系数，$x$ 为位移，$A$ 为振幅

### 关键知识点

- **简谐振动条件**：回复力与位移成正比且方向相反
- **周期**：$T = 2\\pi\\sqrt{\\frac{m}{k}}$，与振幅无关
- **能量守恒**：动能和势能相互转化，总机械能不变
- **平衡位置**：$x=0$ 时速度最大，势能为零

> 💡 观察动能和势能的此消彼长——在最大位移处全部是势能，在平衡位置全部是动能。`,
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="6" x2="3" y2="20"/><polyline points="3,13 6,9 9,17 12,9 15,17 18,13"/><rect x="16" y="8" width="7" height="7" fill="rgba(0,0,0,0.1)"/></svg>`,
    params: [
      { key: "mass", label: "质量 (kg)", value: 1, min: 0.2, max: 5, step: 0.1 },
      { key: "k", label: "劲度系数 (N/m)", value: 10, min: 1, max: 30, step: 0.5 },
      { key: "initX", label: "初始位移 (m)", value: 2, min: 0.3, max: 5, step: 0.1 },
    ],
  },

  {
    id: "friction-slide",
    level: "初中",
    category: "力学",
    name: "粗糙面滑动",
    desc: "物体在粗糙水平面上因摩擦力而减速直至停止",
    knowledge: `## 粗糙面滑动

物体在粗糙水平面上滑动，受到滑动摩擦力作用而减速直至停止，是摩擦力分析的基础模型。

### 核心公式

- $f = \\mu N = \\mu mg$ — 滑动摩擦力
- $a = \\mu g$ — 减速度大小
- $x = \\frac{v_0^2}{2\\mu g}$ — 停止距离
- $t = \\frac{v_0}{\\mu g}$ — 停止时间

**变量说明**：$f$ 为摩擦力，$\\mu$ 为摩擦系数，$N$ 为支持力，$m$ 为质量，$g$ 为重力加速度，$a$ 为减速度，$v_0$ 为初速度，$x$ 为停止距离，$t$ 为停止时间

### 关键知识点

- **摩擦力方向**：与相对运动方向相反，阻碍物体运动
- **与速度无关**：滑动摩擦力大小只由 $\\mu$ 和 $N$ 决定，与速度大小无关
- **能量角度**：摩擦力做功 $W = -\\mu mgx$，将动能全部转化为内能
- **停止距离**：与初速度**平方**成正比，与摩擦系数成反比

> 💡 初速度翻倍，停止距离变为 4 倍——这就是高速行驶需要更长刹车距离的原因。`,
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="2" y1="17" x2="22" y2="17"/><line x1="4" y1="17" x2="6" y2="13"/><line x1="9" y1="17" x2="11" y2="13"/><line x1="14" y1="17" x2="16" y2="13"/><line x1="19" y1="17" x2="21" y2="13"/><rect x="6" y="7" width="7" height="8" fill="rgba(0,0,0,0.1)"/><polyline points="20,6 22,12 18,12"/></svg>`,
    params: [
      { key: "v0", label: "初速度 (m/s)", value: 8, min: 1, max: 20, step: 0.5 },
      { key: "mu", label: "摩擦系数 μ", value: 0.3, min: 0.05, max: 1, step: 0.05 },
      { key: "gravity", label: "重力加速度 (m/s²)", value: 9.8, min: 1, max: 20, step: 0.1 },
    ],
  },

  {
    id: "drag-fall",
    level: "高中",
    category: "力学",
    name: "空气阻力落体",
    desc: "考虑空气阻力的自由落体，最终达到收尾速度",
    knowledge: `## 空气阻力落体

考虑空气阻力的自由落体，物体最终会达到一个恒定的收尾速度，这是真实世界中更贴近实际的模型。

### 受力分析

- **重力**：$mg$（向下，恒定）
- **空气阻力**：$f = bv$（向上，随速度增大）

### 运动方程

$$ma = mg - bv$$

### 收尾速度

当 $mg = bv$ 时，加速度为零，速度不再变化：

$$v_t = \\frac{mg}{b}$$

### 速度随时间变化

$$v(t) = v_t(1 - e^{-\\frac{b}{m}t})$$

### 关键知识点

- **收尾速度**：阻力系数 $b$ 越大，收尾速度越小
- **指数趋近**：速度以指数形式趋近收尾速度，理论上永远达不到
- **质量影响**：质量越大，收尾速度越大（$v_t \\propto m$）
- **实际应用**：跳伞、雨滴下落、灰尘沉降等都涉及收尾速度

> 💡 观察"已接近收尾"百分比——达到 90% 收尾速度后，加速变得极其缓慢。`,
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="2" x2="12" y2="14"/><path d="M12 14l-3 3"/><path d="M12 14l3 3"/><circle cx="12" cy="19" r="3"/><path d="M6 6 Q8 8 12 6 Q16 8 18 6" opacity="0.3"/><path d="M4 9 Q8 11 12 9 Q16 11 20 9" opacity="0.2"/></svg>`,
    params: [
      { key: "height", label: "初始高度 (m)", value: 50, min: 10, max: 100, step: 2 },
      { key: "mass", label: "质量 (kg)", value: 1, min: 0.1, max: 10, step: 0.1 },
      { key: "dragCoeff", label: "阻力系数 b", value: 0.5, min: 0.05, max: 3, step: 0.05 },
      { key: "gravity", label: "重力加速度 (m/s²)", value: 9.8, min: 1, max: 20, step: 0.1 },
    ],
  },

  {
    id: "bounce-deformation",
    level: "初中",
    category: "力学",
    name: "碰撞变形",
    desc: "弹性/非弹性碰撞，观察变形与能量损失",
    knowledge: `## 碰撞变形模型

物体与地面碰撞时，根据恢复系数的不同，表现出不同的弹跳行为和能量损失。

### 恢复系数

$$e = \\frac{v_{分离}}{v_{接近}}$$

- **完全弹性**：$e = 1$ — 无能量损失，反弹等高
- **非弹性**：$0 < e < 1$ — 部分能量损失，逐次降低
- **完全非弹性**：$e = 0$ — 完全不反弹，能量全部损失

**变量说明**：$e$ 为恢复系数，$v_{分离}$ 为分离速度，$v_{接近}$ 为接近速度

### 弹跳高度

第 $n$ 次弹跳的最大高度：
$$h_n = h_0 \\cdot e^{2n}$$

### 关键知识点

- **能量损失**：每次碰撞损失能量比例为 $(1-e^2)$
- **弹跳次数**：理论上无限次，但高度指数衰减
- **变形**：碰撞瞬间物体发生形变，弹性好的物体形变可恢复
- **动量守恒**：碰撞过程中系统动量始终守恒

> 💡 将恢复系数设为 0（完全非弹性），观察物体"粘"在地上的效果。`,
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="6" r="3"/><path d="M8 9v11"/><path d="M5 20h6"/><path d="M16 4l3 3-3 3"/><path d="M19 7h-6" opacity="0.4"/><line x1="2" y1="20" x2="22" y2="20"/></svg>`,
    params: [
      { key: "height", label: "初始高度 (m)", value: 10, min: 1, max: 30, step: 0.5 },
      { key: "restitution", label: "恢复系数 e", value: 0.8, min: 0, max: 1, step: 0.05 },
      { key: "gravity", label: "重力加速度 (m/s²)", value: 9.8, min: 1, max: 20, step: 0.1 },
    ],
  },

  {
    id: "ball-collision",
    level: "高中",
    category: "力学",
    name: "两球碰撞",
    desc: "两个小球在水平方向上的弹性/非弹性碰撞",
    knowledge: `## 两球碰撞

两个小球在水平方向上的碰撞，是动量守恒和能量守恒的综合应用。

### 守恒定律

**动量守恒**（始终成立）：
$$m_1 v_1 + m_2 v_2 = m_1 v_1' + m_2 v_2'$$

**动能守恒**（仅完全弹性碰撞）：
$$\\frac{1}{2}m_1 v_1^2 + \\frac{1}{2}m_2 v_2^2 = \\frac{1}{2}m_1 v_1'^2 + \\frac{1}{2}m_2 v_2'^2$$

### 完全弹性碰撞公式

$$v_1' = \\frac{(m_1-m_2)v_1 + 2m_2 v_2}{m_1+m_2}$$

$$v_2' = \\frac{(m_2-m_1)v_2 + 2m_1 v_1}{m_1+m_2}$$

### 特殊情况

- $m_1 = m_2$ — 速度交换
- $m_1 \\gg m_2$ — 球1几乎不变，球2以 $2v_1$ 弹出
- $m_1 \\ll m_2$ — 球1以 $-v_1$ 弹回，球2几乎不动

**变量说明**：$m_1, m_2$ 为两球质量，$v_1, v_2$ 为两球初速度

> 💡 尝试等质量碰撞——两球速度完全交换，这就是牛顿摆的原理。`,
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
  },

  {
    id: "connected-bodies",
    level: "高中",
    category: "力学",
    name: "连接体",
    desc: "两个物体通过定滑轮连接，整体法与隔离法分析",
    knowledge: `## 连接体（滑轮模型）

两个物体通过轻绳和定滑轮连接，一个在桌面滑动，一个悬挂下落。是"整体法与隔离法"的经典应用。

### 受力分析

**隔离 $m_1$**（桌面物体）：
- 绳拉力 $T$ 向右
- 摩擦力 $f = \\mu m_1 g$ 向左

**隔离 $m_2$**（悬挂物体）：
- 重力 $m_2 g$ 向下
- 绳拉力 $T$ 向上

### 运动方程

$$a = \\frac{m_2 g - \\mu m_1 g}{m_1 + m_2}$$

$$T = m_1(a + \\mu g)$$

### 关键知识点

- **整体法**：将两物体视为整体，外力之和 = 总质量 × 加速度
- **隔离法**：单独分析每个物体的受力，用于求绳中张力
- **运动条件**：$m_2 g > \\mu m_1 g$ 时系统才会运动
- **轻绳假设**：绳中张力处处相等，两物体加速度大小相等

> 💡 当 $m_2$ 太轻时系统不动——试试调整参数找到临界质量比。`,
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="14" width="8" height="4" fill="rgba(0,0,0,0.08)"/><circle cx="12" cy="10" r="2" fill="none"/><rect x="14" y="4" width="6" height="6" rx="1" fill="rgba(0,0,0,0.1)"/><line x1="12" y1="12" x2="8" y2="14"/><line x1="12" y1="12" x2="17" y2="10"/></svg>`,
    params: [
      { key: "m1", label: "桌面质量 (kg)", value: 2, min: 0.3, max: 10, step: 0.2 },
      { key: "m2", label: "悬挂质量 (kg)", value: 1, min: 0.3, max: 10, step: 0.2 },
      { key: "mu", label: "桌面摩擦系数 μ", value: 0.2, min: 0, max: 1, step: 0.05 },
      { key: "gravity", label: "重力加速度 (m/s²)", value: 9.8, min: 1, max: 20, step: 0.1 },
    ],
  },

  {
    id: "conveyor-belt",
    level: "高中",
    category: "力学",
    name: "传送带",
    desc: "物块在传送带上的运动，摩擦力驱动的加速与匀速",
    knowledge: `## 传送带模型

物块放在运动的传送带上，摩擦力使物块加速直到与传送带同速，是摩擦力方向判断的经典模型。

### 运动阶段

**阶段一：相对滑动（加速/减速）**
$$a = \\mu g$$

摩擦力方向取决于物块与传送带的相对运动方向：
- 物块速度 < 带速 → 摩擦力向前（加速）
- 物块速度 > 带速 → 摩擦力向后（减速）

**阶段二：相对静止（匀速）**
物块与传送带同速后，无相对运动，摩擦力为零（或静摩擦力平衡其他力）。

### 关键知识点

- **摩擦力方向**：由相对运动方向决定，不是运动方向
- **能量转化**：摩擦力做功转化为物块动能和系统内能
- **划痕长度**：等于物块与传送带的相对位移
- **临界条件**：$v_{物} = v_{带}$ 时相对运动消失

> 💡 物块初速度设为负值（逆向），观察摩擦力如何先减速再反向加速。`,
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="10" width="20" height="4" rx="1" fill="rgba(0,0,0,0.06)"/><circle cx="4" cy="12" r="2" fill="none"/><circle cx="20" cy="12" r="2" fill="none"/><rect x="9" y="6" width="5" height="5" rx="1" fill="rgba(0,0,0,0.1)"/><line x1="2" y1="17" x2="22" y2="17"/></svg>`,
    params: [
      { key: "beltSpeed", label: "传送带速度 (m/s)", value: 4, min: 0.5, max: 12, step: 0.5 },
      { key: "v0", label: "物块初速度 (m/s)", value: 0, min: -5, max: 12, step: 0.5 },
      { key: "mu", label: "动摩擦因数 μ", value: 0.3, min: 0.05, max: 1, step: 0.05 },
      { key: "beltLength", label: "传送带长度 (m)", value: 20, min: 5, max: 50, step: 1 },
      { key: "gravity", label: "重力加速度 (m/s²)", value: 9.8, min: 1, max: 20, step: 0.1 },
    ],
  },

  {
    id: "block-board",
    level: "高中",
    category: "力学",
    name: "板块模型",
    desc: "滑块在木板上滑动，摩擦作用下的相对运动，高考经典",
    knowledge: `## 板块模型

滑块在木板上滑动，通过摩擦力带动木板运动，是高考力学压轴题的经典模型。

### 受力分析

**滑块 m**：摩擦力 $f = \\mu mg$ 向左（减速）
**木板 M**：摩擦力 $f = \\mu mg$ 向右（加速）

### 加速度

$$a_m = -\\mu g \\quad (滑块减速)$$

$$a_M = \\frac{\\mu m g}{M} \\quad (木板加速)$$

### 共速条件

当 $v_m = v_M$ 时，相对运动消失，系统以共同速度运动：

$$v_{共} = \\frac{mv_0}{m+M}$$

### 关键知识点

- **相对位移**：滑块相对木板的位移决定了摩擦力做功和热量产生
- **能量守恒**：$Q = f \\cdot \\Delta x_{相对}$（产生的热量）
- **共速判断**：共速后是否继续相对滑动取决于最大静摩擦力
- **滑块滑落**：若木板不够长，滑块会从另一端滑落

> 💡 观察滑块减速、木板加速的过程——共速前两者的速度差越来越小。`,
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="14" width="18" height="6" rx="1" fill="rgba(0,0,0,0.06)"/><rect x="10" y="8" width="6" height="6" fill="rgba(0,0,0,0.12)"/><line x1="13" y1="11" x2="19" y2="11" stroke="#e67e22" stroke-width="2"/><line x1="13" y1="17" x2="8" y2="17" stroke="#3498db" stroke-width="2"/><polyline points="19,9 22,11 19,13"/><polyline points="8,15 5,17 8,19"/></svg>`,
    params: [
      { key: "M", label: "木板质量 (kg)", value: 3, min: 0.5, max: 20, step: 0.5 },
      { key: "m", label: "滑块质量 (kg)", value: 1, min: 0.2, max: 10, step: 0.2 },
      { key: "v0", label: "滑块初速度 (m/s)", value: 4, min: 1, max: 15, step: 0.5 },
      { key: "mu", label: "摩擦系数 μ", value: 0.3, min: 0.05, max: 0.8, step: 0.05 },
      { key: "boardLength", label: "木板长度 (m)", value: 6, min: 2, max: 15, step: 0.5 },
      { key: "gravity", label: "重力加速度 (m/s²)", value: 9.8, min: 1, max: 20, step: 0.1 },
    ],
  },

  // ── 杠杆 ──
  {
    id: "lever",
    level: "初中",
    category: "力学",
    name: "杠杆",
    desc: "杠杆平衡条件：力×力臂 = 力×力臂",
    knowledge: `## 杠杆原理

杠杆是一种简单机械，在力的作用下能绕固定点（支点）转动。

### 核心公式

- $F_1 \\times L_1 = F_2 \\times L_2$ — 杠杆平衡条件
- 力矩 $M = F \\times d$ — 力与力臂的乘积

**变量说明**：$F$ 为力（N），$L$ 为力臂（m），$M$ 为力矩（N·m）

### 关键知识点

- **支点**：杠杆绕着转动的固定点
- **力臂**：从支点到力的作用线的垂直距离
- **平衡条件**：顺时针力矩 = 逆时针力矩
- **三种杠杆**：
  - 省力杠杆：$L_1 > L_2$，省力但费距离
  - 费力杠杆：$L_1 < L_2$，费力但省距离
  - 等臂杠杆：$L_1 = L_2$，如天平

### 生活中的杠杆

- 剪刀、钳子（省力杠杆）
- 钓鱼竿、筷子（费力杠杆）
- 天平（等臂杠杆）

> 💡 试试让 $F_1 \\times L_1 = F_2 \\times L_2$，观察杠杆如何保持水平平衡。`,
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 4 8 10 16 10" fill="rgba(0,0,0,0.08)"/><line x1="2" y1="8" x2="22" y2="8"/><circle cx="4" cy="6" r="1.5"/><circle cx="20" cy="6" r="1.5"/></svg>`,
    params: [
      { key: "F1", label: "左侧力 F₁ (N)", value: 3, min: 0, max: 20, step: 0.5 },
      { key: "d1", label: "左侧力臂 L₁ (m)", value: 3, min: 0.5, max: 5, step: 0.1 },
      { key: "dir1", label: "F₁ 方向", value: 1, options: [{ label: "↓ 向下", value: 1 }, { label: "↑ 向上", value: -1 }] },
      { key: "F2", label: "右侧力 F₂ (N)", value: 2, min: 0, max: 20, step: 0.5 },
      { key: "d2", label: "右侧力臂 L₂ (m)", value: 2, min: 0.5, max: 5, step: 0.1 },
      { key: "dir2", label: "F₂ 方向", value: 1, options: [{ label: "↓ 向下", value: 1 }, { label: "↑ 向上", value: -1 }] },
    ],
  },

  // ── 定滑轮 ──
  {
    id: "pulley",
    level: "初中",
    category: "力学",
    name: "定滑轮",
    desc: "定滑轮改变力的方向，不省力",
    knowledge: `## 定滑轮

定滑轮是轴固定不动的滑轮，实质上是等臂杠杆。

### 核心特点

- **不省力**：$F = mg$，拉力等于物体重力
- **不省距离**：拉绳距离 = 物体上升距离
- **改变方向**：可以向下拉绳子使物体上升

### 关键知识点

- 定滑轮的实质是等臂杠杆（动力臂 = 阻力臂 = 滑轮半径）
- 理想情况下不计摩擦和滑轮重力
- 绳中张力处处相等（轻绳假设）

### 与动滑轮的对比

| | 定滑轮 | 动滑轮 |
|---|---|---|
| 省力 | ❌ 不省力 | ✅ 省一半力 |
| 省距离 | ❌ 不省距离 | ❌ 费一倍距离 |
| 改变方向 | ✅ 可以 | ❌ 不可以 |

> 💡 观察：无论物体多重，拉力始终等于物体重量——试试改变质量看看。`,
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="6" r="4"/><line x1="12" y1="2" x2="12" y2="1"/><line x1="8" y1="10" x2="8" y2="20"/><line x1="16" y1="10" x2="16" y2="16"/></svg>`,
    params: [
      { key: "mass", label: "物体质量 (kg)", value: 2, min: 0.5, max: 10, step: 0.5 },
      { key: "pullForce", label: "拉力 (N)", value: 20, min: 0, max: 100, step: 1 },
      { key: "pulleyH", label: "滑轮高度 (m)", value: 5, min: 3, max: 7, step: 0.5 },
      { key: "initHeight", label: "初始高度 (m)", value: 2, min: 0.5, max: 4, step: 0.5 },
      { key: "gravity", label: "重力加速度 (m/s²)", value: 9.8, min: 1, max: 20, step: 0.1 },
    ],
  },

  // ── 动滑轮 ──
  {
    id: "movable-pulley",
    level: "初中",
    category: "力学",
    name: "动滑轮",
    desc: "动滑轮省一半力，但费一倍距离",
    knowledge: `## 动滑轮

动滑轮是轴随物体一起移动的滑轮，实质上是动力臂为阻力臂 2 倍的杠杆。

### 核心公式

$$F = \\frac{mg}{2}$$

$$s_{拉} = 2s_{物}$$

### 特点

- **省一半力**：拉力 = 物体重力的一半
- **费一倍距离**：拉绳距离是物体上升距离的 2 倍
- **不能改变方向**：拉力方向与物体运动方向相同

> 💡 观察：改变质量，拉力始终是重力的一半。`,
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><line x1="8" y1="4" x2="8" y2="8"/><line x1="16" y1="4" x2="16" y2="8"/><line x1="12" y1="16" x2="12" y2="22"/></svg>`,
    params: [
      { key: "mass", label: "物体质量 (kg)", value: 4, min: 0.5, max: 10, step: 0.5 },
      { key: "pullForce", label: "拉力 (N)", value: 25, min: 0, max: 100, step: 1 },
      { key: "ceilingH", label: "天花板高度 (m)", value: 10, min: 3, max: 15, step: 0.5 },
      { key: "initHeight", label: "初始高度 (m)", value: 3, min: 0.5, max: 10.0, step: 0.5 },
      { key: "gravity", label: "重力加速度 (m/s²)", value: 9.8, min: 1, max: 20, step: 0.1 },
    ],
  },

  // ── 滑轮组 ──
  {
    id: "pulley-system",
    level: "初中",
    category: "力学",
    name: "滑轮组",
    desc: "定滑轮+动滑轮组合，省力又改变方向",
    knowledge: `## 滑轮组

滑轮组由定滑轮和动滑轮组合而成，兼具两者的优点。

### 核心公式

$$F = \\frac{mg}{n}$$

其中 n 是承担物重的绳子段数（本模型 n=2）。

### 特点

- **省力**：拉力 = 物体重力 ÷ 绳子段数
- **费距离**：拉绳距离 = 物体上升距离 × 绳子段数
- **改变方向**：可以向下拉绳子使物体上升

> 💡 绳子段数越多越省力，但摩擦也会增大。`,
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="6" r="3"/><circle cx="16" cy="12" r="3"/><line x1="8" y1="3" x2="8" y2="1"/><line x1="5" y1="9" x2="5" y2="20"/><line x1="11" y1="9" x2="16" y2="9"/><line x1="16" y1="15" x2="16" y2="22"/></svg>`,
    params: [
      { key: "mass", label: "物体质量 (kg)", value: 4, min: 0.5, max: 10, step: 0.5 },
      { key: "pullForce", label: "拉力 (N)", value: 20, min: 0, max: 100, step: 1 },
      { key: "ceilingH", label: "天花板高度 (m)", value: 10, min: 5, max: 15, step: 0.5 },
      { key: "initHeight", label: "初始高度 (m)", value: 3, min: 0.5, max: 10.0, step: 0.5 },
      { key: "gravity", label: "重力加速度 (m/s²)", value: 9.8, min: 1, max: 20, step: 0.1 },
    ],
  },

  {
    id: "buoyancy",
    level: "初中",
    category: "力学",
    name: "浮力",
    desc: "阿基米德原理：物体在液体中的浮沉与平衡",
    knowledge: `## 浮力（阿基米德原理）

浸在液体中的物体受到向上的浮力，浮力大小等于物体排开液体的重力。

### 核心公式

- $F_{浮} = \\rho_{液} \\cdot g \\cdot V_{排}$ — 阿基米德原理
- $G = \\rho_{物} \\cdot g \\cdot V_{物}$ — 物体重力

### 浮沉条件

| 条件 | 状态 |
|---|---|
| $\\rho_{物} < \\rho_{液}$ | 上浮 → 漂浮（部分浸没） |
| $\\rho_{物} = \\rho_{液}$ | 悬浮（完全浸没，任意位置） |
| $\\rho_{物} > \\rho_{液}$ | 下沉 → 沉底 |

### 漂浮时的浸没比

$$\\frac{V_{排}}{V_{物}} = \\frac{\\rho_{物}}{\\rho_{液}}$$

**变量说明**：$\\rho_{液}$ 为液体密度，$\\rho_{物}$ 为物体密度，$V_{排}$ 为排开液体体积，$V_{物}$ 为物体体积，$g$ 为重力加速度

### 关键知识点

- **浮力本质**：液体对物体上下表面的压力差
- **与深度无关**：漂浮时浮力只取决于排开液体的重力，与浸入深度无关
- **应用**：轮船（空心增大体积）、潜水艇（改变自重）、密度计

> 💡 把物体密度调到小于液体密度，观察它漂浮时浸没的比例——正好等于密度之比。`,
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="10" width="16" height="10" rx="1" fill="rgba(52,152,219,0.15)"/><rect x="8" y="4" width="8" height="8" rx="1"/><path d="M12 14l-2-2m2 2l2-2" stroke-width="1.5"/></svg>`,
    params: [
      { key: "rhoObj", label: "物体密度 (kg/m³)", value: 600, min: 100, max: 3000, step: 50 },
      { key: "rhoLiquid", label: "液体密度 (kg/m³)", value: 1000, min: 500, max: 2000, step: 50 },
      { key: "volume", label: "体积 (m³)", value: 0.125, min: 0.01, max: 1, step: 0.01 },
      { key: "gravity", label: "重力加速度 (m/s²)", value: 9.8, min: 1, max: 20, step: 0.1 },
      { key: "liquidH", label: "液面高度 (m)", value: 3, min: 1.5, max: 6, step: 0.5 },
    ],
  },

  // ── 力的合成（平行四边形法则）──
  {
    id: "force-composition",
    level: "初中",
    category: "力学",
    name: "力的合成",
    desc: "平行四边形法则：两个力的合力与分解",
    knowledge: `## 力的合成

两个力作用于同一点时，可以用平行四边形法则求合力。

### 平行四边形法则

以两个力为邻边作平行四边形，对角线即为合力。

### 余弦定理求合力大小

$$F = \\sqrt{F_1^2 + F_2^2 + 2 F_1 F_2 \\cos\\theta}$$

**变量说明**：$F_1, F_2$ 为两个分力，$\\theta$ 为两力夹角，$F$ 为合力

### 特殊情况

| 夹角 | 合力 | 说明 |
|---|---|---|
| $\\theta = 0°$ | $F_1 + F_2$ | 同向，最大 |
| $\\theta = 90°$ | $\\sqrt{F_1^2 + F_2^2}$ | 勾股定理 |
| $\\theta = 120°$（等大时） | $F_1$ | 等大时合力等于分力 |
| $\\theta = 180°$ | $|F_1 - F_2|$ | 反向，最小 |

### 关键知识点

- **合力范围**：$|F_1 - F_2| \\leq F \\leq F_1 + F_2$
- **夹角越大，合力越小**：从 0° 到 180°，合力单调递减
- **三个力平衡**：任意两个力的合力与第三个力等大反向

> 💡 调整夹角到 90°，观察合力是否符合勾股定理。`,
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="12" x2="4" y2="6"/><line x1="12" y1="12" x2="20" y2="6"/><line x1="12" y1="12" x2="12" y2="20" stroke="#2ecc71"/></svg>`,
    params: [
      { key: "F1", label: "力 F₁ (N)", value: 5, min: 1, max: 15, step: 0.5 },
      { key: "F2", label: "力 F₂ (N)", value: 5, min: 1, max: 15, step: 0.5 },
      { key: "angle", label: "夹角 θ (°)", value: 60, min: 0, max: 180, step: 5 },
    ],
  },

  // ── 波的叠加 ──
  {
    id: "string-wave",
    level: "高中",
    category: "波",
    name: "波的叠加",
    desc: "两列波从两端相向传播，观察干涉与叠加",
    knowledge: `## 波的叠加（干涉）

两列波在同一介质中传播时，相遇处的位移等于两列波各自位移的**矢量和**。

### 核心公式（必背）

| 物理量 | 公式 | 单位 |
|--------|------|------|
| 波速 | $v = \\lambda / T = \\lambda f$ | m/s |
| 波长 | $\\lambda = v / f = vT$ | m |
| 周期 | $T = 1/f = \\lambda / v$ | s |
| 频率 | $f = 1/T = v / \\lambda$ | Hz |
| 角频率 | $\\omega = 2\\pi f = 2\\pi / T$ | rad/s |
| 波数 | $k = 2\\pi / \\lambda$ | rad/m |

### 三者关系（高频考点）

$$v = \\lambda f = \\frac{\\lambda}{T}$$

- **波速**由介质决定，与波长、频率无关
- **频率**由波源决定，波进入不同介质时不变
- **波长**随介质（波速）变化而变化

### 叠加原理

$$y = y_1 + y_2$$

- **波峰 + 波峰** → 振幅加倍（加强）
- **波谷 + 波谷** → 振幅加倍（加强）
- **波峰 + 波谷** → 完全抵消（减弱）

### 两列相向传播的波

- 左波：$y_1 = A\\sin(kx - \\omega t + \\varphi_L)$（向右传播）
- 右波：$y_2 = A\\sin(kx + \\omega t + \\varphi_R)$（向左传播）
- 合成：$y = 2A\\sin(kx)\\cos(\\omega t)$（当 $\\varphi_L = \\varphi_R$ 时形成驻波）

### 干涉条件

1. **频率相同**（$f_1 = f_2$）
2. **相位差恒定**
3. **振动方向相同**

满足以上条件称为**相干波**，叠加后形成稳定的加强/减弱分布。

### 驻波（重点）

两列等幅反向行波叠加形成驻波：

$$y = 2A\\sin(kx)\\cos(\\omega t)$$

- **波节**：$\\sin(kx) = 0$ 的点，始终不动
- **波腹**：$|\\sin(kx)| = 1$ 的点，振幅最大 $2A$
- 相邻波节（或波腹）间距：$\\lambda / 2$

> 💡 调节相位差观察：同相（$\\varphi_L = \\varphi_R$）时形成驻波；反相（相差 180°）时波节位置互换。`,
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12 Q5 6 8 12 Q11 18 14 12" stroke="#e74c3c"/><path d="M22 12 Q19 6 16 12 Q13 18 10 12" stroke="#3498db"/><path d="M2 12 Q5 6 8 12 Q11 18 14 12 Q17 6 20 12 Q23 18 26 12" stroke="#2ecc71" stroke-width="2.5"/></svg>`,
    params: [
      { key: "waveCount", label: "弦上波数", value: 3, min: 1, max: 6, step: 0.5 },
      { key: "amplitude", label: "振幅 (m)", value: 2, min: 0.3, max: 4, step: 0.1 },
      { key: "waveSpeed", label: "波速 (m/s)", value: 3, min: 1, max: 15, step: 0.5 },
      { key: "phaseL", label: "左波相位 (°)", value: 0, min: 0, max: 360, step: 15 },
      { key: "phaseR", label: "右波相位 (°)", value: 0, min: 0, max: 360, step: 15 },
    ],
  },

  // ── 凸透镜成像 ──
  {
    id: "convex-lens",
    level: "初中",
    category: "光学",
    name: "凸透镜成像",
    desc: "物距与像距的关系，观察实像与虚像",
    knowledge: `## 凸透镜成像规律

### 成像公式（薄透镜公式）

$$\\frac{1}{f} = \\frac{1}{u} + \\frac{1}{v}$$

- $f$：焦距（焦点到光心的距离）
- $u$：物距（物体到光心的距离）
- $v$：像距（像到光心的距离）

### 成像规律表（必背）

| 物距 $u$ | 像的性质 | 像距 $v$ | 应用 |
|----------|---------|---------|------|
| $u > 2f$ | 倒立、缩小、实像 | $f < v < 2f$ | 照相机 |
| $u = 2f$ | 倒立、等大、实像 | $v = 2f$ | 测焦距 |
| $f < u < 2f$ | 倒立、放大、实像 | $v > 2f$ | 投影仪 |
| $u = f$ | 不成像 | $v → ∞$ | 平行光源 |
| $u < f$ | 正立、放大、虚像 | $v < 0$（同侧） | 放大镜 |

### 口诀

**一倍焦距分虚实，二倍焦距分大小**

- $u > f$：成实像（倒立，异侧）
- $u < f$：成虚像（正立，同侧）
- $u > 2f$：缩小像
- $u < 2f$（且 $u > f$）：放大像

### 三条特殊光线

1. 平行于主光轴 → 折射过焦点
2. 过光心 → 方向不变
3. 过焦点 → 折射平行于主光轴

> 💡 拖动物体观察像的变化——注意物距等于焦距时像消失（光线平行），物距小于焦距时像变成正立放大的虚像。`,
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="12" rx="3" ry="10"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="12" y1="2" x2="12" y2="22"/></svg>`,
    params: [
      { key: "focalLength", label: "焦距 f (cm)", value: 10, min: 3, max: 20, step: 1 },
      { key: "objectDist", label: "物距 u (cm)", value: 30, min: 3, max: 60, step: 1 },
      { key: "objectHeight", label: "物高 (cm)", value: 4, min: 1, max: 8, step: 0.5 },
      { key: "showRays", label: "显示光线", value: 1, min: 0, max: 1, step: 1 },
    ],
  },

  // ── 凹透镜成像 ──
  {
    id: "concave-lens",
    level: "初中",
    category: "光学",
    name: "凹透镜成像",
    desc: "凹透镜始终成正立缩小的虚像",
    knowledge: `## 凹透镜成像规律

### 成像公式

$$\\frac{1}{f} = \\frac{1}{u} + \\frac{1}{v}$$

凹透镜焦距 $f < 0$（虚焦点）

### 成像特点

| 物距 $u$ | 像的性质 | 像距 $v$ |
|----------|---------|---------|
| $u > 0$（任意位置） | 正立、缩小、虚像 | $v < 0$（同侧） |

### 与凸透镜的对比

| | 凸透镜 | 凹透镜 |
|--|--------|--------|
| 对光线作用 | 会聚 | 发散 |
| 焦点 | 实焦点 | 虚焦点 |
| 像的性质 | 可实可虚 | 只能成虚像 |
| 应用 | 照相机、放大镜 | 近视眼镜 |

### 三条特殊光线

1. 平行于主光轴 → 折射光线的反向延长线过焦点
2. 过光心 → 方向不变
3. 射向焦点 → 折射平行于主光轴

> 💡 凹透镜始终成正立、缩小、虚像，像在物体同侧、焦点以内。`,
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="12" rx="3" ry="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M6 6l-2-2M6 18l-2 2M18 6l2-2M18 18l2 2"/></svg>`,
    params: [
      { key: "focalLength", label: "焦距 |f| (cm)", value: 10, min: 3, max: 20, step: 1 },
      { key: "objectDist", label: "物距 u (cm)", value: 30, min: 3, max: 60, step: 1 },
      { key: "objectHeight", label: "物高 (cm)", value: 4, min: 1, max: 8, step: 0.5 },
      { key: "showRays", label: "显示光线", value: 1, min: 0, max: 1, step: 1 },
    ],
  },

  // ── 声波测距（回声）──
  {
    id: "echo-ranging",
    level: "初中",
    category: "声学",
    name: "声波测距",
    desc: "小车发声波，遇墙反射回来，用回声测距",
    knowledge: `## 声波测距（回声）

声音遇到障碍物会反射回来，利用这个原理可以测量距离。

### 核心公式

$$d = \\frac{v \\times t}{2}$$

**变量说明**：$d$ 为到障碍物的距离，$v$ 为声速（空气中约 340 m/s），$t$ 为从发声到收到回声的总时间

### 为什么要除以 2？

声音走了**来回两趟**：发声 → 墙 → 回来。总路程是 $2d$，所以距离 $d = \\frac{vt}{2}$。

### 关键知识点

- **声速**：空气中约 340 m/s（15°C），水中约 1500 m/s
- **回声条件**：障碍物距离要大于 17 m（人耳能区分原声和回声的最短间隔约 0.1s）
- **应用**：声呐测海深、倒车雷达、蝙蝠捕食

### 常见题型

1. 已知距离和声速，求回声时间
2. 已知回声时间和声速，求距离
3. 汽车远离/靠近墙壁时的多普勒效应（高中）

> 💡 观察波的传播路径：发声 → 到墙 → 反射 → 回到小车。计时器记录的是来回的总时间。`,
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="12" width="8" height="6" rx="1"/><line x1="14" y1="4" x2="14" y2="20"/><path d="M18 8 Q22 12 18 16" stroke-dasharray="2 2"/><circle cx="5" cy="10" r="1" fill="currentColor"/></svg>`,
    params: [
      { key: "wallDist", label: "墙的距离 (m)", value: 170, min: 20, max: 1000, step: 10 },
      { key: "v0", label: "车速 (m/s)", value: 20, min: 0, max: 50, step: 1 },
      { key: "soundSpeed", label: "声速 (m/s)", value: 100, min: 50, max: 400, step: 10 },
    ],
  },

]

export const LEVELS = ["初中", "高中"]
export const CATEGORIES = ["力学", "声学", "波", "光学"]
