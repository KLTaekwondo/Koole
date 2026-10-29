<template>
    <div class="periodic-page">
        <div ref="sceneHost" class="periodic-scene" aria-hidden="true"></div>

        <section class="table-workspace">
            <div class="periodic-toolbox">
                <router-link to="/chem-lab" class="tool-back-btn" title="返回化学实验室" aria-label="返回化学实验室">
                    <svg viewBox="0 0 24 24" aria-hidden="true"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
                </router-link>
                <span class="toolbar-divider" aria-hidden="true"></span>
                <div class="toolbox-identity">
                    <span class="table-title">PERIODIC TABLE / 元素周期表</span>
                    <span class="table-count">118 ELEMENTS</span>
                </div>
                <span class="toolbar-divider" aria-hidden="true"></span>
                <button class="tool-btn" type="button" title="搜索元素" :aria-expanded="searchOpen" @click="toggleSearch">
                    <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5"/><line x1="16" y1="16" x2="21" y2="21"/></svg>
                </button>
                <button class="tool-btn filter-btn" type="button" title="筛选元素" :aria-expanded="filtersOpen" @click="toggleFilters">
                    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h16M7 12h10M10 18h4"/></svg>
                    <span v-if="matchCount < 118" class="filter-badge">{{ matchCount }}</span>
                </button>
                <Transition name="tool-popover">
                    <div v-if="searchOpen" class="tool-popover search-popover">
                        <label class="search-box">
                            <span>搜索元素</span>
                            <input v-model.trim="query" type="search" placeholder="例如：Na、钠、Sodium、11" autofocus />
                        </label>
                    </div>
                </Transition>
                <Transition name="tool-popover">
                    <div v-if="filtersOpen" class="tool-popover filter-popover">
                        <label class="filter-field">
                            <span>分类</span>
                            <select v-model="categoryFilter" aria-label="元素分类">
                                <option value="all">全部分类</option>
                                <option v-for="(value, key) in categories" :key="key" :value="key">{{ value.label }}</option>
                            </select>
                        </label>
                        <label class="filter-field">
                            <span>物态</span>
                            <select v-model="phaseFilter" aria-label="元素物态">
                                <option value="all">全部物态</option>
                                <option v-for="(label, key) in phases" :key="key" :value="key">{{ label }}</option>
                            </select>
                        </label>
                        <button type="button" @click="clearFilters">清除筛选</button>
                        <span class="match-count">{{ matchCount }} / 118</span>
                    </div>
                </Transition>
            </div>

            <div class="scroll-hint">可横向滚动查看完整 18 族周期表 →</div>
            <div class="table-scroll">
                <div class="group-labels">
                    <span
                        v-for="group in groupLabels"
                        :key="group.number"
                        :style="{ gridColumn: group.number }"
                        :title="group.fullName"
                    >
                        <strong>第{{ group.number }}族</strong>
                        <small class="group-code">{{ group.traditionalCode }}</small>
                        <small class="group-family">{{ group.familyName }}</small>
                    </span>
                </div>
                <div class="periodic-grid">
                    <router-link
                        v-for="element in mainElements"
                        :key="element.atomicNumber"
                        :to="`/chem-lab/periodic-table/${element.symbol}`"
                        class="element-tile"
                        :class="{
                            muted: !matches(element),
                            'first-column': element.position.column === 1,
                            'last-column': element.position.column === 18,
                        }"
                        :style="tileStyle(element)"
                        :aria-label="`${element.atomicNumber} 号元素 ${element.name} ${element.symbol}`"
                        @mouseenter="prefetchElementDetail"
                        @focus="prefetchElementDetail"
                        @touchstart.passive="prefetchElementDetail"
                    >
                        <small>{{ element.atomicNumber }}</small>
                        <strong>{{ element.symbol }}</strong>
                        <span>{{ element.name }}</span>
                        <i>{{ element.atomicMass }}</i>
                    </router-link>
                </div>
                <div class="series-table">
                    <div class="series-label">镧系</div>
                    <router-link
                        v-for="(element, index) in lanthanides"
                        :key="element.atomicNumber"
                        :to="`/chem-lab/periodic-table/${element.symbol}`"
                        class="element-tile"
                        :class="{ muted: !matches(element) }"
                        :style="seriesTileStyle(element, index, 1)"
                        @mouseenter="prefetchElementDetail"
                        @focus="prefetchElementDetail"
                        @touchstart.passive="prefetchElementDetail"
                    >
                        <small>{{ element.atomicNumber }}</small>
                        <strong>{{ element.symbol }}</strong>
                        <span>{{ element.name }}</span>
                        <i>{{ element.atomicMass }}</i>
                    </router-link>
                    <div class="series-label actinide-label">锕系</div>
                    <router-link
                        v-for="(element, index) in actinides"
                        :key="element.atomicNumber"
                        :to="`/chem-lab/periodic-table/${element.symbol}`"
                        class="element-tile"
                        :class="{ muted: !matches(element) }"
                        :style="seriesTileStyle(element, index, 2)"
                        @mouseenter="prefetchElementDetail"
                        @focus="prefetchElementDetail"
                        @touchstart.passive="prefetchElementDetail"
                    >
                        <small>{{ element.atomicNumber }}</small>
                        <strong>{{ element.symbol }}</strong>
                        <span>{{ element.name }}</span>
                        <i>{{ element.atomicMass }}</i>
                    </router-link>
                </div>
            </div>

            <div class="legend">
                <span v-for="(value, key) in categories" :key="key">
                    <i :style="{ background: value.color }"></i>
                    {{ value.label }}
                </span>
            </div>
        </section>
    </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from "vue"
import * as THREE from "three"
import { PERIODIC_ELEMENTS, ELEMENT_CATEGORIES, ELEMENT_PHASES } from "../../../constants/periodicElements.js"

const categories = ELEMENT_CATEGORIES
const phases = ELEMENT_PHASES
const query = ref("")
const categoryFilter = ref("all")
const phaseFilter = ref("all")
const sceneHost = ref(null)
const searchOpen = ref(false)
const filtersOpen = ref(false)
const groupLabels = [
    { number: 1, traditionalCode: "IA", familyName: "第一主族", fullName: "第1族（IA，第一主族）" },
    { number: 2, traditionalCode: "IIA", familyName: "第二主族", fullName: "第2族（IIA，第二主族）" },
    { number: 3, traditionalCode: "IIIB", familyName: "第三副族", fullName: "第3族（IIIB，第三副族）" },
    { number: 4, traditionalCode: "IVB", familyName: "第四副族", fullName: "第4族（IVB，第四副族）" },
    { number: 5, traditionalCode: "VB", familyName: "第五副族", fullName: "第5族（VB，第五副族）" },
    { number: 6, traditionalCode: "VIB", familyName: "第六副族", fullName: "第6族（VIB，第六副族）" },
    { number: 7, traditionalCode: "VIIB", familyName: "第七副族", fullName: "第7族（VIIB，第七副族）" },
    { number: 8, traditionalCode: "VIIIB", familyName: "第八副族", fullName: "第8族（VIIIB，第八副族）" },
    { number: 9, traditionalCode: "VIIIB", familyName: "第八副族", fullName: "第9族（VIIIB，第八副族）" },
    { number: 10, traditionalCode: "VIIIB", familyName: "第八副族", fullName: "第10族（VIIIB，第八副族）" },
    { number: 11, traditionalCode: "IB", familyName: "第一副族", fullName: "第11族（IB，第一副族）" },
    { number: 12, traditionalCode: "IIB", familyName: "第二副族", fullName: "第12族（IIB，第二副族）" },
    { number: 13, traditionalCode: "IIIA", familyName: "第三主族", fullName: "第13族（IIIA，第三主族）" },
    { number: 14, traditionalCode: "IVA", familyName: "第四主族", fullName: "第14族（IVA，第四主族）" },
    { number: 15, traditionalCode: "VA", familyName: "第五主族", fullName: "第15族（VA，第五主族）" },
    { number: 16, traditionalCode: "VIA", familyName: "第六主族", fullName: "第16族（VIA，第六主族）" },
    { number: 17, traditionalCode: "VIIA", familyName: "第七主族", fullName: "第17族（VIIA，第七主族）" },
    { number: 18, traditionalCode: "VIIIA · 0族", familyName: "第八主族", fullName: "第18族（VIIIA，第八主族，传统0族）" },
]
let renderer = null
let scene = null
let resizeScene = null
let animationId = 0

function initScene() {
    if (!sceneHost.value) return

    scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100)
    camera.position.z = 8

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
    renderer.setClearAlpha(0)
    sceneHost.value.appendChild(renderer.domElement)

    const positions = []
    for (let index = 0; index < 260; index += 1) {
        positions.push(
            THREE.MathUtils.randFloatSpread(18),
            THREE.MathUtils.randFloatSpread(11),
            THREE.MathUtils.randFloat(-5, 1),
        )
    }

    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3))
    const particleMaterial = new THREE.PointsMaterial({
        color: 0x56c9a8,
        size: 0.035,
        transparent: true,
        opacity: 0.48,
    })
    const particles = new THREE.Points(geometry, particleMaterial)
    scene.add(particles)

    const glowMaterial = new THREE.MeshBasicMaterial({
        color: 0x2aa27f,
        transparent: true,
        opacity: 0.055,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
    })
    const glow = new THREE.Mesh(new THREE.SphereGeometry(1.9, 24, 18), glowMaterial)
    glow.position.set(4, -2.8, -2)
    glow.scale.set(1.6, 0.75, 1)
    scene.add(glow)

    resizeScene = () => {
        if (!renderer) return
        const width = Math.max(window.innerWidth, 1)
        const height = Math.max(window.innerHeight, 1)
        renderer.setSize(width, height, false)
        camera.aspect = width / height
        camera.updateProjectionMatrix()
    }

    const animate = time => {
        if (!renderer || !scene) return
        particles.rotation.y = time * 0.000008
        renderer.render(scene, camera)
        animationId = requestAnimationFrame(animate)
    }

    window.addEventListener("resize", resizeScene)
    resizeScene()
    animate(0)
}

const mainElements = PERIODIC_ELEMENTS.filter(element => !element.position.series)
const lanthanides = PERIODIC_ELEMENTS.filter(element => element.atomicNumber >= 57 && element.atomicNumber <= 71)
const actinides = PERIODIC_ELEMENTS.filter(element => element.atomicNumber >= 89 && element.atomicNumber <= 103)
const matchCount = computed(() => PERIODIC_ELEMENTS.filter(matches).length)

onMounted(initScene)

onBeforeUnmount(() => {
    cancelAnimationFrame(animationId)
    if (resizeScene) window.removeEventListener("resize", resizeScene)
    scene?.traverse(object => {
        object.geometry?.dispose()
        object.material?.dispose()
    })
    renderer?.dispose()
    renderer?.domElement.remove()
    renderer = null
    scene = null
    resizeScene = null
})

function matches(element) {
    const keyword = query.value.toLowerCase()
    const queryMatches = !keyword || [element.atomicNumber, element.symbol, element.name, element.englishName]
        .some(value => String(value).toLowerCase().includes(keyword))
    return queryMatches
        && (categoryFilter.value === "all" || element.category === categoryFilter.value)
        && (phaseFilter.value === "all" || element.phase === phaseFilter.value)
}

function tileStyle(element) {
    return {
        gridRow: element.position.row,
        gridColumn: element.position.column,
        "--element": categories[element.category].color,
    }
}

function seriesTileStyle(element, index, row) {
    return {
        gridRow: row,
        gridColumn: index + 4,
        "--element": categories[element.category].color,
    }
}

function clearFilters() {
    query.value = ""
    categoryFilter.value = "all"
    phaseFilter.value = "all"
}

// 预取元素详情页的代码包：元素详情是懒加载路由（含全部百科数据，约 180 kB），
// 鼠标悬停 / 键盘聚焦 / 手指按下元素格子时就开始下载，点进去时不用再等。
// 注意：这里只是提前把同一个 chunk 拉下来，数据仍然是一次性加载，没有按元素拆包。
let elementDetailModule = null
function prefetchElementDetail() {
    if (!elementDetailModule) elementDetailModule = import("./ElementDetail.vue")
    return elementDetailModule
}

function toggleSearch() {
    searchOpen.value = !searchOpen.value
    filtersOpen.value = false
}

function toggleFilters() {
    filtersOpen.value = !filtersOpen.value
    searchOpen.value = false
}
</script>

<style scoped>
.periodic-page {
    position: relative;
    isolation: isolate;
    width: min(1480px, calc(100% - 32px));
    margin: -32px auto 60px;
    color: var(--text);
}

.periodic-scene {
    position: fixed;
    inset: var(--nav-height) 0 0;
    z-index: -1;
    overflow: hidden;
    pointer-events: none;
}

.periodic-scene :deep(canvas) {
    width: 100%;
    height: 100%;
    display: block;
}

:global(:root[data-theme="dark"]) .periodic-page {
    --bg-card: rgba(10, 28, 34, 0.74);
}

.table-title {
    color: #2aa27f;
    font-family: var(--mono);
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.12em;
}

.table-count {
    color: var(--text-muted);
    font-family: var(--mono);
    font-size: 9px;
    letter-spacing: 0.08em;
}

.table-workspace {
    padding: 18px;
    background: transparent;
}

.periodic-toolbox {
    position: fixed;
    left: 50%;
    bottom: 20px;
    z-index: 30;
    display: flex;
    align-items: center;
    gap: 6px;
    min-height: 54px;
    width: max-content;
    max-width: calc(100vw - 32px);
    padding: 8px 10px;
    border: 1px solid color-mix(in srgb, var(--border) 72%, #2aa27f 28%);
    border-radius: 18px;
    background: color-mix(in srgb, var(--bg-card) 88%, transparent);
    box-shadow: 0 12px 32px rgba(21, 54, 49, 0.18);
    transform: translateX(-50%);
    animation: toolbox-rise 0.42s var(--ease-out) both;
}

@keyframes toolbox-rise {
    from {
        opacity: 0;
        transform: translate(-50%, 14px) scale(0.96);
    }
    to {
        opacity: 1;
        transform: translate(-50%, 0) scale(1);
    }
}

.toolbox-identity {
    display: flex;
    flex: 0 0 auto;
    flex-direction: column;
    gap: 1px;
    padding: 0 8px;
}

.tool-back-btn,
.tool-btn {
    position: relative;
    width: 36px;
    height: 36px;
    display: grid;
    place-items: center;
    flex: 0 0 auto;
    border: 1px solid var(--border);
    border-radius: 9px;
    background: var(--bg-card-hover);
    color: var(--text-secondary);
    text-decoration: none;
    transition: var(--transition);
}

.tool-back-btn:hover,
.tool-btn:hover,
.tool-btn[aria-expanded="true"] {
    border-color: #2aa27f;
    background: color-mix(in srgb, #2aa27f 10%, var(--bg-card-hover));
    color: #2aa27f;
}

.tool-back-btn svg,
.tool-btn svg {
    width: 17px;
    height: 17px;
    fill: none;
    stroke: currentColor;
    stroke-linecap: round;
    stroke-linejoin: round;
    stroke-width: 2;
}

.toolbar-divider {
    width: 1px;
    height: 26px;
    flex: 0 0 auto;
    background: var(--border);
}

.filter-badge {
    position: absolute;
    top: -5px;
    right: -5px;
    min-width: 16px;
    height: 16px;
    padding: 0 3px;
    border: 2px solid var(--bg-card);
    border-radius: 999px;
    background: #2aa27f;
    color: #fff;
    font-family: var(--mono);
    font-size: 8px;
    line-height: 12px;
    text-align: center;
}

.search-box {
    display: block;
    position: relative;
}

.search-box > span {
    position: absolute;
    left: 13px;
    top: 50%;
    color: var(--text-muted);
    font-size: 10px;
    transform: translateY(-50%);
}

.search-box input,
.filter-field select {
    width: 100%;
    height: 42px;
    border: 1px solid var(--border);
    border-radius: 12px;
    background: var(--bg-card-hover);
    color: var(--text);
}

.search-box input {
    padding: 0 14px 0 70px;
}

.filter-field {
    display: grid;
    gap: 4px;
}

.filter-field > span {
    color: var(--text-muted);
    font-size: 10px;
    font-weight: 700;
}

.filter-field select {
    appearance: none;
    padding: 0 30px 0 10px;
    background-image: linear-gradient(45deg, transparent 50%, var(--text-secondary) 50%), linear-gradient(135deg, var(--text-secondary) 50%, transparent 50%);
    background-position: calc(100% - 14px) 18px, calc(100% - 9px) 18px;
    background-repeat: no-repeat;
    background-size: 5px 5px, 5px 5px;
}

.filter-popover button {
    height: 42px;
    padding: 0 14px;
    border: 1px solid var(--border);
    border-radius: 12px;
    background: transparent;
    color: var(--text-secondary);
}

.match-count {
    flex: 0 0 auto;
    color: #2aa27f;
    font-family: var(--mono);
    font-size: 11px;
    text-align: right;
}

.tool-popover {
    position: absolute;
    left: 50%;
    bottom: calc(100% + 10px);
    padding: 10px;
    border: 1px solid var(--border);
    border-radius: 12px;
    background: var(--bg-card);
    box-shadow: 0 12px 30px rgba(21, 54, 49, 0.18);
    transform: translateX(-50%);
}

.tool-popover-enter-active,
.tool-popover-leave-active {
    transition: opacity 0.2s var(--ease-out), transform 0.2s var(--ease-out);
}

.tool-popover-enter-from,
.tool-popover-leave-to {
    opacity: 0;
    transform: translate(-50%, 8px) scale(0.97);
}

.search-popover {
    width: min(320px, calc(100vw - 32px));
}

.filter-popover {
    display: grid;
    grid-template-columns: 150px 130px auto auto;
    align-items: center;
    gap: 8px;
    width: max-content;
    max-width: calc(100vw - 32px);
}

.filter-popover button {
    padding: 0 12px;
    border: 1px solid var(--border);
    border-radius: 9px;
    background: transparent;
    color: var(--text-secondary);
}

.scroll-hint {
    display: none;
    margin: 6px 0 10px;
    color: var(--text-muted);
    font-size: 10px;
}

.table-scroll {
    overflow-x: auto;
    padding-bottom: 10px;
}

.group-labels,
.periodic-grid {
    min-width: 1230px;
    display: grid;
    grid-template-columns: repeat(18, 1fr);
    gap: 5px;
}

.group-labels {
    margin-bottom: 9px;
    color: var(--text-muted);
    font-family: var(--mono);
    text-align: center;
}

.group-labels > span {
    min-width: 0;
    min-height: 38px;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    gap: 2px;
    line-height: 1.15;
}

.group-labels strong {
    color: var(--text-secondary);
    font-size: 10px;
    font-weight: 700;
}

.group-labels small {
    overflow: hidden;
    color: var(--text-muted);
    font-size: 8px;
    font-weight: 600;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.group-labels .group-code {
    color: var(--text-secondary);
    font-family: var(--mono);
    font-size: 8px;
    font-weight: 700;
}

.group-labels .group-family {
    font-size: 7px;
    font-weight: 500;
}

.periodic-grid {
    grid-template-rows: repeat(7, 82px);
}

.element-tile {
    position: relative;
    min-width: 0;
    display: flex;
    flex-direction: column;
    padding: 7px;
    overflow: hidden;
    border: 1px solid color-mix(in srgb, var(--element) 58%, var(--border));
    border-radius: 9px;
    background: color-mix(in srgb, var(--element) 20%, color-mix(in srgb, var(--bg-card) 72%, transparent));
    color: var(--text);
    text-decoration: none;
    transition: transform 0.2s, opacity 0.2s, box-shadow 0.2s;
}

.element-tile::after {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: inherit;
    background: radial-gradient(circle at 80% 10%, color-mix(in srgb, var(--element) 22%, transparent), transparent 55%);
    opacity: 0.7;
    pointer-events: none;
}

.element-tile:hover,
.element-tile:focus-visible {
    z-index: 2;
    transform: translateY(-3px) scale(1.04);
    box-shadow: 0 9px 22px color-mix(in srgb, var(--element) 24%, transparent);
    outline: none;
}

.element-tile.first-column {
    transform-origin: left center;
}

.element-tile.last-column {
    transform-origin: right center;
}

.element-tile.muted {
    opacity: 0.16;
    filter: grayscale(0.6);
}

.element-tile small {
    color: var(--text-secondary);
    font-size: 8px;
}

.element-tile strong {
    margin-top: 1px;
    color: var(--element);
    font-size: 23px;
    line-height: 1.15;
}

.element-tile span {
    font-size: 10px;
}

.element-tile i {
    margin-top: auto;
    overflow: hidden;
    color: var(--text-muted);
    font-family: var(--mono);
    font-size: 7px;
    font-style: normal;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.series-table {
    min-width: 1230px;
    display: grid;
    grid-template-columns: repeat(18, minmax(0, 1fr));
    grid-template-rows: repeat(2, 82px);
    gap: 5px;
    margin-top: 28px;
}

.series-label {
    grid-column: 3;
    grid-row: 1;
    display: grid;
    place-items: center;
    color: var(--text-secondary);
    font-size: 11px;
    font-weight: 700;
}

.series-label.actinide-label {
    grid-row: 2;
}

.legend {
    display: flex;
    flex-wrap: wrap;
    gap: 12px 18px;
    padding-top: 14px;
    border-top: 1px solid var(--border);
    color: var(--text-secondary);
    font-size: 10px;
}

.legend span {
    display: flex;
    align-items: center;
    gap: 6px;
}

.legend i {
    width: 9px;
    height: 9px;
    border-radius: 3px;
}

@media (max-width: 800px) {
    .periodic-page {
        width: calc(100% - 20px);
    }

    .table-workspace {
        padding: 10px;
    }

    .periodic-toolbox {
        border-radius: 16px;
        padding: 10px;
    }

    .periodic-toolbox .toolbox-identity {
        max-width: 150px;
    }

    .filter-popover {
        grid-template-columns: 1fr 1fr;
        width: min(300px, calc(100vw - 20px));
    }

    .filter-popover button,
    .filter-popover .match-count {
        grid-column: span 1;
    }

    .scroll-hint {
        display: block;
    }
}
</style>
