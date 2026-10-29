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

        <!-- 竖直时间轴：固定高度、内部滚动，条目变多也不会把页面一直往下拉 -->
        <div v-if="entries.length" ref="viewportRef" class="timeline-viewport">
            <ol class="timeline-rail">
                <li
                    v-for="(entry, index) in entries"
                    :key="entry.id"
                    class="timeline-entry"
                    :style="{ '--step': `${entry.stepPx}px` }"
                    :class="{ first: index === 0 }"
                >
                    <span class="node" aria-hidden="true"></span>
                    <router-link :to="`${basePath}/${entry.id}`" class="entry-card">
                        <div class="entry-top">
                            <span class="entry-era">{{ entry.era }}</span>
                            <span class="entry-meta">
                                {{ entry.category }}<template v-if="entry.figure?.name"> · {{ entry.figure.name }}</template>
                            </span>
                            <span v-if="entry.simulation?.modelName" class="entry-model">模拟：{{ entry.simulation.modelName }}</span>
                        </div>
                        <h3>{{ entry.title }}</h3>
                        <p>{{ entry.hook }}</p>
                        <span class="entry-cta">读故事 →</span>
                    </router-link>
                </li>
            </ol>
        </div>
        <div v-else class="timeline-empty">
            <p>没有匹配「{{ keyword }}」的现象。</p>
            <button type="button" @click="resetFilters">清空筛选</button>
        </div>

        <p v-if="entries.length > 2" class="timeline-hint">
            共 {{ entries.length }} 篇 · 在框内上下滚动查看
        </p>
    </section>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from "vue"
import { getPhenomenaBySubject, getPhenomenaCategories } from "../content/phenomena.mjs"

const props = defineProps({
    subject: { type: String, default: "physics" },
    accent: { type: String, default: "#3b82f6" },
    kicker: { type: String, default: "01 / PHENOMENA" },
    title: { type: String, default: "这些现象，是怎么被发现的？" },
    description: {
        type: String,
        default: "按年代从上到下排列。先看故事，再看规律，最后亲手把模拟调一遍。",
    },
    basePath: { type: String, default: "/physics-lab/phenomena" },
    subjectLabel: { type: String, default: "物理" },
})

// ── 时间轴刻度 ──
// 不再按年代差缩放：卡片之间保持统一的间距，时间顺序靠排序和卡片上的年份表达，
// 避免「前 250 → 1583」这种大跨度把页面拉出几屏空白。
const ENTRY_STEP_PX = 30

const all = computed(() => getPhenomenaBySubject(props.subject))
const categories = computed(() => getPhenomenaCategories(props.subject))
const keyword = ref("")
const activeCategory = ref("全部")

const searchableText = item => [
    item.title,
    item.hook,
    item.category,
    item.figure?.name || "",
    ...(item.coFigures || []).map(figure => figure.name),
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

const entries = computed(() => visible.value.map((item, index) => ({
    ...item,
    stepPx: index === 0 ? 0 : ENTRY_STEP_PX,
})))

// ── 滚动位置记忆 ──
// 从文章页返回时有两层滚动要还原：
//   1. 页面级：路由的 scrollBehavior 负责（前提是走 history.back，才会有 savedPosition）
//   2. 时间轴内部：它是独立滚动容器，路由管不到，这里自己记一份
// 另外再存一份页面 scrollY 兜底：如果路由没恢复（比如从别的入口回来），至少能回到时间轴附近。
const SCROLL_MEMORY_TTL = 10 * 60 * 1000
const viewportRef = ref(null)
let savedInnerTop = 0
let savedPageY = 0
let savedAt = 0

onBeforeUnmount(() => {
    savedInnerTop = viewportRef.value?.scrollTop || 0
    savedPageY = window.scrollY || 0
    savedAt = Date.now()
})

onMounted(() => {
    if (Date.now() - savedAt > SCROLL_MEMORY_TTL) return
    // 等卡片渲染完成、容器有高度之后再恢复
    nextTick(() => {
        requestAnimationFrame(() => {
            if (viewportRef.value) viewportRef.value.scrollTop = savedInnerTop
            // 路由的 scrollBehavior 会在 340ms 后覆盖为它记下的位置；
            // 这里只在页面还停在顶部时兜底，避免两者打架。
            if (savedPageY > 0 && window.scrollY === 0) {
                window.scrollTo({ top: savedPageY, behavior: "auto" })
            }
        })
    })
})

function resetFilters() {
    keyword.value = ""
    activeCategory.value = "全部"
    if (viewportRef.value) viewportRef.value.scrollTop = 0
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
/* 固定高度的可视窗口：内部滚动，条目再多也不会把页面越拉越长 */
.timeline-viewport {
    position: relative;
    max-height: clamp(380px, 56vh, 620px);
    overflow-y: auto;
    overscroll-behavior-y: contain;
    padding: 6px 14px 6px 0;
    scrollbar-width: thin;
    scrollbar-color: color-mix(in srgb, var(--subject) 40%, transparent) transparent;
}

.timeline-viewport::-webkit-scrollbar {
    width: 6px;
}

.timeline-viewport::-webkit-scrollbar-track {
    background: transparent;
}

.timeline-viewport::-webkit-scrollbar-thumb {
    border-radius: 999px;
    background: color-mix(in srgb, var(--subject) 34%, transparent);
}

.timeline-viewport::-webkit-scrollbar-thumb:hover {
    background: color-mix(in srgb, var(--subject) 55%, transparent);
}

.timeline-rail {
    --rail-width: 26px;
    position: relative;
    margin: 0;
    padding: 0 0 0 var(--rail-width);
    list-style: none;
}

/* 时间轴本体：一条学科色的细竖线，轴上不写任何文字 */
.timeline-rail::before {
    content: "";
    position: absolute;
    top: 8px;
    bottom: 12px;
    left: 12px;
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
    padding-top: var(--step);
    transition: padding 0.3s var(--ease-out);
}

.timeline-entry.first {
    padding-top: 0;
}

/* 蓝色节点：贴在轴上，与卡片顶部同高 */
.node {
    position: absolute;
    top: calc(var(--step) + 22px);
    left: 8px;
    width: 9px;
    height: 9px;
    border-radius: 50%;
    background: var(--subject);
    box-shadow: 0 0 0 4px color-mix(in srgb, var(--subject) 18%, transparent);
    transform: translateY(-50%);
}

.timeline-entry.first .node {
    top: 22px;
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
    gap: 10px;
}

/* 年代写在卡片上：学科色等宽数字，作为卡片的第一个信息 */
.entry-era {
    color: var(--subject);
    font-family: var(--mono);
    font-size: 17px;
    font-weight: 800;
    font-variant-numeric: tabular-nums;
    line-height: 1;
}

.entry-meta {
    padding-left: 10px;
    border-left: 1px solid color-mix(in srgb, var(--subject) 30%, transparent);
    color: var(--text-secondary);
    font-family: var(--mono);
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.08em;
}

.entry-model {
    margin-left: auto;
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

.timeline-hint {
    margin: 12px 0 0;
    color: var(--text-muted);
    font-family: var(--mono);
    font-size: 10px;
    letter-spacing: 0.04em;
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

    .timeline-rail {
        --rail-width: 20px;
    }

    .timeline-rail::before {
        left: 8px;
    }

    .node {
        left: 4px;
    }

    .entry-era {
        font-size: 15px;
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
