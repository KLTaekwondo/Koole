<template>
    <div class="mini-table-wrap">
        <div class="mini-table" role="list" :aria-label="active ? `${active.name}在元素周期表中的位置` : '元素周期表'">
            <router-link
                v-for="element in PERIODIC_ELEMENTS"
                :key="element.atomicNumber"
                :to="`/chem-lab/periodic-table/${element.symbol}`"
                class="cell"
                :class="cellState(element)"
                :style="cellStyle(element)"
                :title="`${element.atomicNumber} ${element.name}（${element.symbol}）· 第 ${element.period} 周期${element.group ? ` · 第 ${element.group} 族` : ''}`"
                :aria-label="`${element.atomicNumber} 号元素 ${element.name} ${element.symbol}`"
                :aria-current="isActive(element) ? 'true' : undefined"
                role="listitem"
            >
                <small>{{ element.atomicNumber }}</small>
                <strong>{{ element.symbol }}</strong>
            </router-link>
        </div>

        <div class="mini-legend">
            <span><i class="swatch active"></i>当前元素</span>
            <span><i class="swatch group"></i>{{ groupLegendLabel }}</span>
            <span><i class="swatch period"></i>同一周期</span>
            <span class="legend-hint">点任意格子可以切过去看</span>
        </div>
    </div>
</template>

<script setup>
// 迷你周期表：只做「位置高亮 + 点击跳转」，用于元素详情页。
// 坐标直接用 periodicElements 里的 position（第 9、10 行是镧系/锕系）。
import { computed } from "vue"
import { PERIODIC_ELEMENTS, ELEMENT_CATEGORIES } from "../constants/periodicElements.js"

const props = defineProps({
    active: { type: Object, default: null },
})

const groupLegendLabel = computed(() => (
    props.active?.group ? `同一族（第 ${props.active.group} 族）` : "同一系列"
))

function isActive(element) {
    return props.active?.atomicNumber === element.atomicNumber
}

function cellStyle(element) {
    return {
        gridRow: element.position.row,
        gridColumn: element.position.column,
        "--element": ELEMENT_CATEGORIES[element.category]?.color || "#9aa3aa",
    }
}

function cellState(element) {
    const active = props.active
    return {
        "is-active": isActive(element),
        "is-group": Boolean(active && !isActive(element) && (
            active.group ? element.group === active.group : element.category === active.category
        )),
        "is-period": Boolean(active && !isActive(element) && element.period === active.period),
    }
}
</script>

<style scoped>
.mini-table-wrap {
    display: grid;
    gap: 14px;
    max-width: 1040px;
}

.mini-table {
    display: grid;
    grid-template-columns: repeat(18, minmax(0, 1fr));
    grid-template-rows: repeat(7, minmax(0, 1fr)) 10px repeat(2, minmax(0, 1fr));
    gap: 3px;
    width: 100%;
}

.cell {
    position: relative;
    display: grid;
    place-items: center;
    aspect-ratio: 1;
    min-width: 0;
    padding: 1px;
    overflow: hidden;
    border: 1px solid color-mix(in srgb, var(--element) 34%, var(--border));
    border-radius: 4px;
    background: color-mix(in srgb, var(--element) 12%, var(--bg-card));
    color: var(--text);
    text-decoration: none;
    transition: transform 0.15s var(--ease-out), box-shadow 0.15s var(--ease-out), background 0.15s;
}

.cell small {
    position: absolute;
    top: 1px;
    left: 2px;
    color: var(--text-muted);
    font-family: var(--mono);
    font-size: 6px;
    line-height: 1;
}

.cell strong {
    font-family: var(--mono);
    font-size: clamp(8px, 1vw, 12px);
    font-weight: 700;
    line-height: 1;
}

.cell:hover,
.cell:focus-visible {
    z-index: 2;
    transform: scale(1.25);
    box-shadow: 0 4px 12px color-mix(in srgb, var(--element) 34%, transparent);
    background: color-mix(in srgb, var(--element) 30%, var(--bg-card));
    outline: none;
}

.cell.is-period {
    background: color-mix(in srgb, var(--element) 20%, var(--bg-card));
    border-color: color-mix(in srgb, var(--element) 58%, var(--border));
}

.cell.is-group {
    background: color-mix(in srgb, var(--element) 34%, var(--bg-card));
    border-color: color-mix(in srgb, var(--element) 78%, var(--border));
}

.cell.is-active {
    border-color: var(--element);
    border-width: 2px;
    background: var(--element);
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--element) 22%, transparent);
}

.cell.is-active strong {
    color: #fff;
    font-weight: 800;
}

.cell.is-active small {
    color: color-mix(in srgb, #fff 76%, transparent);
}

.mini-legend {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px 18px;
    color: var(--text-secondary);
    font-size: 11px;
}

.mini-legend span {
    display: inline-flex;
    align-items: center;
    gap: 6px;
}

.swatch {
    width: 10px;
    height: 10px;
    border-radius: 3px;
    border: 1px solid var(--border);
}

.swatch.active {
    border-color: var(--element);
    background: var(--element);
}

.swatch.group {
    border-color: color-mix(in srgb, var(--element) 78%, var(--border));
    background: color-mix(in srgb, var(--element) 34%, var(--bg-card));
}

.swatch.period {
    border-color: color-mix(in srgb, var(--element) 58%, var(--border));
    background: color-mix(in srgb, var(--element) 20%, var(--bg-card));
}

.legend-hint {
    margin-left: auto;
    color: var(--text-muted);
}

@media (max-width: 760px) {
    .mini-table {
        min-width: 560px;
    }

    .mini-table-wrap {
        overflow-x: auto;
        padding-bottom: 4px;
    }

    .legend-hint {
        display: none !important;
    }
}
</style>
