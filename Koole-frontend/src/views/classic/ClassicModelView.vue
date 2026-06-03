<template>
    <template v-if="activeModel">
        <!-- 工具栏 -->
        <div class="canvas-toolbar">
            <span class="canvas-title">{{ activeModel.name }}</span>
            <div class="canvas-actions">
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

        <!-- 画布 -->
        <div class="canvas-area" ref="canvasAreaRef">
            <canvas
                ref="canvasRef"
                @mousedown="onMouseDown"
                @mousemove="onMouseMove"
                @mouseup="onMouseUp"
                @mouseleave="onMouseUp"
            ></canvas>
        </div>

        <!-- 底部参数面板 -->
        <div class="params-bar">
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
        </div>

        <!-- 对比面板 -->
        <ComparisonPanel
            v-if="recordedTrails.length > 0"
            :trails="recordedTrails"
            @clear-all="clearRecords"
            @remove-record="removeRecord"
            @toggle-visibility="toggleTrailVisibility"
        />
    </template>

    <!-- 未找到模型时的占位 -->
    <div v-else class="model-not-found">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
        </svg>
        <p>未找到该物理模型</p>
        <button class="back-to-list" @click="$router.push('/physics-lab/classic/free-fall')">查看自由落体</button>
    </div>
</template>

<script setup>
import { ref, watch } from "vue"
import { useRoute } from "vue-router"
import { getModelById } from "../../constants/index.js"
import { usePhysicsSim } from "../../stores/physics/usePhysicsSim.js"
import ComparisonPanel from "./ComparisonPanel.vue"

const route = useRoute()

const activeModel = ref(null)

const loadModel = (modelId) => {
    const source = getModelById(modelId)
    if (!source) {
        activeModel.value = null
        return
    }
    activeModel.value = {
        ...source,
        params: source.params.map(p => ({ ...p })),
    }
}

watch(() => route.params.modelId, loadModel, { immediate: true })

const {
    canvasRef,
    canvasAreaRef,
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
} = usePhysicsSim(activeModel)
</script>

<style scoped>
/* ── 工具栏 ── */
.canvas-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 16px;
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 0 0 var(--radius-lg) var(--radius-lg);
    flex-shrink: 0;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    position: sticky;
    z-index: 2;
    top:0;
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

/* ── 画布：flex: 1 填满剩余空间 ── */
.canvas-area {
    flex: 1;
    flex-shrink: 0;
    height: 600px;
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    position: relative;

}

.canvas-area canvas {
    display: block;
    width: 100%;
    height: 100%;
    cursor: grab;
    border-radius: var(--radius-lg);
    border: 1px solid var(--border);
}

.canvas-area canvas:active {
    cursor: grabbing;
}

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

/* ── 未找到模型 ── */
.model-not-found {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: var(--text-muted);
    gap: 12px;
}

.model-not-found svg { opacity: 0.3; }
.model-not-found p { font-size: 14px; }

.back-to-list {
    padding: 6px 16px;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    background: var(--bg-card);
    color: var(--primary);
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: var(--transition);
}

.back-to-list:hover {
    border-color: var(--primary);
    background: var(--primary-light);
}
</style>
