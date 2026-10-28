<template>
    <Teleport to="body">
        <transition name="dock" appear>
            <nav class="element-dock" :style="{ '--element': color }" aria-label="元素切换工具盒">
                <router-link to="/chem-lab/periodic-table" class="dock-home" title="回到元素周期表" aria-label="回到元素周期表">
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                        <rect x="3" y="3" width="7" height="7" rx="1.5"/>
                        <rect x="14" y="3" width="7" height="7" rx="1.5"/>
                        <rect x="3" y="14" width="7" height="7" rx="1.5"/>
                        <rect x="14" y="14" width="7" height="7" rx="1.5"/>
                    </svg>
                </router-link>

                <span class="dock-divider" aria-hidden="true"></span>

                <router-link
                    v-if="previous"
                    :to="`/chem-lab/periodic-table/${previous.symbol}`"
                    class="dock-step"
                    :title="`上一个元素：${previous.name}（${previous.symbol}）`"
                >
                    <svg viewBox="0 0 24 24" aria-hidden="true"><polyline points="15 5 8 12 15 19"/></svg>
                    <span class="step-text">{{ previous.name }}</span>
                </router-link>
                <span v-else class="dock-step is-disabled" aria-hidden="true">
                    <svg viewBox="0 0 24 24"><polyline points="15 5 8 12 15 19"/></svg>
                </span>

                <div class="dock-center" :title="`${element.name} · 第 ${element.atomicNumber} 号元素`">
                    <div class="dock-center-top">
                        <strong class="dock-symbol">{{ element.symbol }}</strong>
                        <span class="dock-index">{{ element.atomicNumber }} / {{ total }}</span>
                    </div>
                    <div class="dock-track" aria-hidden="true">
                        <i :style="{ width: `${progress}%` }"></i>
                    </div>
                </div>

                <router-link
                    v-if="next"
                    :to="`/chem-lab/periodic-table/${next.symbol}`"
                    class="dock-step"
                    :title="`下一个元素：${next.name}（${next.symbol}）`"
                >
                    <span class="step-text">{{ next.name }}</span>
                    <svg viewBox="0 0 24 24" aria-hidden="true"><polyline points="9 5 16 12 9 19"/></svg>
                </router-link>
                <span v-else class="dock-step is-disabled" aria-hidden="true">
                    <svg viewBox="0 0 24 24"><polyline points="9 5 16 12 9 19"/></svg>
                </span>

                <span class="dock-divider" aria-hidden="true"></span>

                <button type="button" class="dock-top" title="回到页面顶部" aria-label="回到页面顶部" @click="scrollToTop">
                    <svg viewBox="0 0 24 24" aria-hidden="true"><polyline points="5 15 12 8 19 15"/><line x1="12" y1="8" x2="12" y2="20"/></svg>
                </button>
            </nav>
        </transition>
    </Teleport>
</template>

<script setup>
// 元素详情页底部居中的胶囊工具盒：返回周期表 / 上一个 / 当前位置 / 下一个 / 回到顶部。
// 用 Teleport 挂到 body 上——页面切换时根元素带 transform，固定定位元素会被带着动。
import { computed } from "vue"
import { ELEMENT_CATEGORIES } from "../constants/periodicElements.js"

const props = defineProps({
    element: { type: Object, required: true },
    previous: { type: Object, default: null },
    next: { type: Object, default: null },
    total: { type: Number, default: 118 },
})

const color = computed(() => (ELEMENT_CATEGORIES[props.element?.category] || ELEMENT_CATEGORIES.unknown).color)
const progress = computed(() => {
    const total = Math.max(props.total, 1)
    return Math.min(100, Math.max(0, (props.element.atomicNumber / total) * 100))
})

function scrollToTop() {
    const behavior = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth"
    window.scrollTo({ top: 0, behavior })
}
</script>

<style scoped>
.element-dock {
    position: fixed;
    left: 50%;
    bottom: calc(18px + env(safe-area-inset-bottom, 0px));
    z-index: 90;
    display: flex;
    align-items: center;
    gap: 4px;
    max-width: calc(100vw - 24px);
    padding: 7px 10px;
    border: 1px solid color-mix(in srgb, var(--element) 26%, var(--border));
    border-radius: 999px;
    background: color-mix(in srgb, var(--bg-card) 86%, transparent);
    box-shadow: 0 14px 40px rgba(0, 0, 0, 0.14), 0 2px 8px rgba(0, 0, 0, 0.06);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    transform: translateX(-50%);
}

.dock-divider {
    width: 1px;
    height: 22px;
    background: var(--border);
    flex-shrink: 0;
}

.dock-home,
.dock-top,
.dock-step {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    min-width: 34px;
    height: 34px;
    padding: 0 8px;
    border: 0;
    border-radius: 999px;
    background: transparent;
    color: var(--text-secondary);
    font-family: var(--sans);
    font-size: 12px;
    text-decoration: none;
    cursor: pointer;
    transition: background 0.2s, color 0.2s, transform 0.2s;
}

.dock-home svg,
.dock-top svg,
.dock-step svg {
    width: 16px;
    height: 16px;
    fill: none;
    stroke: currentColor;
    stroke-width: 2;
    stroke-linecap: round;
    stroke-linejoin: round;
    flex-shrink: 0;
}

.dock-home:hover,
.dock-top:hover,
.dock-step:hover {
    background: color-mix(in srgb, var(--element) 12%, transparent);
    color: var(--element);
}

.dock-step:active,
.dock-home:active,
.dock-top:active {
    transform: scale(0.94);
}

.dock-step .step-text {
    max-width: 5.2em;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.dock-step.is-disabled {
    opacity: 0.3;
    cursor: default;
}

.dock-center {
    display: grid;
    gap: 3px;
    min-width: 92px;
    padding: 2px 10px 3px;
}

.dock-center-top {
    display: flex;
    align-items: baseline;
    justify-content: center;
    gap: 6px;
}

.dock-symbol {
    color: var(--element);
    font-family: var(--mono);
    font-size: 15px;
    font-weight: 800;
    line-height: 1;
}

.dock-index {
    color: var(--text-muted);
    font-family: var(--mono);
    font-size: 9px;
}

.dock-track {
    height: 2px;
    overflow: hidden;
    border-radius: 999px;
    background: var(--border-light);
}

.dock-track i {
    display: block;
    height: 100%;
    border-radius: inherit;
    background: var(--element);
    transition: width 0.3s var(--ease-out);
}

/* 进出场：从下方浮上来 */
.dock-enter-active,
.dock-leave-active {
    transition: opacity 0.26s var(--ease-out), transform 0.26s var(--ease-out);
}

.dock-enter-from,
.dock-leave-to {
    opacity: 0;
    transform: translate(-50%, 16px);
}

@media (max-width: 720px) {
    .element-dock {
        gap: 2px;
        padding: 6px 8px;
    }

    .dock-step {
        padding: 0 6px;
    }

    .dock-step .step-text {
        display: none;
    }

    .dock-center {
        min-width: 78px;
        padding: 2px 8px 3px;
    }
}

@media (prefers-reduced-motion: reduce) {
    .dock-enter-active,
    .dock-leave-active {
        transition: opacity 0.15s linear;
    }

    .dock-enter-from,
    .dock-leave-to {
        transform: translateX(-50%);
    }

    .dock-track i {
        transition: none;
    }
}
</style>
