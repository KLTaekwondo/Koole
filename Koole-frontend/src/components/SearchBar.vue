<template>
    <div class="search-bar">
        <input type="text" placeholder="搜索文章…" v-model="searchText" @keyup.enter="search"/>
        <div class="search-actions">
            <button class="search-btn" @click="search">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                搜索
            </button>
            <button class="reset-btn" @click="reset">重置</button>
        </div>
    </div>
</template>

<script setup>
import { ref } from "vue"
const searchText = ref("")
const emit = defineEmits(["search"])
const search = () => {
    emit("search", searchText.value)
}
const reset = () => {
    emit("reset")
    searchText.value = ""
}
</script>

<style scoped>
.search-bar {
    display: flex;
    align-items: center;
    gap: 8px;
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    padding: 6px 6px 6px 16px;
    box-shadow: var(--shadow);
    transition: var(--transition);
    max-width: 500px;
    width: 100%;
}

.search-bar:focus-within {
    border-color: grey;
    box-shadow: 0 0 0 3px whitesmoke;
}

.search-bar input {
    flex: 1;
    border: none;
    border-radius: 4px;
    background: transparent;
    font-size: 14px;
    color: var(--text);
    padding: 8px 4px;
}

.search-bar input::placeholder {
    color: var(--text-muted);
}

.search-actions {
    display: flex;
    gap: 6px;
}

.search-btn,
.reset-btn {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 8px 14px;
    border: none;
    border-radius: var(--radius);
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: var(--transition);
}

.search-btn {
    background: var(--primary);
    color: #fff;
}

.search-btn:hover {
    background: var(--primary-dark);
    transform: translateY(-1px);
}

.reset-btn {
    background: transparent;
    color: var(--text-secondary);
    border: 1px solid var(--border);
}

.reset-btn:hover {
    background: var(--bg);
    color: var(--text);
    border-color: var(--text-muted);
}
</style>