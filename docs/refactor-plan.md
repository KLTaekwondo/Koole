# 物理模型重构清单（37 个）

> 目标：模型迁到 `render/` 新架构（ModelBase + ViewKit + 环境部件），并补 `dataSpec`。
> 状态：**动效模型已全部迁移；示意图类保留原绘制**（按画面排版，迁到世界坐标收益低、风险高）。

## 分类规则

| 字段 | 取值 | 判据 |
|---|---|---|
| `environment` | landscape / water / optical-bench / circuit-board / none | 舞台长什么样 |
| `dataSpec.kind` | series / snapshot / 无 | 有没有随时间变化的量 |
| `dataSpec.settle` | finish / window | `isFinished` 会不会变真 |

- **series**：有真实动力学过程（自由落体、抛体、碰撞、振动）
- **snapshot**：几何/稳态关系（折射、透镜、杠杆、电路）——记录「参数 → 结果」
- **无**：纯演示，画面即结论（不显示记录，只给说明）

## 当前状态

- 已迁移绘制：**23 / 37**
- 已有 dataSpec：**29 / 37**
- 保留原绘制（示意图类）：14 个

### 已迁移（23）

力学/动效：pendulum、free-fall、uniform-motion、vertical-throw、incline、projectile、
angled-projectile、friction-slide、mechanical-energy、ball-collision、connected-bodies、
conveyor-belt、block-board、drag-fall、bounce-deformation、boat-river、buoyancy、circular、
spring-mass、force-composition、lever、two-force-balance、refraction

### 保留原绘制（14，按设计决定）

光学示意图：refraction 已迁；**convex-lens、concave-lens、plane-mirror、water-refraction、
underwater-light** 保留旧绘制（画面居中排版，迁移收益低）
声/电示意图：echo-ranging、string-wave、sound-properties、series-circuit、parallel-circuit、ohm-slider
滑轮：pulley、movable-pulley、pulley-system

> 这些模型的旧绘制路径仍然可用（渲染器保留 legacy 分支），并且记录能力已按需补上。

### 无 dataSpec（8，显示「这个模型不需要记录」）

pulley、movable-pulley、pulley-system、series-circuit、parallel-circuit、
sound-properties、string-wave、two-force-balance

判断依据：稳态分配 / 纯示意，没有值得记录的随时间量或参数关系。

## 迁移约定（重要）

1. **场景层不能反向 import `physicsModels.js`**（会造成循环依赖，整个路由启动失败）。
   常量统一从 `render/geometry.js` 取。
2. 场景只依赖：`render/geometry.js`、`render/ViewKit.js`、`render/environments.js`、`render/ModelBase.js`。
3. 旧 `drawExtra` 先保留作对照，全量稳定后再删。
4. 每批完成后跑：`npm run build`、`npm run test:data`、`npm run lint:content`。

## 后续可选

- 14 个示意图若要统一到世界坐标，先补 Section 尺寸约定（画面居中 → 世界 y 换算已有 `view.worldYAt`）
- 滑轮与电路若要记录，适合 snapshot（机械效率 / 电流分配）
- 双轨迹（碰撞）需要渲染器支持多轨迹绘制
