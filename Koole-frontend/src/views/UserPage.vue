<template>
    <div class="user-page">
        <!-- 左侧悬浮导航 -->
        <aside class="user-sidebar">
            <div class="sidebar-inner">
                <!-- 头像区域 -->
                <div class="user-avatar-section">
                    <div class="avatar-placeholder">
                        {{ userInitial }}
                    </div>
                    <div class="user-display-name">{{ currentUser.username }}</div>
                    <span class="user-role-badge" :class="currentUser.role?.toLowerCase()">
                        {{ currentUser.role === 'ADMIN' ? '管理员' : '用户' }}
                    </span>
                </div>

                <!-- 分割线 -->
                <div class="sidebar-divider"></div>

                <!-- 导航列表 -->
                <nav class="sidebar-nav">
                    <button
                        v-for="item in navItems"
                        :key="item.key"
                        class="nav-item"
                        :class="{ active: activeTab === item.key }"
                        @click="activeTab = item.key"
                    >
                        <span class="nav-icon" v-html="item.icon"></span>
                        <span class="nav-label">{{ item.label }}</span>
                    </button>
                </nav>

                <!-- 底部返回按钮 -->
                <div class="sidebar-footer">
                    <button class="back-home-btn" @click="goBack">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                            <polyline points="9 22 9 12 15 12 15 22"/>
                        </svg>
                        返回首页
                    </button>
                </div>
            </div>
        </aside>

        <!-- 右侧内容区 -->
        <main class="user-content">
            <!-- 个人信息 -->
            <div class="content-panel" v-if="activeTab === 'profile'">
                <h2 class="panel-title">个人信息</h2>
                <div class="info-grid">
                    <div class="info-item">
                        <span class="info-label">用户名</span>
                        <span class="info-value">{{ currentUser.username }}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">角色</span>
                        <span class="info-value">
                            <span class="role-tag" :class="currentUser.role?.toLowerCase()">
                                {{ currentUser.role === 'ADMIN' ? '管理员' : '普通用户' }}
                            </span>
                        </span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">用户 ID</span>
                        <span class="info-value mono">{{ currentUser.id }}</span>
                    </div>
                </div>
            </div>

            <!-- 我的文章 -->
            <div class="content-panel" v-if="activeTab === 'articles'">
                <h2 class="panel-title">我的文章</h2>
                <div class="article-list" v-if="myArticles.length > 0">
                    <div
                        v-for="article in myArticles"
                        :key="article.id"
                        class="article-card"
                    >
                        <div class="article-card-body" @click="goArticle(article.id)">
                            <h3 class="article-title">{{ article.title }}</h3>
                            <p class="article-summary">{{ article.summary || '暂无摘要' }}</p>
                            <div class="article-meta">
                                <span class="article-date">{{ article.createTime }}</span>
                            </div>
                        </div>
                        <div class="article-actions">
                            <button class="action-btn edit-btn" @click.stop="editArticle(article.id)">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                                编辑
                            </button>
                            <button class="action-btn delete-btn" @click.stop="deleteArticle(article)">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                                删除
                            </button>
                        </div>
                    </div>
                </div>
                <div class="empty-state" v-else>
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                        <polyline points="14 2 14 8 20 8"/>
                        <line x1="16" y1="13" x2="8" y2="13"/>
                        <line x1="16" y1="17" x2="8" y2="17"/>
                    </svg>
                    <p>还没有写过文章</p>
                </div>
            </div>

            <!-- 修改密码 -->
            <div class="content-panel" v-if="activeTab === 'password'">
                <h2 class="panel-title">修改密码</h2>
                <form @submit.prevent="handleUpdatePassword" class="password-form">
                    <div class="form-group">
                        <label for="old-password">当前密码</label>
                        <input
                            id="old-password"
                            v-model="passwordForm.oldPassword"
                            type="password"
                            placeholder="输入当前密码"
                            required
                        />
                    </div>
                    <div class="form-group">
                        <label for="new-password">新密码</label>
                        <input
                            id="new-password"
                            v-model="passwordForm.newPassword"
                            type="password"
                            placeholder="输入新密码（至少6位）"
                            required
                            minlength="6"
                        />
                    </div>
                    <div class="form-group">
                        <label for="confirm-password">确认新密码</label>
                        <input
                            id="confirm-password"
                            v-model="passwordForm.confirmPassword"
                            type="password"
                            placeholder="再次输入新密码"
                            required
                            minlength="6"
                        />
                    </div>
                    <button type="submit" class="submit-btn" :disabled="updating">
                        {{ updating ? '修改中…' : '修改密码' }}
                    </button>
                </form>
            </div>
        </main>
        <ConfirmDialog ref="confirmDialog" />
    </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import { currentUser } from "../stores/user.js";
import { articleInterface } from "../axios/interface/ArticleInterface.js";
import { userInterface } from "../axios/interface/UserInterface.js";
import { showToast } from "../stores/toast.js";
import ConfirmDialog from "../components/ConfirmDialog.vue";

const router = useRouter();
const route = useRoute();
const confirmDialog = ref(null);

// 从 URL 查询参数恢复标签页状态
const activeTab = ref(route.query.tab || "profile");

// 切换标签时同步到 URL
watch(activeTab, (tab) => {
    router.replace({ query: { ...route.query, tab } });
});
const myArticles = ref([]);
const updating = ref(false);

const passwordForm = ref({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
});

const userInitial = computed(() => {
    if (!currentUser.value?.username) return "?";
    return currentUser.value.username.charAt(0).toUpperCase();
});

const navItems = [
    {
        key: "profile",
        label: "个人信息",
        icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
        </svg>`,
    },
    {
        key: "articles",
        label: "我的文章",
        icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
        </svg>`,
    },
    {
        key: "password",
        label: "修改密码",
        icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
        </svg>`,
    },
];

const goBack = () => {
    router.push("/");
};

const goArticle = (id) => {
    router.push({ name: "文章详情", params: { id } });
};

const editArticle = (id) => {
    router.push({ name: "编辑文章", params: { id } });
};

const deleteArticle = async (article) => {
    const confirmed = await confirmDialog.value.show(
        `确定要删除「${article.title}」吗？此操作不可撤销。`,
        "确认删除"
    );
    if (!confirmed) return;

    try {
        await articleInterface().deleteById(article.id);
        myArticles.value = myArticles.value.filter(a => a.id !== article.id);
    } catch {
        // 错误已在拦截器中处理
    }
};

const handleUpdatePassword = async () => {
    const { oldPassword, newPassword, confirmPassword } = passwordForm.value;

    if (!oldPassword || !newPassword || !confirmPassword) {
        showToast("请填写所有字段", "warning");
        return;
    }

    if (newPassword.length < 6) {
        showToast("新密码至少需要6位", "warning");
        return;
    }

    if (newPassword !== confirmPassword) {
        showToast("两次输入的新密码不一致", "warning");
        return;
    }

    updating.value = true;
    try {
        await userInterface().updatePassword({
            oldPassword,
            newPassword,
            confirmPassword,
        });
        passwordForm.value = { oldPassword: "", newPassword: "", confirmPassword: "" };
    } catch {
        // 错误已在拦截器中处理
    } finally {
        updating.value = false;
    }
};

onMounted(async () => {
    // 获取当前用户的文章
    try {
        const allArticles = await articleInterface().findAll();
        if (currentUser.value?.username) {
            myArticles.value = allArticles.filter(
                (a) => a.userName === currentUser.value.username
            );
        }
    } catch {
        myArticles.value = [];
    }
});
</script>

<style scoped>
.user-page {
    display: flex;
    max-width: 1100px;
    margin: 0 auto;
    padding: 0 24px;
    min-height: calc(100vh - var(--nav-height) - 64px);
    gap: 32px;
}

/* ── 左侧边栏 ── */
.user-sidebar {
    position: sticky;
    top: calc(var(--nav-height) + 32px);
    width: 220px;
    flex-shrink: 0;
    align-self: flex-start;
    max-height: calc(100vh - var(--nav-height) - 64px);
    overflow-y: auto;
}

.sidebar-inner {
    background: linear-gradient(180deg, var(--bg-card) 0%, #fafafa 100%);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    padding: 24px 0;
    box-shadow: 0 2px 8px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04);
}

/* 头像区域 */
.user-avatar-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 0 24px 20px;
    text-align: center;
}

.avatar-placeholder {
    width: 72px;
    height: 72px;
    border-radius: 50%;
    background: var(--primary-gradient);
    color: #fff;
    font-size: 28px;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 12px;
    box-shadow: 0 4px 12px rgba(192, 57, 43, 0.3);
    flex-shrink: 0;
}

.user-display-name {
    font-size: 16px;
    font-weight: 700;
    color: var(--text-dark);
    margin-bottom: 6px;
    word-break: break-all;
}

.user-role-badge {
    font-size: 11px;
    font-weight: 700;
    padding: 3px 10px;
    border-radius: 12px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.user-role-badge.admin {
    background: var(--primary-light);
    color: var(--primary);
}

.user-role-badge.user {
    background: #f0f4ff;
    color: #3498db;
}

/* 分割线 */
.sidebar-divider {
    height: 1px;
    background: var(--border);
    margin: 0 16px;
}

/* 导航列表 */
.sidebar-nav {
    display: flex;
    flex-direction: column;
    gap: 2px;
    padding: 8px;
}

.nav-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 14px;
    border: none;
    border-radius: 0;
    background: transparent;
    color: var(--text-secondary);
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: var(--transition);
    text-align: left;
    width: 100%;
    position: relative;
    border-left: 3px solid transparent;
}

.nav-item:hover {
    background: var(--bg-card-hover);
    color: var(--text);
}

.nav-item.active {
    background: linear-gradient(90deg, var(--primary-light) 0%, transparent 100%);
    color: var(--primary);
    font-weight: 600;
    border-left-color: var(--primary);
}

.nav-icon {
    display: flex;
    align-items: center;
    flex-shrink: 0;
    opacity: 0.7;
    width: 20px;
    justify-content: center;
}

.nav-item.active .nav-icon {
    opacity: 1;
}

/* 底部 */
.sidebar-footer {
    padding: 8px 16px 0;
    margin-top: 8px;
    border-top: 1px solid var(--border-light);
}

.back-home-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 14px;
    border: none;
    border-radius: var(--radius);
    background: transparent;
    color: var(--text-muted);
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: var(--transition);
    width: 100%;
}

.back-home-btn:hover {
    color: var(--primary);
    background: var(--primary-light);
}

/* ── 右侧内容区 ── */
.user-content {
    flex: 1;
    min-width: 0;
    padding-bottom: 80px;
}

.content-panel {
    background: #ffffff;
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    padding: 32px;
    box-shadow: var(--shadow);
    animation: panelIn 0.25s var(--ease-out);
}

@keyframes panelIn {
    from {
        opacity: 0;
        transform: translateY(8px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.panel-title {
    font-size: 22px;
    font-weight: 700;
    color: var(--text-dark);
    margin-bottom: 24px;
    padding-bottom: 16px;
    border-bottom: 1px solid var(--border-light);
}

/* ── 个人信息 ── */
.info-grid {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.info-item {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 14px 20px;
    background: var(--bg-card-hover);
    border-radius: var(--radius);
    border: 1px solid var(--border-light);
}

.info-label {
    font-size: 13px;
    font-weight: 600;
    color: var(--text-muted);
    min-width: 80px;
    flex-shrink: 0;
}

.info-value {
    font-size: 15px;
    font-weight: 500;
    color: var(--text-dark);
}

.info-value.mono {
    font-family: var(--mono);
    font-size: 13px;
    color: var(--text-secondary);
}

.role-tag {
    display: inline-block;
    padding: 2px 10px;
    border-radius: 10px;
    font-size: 12px;
    font-weight: 600;
}

.role-tag.admin {
    background: var(--primary-light);
    color: var(--primary);
}

.role-tag.user {
    background: #f0f4ff;
    color: #3498db;
}

/* ── 文章列表 ── */
.article-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.article-card {
    display: flex;
    align-items: stretch;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    transition: var(--transition);
    background: var(--bg);
    box-shadow: 0 1px 3px rgba(0,0,0,0.04);
    position: relative;
    overflow: hidden;
}

.article-card::before {
    content: '';
    position: absolute;
    left: 0;
    top: 20%;
    height: 60%;
    width: 3px;
    background: var(--border);
    border-radius: 2px;
    transition: var(--transition);
    z-index: 1;
}

.article-card:hover {
    border-color: var(--primary-light);
    background: #fff;
    box-shadow: 0 4px 12px rgba(0,0,0,0.06);
}

.article-card:hover::before {
    background: var(--primary);
    top: 10%;
    height: 80%;
}

.article-card-body {
    flex: 1;
    padding: 20px 24px;
    cursor: pointer;
    min-width: 0;
}

.article-card-body:hover {
    transform: translateX(4px);
}

.article-actions {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 16px 12px;
    border-left: 1px solid var(--border-light);
    background: var(--bg-card-hover);
    justify-content: center;
    flex-shrink: 0;
}

.action-btn {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 6px 12px;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    background: var(--bg-card);
    color: var(--text-secondary);
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: var(--transition);
    white-space: nowrap;
}

.action-btn svg {
    flex-shrink: 0;
    opacity: 0.7;
}

.edit-btn:hover {
    border-color: var(--primary);
    color: var(--primary);
    background: var(--primary-light);
}

.delete-btn:hover {
    border-color: #e74c3c;
    color: #e74c3c;
    background: #fef2f2;
}

.article-title {
    font-size: 16px;
    font-weight: 600;
    color: var(--text-dark);
    margin-bottom: 6px;
}

.article-card:hover .article-title {
    color: var(--primary);
}

.article-summary {
    font-size: 13px;
    color: var(--text-secondary);
    line-height: 1.5;
    margin-bottom: 8px;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

.article-date {
    font-size: 12px;
    color: var(--text-muted);
}

.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px 0;
    color: var(--text-muted);
}

.empty-state svg {
    margin-bottom: 12px;
    opacity: 0.4;
}

.empty-state p {
    font-size: 14px;
}

/* ── 修改密码 ── */
.password-form {
    max-width: 420px;
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.form-group label {
    font-size: 13px;
    font-weight: 600;
    color: var(--text-secondary);
}

.form-group input {
    padding: 12px 16px;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    background: var(--bg);
    font-size: 14px;
    color: var(--text-dark);
    transition: var(--transition);
}

.form-group input:focus {
    outline: none;
    border-color: var(--primary);
    box-shadow: 0 0 0 3px var(--primary-light);
}

.form-group input::placeholder {
    color: var(--text-muted);
}

.submit-btn {
    padding: 12px 24px;
    border: none;
    border-radius: var(--radius);
    background: var(--primary-gradient);
    color: #fff;
    font-size: 14px;
    font-weight: 700;
    cursor: pointer;
    transition: var(--transition);
    box-shadow: 0 4px 12px rgba(192, 57, 43, 0.3);
    align-self: flex-start;
}

.submit-btn:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 6px 16px rgba(192, 57, 43, 0.4);
}

.submit-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

/* ── 响应式 ── */
@media (max-width: 768px) {
    .user-page {
        flex-direction: column;
        gap: 20px;
    }

    .user-sidebar {
        position: static;
        width: 100%;
        max-height: none;
    }

    .sidebar-inner {
        padding: 16px 0;
    }

    .user-avatar-section {
        padding-bottom: 16px;
    }

    .avatar-placeholder {
        width: 56px;
        height: 56px;
        font-size: 22px;
    }

    .sidebar-nav {
        flex-direction: row;
        overflow-x: auto;
        padding: 8px 16px;
        gap: 4px;
    }

    .nav-item {
        white-space: nowrap;
        padding: 8px 14px;
        font-size: 13px;
        width: auto;
    }

    .sidebar-footer {
        display: none;
    }

    .content-panel {
        padding: 20px;
    }

    .panel-title {
        font-size: 18px;
    }
}
</style>
