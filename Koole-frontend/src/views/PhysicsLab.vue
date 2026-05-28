<template>
    <div class="physics-lab-page">
        <!-- 左侧模型列表 -->
        <aside class="lab-sidebar">
            <div class="sidebar-header">
                <div class="sidebar-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                    </svg>
                </div>
                <span>物理模型</span>
            </div>
            <nav class="model-list">
                <button
                    v-for="m in models"
                    :key="m.id"
                    class="model-item"
                    :class="{ active: activeModel?.id === m.id }"
                    @click="selectModel(m)"
                >
                    <span class="model-icon" v-html="m.icon"></span>
                    <div class="model-info">
                        <span class="model-name">{{ m.name }}</span>
                        <span class="model-desc">{{ m.desc }}</span>
                    </div>
                </button>
            </nav>
        </aside>

        <!-- 中间画布 -->
        <main class="lab-canvas-area">
            <div class="canvas-toolbar">
                <span class="canvas-title">{{ activeModel ? activeModel.name : '选择一个物理模型' }}</span>
                <div class="canvas-actions" v-if="activeModel">
                    <button class="toolbar-btn" @click="toggleSimulation">
                        <svg v-if="!running" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                        <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
                        {{ running ? '暂停' : '开始' }}
                    </button>
                    <button class="toolbar-btn" @click="resetSimulation">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
                        重置
                    </button>
                    <button class="toolbar-btn" :class="{ active: followTarget }" @click="followTarget = !followTarget">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 2v4"/><path d="M12 18v4"/><path d="M2 12h4"/><path d="M18 12h4"/></svg>
                        追踪
                    </button>
                    <button class="toolbar-btn" @click="resetCamera">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="1 4 1 10 7 10"/><polyline points="23 20 23 14 17 14"/><path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"/></svg>
                        视角
                    </button>
                </div>
            </div>
            <div class="canvas-wrapper" ref="canvasWrapperRef">
                <canvas
                    ref="canvasRef"
                    @mousedown="onMouseDown"
                    @mousemove="onMouseMove"
                    @mouseup="onMouseUp"
                    @mouseleave="onMouseUp"
                ></canvas>
                <div class="canvas-placeholder" v-if="!activeModel">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                    </svg>
                    <p>从左侧选择一个物理模型开始模拟</p>
                </div>
            </div>
        </main>

        <!-- 右侧参数面板 -->
        <aside class="lab-properties" v-if="activeModel">
            <div class="properties-header">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
                <span>参数设置</span>
            </div>
            <div class="properties-body">
                <div v-for="param in activeModel.params" :key="param.key" class="param-group">
                    <label class="param-label">
                        <span>{{ param.label }}</span>
                        <span class="param-value">{{ displayParamValue(param) }}</span>
                    </label>
                    <input
                        type="range"
                        class="param-slider"
                        :min="param.min"
                        :max="param.max"
                        :step="param.step || 1"
                        :value="param.value"
                        @input="updateParam(param.key, parseFloat($event.target.value))"
                    />
                </div>
            </div>
        </aside>
    </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch, nextTick } from "vue"
import { PHYSICS_MODELS, DRAW_SCALE } from "../constants/physicsModels.js"

// ── 状态 ──
const canvasRef = ref(null)
const canvasWrapperRef = ref(null)
const models = PHYSICS_MODELS
const activeModel = ref(null)
const running = ref(false)
const followTarget = ref(true)

let animationId = null
let simTime = 0

// 物理状态：向下为正方向
// - fallDist: 从起始位置下落的距离 (m)，起始为 0，触底时等于 height
// - fallVel:  下落速度 (m/s)，起始为 0，重力驱动持续增大
const fallDist = ref(0)
const fallVel = ref(0)

// 运动轨迹历史（世界坐标 {x, y}），逐帧记录用于绘制下落曲线
let trail = []
const MAX_TRAIL = 500

// ── 相机 ──
const cameraX = ref(0)
const cameraY = ref(0)
let isDragging = false
let dragStartX = 0, dragStartY = 0
let dragCamX = 0, dragCamY = 0

// ── 模型选择 ──
const selectModel = (model) => {
    activeModel.value = {
        ...model,
        params: model.params.map(p => ({ ...p })),
    }
    running.value = false
    if (animationId) cancelAnimationFrame(animationId)
    simTime = 0
    followTarget.value = true
    initState()
    centerCameraOnBall()
}

const getParams = () => {
    if (!activeModel.value) return {}
    const obj = {}
    activeModel.value.params.forEach(p => { obj[p.key] = p.value })
    return obj
}

const initState = () => {
    const p = getParams()
    fallDist.value = 0
    fallVel.value = 0
    trail = []
}

const updateParam = (key, val) => {
    const param = activeModel.value.params.find(p => p.key === key)
    if (!param) return
    param.value = val
    if (!running.value) {
        simTime = 0
        initState()
        centerCameraOnBall()
        draw()
    }
}

const displayParamValue = (param) => {
    const v = param.value
    return Number.isInteger(v) ? v : v.toFixed(1)
}

// ── 物理步进 ──
const step = (dt) => {
    const p = getParams()
    const h = p.height
    fallVel.value += p.gravity * dt
    fallDist.value += fallVel.value * dt
    if (fallDist.value >= h) {
        fallDist.value = h
        fallVel.value = 0
    }
    // 每帧记录轨迹点
    trail.push({ x: 0, y: p.height - fallDist.value })
    if (trail.length > MAX_TRAIL) trail.splice(0, trail.length - MAX_TRAIL)
}

// ── 控制 ──
const toggleSimulation = () => {
    if (running.value) {
        running.value = false
        if (animationId) cancelAnimationFrame(animationId)
    } else {
        if (fallDist.value >= getParams().height) {
            simTime = 0
            initState()
        }
        lastTime = 0
        running.value = true
        animationId = requestAnimationFrame(loop)
    }
}

const resetSimulation = () => {
    running.value = false
    if (animationId) cancelAnimationFrame(animationId)
    simTime = 0
    initState()
    followTarget.value = true
    centerCameraOnBall()
    draw()
}

let lastTime = 0

const loop = (timestamp) => {
    if (!running.value) return
    if (!lastTime) lastTime = timestamp
    const dt = Math.min((timestamp - lastTime) / 1000, 0.05)
    lastTime = timestamp

    simTime += dt
    step(dt)

    if (followTarget.value) centerCameraOnBall()

    draw()
    animationId = requestAnimationFrame(loop)
}

// ── 相机 ──
// 将小球锁定在画布上方约 1/3 处，露出下方空间观察下落轨迹
const centerCameraOnBall = () => {
    const canvas = canvasRef.value
    if (!canvas) return
    const dpr = window.devicePixelRatio || 1
    const ch = canvas.height / dpr          // CSS 像素高
    const p = getParams()
    const worldY = p.height - fallDist.value
    cameraX.value = 0
    // 公式: ballScreenY = ch - 40 - wy * DRAW_SCALE + cameraY
    // 令 ballScreenY = ch * 0.33 (顶部1/3) → cameraY = wy * DRAW_SCALE + 40 - ch * 0.67
    cameraY.value = worldY * DRAW_SCALE + 40 - ch * 0.67
}

const resetCamera = () => {
    followTarget.value = true
    centerCameraOnBall()
    draw()
}

const onMouseDown = (e) => {
    isDragging = true
    followTarget.value = false
    dragStartX = e.clientX
    dragStartY = e.clientY
    dragCamX = cameraX.value
    dragCamY = cameraY.value
    if (canvasRef.value) canvasRef.value.style.cursor = "grabbing"
}

const onMouseMove = (e) => {
    if (!isDragging) return
    cameraX.value = dragCamX + (e.clientX - dragStartX)
    cameraY.value = dragCamY + (e.clientY - dragStartY)
    draw()
}

const onMouseUp = () => {
    isDragging = false
    if (canvasRef.value) canvasRef.value.style.cursor = "grab"
}

// ── 渲染 ──
// 世界坐标 → 屏幕 CSS 像素坐标
const worldToScreen = (wx, wy) => {
    const canvas = canvasRef.value
    if (!canvas) return { x: 0, y: 0 }
    const dpr = window.devicePixelRatio || 1
    const cw = canvas.width / dpr    // CSS 像素宽
    const ch = canvas.height / dpr   // CSS 像素高
    return {
        x: cw / 2 + wx * DRAW_SCALE + cameraX.value,
        y: ch - 40 - wy * DRAW_SCALE + cameraY.value,
    }
}

const draw = () => {
    const canvas = canvasRef.value
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    const W = canvas.width
    const H = canvas.height
    const p = getParams()
    const dpr = window.devicePixelRatio || 1

    ctx.save()
    ctx.scale(dpr, dpr)

    const cw = W / dpr
    const ch = H / dpr

    // 清空
    ctx.clearRect(0, 0, cw, ch)

    // 背景
    ctx.fillStyle = "#f8f9fa"
    ctx.fillRect(0, 0, cw, ch)

    // 网格
    ctx.strokeStyle = "#e8e8e8"
    ctx.lineWidth = 0.5
    const startGX = Math.floor((-cw / 2 - cameraX.value) / DRAW_SCALE) * DRAW_SCALE
    const endGX = Math.ceil((cw / 2 - cameraX.value) / DRAW_SCALE) * DRAW_SCALE
    const startGY = Math.floor((-ch + 40 - cameraY.value) / DRAW_SCALE) * DRAW_SCALE
    const endGY = Math.ceil((40 - cameraY.value) / DRAW_SCALE) * DRAW_SCALE
    for (let wx = startGX; wx <= endGX; wx += DRAW_SCALE) {
        const sx = cw / 2 + wx * DRAW_SCALE + cameraX.value
        ctx.beginPath(); ctx.moveTo(sx, 0); ctx.lineTo(sx, ch); ctx.stroke()
    }
    for (let wy = startGY; wy <= endGY; wy += DRAW_SCALE) {
        const sy = ch - 40 - wy * DRAW_SCALE + cameraY.value
        ctx.beginPath(); ctx.moveTo(0, sy); ctx.lineTo(cw, sy); ctx.stroke()
    }

    if (!activeModel.value) { ctx.restore(); return }

    // ── 运动轨迹 ──
    // 从旧到新逐段绘制，透明度渐变
    for (let i = 1; i < trail.length; i++) {
        const p1 = worldToScreen(trail[i - 1].x, trail[i - 1].y)
        const p2 = worldToScreen(trail[i].x, trail[i].y)
        const alpha = 0.08 + 0.35 * (i / trail.length)
        ctx.beginPath()
        ctx.moveTo(p1.x, p1.y)
        ctx.lineTo(p2.x, p2.y)
        ctx.strokeStyle = `rgba(231, 76, 60, ${alpha})`
        ctx.lineWidth = 2.5
        ctx.stroke()
    }

    // 地面
    const groundScreenY = ch - 40 + cameraY.value
    ctx.fillStyle = "#2c3e50"
    ctx.fillRect(0, groundScreenY, cw, ch - groundScreenY)
    ctx.fillStyle = "#34495e"
    ctx.fillRect(0, groundScreenY, cw, 2)

    // 球
    const ballWorldY = p.height - fallDist.value
    const pos = worldToScreen(0, ballWorldY)
    const radius = 12

    ctx.beginPath()
    ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2)
    ctx.fillStyle = "#e74c3c"
    ctx.fill()
    ctx.strokeStyle = "rgba(0,0,0,0.2)"
    ctx.lineWidth = 1.5
    ctx.stroke()

    // 起始位置虚线标记
    const startPos = worldToScreen(0, p.height)
    ctx.strokeStyle = "rgba(0,0,0,0.15)"
    ctx.lineWidth = 1
    ctx.setLineDash([4, 4])
    ctx.beginPath()
    ctx.moveTo(pos.x - 30, startPos.y)
    ctx.lineTo(pos.x + 30, startPos.y)
    ctx.stroke()
    ctx.setLineDash([])

    // 信息
    ctx.fillStyle = "#333"
    ctx.font = "14px sans-serif"
    ctx.fillText(`下落高度: ${fallDist.value.toFixed(1)} m`, 16, 28)
    ctx.fillText(`速度: ${fallVel.value.toFixed(1)} m/s`, 16, 50)
    ctx.fillText(`时间: ${simTime.toFixed(2)} s`, 16, 72)
    ctx.fillText(`重力: ${p.gravity} m/s²`, 16, 94)

    ctx.restore()
}

// ── Canvas 自适应 ──
const resizeCanvas = () => {
    const wrapper = canvasWrapperRef.value
    const canvas = canvasRef.value
    if (!wrapper || !canvas) return
    const rect = wrapper.getBoundingClientRect()
    const dpr = window.devicePixelRatio || 1
    const w = Math.floor(rect.width)
    const h = Math.floor(rect.height)
    canvas.width = w * dpr
    canvas.height = h * dpr
    canvas.style.width = w + "px"
    canvas.style.height = h + "px"
    draw()
}

// ── 生命周期 ──
onMounted(async () => {
    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)
    await nextTick()
    draw()
})

onBeforeUnmount(() => {
    if (animationId) cancelAnimationFrame(animationId)
    window.removeEventListener("resize", resizeCanvas)
})

watch(() => activeModel.value?.id, async () => {
    await nextTick()
    resizeCanvas()
    centerCameraOnBall()
    draw()
})
</script>

<style scoped>
.physics-lab-page {
    display: flex;
    height: calc(100vh - var(--nav-height) - 32px);
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 16px;
    gap: 16px;
}

/* ── 左侧边栏 ── */
.lab-sidebar {
    width: 240px;
    flex-shrink: 0;
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

.sidebar-header {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 16px 18px;
    border-bottom: 1px solid var(--border);
    font-size: 14px;
    font-weight: 700;
    color: var(--text-dark);
    flex-shrink: 0;
}

.sidebar-icon {
    display: flex;
    align-items: center;
    color: var(--primary);
}

.model-list {
    flex: 1;
    overflow-y: auto;
    padding: 8px;
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.model-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 12px;
    border: none;
    border-radius: var(--radius);
    background: transparent;
    color: var(--text-secondary);
    cursor: pointer;
    transition: var(--transition);
    text-align: left;
    width: 100%;
}

.model-item:hover {
    background: var(--bg-card-hover);
    color: var(--text);
}

.model-item.active {
    background: linear-gradient(90deg, var(--primary-light) 0%, transparent 100%);
    color: var(--primary);
    border-left: 3px solid var(--primary);
    padding-left: 9px;
}

.model-icon {
    display: flex;
    align-items: center;
    flex-shrink: 0;
    width: 24px;
    justify-content: center;
}

.model-info {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
}

.model-name {
    font-size: 13px;
    font-weight: 600;
}

.model-desc {
    font-size: 11px;
    color: var(--text-muted);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.model-item.active .model-desc {
    color: var(--primary);
}

/* ── 中间画布 ── */
.lab-canvas-area {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-width: 0;
}

.canvas-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 18px;
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg) var(--radius-lg) 0 0;
    border-bottom: none;
    flex-shrink: 0;
}

.canvas-title {
    font-size: 15px;
    font-weight: 700;
    color: var(--text-dark);
}

.canvas-actions {
    display: flex;
    gap: 8px;
}

.toolbar-btn {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 6px 14px;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    background: var(--bg-card);
    color: var(--text-secondary);
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: var(--transition);
}

.toolbar-btn:hover {
    border-color: var(--primary);
    color: var(--primary);
    background: var(--primary-light);
}

.toolbar-btn.active {
    border-color: var(--primary);
    color: #fff;
    background: var(--primary-gradient);
}

.canvas-wrapper {
    flex: 1;
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 0 0 var(--radius-lg) var(--radius-lg);
    overflow: hidden;
    position: relative;
    min-height: 400px;
}

.canvas-wrapper canvas {
    display: block;
    width: 100%;
    height: 100%;
    cursor: grab;
}

.canvas-wrapper canvas:active {
    cursor: grabbing;
}

.canvas-placeholder {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: var(--text-muted);
    gap: 12px;
    pointer-events: none;
}

.canvas-placeholder svg {
    opacity: 0.3;
}

.canvas-placeholder p {
    font-size: 14px;
}

/* ── 右侧属性面板 ── */
.lab-properties {
    width: 260px;
    flex-shrink: 0;
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

.properties-header {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 16px 18px;
    border-bottom: 1px solid var(--border);
    font-size: 14px;
    font-weight: 700;
    color: var(--text-dark);
    flex-shrink: 0;
}

.properties-body {
    flex: 1;
    overflow-y: auto;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 18px;
}

.param-group {
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.param-label {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 13px;
    font-weight: 600;
    color: var(--text-secondary);
}

.param-value {
    font-size: 13px;
    font-weight: 700;
    color: var(--primary);
    font-family: var(--mono);
}

.param-slider {
    width: 100%;
    height: 4px;
    -webkit-appearance: none;
    appearance: none;
    background: var(--border);
    border-radius: 2px;
    outline: none;
    cursor: pointer;
}

.param-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: var(--primary);
    cursor: pointer;
    border: 2px solid #fff;
    box-shadow: 0 1px 4px rgba(0,0,0,0.2);
}

/* ── 响应式 ── */
@media (max-width: 1100px) {
    .lab-properties { display: none; }
}

@media (max-width: 768px) {
    .lab-sidebar { display: none; }
    .physics-lab-page { padding: 0 8px; }
}
</style>
