<template>
    <div class="level-view">
        <header class="level-header">
            <router-link to="/math-lab/levels" class="back-link">← 关卡列表</router-link>
            <div class="level-heading">
                <span>{{ level?.chapterId }} / LEVEL {{ String(level?.order || 0).padStart(2, "0") }}</span>
                <h1>{{ level?.title || "关卡不存在" }}</h1>
                <p class="level-expr">y = {{ expressionDisplay }}</p>
            </div>
            <span class="level-model">{{ level?.objective }}</span>
        </header>

        <main v-if="level" class="level-main">
            <section class="experiment-card">
                <div class="experiment-toolbar">
                    <span>{{ level.expression }} · {{ level.description }}</span>
                    <button type="button" @click="showHint = !showHint">{{ showHint ? "隐藏提示" : "查看提示" }}</button>
                </div>
                <div v-if="showHint" class="hint-box">{{ level.hint }}</div>
                <div class="sim-shell" ref="canvasAreaRef">
                    <canvas ref="canvasRef"></canvas>
                    <div class="sim-controls">
                        <button type="button" @click="resetExperiment">重置本关</button>
                        <button type="button" class="check-button" @click="checkTarget">检查目标</button>
                    </div>
                </div>
            </section>

            <aside class="level-sidebar">
                <div class="objective-card">
                    <span class="side-kicker">MISSION</span>
                    <h2>{{ level.objective }}</h2>
                    <p>目标：{{ level.target.label }} {{ level.target.value }}</p>
                    <div v-for="param in level.params" :key="param.key" class="level-param">
                        <label><span>{{ param.label }}</span><b>{{ displayParamValue(param) }}</b></label>
                        <input type="range" :min="param.min" :max="param.max" :step="param.step" :value="params[param.key]" @input="updateParam(param.key, parseFloat($event.target.value))" />
                    </div>
                </div>
                <div v-if="result" class="result-card" :class="{ success: result.success }">
                    <span class="side-kicker">{{ result.success ? "COMPLETED" : "TRY AGAIN" }}</span>
                    <h2>{{ result.success ? "目标达成" : "还差一点" }}</h2>
                    <p>{{ result.message }}</p>
                    <div class="result-value">实际 {{ formatActual(result.actual) }} {{ level.target.unit }}</div>
                    <p class="explanation">{{ level.explanation }}</p>
                    <router-link v-if="result.success && nextLevel" :to="`/math-lab/levels/${nextLevel.id}`" class="next-button">下一关 ↗</router-link>
                </div>
            </aside>
        </main>
        <div v-else class="missing-level">找不到这个关卡，<router-link to="/math-lab/levels">返回关卡列表</router-link></div>
    </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from "vue"
import { useRoute } from "vue-router"
import { theme } from "../../../stores/theme.js"
import { getMathLevel, MATH_LEVELS } from "../../../Levels/math/mathLevels.js"
import { useMathLevelProgress } from "../../../Logic/math/levelProgress.js"
import { createView, worldToScreen, screenToWorld } from "../../../Logic/math/camera.js"
import { evaluateWorld } from "../../../Logic/math/evaluator.js"

const route = useRoute()
const level = ref(null)
const showHint = ref(false)
const result = ref(null)
const params = reactive({})
const { recordAttempt, completeLevel } = useMathLevelProgress()

const canvasRef = ref(null)
const canvasAreaRef = ref(null)
const view = createView()
let drawFrame = 0
let resizeObserver = null

const nextLevel = computed(() => {
    const index = MATH_LEVELS.findIndex(item => item.id === level.value?.id)
    return MATH_LEVELS[index + 1] || null
})

const expressionDisplay = computed(() => (level.value?.expression || "").replace(/^y\s*=\s*/, ""))

function loadLevel() {
    level.value = getMathLevel(route.params.levelId)
    if (!level.value) return
    Object.assign(params, Object.fromEntries(level.value.params.map(param => [param.key, param.value])))
    Object.assign(view, level.value.view)
    result.value = null
    showHint.value = false
    nextTick(scheduleDraw)
}

function updateParam(key, value) {
    params[key] = value
    scheduleDraw()
}

function checkTarget() {
    if (!level.value) return
    result.value = level.value.evaluate(params)
    recordAttempt(level.value.id)
    if (result.value.success) completeLevel(level.value.id, result.value)
    scheduleDraw()
}

function resetExperiment() {
    if (!level.value) return
    Object.assign(params, Object.fromEntries(level.value.params.map(param => [param.key, param.value])))
    Object.assign(view, level.value.view)
    result.value = null
    scheduleDraw()
}

function displayParamValue(param) {
    const value = params[param.key]
    return Number.isInteger(value) ? value : Number(value).toFixed(1)
}
function formatActual(value) { return typeof value === "number" ? value.toFixed(2) : value }

// ---- 画布绘制：网格 + 坐标轴 + 目标标记 + 函数曲线采样 ----

function draw() {
    const canvas = canvasRef.value
    const ctx = canvas?.getContext("2d")
    if (!canvas || !ctx || !level.value) return

    const dpr = window.devicePixelRatio || 1
    const width = canvas.clientWidth
    const height = canvas.clientHeight
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, width, height)

    const isDark = theme.value === "dark"
    const bg = isDark ? "#14181f" : "#fafbfc"
    const gridColor = isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(71, 124, 219, 0.08)"
    const axisColor = isDark ? "#3a4657" : "#c3ccd8"
    const textColor = isDark ? "#8b97a7" : "#6b7a90"
    const targetColor = "rgba(232, 150, 60, 0.9)"
    const curveColor = result.value?.success ? "#2bb673" : (isDark ? "#8fc8ff" : "#477cdb")

    // 背景
    ctx.fillStyle = bg
    ctx.fillRect(0, 0, width, height)

    // 可见世界范围
    const [minX, maxY] = screenToWorld(0, 0, view, width, height)
    const [maxX, minY] = screenToWorld(width, height, view, width, height)

    // 细网格（每 1 单位）
    ctx.strokeStyle = gridColor
    ctx.lineWidth = 1
    for (let gx = Math.ceil(minX); gx <= Math.floor(maxX); gx += 1) {
        const [sx] = worldToScreen(gx, 0, view, width, height)
        ctx.beginPath(); ctx.moveTo(sx, 0); ctx.lineTo(sx, height); ctx.stroke()
    }
    for (let gy = Math.ceil(minY); gy <= Math.floor(maxY); gy += 1) {
        const [, sy] = worldToScreen(0, gy, view, width, height)
        ctx.beginPath(); ctx.moveTo(0, sy); ctx.lineTo(width, sy); ctx.stroke()
    }

    // 坐标轴（x 轴 y=0、y 轴 x=0）
    const [axisX, axisY] = worldToScreen(0, 0, view, width, height)
    ctx.strokeStyle = axisColor
    ctx.lineWidth = 1.3
    ctx.beginPath(); ctx.moveTo(0, axisY); ctx.lineTo(width, axisY); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(axisX, 0); ctx.lineTo(axisX, height); ctx.stroke()

    // 目标标记
    const mark = level.value.targetMark
    ctx.font = "11px " + getMono()
    if (mark.type === "line") {
        const [, sy] = worldToScreen(0, mark.y, view, width, height)
        ctx.strokeStyle = targetColor
        ctx.setLineDash([6, 5])
        ctx.lineWidth = 1.6
        ctx.beginPath(); ctx.moveTo(0, sy); ctx.lineTo(width, sy); ctx.stroke()
        ctx.setLineDash([])
        ctx.fillStyle = targetColor
        ctx.textAlign = "left"
        ctx.fillText("目标 y = " + formatNum(mark.y), 10, sy - 8)
    } else if (mark.type === "point") {
        const [sx, sy] = worldToScreen(mark.x, mark.y, view, width, height)
        ctx.strokeStyle = targetColor
        ctx.lineWidth = 2
        ctx.beginPath(); ctx.arc(sx, sy, 9, 0, Math.PI * 2); ctx.stroke()
        ctx.fillStyle = targetColor
        ctx.beginPath(); ctx.arc(sx, sy, 3, 0, Math.PI * 2); ctx.fill()
        ctx.fillStyle = targetColor
        ctx.textAlign = "left"
        ctx.fillText("目标 (" + formatNum(mark.x) + ", " + formatNum(mark.y) + ")", sx + 14, sy - 12)
    }

    // 函数曲线采样（显式函数，复用 evaluator）
    const fn = { expression: level.value.expression, params: { ...params }, offsetX: 0, offsetY: 0 }
    ctx.strokeStyle = curveColor
    ctx.lineWidth = 2.4
    ctx.lineJoin = "round"
    ctx.beginPath()
    let started = false
    const samples = 240
    for (let i = 0; i <= samples; i += 1) {
        const wx = minX + (i / samples) * (maxX - minX)
        const wy = evaluateWorld(fn, wx)
        if (!Number.isFinite(wy)) { started = false; continue }
        const [sx, sy] = worldToScreen(wx, wy, view, width, height)
        if (sy < -1000 || sy > height + 1000) { started = false; continue }
        if (!started) { ctx.moveTo(sx, sy); started = true }
        else ctx.lineTo(sx, sy)
    }
    ctx.stroke()

    // 左下角表达式小字
    ctx.fillStyle = textColor
    ctx.font = "12px " + getMono()
    ctx.textAlign = "left"
    ctx.fillText("y = " + expressionDisplay.value, 12, height - 14)
}

function formatNum(value) {
    return Number(value.toFixed(1)).toString()
}

function getMono() {
    return 'ui-monospace, "Cascadia Code", Consolas, monospace'
}

function scheduleDraw() {
    cancelAnimationFrame(drawFrame)
    drawFrame = requestAnimationFrame(draw)
}

function resizeCanvas() {
    const canvas = canvasRef.value
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const dpr = window.devicePixelRatio || 1
    canvas.width = Math.floor(rect.width * dpr)
    canvas.height = Math.floor(rect.height * dpr)
    scheduleDraw()
}

watch(() => route.params.levelId, loadLevel, { immediate: true })
watch(theme, scheduleDraw)
watch(() => JSON.stringify(params), scheduleDraw)

onMounted(async () => {
    await nextTick()
    resizeCanvas()
    resizeObserver = new ResizeObserver(resizeCanvas)
    if (canvasRef.value) resizeObserver.observe(canvasRef.value)
})

onBeforeUnmount(() => {
    cancelAnimationFrame(drawFrame)
    resizeObserver?.disconnect()
})
</script>

<style scoped>
.level-view {
    width: min(1280px, calc(100% - 32px));
    margin: -20px auto 50px;
    color: var(--text);
}

.level-header {
    display: grid;
    grid-template-columns: 180px minmax(0, 1fr) 180px;
    align-items: center;
    gap: 22px;
    padding: 24px 0;
}

.back-link {
    color: var(--text-secondary);
    font-size: 12px;
    font-weight: 700;
    text-decoration: none;
}

.back-link:hover {
    color: var(--primary);
}

.level-heading {
    text-align: center;
}

.level-heading > span,
.side-kicker {
    color: #477cdb;
    font-family: var(--mono);
    font-size: 9px;
    font-weight: 700;
    letter-spacing: .1em;
}

:root[data-theme="dark"] .level-heading > span,
:root[data-theme="dark"] .side-kicker {
    color: #6f9be8;
}

.level-heading h1 {
    margin: 8px 0 5px;
    font-size: clamp(28px, 4vw, 46px);
}

.level-expr {
    color: var(--text-secondary);
    font-family: var(--mono);
    font-size: 13px;
}

.level-model {
    color: var(--text-secondary);
    font-size: 12px;
    text-align: right;
}

.level-main {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 310px;
    gap: 16px;
}

.experiment-card,
.objective-card,
.result-card {
    border: 1px solid var(--border);
    border-radius: 20px;
    background: var(--bg-card);
    box-shadow: var(--shadow);
}

.experiment-card {
    overflow: hidden;
}

.experiment-toolbar {
    display: flex;
    justify-content: space-between;
    gap: 18px;
    padding: 15px 18px;
    color: var(--text-secondary);
    font-family: var(--mono);
    font-size: 12px;
}

.experiment-toolbar button {
    border: 0;
    background: transparent;
    color: var(--primary);
    font-weight: 700;
}

.hint-box {
    padding: 12px 18px;
    background: var(--primary-light);
    color: var(--text-secondary);
    font-size: 12px;
}

.sim-shell {
    position: relative;
    height: 650px;
    background: var(--bg-card-hover);
}

.sim-shell canvas {
    width: 100%;
    height: 100%;
    display: block;
}

.sim-controls {
    position: absolute;
    left: 50%;
    bottom: 18px;
    display: flex;
    gap: 7px;
    transform: translateX(-50%);
}

.sim-controls button,
.next-button {
    min-height: 38px;
    padding: 0 15px;
    border: 1px solid var(--border);
    border-radius: 999px;
    background: color-mix(in srgb, var(--bg-card) 90%, transparent);
    color: var(--text);
    font-size: 11px;
    font-weight: 700;
    white-space: nowrap;
}

.sim-controls .check-button,
.next-button {
    border-color: #477cdb;
    background: #477cdb;
    color: #fff;
}

:root[data-theme="dark"] .sim-controls .check-button,
:root[data-theme="dark"] .next-button {
    border-color: #6f9be8;
    background: #6f9be8;
    color: #0c1a2e;
}

.level-sidebar {
    display: grid;
    align-content: start;
    gap: 16px;
}

.objective-card,
.result-card {
    padding: 22px;
}

.objective-card h2,
.result-card h2 {
    margin: 12px 0 9px;
    font-size: 21px;
}

.objective-card p,
.result-card p {
    color: var(--text-secondary);
    font-size: 12px;
    line-height: 1.7;
}

.level-param {
    margin-top: 22px;
}

.level-param label {
    display: flex;
    justify-content: space-between;
    color: var(--text-secondary);
    font-size: 11px;
    font-weight: 700;
}

.level-param b {
    color: #477cdb;
    font-family: var(--mono);
}

:root[data-theme="dark"] .level-param b {
    color: #6f9be8;
}

.level-param input {
    width: 100%;
    margin-top: 11px;
    accent-color: #477cdb;
}

:root[data-theme="dark"] .level-param input {
    accent-color: #6f9be8;
}

.result-card {
    border-color: var(--primary);
}

.result-card.success {
    background: var(--primary-light);
}

.result-value {
    margin: 18px 0;
    color: #477cdb;
    font-family: var(--mono);
    font-size: 15px;
    font-weight: 700;
}

:root[data-theme="dark"] .result-value {
    color: #6f9be8;
}

.explanation {
    padding-top: 15px;
    border-top: 1px solid var(--border);
}

.next-button {
    display: inline-flex;
    align-items: center;
    margin-top: 18px;
    text-decoration: none;
}

.missing-level {
    padding: 80px 0;
    text-align: center;
    color: var(--text-secondary);
}

@media (max-width: 820px) {
    .level-view {
        width: calc(100% - 24px);
    }

    .level-header {
        grid-template-columns: 1fr auto;
    }

    .level-heading {
        grid-column: 1 / -1;
        grid-row: 2;
        text-align: left;
    }

    .level-model {
        text-align: right;
    }

    .level-main {
        grid-template-columns: 1fr;
    }

    .sim-shell {
        height: 56vh;
        min-height: 430px;
    }

    .level-sidebar {
        grid-template-columns: 1fr;
    }

    .sim-controls {
        max-width: calc(100% - 20px);
    }
}
</style>
