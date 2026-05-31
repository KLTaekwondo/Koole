<template>
    <div class="model-info-panel" v-if="knowledge">
        <div class="info-header" @click="collapsed = !collapsed">
            <div class="info-header-left">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
                </svg>
                <span>模型说明</span>
            </div>
            <svg
                class="collapse-arrow"
                :class="{ collapsed }"
                width="14" height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2.5"
                stroke-linecap="round"
                stroke-linejoin="round"
            >
                <polyline points="6 9 12 15 18 9"/>
            </svg>
        </div>
        <div class="info-content" v-show="!collapsed">
            <MdPreview
                :modelValue="knowledge"
                :theme="theme"
                previewTheme="stackoverflow"
                codeTheme="stackoverflow"
                :noKatex="false"
                style="background: transparent;"
            />
        </div>
    </div>
</template>

<script setup>
import { ref, computed, watch } from "vue"
import { MdPreview } from "md-editor-v3"
import "md-editor-v3/lib/preview.css"
import { theme } from "../../stores/theme.js"

const props = defineProps({
    modelId: { type: String, default: "" },
    knowledge: { type: String, default: "" },
})

const collapsed = ref(false)

// 切换模型时自动展开
watch(() => props.modelId, () => {
    collapsed.value = false
})
</script>

<style scoped>
.model-info-panel {
    flex-shrink: 0;
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    overflow: hidden;
}

.info-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 20px;
    cursor: pointer;
    user-select: none;
    transition: background 0.15s;
}

.info-header:hover {
    background: var(--bg-card-hover);
}

.info-header-left {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    font-weight: 700;
    color: var(--primary);
}

.collapse-arrow {
    transition: transform 0.2s;
    color: var(--text-muted);
}

.collapse-arrow.collapsed {
    transform: rotate(-90deg);
}

.info-content {
    padding: 0 24px 18px;
}

/* md-editor-v3 预览样式覆盖 */
.info-content :deep(.md-editor-preview) {
    font-size: 15px;
    line-height: 1.8;
    color: var(--text);
}

.info-content :deep(.md-editor-preview h2) {
    font-size: 20px;
    margin-top: 14px;
    margin-bottom: 8px;
    padding-bottom: 6px;
    border-bottom: 1px solid var(--border);
}

.info-content :deep(.md-editor-preview h3) {
    font-size: 18px;
    margin-top: 12px;
    margin-bottom: 6px;
}

.info-content :deep(.md-editor-preview p) {
    margin: 6px 0;
}

.info-content :deep(.md-editor-preview ul),
.info-content :deep(.md-editor-preview ol) {
    padding-left: 20px;
    margin: 6px 0;
}

.info-content :deep(.md-editor-preview code) {
    background: var(--primary-light);
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 13px;
    font-family: var(--mono);
}

.info-content :deep(.md-editor-preview pre) {
    background: var(--bg-card-hover);
    border-radius: var(--radius);
    padding: 12px 14px;
    margin: 8px 0;
}

.info-content :deep(.md-editor-preview blockquote) {
    border-left: 3px solid var(--primary);
    padding-left: 14px;
    margin: 8px 0;
    color: var(--text-secondary);
}

.info-content :deep(.md-editor-preview table) {
    width: 100%;
    border-collapse: collapse;
    margin: 8px 0;
    font-size: 13px;
}

.info-content :deep(.md-editor-preview th),
.info-content :deep(.md-editor-preview td) {
    border: 1px solid var(--border);
    padding: 6px 12px;
    text-align: left;
}

.info-content :deep(.md-editor-preview th) {
    background: var(--bg-card-hover);
    font-weight: 700;
}

/* KaTeX 公式样式 */
.info-content :deep(.katex) {
    font-size: 1.05em;
}
</style>
