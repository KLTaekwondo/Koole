<script setup>
import { useRoute } from "vue-router"

const route = useRoute()
</script>

<template>
    <nav class="navbar">
        <div class="nav-inner">
            <router-link to="/" class="nav-brand">Koole</router-link>
            <div class="nav-links">
                <router-link
                    to="/"
                    class="nav-link"
                    :class="{ active: route.path === '/' }"
                >
                    首页
                </router-link>
                <router-link
                    to="/article"
                    class="nav-link"
                    :class="{ active: route.path.startsWith('/article') }"
                >
                    文章
                </router-link>
                <router-link
                    to="/updatepost"
                    class="nav-link"
                    :class="{ active: route.path.startsWith('/updatepost') }"
                >
                    更新日志
                </router-link>
            </div>
        </div>
    </nav>
</template>

<style scoped>
.navbar {
    background: #fff;
    border-bottom: 1px solid var(--border);
    height: var(--nav-height);
    position: sticky;
    top: 0;
    z-index: 100;
}

.nav-inner {
    max-width: var(--content-width);
    margin: 0 auto;
    height: 100%;
    display: flex;
    align-items: center;
    padding: 0 24px;
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
</style>
