// echo-ranging 模型数据
export default {
    id: "echo-ranging",
    level: "初中",
    category: "声学",
    name: "声波测距",
    desc: "小车发声波，遇墙反射回来，用回声测距",
    knowledge: `## 声波测距

利用回声测距离：

- 距离公式：$d = \\frac{v \\times t}{2}$（除以 2 因为声音走了来回两趟）

其中：$d$ 是到障碍物的距离，$v$ 是声速，$t$ 是声音往返的总时间。

声速：空气约 340 m/s（15°C），水约 1500 m/s。回声能被人耳区分的最短距离约 17 m（人耳区分原声和回声的间隔约 0.1s）。

应用：声呐测海深、倒车雷达、蝙蝠捕食。

> 看波的路径：发声→到墙→反射→回来。计时器记录的是总时间，所以要除以 2。`,
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="12" width="8" height="6" rx="1"/><line x1="14" y1="4" x2="14" y2="20"/><path d="M18 8 Q22 12 18 16" stroke-dasharray="2 2"/><circle cx="5" cy="10" r="1" fill="currentColor"/></svg>`,
    params: [
      { key: "wallDist", label: "墙的距离 (m)", value: 170, min: 20, max: 1000, step: 10 },
      { key: "v0", label: "车速 (m/s)", value: 20, min: 0, max: 50, step: 1 },
      { key: "soundSpeed", label: "声速 (m/s)", value: 100, min: 50, max: 400, step: 10 },
    ],
    devNotes: `声波往返的模拟：

\`\`\`js
s.waveX += s.dir * soundSpeed * dt
s.carX += v0 * dt
if (s.waveX >= wallDist) s.dir = -1        // 碰墙反射
if (s.dir === -1 && s.waveX <= s.carX) s.waveDone = true  // 回到车
\`\`\`

车在动，波也在动——回程时波要追上移动的车，这个细节让模型更真实。

车速可以调，观察车速对回声时间的影响。
`,
  }
