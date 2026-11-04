# 实验数据系统设计稿

> 状态：设计阶段，未实现。目标版本 v1.11.0。

## 1. 现在的问题

| 现象 | 根因 |
|---|---|
| 单摆永远没有记录 | 记录只在「模拟自己结束」时触发，而单摆 `isFinished: () => false` |
| 记一条就存 5000 个轨迹点 | 记录粒度是「原始轨迹」，不是「实验结果」 |
| 想对比两组参数，没地方放 | 记录只服务于画曲线，没有「条件 → 结果」的结构 |
| 中途看到有意思的状态，存不下来 | 没有手动记录的入口 |
| 记录和渲染绑在一起 | 曲线靠重放 trail 点，换绘制方式就断 |

结论：现在的记录系统记的是「渲染的副产品」，而不是「用户做的一次实验」。

## 2. 核心概念

```
一次实验 = 参数 + 时间序列 + 关键指标 + 事件
```

- **Run（一次实验）**：用户点「记录」时落库的一条
- **Series（时间序列）**：画曲线用，降频采样
- **Metrics（关键指标）**：表格/对比用，标量
- **Events（事件）**：时间轴上的标注点（碰撞、到达最低点、落地）

## 3. 数据结构

```js
// 一条记录
{
  id: "run_1730_4f2a",
  modelId: "pendulum",
  modelName: "单摆",
  createdAt: 1730700000000,
  label: "模拟 3",                  // 可改名
  note: "",                         // 用户备注
  params: { length: 2, gravity: 9.8, initAngle: 30 },
  duration: 12.4,                   // 采样覆盖的模拟时长（秒）
  metrics: [
    { key: "period", label: "周期", value: 2.84, unit: "s" },
    { key: "maxSpeed", label: "最大速度", value: 4.2, unit: "m/s" }
  ],
  series: [
    { key: "theta", label: "摆角", unit: "°", points: [[0, 30], [0.05, 29.1], ...] }
  ],
  events: [
    { t: 1.2, label: "第一次过最低点" }
  ]
}
```

字段预算（控制 localStorage 体积）：

| 字段 | 上限 |
|---|---|
| `points` 每序列 | 600 点（超出自动抽稀） |
| `series` 每记录 | 3 条 |
| 每模型记录数 | 20 条（超出淘汰最旧） |
| 单条记录 | 目标 < 40 KB |

## 4. 模型怎么声明「记什么」

引擎不猜，模型自己声明 `dataSpec`：

```js
dataSpec: {
  metrics: [
    {
      key: "period",
      label: "周期",
      unit: "s",
      compute: (state, params) => state.period ?? null,   // 没有就返回 null，不显示
    },
  ],
  series: [
    {
      key: "theta",
      label: "摆角",
      unit: "°",
      sample: (state, params, t) => state.theta * 180 / Math.PI,
    },
  ],
  events: [
    {
      key: "crossing",
      label: "过最低点",
      detect: (state, prev, params) => prev.omega * state.omega < 0,
    },
  ],
}
```

- 没写 `dataSpec` 的模型 → 只能记录参数 + 时长（不画曲线），不报错
- `compute` / `sample` / `detect` 都是纯函数，不碰渲染
- 迁移时可以逐步补：单摆先写 `series.theta`，自由落体写 `series.height + metric.landTime`

## 5. 采样策略

- **触发**：`开始` 后开始采样，`暂停` 或点「记录」时结算
- **频率**：固定 20 Hz（`dt >= 0.05s` 才采一个点），与渲染帧率解耦
- **上限**：600 点后按步长 2 抽稀（1000 → 500），保持首尾点
- **时间基准**：用 `simState.simTime`（模拟时间），不是墙钟

这样单摆这种「永不结束」的模型也能记录：用户跑 10 秒，暂停，点记录，得到 200 个点。

## 6. 存储：纯内存

- 记录只存在内存里（`ref([])`），刷新或关标签页即清空
- 不做 localStorage：省掉配额、版本迁移、多标签页覆盖三类问题
- 按 `modelId` 分组，切换模型不会丢；每模型上限 20 条，超出淘汰最旧
- 需要长期保留时用「导出」（JSON / CSV），用户自己决定存哪
- 纯前端、不上传——和项目「不收集数据」的定位一致

## 7. 交互

```
胶囊：[单摆 ▾] ▶ ⟲ 🎯 ⤢ │ 参数 曲线 任务 原理 │ 分享
                              ↑
                        点「曲线」→ 面板
```

面板内三块：

1. **记录按钮**：大按钮「记录当前实验」，旁边显示「已采样 8.4s / 200 点」
2. **记录列表**：每条显示 `标签 · 参数摘要 · 创建时间`，可删除、可改名
3. **对比区**：勾选 2 条 → 叠加曲线 + 参数差异表（`length 2 → 3`）+ 指标差异

导出：

- CSV：`t, theta` 逐点导出，Excel 可开
- PNG：当前对比图（教学贴图用）

## 8. 与渲染迁移的关系

**完全解耦**。录制只依赖 `state / params / simTime`，不依赖 canvas。

顺序建议：先把数据系统做完（模型只加 `dataSpec`），再继续把 37 个模型迁到新渲染层——两边互不阻塞。

## 9. 文件清单

```
src/Logic/physics/data/
├── dataSpec.js        # dataSpec 类型说明 + 校验
├── sampler.js         # 采样器：按 20Hz 采样、抽稀、结算
└── metrics.js         # 指标/序列的通用计算（周期、峰值、落地时间）

src/stores/
└── experiments.js     # 响应式记录列表 + localStorage 读写 + 淘汰策略

src/views/physics/classic/
├── DataPanel.vue      # 记录列表 + 对比 + 导出
└── ExperimentSheet.vue# （可选）面板外壳，替代当前 tabs

scripts/
└── lint-content.mjs   # 增加：dataSpec 字段合法性校验
```

## 10. 分阶段实施

| 阶段 | 内容 | 预估 |
|---|---|---|
| P0 | `sampler` + `experiments` store + 手动记录（不画曲线） | 半天 |
| P1 | `DataPanel` 列表 + 删除 + 改名 | 半天 |
| P2 | 单摆 / 自由落体补 `dataSpec`，曲线能画 | 半天 |
| P3 | 对比视图（两条叠加 + 差异表） | 一天 |
| P4 | 导出 CSV / PNG | 半天 |

## 11. 待确认

1. `dataSpec` 的写法（`compute / sample / detect` 三个钩子）够不够用？
2. 采样 20 Hz、每序列 600 点、每模型 20 条——这些上限合适吗？
3. 「记录」是手动为主、结束时自动为辅，还是完全不自动？
4. 记录要不要跨模型对比（比如单摆 vs 弹簧振子）？我倾向只做同模型对比。
