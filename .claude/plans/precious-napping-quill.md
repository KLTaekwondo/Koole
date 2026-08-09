# 数学函数实验室 - 实现计划

## 目标

创建一个交互式函数图形计算器页面，作为数学实验室的第一个可交互模块。用户可以在画布上绘制函数图像、拖动探测点观察函数值、输入自定义函数表达式。

## 路由与文件结构

```
/math-lab                    → MathLab.vue (已有，主页)
/math-lab/function-lab       → FunctionLab.vue (新建)
```

### 新增文件

- `src/views/FunctionLab.vue` - 函数实验室页面

### 修改文件

- `src/route/index.js` - 添加新路由
- `src/views/MathLab.vue` - 添加跳转按钮到第一个模块

---

## 核心功能设计

### 1. 函数图像绘制
- Canvas 2D 绘制坐标系（网格线、x/y 轴、刻度）
- 支持绘制任意数学函数：`y = sin(x)`, `y = x²`, `y = log(x)` 等
- 使用 math.js 库解析函数表达式
- 支持多个函数叠加显示，每个函数不同颜色

### 2. 交互式探测点
- 画布上有一个可拖动的探测点
- 拖动时实时显示 `(x, f(x))` 坐标
- 在函数图像上高亮显示对应的点
- 显示函数值的实时读数

### 3. 函数输入面板
- 侧边栏或底部面板
- 输入框允许输入函数表达式
- 预设常用函数快捷按钮：sin, cos, tan, log, ln, √, x², x³
- 函数列表：显示当前所有函数，可开关显示、删除
- 颜色选择：每个函数可自定义颜色

### 4. 坐标系控制
- 鼠标滚轮缩放
- 拖动画布平移
- 双击重置视图
- 显示当前缩放比例

---

## UI 布局设计

```
┌─────────────────────────────────────────────────────┐
│  ← 返回数学实验室          函数实验室    [专注模式]  │
├─────────────────────────────────────────────────────┤
│                                                     │
│   ┌─────────────────────────────────────────────┐   │
│   │                                             │   │
│   │              Canvas 画布                     │   │
│   │          (坐标系 + 函数图像)                 │   │
│   │                                             │   │
│   │                  ● ← 探测点                  │   │
│   │                                             │   │
│   │   ┌──────────────────────┐                  │   │
│   │   │ x: 1.23  y: 2.45   │ ← 读数面板       │   │
│   │   └──────────────────────┘                  │   │
│   └─────────────────────────────────────────────┘   │
│                                                     │
│   ┌─────────────────────────────────────────────┐   │
│   │  函数输入                                    │   │
│   │  ┌─────────────────────────┐ [sin][cos][x²] │   │
│   │  │ y = sin(x)              │                │   │
│   │  └─────────────────────────┘ [添加]         │   │
│   │                                             │   │
│   │  当前函数：                                  │   │
│   │  ● y = sin(x)        [显示] [删除]          │   │
│   │  ● y = 0.5*x²        [显示] [删除]          │   │
│   └─────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

### 移动端适配
- 函数输入面板改为底部抽屉
- 探测点改为触摸拖动
- 双指缩放

---

## 技术实现方案

### 1. Canvas 渲染

```javascript
// 坐标系参数
const view = reactive({
  offsetX: 0,      // 画布中心 x 偏移
  offsetY: 0,      // 画布中心 y 偏移
  scale: 50,       // 像素/单位
})

// 坐标转换
function worldToScreen(x, y) {
  const cx = canvas.width / 2 + view.offsetX
  const cy = canvas.height / 2 + view.offsetY
  return [cx + x * view.scale, cy - y * view.scale]
}

function screenToWorld(sx, sy) {
  const cx = canvas.width / 2 + view.offsetX
  const cy = canvas.height / 2 + view.offsetY
  return [(sx - cx) / view.scale, (cy - sy) / view.scale]
}
```

### 2. 函数解析（使用 math.js）

```javascript
import { create, all } from 'mathjs'
const math = create(all)

function evaluateFunction(expr, x) {
  try {
    return math.evaluate(expr, { x })
  } catch {
    return NaN
  }
}
```

### 3. 绘制流程

```javascript
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  drawGrid()           // 绘制网格
  drawAxes()           // 绘制坐标轴
  functions.forEach(fn => drawFunction(fn))  // 绘制每个函数
  drawProbePoint()     // 绘制探测点
  drawTooltip()        // 绘制坐标提示
}
```

### 4. 交互事件

- `mousedown/touchstart` - 开始拖动探测点或画布
- `mousemove/touchmove` - 更新拖动位置
- `mouseup/touchend` - 结束拖动
- `wheel` - 缩放画布

---

## 依赖

- **math.js** - 数学表达式解析库（需要安装）
- 无其他新依赖

---

## 实现步骤

### Phase 1: 基础框架（约 1 小时）
1. 创建 `FunctionLab.vue` 页面骨架
2. 添加路由配置
3. 实现 Canvas 基础渲染（网格、坐标轴）

### Phase 2: 函数绘制（约 1 小时）
1. 集成 math.js
2. 实现函数图像绘制
3. 支持多函数叠加

### Phase 3: 交互功能（约 1 小时）
1. 实现探测点拖动
2. 实时坐标显示
3. 画布缩放和平移

### Phase 4: UI 完善（约 30 分钟）
1. 函数输入面板
2. 函数列表管理
3. 移动端适配

---

## 验证方式

1. **功能验证**
   - 输入 `y = sin(x)` 能正确绘制正弦曲线
   - 拖动探测点，坐标值实时更新
   - 缩放和平移功能正常

2. **视觉验证**
   - 浅色/深色主题下都能清晰显示
   - 坐标轴刻度正确
   - 函数图像平滑

3. **响应式验证**
   - 桌面端布局正常
   - 移动端触摸操作可用
