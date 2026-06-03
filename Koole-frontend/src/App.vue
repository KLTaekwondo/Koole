<template>
    <div id="app">
        <NavBar />
        <main class="main-content">
            <router-view v-slot="{ Component }">
                <transition name="page" mode="out-in">
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
</script>

<style scoped>
.main-content {
    min-height: calc(100vh - var(--nav-height));
    padding: 32px 0;
    background: linear-gradient(135deg, #ffffff 0%, #fafafa 40%, #f5f5f0 100%);
}

:root[data-theme="dark"] .main-content {
    background: linear-gradient(135deg, #1a1a1a 0%, #222222 40%, #2a2a2a 100%);
}
</style>
