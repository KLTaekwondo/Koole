<template>
    <div class="editor-container">
        <div class="editor-header">
            <div class="editor-title-row">
                <button class="back-btn" @click="goBack">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
                    返回
                </button>
                <h2>{{ isEdit ? '编辑文章' : '编写文章' }}</h2>
                <div class="header-actions">
                    <button class="save-btn" @click="save" :disabled="saving">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
                        {{ saving ? '保存中…' : '保存' }}
                    </button>
                </div>
            </div>
        </div>

        <div class="editor-body">
            <div class="editor-form">
                <input
                    v-model="title"
                    class="title-input"
                    placeholder="输入文章标题…"
                    type="text"
                />
                <div class="tag-selector">
                    <span class="tag-label">标签</span>
                    <div class="tag-list">
                        <button
                            v-for="tag in allTags"
                            :key="tag.id"
                            class="tag-chip"
                            :class="{ active: selectedTagIds.includes(tag.id) }"
                            @click="toggleTag(tag.id)"
                        >
                            {{ tag.name }}
                        </button>
                        <span v-if="allTags.length === 0" class="tag-empty">暂无标签</span>
                    </div>
                </div>
                <div id="vditor-article" class="vditor-wrapper"></div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick } from "vue"
import { useRoute, useRouter } from "vue-router"
import Vditor from "vditor"
import "vditor/dist/index.css"
import {articleInterface} from "../axios/interface/ArticleInterface.js"
import {tagInterface} from "../axios/interface/TagInterface.js"
import {checkLogin, currentUser} from "../stores/user.js";
import {showToast} from "../stores/toast.js";

const route = useRoute()
const router = useRouter()
const isEdit = ref(false)
const articleId = ref(null)
const title = ref("")
const saving = ref(false)
const allTags = ref([])
const selectedTagIds = ref([])
let vditor = null

const toggleTag = (id) => {
    const idx = selectedTagIds.value.indexOf(id)
    if (idx === -1) {
        selectedTagIds.value.push(id)
    } else {
        selectedTagIds.value.splice(idx, 1)
    }
}

onMounted(async () => {
    await nextTick()
    // 先检查登录状态
    await checkLogin()

    // 检查用户是否登录
    if (!currentUser.value) {
        router.push("/auth")
        showToast("请先登录", "warning")
        return
    }

    // 加载标签列表（失败不影响编辑器）
    try {
        allTags.value = await tagInterface().getAll()
    } catch {
        // 标签加载失败不阻塞编辑器
    }

    // 检查是否是编辑模式
    if (route.params.id) {
        isEdit.value = true
        articleId.value = route.params.id
    }

    vditor = new Vditor("vditor-article", {
        height: 500,
        minHeight: 400,
        placeholder: "开始编写文章内容…",
        toolbarConfig: {
            pin: true,
        },
        cache: {
            enable: false,
        },
        mode: "ir",
        preview: {
            theme: {
                current: "light",
            },
        },
        after: () => {
            if (isEdit.value) {
                loadArticle()
            }
        },
    })
})

onBeforeUnmount(() => {
    if (vditor) {
        vditor.destroy()
    }
})

const loadArticle = async () => {
    try {
        const data = await articleInterface().findById(articleId.value)
        if (data) {
            title.value = data.title || ""
            selectedTagIds.value = data.tagIds || []
            if (vditor) {
                vditor.setValue(data.content || "")
            }
        }
    } catch (e) {
        // 加载失败由全局拦截器处理
    }
}

const save = async () => {
    const content = vditor ? vditor.getValue() : ""
    console.log(content)
    if (!title.value.trim()) {
        showToast("请输入标题", "warning")
        return
    }
    if (!content.trim()) {
        showToast("请输入内容", "warning")
        return
    }
    if (!selectedTagIds.value.length) {
        showToast("请选择标签", "warning")
        return
    }

    saving.value = true
    try {
        const payload = {
            title: title.value,
            content: content,
            tagIds: selectedTagIds.value,
        }

        if (isEdit.value) {
            await articleInterface().update(articleId.value, payload)
        } else {
            await articleInterface().create(payload)
        }

        router.back()
    } catch (e) {
        // 保存失败由全局拦截器处理
    } finally {
        saving.value = false
    }
}

const goBack = () => {
    router.back()
}
</script>

<style scoped>
.editor-container {
    max-width: 960px;
    margin: 0 auto;
    padding: 0 24px;
    box-shadow: 0 0 12px rgba(0, 0, 0, 0.1);
    border-radius: 8px;
}

.editor-header {
    position: sticky;
    top: var(--nav-height);
    z-index: 50;
    background: var(--bg);
    padding: 16px 0;
    border-bottom: 1px solid var(--border);
    margin-bottom: 24px;
}

.editor-title-row {
    display: flex;
    align-items: center;
    gap: 16px;
}

.editor-title-row h2 {
    font-size: 20px;
    font-weight: 700;
    color: var(--text-dark);
    flex: 1;
}

.back-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 8px 16px;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    background: var(--bg-card);
    color: var(--text-secondary);
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: var(--transition);
}

.back-btn:hover {
    border-color: var(--text-muted);
    color: var(--text);
}

.save-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 10px 24px;
    border: none;
    border-radius: var(--radius);
    background: var(--primary-gradient);
    color: #fff;
    font-size: 14px;
    font-weight: 700;
    cursor: pointer;
    transition: var(--transition);
    box-shadow: 0 4px 12px rgba(192, 57, 43, 0.3);
}

.save-btn:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 6px 16px rgba(192, 57, 43, 0.4);
}

.save-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.editor-body {
    padding-bottom: 80px;
}

.editor-form {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.title-input {
    width: 100%;
    padding: 16px 20px;
    font-size: 24px;
    font-weight: 700;
    color: var(--text-dark);
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    outline: none;
    transition: var(--transition);
}

.title-input::placeholder {
    color: var(--text-muted);
    font-weight: 500;
}

.title-input:focus {
    border-color: var(--primary);
    box-shadow: 0 0 0 3px var(--primary-light);
}

.tag-selector {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    background: var(--primary-light);
    border: 1px solid var(--primary);
    border-radius: var(--radius-lg);
    padding: 14px 20px;
}

.tag-label {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    font-weight: 700;
    color: var(--primary);
    white-space: nowrap;
    padding: 6px 12px;
    min-width: auto;
    background: #fff;
    border-radius: 6px;
    box-shadow: 0 1px 3px rgba(192, 57, 43, 0.15);
}

.tag-list {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    flex: 1;
}

.tag-chip {
    display: inline-flex;
    align-items: center;
    padding: 6px 14px;
    border: 1px solid var(--border);
    border-radius: 20px;
    background: var(--bg-card);
    color: var(--text-secondary);
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: var(--transition);
}

.tag-chip:hover {
    border-color: var(--primary);
    color: var(--primary);
    background: var(--primary-light);
}

.tag-chip.active {
    border-color: var(--primary);
    color: #fff;
    background: var(--primary-gradient);
    font-weight: 600;
}

.tag-empty {
    font-size: 13px;
    color: var(--text-muted);
    padding-top: 8px;
}

.vditor-wrapper {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    overflow: hidden;
}

/* Vditor overrides */
.vditor-wrapper :deep(.vditor) {
    border: none !important;
    border-radius: 0 !important;
}

.vditor-wrapper :deep(.vditor-toolbar) {
    border-top: none !important;
    border-left: none !important;
    border-right: none !important;
    background: var(--bg-card) !important;
}

.vditor-wrapper :deep(.vditor-ir) {
    background: var(--bg-card) !important;
}

@media (max-width: 640px) {
    .editor-title-row h2 {
        font-size: 16px;
    }

    .title-input {
        font-size: 20px;
        padding: 12px 16px;
    }

    .save-btn {
        padding: 8px 16px;
        font-size: 13px;
    }
}
</style>
