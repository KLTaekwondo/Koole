<template>
    <div v-if="activeModel" class="model-workspace">
        <section class="simulation-stage">
            <!-- 左上角：返回 + 当前位置，极轻的一行 -->
            <div class="stage-status">
                <button class="status-back" type="button" aria-label="返回物理实验室" @click="router.push('/physics-lab')">←</button>
                <span class="status-dot"></span>
                <small>{{ activeModel.category }}</small>
                <strong>{{ activeModel.name }}</strong>
            </div>

            <div class="canvas-area" ref="canvasAreaRef">
                <canvas
                    ref="canvasRef"
                    @wheel.prevent="onWheelZoom"
                    @mousedown="onMouseDown"
                    @mousemove="onMouseMove"
                    @mouseup="onMouseUp"
                    @mouseleave="onMouseUp"
                    @touchstart="handleTouchStart"
                    @touchmove="handleTouchMove"
                    @touchend="handleTouchEnd"
                ></canvas>
                <SimInfoOverlay :lines="infoLines" />

                <!-- 右下角缩放控件：滚轮 / 双指 / 按钮都能调 -->
                <div class="zoom-widget">
                    <button type="button" data-tip="缩小" @click="zoomBy(0.9)">−</button>
                    <button type="button" class="zoom-value" data-tip="点击恢复 100%" @click="resetZoom">{{ Math.round(zoom * 100) }}%</button>
                    <button type="button" data-tip="放大" @click="zoomBy(1.1)">+</button>
                </div>
            </div>

            <!-- 底部胶囊：全部入口都在这儿 -->
            <div class="model-toolbar">
                <button class="model-chip" type="button" data-tip="切换模型" title="切换模型" @click="$emit('requestModels')">
                    <span class="chip-dot"></span>
                    <span class="chip-name">{{ activeModel.name }}</span>
                    <span class="chip-caret">▾</span>
                </button>
                <i class="tb-divider"></i>
                <button class="tb-icon" type="button" :data-tip="running ? '暂停' : '开始'" :title="running ? '暂停' : '开始'" @click="toggleSimulation">
                    <img :src="running ? pauseIcon : playIcon" alt="" />
                </button>
                <button class="tb-icon" type="button" data-tip="重置模拟" title="重置模拟" @click="resetSimulation">
                    <img :src="resetIcon" alt="" />
                </button>
                <button class="tb-icon" :class="{ active: followTarget }" type="button" data-tip="视角锁定：镜头跟随物体" title="视角锁定：镜头跟随物体" @click="followTarget = !followTarget">
                    <img :src="targetIcon" alt="" />
                </button>
                <button class="tb-icon" type="button" data-tip="重置视角" title="重置视角" @click="resetCamera">
                    <img :src="viewResetIcon" alt="" />
                </button>
                <i class="tb-divider"></i>
                <button class="tb-pill" :class="{ active: sheetOpen && sheetTab === 'params' }" type="button" data-tip="调节参数" @click="openSheet('params')">参数</button>
                <button class="tb-pill" :class="{ active: sheetOpen && sheetTab === 'curves' }" type="button" data-tip="实验记录与曲线对比" @click="openSheet('curves')">曲线</button>
                <button class="tb-pill" :class="{ active: sheetOpen && sheetTab === 'task' }" type="button" data-tip="本模型的探索任务" @click="openSheet('task')">任务</button>
                <button class="tb-pill" :class="{ active: sheetOpen && sheetTab === 'info' }" type="button" data-tip="原理与公式讲解" @click="openSheet('info')">原理</button>
                <i class="tb-divider"></i>
                <button class="tb-icon" type="button" data-tip="复制带当前参数的分享链接" title="复制带当前参数的分享链接" @click="shareModel">
                    <svg class="tb-inline-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                        <circle cx="18" cy="5" r="3" />
                        <circle cx="6" cy="12" r="3" />
                        <circle cx="18" cy="19" r="3" />
                        <line x1="8.6" y1="10.5" x2="15.4" y2="6.5" />
                        <line x1="8.6" y1="13.5" x2="15.4" y2="17.5" />
                    </svg>
                </button>
            </div>

            <!-- 上滑面板：一次只显示一块内容 -->
            <Transition name="sheet-rise">
                <section v-if="sheetOpen" class="model-sheet" aria-label="模型面板">
                    <header class="sheet-head">
                        <div class="sheet-title">
                            <small>{{ sheetKicker }}</small>
                            <h2>{{ sheetTitle }}</h2>
                        </div>
                        <button class="sheet-close" type="button" aria-label="收起面板" @click="closeSheet">×</button>
                    </header>

                    <div class="sheet-body">
                        <div v-show="sheetTab === 'params'" class="sheet-pane">
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
                                    <template v-else>
                                        <input
                                            type="range"
                                            :min="param.min"
                                            :max="param.max"
                                            :step="param.step || 1"
                                            :value="param.value"
                                            @input="updateParam(param.key, parseFloat($event.target.value))"
                                        />
                                        <div class="range-limits">
                                            <span>{{ param.min }}</span>
                                            <span>{{ param.max }}</span>
                                        </div>
                                    </template>
                                </div>
                            </div>
                            <p class="sheet-hint">拖动滑块即时生效，参数会同步到地址栏，复制链接即可还原这组条件。</p>
                        </div>

                        <div v-show="sheetTab === 'curves'" class="sheet-pane">
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

                        <div v-show="sheetTab === 'task'" class="sheet-pane">
                            <div v-if="activeModel.exploration" class="task-block" :class="{ done: explorationDone }">
                                <span class="task-badge">{{ explorationDone ? '✓' : '任务' }}</span>
                                <div class="task-copy">
                                    <small>{{ explorationDone ? 'TASK DONE' : 'EXPLORE' }}</small>
                                    <p>{{ activeModel.exploration.task }}</p>
                                    <p v-if="activeModel.exploration.hint" class="task-hint">{{ activeModel.exploration.hint }}</p>
                                </div>
                                <span class="task-status">{{ explorationDone ? '探索完成' : '进行中' }}</span>
                            </div>
                            <p v-else class="sheet-hint">这个模型没有单独的探索任务，直接调参数观察变化就行。</p>
                        </div>

                        <div v-show="sheetTab === 'info'" class="sheet-pane">
                            <ModelInfoPanel :model-id="activeModel.id" :knowledge="activeModel.knowledge" />
                        </div>
                    </div>
                </section>
            </Transition>
        </section>
    </div>

    <div v-else class="model-not-found">
        <img :src="activityIcon" alt="" />
        <h1>没有找到这个模型</h1>
        <p>它可能已被移动，重新打开模型库选择一个实验。</p>
        <button type="button" @click="$emit('requestModels')">打开模型库</button>
    </div>
</template>

<script setup>
import { ref, watch, computed, defineAsyncComponent, nextTick, onBeforeUnmount, onMounted } from "vue"
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
import activityIcon from "../../../assets/icons/activity.svg"

const emit = defineEmits(["requestModels", "focusChange"])
const route = useRoute()
const router = useRouter()
const activeModel = ref(null)
// 上滑面板：sheetOpen 控制显示，sheetTab 控制显示哪一块
const sheetOpen = ref(false)
const sheetTab = ref("params")
const SHEET_META = {
    params: { kicker: "PARAMETERS", title: "参数调节" },
    curves: { kicker: "RECORDS", title: "实验记录与曲线" },
    task: { kicker: "EXPLORE", title: "探索任务" },
    info: { kicker: "PRINCIPLE", title: "原理讲解" },
}
const sheetKicker = computed(() => SHEET_META[sheetTab.value]?.kicker || "")
const sheetTitle = computed(() => SHEET_META[sheetTab.value]?.title || "")

function openSheet(tab) {
    if (sheetOpen.value && sheetTab.value === tab) {
        sheetOpen.value = false
        return
    }
    sheetTab.value = tab
    sheetOpen.value = true
}

function closeSheet() {
    sheetOpen.value = false
}
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
    sheetOpen.value = false
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

// 页面一进来就是全屏工作台，让外层布局收起它的「模型 / 返回」按钮
onMounted(() => emit("focusChange", true))
onBeforeUnmount(() => emit("focusChange", false))

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
    zoom,
    zoomBy,
    resetZoom,
    onWheelZoom,
    onPinchStart,
    onPinchMove,
    onPinchEnd,
    onMouseDown,
    onMouseMove,
    onMouseUp,
    onTouchStart,
    onTouchMove,
    onTouchEnd,
} = usePhysicsSim(activeModel)

// 触屏：单指拖拽交给相机，双指捏合交给缩放
function handleTouchStart(event) {
    onPinchStart(event)
    onTouchStart(event)
}

function handleTouchMove(event) {
    onPinchMove(event)
    onTouchMove(event)
}

function handleTouchEnd() {
    onPinchEnd()
    onTouchEnd()
}
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
/* ===== 工作台 v2：全屏画布 + 底部胶囊 + 上滑面板 ===== */
.model-workspace {
    /* 物理实验室统一用学科蓝，不再用主站红 */
    --primary: #3b82f6;
    --primary-dark: #2563eb;
    --primary-hover: #60a5fa;

    position: relative;
    width: 100%;
    height: calc(100dvh - var(--nav-height));
    margin: 0;
    overflow: hidden;
    background: var(--bg);
}

.simulation-stage {
    position: absolute;
    inset: 0;
    min-height: 0;
}

/* 左上角状态条 */
.stage-status {
    position: absolute;
    top: 16px;
    left: 18px;
    z-index: 12;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 12px 6px 6px;
    border: 1px solid color-mix(in srgb, var(--border) 70%, transparent);
    border-radius: 999px;
    background: color-mix(in srgb, var(--bg-card) 78%, transparent);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
}

.status-back {
    width: 26px;
    height: 26px;
    display: grid;
    place-items: center;
    border: 0;
    border-radius: 50%;
    background: color-mix(in srgb, var(--primary) 12%, transparent);
    color: var(--primary);
    font-size: 14px;
    cursor: pointer;
}

.status-back:hover {
    background: var(--primary);
    color: #fff;
}

.status-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--primary);
}

.stage-status small {
    color: var(--text-muted);
    font-family: var(--mono);
    font-size: 10px;
    letter-spacing: 0.06em;
}

.stage-status strong {
    color: var(--text);
    font-size: 13px;
    font-weight: 700;
}

/* 画布铺满 */
.canvas-area {
    position: absolute;
    inset: 0;
    height: 100%;
    min-height: 0;
    overflow: hidden;
    border: 0;
    border-radius: 0;
    background: transparent;
    box-shadow: none;
}

/* 底部胶囊 */
.model-toolbar {
    position: absolute;
    left: 50%;
    bottom: 26px;
    z-index: 20;
    transform: translateX(-50%);
    display: flex;
    align-items: center;
    gap: 8px;
    max-width: calc(100vw - 32px);
    padding: 7px 9px;
    border: 1px solid color-mix(in srgb, var(--border) 72%, transparent);
    border-radius: 999px;
    background: color-mix(in srgb, var(--bg-card) 86%, transparent);
    backdrop-filter: blur(14px);
    -webkit-backdrop-filter: blur(14px);
    box-shadow: 0 10px 30px rgba(20, 28, 34, 0.1);
}

.model-chip {
    display: flex;
    align-items: center;
    gap: 7px;
    padding: 7px 12px;
    border: 0;
    border-radius: 999px;
    background: color-mix(in srgb, var(--primary) 12%, transparent);
    color: var(--text);
    font-family: var(--sans);
    font-size: 12.5px;
    font-weight: 700;
    cursor: pointer;
    transition: background 0.2s;
}

.model-chip:hover {
    background: color-mix(in srgb, var(--primary) 20%, transparent);
}

.chip-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--primary);
}

.chip-name {
    max-width: 130px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
}

.chip-caret {
    color: var(--primary);
    font-size: 10px;
}

.tb-divider {
    width: 1px;
    height: 20px;
    background: color-mix(in srgb, var(--border) 85%, transparent);
}

.tb-icon {
    width: 32px;
    height: 32px;
    display: grid;
    place-items: center;
    border: 0;
    border-radius: 50%;
    background: transparent;
    cursor: pointer;
    transition: background 0.2s;
}

.tb-icon:hover {
    background: color-mix(in srgb, var(--primary) 12%, transparent);
}

.tb-icon img,
.tb-inline-icon {
    width: 16px;
    height: 16px;
    opacity: 0.75;
}

/* 内联 SVG（分享图标）直接跟随按钮文字色，避免 <img> 里 currentColor 失效 */
.tb-inline-icon {
    color: var(--text-secondary);
    opacity: 0.8;
}

.tb-icon:hover .tb-inline-icon {
    color: var(--primary);
    opacity: 1;
}

/* 悬浮提示：用 data-tip 画一个小气泡，鼠标悬停/键盘聚焦时出现 */
.tb-icon[data-tip],
.tb-pill[data-tip],
.model-chip[data-tip] {
    position: relative;
}

.tb-icon[data-tip]::after,
.tb-pill[data-tip]::after,
.model-chip[data-tip]::after {
    content: attr(data-tip);
    position: absolute;
    left: 50%;
    bottom: calc(100% + 10px);
    z-index: 40;
    padding: 5px 9px;
    border-radius: 7px;
    background: color-mix(in srgb, #0f1720 92%, transparent);
    color: #fff;
    font-family: var(--sans);
    font-size: 11px;
    font-weight: 500;
    line-height: 1.35;
    white-space: nowrap;
    opacity: 0;
    transform: translate(-50%, 4px);
    transition: opacity 0.16s ease, transform 0.16s ease;
    pointer-events: none;
}

.tb-icon[data-tip]:hover::after,
.tb-icon[data-tip]:focus-visible::after,
.tb-pill[data-tip]:hover::after,
.tb-pill[data-tip]:focus-visible::after,
.model-chip[data-tip]:hover::after {
    opacity: 1;
    transform: translate(-50%, 0);
}

/* 触屏设备没有 hover，不显示气泡 */
@media (hover: none) {
    .tb-icon[data-tip]::after,
    .tb-pill[data-tip]::after,
    .model-chip[data-tip]::after {
        display: none;
    }
}

/* 视角锁定等「开关型」图标按钮的激活态 */
.tb-icon.active {
    background: color-mix(in srgb, var(--primary) 16%, transparent);
}

.tb-icon.active img {
    opacity: 1;
}

.tb-pill {
    padding: 7px 13px;
    border: 0;
    border-radius: 999px;
    background: transparent;
    color: var(--text-secondary);
    font-family: var(--sans);
    font-size: 12.5px;
    cursor: pointer;
    transition: background 0.2s, color 0.2s;
}

.tb-pill:hover {
    color: var(--primary);
    background: color-mix(in srgb, var(--primary) 10%, transparent);
}

.tb-pill.active {
    background: var(--primary);
    color: #fff;
    font-weight: 600;
}

/* 上滑面板 */
.model-sheet {
    position: absolute;
    left: 50%;
    bottom: 78px;
    z-index: 18;
    transform: translateX(-50%);
    width: min(980px, calc(100vw - 32px));
    max-height: min(44vh, 430px);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    border: 1px solid color-mix(in srgb, var(--border) 78%, transparent);
    border-radius: 18px;
    background: color-mix(in srgb, var(--bg-card) 94%, transparent);
    backdrop-filter: blur(18px);
    -webkit-backdrop-filter: blur(18px);
    box-shadow: 0 24px 60px rgba(20, 28, 34, 0.16);
}

.sheet-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 14px 18px 10px;
    border-bottom: 1px solid color-mix(in srgb, var(--border) 70%, transparent);
}

.sheet-title small {
    color: var(--primary);
    font-family: var(--mono);
    font-size: 9px;
    letter-spacing: 0.12em;
}

.sheet-title h2 {
    margin: 2px 0 0;
    font-size: 15px;
    font-weight: 750;
}

.sheet-close {
    width: 26px;
    height: 26px;
    display: grid;
    place-items: center;
    border: 0;
    border-radius: 50%;
    background: color-mix(in srgb, var(--border) 60%, transparent);
    color: var(--text-secondary);
    font-size: 14px;
    cursor: pointer;
}

.sheet-close:hover {
    background: var(--primary);
    color: #fff;
}

.sheet-body {
    padding: 16px 18px 18px;
    overflow-y: auto;
    overscroll-behavior: contain;
}

.sheet-pane {
    display: grid;
    gap: 12px;
}

.sheet-hint {
    margin: 0;
    color: var(--text-muted);
    font-size: 11.5px;
    line-height: 1.7;
}

/* 面板里的旧卡片去掉外壳 */
.sheet-pane .parameter-section,
.sheet-pane .content-section,
.sheet-pane .exploration-section {
    padding: 0;
    border: 0;
    border-radius: 0;
    background: transparent;
    box-shadow: none;
}

.sheet-pane .parameter-list {
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 14px 22px;
}

.sheet-pane .parameter-item {
    background: transparent;
}

/* 任务块 */
.task-block {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr) auto;
    align-items: center;
    gap: 14px;
    padding: 14px 16px;
    border-radius: 12px;
    background: color-mix(in srgb, var(--primary) 8%, transparent);
}

.task-block.done {
    background: color-mix(in srgb, #2ecc71 10%, transparent);
}

.task-badge {
    width: 32px;
    height: 32px;
    display: grid;
    place-items: center;
    border-radius: 50%;
    background: var(--primary);
    color: #fff;
    font-size: 11px;
    font-weight: 700;
}

.task-block.done .task-badge {
    background: #2ecc71;
}

.task-copy small {
    color: var(--primary);
    font-family: var(--mono);
    font-size: 9px;
    letter-spacing: 0.1em;
}

.task-copy p {
    margin: 3px 0 0;
    color: var(--text);
    font-size: 13px;
    line-height: 1.7;
}

.task-copy .task-hint {
    color: var(--text-muted);
    font-size: 12px;
}

.task-status {
    color: var(--text-muted);
    font-size: 11px;
    white-space: nowrap;
}

/* 面板动画 */
.sheet-rise-enter-active,
.sheet-rise-leave-active {
    transition: opacity 0.22s var(--ease-out), transform 0.26s var(--ease-out);
}

.sheet-rise-enter-from,
.sheet-rise-leave-to {
    opacity: 0;
    transform: translate(-50%, 14px);
}

/* 右下角缩放控件 */
.zoom-widget {
    position: absolute;
    right: 18px;
    bottom: 26px;
    z-index: 14;
    display: flex;
    align-items: center;
    gap: 2px;
    padding: 4px;
    border: 1px solid color-mix(in srgb, var(--border) 72%, transparent);
    border-radius: 999px;
    background: color-mix(in srgb, var(--bg-card) 86%, transparent);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
}

.zoom-widget button {
    min-width: 28px;
    height: 28px;
    display: grid;
    place-items: center;
    border: 0;
    border-radius: 50%;
    background: transparent;
    color: var(--text-secondary);
    font-family: var(--sans);
    font-size: 14px;
    line-height: 1;
    cursor: pointer;
    transition: background 0.18s, color 0.18s;
}

.zoom-widget button:hover {
    background: color-mix(in srgb, var(--primary) 14%, transparent);
    color: var(--primary);
}

.zoom-widget .zoom-value {
    min-width: 44px;
    padding: 0 6px;
    color: var(--text);
    font-family: var(--mono);
    font-size: 11px;
    font-variant-numeric: tabular-nums;
}

/* 移动端抬高，避免和胶囊重叠 */
@media (max-width: 760px) {
    .zoom-widget {
        right: 12px;
        bottom: 74px;
    }
}

@media (max-width: 760px) {
    .stage-status {
        top: 12px;
        left: 12px;
        padding: 5px 10px 5px 5px;
    }

    .model-toolbar {
        bottom: 16px;
        gap: 4px;
        padding: 6px 8px;
        max-width: calc(100vw - 20px);
    }

    .chip-name {
        max-width: 72px;
    }

    .tb-pill {
        padding: 6px 9px;
        font-size: 12px;
    }

    .tb-divider {
        display: none;
    }

    .model-sheet {
        bottom: 64px;
        width: calc(100vw - 16px);
        max-height: 54vh;
    }

    .sheet-pane .parameter-list {
        grid-template-columns: 1fr;
    }
}
</style>
