<template>
    <div class="classic-lab-page">
        <!-- 左侧模型列表 -->
        <aside class="lab-sidebar">
            <div class="sidebar-header">
                <button class="back-btn" @click="$router.push('/physics-lab')">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
                    返回
                </button>
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

        <!-- 画布 + 底部参数 -->
        <main class="lab-main">
            <!-- 工具栏 -->
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
                    <button
                        v-if="recordedTrails.length > 0"
                        class="toolbar-btn"
                        @click="clearRecords"
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                        清空记录
                    </button>
                </div>
            </div>

            <!-- 画布 -->
            <div class="canvas-area" ref="canvasAreaRef">
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

            <!-- 底部参数面板 -->
            <div class="params-bar" v-if="activeModel">
                <div class="params-bar-header">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
                    <span>参数调节</span>
                </div>
                <div class="params-bar-inner">
                    <div v-for="param in activeModel.params" :key="param.key" class="param-item">
                        <label class="param-item-label">
                            <span>{{ param.label }}</span>
                            <span class="param-item-value">{{ displayParamValue(param) }}</span>
                        </label>
                        <template v-if="param.options">
                            <select
                                class="param-item-select"
                                :value="param.value"
                                @change="updateParam(param.key, parseFloat($event.target.value))"
                            >
                                <option
                                    v-for="opt in param.options"
                                    :key="opt.value"
                                    :value="opt.value"
                                >{{ opt.label }}</option>
                            </select>
                        </template>
                        <input
                            v-else
                            type="range"
                            class="param-item-slider"
                            :min="param.min"
                            :max="param.max"
                            :step="param.step || 1"
                            :value="param.value"
                            @input="updateParam(param.key, parseFloat($event.target.value))"
                        />
                    </div>
                </div>

                <!-- 对比记录 -->
                <div class="params-compare" v-if="recordedTrails.length > 0">
                    <div class="params-compare-header">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
                        <span>对比记录（{{ recordedTrails.length }}条）</span>
                        <button class="compare-clear" @click="clearRecords">清空</button>
                    </div>
                    <div class="params-compare-list">
                        <label
                            v-for="(rec, i) in recordedTrails"
                            :key="i"
                            class="compare-item"
                            :class="{ checked: rec.visible }"
                        >
                            <input
                                type="checkbox"
                                :checked="rec.visible"
                                @change="toggleTrailVisibility(i)"
                            />
                            <span class="compare-dot" :style="{ background: rec.color }"></span>
                            <span class="compare-label">{{ rec.paramLabel }}</span>
                        </label>
                    </div>
                </div>
            </div>
        </main>
    </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch, nextTick } from "vue"
import { PHYSICS_MODELS, DRAW_SCALE, GROUND_Y } from "../constants/physicsModels.js"

// ── 状态 ──
const canvasRef = ref(null)
const canvasAreaRef = ref(null)
const models = PHYSICS_MODELS
const activeModel = ref(null)
const running = ref(false)
const followTarget = ref(true)

// ── 录播对比 ──
const recordedTrails = ref([])
const TRAIL_COLORS = ['#3498db', '#2ecc71', '#e67e22', '#9b59b6', '#1abc9c', '#f39c12', '#e91e63', '#00bcd4']
let trailColorIdx = 0

// 生成简短参数标签
const makeParamLabel = (params, model) => {
    if (!model) return ""
    return model.params.map(p => {
        const v = params[p.key]
        return `${p.key}=${Number.isInteger(v) ? v : v.toFixed(1)}`
    }).join(", ")
}

let animationId = null
let simTime = 0
let state = null

const MAX_TRAIL = 800

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
    recordedTrails.value = []
    trailColorIdx = 0
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
    state = activeModel.value.createState(p)
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
    if (param.options) {
        const opt = param.options.find(o => o.value === param.value)
        return opt ? opt.label : param.value
    }
    const v = param.value
    return Number.isInteger(v) ? v : v.toFixed(1)
}

// ── 物理步进 ──
const step = (dt) => {
    if (!state || !activeModel.value) return
    const p = getParams()
    activeModel.value.step(state, p, dt)
    // 记录轨迹
    const trailPos = activeModel.value.getTrailPosition(state, p)
    if (trailPos) {
        state.trail.push({ ...trailPos })
        if (state.trail.length > MAX_TRAIL) state.trail.splice(0, state.trail.length - MAX_TRAIL)
    }
}

// ── 控制 ──
const toggleSimulation = () => {
    if (!activeModel.value) return
    if (running.value) {
        running.value = false
        if (animationId) cancelAnimationFrame(animationId)
    } else {
        const p = getParams()
        if (activeModel.value.isFinished(state, p)) {
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

// ── 录播 ──
const recordCurrentTrail = () => {
    if (!state || !activeModel.value || recordedTrails.value.length >= 8) return
    const p = getParams()
    const color = TRAIL_COLORS[trailColorIdx % TRAIL_COLORS.length]
    trailColorIdx++
    // 支持多物体轨迹录制（如两球碰撞模型的 trail2）
    const extraTrails = {}
    if (state.trail2 && state.trail2.length > 0) {
      extraTrails.trail2 = state.trail2.map(pt => ({ ...pt }))
    }
    if (state.trailB && state.trailB.length > 0) {
      extraTrails.trailB = state.trailB.map(pt => ({ ...pt }))
    }
    recordedTrails.value.push({
        trail: state.trail.map(pt => ({ ...pt })),
        ...extraTrails,
        color,
        paramLabel: makeParamLabel(p, activeModel.value),
        infoLines: activeModel.value.getInfoLines(state, p, simTime),
        visible: true,
    })
}

const clearRecords = () => {
    recordedTrails.value = []
    trailColorIdx = 0
    draw()
}

const toggleTrailVisibility = (index) => {
    const rec = recordedTrails.value[index]
    if (!rec) return
    rec.visible = !rec.visible
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
    // 到达终点状态时自动停止并录制
    if (activeModel.value.isFinished(state, getParams())) {
        running.value = false
        animationId = null
        recordCurrentTrail()
        draw()
        return
    }
    if (followTarget.value) centerCameraOnBall()
    draw()
    animationId = requestAnimationFrame(loop)
}

// ── 相机 ──
const centerCameraOnBall = () => {
    const canvas = canvasRef.value
    if (!canvas || !state) return
    const dpr = window.devicePixelRatio || 1
    const cw = canvas.width / dpr
    const ch = canvas.height / dpr
    const p = getParams()
    const pos = activeModel.value.getBallPosition(state, p)
    cameraX.value = -pos.x * DRAW_SCALE
    cameraY.value = pos.y * DRAW_SCALE + 40 - ch * 0.67
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
const worldToScreen = (wx, wy) => {
    const canvas = canvasRef.value
    if (!canvas) return { x: 0, y: 0 }
    const dpr = window.devicePixelRatio || 1
    const cw = canvas.width / dpr
    const ch = canvas.height / dpr
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

    if (!activeModel.value || !state) { ctx.restore(); return }

    const model = activeModel.value
    const p = getParams()

    // 地面
    const groundScreenY = ch - 40 + cameraY.value
    ctx.fillStyle = "#2c3e50"
    ctx.fillRect(0, groundScreenY, cw, ch - groundScreenY)
    ctx.fillStyle = "#34495e"
    ctx.fillRect(0, groundScreenY, cw, 2)

    // 模型额外绘制
    if (model.drawExtra) {
        model.drawExtra(ctx, state, p, worldToScreen)
    }

    // ── 录播轨迹叠加（仅显示勾选的）──
    recordedTrails.value.forEach(rec => {
        if (!rec.visible || rec.trail.length < 2) return
        ctx.globalAlpha = 0.75
        // 主轨迹（球1 / 滑块）
        for (let i = 1; i < rec.trail.length; i++) {
            const p1 = worldToScreen(rec.trail[i - 1].x, rec.trail[i - 1].y)
            const p2 = worldToScreen(rec.trail[i].x, rec.trail[i].y)
            ctx.beginPath()
            ctx.moveTo(p1.x, p1.y)
            ctx.lineTo(p2.x, p2.y)
            ctx.strokeStyle = rec.color
            ctx.lineWidth = 2.5
            ctx.stroke()
        }
        // 额外轨迹（两球碰撞的球2）
        if (rec.trail2) {
            ctx.globalAlpha = 0.45
            for (let i = 1; i < rec.trail2.length; i++) {
                const p1 = worldToScreen(rec.trail2[i - 1].x, rec.trail2[i - 1].y)
                const p2 = worldToScreen(rec.trail2[i].x, rec.trail2[i].y)
                ctx.beginPath()
                ctx.moveTo(p1.x, p1.y)
                ctx.lineTo(p2.x, p2.y)
                ctx.strokeStyle = rec.color
                ctx.lineWidth = 2
                ctx.setLineDash([4, 4])
                ctx.stroke()
                ctx.setLineDash([])
            }
        }
        // 额外轨迹（板块模型的木板）
        if (rec.trailB) {
            ctx.globalAlpha = 0.45
            for (let i = 1; i < rec.trailB.length; i++) {
                const p1 = worldToScreen(rec.trailB[i - 1].x, rec.trailB[i - 1].y)
                const p2 = worldToScreen(rec.trailB[i].x, rec.trailB[i].y)
                ctx.beginPath()
                ctx.moveTo(p1.x, p1.y)
                ctx.lineTo(p2.x, p2.y)
                ctx.strokeStyle = rec.color
                ctx.lineWidth = 2
                ctx.setLineDash([8, 4])
                ctx.stroke()
                ctx.setLineDash([])
            }
        }
        ctx.globalAlpha = 1.0
    })

    // 运动轨迹
    for (let i = 1; i < state.trail.length; i++) {
        const p1 = worldToScreen(state.trail[i - 1].x, state.trail[i - 1].y)
        const p2 = worldToScreen(state.trail[i].x, state.trail[i].y)
        const alpha = 0.08 + 0.35 * (i / state.trail.length)
        ctx.beginPath()
        ctx.moveTo(p1.x, p1.y)
        ctx.lineTo(p2.x, p2.y)
        ctx.strokeStyle = `rgba(231, 76, 60, ${alpha})`
        ctx.lineWidth = 2.5
        ctx.stroke()
    }

    // 绘制物理对象（支持模型自定义形状）
    if (model.drawObject) {
      model.drawObject(ctx, state, p, worldToScreen)
    } else {
      const ballPos = model.getBallPosition(state, p)
      const pos = worldToScreen(ballPos.x, ballPos.y)
      const radius = 12
      ctx.beginPath()
      ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2)
      ctx.fillStyle = "#e74c3c"
      ctx.fill()
      ctx.strokeStyle = "rgba(0,0,0,0.2)"
      ctx.lineWidth = 1.5
      ctx.stroke()
    }

    // 信息（带半透明背景，确保在任何底色下都清晰）
    ctx.font = "bold 14px ui-monospace, SF Mono, 'Cascadia Code', Consolas, monospace"
    const infoLines = model.getInfoLines(state, p, simTime)
    const lineHeight = 22
    let maxW = 0
    infoLines.forEach(line => {
        const m = ctx.measureText(line)
        if (m.width > maxW) maxW = m.width
    })
    const padX = 12, padY = 8
    const bgW = maxW + padX * 2
    const bgH = infoLines.length * lineHeight + padY * 2
    // 圆角矩形背景
    const rx = 6
    const bx = 10, by = 10
    ctx.beginPath()
    ctx.moveTo(bx + rx, by)
    ctx.lineTo(bx + bgW - rx, by)
    ctx.arcTo(bx + bgW, by, bx + bgW, by + rx, rx)
    ctx.lineTo(bx + bgW, by + bgH - rx)
    ctx.arcTo(bx + bgW, by + bgH, bx + bgW - rx, by + bgH, rx)
    ctx.lineTo(bx + rx, by + bgH)
    ctx.arcTo(bx, by + bgH, bx, by + bgH - rx, rx)
    ctx.lineTo(bx, by + rx)
    ctx.arcTo(bx, by, bx + rx, by, rx)
    ctx.closePath()
    ctx.fillStyle = "rgba(0,0,0,0.55)"
    ctx.fill()
    ctx.fillStyle = "whitesmoke"
    infoLines.forEach((line, i) => {
        ctx.fillText(line, bx + padX, by + padY + 14 + i * lineHeight)
    })

    ctx.restore()
}

// ── Canvas 自适应 ──
const resizeCanvas = () => {
    const area = canvasAreaRef.value
    const canvas = canvasRef.value
    if (!area || !canvas) return
    const rect = area.getBoundingClientRect()
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
.classic-lab-page {
    display: flex;
    height: calc(100vh - var(--nav-height) - 16px);
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 12px;
    gap: 12px;
}

/* ── 左侧边栏 ── */
.lab-sidebar {
    width: 220px;
    flex-shrink: 0;
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

.sidebar-header {
    padding: 12px 14px;
    border-bottom: 1px solid var(--border);
    flex-shrink: 0;
}

.back-btn {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 4px 10px;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    background: var(--bg-card);
    color: var(--text-secondary);
    font-size: 13px;
    font-weight: 700;
    cursor: pointer;
    transition: var(--transition);
}

.back-btn:hover {
    border-color: var(--primary);
    color: var(--primary);
    background: var(--primary-light);
}

.model-list {
    flex: 1;
    overflow-y: auto;
    padding: 6px;
    display: flex;
    flex-direction: column;
    gap: 2px;
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
    width: 22px;
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
    font-weight: 700;
}

.model-desc {
    font-size: 12px;
    font-weight: 500;
    color: var(--text-muted);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.model-item.active .model-desc {
    color: var(--primary);
}

/* ── 主区域（画布 + 底部参数）── */
.lab-main {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-width: 0;
    gap: 8px;
}

.canvas-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 16px;
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    flex-shrink: 0;
}

.canvas-title {
    font-size: 14px;
    font-weight: 700;
    color: var(--text-dark);
}

.canvas-actions {
    display: flex;
    gap: 6px;
}

.toolbar-btn {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 5px 12px;
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

/* ── 画布 ── */
.canvas-area {
    flex: 1;
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    overflow: hidden;
    position: relative;
    min-height: 200px;
}

.canvas-area canvas {
    display: block;
    width: 100%;
    height: 100%;
    cursor: grab;
}

.canvas-area canvas:active {
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

.canvas-placeholder svg { opacity: 0.3; }
.canvas-placeholder p { font-size: 14px; }

/* ── 底部参数面板 ── */
.params-bar {
    flex-shrink: 0;
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    padding: 12px 16px 14px;
    overflow-x: auto;
}

.params-bar-header {
    display: flex;
    align-items: center;
    gap: 6px;
    padding-bottom: 8px;
    margin-bottom: 10px;
    border-bottom: 1.5px solid var(--primary);
    color: var(--primary);
    font-size: 12px;
    font-weight: 700;
}

.params-bar-header svg {
    flex-shrink: 0;
}

.params-bar-inner {
    display: flex;
    gap: 24px;
    align-items: flex-start;
    flex-wrap: nowrap;
    min-width: min-content;
}

.param-item {
    display: flex;
    flex-direction: column;
    gap: 4px;
    min-width: 160px;
    flex-shrink: 0;
}

.param-item-label {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 12px;
    font-weight: 600;
    color: var(--text-secondary);
}

.param-item-value {
    font-size: 13px;
    font-weight: 700;
    color: var(--primary);
    font-family: var(--mono);
}

.param-item-slider {
    width: 100%;
    height: 4px;
    -webkit-appearance: none;
    appearance: none;
    background: var(--border);
    border-radius: 2px;
    outline: none;
    cursor: pointer;
}

.param-item-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: var(--primary);
    cursor: pointer;
    border: 2px solid #fff;
    box-shadow: 0 1px 4px rgba(0,0,0,0.2);
}

.param-item-select {
    width: 100%;
    padding: 5px 8px;
    border: 1.5px solid var(--border);
    border-radius: var(--radius);
    background: var(--bg-card);
    color: var(--text);
    font-size: 13px;
    font-weight: 600;
    outline: none;
    cursor: pointer;
    transition: var(--transition);
}
.param-item-select:hover,
.param-item-select:focus {
    border-color: var(--primary);
}

/* ── 对比记录 ── */
.params-compare {
    margin-top: 10px;
    padding-top: 10px;
    border-top: 1px solid var(--border);
}

.params-compare-header {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    font-weight: 600;
    color: var(--text-secondary);
    margin-bottom: 6px;
}

.params-compare-header svg {
    flex-shrink: 0;
    opacity: 0.5;
}

.compare-clear {
    margin-left: auto;
    padding: 1px 8px;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    background: transparent;
    color: var(--text-muted);
    font-size: 11px;
    cursor: pointer;
    transition: var(--transition);
}

.compare-clear:hover {
    border-color: var(--danger, #e74c3c);
    color: var(--danger, #e74c3c);
}

.params-compare-list {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
}

.compare-item {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 3px 8px;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    cursor: pointer;
    font-size: 11px;
    color: var(--text-secondary);
    transition: var(--transition);
    user-select: none;
}

.compare-item:hover {
    border-color: var(--primary);
    background: var(--primary-light);
}

.compare-item.checked {
    border-color: var(--primary);
    background: var(--primary-light);
    color: var(--text);
}

.compare-item input {
    display: none;
}

.compare-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    flex-shrink: 0;
}

.compare-label {
    white-space: nowrap;
    font-weight: 500;
}

/* ── 响应式 ── */
@media (max-width: 768px) {
    .lab-sidebar { display: none; }
    .classic-lab-page { padding: 0 6px; }
}
</style>

