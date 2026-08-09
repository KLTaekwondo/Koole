<template>
    <div class="sim-info-overlay" v-if="lines.length > 0" :class="{ collapsed }">
        <button class="info-toggle" @click="collapsed = !collapsed" :title="collapsed ? '展开实时读数' : '收起实时读数'">
            <span class="live-dot"></span>
            <span class="info-toggle-text" v-show="!collapsed">实时读数</span>
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
    top: 84px;
    left: 18px;
    z-index: 9;
    min-width: 150px;
    background: color-mix(in srgb, var(--bg-card) 84%, transparent);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border: 1px solid color-mix(in srgb, var(--border) 74%, var(--text));
    border-radius: 17px;
    color: var(--text);
    box-shadow: 0 10px 30px rgba(15, 23, 32, 0.13);
    font-family: var(--mono);
    font-size: 12px;
    pointer-events: auto;
    user-select: none;
    overflow: hidden;
    transition: background 0.2s, width 0.2s;
}

:root[data-theme="dark"] .sim-info-overlay {
    background: rgba(28, 28, 28, 0.82);
    border-color: rgba(255, 255, 255, 0.12);
}

.info-toggle {
    display: flex;
    align-items: center;
    gap: 7px;
    width: 100%;
    padding: 9px 11px;
    border: none;
    background: transparent;
    color: var(--text-secondary);
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.06em;
    cursor: pointer;
    transition: background 0.15s;
}

.info-toggle:hover {
    background: var(--primary-light);
    color: var(--primary);
}

.live-dot {
    width: 7px;
    height: 7px;
    flex-shrink: 0;
    border-radius: 50%;
    background: #35b97f;
    box-shadow: 0 0 0 4px rgba(53, 185, 127, 0.15);
}

.info-toggle-text {
    opacity: 0.7;
}

.info-body {
    padding: 2px 12px 11px;
    display: flex;
    flex-direction: column;
    gap: 3px;
    border-top: 1px solid var(--border);
}

.info-line {
    padding-top: 5px;
    color: var(--text);
    white-space: nowrap;
    line-height: 1.55;
}

/* 收起态：整个组件变成圆形状态点 */
.sim-info-overlay.collapsed {
    min-width: 0;
    border-radius: 50%;
}

.sim-info-overlay.collapsed .info-toggle {
    width: 38px;
    height: 38px;
    justify-content: center;
    padding: 0;
}

@media (max-width: 680px) {
    .sim-info-overlay {
        top: 64px;
        left: 10px;
    }

    .sim-info-overlay:not(.collapsed) {
        max-width: calc(100% - 20px);
    }
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
