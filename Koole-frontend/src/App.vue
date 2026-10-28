<template>
    <div id="app">
        <NavBar />
        <transition name="route-progress">
            <div v-if="routeLoading" class="route-progress" aria-hidden="true"><i></i></div>
        </transition>
        <main class="main-content" :class="{ 'periodic-content': route.path.startsWith('/chem-lab/periodic-table') }">
            <router-view v-slot="{ Component }">
                <transition :name="transitionName" mode="out-in">
                    <component :is="Component" />
                </transition>
            </router-view>
        </main>
        <Toast />
    </div>
</template>

<script setup>
import NavBar from "./components/NavBar.vue"
import Toast from "./components/Toast.vue"
import { computed, onBeforeUnmount, ref } from "vue"
import { useRoute, useRouter } from "vue-router"

const route = useRoute()
const router = useRouter()

// 页面切换动画：默认带一点位移；画布/全屏类页面（固定定位元素多）只做淡入淡出，
// 否则祖先元素在过渡期间的 transform 会让 position: fixed 的子元素短暂改变参照。
const transitionName = computed(() => (route.meta?.transition === "fade" ? "page-fade" : "page"))

// 路由级懒加载的 chunk 下载期间显示顶部进度条：下载完（afterEach）立即隐藏。
// 120ms 延迟避免秒开的页面闪一下进度条；导航失败（onError）也要收掉。
const routeLoading = ref(false)
let showTimer = null

const startLoading = () => {
    clearTimeout(showTimer)
    showTimer = setTimeout(() => { routeLoading.value = true }, 120)
}

const stopLoading = () => {
    clearTimeout(showTimer)
    showTimer = null
    routeLoading.value = false
}

const removeBeforeEach = router.beforeEach((to, from) => {
    if (to.path !== from.path) startLoading()
    return true
})
const removeAfterEach = router.afterEach(stopLoading)
const removeOnError = router.onError(stopLoading)

onBeforeUnmount(() => {
    clearTimeout(showTimer)
    removeBeforeEach()
    removeAfterEach()
    removeOnError()
})
</script>

<style scoped>
.main-content {
    min-height: calc(100vh - var(--nav-height));
    padding: 32px 0;
    background: linear-gradient(135deg, #ffffff 0%, #fafafa 40%, #f5f5f0 100%);
    overflow-x:hidden;
}

.main-content.periodic-content {
    background: transparent;
}

:root[data-theme="dark"] .main-content {
    background: linear-gradient(135deg, #1a1a1a 0%, #222222 40%, #2a2a2a 100%);
}

:root[data-theme="dark"] .main-content.periodic-content {
    background: transparent;
}

/* ── 路由加载进度条（懒加载 chunk 下载中） ── */
.route-progress {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    z-index: 300;
    overflow: hidden;
    pointer-events: none;
}

.route-progress i {
    display: block;
    width: 38%;
    height: 100%;
    background: linear-gradient(90deg, transparent, #c0392b, #e2683f, transparent);
    animation: route-progress-slide 0.9s ease-in-out infinite;
}

@keyframes route-progress-slide {
    from { transform: translateX(-100%); }
    to { transform: translateX(320%); }
}

.route-progress-enter-active,
.route-progress-leave-active {
    transition: opacity 0.2s ease;
}

.route-progress-enter-from,
.route-progress-leave-to {
    opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
    .route-progress i { animation-duration: 2.4s; }
}
</style>
