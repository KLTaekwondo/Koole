<template>
    <div class="sim-info-overlay" v-if="lines.length > 0" :class="{ collapsed }">
        <button class="info-toggle" @click="collapsed = !collapsed" :title="collapsed ? '展开数据' : '收起数据'">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="16" x2="12" y2="12"/>
                <line x1="12" y1="8" x2="12.01" y2="8"/>
            </svg>
            <span class="info-toggle-text" v-show="!collapsed">数据</span>
        </button>
        <transition name="info-slide">
            <div class="info-body" v-show="!collapsed">
                <div class="info-line" v-for="(line, i) in lines" :key="i">{{ line }}</div>
            </div>
        </transition>
    </div>
</template>

<script setup>
import { ref } from "vue"

defineProps({
    lines: { type: Array, default: () => [] },
})

const collapsed = ref(false)
</script>

<style scoped>
.sim-info-overlay {
    position: absolute;
    top: 10px;
    left: 10px;
    z-index: 2;
    background: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 8px;
    color: #f0f0f0;
    font-family: ui-monospace, SF Mono, "Cascadia Code", Consolas, monospace;
    font-size: 13px;
    pointer-events: auto;
    user-select: none;
    overflow: hidden;
    transition: background 0.2s;
}

:root[data-theme="dark"] .sim-info-overlay {
    background: rgba(20, 20, 20, 0.85);
    border-color: rgba(255, 255, 255, 0.1);
}

.info-toggle {
    display: flex;
    align-items: center;
    gap: 4px;
    width: 100%;
    padding: 6px 10px;
    border: none;
    background: transparent;
    color: #f0f0f0;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.15s;
}

.info-toggle:hover {
    background: rgba(255, 255, 255, 0.08);
}

.info-toggle svg {
    flex-shrink: 0;
    opacity: 0.7;
}

.info-toggle-text {
    opacity: 0.7;
}

.info-body {
    padding: 0 10px 8px;
    display: flex;
    flex-direction: column;
    gap: 2px;
}

.info-line {
    white-space: nowrap;
    line-height: 1.8;
}

/* 收起态：整个组件变窄 */
.sim-info-overlay.collapsed {
    border-radius: 6px;
}

/* 过渡动画 */
.info-slide-enter-active,
.info-slide-leave-active {
    transition: max-height 0.2s ease, opacity 0.2s ease;
    max-height: 200px;
    overflow: hidden;
}

.info-slide-enter-from,
.info-slide-leave-to {
    max-height: 0;
    opacity: 0;
}
</style>
