<script setup>
import { ref, onMounted } from "vue"
import { useRouter, useRoute } from "vue-router"
import { MdPreview } from "md-editor-v3"
import "md-editor-v3/lib/preview.css"
import articleInterface from "../../axios/interface/ArticleInterface.js"

const router = useRouter()
const route = useRoute()
const articleApi = articleInterface()

const article = ref(null)
const loading = ref(true)

const fetchArticle = async () => {
    try {
        const result = await articleApi.findById(route.params.id)
        article.value = result
    } catch (e) {
        console.error("加载文章失败", e)
    } finally {
        loading.value = false
    }
}

const goBack = () => {
    router.push("/article")
}

onMounted(() => {
    fetchArticle()
})
</script>

<template>
    <div class="page">
        <button class="btn-back" @click="goBack">&larr; 返回列表</button>

        <div v-if="loading" class="loading">加载中...</div>

        <div v-else-if="!article" class="empty">
            <p>文章不存在或已被删除</p>
            <button class="btn-back" @click="goBack">返回列表</button>
        </div>

        <template v-else>
            <article class="article">
                <header class="article-header">
                    <h1 class="article-title">{{ article.title }}</h1>
                    <div class="article-meta">
                        <span v-if="article.author" class="article-author">{{ article.author }}</span>
                        <span v-if="article.createdAt" class="article-date">{{ article.createdAt }}</span>
                    </div>
                </header>

                <div class="article-content">
                    <MdPreview
                        :modelValue="article.content || ''"
                        language="zh-CN"
                        editorId="article-preview"
                    />
                </div>
            </article>
        </template>
    </div>
</template>

<style scoped>
.page {
    max-width: var(--content-width);
    margin: 0 auto;
    padding: 32px 24px;
}

.btn-back {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 6px 0;
    background: none;
    border: none;
    color: var(--text-secondary);
    font-size: 14px;
    cursor: pointer;
    margin-bottom: 24px;
    transition: color 0.2s;
}

.btn-back:hover {
    color: var(--primary);
}

.loading {
    text-align: center;
    padding: 60px 0;
    color: var(--text-muted);
    font-size: 15px;
}

.empty {
    text-align: center;
    padding: 60px 0;
    color: var(--text-muted);
}

.article {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    padding: 40px;
}

.article-header {
    margin-bottom: 36px;
    padding-bottom: 24px;
    border-bottom: 1px solid var(--border);
}

.article-title {
    font-size: 30px;
    font-weight: 700;
    color: var(--text);
    line-height: 1.3;
    margin: 0 0 16px;
}

.article-meta {
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 14px;
    color: var(--text-muted);
}

.article-author {
    color: var(--primary);
    font-weight: 500;
}

.article-content {
    font-size: 16px;
    line-height: 1.8;
    color: var(--text);
}

.article-content :deep(h1),
.article-content :deep(h2),
.article-content :deep(h3) {
    margin-top: 28px;
    margin-bottom: 12px;
    color: var(--text);
}

.article-content :deep(p) {
    margin-bottom: 16px;
}

.article-content :deep(code) {
    font-size: 14px;
    padding: 2px 6px;
    background: #f0f0f0;
    border-radius: 4px;
}

.article-content :deep(pre) {
    background: #f6f8fa;
    border-radius: var(--radius);
    padding: 16px 20px;
    overflow-x: auto;
    margin-bottom: 16px;
}

.article-content :deep(pre code) {
    background: none;
    padding: 0;
}

.article-content :deep(blockquote) {
    margin: 16px 0;
    padding: 12px 20px;
    border-left: 4px solid var(--primary);
    background: #f8f9ff;
    color: var(--text-secondary);
}

.article-content :deep(img) {
    max-width: 100%;
    border-radius: var(--radius);
    margin: 16px 0;
}

.article-content :deep(ul),
.article-content :deep(ol) {
    margin: 12px 0;
    padding-left: 24px;
}

.article-content :deep(li) {
    margin-bottom: 6px;
}

.article-content :deep(a) {
    color: var(--primary);
}

.article-content :deep(table) {
    width: 100%;
    border-collapse: collapse;
    margin: 16px 0;
}

.article-content :deep(th),
.article-content :deep(td) {
    padding: 10px 14px;
    border: 1px solid var(--border);
    text-align: left;
}

.article-content :deep(th) {
    background: #f8f9fa;
    font-weight: 600;
}

.article-content :deep(hr) {
    border: none;
    border-top: 1px solid var(--border);
    margin: 24px 0;
}
</style>
