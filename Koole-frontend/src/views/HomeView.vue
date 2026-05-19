<script setup>
import { ref, onMounted } from "vue"
import { useRouter } from "vue-router"
import articleInterface from "../axios/interface/ArticleInterface.js"
import updatePostInterface from "../axios/interface/UpdatePostInterface.js"

const router = useRouter()

const articleApi = articleInterface()
const postApi = updatePostInterface()

const recentArticles = ref([])
const recentPosts = ref([])
const loading = ref(true)

onMounted(async () => {
    try {
        const [articles, posts] = await Promise.all([
            articleApi.findAll(),
            postApi.findAll(),
        ])
        recentArticles.value = articles.slice(0, 5)
        recentPosts.value = posts.slice(0, 5)
    } catch (e) {
        console.error("加载数据失败", e)
    } finally {
        loading.value = false
    }
})
</script>

<template>
    <div class="home">
        <section class="hero">
            <h1 class="hero-title">Koole</h1>
            <p class="hero-desc">学点东西，酷了！</p>
        </section>

        <section class="content">
            <div v-if="loading" class="loading">加载中...</div>

            <template v-else>
                <div class="section">
                    <div class="section-header">
                        <h2 class="section-title">最新文章</h2>
                        <router-link to="/article" class="section-more">查看全部 &rarr;</router-link>
                    </div>
                    <div v-if="recentArticles.length === 0" class="empty-section">暂无文章</div>
                    <div v-else class="card-list">
                        <div
                            v-for="article in recentArticles"
                            :key="article.articleId"
                            class="card"
                            @click="router.push(`/article/${article.articleId}`)"
                        >
                            <h3 class="card-title">{{ article.title }}</h3>
                            <p class="card-meta">
                                <span v-if="article.author">{{ article.author }}</span>
                                <span v-if="article.createdAt">{{ article.createdAt }}</span>
                            </p>
                        </div>
                        <div class="card-footer">
                            <router-link to="/article" class="section-mobile-more">查看全部文章 &rarr;</router-link>
                        </div>
                    </div>
                </div>

                <div class="section">
                    <div class="section-header">
                        <h2 class="section-title">最新更新日志</h2>
                        <router-link to="/updatepost" class="section-more">查看全部 &rarr;</router-link>
                    </div>
                    <div v-if="recentPosts.length === 0" class="empty-section">暂无更新日志</div>
                    <div v-else class="card-list">
                        <div
                            v-for="post in recentPosts"
                            :key="post.postId"
                            class="card"
                            @click="router.push(`/updatepost/${post.postId}`)"
                        >
                            <h3 class="card-title">{{ post.title }}</h3>
                            <p class="card-meta">
                                <span v-if="post.createdAt">{{ post.createdAt }}</span>
                            </p>
                        </div>
                        <div class="card-footer">
                            <router-link to="/updatepost" class="section-mobile-more">查看全部更新日志 &rarr;</router-link>
                        </div>
                    </div>
                </div>
            </template>
        </section>
    </div>
</template>

<style scoped>
.home {
    max-width: var(--content-width);
    margin: 0 auto;
    padding: 0 24px;
}

.hero {
    text-align: center;
    padding: 64px 0 48px;
}

.hero-title {
    font-size: 42px;
    font-weight: 800;
    color: var(--text);
    margin: 0 0 12px;
    letter-spacing: -1px;
}

.hero-desc {
    font-size: 18px;
    color: var(--text-secondary);
    margin: 0;
}

.loading {
    text-align: center;
    padding: 40px 0;
    color: var(--text-muted);
}

.content {
    padding-bottom: 60px;
}

.section {
    margin-bottom: 40px;
}

.section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20px;
}

.section-title {
    font-size: 20px;
    font-weight: 700;
    color: var(--text);
    margin: 0;
}

.section-more {
    font-size: 14px;
    color: var(--primary);
    font-weight: 500;
}

.section-mobile-more {
    display: none;
}

.card-footer {
    display: none;
}

.empty-section {
    text-align: center;
    padding: 32px 0;
    color: var(--text-muted);
    font-size: 14px;
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
}

.card-list {
    display: flex;
    flex-direction: column;
    gap: 1px;
    background: var(--border);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    overflow: hidden;
}

.card {
    background: var(--bg-card);
    padding: 20px 24px;
    cursor: pointer;
    transition: background 0.15s;
}

.card:hover {
    background: #f8f9ff;
}

.card-title {
    font-size: 15px;
    font-weight: 600;
    color: var(--text);
    margin: 0 0 8px;
    line-height: 1.4;
}

.card-meta {
    font-size: 13px;
    color: var(--text-muted);
    display: flex;
    gap: 12px;
}

@media (max-width: 640px) {
    .hero {
        padding: 40px 0 32px;
    }

    .hero-title {
        font-size: 32px;
    }

    .hero-desc {
        font-size: 16px;
    }

    .section-more {
        display: none;
    }

    .card-footer {
        display: block;
        background: var(--bg-card);
        padding: 14px 24px;
        text-align: center;
        border-top: 1px solid var(--border);
    }

    .section-mobile-more {
        display: inline;
        font-size: 14px;
        color: var(--primary);
        font-weight: 500;
    }
}
</style>
