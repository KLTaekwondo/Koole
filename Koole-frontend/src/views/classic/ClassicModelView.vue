<template>
    <div v-if="activeModel" class="model-workspace" :class="{ 'is-focused': focusMode }">
        <section class="simulation-stage">
            <header v-if="!focusMode" class="simulation-heading">
                <div>
                    <small>{{ activeModel.category }}</small>
                    <h1>{{ activeModel.name }}</h1>
                </div>
                <button class="parameter-trigger" :class="{ active: parameterDrawerOpen }" type="button" @click="parameterDrawerOpen = !parameterDrawerOpen">
                    <img :src="settingsIcon" alt="" />
                    参数
                </button>
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
                </div>
            </div>
        </section>

        <section v-if="!focusMode" class="content-section">
            <nav class="content-tabs" aria-label="模型内容">
                <button type="button" :class="{ active: activeTab === 'data' }" @click="activeTab = 'data'">数据分析</button>
                <button type="button" :class="{ active: activeTab === 'knowledge' }" @click="activeTab = 'knowledge'">原理讲解</button>
            </nav>

            <div v-show="activeTab === 'data'" class="tab-panel">
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

            <div v-show="activeTab === 'knowledge'" class="tab-panel">
                <ModelInfoPanel :model-id="activeModel.id" :knowledge="activeModel.knowledge" />
            </div>
        </section>

        <transition name="parameter-slide">
            <aside v-if="parameterDrawerOpen && !focusMode" class="parameter-drawer">
                <header class="drawer-header">
                    <div class="drawer-title">
                        <span class="parameter-live-dot"></span>
                        <div>
                            <small>PARAMETERS</small>
                            <h2>参数调节</h2>
                        </div>
                    </div>
                    <button class="drawer-close" type="button" aria-label="收起参数面板" @click="parameterDrawerOpen = false">
                        <img :src="closeIcon" alt="" />
                    </button>
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

                <footer class="drawer-footer">
                    <button type="button" @click="resetSimulation">
                        <img :src="resetIcon" alt="" />
                        恢复初始状态
                    </button>
                </footer>
            </aside>
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
import { ref, watch } from "vue"
import { useRoute } from "vue-router"
import { getModelById } from "../../constants/index.js"
import { usePhysicsSim } from "../../stores/physics/usePhysicsSim.js"
import ComparisonPanel from "./ComparisonPanel.vue"
import SimInfoOverlay from "./SimInfoOverlay.vue"
import ModelInfoPanel from "./ModelInfoPanel.vue"
import playIcon from "../../assets/icons/play.svg"
import pauseIcon from "../../assets/icons/pause.svg"
import resetIcon from "../../assets/icons/reset.svg"
import targetIcon from "../../assets/icons/target.svg"
import viewResetIcon from "../../assets/icons/view-reset.svg"
import settingsIcon from "../../assets/icons/settings.svg"
import gridIcon from "../../assets/icons/grid.svg"
import activityIcon from "../../assets/icons/activity.svg"
import closeIcon from "../../assets/icons/close.svg"

const emit = defineEmits(["requestModels", "focusChange"])
const route = useRoute()
const activeModel = ref(null)
const parameterDrawerOpen = ref(false)
const focusMode = ref(false)
const activeTab = ref("data")

function loadModel(modelId) {
    const source = getModelById(modelId)
    if (!source) {
        activeModel.value = null
        return
    }
    activeModel.value = {
        ...source,
        params: source.params.map(param => ({ ...param })),
    }
    parameterDrawerOpen.value = true
    activeTab.value = "data"
}

function toggleFocusMode() {
    focusMode.value = !focusMode.value
    if (focusMode.value) parameterDrawerOpen.value = false
    emit("focusChange", focusMode.value)
}

watch(() => route.params.modelId, loadModel, { immediate: true })

const {
    canvasRef,
    canvasAreaRef,
    infoLines,
    running,
    followTarget,
    recordedTrails,
    updateParam,
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

.parameter-trigger {
    min-height: 40px;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 0 16px;
    border: 1px solid color-mix(in srgb, var(--border) 82%, var(--text));
    border-radius: 999px;
    background: color-mix(in srgb, var(--bg-card) 88%, transparent);
    color: var(--text);
    box-shadow: 0 8px 24px rgba(20, 28, 34, 0.1);
    backdrop-filter: blur(14px);
    -webkit-backdrop-filter: blur(14px);
    font-size: 12px;
    font-weight: 700;
    pointer-events: auto;
}

.parameter-trigger:hover,
.parameter-trigger.active {
    border-color: var(--primary);
    background: var(--primary-light);
    color: var(--primary);
    transform: translateY(-1px);
}

.parameter-trigger img {
    width: 16px;
    height: 16px;
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

.content-section {
    min-height: 420px;
    overflow: hidden;
    border: 1px solid var(--border);
    border-radius: 24px;
    background: var(--bg-card);
    box-shadow: var(--shadow);
}

.content-tabs {
    display: flex;
    gap: 6px;
    padding: 10px;
    border-bottom: 1px solid var(--border);
}

.content-tabs button {
    min-height: 40px;
    padding: 0 18px;
    border: 0;
    border-radius: 999px;
    background: transparent;
    color: var(--text-secondary);
    font-size: 12px;
    font-weight: 700;
}

.content-tabs button.active {
    background: var(--primary);
    color: #fff;
}

.tab-panel {
    padding: 12px;
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
.drawer-footer button,
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

.parameter-drawer {
    position: absolute;
    top: 76px;
    right: 18px;
    z-index: 13;
    width: min(320px, calc(100% - 36px));
    max-height: min(520px, calc(100% - 154px));
    display: flex;
    flex-direction: column;
    overflow: hidden;
    border: 1px solid color-mix(in srgb, var(--border) 74%, var(--text));
    border-radius: 18px;
    background: color-mix(in srgb, var(--bg-card) 84%, transparent);
    box-shadow: 0 12px 36px rgba(15, 23, 32, 0.16);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
}

.drawer-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 13px;
    border-bottom: 1px solid var(--border);
}

.drawer-title {
    display: flex;
    align-items: center;
    gap: 10px;
}

.parameter-live-dot {
    width: 8px;
    height: 8px;
    flex-shrink: 0;
    border-radius: 50%;
    background: var(--primary);
    box-shadow: 0 0 0 5px var(--primary-light);
}

.drawer-header small {
    color: var(--primary);
    font-family: var(--mono);
    font-size: 9px;
    letter-spacing: 0.12em;
}

.drawer-header h2 {
    margin-top: 2px;
    color: var(--text);
    font-size: 14px;
}

.drawer-close {
    width: 32px;
    height: 32px;
    display: grid;
    place-items: center;
    border: 1px solid var(--border);
    border-radius: 50%;
    background: transparent;
}

.drawer-close img {
    width: 15px;
    height: 15px;
}

.parameter-list {
    min-height: 0;
    display: flex;
    flex-direction: column;
    gap: 8px;
    overflow-y: auto;
    padding: 10px;
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

.drawer-footer {
    padding: 9px 10px 10px;
    border-top: 1px solid var(--border);
}

.drawer-footer button {
    width: 100%;
    min-height: 36px;
    background: transparent;
    color: var(--primary);
}
.drawer-footer img {
    width: 15px;
    height: 15px;
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

.drawer-fade-enter-active,
.drawer-fade-leave-active,
.parameter-slide-enter-active,
.parameter-slide-leave-active {
    transition: opacity 0.24s ease, transform 0.3s var(--ease-out);
}

.drawer-fade-enter-from,
.drawer-fade-leave-to {
    opacity: 0;
}

.parameter-slide-enter-from,
.parameter-slide-leave-to {
    opacity: 0;
    transform: translateX(28px);
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

    .parameter-trigger {
        width: 42px;
        padding: 0;
        font-size: 0;
    }

    .canvas-area {
        height: calc(100svh - var(--nav-height) - 12px);
        min-height: 520px;
        border-radius: 18px;
    }

    .canvas-controls {
        bottom: 12px;
        max-width: calc(100% - 20px);
    }

    .control-button {
        width: 40px;
        padding: 0;
    }

    .control-button span {
        display: none;
    }

    .control-button.primary {
        min-width: 46px;
    }

    .content-section {
        border-radius: 18px;
    }

    .tab-panel {
        padding: 7px;
    }

    .data-empty {
        min-height: 300px;
        grid-template-columns: 1fr;
        justify-items: center;
        text-align: center;
    }

    .parameter-drawer {
        top: auto;
        right: 6px;
        bottom: 6px;
        left: 6px;
        width: auto;
        max-height: min(78svh, 720px);
        border-radius: 24px 24px 18px 18px;
    }

    .parameter-slide-enter-from,
    .parameter-slide-leave-to {
        transform: translateY(28px);
    }
}
</style>
