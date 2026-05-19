<script setup>
import { ref, onMounted } from "vue"
import { useRouter } from "vue-router"
import articleInterface from "../axios/interface/ArticleInterface.js"

const router = useRouter()
const articleApi = articleInterface()

const articles = ref([])
const loading = ref(true)

const fetchArticles = async () => {
    try {
        articles.value = await articleApi.findAll()
    } catch (e) {
        console.error("加载文章失败", e)
    } finally {
        loading.value = false
    }
}

const goToCreate = () => {
    router.push("/article/create")
}

const goToDetail = (id) => {
    router.push(`/article/${id}`)
}

onMounted(() => {
    fetchArticles()
})
</script>

<template>
    <div class="page">
        <div class="page-header">
            <h1 class="page-title">文章</h1>
            <button class="btn-primary" @click="goToCreate">+ 添加文章</button>
        </div>

        <div v-if="loading" class="loading">加载中...</div>

        <div v-else-if="articles.length === 0" class="empty">
            <p class="empty-text">还没有文章</p>
            <button class="btn-primary" @click="goToCreate">写下第一篇</button>
        </div>

        <div v-else class="list">
            <article
                v-for="article in articles"
                :key="article.articleId"
                class="card"
                @click="goToDetail(article.articleId)"
            >
                <h2 class="card-title">{{ article.title }}</h2>
                <p class="card-summary">{{ article.content }}</p>
                <div class="card-meta">
                    <span v-if="article.author" class="card-author">{{ article.author }}</span>
                    <span v-if="article.createdAt" class="card-date">{{ article.createdAt }}</span>
                </div>
            </article>
        </div>
    </div>
</template>

<style scoped>
.page {
    max-width: var(--content-width);
    margin: 0 auto;
    padding: 32px 24px;
}

.page-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 28px;
}

.page-title {
    font-size: 28px;
    font-weight: 700;
    color: var(--text);
    margin: 0;
}

.btn-primary {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 10px 22px;
    background: var(--primary);
    color: #fff;
    border: none;
    border-radius: var(--radius);
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s;
}

.btn-primary:hover {
    background: var(--primary-hover);
}

.loading {
    text-align: center;
    padding: 60px 0;
    color: var(--text-muted);
    font-size: 15px;
}

.empty {
    text-align: center;
    padding: 80px 0;
}

.empty-text {
    color: var(--text-muted);
    font-size: 16px;
    margin-bottom: 20px;
}

.list {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.card {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    padding: 24px;
    cursor: pointer;
    transition: box-shadow 0.2s, transform 0.15s;
}

.card:hover {
    box-shadow: var(--shadow-hover);
    transform: translateY(-1px);
}

.card-title {
    font-size: 18px;
    font-weight: 600;
    color: var(--text);
    margin: 0 0 10px;
    line-height: 1.4;
}

.card-summary {
    font-size: 14px;
    color: var(--text-secondary);
    line-height: 1.6;
    margin: 0 0 14px;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

.card-meta {
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 13px;
    color: var(--text-muted);
}

.card-author {
    color: var(--primary);
    font-weight: 500;
}
</style>
