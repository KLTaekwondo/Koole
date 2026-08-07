<template>
    <div class="model-info-panel" v-if="knowledge">
        <div class="info-content">
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
import { MdPreview } from "md-editor-v3"
import "md-editor-v3/lib/preview.css"
import { theme } from "../../stores/theme.js"

defineProps({
    modelId: { type: String, default: "" },
    knowledge: { type: String, default: "" },
})
</script>

<style scoped>
.model-info-panel {
    min-height: 360px;
    background: var(--bg-card);
    border: 0;
    border-radius: 17px;
    overflow: hidden;
}

.info-content {
    padding: clamp(20px, 4vw, 48px);
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
