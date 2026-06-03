<template>
    <div class="page-container">
        <!-- 容器A：导航条 + 模拟区域 -->
        <div class="sim-section">
            <!-- 模型导航条 -->
            <aside class="model-nav">
                <button class="back-btn" @click="$router.push('/physics-lab')">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
                    返回
                </button>

                <!-- 筛选标签 -->
                <div class="filter-section">
                    <div class="filter-row">
                        <button
                            v-for="cat in categoryOptions"
                            :key="cat"
                            class="filter-tag"
                            :class="{ active: activeCategory === cat }"
                            @click="activeCategory = cat"
                        >{{ cat }}</button>
                    </div>
                </div>

                <nav class="model-list">
                    <router-link
                        v-for="m in filteredModels"
                        :key="m.id"
                        :to="`/physics-lab/classic/${m.id}`"
                        class="model-item"
                        :class="{ active: activeModelId === m.id }"
                    >
                        <span class="model-icon" v-html="m.icon"></span>
                        <div class="model-info">
                            <span class="model-name">{{ m.name }}</span>
                            <span class="model-desc">{{ m.desc }}</span>
                        </div>
                    </router-link>
                </nav>
            </aside>

            <!-- 模拟区域 -->
            <main class="sim-main">
                <RouterView />
            </main>
        </div>

        <!-- 容器B：学习笔记 + 开发笔记 -->
        <div class="notes-section">
            <aside class="knowledge-section">
                <ModelInfoPanel
                    :modelId="activeModelId"
                    :knowledge="activeKnowledge"
                />
            </aside>
            <aside class="dev-notes-section">
                <DevNotesPanel
                    :modelId="activeModelId"
                    :notes="activeDevNotes"
                />
            </aside>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from "vue"
import { useRoute } from "vue-router"
import { PHYSICS_MODELS, CATEGORIES } from "../../constants/physicsModels.js"
import ModelInfoPanel from "./ModelInfoPanel.vue"
import DevNotesPanel from "./DevNotesPanel.vue"

const route = useRoute()

const activeCategory = ref("全部")

const categoryOptions = ["全部", ...CATEGORIES]

const filteredModels = computed(() => {
    return PHYSICS_MODELS.filter(m => {
        if (activeCategory.value !== "全部" && m.category !== activeCategory.value) return false
        return true
    })
})

const activeModelId = computed(() => route.params.modelId)

const activeKnowledge = computed(() => {
    const model = PHYSICS_MODELS.find(m => m.id === activeModelId.value)
    return model?.knowledge || ""
})

const activeDevNotes = computed(() => {
    const model = PHYSICS_MODELS.find(m => m.id === activeModelId.value)
    return model?.devNotes || ""
})
</script>

<style scoped>
/* ── 页面容器 ── */
.page-container {
    display: flex;
    flex-direction: column;
    max-width: 1520px;
    flex-shrink: 0;
    margin: 0 auto;
    padding: 0 12px 24px;
    gap: 12px;
}

/* ── 容器A：导航 + 模拟 ── */
.sim-section {
    display: flex;
    gap: 12px;
    max-height: 800px;
    height: auto;
    flex-shrink: 0;
}

/* ── 模型导航条 ── */
.model-nav {
    width: 252px;
    flex-shrink: 0;
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

.back-btn {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 12px 14px;
    border: none;
    border-bottom: 1px solid var(--border);
    background: var(--bg-card);
    color: var(--text-secondary);
    font-size: 13px;
    font-weight: 700;
    cursor: pointer;
    transition: var(--transition);
}

.back-btn:hover {
    color: var(--primary);
    background: var(--primary-light);
}

/* ── 筛选标签 ── */
.filter-section {
    padding: 10px 12px;
    border-bottom: 1px solid var(--border);
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.filter-row {
    display: flex;
    gap: 4px;
    flex-wrap: wrap;
}

.filter-tag {
    padding: 3px 10px;
    border: 1px solid var(--border);
    border-radius: 12px;
    background: var(--bg-card);
    color: var(--text-muted);
    font-size: 11px;
    font-weight: 600;
    cursor: pointer;
    transition: var(--transition);
    white-space: nowrap;
}

.filter-tag:hover {
    border-color: var(--primary);
    color: var(--primary);
}

.filter-tag.active {
    background: var(--primary);
    border-color: var(--primary);
    color: #fff;
}

.model-list {
    flex: 1;
    overflow-y: auto;
    padding: 6px;
    display: flex;
    flex-direction: column;
    gap: 2px;
}

.model-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 12px;
    border: none;
    border-radius: var(--radius);
    background: transparent;
    color: var(--text-secondary);
    cursor: pointer;
    transition: var(--transition);
    text-align: left;
    text-decoration: none;
    width: 100%;
}

.model-item:hover {
    background: var(--bg-card-hover);
    color: var(--text);
}

.model-item.active {
    background: linear-gradient(90deg, var(--primary-light) 0%, transparent 100%);
    color: var(--primary);
    border-left: 3px solid var(--primary);
    padding-left: 9px;
}

.model-icon {
    display: flex;
    align-items: center;
    flex-shrink: 0;
    width: 22px;
    justify-content: center;
}

.model-info {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
}

.model-name {
    font-size: 13px;
    font-weight: 700;
}

.model-desc {
    font-size: 12px;
    font-weight: 500;
    color: var(--text-muted);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.model-item.active .model-desc {
    color: var(--primary);
}

/* ── 模拟区域 ── */
.sim-main {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 8px;
    min-width: 0;
    min-height: 0;
    overflow-y: auto;
    overflow-x: hidden;
}

/* ── 容器B：笔记区域 ── */
.notes-section {
    display: flex;
    gap: 12px;
    flex-shrink: 0;
}

.knowledge-section {
    flex: 1;
    min-width: 0;
}

.dev-notes-section {
    flex: 1;
    min-width: 0;
}

/* ── 响应式 ── */
@media (max-width: 768px) {
    .model-nav { display: none; }
    .page-container { padding: 0 6px; }
    .notes-section { flex-direction: column; }
}
</style>
