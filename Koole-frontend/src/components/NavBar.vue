<template>
    <nav class="navbar">
        <div class="nav-inner">
            <router-link to="/" class="nav-brand">Koole</router-link>
            <div class="nav-links" :class="{ open: menuOpen }">
                <router-link to="/" class="nav-link" :class="{ active: route.path === '/' }" @click="menuOpen = false">首页</router-link>
                <router-link to="/physics-lab" class="nav-link" :class="{ active: route.path.startsWith('/physics-lab') }" @click="menuOpen = false">演示工具</router-link>
            </div>
            <div class="nav-right">
                <button class="theme-toggle" @click="toggleTheme" :title="theme === 'light' ? '切换深色模式' : '切换浅色模式'">
                    <svg v-if="theme === 'light'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
                    <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
                </button>
                <button class="hamburger" :class="{ open: menuOpen }" @click="menuOpen = !menuOpen" aria-label="菜单">
                    <span></span>
                    <span></span>
                    <span></span>
                </button>
            </div>
        </div>
    </nav>
</template>

<script setup>
import { ref, watch } from "vue"
import { useRoute } from "vue-router"
import { theme, toggleTheme } from "../stores/theme.js"

const route = useRoute()
const menuOpen = ref(false)

// 路由变化时关闭菜单
watch(() => route.path, () => { menuOpen.value = false })
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

/* ── 汉堡菜单 ── */
.hamburger {
    display: none;
    flex-direction: column;
    justify-content: center;
    gap: 5px;
    width: 36px;
    height: 36px;
    padding: 6px;
    border: 1px solid var(--border);
    border-radius: 6px;
    background: transparent;
    cursor: pointer;
    transition: var(--transition);
}

.hamburger span {
    display: block;
    width: 100%;
    height: 2px;
    background: var(--text-secondary);
    border-radius: 1px;
    transition: transform 0.3s, opacity 0.3s;
}

.hamburger.open span:nth-child(1) {
    transform: translateY(7px) rotate(45deg);
}

.hamburger.open span:nth-child(2) {
    opacity: 0;
}

.hamburger.open span:nth-child(3) {
    transform: translateY(-7px) rotate(-45deg);
}

@media (max-width: 768px) {
    .nav-inner {
        padding: 0 16px;
    }

    .nav-brand {
        margin-right: auto;
    }

    .hamburger {
        display: flex;
    }

    .nav-links {
        display: none;
        position: absolute;
        top: var(--nav-height);
        left: 0;
        right: 0;
        background: var(--bg-card);
        border-bottom: 1px solid var(--border);
        box-shadow: 0 4px 12px rgba(0,0,0,0.08);
        flex-direction: column;
        padding: 8px;
        gap: 2px;
        z-index: 99;
    }

    :root[data-theme="dark"] .nav-links {
        background: #1a1a1a;
    }

    .nav-links.open {
        display: flex;
    }

    .nav-link {
        padding: 12px 16px;
        border-radius: 8px;
        font-size: 15px;
    }
}
</style>
