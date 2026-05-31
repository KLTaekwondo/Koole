<template>
    <div class="article-view-container">
        <div class="search-wrapper">
            <SearchBar :search="search" :reset="reset"/>
        </div>

        <div class="article-card-list" v-if="ArticleSummaryList.length > 0">
            <div
                v-for="item in ArticleSummaryList"
                :key="item.id"
                class="article-card"
                @click="goDetail(item.id)"
            >
                <div class="article-card-body">
                    <!-- 标签 -->
                    <div class="article-tags" v-if="getTagNames(item.tagIds).length > 0">
                        <span
                            v-for="(tag, idx) in getTagNames(item.tagIds)"
                            :key="idx"
                            class="tag-chip"
                            :style="{ '--tag-color': tagColors[idx % tagColors.length] }"
                        >
                            {{ tag }}
                        </span>
                    </div>

                    <!-- 标题 -->
                    <h3 class="article-card-title">{{ item.title }}</h3>

                    <!-- 摘要 -->
                    <p class="article-card-summary">{{ item.summary }}</p>

                    <!-- 底部信息：作者 + 创建时间 -->
                    <div class="article-card-footer">
                        <span class="article-author" v-if="item.userName">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                                <circle cx="12" cy="7" r="4"/>
                            </svg>
                            {{ item.userName }}
                        </span>
                        <span class="article-create-time">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <circle cx="12" cy="12" r="10"/>
                                <polyline points="12 6 12 12 16 14"/>
                            </svg>
                            {{ item.createTime }}
                        </span>
                    </div>
                </div>
            </div>
        </div>

        <!-- 空状态 -->
        <div class="empty-state" v-else>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
            </svg>
            <p>{{ searchText ? '没有匹配的文章' : '暂无文章' }}</p>
        </div>
    </div>
</template>

<script setup>
import SearchBar from "../components/SearchBar.vue";
import { computed, ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { articleInterface } from "../axios/interface/ArticleInterface.js";
import { tagInterface } from "../axios/interface/TagInterface.js";

const router = useRouter();
const searchText = ref("");
const OriginalList = ref([]);
const tagMap = ref({}); // { id: name }

const tagColors = [
    '#e74c3c', '#3498db', '#2ecc71', '#f39c12',
    '#9b59b6', '#1abc9c', '#e67e22', '#34495e'
];

const ArticleSummaryList = computed(() => {
    return OriginalList.value.filter((item) => {
        return item.title.includes(searchText.value);
    });
});

const getTagNames = (tagIds) => {
    if (!tagIds || !Array.isArray(tagIds)) return [];
    return tagIds.map(id => tagMap.value[id]).filter(Boolean);
};

const search = (text) => {
    searchText.value = text;
};

const reset = () => {
    searchText.value = "";
};

const goDetail = (id) => {
    router.push({ name: "文章详情", params: { id } });
};

onMounted(async () => {
    // 并行请求文章列表和标签列表
    const [articles, tags] = await Promise.all([
        articleInterface().findAll(),
        tagInterface().getAll().catch(() => [])
    ]);
    OriginalList.value = articles;

    // 构建 tagId → tagName 映射
    const map = {};
    tags.forEach(tag => {
        map[tag.id] = tag.name;
    });
    tagMap.value = map;
});
</script>

<style scoped>
.article-view-container {
    max-width: var(--content-width);
    margin: 0 auto;
    padding: 0 24px;
}

.search-wrapper {
    display: flex;
    justify-content: center;
    margin-bottom: 32px;
}

/* ── Card List (单列) ── */
.article-card-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding-bottom: 80px;
}

.article-card {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    cursor: pointer;
    transition: var(--transition);
    box-shadow: var(--shadow);
}

.article-card:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-hover);
    border-color: var(--primary-light);
}

.article-card-body {
    padding: 24px;
    display: flex;
    flex-direction: column;
    gap: 12px;
}

/* ── Tags ── */
.article-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
}

.tag-chip {
    display: inline-flex;
    align-items: center;
    padding: 3px 10px;
    border-radius: 12px;
    font-size: 11px;
    font-weight: 600;
    color: #fff;
    background: var(--tag-color, #3498db);
    letter-spacing: 0.3px;
}

/* ── Title ── */
.article-card-title {
    font-size: 20px;
    font-weight: 700;
    color: var(--text-dark);
    line-height: 1.4;
    margin: 0;
}

.article-card:hover .article-card-title {
    color: var(--primary);
}

/* ── Summary ── */
.article-card-summary {
    font-size: 14px;
    color: var(--text-secondary);
    line-height: 1.7;
    margin: 0;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

/* ── Footer ── */
.article-card-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding-top: 12px;
    border-top: 1px solid var(--border);
}

.article-author,
.article-create-time {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: 13px;
    color: var(--text-muted);
}

.article-author svg,
.article-create-time svg {
    opacity: 0.6;
    flex-shrink: 0;
}

/* ── Empty ── */
.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 80px 0;
    color: var(--text-muted);
}

.empty-state svg {
    margin-bottom: 16px;
    opacity: 0.4;
}

.empty-state p {
    font-size: 16px;
}

/* ── Responsive ── */
@media (max-width: 640px) {
    .article-card-body {
        padding: 20px;
    }

    .article-card-title {
        font-size: 18px;
    }
}
</style>
