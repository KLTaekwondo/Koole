# 物理模型重构清单（37 个）

> 目标：全部模型迁到 `render/` 新架构（ModelBase + ViewKit + 环境部件），并补 `dataSpec`。
> 状态：P0 基座完成（单摆已迁移），本文件是迁移进度表。

## 分类规则

| 字段 | 取值 | 判据 |
|---|---|---|
| `environment` | landscape / water / optical-bench / circuit-board / none | 舞台长什么样 |
| `dataSpec.kind` | series / snapshot / 无 | 有没有随时间变化的量 |
| `dataSpec.settle` | finish / window | `isFinished` 会不会变真 |

- **series**：有真实动力学过程（自由落体、抛体、碰撞、振动）
- **snapshot**：几何/稳态关系（折射、透镜、杠杆、电路）——记录「参数 → 结果」
- **无**：纯演示，画面即结论（不显示记录，只给说明）

## 进度总览

- 已完成基座：`render/ViewKit.js`、`render/environments.js`、`render/ModelBase.js`
- 已迁移模型：**单摆**（scene + series/window）、**自由落体**（dataSpec，绘制待迁）
- 待迁移：其余 35 个

## 一、力学（series 为主）

| 模型 id | environment | kind | settle | 关键序列 / 指标 |
|---|---|---|---|---|
| free-fall | landscape | series | finish | 高度、速度 / 落地时间、落地速度 |
| uniform-motion | landscape | series | window | 位移、速度 |
| vertical-throw | landscape | series | finish | 高度、速度 / 最高点、落地时间 |
| projectile | landscape | series | finish | 轨迹 x-y、速度 / 射程、飞行时间 |
| angled-projectile | landscape | series | finish | 轨迹、速度 / 射程、最大高度 |
| drag-fall | landscape | series | finish | 速度、加速度 / 终端速度 |
| bounce-deformation | landscape | series | finish | 高度、形变 / 反弹次数 |
| mechanical-energy | landscape | series | finish | 动能、势能、总能量 |
| incline | landscape | series | finish | 位移、速度 / 到底时间 |
| friction-slide | landscape | series | finish | 速度、摩擦力 |
| ball-collision | landscape | series | finish | 两球速度、动量 |
| connected-bodies | landscape | series | finish | 加速度、速度 |
| conveyor-belt | landscape | series | finish | 相对位移、摩擦力 |
| block-board | landscape | series | finish | 位移、速度 |
| boat-river | water | series | finish | 轨迹、合速度 / 过河时间 |
| buoyancy | water | series | window | 浮力、浸没深度 |
| pendulum ✅ | landscape | series | window | 摆角、角速度 / 理论周期 |
| spring-mass | landscape | series | window | 位移、速度 / 周期 |
| circular | none | series | window | 速度方向、向心加速度 |
| force-composition | none | **snapshot** | — | 合力大小、方向角 |
| lever | none | **snapshot** | — | 两侧力矩、平衡状态 |
| pulley | none | snapshot | — | 机械效率、省力比 |
| movable-pulley | none | snapshot | — | 效率、拉力 |
| pulley-system | none | snapshot | — | 效率、拉力 |

## 二、光学（多为 snapshot）

| 模型 id | environment | kind | settle | 关键结果 |
|---|---|---|---|---|
| refraction | optical-bench | **snapshot** | — | 入射角 → 折射角、临界角 |
| water-refraction | water | snapshot | — | 入射角 → 折射角 |
| underwater-light | water | snapshot | — | 入射角 → 折射角、全反射判定 |
| convex-lens | optical-bench | snapshot | — | 物距 → 像距、放大率、成像性质 |
| concave-lens | optical-bench | snapshot | — | 物距 → 像距、放大率 |
| plane-mirror | optical-bench | snapshot | — | 物距 → 像距、像高 |

## 三、声学

| 模型 id | environment | kind | settle | 说明 |
|---|---|---|---|---|
| string-wave | none | series | window | 波形、驻波节点（若要记） |
| sound-properties | none | 无 | — | 三要素演示，画面即结论 |
| echo-ranging | none | series | finish | 回波时间 → 距离 |

## 四、电学（多为 snapshot，稳态）

| 模型 id | environment | kind | settle | 关键结果 |
|---|---|---|---|---|
| ohm-slider | circuit-board | **snapshot** | — | 滑片 → 电流 I、电压 U、电阻 R |
| series-circuit | circuit-board | 无 | — | 稳态分配，画面即结论 |
| parallel-circuit | circuit-board | 无 | — | 同上 |

## 迁移顺序建议

1. **批次 A（简单力学，7 个）**：uniform-motion、vertical-throw、projectile、angled-projectile、incline、friction-slide、mechanical-energy
2. **批次 B（光学 snapshot，6 个）**：refraction、water-refraction、underwater-light、convex-lens、concave-lens、plane-mirror
3. **批次 C（其余力学，13 个）**
4. **批次 D（声学 / 电学 / 滑轮，8 个）**

每批完成的标准：

- 该模型有 `drawScene(view, s, p)`，旧 `drawExtra` 保留但不再被调用
- 有自己的 `environment` 与 `dataSpec`
- `npm run build` + `npm run test:data` + `npm run lint:content` 通过
- 手动验证：画布、缩放、轨迹、记录四条
