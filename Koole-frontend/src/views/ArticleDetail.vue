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
            <button class="action-bar-btn" :class="{ active: showComments }" title="评论" @click="toggleComments">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
                <span class="action-bar-label">评论</span>
                <span class="action-bar-badge" v-if="comments.length > 0">{{ comments.length }}</span>
            </button>
        </aside>

        <div class="article-detail-layout">
            <div class="article-detail-container">
                <!-- 加载中 -->
                <div class="loading-state" v-if="loading">
                    <div class="loading-spinner"></div>
                    <p>加载中…</p>
                </div>

                <!-- 文章内容 -->
                <template v-else-if="article">
                    <div class="article-header">
                        <button class="back-btn" @click="goBack">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                                <line x1="19" y1="12" x2="5" y2="12"/>
                                <polyline points="12 19 5 12 12 5"/>
                            </svg>
                            返回
                        </button>

                        <!-- 标签 -->
                        <div class="article-tags" v-if="getTagNames(article.tagIds).length > 0">
                            <span
                                v-for="(tag, idx) in getTagNames(article.tagIds)"
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
                            <span class="meta-item" v-if="article.userName">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                                    <circle cx="12" cy="7" r="4"/>
                                </svg>
                                {{ article.userName }}
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
                        <MdPreview :modelValue="article.content" :theme="'light'" />
                    </div>
                </template>

                <!-- 错误状态 -->
                <div class="error-state" v-else>
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="12" y1="8" x2="12" y2="12"/>
                        <line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                    <p>文章不存在或加载失败</p>
                    <button class="back-link" @click="goBack">返回文章列表</button>
                </div>
            </div>

            <!-- 评论弹出面板 -->
            <aside class="comment-panel" v-if="showComments && article">
                <div class="comment-panel-header">
                    <h3>评论 ({{ comments.length }})</h3>
                    <button class="close-btn" @click="showComments = false">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"/>
                            <line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                    </button>
                </div>

                <div class="comment-list" ref="commentListRef">
                    <div v-if="comments.length === 0" class="comment-empty">
                        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                        </svg>
                        <p>暂无评论，来写第一条吧</p>
                    </div>
                    <div v-else v-for="comment in comments" :key="comment.id" class="comment-item">
                        <div class="comment-avatar">{{ comment.username?.charAt(0).toUpperCase() || '?' }}</div>
                        <div class="comment-body">
                            <div class="comment-meta">
                                <span class="comment-author">{{ comment.username || '匿名' }}</span>
                                <span class="comment-time">{{ comment.createTime }}</span>
                            </div>
                            <p class="comment-text">{{ comment.content }}</p>
                        </div>
                    </div>
                </div>

                <div class="comment-input-area">
                    <textarea
                        v-model="commentText"
                        placeholder="写下你的评论…"
                        rows="3"
                        :disabled="submitting"
                        @keydown.ctrl.enter="submitComment"
                    ></textarea>
                    <div class="comment-input-footer">
                        <span class="comment-hint">Ctrl + Enter 发送</span>
                        <button class="submit-comment-btn" @click="submitComment" :disabled="!commentText.trim() || submitting">
                            {{ submitting ? '发送中…' : '发送评论' }}
                        </button>
                    </div>
                </div>
            </aside>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from "vue";
import { useRoute, useRouter } from "vue-router";
import { MdPreview } from "md-editor-v3";
import "md-editor-v3/lib/style.css";
import { articleInterface } from "../axios/interface/ArticleInterface.js";
import { tagInterface } from "../axios/interface/TagInterface.js";
import { commentInterface } from "../axios/interface/CommentInterface.js";
import { currentUser } from "../stores/user.js";
import { showToast } from "../stores/toast.js";
import TableOfContents from "../components/TableOfContents.vue";

const route = useRoute();
const router = useRouter();

const article = ref(null);
const loading = ref(true);
const tagMap = ref({});

// 评论状态
const showComments = ref(false);
const comments = ref([]);
const commentText = ref("");
const submitting = ref(false);
const commentListRef = ref(null);

const tagColors = [
    '#e74c3c', '#3498db', '#2ecc71', '#f39c12',
    '#9b59b6', '#1abc9c', '#e67e22', '#34495e'
];

const getTagNames = (tagIds) => {
    if (!tagIds || !Array.isArray(tagIds)) return [];
    return tagIds.map(id => tagMap.value[id]).filter(Boolean);
};

const goBack = () => {
    router.back();
};

// 喜欢 / 收藏（暂不实现）
const handleLike = () => {
    showToast("功能开发中…", "info");
};

const handleFavorite = () => {
    showToast("功能开发中…", "info");
};

// 切换评论面板
const toggleComments = () => {
    showComments.value = !showComments.value;
};

// 加载评论
const loadComments = async () => {
    const id = route.params.id;
    if (!id) return;
    try {
        comments.value = await commentInterface().getAllByArticleId(id);
    } catch {
        comments.value = [];
    }
};

// 提交评论
const submitComment = async () => {
    const text = commentText.value.trim();
    if (!text) return;

    if (!currentUser.value) {
        showToast("请先登录后再评论", "warning");
        router.push("/auth");
        return;
    }

    submitting.value = true;
    try {
        await commentInterface().create(route.params.id, { content: text });
        commentText.value = "";
        // 重新加载评论列表
        await loadComments();
        // 滚动到最新评论
        await nextTick();
        if (commentListRef.value) {
            commentListRef.value.scrollTop = commentListRef.value.scrollHeight;
        }
    } catch {
        // 错误已在拦截器中处理
    } finally {
        submitting.value = false;
    }
};

onMounted(async () => {
    const id = route.params.id;
    if (!id) {
        loading.value = false;
        return;
    }

    // 并行请求文章详情和标签列表
    const [data, tags] = await Promise.all([
        articleInterface().findById(id).catch(() => null),
        tagInterface().getAll().catch(() => [])
    ]);

    // 构建 tagId → tagName 映射
    const map = {};
    tags.forEach(tag => {
        map[tag.id] = tag.name;
    });
    tagMap.value = map;

    article.value = data;
    loading.value = false;

    // 预加载评论
    loadComments();
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
    background: white;
    border-radius: 10px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04);
    flex-shrink: 0;
}

/* ── Loading ── */
.loading-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 120px 0;
    color: var(--text-muted);
}

.loading-spinner {
    width: 36px;
    height: 36px;
    border: 3px solid var(--border);
    border-top-color: var(--primary);
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
    margin-bottom: 16px;
}

@keyframes spin {
    to { transform: rotate(360deg); }
}

.loading-state p {
    font-size: 15px;
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
    background: #f5f5f5;
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 0.9em;
    color: #e74c3c;
}

.article-content :deep(.md-editor-preview pre) {
    background: #f8f9fa;
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
    background: #f8f9fa;
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

/* ── Responsive ── */
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

.action-bar-btn.active {
    background: var(--primary-light);
    color: var(--primary);
}

.action-bar-label {
    font-size: 11px;
    font-weight: 600;
    line-height: 1;
}

.action-bar-badge {
    position: absolute;
    top: 4px;
    right: 4px;
    min-width: 16px;
    height: 16px;
    padding: 0 4px;
    border-radius: 8px;
    background: var(--primary);
    color: #fff;
    font-size: 10px;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
}

/* ── 评论弹出面板 ── */
.comment-panel {
    position: fixed;
    top: calc(var(--nav-height) + 32px);
    right: calc((100vw - 820px) / 2 - 420px);
    width: 400px;
    height: calc(100vh - var(--nav-height) - 80px);
    background: var(--bg-card);
    border: 1px solid rgb(179 179 179 / 0.31);
    border-radius: 8px;
    z-index: 60;
    display: flex;
    flex-direction: column;
    box-shadow: 0 8px 30px rgba(0,0,0,0.12);
    animation: panelSlideIn 0.25s var(--ease-out);
}

@keyframes panelSlideIn {
    from {
        opacity: 0;
        transform: translateX(20px);
    }
    to {
        opacity: 1;
        transform: translateX(0);
    }
}

.comment-panel.open {
    right: 0;
}

.comment-panel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px 24px;
    border-bottom: 1px solid var(--border);
    flex-shrink: 0;
}

.comment-panel-header h3 {
    font-size: 18px;
    font-weight: 700;
    color: var(--text-dark);
}

.close-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border: 1px solid var(--border);
    border-radius: 50%;
    background: transparent;
    color: var(--text-muted);
    cursor: pointer;
    transition: var(--transition);
}

.close-btn:hover {
    border-color: var(--text-muted);
    color: var(--text);
    background: var(--bg-card-hover);
}

/* 评论列表 */
.comment-list {
    flex: 1;
    overflow-y: auto;
    padding: 16px 24px;
}

.comment-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px 0;
    color: var(--text-muted);
}

.comment-empty svg {
    margin-bottom: 12px;
    opacity: 0.4;
}

.comment-empty p {
    font-size: 14px;
}

.comment-item {
    display: flex;
    gap: 12px;
    padding: 16px 0;
    border-bottom: 1px solid var(--border-light);
}

.comment-item:last-child {
    border-bottom: none;
}

.comment-avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: var(--primary-gradient);
    color: #fff;
    font-size: 14px;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}

.comment-body {
    flex: 1;
    min-width: 0;
}

.comment-meta {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 4px;
}

.comment-author {
    font-size: 14px;
    font-weight: 600;
    color: var(--text-dark);
}

.comment-time {
    font-size: 12px;
    color: var(--text-muted);
}

.comment-text {
    font-size: 14px;
    color: var(--text-secondary);
    line-height: 1.6;
    word-wrap: break-word;
}

/* 评论输入 */
.comment-input-area {
    border-top: 1px solid var(--border);
    padding: 16px 24px;
    flex-shrink: 0;
    background: var(--bg);
    border-radius: 8px;
}

.comment-input-area textarea {
    width: 100%;
    padding: 12px 16px;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    background: var(--bg-card);
    color: var(--text-dark);
    font-size: 14px;
    font-family: inherit;
    resize: none;
    outline: none;
    transition: var(--transition);
}

.comment-input-area textarea:focus {
    border-color: var(--primary);
    box-shadow: 0 0 0 3px var(--primary-light);
}

.comment-input-area textarea::placeholder {
    color: var(--text-muted);
}

.comment-input-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 10px;
    border-radius: 8px;
}

.comment-hint {
    font-size: 12px;
    color: var(--text-muted);
}

.submit-comment-btn {
    padding: 8px 20px;
    border: none;
    border-radius: var(--radius);
    background: var(--primary-gradient);
    color: #fff;
    font-size: 13px;
    font-weight: 700;
    cursor: pointer;
    transition: var(--transition);
}

.submit-comment-btn:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(192, 57, 43, 0.3);
}

.submit-comment-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
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

    .comment-panel {
        width: 100%;
    }
}
</style>
