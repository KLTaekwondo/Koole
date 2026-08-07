<template>
    <div class="classic-workspace" :class="{ 'focus-mode': focusMode }">
        <section class="workspace-stage">
            <div v-if="!focusMode" class="stage-actions">
                <button class="capsule-button" type="button" @click="openModelDrawer">
                    <span class="capsule-dot"></span>
                    模型
                </button>
                <button class="back-button" type="button" @click="router.push('/physics-lab')">
                    <img :src="navBackIcon" alt="" />
                    返回物理实验室
                </button>
            </div>

            <RouterView v-slot="{ Component }">
                <component
                    :is="Component"
                    @request-models="openModelDrawer"
                    @focus-change="focusMode = $event"
                />
            </RouterView>

            <div v-if="!activeModelId" class="model-welcome">
                <span class="welcome-kicker">CLASSIC MODELS</span>
                <h1>先选择一个经典模型。</h1>
                <p>从左侧模型库进入实验，选择后会自动打开参数面板。</p>
                <button class="welcome-button" type="button" @click="openModelDrawer">打开模型库</button>
            </div>
        </section>

        <transition name="drawer-fade">
            <button
                v-if="modelDrawerOpen"
                class="drawer-backdrop"
                type="button"
                aria-label="关闭模型库"
                @click="closeModelDrawer"
            ></button>
        </transition>

        <transition name="drawer-slide">
            <aside v-if="modelDrawerOpen" class="model-drawer" aria-label="经典模型库">
                <header class="drawer-header">
                    <div>
                        <small>MODEL LIBRARY</small>
                        <h2>经典模型</h2>
                    </div>
                    <button class="icon-button" type="button" aria-label="关闭模型库" @click="closeModelDrawer">
                        <img :src="closeIcon" alt="" />
                    </button>
                </header>

                <label class="search-box">
                    <span>搜索</span>
                    <input v-model.trim="searchQuery" type="search" placeholder="模型名称、分类或简介" />
                    <button v-if="searchQuery" type="button" @click="searchQuery = ''">清除</button>
                </label>

                <div class="filter-row">
                    <button
                        v-for="category in categoryOptions"
                        :key="category"
                        type="button"
                        class="filter-chip"
                        :class="{ active: activeCategory === category }"
                        @click="activeCategory = category"
                    >{{ category }}</button>
                </div>

                <nav class="model-list">
                    <button
                        v-for="model in filteredModels"
                        :key="model.id"
                        type="button"
                        class="model-item"
                        :class="{ active: activeModelId === model.id }"
                        @click="selectModel(model.id)"
                    >
                        <span class="model-icon" v-html="model.icon"></span>
                        <span class="model-copy">
                            <strong>{{ model.name }}</strong>
                            <small>{{ model.desc }}</small>
                        </span>
                        <span class="model-category">{{ model.category }}</span>
                    </button>
                    <div v-if="filteredModels.length === 0" class="empty-result">
                        <strong>没有找到模型</strong>
                        <span>换个关键词或分类试试。</span>
                    </div>
                </nav>
            </aside>
        </transition>
    </div>
</template>

<script setup>
import { computed, ref, watch } from "vue"
import { useRoute, useRouter } from "vue-router"
import { PHYSICS_MODELS, CATEGORIES } from "../../constants/physicsModels.js"
import navBackIcon from "../../assets/icons/nav-back.svg"
import closeIcon from "../../assets/icons/close.svg"

const route = useRoute()
const router = useRouter()
const activeCategory = ref("全部")
const searchQuery = ref("")
const modelDrawerOpen = ref(!route.params.modelId)
const focusMode = ref(false)
const categoryOptions = ["全部", ...CATEGORIES]
const activeModelId = computed(() => route.params.modelId || "")

const filteredModels = computed(() => {
    const keyword = searchQuery.value.toLowerCase()
    return PHYSICS_MODELS.filter(model => {
        if (activeCategory.value !== "全部" && model.category !== activeCategory.value) return false
        if (!keyword) return true
        return [model.name, model.desc, model.category].some(value => String(value || "").toLowerCase().includes(keyword))
    })
})

function openModelDrawer() {
    modelDrawerOpen.value = true
}

function closeModelDrawer() {
    if (!activeModelId.value) return
    modelDrawerOpen.value = false
}

function selectModel(modelId) {
    modelDrawerOpen.value = false
    router.push(`/physics-lab/classic/${modelId}`)
}

watch(activeModelId, modelId => {
    if (modelId) modelDrawerOpen.value = false
    else modelDrawerOpen.value = true
})
</script>

<style scoped>
.classic-workspace {
    position: relative;
    width: min(1520px, calc(100% - 24px));
    margin: -20px auto 0;
    padding-bottom: 48px;
}

.workspace-stage {
    position: relative;
    min-height: calc(100svh - var(--nav-height) - 24px);
}

.stage-actions {
    position: absolute;
    top: 18px;
    left: 18px;
    z-index: 15;
    display: flex;
    align-items: center;
    gap: 10px;
}

.capsule-button,
.back-button,
.welcome-button {
    min-height: 40px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    border: 1px solid color-mix(in srgb, var(--border) 82%, var(--text));
    border-radius: 999px;
    background: color-mix(in srgb, var(--bg-card) 88%, transparent);
    color: var(--text);
    box-shadow: 0 8px 24px rgba(20, 28, 34, 0.1);
    backdrop-filter: blur(14px);
    -webkit-backdrop-filter: blur(14px);
    padding: 0 16px;
    font-size: 12px;
    font-weight: 700;
}

.capsule-button:hover,
.back-button:hover,
.welcome-button:hover {
    border-color: var(--primary);
    color: var(--primary);
    transform: translateY(-1px);
}

.capsule-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--primary);
    box-shadow: 0 0 0 5px var(--primary-light);
}

.back-button {
    box-shadow: none;
    background: transparent;
    color: var(--text-secondary);
}

.back-button img {
    width: 15px;
    height: 15px;
}

.model-welcome {
    min-height: calc(100svh - var(--nav-height) - 24px);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px 20px;
    border: 1px solid var(--border);
    border-radius: 24px;
    background:
        radial-gradient(circle at 72% 28%, color-mix(in srgb, var(--primary) 12%, transparent), transparent 36%),
        var(--bg-card);
    text-align: center;
}

.welcome-kicker {
    color: var(--primary);
    font-family: var(--mono);
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.14em;
}

.model-welcome h1 {
    margin: 18px 0 12px;
    color: var(--text);
    font-size: clamp(32px, 5vw, 58px);
}

.model-welcome p {
    color: var(--text-secondary);
}

.welcome-button {
    margin-top: 28px;
    border-color: var(--primary);
    background: var(--primary);
    color: #fff;
}

.drawer-backdrop {
    position: fixed;
    inset: var(--nav-height) 0 0;
    z-index: 180;
    border: 0;
    background: rgba(12, 18, 24, 0.26);
    backdrop-filter: blur(3px);
    -webkit-backdrop-filter: blur(3px);
}

.model-drawer {
    position: fixed;
    top: calc(var(--nav-height) + 12px);
    bottom: 12px;
    left: 12px;
    z-index: 190;
    width: min(360px, calc(100vw - 24px));
    display: flex;
    flex-direction: column;
    overflow: hidden;
    border: 1px solid var(--border);
    border-radius: 24px;
    background: color-mix(in srgb, var(--bg-card) 94%, transparent);
    box-shadow: 0 24px 70px rgba(15, 23, 32, 0.24);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
}

.drawer-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 22px 22px 16px;
}

.drawer-header small {
    color: var(--primary);
    font-family: var(--mono);
    font-size: 9px;
    letter-spacing: 0.12em;
}

.drawer-header h2 {
    margin-top: 4px;
    color: var(--text);
    font-size: 23px;
}

.icon-button {
    width: 38px;
    height: 38px;
    display: grid;
    place-items: center;
    border: 1px solid var(--border);
    border-radius: 50%;
    background: transparent;
}

.icon-button img {
    width: 15px;
    height: 15px;
}

.search-box {
    position: relative;
    display: block;
    margin: 0 18px 14px;
}

.search-box > span {
    position: absolute;
    left: 14px;
    top: 50%;
    transform: translateY(-50%);
    color: var(--text-muted);
    font-size: 11px;
}

.search-box input {
    width: 100%;
    height: 44px;
    padding: 0 58px 0 52px;
    border: 1px solid var(--border);
    border-radius: 999px;
    background: var(--bg-card-hover);
    color: var(--text);
    outline: none;
}

.search-box input:focus {
    border-color: var(--primary);
}

.search-box button {
    position: absolute;
    right: 12px;
    top: 50%;
    transform: translateY(-50%);
    border: 0;
    background: transparent;
    color: var(--primary);
    font-size: 11px;
}

.filter-row {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 7px;
    padding: 0 18px 14px;
}

.filter-chip {
    min-width: 0;
    min-height: 34px;
    padding: 6px 8px;
    border: 1px solid var(--border);
    border-radius: 999px;
    background: transparent;
    color: var(--text-secondary);
    font-size: 11px;
    font-weight: 700;
    line-height: 1;
    white-space: nowrap;
}

.filter-chip.active {
    border-color: var(--primary);
    background: var(--primary);
    color: #fff;
}

.model-list {
    min-height: 0;
    display: flex;
    flex-direction: column;
    gap: 6px;
    overflow-y: auto;
    padding: 0 12px 16px;
}

.model-item {
    width: 100%;
    min-height: 68px;
    display: grid;
    grid-template-columns: 34px minmax(0, 1fr) auto;
    align-items: center;
    gap: 10px;
    padding: 10px 12px;
    border: 1px solid transparent;
    border-radius: 16px;
    background: transparent;
    color: var(--text-secondary);
    text-align: left;
}

.model-item:hover,
.model-item.active {
    border-color: color-mix(in srgb, var(--primary) 35%, var(--border));
    background: var(--primary-light);
    color: var(--primary);
}

.model-icon {
    display: grid;
    place-items: center;
    font-size: 18px;
}

.model-copy {
    min-width: 0;
}

.model-copy strong,
.model-copy small {
    display: block;
}

.model-copy strong {
    color: var(--text);
    font-size: 13px;
}

.model-copy small {
    margin-top: 3px;
    overflow: hidden;
    color: var(--text-muted);
    font-size: 11px;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.model-category {
    color: var(--text-muted);
    font-size: 9px;
}

.empty-result {
    display: grid;
    gap: 6px;
    padding: 44px 20px;
    color: var(--text-secondary);
    text-align: center;
}

.empty-result span {
    font-size: 12px;
}

.drawer-fade-enter-active,
.drawer-fade-leave-active,
.drawer-slide-enter-active,
.drawer-slide-leave-active {
    transition: opacity 0.24s ease, transform 0.3s var(--ease-out);
}

.drawer-fade-enter-from,
.drawer-fade-leave-to {
    opacity: 0;
}

.drawer-slide-enter-from,
.drawer-slide-leave-to {
    opacity: 0;
    transform: translateX(-24px);
}

@media (max-width: 680px) {
    .classic-workspace {
        width: calc(100% - 12px);
        margin-top: -26px;
    }

    .workspace-stage {
        min-height: calc(100svh - var(--nav-height) - 12px);
    }

    .stage-actions {
        top: 10px;
        left: 10px;
    }

    .back-button {
        width: 40px;
        padding: 0;
        font-size: 0;
    }

    .model-welcome {
        min-height: calc(100svh - var(--nav-height) - 12px);
        border-radius: 18px;
    }

    .model-drawer {
        top: auto;
        right: 6px;
        bottom: 6px;
        left: 6px;
        width: auto;
        max-height: min(78svh, 720px);
        border-radius: 24px 24px 18px 18px;
    }

    .filter-row {
        grid-template-columns: repeat(3, minmax(0, 1fr));
    }

    .drawer-slide-enter-from,
    .drawer-slide-leave-to {
        transform: translateY(28px);
    }
}
</style>
