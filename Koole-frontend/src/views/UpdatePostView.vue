<template>
    <div class="update-post-view-container">
        <div class="update-post-list-container">
            <div class="header">
                更新日志
            </div>
            <div class="update-post-list">
                <div v-for="item in UpdatePostList" :key="item.id" class="update-post-item">
                    <div class="item-header">
                        <h1>{{ item.title }}</h1>
                        <button class="edit-btn" @click="editPost(item)" v-if="isAdmin">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                            编辑
                        </button>
                        <button class="delete-btn" @click="deletePost(item)" v-if="isAdmin">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                            删除
                        </button>
                    </div>
                    <div class="meta">
                        <span>创建时间：{{ item.createTime }}</span>
                    </div>
                    <MdPreview :modelValue="item.content" />
                </div>
            </div>
        </div>
        <ConfirmDialog ref="confirmDialog" />
    </div>
</template>

<script setup>
import { MdPreview } from "md-editor-v3"
import {onMounted, ref} from "vue"
import {updatePostInterface} from "../axios/interface/UpdatePostInterface.js";
import {isAdmin} from "../stores/user.js";
import {showToast} from "../stores/toast.js";
import router from "../route/index.js";
import ConfirmDialog from "../components/ConfirmDialog.vue";

const UpdatePostList = ref([])
const confirmDialog = ref(null)

const editPost = (item) => {
    router.push(`/updateposts/edit/${item.id}`)
}

const deletePost = async (item) => {
    const confirmed = await confirmDialog.value.show(
        `确定要删除「${item.title}」吗？此操作不可撤销。`,
        "确认删除"
    )
    if (!confirmed) return

    try {
        await updatePostInterface().deleteById(item.id)
        UpdatePostList.value = UpdatePostList.value.filter(p => p.id !== item.id)
    } catch {
        // 交给 backendService 处理
    }
}

onMounted(async () => {
    UpdatePostList.value = await updatePostInterface().findAll()
})
</script>

<style scoped>
@import 'md-editor-v3/lib/style.css';

.update-post-view-container {
    max-width: var(--content-width);
    margin: 0 auto;
    padding: 0 24px;
}

.update-post-list-container {
    display: flex;
    flex-direction: column;
}

.header {
    font-size: 28px;
    font-weight: 800;
    text-align: center;
    color: var(--text-dark);
    margin-bottom: 32px;
    letter-spacing: -0.5px;
}

.header::after {
    content: '';
    display: block;
    width: 40px;
    height: 3px;
    background: var(--primary-gradient);
    border-radius: 2px;
    margin: 12px auto 0;
}

.update-post-list {
    display: flex;
    flex-direction: column;
    gap: 24px;
}

.update-post-item {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    padding: 32px;
    box-shadow: var(--shadow);
    transition: var(--transition);
}

.update-post-item:hover {
    box-shadow: var(--shadow-hover);
}

.item-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
}

.item-header h1 {
    font-size: 22px;
    font-weight: 700;
    color: var(--text-dark);
    margin-bottom: 12px;
    line-height: 1.4;
    flex: 1;
}

.edit-btn {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 6px 14px;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    background: var(--bg-card);
    color: var(--text-secondary);
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: var(--transition);
    white-space: nowrap;
    flex-shrink: 0;
    margin-top: 2px;
}

.edit-btn:hover {
    border-color: var(--primary);
    color: var(--primary);
    background: var(--primary-light);
    box-shadow: 0 2px 8px rgba(192, 57, 43, 0.15);
}

.edit-btn svg {
    opacity: 0.7;
    transition: opacity 0.2s;
}

.edit-btn:hover svg {
    opacity: 1;
}

.delete-btn {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 6px 14px;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    background: var(--bg-card);
    color: var(--text-muted);
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: var(--transition);
    white-space: nowrap;
    flex-shrink: 0;
    margin-top: 2px;
}

.delete-btn:hover {
    border-color: #e74c3c;
    color: #e74c3c;
    background: #fef2f2;
    box-shadow: 0 2px 8px rgba(231, 76, 60, 0.15);
}

.delete-btn svg {
    opacity: 0.5;
    transition: opacity 0.2s;
}

.delete-btn:hover svg {
    opacity: 1;
}

.update-post-item .meta {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 20px;
    padding-bottom: 16px;
    border-bottom: 1px solid var(--border);
}

.update-post-item .meta span {
    font-size: 13px;
    color: var(--text-muted);
}

/* md-editor-v3 overrides */
.update-post-item :deep(.md-editor) {
    border: none !important;
    box-shadow: none !important;
}

.update-post-item :deep(.md-editor-content) {
    background: transparent !important;
}

.update-post-item :deep(.md-editor-preview) {
    padding: 0 !important;
    color: var(--text-secondary);
    font-size: 15px;
    line-height: 1.8;
}

.update-post-item :deep(.md-editor-preview h1),
.update-post-item :deep(.md-editor-preview h2),
.update-post-item :deep(.md-editor-preview h3),
.update-post-item :deep(.md-editor-preview h4) {
    color: var(--text-dark);
    margin-top: 1.5em;
    margin-bottom: 0.5em;
}

.update-post-item :deep(.md-editor-preview p) {
    margin-bottom: 1em;
}

.update-post-item :deep(.md-editor-preview code) {
    background: #f0f0f0;
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 13px;
    font-family: var(--mono);
    color: var(--primary);
}

.update-post-item :deep(.md-editor-preview pre) {
    background: #1a1a2e;
    border-radius: var(--radius);
    padding: 16px;
    overflow-x: auto;
    margin: 16px 0;
}

.update-post-item :deep(.md-editor-preview pre code) {
    background: transparent;
    color: #e8e8e8;
    padding: 0;
    font-size: 13px;
}

.update-post-item :deep(.md-editor-preview blockquote) {
    border-left: 3px solid var(--primary);
    padding-left: 16px;
    margin: 16px 0;
    color: var(--text-secondary);
    font-style: italic;
}

.update-post-item :deep(.md-editor-preview ul),
.update-post-item :deep(.md-editor-preview ol) {
    padding-left: 20px;
    margin-bottom: 1em;
}

.update-post-item :deep(.md-editor-preview li) {
    margin-bottom: 4px;
}

.update-post-item :deep(.md-editor-preview a) {
    color: var(--primary);
    text-decoration: underline;
}

.update-post-item :deep(.md-editor-preview img) {
    border-radius: var(--radius);
    margin: 16px 0;
}

@media (max-width: 640px) {
    .update-post-item {
        padding: 20px;
    }

    .update-post-item h1 {
        font-size: 18px;
    }
}
</style>
