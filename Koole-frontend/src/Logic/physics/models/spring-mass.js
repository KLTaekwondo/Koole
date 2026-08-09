// spring-mass 模型数据
const GROUND_Y = 0.4

export default {
    id: "spring-mass",
    level: "高中",
    category: "力学",
    name: "弹簧振子",
    desc: "物体在弹簧作用下的简谐振动，动能与势能相互转化",
    knowledge: `## 弹簧振子

核心就是胡克定律 $F = -kx$，回复力跟位移成正比、方向相反。

- 加速度：$a = -\\frac{k}{m}x$
- 位移：$x(t) = A\\cos(\\omega t + \\varphi)$
- 角频率：$\\omega = \\sqrt{\\frac{k}{m}}$
- 周期：$T = 2\\pi\\sqrt{\\frac{m}{k}}$（跟振幅无关！）

其中：$k$ 是劲度系数，$m$ 是质量，$x$ 是位移，$A$ 是振幅，$\\omega$ 是角频率，$\\varphi$ 是初相位，$T$ 是周期。

能量方面：
- 动能 $E_k = \\frac{1}{2}mv^2$
- 弹性势能 $E_p = \\frac{1}{2}kx^2$
- 总机械能 $E = \\frac{1}{2}kA^2$ 守恒

其中：$E_k$ 是动能，$E_p$ 是弹性势能，$v$ 是速度。

平衡位置（$x=0$）速度最大、势能为零；最大位移处速度为零、势能最大。动能和势能一直在互相转化，但总和不变。

> 能量条的变化很直观——动能和势能像跷跷板，总能量那条线始终不动。`,
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="6" x2="3" y2="20"/><polyline points="3,13 6,9 9,17 12,9 15,17 18,13"/><rect x="16" y="8" width="7" height="7" fill="rgba(0,0,0,0.1)"/></svg>`,
    params: [
      { key: "mass", label: "质量 (kg)", value: 1, min: 0.2, max: 5, step: 0.1 },
      { key: "k", label: "劲度系数 (N/m)", value: 10, min: 1, max: 30, step: 0.5 },
      { key: "initX", label: "初始位移 (m)", value: 2, min: 0.3, max: 5, step: 0.1 },
    ],
    devNotes: `弹簧振子的物理逻辑很简洁，就是胡克定律：

\`\`\`js
a = -(k / mass) * s.x
s.vx += a * dt
s.x += s.vx * dt
\`\`\`

动能和势能每帧都算，图表同时显示三条曲线（位置、速度、能量），能直观看到能量守恒。

弹簧的 zigzag 绘制花了不少时间——要根据物体位置动态调整弹簧的压缩和拉伸，画得好看不容易。物理逻辑和渲染逻辑分开，renderer 负责画弹簧，physics 只管算数。

动画跑 3 个周期就停，足够看清重复 pattern。
`,

    // ── 物理逻辑 ──
    createState: (p) => ({ x: p.initX, vx: 0, trail: [], _t: 0 }),
    step: (s, p, dt) => {
      const a = -(p.k / p.mass) * s.x
      s.vx += a * dt
      s.x += s.vx * dt
      s._t += dt
    },
    isFinished: (s, p) => {
      const T = 2 * Math.PI * Math.sqrt(p.mass / p.k)
      return s._t >= 3 * T
    },
    getBallPosition: (s) => ({ x: s.x, y: GROUND_Y }),
    getTrailPosition: (s) => ({ x: s.x, y: GROUND_Y }),
    trailFields: (s, p) => ({
      t: s._t, vx: s.vx, x: s.x,
      Ek: 0.5 * p.mass * s.vx * s.vx,
      Ep: 0.5 * p.k * s.x * s.x,
    }),
    chartDefs: [
      { title: "x-t 图（位移）", xLabel: "t (s)", yLabel: "x (m)", getData: (trail) => [{ name: "位移", data: trail.map(p => [p.t, p.x]) }] },
      { title: "v-t 图（速度）", xLabel: "t (s)", yLabel: "v (m/s)", getData: (trail) => [{ name: "速度", data: trail.map(p => [p.t, p.vx]) }] },
      { title: "Ep-t 图（弹性势能）", xLabel: "t (s)", yLabel: "Ep (J)", getData: (trail) => [{ name: "势能", data: trail.map(p => [p.t, p.Ep]) }] },
    ],
    getInfoLines: (s, p, t) => {
      const ke = 0.5 * p.mass * s.vx * s.vx
      const pe = 0.5 * p.k * s.x * s.x
      const period = 2 * Math.PI * Math.sqrt(p.mass / p.k)
      return [
        `位移: ${s.x.toFixed(2)} m`,
        `速度: ${s.vx.toFixed(2)} m/s`,
        `加速度: ${(-(p.k / p.mass) * s.x).toFixed(2)} m/s²`,
        `动能: ${ke.toFixed(2)} J | 势能: ${pe.toFixed(2)} J`,
        `机械能: ${(ke + pe).toFixed(2)} J`,
        `周期: ${period.toFixed(2)} s`,
        `剩余: ${Math.max(0, 3 * period - t).toFixed(2)} s`,
      ]
    },

    // ── 渲染逻辑 ──
    drawExtra: (ctx, s, p, w2s) => {
      const massPos = w2s(s.x, GROUND_Y)
      const wallX = -p.initX - 0.8
      const wallPos = w2s(wallX, GROUND_Y)
      ctx.fillStyle = "#666"
      ctx.fillRect(wallPos.x - 3, wallPos.y - 16, 6, 32)
      ctx.strokeStyle = "#888"
      ctx.lineWidth = 1
      ctx.strokeRect(wallPos.x - 3, wallPos.y - 16, 6, 32)
      const dx = massPos.x - wallPos.x
      const segs = Math.max(8, Math.round(Math.abs(dx) / 6))
      const amp = Math.min(7, Math.abs(dx) / segs * 3)
      ctx.beginPath()
      ctx.moveTo(wallPos.x, wallPos.y)
      for (let i = 1; i <= segs; i++) {
        const t = i / segs
        ctx.lineTo(wallPos.x + dx * t, wallPos.y + (i % 2 === 0 ? -amp : amp))
      }
      ctx.lineTo(massPos.x - 12, massPos.y)
      ctx.strokeStyle = "#999"
      ctx.lineWidth = 1.8
      ctx.stroke()
    },
  }
