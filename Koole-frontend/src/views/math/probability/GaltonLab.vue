<template>
  <div class="galton-lab">
    <!-- 顶部悬浮区：标题胶囊 + 控制胶囊 并排置顶（移动端 display:contents 拆成顶/底） -->
    <div class="prob-top">
      <!-- 顶部胶囊：返回 + 概率实验标题 + 已投球数 -->
      <div class="prob-tabs">
        <button class="icon-btn" type="button" title="返回数学实验室" @click="router.push('/math-lab')">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
        </button>
        <span class="tabs-title">概率实验</span>
        <span class="tabs-stats">已投 <b>{{ totalDropped }}</b> 球</span>
      </div>

      <!-- 控制工具栏 -->
      <div class="top-bar">
        <!-- 钉板：落球控制 -->
        <div class="bar-controls">
          <button class="pill-btn" type="button" @click="dropMany(1)">放 1</button>
          <button class="pill-btn" type="button" @click="dropMany(10)">放 10</button>
          <button class="pill-btn" type="button" @click="dropMany(50)">放 50</button>
          <button
            class="pill-btn"
            :class="{ 'is-on': autoDrop }"
            type="button"
            :title="autoDrop ? '暂停自动落球' : '持续自动落球'"
            @click="autoDrop = !autoDrop"
          >{{ autoDrop ? '连发 · 开' : '连发 · 关' }}</button>
          <button class="pill-btn pill-danger" type="button" @click="clearAll">清空</button>

          <span class="bar-divider"></span>

          <label class="slider-wrap" title="钉子行数（越大曲线越接近正态）">
            <span>行数 {{ rows }}</span>
            <input type="range" :value="rows" @input="setRows(+$event.target.value)" min="4" max="14" step="1" />
          </label>

          <label class="slider-wrap" title="小球下落速度">
            <span>速度 {{ speed }}×</span>
            <input type="range" :value="speed" @input="speed = +$event.target.value" min="1" max="6" step="1" />
          </label>
        </div>

        <div class="help-wrap">
          <button class="help-toggle" type="button" :aria-expanded="helpOpen" @click="helpOpen = !helpOpen">使用介绍</button>
          <transition name="panel-pop">
            <div v-if="helpOpen" class="help-card">
              <button class="help-close" type="button" aria-label="关闭使用介绍" @click="helpOpen = false">×</button>
              <header class="help-head">
                <small>HOW IT WORKS</small>
                <strong>每个小球，都在掷硬币</strong>
              </header>

              <section>
                <h4>一次偏转，就是一次掷硬币</h4>
                <p>小球每次撞到一颗钉子，向左还是向右，概率各占 <code>1/2</code>——就像掷一次硬币，独立且公平。</p>
              </section>

                <section>
                  <h4>为什么堆成钟形</h4>
                  <p>走 <code>n</code> 行，就是 <code>n</code> 次独立的"掷硬币"。落入第 <code>k</code> 槽，意味着 <code>n</code> 次里有 <code>k</code> 次向右。</p>
                  <p>恰好 <code>k</code> 次向右的走法数等于组合数 <code>C(n,k)</code>，所以</p>
                  <code>P(第 k 槽) = C(n,k) / 2ⁿ</code>
                  <p>中间的组合数最大、两端最小——柱子就从中间高、两边低，堆出一条钟形曲线。</p>
                </section>

                <section>
                  <h4>频率逼近概率</h4>
                  <p>行数 <code>n</code> 固定时，投的球越多，每根柱子的相对高度越贴近理论值（图中橙色虚线）。</p>
                  <p>把行数调大，钟形越来越平滑——这就是<b>中心极限定理</b>的雏形：大量独立的小随机步叠加起来，会趋向正态分布。</p>
                </section>

                <section>
                  <h4>小提示</h4>
                  <p><b>点击画布</b>也可以直接放一球</p>
                  <p>行数 <code>n</code> 越大，钟越胖越平，最两端的极端槽越难进</p>
                  <p>连发一阵后对比<b>蓝色柱子</b>和<b>橙色虚线</b>，看频率怎么一点点追上来</p>
                </section>
            </div>
          </transition>
        </div>
      </div>
    </div>

    <!-- 全屏画布 -->
    <canvas ref="canvasRef" @pointerdown="onCanvasTap($event)"></canvas>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { theme } from '../../../stores/theme.js'

const router = useRouter()

// ============================================================
// 状态
// ============================================================
const helpOpen = ref(false)
const rows = ref(10)          // 钉子行数
const speed = ref(2)          // 下落速度倍率
const autoDrop = ref(false)   // 是否自动连发
const totalDropped = ref(0)   // 已投球总数（模板显示）

// 画布与动画
const canvasRef = ref(null)
let W = 800
let H = 600
let rafId = null
let lastTs = 0

// 模拟数据（高频变更，不走 Vue 响应式）
let balls = []            // 正在下落的小球
let counts = []           // 各槽计数（长度 = rows+1）
let autoTimer = 0         // 连发计时（秒）

// 几何常量
const PEG_R = 3.5         // 钉子半径
const BALL_R = 6          // 小球半径
let TOP_GAP = 64        // 顶部释放区（桌面需让开悬浮工具栏，resize 时按端调整）
const HIST_H = 150        // 底部直方图区高度
const GRAVITY = 620       // 下落加速度 px/s²
const AUTO_INTERVAL = 0.13 // 连发间隔（秒）

function setRows(n) {
  rows.value = n
  clearAll()
}

function clearAll() {
  balls = []
  counts = new Array(rows.value + 1).fill(0)
  totalDropped.value = 0
}

function dropBall() {
  balls.push({ x: W / 2, y: TOP_GAP - 10, col: 0, row: 0, targetX: W / 2, vy: 30 })
}

function dropMany(n) {
  for (let i = 0; i < n; i += 1) {
    dropBall()
  }
}

function onCanvasTap() {
  dropBall()
}

// ============================================================
// 几何辅助（行 r 有 r+1 颗钉子，col 表示"向右偏了几次"）
// ============================================================
function pegRowY(row, rowH) {
  return TOP_GAP + row * rowH
}

function pegX(row, col, cx, spacing) {
  return cx + (col - row / 2) * spacing
}

function slotX(col, cx, spacing) {
  return cx + (col - rows.value / 2) * spacing
}

/** 二项分布概率 P(X=k) = C(n,k) / 2^n */
function binomialProb(n, k) {
  if (k < 0 || k > n) return 0
  let c = 1
  for (let i = 1; i <= k; i += 1) {
    c = (c * (n - k + i)) / i
  }
  return c / 2 ** n
}

// ============================================================
// 物理更新
// ============================================================
function updatePhysics(dt) {
  // 连发：按间隔自动放球
  if (autoDrop.value) {
    autoTimer += dt
    while (autoTimer >= AUTO_INTERVAL / speed.value) {
      autoTimer -= AUTO_INTERVAL / speed.value
      dropBall()
    }
  }

  const rowH = rowSpacing()
  const spacing = pegSpacing()
  const cx = W / 2
  const histTop = H - HIST_H

  const nextBalls = []
  for (let i = 0; i < balls.length; i += 1) {
    const b = balls[i]
    // 下落
    b.vy += GRAVITY * dt
    b.y += b.vy * dt * speed.value
    b.x += (b.targetX - b.x) * 0.22 // 横向平滑滑向目标列

    if (b.row < rows.value) {
      // 撞到当前行钉子：先把球钳在该层钉子处（不跳层），再偏转进入下一行
      const targetY = pegRowY(b.row, rowH)
      if (b.y >= targetY) {
        b.y = targetY
        if (Math.random() < 0.5) b.col += 1 // 向右，否则保持（等价 50/50）
        b.row += 1
        b.targetX = pegX(b.row, b.col, cx, spacing)
        b.vy *= -0.3 // 小反弹：模拟碰钉弹开
      }
    } else if (b.y >= histTop + BALL_R) {
      // 到底部 → 落入槽位，计数
      b.col = Math.min(b.col, rows.value)
      counts[b.col] += 1
      totalDropped.value += 1
      continue // 移除该球
    }

    nextBalls.push(b)
  }
  balls = nextBalls
}

// ============================================================
// 绘制
// ============================================================
function draw() {
  drawGalton()
}

function drawGalton() {
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  const isDark = theme.value === 'dark'

  const bg = isDark ? '#14181f' : '#fafbfc'
  const textColor = isDark ? '#b8c2d0' : '#6b7a90'
  const pegColor = isDark ? '#3a4657' : '#c3ccd8'
  const ballColor = isDark ? '#8fc8ff' : '#477cdb'
  const histBg = isDark ? 'rgba(255,255,255,0.03)' : 'rgba(71,124,219,0.05)'
  const gridColor = isDark ? 'rgba(255,255,255,0.045)' : 'rgba(71,124,219,0.07)'

  // 背景
  ctx.clearRect(0, 0, W, H)
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, W, H)

  // 细网格
  ctx.strokeStyle = gridColor
  ctx.lineWidth = 1
  for (let gx = 0; gx < W; gx += 46) {
    ctx.beginPath()
    ctx.moveTo(gx + 0.5, 0)
    ctx.lineTo(gx + 0.5, H)
    ctx.stroke()
  }
  for (let gy = 0; gy < H; gy += 46) {
    ctx.beginPath()
    ctx.moveTo(0, gy + 0.5)
    ctx.lineTo(W, gy + 0.5)
    ctx.stroke()
  }

  const rowH = rowSpacing()
  const spacing = pegSpacing()
  const cx = W / 2
  const histTop = H - HIST_H

  // 直方图区域底色
  ctx.fillStyle = histBg
  ctx.fillRect(0, histTop, W, HIST_H)

  // ── 钉板：第 r 行 r+1 颗钉子 ──
  ctx.fillStyle = pegColor
  for (let r = 0; r < rows.value; r += 1) {
    const py = pegRowY(r, rowH)
    for (let c = 0; c <= r; c += 1) {
      ctx.beginPath()
      ctx.arc(pegX(r, c, cx, spacing), py, PEG_R, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  // ── 小球 ──
  ctx.fillStyle = ballColor
  for (const b of balls) {
    ctx.beginPath()
    ctx.arc(b.x, b.y, BALL_R, 0, Math.PI * 2)
    ctx.fill()
  }

  // ── 直方图：柱子 + 理论曲线 ──
  const n = rows.value
  const maxCount = Math.max(...counts, 1)
  const maxProb = binomialProb(n, Math.floor(n / 2))
  const barMaxH = HIST_H - 56
  const barBase = H - 14
  const barW = Math.max(4, spacing * 0.62)
  const th = { r: 0.72, g: 0.53, b: 0.1 } // 理论线橙色近似

  for (let k = 0; k <= n; k += 1) {
    const sx = slotX(k, cx, spacing)
    const h = (counts[k] / maxCount) * barMaxH
    // 柱子
    ctx.fillStyle = counts[k] === maxCount ? 'rgba(71,124,219,0.88)' : 'rgba(71,124,219,0.5)'
    ctx.fillRect(sx - barW / 2, barBase - h, barW, h)
    // 槽位编号
    ctx.fillStyle = textColor
    ctx.font = '10px ' + getMono()
    ctx.textAlign = 'center'
    ctx.fillText(String(k), sx, H - 3)
    // 计数文字（柱顶上方）
    if (counts[k] > 0) {
      ctx.fillStyle = isDark ? '#8a94a4' : '#9aa7b8'
      ctx.fillText(String(counts[k]), sx, barBase - h - 4)
    }
  }

  // 理论分布虚线：各槽位期望计数归一化后的形状
  ctx.strokeStyle = 'rgba(232,150,60,0.85)'
  ctx.setLineDash([5, 4])
  ctx.lineWidth = 1.6
  ctx.beginPath()
  for (let k = 0; k <= n; k += 1) {
    const sx = slotX(k, cx, spacing)
    const h = (binomialProb(n, k) / maxProb) * barMaxH
    if (k === 0) ctx.moveTo(sx, barBase - h)
    else ctx.lineTo(sx, barBase - h)
  }
  ctx.stroke()
  ctx.setLineDash([])

  // 直方图区标题
  ctx.fillStyle = textColor
  ctx.font = '11px ' + getMono()
  ctx.textAlign = 'left'
  ctx.fillText('落点分布 · n = ' + n, 14, histTop + 16)
  ctx.fillText('蓝柱 = 频数 · 橙虚线 = 理论', 14, histTop + 30)
}

function getMono() {
  return 'ui-monospace, "Cascadia Code", Consolas, monospace'
}

// ============================================================
// 画布尺寸与动画循环
// ============================================================
function rowSpacing() {
  const rowH = Math.max(8, (H - HIST_H - TOP_GAP) / Math.max(rows.value, 1))
  // 行数多时限制水平间距，避免最宽行溢出画布
  return Math.min(rowH * 1.05, (W - 48) / Math.max(rows.value, 1))
}

function pegSpacing() {
  return rowSpacing()
}

function resize() {
  const canvas = canvasRef.value
  if (!canvas) return
  const rect = canvas.getBoundingClientRect()
  W = Math.floor(rect.width)
  H = Math.floor(rect.height)
  // 桌面顶部悬浮胶囊占高约 48px，钉板释放区让开；移动端工具栏在底部，保持 64
  TOP_GAP = rect.width <= 900 ? 64 : 92
  const dpr = window.devicePixelRatio || 1
  canvas.width = W * dpr
  canvas.height = H * dpr
  const ctx = canvas.getContext('2d')
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
}

function animate(now) {
  const dt = Math.min(0.033, (now - lastTs) / 1000)
  lastTs = now
  updatePhysics(dt)
  draw()
  rafId = requestAnimationFrame(animate)
}

onMounted(() => {
  counts = new Array(rows.value + 1).fill(0)
  resize()
  window.addEventListener('resize', resize)
  lastTs = performance.now()
  rafId = requestAnimationFrame(animate)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', resize)
  if (rafId) cancelAnimationFrame(rafId)
})
</script>

<style scoped>
.galton-lab {
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: calc(100vh - var(--nav-height));
  margin: -32px 0;
  overflow: hidden;
  /* 数学学科色：覆盖全局物理红为数学蓝 */
  --primary: #477cdb;
  --primary-dark: #3a63a8;
  --primary-hover: #5f8fd6;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  background: #fafbfc;
}

:root[data-theme="dark"] .galton-lab {
  --primary: #6f9be8;
  --primary-dark: #477cdb;
  --primary-hover: #8fc8ff;
  background: #14181f;
}

.galton-lab canvas {
  position: absolute;
  inset: 0;
  display: block;
  width: 100%;
  height: 100%;
  cursor: pointer;
  touch-action: none;
}

/* ========== 顶部悬浮区：两个胶囊并排置顶 ========== */
.prob-top {
  position: absolute;
  top: 8px;
  left: 8px;
  right: 8px;
  z-index: 20;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  pointer-events: none; /* 胶囊之外的空白穿透到画布 */
}

.prob-tabs,
.top-bar {
  pointer-events: auto;
}

/* ========== 标题胶囊 ========== */
.prob-tabs {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 5px 10px;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(71, 124, 219, 0.14);
  border-radius: 999px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  user-select: none;
}

.tabs-title {
  font-size: 14px;
  font-weight: 800;
  color: #16243d;
  white-space: nowrap;
}

.tabs-stats {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: #8a97a8;
  white-space: nowrap;
}

.tabs-stats b {
  color: var(--primary);
  font-family: var(--mono);
  font-size: 12px;
}

/* ========== 控制工具栏（胶囊） ========== */
.top-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  padding: 5px 10px;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(71, 124, 219, 0.14);
  border-radius: 999px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  user-select: none;
}

.icon-btn {
  width: 30px;
  height: 30px;
  flex-shrink: 0;
  border: 1px solid color-mix(in srgb, var(--primary) 30%, var(--border, #dee2e6));
  border-radius: 8px;
  background: #fff;
  color: var(--primary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
}

.icon-btn:hover {
  background: color-mix(in srgb, var(--primary) 10%, #fff);
}

.bar-controls {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.pill-btn {
  padding: 5px 11px;
  border: 1.5px solid color-mix(in srgb, var(--primary) 34%, var(--border, #dee2e6));
  border-radius: 999px;
  background: #fff;
  color: var(--primary);
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s;
  white-space: nowrap;
}

.pill-btn:hover {
  border-color: var(--primary);
  background: color-mix(in srgb, var(--primary) 8%, #fff);
}

.pill-btn.is-on {
  border-color: var(--primary);
  background: var(--primary);
  color: #fff;
  box-shadow: 0 3px 10px color-mix(in srgb, var(--primary) 34%, transparent);
}

.pill-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.pill-btn.pill-danger {
  border-color: rgba(231, 76, 60, 0.55);
  color: #e74c3c;
}

.pill-btn.pill-danger:hover {
  background: #e74c3c;
  color: #fff;
}

.bar-divider {
  width: 1px;
  height: 16px;
  background: color-mix(in srgb, var(--border, #e9ecef) 80%, transparent);
  flex-shrink: 0;
}

.slider-wrap {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #5a6b82;
  white-space: nowrap;
}

.slider-wrap span {
  font-weight: 600;
  min-width: 58px;
  text-align: right;
}

.slider-wrap input[type="range"] {
  width: 78px;
  height: 4px;
  accent-color: var(--primary);
  cursor: pointer;
}

/* ========== 使用介绍 ========== */
.help-wrap {
  position: relative;
  margin-left: auto;
}

.help-toggle {
  padding: 5px 12px;
  border: 1.5px solid color-mix(in srgb, var(--primary) 40%, var(--border, #dee2e6));
  border-radius: 999px;
  background: #fff;
  color: var(--primary);
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s;
  white-space: nowrap;
}

.help-toggle:hover {
  border-color: var(--primary);
  background: color-mix(in srgb, var(--primary) 8%, #fff);
}

.help-card {
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  width: min(360px, calc(100vw - 24px));
  max-height: 64vh;
  overflow-y: auto;
  padding: 18px 20px;
  background: #fff;
  border: 1px solid color-mix(in srgb, var(--primary) 26%, var(--border, #e8e8e8));
  border-radius: 14px;
  box-shadow: 0 18px 48px rgba(20, 36, 68, 0.16);
  z-index: 30;
  animation: card-in 0.18s ease-out;
}

@keyframes card-in {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.help-close {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 26px;
  height: 26px;
  border: none;
  border-radius: 50%;
  background: color-mix(in srgb, var(--primary) 8%, #fff);
  color: var(--primary);
  font-size: 16px;
  line-height: 1;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
}

.help-close:hover {
  background: #fef0f0;
  color: #e74c3c;
}

.help-head {
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin-bottom: 14px;
  padding-bottom: 12px;
  border-bottom: 1px solid color-mix(in srgb, var(--primary) 18%, var(--border, #f0f0f0));
}

.help-head small {
  font-family: var(--mono);
  font-size: 9px;
  letter-spacing: 0.14em;
  color: var(--primary);
  font-weight: 700;
}

.help-head strong {
  font-size: 16px;
  font-weight: 800;
  color: #16243d;
}

.help-card section {
  margin-bottom: 14px;
}

.help-card section:last-child {
  margin-bottom: 0;
}

.help-card h4 {
  margin: 0 0 6px;
  font-size: 13px;
  font-weight: 700;
  color: #2c3e50;
}

.help-card p {
  margin: 6px 0;
  font-size: 12.5px;
  line-height: 1.7;
  color: #5a6b82;
}

.help-card p b {
  color: #2c3e50;
}

.help-card code {
  display: block;
  margin: 6px 0;
  padding: 6px 10px;
  border-radius: 6px;
  background: color-mix(in srgb, var(--primary) 7%, #fff);
  border-left: 3px solid var(--primary);
  font-family: var(--mono);
  font-size: 12px;
  color: var(--primary);
  white-space: pre-wrap;
}

/* ========== 深色主题 ========== */
:root[data-theme="dark"] .prob-tabs,
:root[data-theme="dark"] .top-bar {
  background: rgba(24, 30, 42, 0.88);
  border-color: rgba(148, 185, 255, 0.14);
}

:root[data-theme="dark"] .icon-btn,
:root[data-theme="dark"] .pill-btn,
:root[data-theme="dark"] .help-toggle {
  background: #262b33;
  border-color: rgba(140, 180, 255, 0.24);
  color: #8fc8ff;
}

:root[data-theme="dark"] .icon-btn:hover,
:root[data-theme="dark"] .pill-btn:hover,
:root[data-theme="dark"] .help-toggle:hover {
  background: rgba(111, 155, 232, 0.16);
}

:root[data-theme="dark"] .pill-btn.is-on {
  background: #6f9be8;
  border-color: #6f9be8;
  color: #0c1a2e;
}

:root[data-theme="dark"] .pill-btn.pill-danger {
  color: #ff8f84;
  border-color: rgba(255, 120, 110, 0.4);
}

:root[data-theme="dark"] .pill-btn.pill-danger:hover {
  background: #e74c3c;
  color: #fff;
}

:root[data-theme="dark"] .tabs-title {
  color: #f4f7ff;
}

:root[data-theme="dark"] .tabs-stats {
  color: #8a94a4;
}

:root[data-theme="dark"] .slider-wrap {
  color: #aab6c6;
}

:root[data-theme="dark"] .help-card {
  background: #1d232c;
  border-color: rgba(140, 180, 255, 0.16);
  box-shadow: 0 18px 48px rgba(0, 0, 0, 0.5);
}

:root[data-theme="dark"] .help-head strong {
  color: #f4f7ff;
}

:root[data-theme="dark"] .help-card h4 {
  color: #dbe4f0;
}

:root[data-theme="dark"] .help-card p {
  color: #aab6c6;
}

:root[data-theme="dark"] .help-card p b {
  color: #e0e7f2;
}

:root[data-theme="dark"] .help-card code {
  background: rgba(111, 155, 232, 0.1);
  color: #8fc8ff;
}

/* ========== 移动端：标题固定顶部、画布中间、工具栏固定底部 ========== */
@media (max-width: 900px) {
  /* 悬浮容器拆散：prob-tabs / canvas / top-bar 各自成为 galton-lab 的 flex 子项 */
  .prob-top {
    display: contents;
  }

  /* 画布中间撑开，工具栏贴底（flex order 重排，覆盖桌面 absolute） */
  .galton-lab canvas {
    order: 1;
    position: relative;
    flex: 1 1 0;
    width: 100%;
    height: 0;
  }

  /* 标题胶囊回到顶部通栏 */
  .prob-tabs {
    position: static;
    top: auto;
    left: auto;
    right: auto;
    order: 0;
    border-radius: 0;
    border-left: none;
    border-right: none;
    border-top: none;
    box-shadow: none;
    padding: 8px 10px;
    gap: 8px;
    border-bottom: 1px solid rgba(71, 124, 219, 0.14);
  }

  /* 工具栏贴底 */
  .top-bar {
    position: static;
    top: auto;
    left: auto;
    right: auto;
    order: 2;
    flex-wrap: wrap;
    gap: 8px;
    padding: 8px 10px calc(8px + env(safe-area-inset-bottom));
    border-radius: 0;
    border-left: none;
    border-right: none;
    border-top: 1px solid rgba(71, 124, 219, 0.14);
    box-shadow: 0 -6px 24px rgba(20, 36, 68, 0.08);
  }

  /* 帮助按钮独占一行并靠右 */
  .help-wrap {
    flex-basis: 100%;
    display: flex;
    justify-content: flex-end;
    margin-left: 0;
    margin-top: 2px;
  }

  .bar-controls {
    gap: 6px;
  }

  .slider-wrap input[type="range"] {
    width: 72px;
  }

  /* 帮助卡片从底部工具栏向上弹出 */
  .help-card {
    top: auto;
    bottom: calc(100% + 10px);
  }
}
</style>
