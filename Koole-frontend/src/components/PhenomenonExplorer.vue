<template>
    <section class="phenomena-section">
        <header class="section-heading">
            <div>
                <small>{{ kicker }}</small>
                <h2>{{ title }}</h2>
            </div>
            <p>{{ description }}</p>
        </header>

        <!-- 搜索：按标题、钩子、正文、知识点、标签、对应模型名查 -->
        <div class="phenomena-toolbar">
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

        <!-- 时间轴：横向滚动，按年代排列 -->
        <div v-if="visible.length" class="timeline-track" role="list">
            <router-link
                v-for="item in visible"
                :key="item.id"
                :to="`${basePath}/${item.id}`"
                class="timeline-item"
                role="listitem"
            >
                <span class="item-era">{{ item.era }}</span>
                <span class="item-dot" aria-hidden="true"></span>
                <article class="item-card">
                    <small class="item-category">{{ item.category }}</small>
                    <h3>{{ item.title }}</h3>
                    <p>{{ item.hook }}</p>
                    <footer>
                        <span v-if="item.simulation?.modelName">模拟：{{ item.simulation.modelName }}</span>
                        <b>读故事 →</b>
                    </footer>
                </article>
            </router-link>
        </div>

        <div v-else class="phenomena-empty">
            <p>没有匹配「{{ keyword }}」的现象。</p>
            <button type="button" @click="resetFilters">清空筛选</button>
        </div>

        <p v-if="visible.length > 1" class="scroll-hint">← 左右滚动查看更早 / 更晚的发现 →</p>
    </section>
</template>

<script setup>
import { computed, ref } from "vue"
import { getPhenomenaBySubject, getPhenomenaCategories } from "../content/phenomena.mjs"

const props = defineProps({
    subject: { type: String, default: "physics" },
    kicker: { type: String, default: "02 / PHENOMENA" },
    title: { type: String, default: "这些现象，是怎么被发现的？" },
    description: { type: String, default: "每篇先讲发现故事，再拆开规律，最后把可调节的模拟放在你手上。可以搜索，也可以左右拖动时间轴。" },
    basePath: { type: String, default: "/physics-lab/phenomena" },
    subjectLabel: { type: String, default: "物理" },
})

const all = computed(() => getPhenomenaBySubject(props.subject))
const categories = computed(() => getPhenomenaCategories(props.subject))
const keyword = ref("")
const activeCategory = ref("全部")

// 关键词命中范围：标题、钩子、标签、故事正文、知识点、对应模型名
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

function resetFilters() {
    keyword.value = ""
    activeCategory.value = "全部"
}
</script>

<style scoped>
.phenomena-section {
    width: 100vw;
    margin-left: calc(50% - 50vw);
    padding: 88px max(24px, calc((100vw - 1180px) / 2)) 96px;
    background: color-mix(in srgb, var(--bg-card) 60%, transparent);
    border-top: 1px solid var(--border);
}

.section-heading {
    display: grid;
    grid-template-columns: minmax(0, 1.3fr) minmax(260px, 0.7fr);
    align-items: end;
    gap: 40px;
    margin-bottom: 28px;
}

.section-heading small {
    color: var(--primary);
    font-family: var(--mono);
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.12em;
}

.section-heading h2 {
    margin: 10px 0 0;
    font-size: clamp(24px, 3vw, 34px);
    line-height: 1.25;
}

.section-heading p {
    margin: 0;
    color: var(--text-secondary);
    font-size: 13px;
    line-height: 1.8;
}

/* ── 搜索与筛选 ── */
.phenomena-toolbar {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 12px 16px;
    margin-bottom: 26px;
}

.search-box {
    display: flex;
    align-items: center;
    gap: 8px;
    flex: 1 1 280px;
    max-width: 420px;
    padding: 9px 14px;
    border: 1px solid var(--border);
    border-radius: 999px;
    background: var(--bg-card);
    transition: border-color 0.2s;
}

.search-box:focus-within {
    border-color: var(--primary);
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
    border: 1px solid var(--border);
    border-radius: 999px;
    background: transparent;
    color: var(--text-secondary);
    font-family: var(--sans);
    font-size: 12px;
    cursor: pointer;
    transition: var(--transition);
}

.category-chip:hover {
    border-color: var(--primary);
    color: var(--primary);
}

.category-chip.active {
    border-color: var(--primary);
    background: var(--primary);
    color: #fff;
}

/* ── 时间轴（横向滚动） ── */
.timeline-track {
    display: grid;
    grid-auto-flow: column;
    grid-auto-columns: minmax(240px, 280px);
    gap: 18px;
    overflow-x: auto;
    overscroll-behavior-x: contain;
    scroll-snap-type: x proximity;
    padding: 4px 2px 14px;
}

.timeline-track::-webkit-scrollbar {
    height: 6px;
}

.timeline-track::-webkit-scrollbar-thumb {
    border-radius: 999px;
    background: var(--border);
}

.timeline-item {
    position: relative;
    display: grid;
    grid-template-rows: auto auto 1fr;
    gap: 8px;
    padding-top: 30px;
    scroll-snap-align: start;
    text-decoration: none;
    color: var(--text);
}

/* 每个条目顶部的一小段横线 + 圆点，拼起来就是时间轴 */
.timeline-item::before {
    content: "";
    position: absolute;
    top: 20px;
    left: 0;
    right: 0;
    height: 1px;
    background: var(--border);
}

.item-era {
    position: absolute;
    top: 0;
    left: 0;
    color: var(--text-muted);
    font-family: var(--mono);
    font-size: 12px;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
}

.item-dot {
    position: absolute;
    top: 16px;
    left: 0;
    width: 9px;
    height: 9px;
    border: 2px solid var(--bg-card);
    border-radius: 50%;
    background: var(--primary);
}

.item-card {
    display: grid;
    gap: 7px;
    height: 100%;
    padding: 18px 18px 16px;
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    background: var(--bg-card);
    transition: transform 0.25s var(--ease-out), box-shadow 0.25s var(--ease-out), border-color 0.25s;
}

.timeline-item:hover .item-card {
    transform: translateY(-3px);
    border-color: color-mix(in srgb, var(--primary) 40%, var(--border));
    box-shadow: var(--shadow-hover);
}

.item-category {
    color: var(--primary);
    font-family: var(--mono);
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 0.08em;
}

.item-card h3 {
    margin: 0;
    font-size: 16px;
    line-height: 1.45;
}

.item-card p {
    margin: 0;
    color: var(--text-secondary);
    font-size: 12.5px;
    line-height: 1.8;
}

.item-card footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    margin-top: auto;
    padding-top: 10px;
    color: var(--text-muted);
    font-size: 10px;
}

.item-card footer b {
    color: var(--primary);
    font-size: 11px;
    white-space: nowrap;
}

.phenomena-empty {
    display: grid;
    justify-items: center;
    gap: 12px;
    padding: 40px 20px;
    border: 1px dashed var(--border);
    border-radius: var(--radius-lg);
}

.phenomena-empty p {
    margin: 0;
    color: var(--text-secondary);
    font-size: 13px;
}

.phenomena-empty button {
    padding: 8px 16px;
    border: 1px solid var(--primary);
    border-radius: 999px;
    background: transparent;
    color: var(--primary);
    font-family: var(--sans);
    font-size: 12px;
    cursor: pointer;
}

.scroll-hint {
    margin: 10px 0 0;
    color: var(--text-muted);
    font-family: var(--mono);
    font-size: 10px;
}

@media (max-width: 900px) {
    .section-heading {
        grid-template-columns: 1fr;
        gap: 10px;
    }

    .phenomena-section {
        padding: 64px 20px 72px;
    }
}

@media (max-width: 640px) {
    .phenomena-toolbar {
        flex-direction: column;
        align-items: stretch;
    }

    .search-box {
        max-width: none;
    }

    .timeline-track {
        grid-auto-columns: minmax(200px, 78vw);
        gap: 12px;
    }
}
</style>
