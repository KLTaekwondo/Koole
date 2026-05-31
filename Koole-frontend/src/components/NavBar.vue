<template>
    <nav class="navbar">
        <div class="nav-inner">
            <router-link to="/" class="nav-brand">Koole</router-link>
            <div class="nav-links">
                <router-link to="/" class="nav-link" :class="{ active: route.path === '/' }">首页</router-link>
                <router-link to="/articles" class="nav-link" :class="{ active: route.path.startsWith('/article') && !route.path.includes('/edit') && !route.path.includes('/create') }">文章</router-link>
                <router-link to="/updateposts" class="nav-link" :class="{ active: route.path.startsWith('/updatepost') }">更新日志</router-link>
                <router-link to="/physics-lab" class="nav-link" :class="{ active: route.path.startsWith('/physics-lab') }">物理实验室</router-link>
                <template v-if="isLoggedIn">
                    <div class="nav-separator"></div>
                    <router-link to="/articles/create" class="nav-link write-link">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14"/><path d="M5 12h14"/></svg>写文章
                    </router-link>
                    <router-link v-if="isAdmin" to="/updateposts/create" class="nav-link write-link">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>写日志
                    </router-link>
                </template>
            </div>
            <div class="nav-right">
                <button class="theme-toggle" @click="toggleTheme" :title="theme === 'light' ? '切换深色模式' : '切换浅色模式'">
                    <svg v-if="theme === 'light'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
                    <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
                </button>
                <template v-if="isLoggedIn">
                    <router-link to="/user" class="user-info">
                        <div class="user-avatar">{{ user.username.charAt(0).toUpperCase() }}</div>
                        <span class="user-name">{{ user.username }}</span>
                        <span v-if="isAdmin" class="user-badge">Admin</span>
                    </router-link>
                    <button class="logout-btn" @click="handleLogout">退出</button>
                </template>
                <template v-else>
                    <router-link to="/auth" class="nav-link auth-link">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>登录
                    </router-link>
                </template>
            </div>
        </div>
    </nav>
</template>

<script setup>
import { useRoute, useRouter } from "vue-router"
import { currentUser, isLoggedIn, isAdmin, logout } from "../stores/user.js"
import { theme, toggleTheme } from "../stores/theme.js"

const route = useRoute()
const router = useRouter()
const user = currentUser

const handleLogout = async () => {
    await logout()
    router.push("/")
}
</script>

<style scoped>
.navbar {
    background: rgba(255,255,255,0.92);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border-bottom: 1px solid var(--border);
    height: var(--nav-height);
    position: sticky;
    top: 0;
    z-index: 100;
    box-shadow: 0 1px 3px rgba(0,0,0,0.04);
}

:root[data-theme="dark"] .navbar {
    background: rgba(26,26,26,0.92);
}
.nav-inner {
    max-width: 1200px;
    margin: 0 auto;
    height: 100%;
    display: flex;
    align-items: center;
    padding: 0 32px;
}
.nav-right {
    margin-left: auto;
    display: flex;
    align-items: center;
    gap: 12px;
}
.nav-brand {
    font-size: 22px;
    font-weight: 700;
    color: var(--primary) !important;
    text-decoration: none !important;
    margin-right: 40px;
    letter-spacing: -0.5px;
}
.nav-links {
    display: flex;
    align-items: center;
    gap: 4px;
}
.nav-link {
    color: var(--text-secondary) !important;
    text-decoration: none !important;
    padding: 8px 16px;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 500;
    transition: background 0.2s, color 0.2s;
}
.nav-link:hover {
    background: #f0f4ff;
    color: var(--primary) !important;
}
.nav-link.active {
    background: #f0f4ff;
    color: var(--primary) !important;
    font-weight: 600;
}

:root[data-theme="dark"] .nav-link:hover,
:root[data-theme="dark"] .nav-link.active {
    background: rgba(231, 76, 60, 0.15);
}
.nav-separator {
    width: 1px;
    height: 24px;
    background: var(--border);
    margin: 0 8px;
}
.write-link {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    color: var(--primary) !important;
    background: var(--primary-light);
}
.write-link:hover {
    background: var(--primary) !important;
    color: #fff !important;
}
.user-info {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    text-decoration: none !important;
    padding: 6px 12px;
    border-radius: var(--radius);
    transition: var(--transition);
}
.user-info:hover {
    background: var(--bg-card-hover);
}
.user-avatar {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    background: var(--primary-gradient);
    color: #fff;
    font-size: 13px;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}
.user-name {
    font-size: 14px;
    font-weight: 600;
    color: var(--text-dark);
}
.user-badge {
    font-size: 10px;
    font-weight: 700;
    padding: 2px 6px;
    border-radius: 4px;
    background: var(--primary);
    color: #fff;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}
.logout-btn {
    padding: 6px 14px;
    border: 1px solid var(--border);
    border-radius: 20px;
    background: transparent;
    color: var(--text-muted);
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: var(--transition);
}
.logout-btn:hover {
    border-color: var(--primary);
    color: var(--primary);
    background: var(--primary-light);
}
.auth-link {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    color: var(--text-secondary) !important;
    border: 1px solid var(--border);
    padding: 6px 14px;
    border-radius: 20px;
    font-size: 13px;
    font-weight: 600;
}
.auth-link:hover {
    border-color: var(--primary) !important;
    color: var(--primary) !important;
    background: var(--primary-light) !important;
}
.theme-toggle {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border: 1px solid var(--border);
    border-radius: 50%;
    background: transparent;
    color: var(--text-secondary);
    cursor: pointer;
    transition: var(--transition);
}
.theme-toggle:hover {
    border-color: var(--primary);
    color: var(--primary);
    background: var(--primary-light);
}
</style>





