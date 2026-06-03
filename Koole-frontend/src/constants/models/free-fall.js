// free-fall 模型数据
export default {
    id: "free-fall",
    level: "初中",
    category: "力学",
    name: "自由落体",
    desc: "物体在重力作用下的竖直下落",
    knowledge: `## 自由落体

匀变速直线运动的特例——只受重力，初速为零。

- $v = gt$
- $h = \\frac{1}{2}gt^2$
- $v^2 = 2gh$

其中：$v$ 是末速度，$h$ 是下落高度，$t$ 是时间，$g$ 是重力加速度。

$g \\approx 9.8 \\, m/s^2$ 方向竖直向下，跟质量无关。伽利略比萨斜塔实验说的就是这个——不同质量的球同时落地。

有个结论做题经常用：连续相等时间间隔内位移比 = $1:3:5:7:\\cdots$，这个叫等时性，选择题很爱考。

> 把 g 调成 1.6（月球）或 3.7（火星），下落明显慢了——不同星球重力差这么多。`,
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="2" x2="12" y2="12"/><path d="M12 12l-3 3"/><path d="M12 12l3 3"/><circle cx="12" cy="18" r="3"/></svg>`,
    params: [
      { key: "height", label: "初始高度 (m)", value: 15, min: 1, max: 50, step: 0.5 },
      { key: "gravity", label: "重力加速度 (m/s²)", value: 9.8, min: 1, max: 20, step: 0.1 },
    ],
    devNotes: `## 开发笔记

自由落体是我做的第一个模型，算是整个模拟器的原型。

最开始纠结了很久用什么数值方法，欧拉法虽然简单但精度一般，RK4 又太复杂。后来想通了——帧率 60fps 的情况下欧拉法完全够用，没必要过度设计。

坐标系转换踩了个大坑：Canvas 的 y 轴向下，物理世界 y 轴向上。一开始没注意，球直接飞到屏幕外面去了。后来封装了个 w2s 函数统一处理，世界坐标转屏幕坐标。

速度箭头的长度一开始没限制，速度快了箭头直接戳出画面。加了个 Math.min 限制最大长度，视觉效果好多了。
`,
  }
