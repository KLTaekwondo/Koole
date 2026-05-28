<template>
    <div class="editor-container">
        <div class="editor-header">
            <div class="editor-title-row">
                <button class="back-btn" @click="goBack">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
                    返回
                </button>
                <h2>{{ isEdit ? '编辑更新日志' : '编写更新日志' }}</h2>
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
                    placeholder="输入标题…"
                    type="text"
                />
                <div id="vditor-updatepost" class="vditor-wrapper"></div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick } from "vue"
import { useRoute, useRouter } from "vue-router"
import Vditor from "vditor"
import "vditor/dist/index.css"
import { updatePostInterface } from "../axios/interface/UpdatePostInterface.js"
import { currentUser, isAdmin } from "../stores/user.js";
import {showToast} from "../stores/toast.js";

const route = useRoute()
const router = useRouter()
const isEdit = ref(false)
const postId = ref(null)
const title = ref("")
const saving = ref(false)


let vditor = null

onMounted(async () => {
    // 等待 DOM 渲染完成
    await nextTick()

    // 检查用户是否登录
    if (!currentUser.value) {
        router.push("/auth")
        showToast("请先登录", "warning")
        return
    }else if (!isAdmin.value) {
        router.push("/")
        showToast("您没有权限访问该页面", "warning")
        return
    }

    // 初始化 Vditor
    vditor = new Vditor("vditor-updatepost", {
        height: 500,
        minHeight: 400,
        placeholder: "开始编写内容…",
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
            // 如果是编辑模式，加载已有内容
            if (isEdit.value) {
                loadPost()
            }
        },
    })

    // 检查是否是编辑模式
    if (route.params.id) {
        isEdit.value = true
        postId.value = route.params.id
        // 异步加载时 vditor 可能还未初始化完成
    }
})

onBeforeUnmount(() => {
    if (vditor) {
        vditor.destroy()
    }
})

const loadPost = async () => {
    try {
        const data = await updatePostInterface().findById(postId.value)
        if (data) {
            title.value = data.title || ""
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
    if (!title.value.trim()) {
        showToast("请输入标题", "warning")
        return
    }
    if (!content.trim()) {
        showToast("请输入内容", "warning")
        return
    }

    saving.value = true
    try {
        const payload = {
            title: title.value,
            content,
        }

        if (isEdit.value) {
            await updatePostInterface().update(postId.value, payload)
        } else {
            await updatePostInterface().create(payload)
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
    gap: 20px;
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
