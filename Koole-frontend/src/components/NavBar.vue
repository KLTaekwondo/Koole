<template>
    <nav class="navbar">
        <div class="nav-inner">
            <router-link to="/" class="nav-brand" aria-label="Koole 首页">
                <img src="/favicon.svg" alt="" class="brand-mark" />
                <span>Koole</span>
            </router-link>
            <div class="nav-links" :class="{ open: menuOpen }">
                <router-link to="/" class="nav-link" :class="{ active: route.path === '/' }" @click="menuOpen = false">首页</router-link>
                <router-link
                    v-for="subject in SUBJECTS"
                    :key="subject.id"
                    :to="subject.path"
                    class="nav-link"
                    :class="{ active: route.path.startsWith(subject.path), pending: subject.status === 'building' }"
                    :title="subject.status === 'ready' ? subject.name : `${subject.name}建设中`"
                    @click="menuOpen = false"
                >
                    {{ subject.name }}
                </router-link>
            </div>
            <div class="nav-right">
                <button
                    class="theme-toggle"
                    @click="toggleTheme"
                    :title="theme === 'light' ? '切换深色模式' : '切换浅色模式'"
                    :aria-label="theme === 'light' ? '切换深色模式' : '切换浅色模式'"
                >
                    <img
                        :src="theme === 'light' ? themeMoonIcon : themeSunIcon"
                        alt=""
                        class="theme-icon"
                    />
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
import { SUBJECTS } from "../constants/subjects.js"
import themeMoonIcon from "../assets/icons/theme-moon.svg"
import themeSunIcon from "../assets/icons/theme-sun.svg"

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
    padding: 0 20px;
}
.nav-right {
    margin-left: auto;
    display: flex;
    align-items: center;
    gap: 12px;
}
.nav-brand {
    display: inline-flex;
    align-items: center;
    gap: 9px;
    font-size: 22px;
    font-weight: 700;
    color: var(--primary) !important;
    text-decoration: none !important;
    margin-right: 20px;
    letter-spacing: 0;
}
.brand-mark {
    display: block;
    width: 34px;
    height: 34px;
    flex-shrink: 0;
}
.nav-links {
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 0;
}

.nav-link {
    color: var(--text-secondary) !important;
    text-decoration: none !important;
    padding: 8px 9px;
    border-radius: 6px;
    font-size: 13px;
    font-weight: 500;
    white-space: nowrap;
    transition: background 0.2s, color 0.2s;
}

.nav-link.pending {
    opacity: 0.72;
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
.theme-icon {
    width: 18px;
    height: 18px;
    display: block;
    opacity: 0.95;
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
