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
}
</style>
