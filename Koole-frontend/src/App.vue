<template>
    <div id="app">
        <NavBar />
        <main class="main-content">
            <router-view />
        </main>
    </div>
</template>

<script setup>
import NavBar from "./components/NavBar.vue"
</script>

<style scoped>
.main-content {
    min-height: calc(100vh - var(--nav-height));
}
</style>
