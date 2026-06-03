<template>
    <div class="update-post-view-container">
        <div class="update-post-list-container">
            <div class="header">
                更新记录
            </div>
            <div class="update-post-list">
                <div v-for="item in updatePosts" :key="item.id" class="update-post-item">
                    <div class="item-header">
                        <h1>{{ item.title }}</h1>
                    </div>
                    <div class="meta">
                        <span>创建时间：{{ item.createTime }}</span>
                    </div>
                    <MdPreview :modelValue="item.content" :theme="theme" previewTheme="stackoverflow" codeTheme="stackoverflow" />
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { MdPreview } from "md-editor-v3"
import { updatePosts } from "../data/updatePosts.js"
import { theme } from "../stores/theme.js"
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

:root[data-theme="dark"] .update-post-item {
    background: #000000;
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
    background: var(--bg-card-hover);
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
