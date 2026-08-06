<template>
    <div class="model-info-panel" v-if="knowledge">
        <div class="info-header" @click="collapsed = !collapsed">
            <div class="info-header-left">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
                </svg>
                <span>原理讲解</span>
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
    padding: 14px 18px;
    cursor: pointer;
    user-select: none;
    transition: background 0.2s;
}

.info-header:hover {
    background: var(--primary-light);
}

.info-header-left {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 15px;
    font-weight: 700;
    color: var(--primary);
}

.info-header-left svg {
    color: var(--primary);
    opacity: 0.8;
}

.collapse-arrow {
    transition: transform 0.2s;
    color: var(--primary);
    flex-shrink: 0;
}

.collapse-arrow.collapsed {
    transform: rotate(-90deg);
}

.info-content {
    padding: 16px 20px;
    border-top: 1px solid var(--border);
}

/* md-editor-v3 预览样式覆盖 */
.info-content :deep(.md-editor-preview) {
    font-size: 14.5px;
    line-height: 1.8;
    color: var(--text);
}

.info-content :deep(.md-editor-preview h2) {
    font-size: 17px;
    margin-top: 12px;
    margin-bottom: 6px;
    font-weight: 600;
}

.info-content :deep(.md-editor-preview h3) {
    font-size: 15px;
    margin-top: 10px;
    margin-bottom: 5px;
    font-weight: 600;
}

.info-content :deep(.md-editor-preview p) {
    margin: 4px 0;
    font-size: 14.5px;
}

.info-content :deep(.md-editor-preview ul),
.info-content :deep(.md-editor-preview ol) {
    padding-left: 18px;
    margin: 4px 0;
    font-size: 14.5px;
}

.info-content :deep(.md-editor-preview code) {
    background: var(--primary-light);
    padding: 1px 4px;
    border-radius: 3px;
    font-size: 12px;
    font-family: var(--mono);
}

.info-content :deep(.md-editor-preview pre) {
    background: var(--bg-card-hover);
    border-radius: var(--radius);
    padding: 8px 10px;
    margin: 6px 0;
}

.info-content :deep(.md-editor-preview blockquote) {
    border-left: 3px solid var(--primary);
    padding-left: 10px;
    margin: 6px 0;
    color: var(--text-secondary);
    font-size: 13.5px;
}

.info-content :deep(.md-editor-preview table) {
    width: 100%;
    border-collapse: collapse;
    margin: 5px 0;
    font-size: 13.5px;
}

.info-content :deep(.md-editor-preview th),
.info-content :deep(.md-editor-preview td) {
    border: 1px solid var(--border);
    padding: 4px 8px;
    text-align: left;
    font-size: 13.5px;
}

.info-content :deep(.md-editor-preview th) {
    background: var(--bg-card-hover);
    font-weight: 600;
}

/* KaTeX 公式标红 */
.info-content :deep(.katex) {
    font-size: 1em;
    color: #e74c3c;
}
</style>
