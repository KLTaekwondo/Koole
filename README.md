<p align="center">
  <br>
  <h1 align="center">Koole · 酷了</h1>
  <p align="center">
    学点东西，<strong>酷了</strong>！
    <br>
    物理 · 编程 · 数学 —— 用互动的方式，理解那些曾经死心的知识点。
  </p>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Vue-3.5-4FC08D?logo=vue.js" alt="Vue 3">
  <img src="https://img.shields.io/badge/Spring%20Boot-4.0.6-6DB33F?logo=springboot" alt="Spring Boot 4">
  <img src="https://img.shields.io/badge/Java-17-ED8B00?logo=openjdk" alt="Java 17">
  <img src="https://img.shields.io/badge/MySQL-8+-4479A1?logo=mysql" alt="MySQL 8">
  <img src="https://img.shields.io/badge/license-MIT-blue" alt="License">
</p>

<br>

## 📖 介绍

**Koole**（酷了）是一个个人向的物理学习互动平台，把枯燥的物理公式变成看得见、摸得着的模拟实验。

与其对着课本空想「小球怎么滚」，不如直接拖个滑块调参数，看它怎么滚。

目前包含：
- 🧪 **16 个经典物理模型** — 自由落体、平抛、圆周运动、单摆、碰撞……应有尽有
- 🎨 **沙盒模式** — 自由放置物体，拖拽调整参数，想怎么玩就怎么玩
- 📝 **文章系统** — 写点笔记、整理知识点
- 🌙 **深色模式** — 护眼，也好看

## 🚀 快速开始

### 环境要求

| 工具 | 版本 |
| --- | --- |
| Node.js | >= 18 |
| Java | >= 17 |
| MySQL | >= 8.0 |
| Maven | 3.6+ |

### 1. 启动后端

```bash
cd Koole-backend

# 创建数据库（MySQL 8+）
mysql -u root -p -e "CREATE DATABASE koole_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# 修改配置（必要时）
# src/main/resources/application.properties
# spring.datasource.username=root
# spring.datasource.password=123456

# 启动
mvn spring-boot:run
```

后端默认在 `http://localhost:8080` 启动。

### 2. 启动前端

```bash
cd Koole-frontend
npm install
npm run dev
```

前端默认在 `http://localhost:5173` 启动。

## 🧪 物理模型一览

| 模型 | 说明 | 关键参数 |
| --- | --- | --- |
| 自由落体 | 物体在重力作用下竖直下落 | 高度、重力加速度 |
| 平抛运动 | 水平抛出 + 重力 | 水平速度、高度 |
| 竖直上抛 | 竖直上抛，上升后回落 | 初速度、重力加速度 |
| 圆周运动 | 匀速圆周，向心力 | 半径、角速度 |
| 斜面滑动 | 无摩擦斜面下滑 | 斜面角度、质量 |
| 单摆 | 简谐运动 | 摆长、初始角度 |
| 斜向上抛 | 斜抛运动，抛物线轨迹 | 初速度、角度 |
| 小船过河 | 速度合成与分解 | 船速、水速、河宽 |
| 弹簧振子 | 弹簧-质量简谐振动 | 劲度系数、质量 |
| 粗糙面滑动 | 有摩擦的减速运动 | 摩擦系数、初速度 |
| 空气阻力落体 | 考虑空气阻力的落体 | 阻力系数、质量 |
| 碰撞变形 | 弹性/非弹性碰撞形变 | 弹性系数 |
| 两球碰撞 | 一维对心碰撞 | 质量比、弹性系数 |
| 连接体 | 滑轮系统，两物体连接 | 质量比 |
| 传送带 | 传送带上的摩擦力驱动 | 摩擦系数、带速 |
| 板块模型 | 木块在木板上相对滑动 | 质量比、摩擦系数 |

每个模型都配有实时数据面板（速度、位置、能量等）和轨迹追踪。

## 🏗️ 项目结构

```
Koole/
├── Koole-frontend/               # Vue 3 前端
│   ├── src/
│   │   ├── assets/style/         # 主题变量（含深色模式）、基础样式
│   │   ├── axios/                # API 请求层
│   │   │   ├── api/              # 原始 API 调用
│   │   │   ├── interface/        # 封装接口
│   │   │   └── backendService.js # HTTP 客户端
│   │   ├── components/           # NavBar, Toast, ConfirmDialog 等通用组件
│   │   ├── constants/            # 16 个物理模型定义 + 沙盒物体类型
│   │   ├── physics/              # 物理引擎核心（纯 Canvas + 碰撞检测）
│   │   ├── route/                # 路由配置
│   │   ├── stores/               # 主题、用户、消息提示、物理模拟状态
│   │   └── views/                # 页面组件
│   │       ├── HomeIndex.vue     # 首页
│   │       ├── Article*.vue      # 文章系统（列表/详情/编辑）
│   │       ├── UpdatePost*.vue   # 更新日志
│   │       ├── PhysicsLab.vue    # 物理实验室
│   │       ├── classic/          # 经典模型（布局/模拟/信息面板/对比）
│   │       └── SandBox.vue       # 沙盒模式
│   └── package.json
│
├── Koole-backend/                # Spring Boot 后端
│   └── src/main/java/com/kldo/koolebackend/
│       ├── controller/           # REST 控制器
│       ├── service/              # 业务逻辑
│       ├── entity/               # JPA 实体
│       ├── repository/           # 数据访问
│       ├── dto/ + info/          # 数据传输与响应对象
│       ├── config/               # Security + JWT 配置
│       ├── exception/            # 全局异常处理
│       └── utils/                # 工具类
```

## 🛠️ 技术栈

### 前端
| 技术 | 用途 |
| --- | --- |
| [Vue 3](https://vuejs.org/) (Composition API) | UI 框架 |
| [Vue Router](https://router.vuejs.org/) | 路由 |
| [Vite](https://vitejs.dev/) | 构建工具 |
| [Axios](https://axios-http.com/) | HTTP 请求 |
| [ECharts](https://echarts.apache.org/) | 轨迹对比图表 |
| [md-editor-v3](https://imzbf.github.io/md-editor-v3/) | Markdown 编辑/预览 |
| Canvas 2D | 物理模拟渲染（自研引擎，无外部依赖） |

### 后端
| 技术 | 用途 |
| --- | --- |
| [Spring Boot 4](https://spring.io/projects/spring-boot) | 应用框架 |
| Spring Data JPA | ORM |
| Spring Security | 认证授权 |
| JWT (jjwt) | 令牌认证 |
| [MySQL 8](https://www.mysql.com/) | 数据库 |

## 🎯 特色

- **纯 Canvas 自研物理引擎** — 没有使用 Box2D / Matter.js，每个模型手动推公式
- **深色/浅色主题** — 跟随系统偏好 or 手动切换，localStorage 持久化
- **实时轨迹对比** — 同屏展示多条轨迹，直观感受参数变化的影响
- **交互式参数面板** — 滑块调节、实时反馈
- **沙盒自由模式** — 自由放置物体，探索物理规律

## 📝 License

MIT
