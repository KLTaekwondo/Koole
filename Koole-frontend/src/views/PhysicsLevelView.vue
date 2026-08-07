<template>
    <div class="level-view">
        <header class="level-header">
            <router-link to="/physics-lab/levels" class="back-link">← 关卡列表</router-link>
            <div class="level-heading">
                <span>{{ level?.chapterId }} / LEVEL {{ String(level?.order || 0).padStart(2, "0") }}</span>
                <h1>{{ level?.title || "关卡不存在" }}</h1>
                <p>{{ level?.objective }}</p>
            </div>
            <span class="level-model">{{ model?.name }}</span>
        </header>

        <main v-if="level && model" class="level-main">
            <section class="experiment-card">
                <div class="experiment-toolbar">
                    <span>{{ model.name }} · {{ level.description }}</span>
                    <button type="button" @click="showHint = !showHint">{{ showHint ? "隐藏提示" : "查看提示" }}</button>
                </div>
                <div v-if="showHint" class="hint-box">{{ level.hint }}</div>
                <div class="sim-shell" ref="canvasAreaRef">
                    <canvas
                        ref="canvasRef"
                        @mousedown="onMouseDown"
                        @mousemove="onMouseMove"
                        @mouseup="onMouseUp"
                        @mouseleave="onMouseUp"
                        @touchstart="onTouchStart"
                        @touchmove="onTouchMove"
                        @touchend="onTouchEnd"
                    ></canvas>
                    <div class="sim-controls">
                        <button type="button" @click="startOrPause">{{ running ? "暂停" : "开始" }}</button>
                        <button type="button" @click="resetExperiment">重置本关</button>
                        <button type="button" class="check-button" :disabled="!hasRun" @click="checkTarget">检查目标</button>
                    </div>
                </div>
            </section>

            <aside class="level-sidebar">
                <div class="objective-card">
                    <span class="side-kicker">MISSION</span>
                    <h2>{{ level.objective }}</h2>
                    <p>目标：{{ level.target.label }} {{ level.target.value }} {{ level.target.unit }}</p>
                    <div v-for="param in visibleParams" :key="param.key" class="level-param">
                        <label><span>{{ param.label }}</span><b>{{ displayParamValue(param) }}</b></label>
                        <input type="range" :min="param.min" :max="param.max" :step="param.step || 1" :value="param.value" @input="updateParam(param.key, parseFloat($event.target.value))" />
                    </div>
                </div>
                <div v-if="result" class="result-card" :class="{ success: result.success }">
                    <span class="side-kicker">{{ result.success ? "COMPLETED" : "TRY AGAIN" }}</span>
                    <h2>{{ result.success ? "目标达成" : "还差一点" }}</h2>
                    <p>{{ result.message }}</p>
                    <div class="result-value">实际 {{ formatActual(result.actual) }} {{ level.target.unit }}</div>
                    <p class="explanation">{{ level.explanation }}</p>
                    <router-link v-if="result.success && nextLevel" :to="`/physics-lab/levels/${nextLevel.id}`" class="next-button">下一关 ↗</router-link>
                </div>
            </aside>
        </main>
        <div v-else class="missing-level">找不到这个关卡，<router-link to="/physics-lab/levels">返回关卡列表</router-link></div>
    </div>
</template>

<script setup>
import { computed, nextTick, ref, watch } from "vue"
import { useRoute } from "vue-router"
import { getPhysicsLevel, getPhysicsLevelModel, PHYSICS_LEVELS } from "../constants/physicsLevels.js"
import { usePhysicsLevelProgress } from "../stores/physics/levelProgress.js"
import { createSimulationState } from "../stores/physics/SimulationState.js"
import { createPhysicsEngine } from "../stores/physics/PhysicsEngine.js"
import { createRenderer } from "../stores/physics/renderer.js"
import { createCamera } from "../stores/physics/camera.js"
import { createCanvasManager } from "../stores/physics/canvas.js"
import { createViewTransform } from "../stores/physics/ViewTransform.js"

const route = useRoute()
const level = ref(null)
const model = ref(null)
const running = ref(false)
const showHint = ref(false)
const hasRun = ref(false)
const result = ref(null)
const params = ref({})
const { recordAttempt, completeLevel } = usePhysicsLevelProgress()
let simState = null
let engine = null
let animationId = 0
const modelRef = computed(() => model.value)
const viewTransform = createViewTransform()
let renderer = null
const canvasManager = createCanvasManager(() => renderer?.draw(), viewTransform)
const canvasRef = canvasManager.canvasRef
const canvasAreaRef = canvasManager.canvasAreaRef
let camera = null

const visibleParams = computed(() => (model.value?.params || []).filter(param => level.value.allowedParams.includes(param.key)))
const nextLevel = computed(() => {
    const index = PHYSICS_LEVELS.findIndex(item => item.id === level.value?.id)
    return PHYSICS_LEVELS[index + 1] || null
})

function loadLevel() {
    level.value = getPhysicsLevel(route.params.levelId)
    model.value = getPhysicsLevelModel(level.value)
    if (!level.value || !model.value) return
    params.value = model.value.params.reduce((values, param) => ({ ...values, [param.key]: level.value.initialParams[param.key] ?? param.value }), {})
    model.value = { ...model.value, params: model.value.params.map(param => ({ ...param, value: params.value[param.key] })) }
    result.value = null
    hasRun.value = false
    nextTick(initSimulation)
}

function initSimulation() {
    if (!canvasRef.value || !model.value) return
    simState = createSimulationState()
    simState.modelId = model.value.id
    simState.params = { ...params.value }
    engine = createPhysicsEngine(modelRef, simState)
    renderer = createRenderer(canvasRef, viewTransform, modelRef, simState, ref([]), () => document.documentElement.getAttribute("data-theme") || "light", () => {})
    camera = createCamera(canvasRef, modelRef, simState, viewTransform, () => renderer.draw())
    engine.initState()
    nextTick(() => {
        canvasManager.resizeCanvas()
        camera.centerCameraOnBall()
        renderer.draw()
    })
}

function updateParam(key, value) {
    params.value[key] = value
    const param = model.value.params.find(item => item.key === key)
    if (param) param.value = value
    if (!running.value) {
        simState.params[key] = value
        engine.initState()
        renderer.draw()
    }
}

function startOrPause() {
    if (!engine) return
    toggleSimulation()
    if (running.value) hasRun.value = true
}

const onMouseDown = event => camera?.onMouseDown(event)
const onMouseMove = event => camera?.onMouseMove(event)
const onMouseUp = event => camera?.onMouseUp(event)
const onTouchStart = event => camera?.onTouchStart(event)
const onTouchMove = event => camera?.onTouchMove(event)
const onTouchEnd = event => camera?.onTouchEnd(event)

function toggleSimulation() {
    if (!engine) return
    running.value = !running.value
    if (running.value) {
        hasRun.value = true
        animationId = requestAnimationFrame(step)
    }
}

function step(timestamp) {
    if (!running.value) return
    engine.step(1 / 60)
    simState.simTime += 1 / 60
    renderer.draw()
    if (engine.isFinished()) {
        running.value = false
        animationId = 0
        checkTarget()
        return
    }
    animationId = requestAnimationFrame(step)
}

function checkTarget() {
    if (!engine || !hasRun.value) return
    const state = simState.state
    const resultData = {
        x: state?.x,
        maxHeight: state?.maxHeight ?? (model.value.id === "vertical-throw" ? params.value.initialVelocity ** 2 / (2 * params.value.gravity) : undefined),
        period: model.value.id === "pendulum"
            ? 2 * Math.PI * Math.sqrt(params.value.length / params.value.gravity)
            : model.value.id === "spring-mass"
                ? 2 * Math.PI * Math.sqrt(params.value.mass / params.value.k)
                : undefined,
    }
    result.value = level.value.evaluate(resultData, { time: simState.simTime })
    recordAttempt(level.value.id)
    if (result.value.success) completeLevel(level.value.id, result.value)
}

function resetExperiment() {
    running.value = false
    cancelAnimationFrame(animationId)
    result.value = null
    hasRun.value = false
    params.value = { ...level.value.initialParams }
    model.value.params.forEach(param => { if (params.value[param.key] !== undefined) param.value = params.value[param.key] })
    initSimulation()
}

function displayParamValue(param) {
    const value = param.value
    return Number.isInteger(value) ? value : Number(value).toFixed(1)
}
function formatActual(value) { return typeof value === "number" ? value.toFixed(2) : "—" }
watch(() => route.params.levelId, loadLevel, { immediate: true })
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
    color: var(--primary);
    font-family: var(--mono);
    font-size: 9px;
    font-weight: 700;
    letter-spacing: .1em;
}

.level-heading h1 {
    margin: 8px 0 5px;
    font-size: clamp(28px, 4vw, 46px);
}

.level-heading p {
    color: var(--text-secondary);
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
    border-color: var(--primary);
    background: var(--primary);
    color: #fff;
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
    color: var(--primary);
    font-family: var(--mono);
}

.level-param input {
    width: 100%;
    margin-top: 11px;
    accent-color: var(--primary);
}

.result-card {
    border-color: var(--primary);
}

.result-card.success {
    background: var(--primary-light);
}

.result-value {
    margin: 18px 0;
    color: var(--primary);
    font-family: var(--mono);
    font-size: 15px;
    font-weight: 700;
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
