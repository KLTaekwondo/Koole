<script setup>
import { ref, reactive } from "vue"
import { useRouter } from "vue-router"
import { MdEditor } from "md-editor-v3"
import "md-editor-v3/lib/style.css"
import updatePostInterface from "../../axios/interface/UpdatePostInterface.js"

const router = useRouter()
const postApi = updatePostInterface()

const form = reactive({
    title: "",
    content: "",
})

const submitting = ref(false)

const handleSubmit = async () => {
    if (!form.title.trim() || !form.content.trim()) {
        alert("请填写标题和内容")
        return
    }
    submitting.value = true
    try {
        await postApi.create({ ...form })
        router.push("/updatepost")
    } catch (e) {
        console.error("创建更新日志失败", e)
        alert("创建失败，请重试")
    } finally {
        submitting.value = false
    }
}

const goBack = () => {
    router.push("/updatepost")
}
</script>

<template>
    <div class="page">
        <button class="btn-back" @click="goBack">&larr; 返回列表</button>

        <h1 class="page-title">写更新日志</h1>

        <div class="form">
            <div class="form-field">
                <label class="form-label">标题</label>
                <input
                    v-model="form.title"
                    class="form-input"
                    placeholder="输入更新日志标题..."
                />
            </div>

            <div class="form-field">
                <label class="form-label">内容</label>
                <div class="editor-wrapper">
                    <MdEditor
                        v-model="form.content"
                        language="zh-CN"
                        :toolbars="[
                            'bold', 'italic', 'underline', 'strikeThrough',
                            '-', 'title', 'quote', 'unorderedList', 'orderedList',
                            '-', 'code', 'codeRow', 'link', 'image',
                            '-', 'preview', 'pageFullscreen', 'fullscreen'
                        ]"
                        :toolbarsExclude="['save', 'github']"
                        editorId="updatepost-editor"
                        height="500px"
                    />
                </div>
            </div>

            <div class="form-actions">
                <button
                    class="btn-primary"
                    :disabled="submitting"
                    @click="handleSubmit"
                >
                    {{ submitting ? "发布中..." : "发布更新日志" }}
                </button>
                <button class="btn-secondary" @click="goBack">取消</button>
            </div>
        </div>
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
    margin-bottom: 20px;
    transition: color 0.2s;
}

.btn-back:hover {
    color: var(--primary);
}

.page-title {
    font-size: 28px;
    font-weight: 700;
    color: var(--text);
    margin: 0 0 28px;
}

.form {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.form-field {
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.form-label {
    font-size: 14px;
    font-weight: 600;
    color: var(--text);
}

.form-input {
    padding: 10px 14px;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    font-size: 15px;
    outline: none;
    transition: border-color 0.2s;
}

.form-input:focus {
    border-color: var(--primary);
}

.editor-wrapper {
    border: 1px solid var(--border);
    border-radius: var(--radius);
    overflow: hidden;
}

.form-actions {
    display: flex;
    gap: 12px;
    padding-top: 8px;
}

.btn-primary {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 10px 28px;
    background: var(--primary);
    color: #fff;
    border: none;
    border-radius: var(--radius);
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s;
}

.btn-primary:hover:not(:disabled) {
    background: var(--primary-hover);
}

.btn-primary:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.btn-secondary {
    padding: 10px 28px;
    background: #fff;
    color: var(--text-secondary);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.2s, border-color 0.2s;
}

.btn-secondary:hover {
    background: #f5f5f5;
    border-color: #ccc;
}
</style>
