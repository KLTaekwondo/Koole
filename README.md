<p align="center">
  <br>
  <h1 align="center">Koole · 酷了</h1>
  <p align="center">
    学点东西，<strong>酷了</strong>！
    <br>
    物理 · 数学 —— 用互动的方式，理解那些曾经死记的知识。
  </p>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Vue-3.5-4FC08D?logo=vue.js" alt="Vue 3">
  <img src="https://img.shields.io/badge/Vite-7-646CFF?logo=vite" alt="Vite">
  <img src="https://img.shields.io/badge/Canvas-2D-FF6B35" alt="Canvas 2D">
  <img src="https://img.shields.io/badge/license-MIT-blue" alt="License">
</p>

<br>

## 📖 介绍

**Koole**（酷了）是一个纯前端的理科交互实验室，把公式变成看得见的动画。

拖个滑块调参数，看小球怎么滚——比对着课本空想直观多了。

目前 **物理** 和 **数学** 两个学科已经开放，共 **37 个物理模型** + 3 个数学实验室 + 物理/数学关卡。

<details>
<summary>🧪 物理模型（37 个）</summary>

| 分类 | 数量 | 模型 |
|------|------|------|
| 力学 | 25 | 自由落体、匀速直线运动、二力平衡、平抛运动、斜向上抛、竖直上抛、圆周运动、斜面滑动、粗糙面滑动、空气阻力落体、单摆、弹簧振子、机械能转化、两球碰撞、碰撞变形、板块模型、连接体、传送带、杠杆、定滑轮、动滑轮、滑轮组、小船过河、力的合成、浮力 |
| 光学 | 6 | 凸透镜成像、凹透镜成像、平面镜成像、光的折射、水中视深、水下灯光 |
| 电学 | 3 | 串联电路、并联电路、欧姆定律与滑动变阻器 |
| 声学 | 2 | 声波测距、声音三要素 |
| 波 | 1 | 波的叠加 |

</details>

<details>
<summary>🧮 数学实验室</summary>

| 实验室 | 内容 |
|------|------|
| 函数实验室 | 无限画布、多函数同时绘制、交点标注、相机与网格自适应 |
| 立体几何实验室 | 三维几何体构建与旋转观察、求交分析 |
| 概率钉板实验室 | 高尔顿板二项分布，实时统计分布曲线 |
| 函数关卡 | 关卡数据 + 通关进度，边玩边练 |

</details>

<details>
<summary>⚗️ 化学 / 其他学科</summary>

**已开放**：化学 —— 元素周期表（118 个元素，含详情页与百科内容），化学实验室（分子模型）在建设中。

**计划中**：生物（细胞 / DNA / 神经元）、地理（地球 / 地图 / 气候）。

**暂不纳入规划**：历史、语文、英语、政治 —— 这些学科以阅读和记忆为主，交互模拟收益有限；页面仍保留，可从首页「其他学科」卡片进入查看。

</details>

## 🚀 快速开始

```bash
cd Koole-frontend
npm install
npm run dev      # 开发服务器，默认 http://localhost:5173
```

无需后端，无需数据库。

常用命令：

```bash
npm run dev            # 开发服务器，默认 http://localhost:5173
npm run build          # 生产构建（输出到 dist/）
npm run preview        # 预览构建产物
npm run lint:content   # 内容规范校验：knowledge 格式、模型注册、首页统计、编码
npm run electron:dev   # 桌面端开发：脚本先起 vite，就绪后自动拉起 electron
npm run electron:build # 打包 Windows 桌面端
```

## 🏗️ 项目结构

```
Koole/
└── Koole-frontend/
    ├── scripts/
    │   ├── lint-content.mjs        # 内容规范校验（模型字段 / knowledge / 编码 / 首页统计）
    │   └── electron-dev.mjs        # 桌面端开发编排（vite 就绪后拉起 electron）
    ├── electron/                   # Electron 桌面端壳
    └── src/
        ├── Logic/
        │   ├── physics/
        │   │   ├── models/         # 37 个自包含物理模型（数据 + 物理 + 渲染）
        │   │   ├── physicsModels.js# 模型注册表 + 分类
        │   │   ├── core/           # Ball / Box / Ramp / Pendulum / SpringMass 等物类
        │   │   ├── engine/         # 模拟循环、相机、渲染器、Canvas 管理
        │   │   ├── sandbox/        # 沙盒世界、碰撞、物体类型、预设
        │   │   └── interaction/    # 沙盒交互（Pointer 状态机：拖拽 / 平移 / 捏合）
        │   ├── math/               # 函数求值、采样、几何构建、求交、渲染
        │   └── chemistry/          # 元素详情页派生内容（分类/分区说明、电子层、性质对比）
        ├── Levels/                 # 物理关卡、数学关卡数据
        ├── content/                # 知识小站：现象条目（发现故事 + 知识点 + 对应模拟）
        ├── views/                  # 页面（按学科分目录）
        │   ├── home / about / progress / knowledge / subjects # 首页、关于、进度、知识小站、其他学科
        │   ├── physics/            # 实验室入口、经典模型、物理关卡、沙盒
        │   ├── math/               # 函数、立体几何、概率、函数关卡
        │   ├── chemistry/          # 化学实验室、元素周期表
        │   └── 其他学科占位页
        ├── components/             # NavBar、Toast、学科 Launch 卡片等
        ├── constants/              # 学科、元素周期表、生物/化学模型数据
        ├── stores/                 # 主题、Toast、学习进度（探索记录 / 最近浏览）
        ├── route/index.js          # 路由（hash 模式）
        └── assets/                 # 主题变量、图标、图片
```

## 🛠️ 技术栈

| 技术 | 用途 |
| --- | --- |
| [Vue 3](https://vuejs.org/)（Composition API） | UI 框架 |
| [Vue Router](https://router.vuejs.org/) | 路由（hash 模式，方便桌面端） |
| [Vite](https://vitejs.dev/) | 构建工具 |
| Canvas 2D | 物理 / 数学模拟渲染（自研引擎，无 Box2D / Matter.js） |
| [Three.js](https://threejs.org/) | 立体几何实验室 |
| [ECharts](https://echarts.apache.org/) | 轨迹对比图表 |
| [md-editor-v3](https://imzbf.github.io/md-editor-v3/) | Markdown + LaTeX 知识内容渲染 |
| [Electron](https://www.electronjs.org/) | 桌面端打包 |

## 🎯 特色

- **纯 Canvas 自研物理引擎** — 每个模型手推公式，不依赖物理引擎库
- **模型自包含** — 一个 `.js` 文件就是「参数 + 物理 + 渲染 + 知识 + 探索任务」，改一个不影响其他
- **任务式探索** — 每个模型带一个探索任务（改什么参数、观察什么现象、怎么算完成）
- **学习进度图鉴** — 完成的探索会记进「进度」页：37 个模型按分类点亮，带最近浏览与关卡通关数（只存本地浏览器）
- **参数分享链接** — 「分享」按钮把当前参数写进 URL，打开链接直接还原到同一组参数
- **元素周期表详情页** — 118 个元素都有位置、电子层结构、分类说明与同族/同周期邻居；手写百科内容按批次补充
- **首屏瘦身** — 路由级懒加载 + 第三方库分包，首页 JS 约 138 kB；Three.js / ECharts / Markdown 只在对应页面加载
- **无限画布函数实验室** — 多函数同屏、拖动缩放、交点标注
- **深色 / 浅色主题** — 跟随系统偏好或手动切换
- **实时轨迹对比** — 同屏多条轨迹，直观感受参数变化
- **沙盒自由模式** — 鼠标 / 触摸 / 笔统一交互，自由放置物体、捏合缩放
- **桌面端与移动端适配** — 触摸手势与 HiDPI 均已处理

## 📐 模型文件格式

每个物理模型导出一个对象，核心字段：

```js
export default {
  id, name, category, level, desc,        // 元信息
  knowledge: `## 模型名 ...`,              // 知识内容（Markdown + LaTeX）
  exploration: { task, hint, check },     // 探索任务（check 返回是否完成）
  params: [{ key, label, value, min, max, step }],
  createState, step, isFinished,          // 物理逻辑
  getInfoLines, chartDefs,                // 信息浮层与图表
  drawExtra,                              // Canvas 渲染
}
```

`knowledge` 的排版规则（标题、空行、中文标点、`其中：`、`> 参数观察`）由 `npm run lint:content` 自动校验。

## 📝 License

MIT
