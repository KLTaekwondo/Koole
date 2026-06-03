// boat-river 模型数据
export default {
    id: "boat-river",
    level: "高中",
    category: "力学",
    name: "小船过河",
    desc: "小船在流水中的运动，合速度与渡河路径",
    knowledge: `## 小船过河

运动合成的经典问题。船速是船相对水的速度，水速是水相对岸的速度，合成才是船的实际运动。

速度分解：过河方向 $v_y = v_{船}\\cos\\theta$，顺流方向 $v_x = v_{船}\\sin\\theta + v_{水}$。

其中：$v_{船}$ 是船相对水的速度，$v_{水}$ 是水流速度，$\\theta$ 是船头与垂直河岸方向的偏角，$d$ 是河宽，$v_x$/$v_y$ 是实际运动的水平/垂直分速度。

两种典型问题要分清：
- **最短时间**：船头直指对岸（$\\theta=0°$），$t_{min} = \\frac{d}{v_{船}}$
- **最短路径**：船头偏向上游，$\\sin\\theta = \\frac{v_{水}}{v_{船}}$（前提 $v_{船} > v_{水}$）

容易搞混的地方：过河时间只看垂直河岸的速度分量，水速完全不影响过河时间！最短时间和最短路径是两回事，策略完全不同。船速 ≤ 水速时就没法垂直过河了。

> 偏角调成负值（偏向上游），船的路径变直——这就是最短路径策略。`,
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="18" x2="20" y2="18"/><polygon points="10 18 14 18 12 12"/><path d="M6 13 Q9 11 12 13 Q15 15 18 13" opacity="0.35" stroke-width="1.5"/></svg>`,
    params: [
      { key: "riverWidth", label: "河宽 (m)", value: 30, min: 8, max: 60, step: 1 },
      { key: "boatSpeed", label: "船速 (m/s)", value: 4, min: 1, max: 10, step: 0.5 },
      { key: "currentSpeed", label: "水流速度 (m/s)", value: 2, min: 0, max: 8, step: 0.5 },
      { key: "headingAngle", label: "船头偏角 (°)", value: 0, min: -60, max: 60, step: 1 },
    ],
    devNotes: `小船过河的物理不难，但偏角定义让我纠结了一会——最后选了"与垂直方向的夹角"，负值偏向上游，比较符合直觉。

\`\`\`js
vx = boatSpeed * sin(theta) + currentSpeed
vy = boatSpeed * cos(theta)
\`\`\`

船速 ≤ 水速时没法垂直过河，这种情况要处理好——显示"无法到达正对岸"的提示。

最短路径角 \`sin(θ) = v水/v船\` 实时计算并显示出来，用户可以直接看到理论最优角度。渡河进度百分比和下游偏移量也实时显示，帮助理解水速的影响。
`,
  }
