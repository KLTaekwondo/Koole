// string-wave 模型数据
export default {
    id: "string-wave",
    level: "高中",
    category: "波",
    name: "波的叠加",
    desc: "两列波从两端相向传播，观察干涉与叠加",
    knowledge: `## 波的叠加

两列波相遇位移直接相加：$y = y_1 + y_2$，这就是叠加原理。

公式表：波速 $v = \\lambda f$，角频率 $\\omega = 2\\pi f$，波数 $k = 2\\pi / \\lambda$。

其中：$v$ 是波速，$\\lambda$ 是波长，$f$ 是频率，$\\omega$ 是角频率，$k$ 是波数，$A$ 是振幅，$y$ 是位移。

三者关系 $v = \\lambda f$ 里，波速由介质决定，频率由波源决定，波长随介质变化。这个区别很重要——波进不同介质时频率不变、波速变了、波长也跟着变。

叠加效果：波峰+波峰加强，波谷+波谷加强，波峰+波谷减弱（可能完全抵消）。

驻波是重点：两列等幅反向行波叠加 $y = 2A\\sin(kx)\\cos(\\omega t)$。波节始终不动，波腹振幅最大（2A），相邻波节间距 $\\lambda/2$。

干涉条件：频率相同 + 相位差恒定 + 振动方向相同 → 相干波。

> 调相位差看看：同相时形成驻波，反相时波节位置互换——挺神奇的。`,
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12 Q5 6 8 12 Q11 18 14 12" stroke="#e74c3c"/><path d="M22 12 Q19 6 16 12 Q13 18 10 12" stroke="#3498db"/><path d="M2 12 Q5 6 8 12 Q11 18 14 12 Q17 6 20 12 Q23 18 26 12" stroke="#2ecc71" stroke-width="2.5"/></svg>`,
    params: [
      { key: "waveCount", label: "弦上波数", value: 3, min: 1, max: 6, step: 0.5 },
      { key: "amplitude", label: "振幅 (m)", value: 2, min: 0.3, max: 4, step: 0.1 },
      { key: "waveSpeed", label: "波速 (m/s)", value: 3, min: 1, max: 15, step: 0.5 },
      { key: "phaseL", label: "左波相位 (°)", value: 0, min: 0, max: 360, step: 15 },
      { key: "phaseR", label: "右波相位 (°)", value: 0, min: 0, max: 360, step: 15 },
    ],
    devNotes: `波的叠加就是两列波各自算位移然后相加：

\`\`\`js
yL = A * Math.sin(k*x - omega*t + phiL)  // 左波
yR = A * Math.sin(k*x + omega*t + phiR)  // 右波
yS = yL + yR                              // 叠加
\`\`\`

100 个采样点让波形平滑。快照每 0.2 秒存一次，数据量可控。

同相时形成驻波，这个效果是这个模型最酷的地方——调节相位差观察波节和波腹的变化。
`,
  }
