<template>
    <div v-if="activeModel" class="model-workspace" :class="{ 'is-focused': focusMode }">
        <section class="simulation-stage">
            <header v-if="!focusMode" class="simulation-heading">
                <div>
                    <small>{{ activeModel.category }}</small>
                    <h1>{{ activeModel.name }}</h1>
                </div>
            </header>

            <div class="canvas-area" ref="canvasAreaRef">
                <SimInfoOverlay v-if="!focusMode" :lines="infoLines" />
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

                <div class="canvas-controls">
                    <button class="control-button primary" type="button" :title="running ? '暂停' : '开始'" @click="toggleSimulation">
                        <img :src="running ? pauseIcon : playIcon" alt="" />
                        <span>{{ running ? '暂停' : '开始' }}</span>
                    </button>
                    <i></i>
                    <button class="control-button" type="button" title="重置模拟" @click="resetSimulation">
                        <img :src="resetIcon" alt="" />
                        <span>重置</span>
                    </button>
                    <button class="control-button" :class="{ active: followTarget }" type="button" title="追踪目标" @click="followTarget = !followTarget">
                        <img :src="targetIcon" alt="" />
                        <span>追踪</span>
                    </button>
                    <button class="control-button" type="button" title="重置视角" @click="resetCamera">
                        <img :src="viewResetIcon" alt="" />
                        <span>视角</span>
                    </button>
                    <i></i>
                    <button class="control-button" type="button" :title="focusMode ? '退出专注模式' : '进入专注模式'" @click="toggleFocusMode">
                        <img :src="gridIcon" alt="" />
                        <span>{{ focusMode ? '退出' : '专注' }}</span>
                    </button>
                    <i></i>
                    <button class="control-button" type="button" title="复制带当前参数的分享链接" @click="shareModel">
                        <img :src="shareIcon" alt="" />
                        <span>分享</span>
                    </button>
                </div>
            </div>
        </section>

        <transition name="model-swap" mode="out-in">
        <div v-if="!focusMode" :key="activeModel.id" class="model-detail">
        <section v-if="activeModel.exploration" class="exploration-section" :class="{ done: explorationDone }">
            <span class="exploration-badge">{{ explorationDone ? '✓' : '任务' }}</span>
            <div class="exploration-text">
                <small>{{ explorationDone ? 'TASK DONE' : 'EXPLORE' }}</small>
                <p>{{ activeModel.exploration.task }}</p>
            </div>
            <span class="exploration-status">{{ explorationDone ? '探索完成' : '进行中' }}</span>
        </section>

        <section class="parameter-section">
            <header class="section-heading">
                <span class="parameter-live-dot"></span>
                <div>
                    <small>PARAMETERS</small>
                    <h2>参数调节</h2>
                </div>
            </header>

            <div class="parameter-list">
                <div v-for="param in activeModel.params" :key="param.key" class="parameter-item">
                    <label>
                        <span>{{ param.label }}</span>
                        <strong>{{ displayParamValue(param) }}</strong>
                    </label>
                    <select
                        v-if="param.options"
                        :value="param.value"
                        @change="updateParam(param.key, parseFloat($event.target.value))"
                    >
                        <option v-for="option in param.options" :key="option.value" :value="option.value">{{ option.label }}</option>
                    </select>
                    <input
                        v-else
                        type="range"
                        :min="param.min"
                        :max="param.max"
                        :step="param.step || 1"
                        :value="param.value"
                        @input="updateParam(param.key, parseFloat($event.target.value))"
                    />
                    <div v-if="!param.options" class="range-limits">
                        <span>{{ param.min }}</span>
                        <span>{{ param.max }}</span>
                    </div>
                </div>
            </div>
        </section>

        <section class="content-section">
            <div class="section-block">
                <header class="section-heading">
                    <div>
                        <small>DATA</small>
                        <h2>实验记录</h2>
                    </div>
                </header>
                <ComparisonPanel
                    v-if="recordedTrails.length > 0"
                    :trails="recordedTrails"
                    @clear-all="clearRecords"
                    @remove-record="removeRecord"
                    @toggle-visibility="toggleTrailVisibility"
                />
                <div v-else class="data-empty">
                    <img :src="activityIcon" alt="" />
                    <div>
                        <strong>还没有实验记录</strong>
                        <p>开始运行模型，模拟结束后会在这里生成曲线、事件和关键数据。</p>
                    </div>
                    <button type="button" @click="toggleSimulation">开始实验</button>
                </div>
            </div>

            <div class="section-block">
                <button
                    type="button"
                    class="knowledge-toggle"
                    :class="{ active: knowledgeOpen, locked: isKnowledgeLocked, shake: nudgeKnowledge }"
                    @click="toggleKnowledge"
                >
                    <span class="knowledge-toggle-text">
                        <small>PRINCIPLE</small>
                        <span>{{ isKnowledgeLocked ? '先完成探索任务' : '原理讲解' }}</span>
                    </span>
                    <img :src="isKnowledgeLocked ? lockIcon : (knowledgeOpen ? closeIcon : gridIcon)" alt="" />
                </button>
                <div v-show="knowledgeOpen" class="tab-panel">
                    <ModelInfoPanel :model-id="activeModel.id" :knowledge="activeModel.knowledge" />
                </div>
            </div>
        </section>
        </div>
        </transition>
    </div>

    <div v-else class="model-not-found">
        <img :src="activityIcon" alt="" />
        <h1>没有找到这个模型</h1>
        <p>它可能已被移动，重新打开模型库选择一个实验。</p>
        <button type="button" @click="$emit('requestModels')">打开模型库</button>
    </div>
</template>

<script setup>
import { ref, watch, computed, defineAsyncComponent, nextTick, onBeforeUnmount } from "vue"
import { useRoute, useRouter } from "vue-router"
import { getModelById } from "../../../constants"
import { usePhysicsSim } from "../../../Logic/physics/engine/usePhysicsSim.js"
import { success, warning } from "../../../stores/toast.js"
// ECharts 体积较大，而且只有「记录过轨迹、展开对比」时才会渲染，按需异步加载
const ComparisonPanel = defineAsyncComponent(() => import("./ComparisonPanel.vue"))
import SimInfoOverlay from "./SimInfoOverlay.vue"
import ModelInfoPanel from "./ModelInfoPanel.vue"
import playIcon from "../../../assets/icons/play.svg"
import pauseIcon from "../../../assets/icons/pause.svg"
import resetIcon from "../../../assets/icons/reset.svg"
import targetIcon from "../../../assets/icons/target.svg"
import viewResetIcon from "../../../assets/icons/view-reset.svg"
import gridIcon from "../../../assets/icons/grid.svg"
import activityIcon from "../../../assets/icons/activity.svg"
import closeIcon from "../../../assets/icons/close.svg"
import lockIcon from "../../../assets/icons/lock.svg"
import shareIcon from "../../../assets/icons/share.svg"

const emit = defineEmits(["requestModels", "focusChange"])
const route = useRoute()
const router = useRouter()
const activeModel = ref(null)
const knowledgeOpen = ref(false)
const focusMode = ref(false)
// 模型默认参数（分享链接只带上被改过的参数；重置/还原也靠它判断）
const defaultParams = ref({})
// 刚进入页面时先别把默认参数写回 URL，等分享参数还原完再开始同步
const shareReady = ref(false)

function loadModel(modelId) {
    const source = getModelById(modelId)
    if (!source) {
        activeModel.value = null
        return
    }
    defaultParams.value = Object.fromEntries(source.params.map(param => [param.key, param.value]))
    activeModel.value = {
        ...source,
        params: source.params.map(param => ({ ...param })),
    }
    knowledgeOpen.value = false
    shareReady.value = false
    // 等 usePhysicsSim 初始化完（模型切换 watcher）再把 URL 里的参数套上去
    nextTick(() => {
        applySharedParams()
        shareReady.value = true
    })
}

/** 把 URL 查询串里的参数还原到当前模型；非法值交给 usePhysicsSim 夹到合法范围 */
function applySharedParams() {
    const model = activeModel.value
    if (!model) return
    const query = route.query || {}
    const values = {}
    for (const param of model.params) {
        if (!(param.key in query)) continue
        const raw = Array.isArray(query[param.key]) ? query[param.key][0] : query[param.key]
        if (raw === undefined || raw === null || raw === "") continue
        const num = Number(raw)
        if (Number.isFinite(num)) values[param.key] = num
    }
    if (Object.keys(values).length) applyParams(values)
}

/** 当前模型相对默认值改过的参数，用于分享链接与地址栏同步 */
const shareQuery = computed(() => {
    const model = activeModel.value
    if (!model) return {}
    const query = {}
    for (const param of model.params) {
        const defaultValue = defaultParams.value[param.key]
        const same = typeof param.value === "number" && typeof defaultValue === "number"
            ? Math.abs(param.value - defaultValue) < 1e-9
            : param.value === defaultValue
        if (!same) query[param.key] = String(param.value)
    }
    return query
})

let shareTimer = null
watch(shareQuery, query => {
    if (!shareReady.value) return
    clearTimeout(shareTimer)
    // 拖动滑块会连续触发，防抖后再写地址栏（用 replace，不产生历史记录）
    shareTimer = setTimeout(() => {
        router.replace({ path: route.path, query })
    }, 500)
}, { deep: true })

onBeforeUnmount(() => clearTimeout(shareTimer))

/** 生成当前参数对应的分享链接 */
function buildShareUrl() {
    const params = new URLSearchParams(shareQuery.value).toString()
    const base = `${window.location.origin}${window.location.pathname}#${route.path}`
    return params ? `${base}?${params}` : base
}

async function shareModel() {
    const url = buildShareUrl()
    // 先把地址栏同步成分享链接，复制出去的链接和看到的地址一致
    router.replace({ path: route.path, query: shareQuery.value })
    try {
        await navigator.clipboard.writeText(url)
        success("分享链接已复制，打开就能还原当前参数")
    } catch {
        warning("浏览器不允许写剪贴板，链接已同步到地址栏，可手动复制")
    }
}

function toggleFocusMode() {
    focusMode.value = !focusMode.value
    emit("focusChange", focusMode.value)
}

// 探索任务未完成时，原理讲解加锁；点击只晃动提示，不展开
const isKnowledgeLocked = computed(() => {
    const model = activeModel.value
    return !!model?.exploration && !explorationDone.value
})
const nudgeKnowledge = ref(false)
function toggleKnowledge() {
    if (isKnowledgeLocked.value) {
        nudgeKnowledge.value = false
        requestAnimationFrame(() => { nudgeKnowledge.value = true })
        setTimeout(() => { nudgeKnowledge.value = false }, 300)
        return
    }
    knowledgeOpen.value = !knowledgeOpen.value
}

watch(() => route.params.modelId, loadModel, { immediate: true })

const {
    canvasRef,
    canvasAreaRef,
    infoLines,
    running,
    explorationDone,
    followTarget,
    recordedTrails,
    updateParam,
    applyParams,
    displayParamValue,
    toggleSimulation,
    resetSimulation,
    resetCamera,
    clearRecords,
    removeRecord,
    toggleTrailVisibility,
    onMouseDown,
    onMouseMove,
    onMouseUp,
    onTouchStart,
    onTouchMove,
    onTouchEnd,
} = usePhysicsSim(activeModel)
</script>

<style scoped>
.model-workspace {
    display: grid;
    gap: 32px;
}

/* 参数 / 记录 / 探索任务这一列：切换模型时整块淡入，画布保持不动 */
.model-detail {
    display: grid;
    gap: 32px;
}

.model-swap-enter-active {
    transition: opacity 0.28s var(--ease-out), transform 0.28s var(--ease-out);
}

.model-swap-leave-active {
    transition: opacity 0.14s ease;
}

.model-swap-enter-from {
    opacity: 0;
    transform: translateY(10px);
}

.model-swap-leave-to {
    opacity: 0;
}

.simulation-stage {
    position: relative;
    min-height: calc(100svh - var(--nav-height) - 24px);
}

.simulation-heading {
    position: absolute;
    top: 18px;
    right: 18px;
    left: 18px;
    z-index: 12;
    display: flex;
    align-items: flex-start;
    justify-content: flex-end;
    pointer-events: none;
}

.simulation-heading > div {
    position: absolute;
    top: 0;
    left: 190px;
    pointer-events: auto;
}

.simulation-heading small {
    color: var(--primary);
    font-family: var(--mono);
    font-size: 9px;
    letter-spacing: 0.12em;
}

.simulation-heading h1 {
    margin-top: 3px;
    color: var(--text);
    font-size: 20px;
}

.canvas-area {
    position: relative;
    height: calc(100svh - var(--nav-height) - 24px);
    min-height: 620px;
    overflow: hidden;
    border: 1px solid var(--border);
    border-radius: 24px;
    background: var(--bg-card);
    box-shadow: 0 16px 52px rgba(20, 28, 34, 0.12);
}

.canvas-area canvas {
    width: 100%;
    height: 100%;
    display: block;
    border-radius: inherit;
    cursor: grab;
    touch-action: none;
}

.canvas-area canvas:active {
    cursor: grabbing;
}

.canvas-controls {
    position: absolute;
    left: 50%;
    bottom: 20px;
    z-index: 10;
    min-height: 52px;
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 6px;
    border: 1px solid color-mix(in srgb, var(--border) 75%, var(--text));
    border-radius: 999px;
    background: color-mix(in srgb, var(--bg-card) 88%, transparent);
    box-shadow: 0 14px 40px rgba(15, 23, 32, 0.18);
    backdrop-filter: blur(18px);
    -webkit-backdrop-filter: blur(18px);
    transform: translateX(-50%);
}

.canvas-controls > i {
    width: 1px;
    height: 24px;
    margin: 0 3px;
    background: var(--border);
}

.control-button {
    min-height: 40px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 0 12px;
    border: 0;
    border-radius: 999px;
    background: transparent;
    color: var(--text-secondary);
    font-size: 11px;
    font-weight: 700;
}

.control-button:hover,
.control-button.active {
    background: var(--primary-light);
    color: var(--primary);
}

.control-button.primary {
    min-width: 82px;
    background: var(--primary);
    color: #fff;
}

.control-button img {
    width: 16px;
    height: 16px;
}

.exploration-section {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr) auto;
    align-items: center;
    gap: 14px;
    padding: 16px 20px;
    border: 1px solid var(--border);
    border-radius: 18px;
    background: var(--bg-card);
    box-shadow: var(--shadow);
    transition: border-color 0.3s ease, background 0.3s ease;
}

.exploration-section.done {
    border-color: color-mix(in srgb, #2ecc71 55%, var(--border));
    background: color-mix(in srgb, #2ecc71 8%, var(--bg-card));
}

.exploration-badge {
    width: 34px;
    height: 34px;
    flex-shrink: 0;
    display: grid;
    place-items: center;
    border-radius: 50%;
    background: var(--primary-light);
    color: var(--primary);
    font-size: 12px;
    font-weight: 700;
}

.exploration-section.done .exploration-badge {
    background: #2ecc71;
    color: #fff;
}

.exploration-text {
    min-width: 0;
}

.exploration-text small {
    color: var(--primary);
    font-family: var(--mono);
    font-size: 9px;
    letter-spacing: 0.12em;
}

.exploration-text p {
    margin-top: 4px;
    color: var(--text);
    font-size: 13px;
    line-height: 1.5;
}

.exploration-status {
    flex-shrink: 0;
    padding: 4px 10px;
    border-radius: 999px;
    background: var(--bg-card-hover);
    color: var(--text-muted);
    font-size: 11px;
    font-weight: 700;
}

.exploration-section.done .exploration-status {
    background: color-mix(in srgb, #2ecc71 14%, transparent);
    color: #2ecc71;
}

.content-section {
    display: flex;
    flex-direction: column;
    overflow: hidden;
    border: 1px solid var(--border);
    border-radius: 24px;
    background: var(--bg-card);
    box-shadow: var(--shadow);
}

.section-block {
    padding: 20px 20px 22px;
    border-bottom: 1px solid var(--border);
}

.section-block:last-child {
    border-bottom: 0;
}

.section-heading {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 14px;
}

.section-heading small {
    color: var(--primary);
    font-family: var(--mono);
    font-size: 9px;
    letter-spacing: 0.12em;
}

.section-heading h2 {
    margin-top: 2px;
    color: var(--text);
    font-size: 14px;
}

.tab-panel {
    padding: 0;
}

.knowledge-toggle {
    width: 100%;
    min-height: 54px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 4px;
    border: 0;
    background: transparent;
    color: var(--text);
    cursor: pointer;
    text-align: left;
}

.knowledge-toggle-text {
    display: flex;
    flex-direction: column;
    gap: 3px;
}

.knowledge-toggle-text small {
    color: var(--primary);
    font-family: var(--mono);
    font-size: 9px;
    letter-spacing: 0.12em;
}

.knowledge-toggle-text span {
    font-size: 14px;
    font-weight: 700;
}

.knowledge-toggle img {
    width: 17px;
    height: 17px;
    color: var(--text-muted);
}

.knowledge-toggle.locked {
    cursor: not-allowed;
}

.knowledge-toggle.locked .knowledge-toggle-text span {
    color: var(--text-muted);
}

@keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-3px); }
    75% { transform: translateX(3px); }
}

.knowledge-toggle.shake {
    animation: shake 0.25s ease;
}

.data-empty {
    min-height: 330px;
    display: grid;
    grid-template-columns: 52px minmax(0, 1fr) auto;
    align-items: center;
    gap: 20px;
    padding: 40px clamp(24px, 6vw, 76px);
    border-radius: 17px;
    background: var(--bg-card-hover);
}

.data-empty > img {
    width: 42px;
    height: 42px;
    opacity: 0.5;
}

.data-empty strong {
    color: var(--text);
    font-size: 19px;
}

.data-empty p {
    margin-top: 7px;
    color: var(--text-secondary);
    font-size: 13px;
}

.data-empty button,
.model-not-found button {
    min-height: 42px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 0 17px;
    border: 1px solid var(--primary);
    border-radius: 999px;
    background: var(--primary);
    color: #fff;
    font-size: 12px;
    font-weight: 700;
}

.parameter-section {
    display: flex;
    flex-direction: column;
    gap: 14px;
    padding: 20px 20px 22px;
    overflow: hidden;
    border: 1px solid var(--border);
    border-radius: 24px;
    background: var(--bg-card);
    box-shadow: var(--shadow);
}

.parameter-live-dot {
    width: 8px;
    height: 8px;
    flex-shrink: 0;
    border-radius: 50%;
    background: var(--primary);
    box-shadow: 0 0 0 5px var(--primary-light);
}

.parameter-list {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 10px;
}

.parameter-item {
    padding: 11px 12px 9px;
    border: 1px solid color-mix(in srgb, var(--border) 80%, transparent);
    border-radius: 13px;
    background: color-mix(in srgb, var(--bg-card-hover) 72%, transparent);
}

.parameter-item label {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    color: var(--text-secondary);
    font-size: 12px;
    font-weight: 700;
}

.parameter-item label strong {
    color: var(--primary);
    font-family: var(--mono);
    font-size: 13px;
}

.parameter-item input[type="range"] {
    width: 100%;
    height: 5px;
    margin-top: 11px;
    appearance: none;
    border-radius: 999px;
    background: var(--border);
    outline: none;
}

.parameter-item input[type="range"]::-webkit-slider-thumb {
    width: 18px;
    height: 18px;
    appearance: none;
    border: 3px solid var(--bg-card);
    border-radius: 50%;
    background: var(--primary);
    box-shadow: 0 2px 7px rgba(0, 0, 0, 0.22);
}

.parameter-item select {
    width: 100%;
    height: 42px;
    margin-top: 13px;
    padding: 0 12px;
    border: 1px solid var(--border);
    border-radius: 12px;
    background: var(--bg-card);
    color: var(--text);
}

.range-limits {
    display: flex;
    justify-content: space-between;
    margin-top: 7px;
    color: var(--text-muted);
    font-family: var(--mono);
    font-size: 9px;
}

.model-not-found {
    min-height: calc(100svh - var(--nav-height) - 24px);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 32px;
    border: 1px solid var(--border);
    border-radius: 24px;
    background: var(--bg-card);
    text-align: center;
}

.model-not-found > img {
    width: 44px;
    height: 44px;
    opacity: 0.4;
}

.model-not-found h1 {
    margin: 18px 0 8px;
    color: var(--text);
}

.model-not-found p {
    margin-bottom: 24px;
    color: var(--text-secondary);
}

.is-focused .simulation-stage,
.is-focused .canvas-area {
    height: calc(100svh - var(--nav-height) - 24px);
}

@media (max-width: 680px) {
    .model-workspace {
        gap: 18px;
    }

    .simulation-stage {
        min-height: calc(100svh - var(--nav-height) - 12px);
    }

    .simulation-heading {
        top: 10px;
        right: 10px;
        left: 10px;
    }

    .simulation-heading > div {
        display: none;
    }

    .canvas-area {
        height: calc(100svh - var(--nav-height) - 12px);
        min-height: 520px;
        border-radius: 18px;
    }

    .canvas-controls {
        bottom: 12px;
        width: 90%;
        max-width: calc(100% - 20px);
        flex-wrap: wrap;
        justify-content: center;
    }

    .control-button {
        min-height: 38px;
        padding: 0 9px;
        font-size: 10px;
    }

    .control-button.primary {
        min-width: 60px;
    }

    .content-section,
    .parameter-section {
        border-radius: 18px;
    }

    .section-block,
    .parameter-section {
        padding: 16px 14px 18px;
    }

    .data-empty {
        min-height: 300px;
        grid-template-columns: 1fr;
        justify-items: center;
        text-align: center;
    }
}
@media (prefers-reduced-motion: reduce) {
    .model-swap-enter-active,
    .model-swap-leave-active {
        transition: opacity 0.15s linear;
    }

    .model-swap-enter-from {
        transform: none;
    }
}
</style>
