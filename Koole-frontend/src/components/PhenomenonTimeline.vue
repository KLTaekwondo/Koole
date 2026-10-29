<template>
    <section class="phenomenon-timeline" :style="{ '--subject': accent }">
        <header class="timeline-heading">
            <div>
                <small>{{ kicker }}</small>
                <h2>{{ title }}</h2>
            </div>
            <p>{{ description }}</p>
        </header>

        <!-- 搜索：标题 / 钩子 / 标签 / 故事正文 / 知识点 / 对应模型名 -->
        <div class="timeline-toolbar">
            <label class="search-box">
                <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5"/><line x1="16" y1="16" x2="21" y2="21"/></svg>
                <input
                    v-model.trim="keyword"
                    type="search"
                    :placeholder="`搜索${subjectLabel}现象，例如：单摆、浮力、折射、周期`"
                    aria-label="搜索现象"
                />
                <button v-if="keyword" type="button" class="search-clear" aria-label="清空搜索" @click="keyword = ''">×</button>
            </label>
            <div class="category-chips" role="group" aria-label="按分类筛选">
                <button
                    v-for="category in categories"
                    :key="category"
                    type="button"
                    class="category-chip"
                    :class="{ active: activeCategory === category }"
                    @click="activeCategory = category"
                >
                    {{ category }}
                </button>
            </div>
        </div>

        <!-- 竖直时间轴：纵向位置按年代拉开，相邻不足 50 年按 50 年算，避免几个发现挤在一起 -->
        <ol v-if="entries.length" class="timeline-rail">
            <li
                v-for="(entry, index) in entries"
                :key="entry.id"
                class="timeline-entry"
                :style="{ '--step': `${entry.stepPx}px` }"
                :class="{ first: index === 0 }"
            >
                <span v-if="entry.gapLabel" class="gap-label">{{ entry.gapLabel }}</span>
                <span class="era-label">{{ entry.era }}</span>
                <span class="node" aria-hidden="true"></span>
                <router-link :to="`${basePath}/${entry.id}`" class="entry-card">
                    <div class="entry-top">
                        <small>{{ entry.category }}</small>
                        <span v-if="entry.simulation?.modelName">模拟：{{ entry.simulation.modelName }}</span>
                    </div>
                    <h3>{{ entry.title }}</h3>
                    <p>{{ entry.hook }}</p>
                    <span class="entry-cta">读故事 →</span>
                </router-link>
            </li>
        </ol>
        <div v-else class="timeline-empty">
            <p>没有匹配「{{ keyword }}」的现象。</p>
            <button type="button" @click="resetFilters">清空筛选</button>
        </div>
    </section>
</template>

<script setup>
import { computed, ref } from "vue"
import { getPhenomenaBySubject, getPhenomenaCategories } from "../content/phenomena.mjs"

const props = defineProps({
    subject: { type: String, default: "physics" },
    accent: { type: String, default: "#3b82f6" },
    kicker: { type: String, default: "01 / PHENOMENA" },
    title: { type: String, default: "这些现象，是怎么被发现的？" },
    description: {
        type: String,
        default: "纵向时间轴按年代拉开：相邻发现不足 50 年的按 50 年计，避免挤在一起。先看故事，再看规律，最后亲手把模拟调一遍。",
    },
    basePath: { type: String, default: "/physics-lab/phenomena" },
    subjectLabel: { type: String, default: "物理" },
})

// ── 时间轴刻度 ──
// 相邻两篇的年份差小于 MIN_YEAR_STEP 时，按 MIN_YEAR_STEP 计（防止几个同年发现挤成一团）；
// 年份差超过 MAX_YEAR_STEP 时按 MAX_YEAR_STEP 计（防止「前 250 → 1583」把页面拉到几屏长），
// 并在中间标注真实跨年数。
const MIN_YEAR_STEP = 50
const MAX_YEAR_STEP = 400
const MIN_STEP_PX = 96
const MAX_STEP_PX = 260

const all = computed(() => getPhenomenaBySubject(props.subject))
const categories = computed(() => getPhenomenaCategories(props.subject))
const keyword = ref("")
const activeCategory = ref("全部")

const searchableText = item => [
    item.title,
    item.hook,
    item.category,
    ...(item.tags || []),
    ...(item.story || []).map(beat => `${beat.title} ${beat.text}`),
    item.misconception || "",
    item.knowledge || "",
    item.simulation?.modelName || "",
].join(" ").toLowerCase()

const visible = computed(() => {
    const key = keyword.value.trim().toLowerCase()
    return all.value.filter(item => {
        const categoryMatch = activeCategory.value === "全部" || item.category === activeCategory.value
        const keywordMatch = !key || searchableText(item).includes(key)
        return categoryMatch && keywordMatch
    })
})

/** 把真实年份差映射成纵向间距（px） */
function gapToPx(gapYears) {
    const clamped = Math.min(MAX_YEAR_STEP, Math.max(MIN_YEAR_STEP, gapYears))
    const ratio = (clamped - MIN_YEAR_STEP) / (MAX_YEAR_STEP - MIN_YEAR_STEP)
    return Math.round(MIN_STEP_PX + ratio * (MAX_STEP_PX - MIN_STEP_PX))
}

const entries = computed(() => visible.value.map((item, index, list) => {
    if (index === 0) return { ...item, stepPx: 0, gapLabel: "" }
    const previous = list[index - 1]
    const gapYears = (item.eraSort ?? 0) - (previous.eraSort ?? 0)
    return {
        ...item,
        stepPx: gapToPx(gapYears),
        // 年份差被压缩显示时，标出真实间隔，避免读者误判时间尺度
        gapLabel: gapYears > MAX_YEAR_STEP ? `相隔 ${gapYears} 年` : "",
    }
}))

function resetFilters() {
    keyword.value = ""
    activeCategory.value = "全部"
}
</script>

<style scoped>
/* 区块只保证透明，不铺底色、不留分割线，让底层固定 3D 场景透出来 */
.phenomenon-timeline {
    width: 100vw;
    margin-left: calc(50% - 50vw);
    padding: 76px max(24px, calc((100vw - 1180px) / 2)) 84px;
    background: transparent;
}

.timeline-heading {
    display: grid;
    grid-template-columns: minmax(0, 1.3fr) minmax(260px, 0.7fr);
    align-items: end;
    gap: 40px;
    margin-bottom: 26px;
}

.timeline-heading small {
    color: var(--subject);
    font-family: var(--mono);
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.12em;
}

.timeline-heading h2 {
    margin: 10px 0 0;
    font-size: clamp(24px, 3vw, 34px);
    line-height: 1.25;
}

.timeline-heading p {
    margin: 0;
    color: var(--text-secondary);
    font-size: 13px;
    line-height: 1.8;
}

/* ── 搜索 / 筛选 ── */
.timeline-toolbar {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 12px 16px;
    margin-bottom: 34px;
}

.search-box {
    display: flex;
    align-items: center;
    gap: 8px;
    flex: 1 1 280px;
    max-width: 420px;
    padding: 9px 14px;
    border: 0;
    border-radius: 999px;
    background: color-mix(in srgb, var(--bg-card) 55%, transparent);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--subject) 20%, transparent);
    transition: background 0.2s, box-shadow 0.2s;
}

.search-box:focus-within {
    background: color-mix(in srgb, var(--bg-card) 78%, transparent);
    box-shadow: inset 0 0 0 1.5px color-mix(in srgb, var(--subject) 60%, transparent);
}

.search-box svg {
    width: 15px;
    height: 15px;
    flex-shrink: 0;
    fill: none;
    stroke: var(--text-muted);
    stroke-width: 2;
    stroke-linecap: round;
}

.search-box input {
    flex: 1;
    min-width: 0;
    border: 0;
    background: transparent;
    color: var(--text);
    font-family: var(--sans);
    font-size: 13px;
    outline: none;
}

.search-box input::placeholder {
    color: var(--text-muted);
}

.search-clear {
    border: 0;
    background: transparent;
    color: var(--text-muted);
    font-size: 16px;
    line-height: 1;
    cursor: pointer;
}

.category-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
}

.category-chip {
    padding: 7px 14px;
    border: 0;
    border-radius: 999px;
    background: color-mix(in srgb, var(--bg-card) 45%, transparent);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--subject) 18%, transparent);
    color: var(--text-secondary);
    font-family: var(--sans);
    font-size: 12px;
    cursor: pointer;
    transition: var(--transition);
}

.category-chip:hover {
    color: var(--subject);
}

.category-chip.active {
    background: var(--subject);
    box-shadow: none;
    color: #fff;
    font-weight: 600;
}

/* ── 竖直时间轴 ── */
.timeline-rail {
    --rail-width: 104px;
    position: relative;
    margin: 0;
    padding: 0;
    list-style: none;
}

/* 时间轴本体：一条学科色的细竖线 */
.timeline-rail::before {
    content: "";
    position: absolute;
    top: 8px;
    bottom: 12px;
    left: var(--rail-width);
    width: 1px;
    background: linear-gradient(
        to bottom,
        transparent,
        color-mix(in srgb, var(--subject) 45%, transparent) 6%,
        color-mix(in srgb, var(--subject) 45%, transparent) 94%,
        transparent
    );
}

.timeline-entry {
    position: relative;
    display: grid;
    grid-template-columns: var(--rail-width) minmax(0, 1fr);
    column-gap: 22px;
    padding-top: var(--step);
    transition: padding 0.3s var(--ease-out);
}

.timeline-entry.first {
    padding-top: 0;
}

/* 年代紧贴蓝色节点左侧，和节点同高，加一层浅底保证在 3D 背景上看得清 */
.era-label {
    position: absolute;
    top: calc(var(--step) + 5px);
    right: calc(100% - var(--rail-width) + 14px);
    transform: translateY(-50%);
    padding: 2px 8px;
    border-radius: 999px;
    background: color-mix(in srgb, var(--bg-card) 72%, transparent);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    color: var(--subject);
    font-family: var(--mono);
    font-size: 12.5px;
    font-weight: 800;
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
    box-shadow: 0 2px 8px rgba(20, 28, 34, 0.06);
}

.timeline-entry.first .era-label {
    top: 10px;
}

/* 两篇之间被压缩的跨度，放在轴的左侧中点，字号更小、颜色更淡 */
.gap-label {
    position: absolute;
    top: calc(var(--step) / 2);
    right: calc(100% - var(--rail-width) + 14px);
    transform: translateY(-50%);
    color: var(--text-muted);
    font-family: var(--mono);
    font-size: 9px;
    white-space: nowrap;
}

.node {
    position: absolute;
    top: calc(var(--step) + 5px);
    left: calc(var(--rail-width) - 4px);
    width: 9px;
    height: 9px;
    border-radius: 50%;
    background: var(--subject);
    box-shadow: 0 0 0 4px color-mix(in srgb, var(--subject) 18%, transparent);
    transform: translateY(-50%);
}

.timeline-entry.first .node {
    top: 10px;
}

/* 卡片：保留一层底色作为文字依托（半透明），不描边 */
.entry-card {
    position: relative;
    display: grid;
    gap: 8px;
    padding: 20px 22px 18px;
    border: 0;
    border-radius: var(--radius-lg);
    background: color-mix(in srgb, var(--bg-card) 82%, transparent);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    box-shadow: 0 10px 26px rgba(20, 28, 34, 0.06);
    color: var(--text);
    text-decoration: none;
    transition: transform 0.25s var(--ease-out), box-shadow 0.25s var(--ease-out), background 0.25s;
}

.entry-card:hover,
.entry-card:focus-visible {
    transform: translateY(-2px);
    background: color-mix(in srgb, var(--bg-card) 92%, transparent);
    box-shadow: 0 16px 34px color-mix(in srgb, var(--subject) 18%, transparent);
}

.entry-top {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
}

.entry-top small {
    color: var(--subject);
    font-family: var(--mono);
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.08em;
}

.entry-top span {
    color: var(--text-muted);
    font-size: 10px;
}

.entry-card h3 {
    margin: 0;
    font-size: clamp(16px, 1.8vw, 19px);
    line-height: 1.45;
}

.entry-card p {
    margin: 0;
    color: var(--text-secondary);
    font-size: 13px;
    line-height: 1.8;
}

.entry-cta {
    margin-top: 2px;
    color: var(--subject);
    font-size: 12px;
    font-weight: 600;
}

.timeline-empty {
    display: grid;
    justify-items: center;
    gap: 12px;
    padding: 40px 20px;
    border-radius: var(--radius-lg);
    background: color-mix(in srgb, var(--bg-card) 60%, transparent);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
}

.timeline-empty p {
    margin: 0;
    color: var(--text-secondary);
    font-size: 13px;
}

.timeline-empty button {
    padding: 8px 16px;
    border: 0;
    border-radius: 999px;
    background: color-mix(in srgb, var(--subject) 16%, transparent);
    color: var(--subject);
    font-family: var(--sans);
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
}

@media (max-width: 900px) {
    .timeline-heading {
        grid-template-columns: 1fr;
        gap: 10px;
    }

    .phenomenon-timeline {
        padding: 60px 20px 72px;
    }
}

@media (max-width: 640px) {
    .timeline-toolbar {
        flex-direction: column;
        align-items: stretch;
    }

    .search-box {
        max-width: none;
    }

    /* 竖轴整体左移，年代标签仍紧贴节点左侧 */
    .timeline-rail {
        --rail-width: 68px;
    }

    .timeline-entry {
        column-gap: 14px;
    }

    .era-label {
        right: calc(100% - var(--rail-width) + 12px);
        font-size: 11px;
        padding: 2px 6px;
    }

    .gap-label {
        right: calc(100% - var(--rail-width) + 12px);
        font-size: 8.5px;
    }

    .entry-card {
        padding: 16px 16px 14px;
    }

    .entry-card h3 {
        font-size: 16px;
    }

    .entry-card p {
        font-size: 12.5px;
    }
}

@media (prefers-reduced-motion: reduce) {
    .timeline-entry,
    .entry-card {
        transition: none;
    }
}
</style>
