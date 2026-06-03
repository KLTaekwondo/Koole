<template>
    <div class="dev-notes-panel" v-if="notes">
        <div class="panel-header" @click="collapsed = !collapsed">
            <div class="panel-header-left">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="16 18 22 12 16 6"/>
                    <polyline points="8 6 2 12 8 18"/>
                </svg>
                <span>开发笔记</span>
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
        <div class="panel-body" v-show="!collapsed">
            <MdPreview
                :modelValue="notes"
                :theme="theme"
                previewTheme="stackoverflow"
                codeTheme="stackoverflow"
                style="background: transparent; padding: 0"
            />
        </div>
    </div>
</template>

<script setup>
import { ref } from "vue"
import { MdPreview } from "md-editor-v3"
import "md-editor-v3/lib/preview.css"
import { theme } from "../../stores/theme.js"

defineProps({
    modelId: { type: String, default: "" },
    notes: { type: String, default: "" },
})

const collapsed = ref(false)
</script>

<style scoped>
.dev-notes-panel {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    overflow: hidden;
}

.panel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 18px;
    cursor: pointer;
    transition: background 0.2s;
}

.panel-header:hover {
    background: var(--primary-light);
}

.panel-header-left {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 15px;
    font-weight: 700;
    color: var(--primary);
}

.panel-header-left svg {
    color: var(--primary);
    opacity: 0.8;
}

.collapse-arrow {
    color: var(--primary);
    transition: transform 0.2s;
    flex-shrink: 0;
}

.collapse-arrow.collapsed {
    transform: rotate(-90deg);
}

.panel-body {
    padding: 16px 20px;
    font-size: 14px;
    line-height: 1.75;
    color: var(--text);
    border-top: 1px solid var(--border);
}

.panel-body :deep(.md-editor-preview) {
    background: transparent !important;
    padding: 0 !important;
}

.panel-body :deep(.md-editor-preview-wrapper) {
    background: transparent !important;
    padding: 0 !important;
}

.panel-body :deep(h2) {
    font-size: 17px;
    font-weight: 700;
    color: var(--text-dark);
    margin: 0 0 12px;
    padding: 0;
    border: none;
}

.panel-body :deep(h3) {
    font-size: 15px;
    font-weight: 700;
    color: var(--text-dark);
    margin: 12px 0 8px;
}

.panel-body :deep(p) {
    margin: 0 0 10px;
    line-height: 1.75;
    font-size: 14px;
}

.panel-body :deep(ul),
.panel-body :deep(ol) {
    margin: 0 0 10px;
    padding-left: 20px;
}

.panel-body :deep(li) {
    font-size: 14px;
    line-height: 1.75;
    margin-bottom: 4px;
}

.panel-body :deep(code) {
    background: var(--primary-light);
    color: var(--primary);
    padding: 1px 5px;
    border-radius: 3px;
    font-size: 13px;
    font-family: var(--font-mono);
}

.panel-body :deep(pre) {
    background: var(--bg-card-hover);
    border-radius: var(--radius);
    padding: 10px;
    overflow-x: auto;
    margin: 0 0 10px;
}

.panel-body :deep(pre code) {
    background: transparent;
    color: var(--text);
    padding: 0;
    font-size: 13px;
    line-height: 1.6;
}

/* KaTeX 公式标红 */
.panel-body :deep(.katex) {
    font-size: 1em;
    color: #e74c3c;
}

.panel-body :deep(.katex-display) {
    margin: 8px 0;
}

.panel-body :deep(.katex-display > .katex) {
    font-size: 1.05em;
}

.panel-body :deep(blockquote) {
    margin: 8px 0;
    padding: 6px 12px;
    border-left: 3px solid var(--primary);
    background: var(--primary-light);
    border-radius: 0 var(--radius) var(--radius) 0;
}

.panel-body :deep(blockquote p) {
    color: var(--text-secondary);
    font-size: 13px;
    margin: 0;
}
</style>
