<p align="center">
  <br>
  <h1 align="center">Koole · 酷了</h1>
  <p align="center">
    学点东西，<strong>酷了</strong>！
    <br>
    物理 · 编程 · 数学 —— 用互动的方式，理解那些曾经死记的知识。
  </p>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Vue-3.5-4FC08D?logo=vue.js" alt="Vue 3">
  <img src="https://img.shields.io/badge/Vite-6-646CFF?logo=vite" alt="Vite">
  <img src="https://img.shields.io/badge/Canvas-2D-FF6B35" alt="Canvas 2D">
  <img src="https://img.shields.io/badge/license-MIT-blue" alt="License">
</p>

<br>

## 📖 介绍

**Koole**（酷了）是一个纯前端的物理交互模拟器，把物理公式变成看得见的动画。

拖个滑块调参数，看小球怎么滚——比对着课本空想直观多了。

目前包含 **30 个物理模型**，覆盖力学、声学、波、光学、电学：

<details>
<summary>🧪 模型列表</summary>

| 分类 | 模型 |
|------|------|
| 力学 | 自由落体、平抛运动、竖直上抛、圆周运动、斜面滑动、单摆、斜向上抛、小船过河、弹簧振子、粗糙面滑动、空气阻力落体、碰撞变形、两球碰撞、连接体、传送带、板块模型、杠杆 |
| 声学 | 回声测距 |
| 波 | 弦波 |
| 光学 | 凸透镜、凹透镜、光的折射、水中折射、水下灯光 |
| 电学 | 串联电路、并联电路、力的合成 |
| 滑轮 | 定滑轮、动滑轮、滑轮组 |
| 浮力 | 浮力 |

</details>

## 🚀 快速开始

```bash
cd Koole-frontend
npm install
npm run dev
```

前端默认在 `http://localhost:5173` 启动。无需后端，无需数据库。

## 🏗️ 项目结构

```
Koole/
└── Koole-frontend/               # Vue 3 纯前端应用
    └── src/
        ├── assets/style/         # 主题变量（含深色模式）、基础样式
        ├── components/           # NavBar, Toast, ConfirmDialog 等通用组件
        ├── constants/
        │   ├── models/           # 30 个物理模型（每个自包含数据+物理+渲染）
        │   │   ├── free-fall.js
        │   │   ├── projectile.js
        │   │   ├── ...          # 每个模型 = UI 数据 + 物理引擎 + Canvas 渲染
        │   │   └── index.js     # 汇总导出
        │   ├── physicsModels.js  # 模型注册表
        │   ├── physics.js        # 物理常量
        │   └── modelTypes.js     # 沙盒物体类型
        ├── stores/               # 主题、物理模拟状态
        │   └── physics/          # 物理引擎（渲染器、相机、碰撞检测）
        └── views/
            ├── HomeIndex.vue     # 首页
            ├── classic/          # 经典模型（布局/模拟/信息面板/轨迹对比）
            └── SandBox.vue       # 沙盒模式
```

## 🛠️ 技术栈

| 技术 | 用途 |
| --- | --- |
| [Vue 3](https://vuejs.org/) (Composition API) | UI 框架 |
| [Vue Router](https://router.vuejs.org/) | 路由 |
| [Vite](https://vitejs.dev/) | 构建工具 |
| [ECharts](https://echarts.apache.org/) | 轨迹对比图表 |
| [md-editor-v3](https://imzbf.github.io/md-editor-v3/) | Markdown 编辑/预览 |
| Canvas 2D | 物理模拟渲染（自研引擎，无外部依赖） |

## 🎯 特色

- **纯 Canvas 自研物理引擎** — 没有 Box2D / Matter.js，每个模型手动推公式
- **模型自包含** — 每个 `.js` 文件 = 数据 + 物理 + 渲染，改一个不影响其他
- **深色/浅色主题** — 跟随系统偏好或手动切换
- **实时轨迹对比** — 同屏多条轨迹，直观感受参数变化
- **交互式参数面板** — 滑块调节，实时反馈
- **沙盒自由模式** — 自由放置物体，探索物理规律

## 📝 License

MIT
