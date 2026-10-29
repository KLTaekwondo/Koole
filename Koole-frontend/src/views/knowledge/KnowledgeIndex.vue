<template>
    <div class="knowledge-page">
        <header class="knowledge-header">
            <small class="eyebrow">KNOWLEDGE / 现象与发现</small>
            <h1>这些现象<br><em>是怎么被发现的？</em></h1>
            <p class="lede">
                每个现象先讲它被发现的故事，再拆开背后的规律，最后把一个可调节的模拟放在你手上——看懂之后再亲手试一次。
            </p>
            <div class="filters" role="group" aria-label="按学科筛选">
                <button
                    v-for="category in categories"
                    :key="category"
                    type="button"
                    class="filter-chip"
                    :class="{ active: activeCategory === category }"
                    @click="activeCategory = category"
                >
                    {{ category }}
                </button>
            </div>
        </header>

        <ol v-if="visiblePhenomena.length" class="timeline">
            <li v-for="item in visiblePhenomena" :key="item.id" class="timeline-row">
                <span class="timeline-era">{{ item.era }}</span>
                <span class="timeline-dot" aria-hidden="true"></span>
                <router-link :to="`/knowledge/${item.id}`" class="timeline-card">
                    <header>
                        <small>{{ item.category }}</small>
                        <h2>{{ item.title }}</h2>
                    </header>
                    <p>{{ item.hook }}</p>
                    <footer>
                        <span v-if="item.simulation?.modelName">对应模拟：{{ item.simulation.modelName }}</span>
                        <span v-else class="no-simulation">该现象还没有交互模拟</span>
                        <b>阅读全文 →</b>
                    </footer>
                </router-link>
            </li>
        </ol>

        <div v-else class="empty-state">
            <h2>这个分类下还没有内容</h2>
            <p>先看看其他分类，或者回到「全部」。</p>
            <button type="button" @click="activeCategory = '全部'">查看全部</button>
        </div>
    </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue"
import { PHENOMENA_CATEGORIES, PHENOMENA_SORTED } from "../../content/phenomena.mjs"

const categories = PHENOMENA_CATEGORIES
const activeCategory = ref("全部")

const visiblePhenomena = computed(() => (
    activeCategory.value === "全部"
        ? PHENOMENA_SORTED
        : PHENOMENA_SORTED.filter(item => item.category === activeCategory.value)
))

onMounted(() => {
    document.title = "知识小站 · Koole"
})
</script>

<style scoped>
.knowledge-page {
    width: min(1080px, calc(100% - 48px));
    margin: 0 auto;
    padding-bottom: 88px;
    color: var(--text);
}

.knowledge-header {
    display: grid;
    gap: 14px;
    padding: 44px 0 8px;
}

.eyebrow {
    color: var(--primary);
    font-family: var(--mono);
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.12em;
}

.knowledge-header h1 {
    margin: 0;
    font-size: clamp(34px, 5vw, 56px);
    line-height: 1.12;
    font-weight: 850;
}

.knowledge-header h1 em {
    font-style: normal;
    color: var(--primary);
}

.lede {
    max-width: 640px;
    margin: 0;
    color: var(--text-secondary);
    font-size: 15px;
    line-height: 1.9;
}

.filters {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 8px;
}

.filter-chip {
    padding: 7px 16px;
    border: 1px solid var(--border);
    border-radius: 999px;
    background: transparent;
    color: var(--text-secondary);
    font-family: var(--sans);
    font-size: 13px;
    cursor: pointer;
    transition: var(--transition);
}

.filter-chip:hover {
    border-color: var(--primary);
    color: var(--primary);
}

.filter-chip.active {
    border-color: var(--primary);
    background: var(--primary);
    color: #fff;
}

/* ── 时间轴 ── */
.timeline {
    position: relative;
    margin: 40px 0 0;
    padding: 0;
    list-style: none;
}

.timeline::before {
    content: "";
    position: absolute;
    top: 10px;
    bottom: 10px;
    left: 96px;
    width: 1px;
    background: var(--border);
}

.timeline-row {
    position: relative;
    display: grid;
    grid-template-columns: 80px 16px minmax(0, 1fr);
    gap: 8px;
    padding-bottom: 26px;
}

.timeline-era {
    padding-top: 4px;
    color: var(--text-muted);
    font-family: var(--mono);
    font-size: 12px;
    font-variant-numeric: tabular-nums;
    text-align: right;
}

.timeline-dot {
    justify-self: center;
    width: 11px;
    height: 11px;
    margin-top: 8px;
    border: 2px solid var(--bg-card);
    border-radius: 50%;
    background: var(--primary);
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--primary) 18%, transparent);
}

.timeline-card {
    display: grid;
    gap: 8px;
    padding: 22px 24px;
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    background: var(--bg-card);
    color: var(--text);
    text-decoration: none;
    transition: transform 0.25s var(--ease-out), box-shadow 0.25s var(--ease-out), border-color 0.25s;
}

.timeline-card:hover {
    transform: translateY(-2px);
    border-color: color-mix(in srgb, var(--primary) 40%, var(--border));
    box-shadow: var(--shadow-hover);
}

.timeline-card header small {
    color: var(--primary);
    font-family: var(--mono);
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.08em;
}

.timeline-card header h2 {
    margin: 6px 0 0;
    font-size: clamp(18px, 2.2vw, 22px);
    line-height: 1.35;
}

.timeline-card p {
    margin: 0;
    color: var(--text-secondary);
    font-size: 13px;
    line-height: 1.8;
}

.timeline-card footer {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    padding-top: 6px;
    color: var(--text-muted);
    font-size: 11px;
}

.timeline-card footer b {
    color: var(--primary);
    font-size: 12px;
}

.no-simulation {
    color: var(--text-muted);
}

.empty-state {
    margin-top: 48px;
    padding: 40px;
    border: 1px dashed var(--border);
    border-radius: var(--radius-lg);
    text-align: center;
}

.empty-state h2 {
    margin: 0 0 8px;
    font-size: 20px;
}

.empty-state p {
    margin: 0 0 18px;
    color: var(--text-secondary);
    font-size: 13px;
}

.empty-state button {
    padding: 9px 18px;
    border: 1px solid var(--primary);
    border-radius: 999px;
    background: transparent;
    color: var(--primary);
    font-family: var(--sans);
    font-size: 13px;
    cursor: pointer;
}

@media (max-width: 640px) {
    .knowledge-page {
        width: calc(100% - 28px);
    }

    .timeline {
        margin-top: 28px;
    }

    .timeline::before {
        left: 68px;
    }

    .timeline-row {
        grid-template-columns: 52px 12px minmax(0, 1fr);
        gap: 6px;
        padding-bottom: 18px;
    }

    .timeline-era {
        font-size: 10px;
    }

    .timeline-dot {
        width: 9px;
        height: 9px;
        margin-top: 10px;
    }

    .timeline-card {
        padding: 16px 16px 14px;
    }

    .timeline-card footer {
        display: grid;
        justify-content: start;
    }
}
</style>
