<script setup>
import { ref, onMounted } from "vue"
import { useRouter, useRoute } from "vue-router"
import { MdPreview } from "md-editor-v3"
import "md-editor-v3/lib/preview.css"
import updatePostInterface from "../../axios/interface/UpdatePostInterface.js"

const router = useRouter()
const route = useRoute()
const postApi = updatePostInterface()

const post = ref(null)
const loading = ref(true)

const fetchPost = async () => {
    try {
        const result = await postApi.findById(route.params.id)
        post.value = result
    } catch (e) {
        console.error("加载更新日志失败", e)
    } finally {
        loading.value = false
    }
}

const goBack = () => {
    router.push("/updatepost")
}

onMounted(() => {
    fetchPost()
})
</script>

<template>
    <div class="page">
        <button class="btn-back" @click="goBack">&larr; 返回列表</button>

        <div v-if="loading" class="loading">加载中...</div>

        <div v-else-if="!post" class="empty">
            <p>更新日志不存在或已被删除</p>
            <button class="btn-back" @click="goBack">返回列表</button>
        </div>

        <template v-else>
            <article class="post">
                <header class="post-header">
                    <h1 class="post-title">{{ post.title }}</h1>
                    <div class="post-meta">
                        <span v-if="post.createdAt" class="post-date">{{ post.createdAt }}</span>
                    </div>
                </header>

                <div class="post-content">
                    <MdPreview
                        :modelValue="post.content || ''"
                        language="zh-CN"
                        editorId="updatepost-preview"
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

.post {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    padding: 40px;
}

.post-header {
    margin-bottom: 36px;
    padding-bottom: 24px;
    border-bottom: 1px solid var(--border);
}

.post-title {
    font-size: 30px;
    font-weight: 700;
    color: var(--text);
    line-height: 1.3;
    margin: 0 0 16px;
}

.post-meta {
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 14px;
    color: var(--text-muted);
}

.post-content {
    font-size: 16px;
    line-height: 1.8;
    color: var(--text);
}

.post-content :deep(h1),
.post-content :deep(h2),
.post-content :deep(h3) {
    margin-top: 28px;
    margin-bottom: 12px;
    color: var(--text);
}

.post-content :deep(p) {
    margin-bottom: 16px;
}

.post-content :deep(code) {
    font-size: 14px;
    padding: 2px 6px;
    background: #f0f0f0;
    border-radius: 4px;
}

.post-content :deep(pre) {
    background: #f6f8fa;
    border-radius: var(--radius);
    padding: 16px 20px;
    overflow-x: auto;
    margin-bottom: 16px;
}

.post-content :deep(pre code) {
    background: none;
    padding: 0;
}

.post-content :deep(blockquote) {
    margin: 16px 0;
    padding: 12px 20px;
    border-left: 4px solid var(--primary);
    background: #f8f9ff;
    color: var(--text-secondary);
}

.post-content :deep(img) {
    max-width: 100%;
    border-radius: var(--radius);
    margin: 16px 0;
}

.post-content :deep(ul),
.post-content :deep(ol) {
    margin: 12px 0;
    padding-left: 24px;
}

.post-content :deep(li) {
    margin-bottom: 6px;
}

.post-content :deep(a) {
    color: var(--primary);
}

.post-content :deep(table) {
    width: 100%;
    border-collapse: collapse;
    margin: 16px 0;
}

.post-content :deep(th),
.post-content :deep(td) {
    padding: 10px 14px;
    border: 1px solid var(--border);
    text-align: left;
}

.post-content :deep(th) {
    background: #f8f9fa;
    font-weight: 600;
}

.post-content :deep(hr) {
    border: none;
    border-top: 1px solid var(--border);
    margin: 24px 0;
}
</style>
