<template>
    <div class="article-detail-page">
        <!-- 悬浮目录 -->
        <TableOfContents contentSelector=".article-content" />

        <!-- 左侧悬浮操作栏 -->
        <aside class="action-bar" v-if="article">
            <button class="action-bar-btn" title="喜欢" @click="handleLike">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z"/>
                    <polyline points="7 22 7 13"/>
                </svg>
                <span class="action-bar-label">喜欢</span>
            </button>
            <button class="action-bar-btn" title="收藏" @click="handleFavorite">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
                </svg>
                <span class="action-bar-label">收藏</span>
            </button>
        </aside>

        <div class="article-detail-layout">
            <div class="article-detail-container">
                <!-- 文章内容 -->
                <template v-if="article">
                    <div class="article-header">
                        <button class="back-btn" @click="goBack">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                                <line x1="19" y1="12" x2="5" y2="12"/>
                                <polyline points="12 19 5 12 12 5"/>
                            </svg>
                            返回
                        </button>

                        <!-- 标签 -->
                        <div class="article-tags" v-if="article.tags && article.tags.length > 0">
                            <span
                                v-for="(tag, idx) in article.tags"
                                :key="idx"
                                class="tag-chip"
                                :style="{ '--tag-color': tagColors[idx % tagColors.length] }"
                            >
                                {{ tag }}
                            </span>
                        </div>

                        <!-- 标题 -->
                        <h1 class="article-title">{{ article.title }}</h1>

                        <!-- 元信息 -->
                        <div class="article-meta">
                            <span class="meta-item" v-if="article.author">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                                    <circle cx="12" cy="7" r="4"/>
                                </svg>
                                {{ article.author }}
                            </span>
                            <span class="meta-item">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <circle cx="12" cy="12" r="10"/>
                                    <polyline points="12 6 12 12 16 14"/>
                                </svg>
                                {{ article.createTime }}
                            </span>
                        </div>
                    </div>

                    <!-- Markdown 内容 -->
                    <div class="article-content">
                        <MdPreview :modelValue="article.content" :theme="theme" previewTheme="stackoverflow" codeTheme="stackoverflow" />
                    </div>
                </template>

                <!-- 错误状态 -->
                <div class="error-state" v-else>
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="12" y1="8" x2="12" y2="12"/>
                        <line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                    <p>笔记不存在</p>
                    <button class="back-link" @click="goBack">返回笔记列表</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { MdPreview } from "md-editor-v3";
import "md-editor-v3/lib/style.css";
import { articles } from "../data/articles.js";
import { showToast } from "../stores/toast.js";
import { theme } from "../stores/theme.js";
import TableOfContents from "../components/TableOfContents.vue";

const route = useRoute();
const router = useRouter();

const article = ref(null);

const tagColors = [
    '#e74c3c', '#3498db', '#2ecc71', '#f39c12',
    '#9b59b6', '#1abc9c', '#e67e22', '#34495e'
];

const goBack = () => {
    router.back();
};

const handleLike = () => {
    showToast("功能开发中…", "info");
};

const handleFavorite = () => {
    showToast("功能开发中…", "info");
};

onMounted(() => {
    const id = parseInt(route.params.id);
    article.value = articles.find(a => a.id === id) || null;
});
</script>

<style scoped>
.article-detail-page {
    position: relative;
}

.article-detail-layout {
    display: flex;
    justify-content: center;
    position: relative;
}

.article-detail-container {
    width: 820px;
    max-width: 100%;
    margin: 0 auto;
    padding: 0 24px 80px;
    background: var(--bg-card);
    border-radius: 10px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04);
    flex-shrink: 0;
}

:root[data-theme="dark"] .article-detail-container {
    background: #000000;
}

/* ── Header ── */
.article-header {
    padding: 40px 0 32px;
}

.back-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 8px 16px;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    background: var(--bg-card);
    color: var(--text-secondary);
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: var(--transition);
    margin-bottom: 24px;
}

.back-btn:hover {
    border-color: var(--text-muted);
    color: var(--text);
}

/* ── Tags ── */
.article-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 16px;
}

.tag-chip {
    display: inline-flex;
    align-items: center;
    padding: 4px 12px;
    border-radius: 14px;
    font-size: 12px;
    font-weight: 600;
    color: #fff;
    background: var(--tag-color, #3498db);
    letter-spacing: 0.3px;
}

/* ── Title ── */
.article-title {
    font-size: 32px;
    font-weight: 800;
    color: var(--text-dark);
    line-height: 1.3;
    margin: 0 0 20px;
    letter-spacing: -0.5px;
}

/* ── Meta ── */
.article-meta {
    display: flex;
    align-items: center;
    gap: 24px;
    flex-wrap: wrap;
}

.meta-item {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 14px;
    color: var(--text-muted);
}

.meta-item svg {
    opacity: 0.6;
    flex-shrink: 0;
}

/* ── Content ── */
.article-content {
    border-top: 1px solid var(--border);
    padding-top: 32px;
}

/* md-editor-v3 主题覆盖 */
.article-content :deep(.md-editor-preview) {
    background: transparent;
    color: var(--text);
    font-size: 16px;
    line-height: 1.8;
}

.article-content :deep(.md-editor-preview h1),
.article-content :deep(.md-editor-preview h2),
.article-content :deep(.md-editor-preview h3),
.article-content :deep(.md-editor-preview h4) {
    color: var(--text-dark);
    margin-top: 1.5em;
    margin-bottom: 0.6em;
    font-weight: 700;
}

.article-content :deep(.md-editor-preview h1) { font-size: 1.75em; }
.article-content :deep(.md-editor-preview h2) { font-size: 1.4em; }
.article-content :deep(.md-editor-preview h3) { font-size: 1.2em; }

.article-content :deep(.md-editor-preview p) {
    margin-bottom: 1em;
}

.article-content :deep(.md-editor-preview code) {
    background: var(--bg-card-hover);
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 0.9em;
    color: #e74c3c;
}

.article-content :deep(.md-editor-preview pre) {
    background: var(--bg-card-hover);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 16px;
    overflow-x: auto;
    margin-bottom: 1em;
}

.article-content :deep(.md-editor-preview pre code) {
    background: none;
    padding: 0;
    color: inherit;
    font-size: 14px;
}

.article-content :deep(.md-editor-preview blockquote) {
    border-left: 4px solid var(--primary);
    padding: 8px 16px;
    margin: 1em 0;
    background: var(--primary-light);
    border-radius: 0 var(--radius) var(--radius) 0;
    color: var(--text-secondary);
}

.article-content :deep(.md-editor-preview img) {
    max-width: 100%;
    border-radius: var(--radius);
    margin: 1em 0;
}

.article-content :deep(.md-editor-preview a) {
    color: var(--primary);
    text-decoration: none;
}

.article-content :deep(.md-editor-preview a:hover) {
    text-decoration: underline;
}

.article-content :deep(.md-editor-preview ul),
.article-content :deep(.md-editor-preview ol) {
    padding-left: 1.5em;
    margin-bottom: 1em;
}

.article-content :deep(.md-editor-preview li) {
    margin-bottom: 0.3em;
}

.article-content :deep(.md-editor-preview table) {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 1em;
}

.article-content :deep(.md-editor-preview th),
.article-content :deep(.md-editor-preview td) {
    border: 1px solid var(--border);
    padding: 8px 12px;
    text-align: left;
}

.article-content :deep(.md-editor-preview th) {
    background: var(--bg-card-hover);
    font-weight: 600;
}

/* 修复 md-editor-v3 代码块头部 sticky 的 z-index 过高导致遮住导航栏 */
.article-content :deep(.md-editor-code .md-editor-code-head) {
    z-index: 1 !important;
}

/* ── Error ── */
.error-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 120px 0;
    color: var(--text-muted);
}

.error-state svg {
    margin-bottom: 16px;
    opacity: 0.4;
}

.error-state p {
    font-size: 16px;
    margin-bottom: 16px;
}

.back-link {
    padding: 10px 24px;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    background: var(--bg-card);
    color: var(--text-secondary);
    font-size: 14px;
    cursor: pointer;
    transition: var(--transition);
}

.back-link:hover {
    border-color: var(--primary);
    color: var(--primary);
}

/* ── 左侧悬浮操作栏 ── */
.action-bar {
    position: fixed;
    left: calc((100vw - 820px) / 2 - 100px);
    top: 50%;
    transform: translateY(-50%);
    display: flex;
    flex-direction: column;
    gap: 4px;
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    padding: 8px;
    box-shadow: 0 2px 12px rgba(0,0,0,0.08);
    z-index: 60;
}

.action-bar-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 3px;
    padding: 10px 8px;
    border: none;
    border-radius: var(--radius);
    background: transparent;
    color: var(--text-secondary);
    cursor: pointer;
    transition: var(--transition);
    min-width: 52px;
    position: relative;
}

.action-bar-btn:hover {
    background: var(--bg-card-hover);
    color: var(--primary);
}

.action-bar-label {
    font-size: 11px;
    font-weight: 600;
    line-height: 1;
}

/* ── 响应式 ── */
@media (max-width: 1200px) {
    .action-bar {
        display: none;
    }
}

@media (max-width: 640px) {
    .article-title {
        font-size: 24px;
    }

    .article-meta {
        gap: 16px;
    }

    .article-header {
        padding: 24px 0;
    }
}
</style>
