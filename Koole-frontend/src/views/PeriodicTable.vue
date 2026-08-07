<template>
    <div class="periodic-page">
        <div ref="sceneHost" class="periodic-scene" aria-hidden="true"></div>

        <header class="periodic-header">
            <router-link to="/chem-lab" class="back-link">← 化学实验室</router-link>
            <span class="table-title">PERIODIC TABLE / 元素周期表</span>
            <span class="table-count">118 ELEMENTS</span>
        </header>

        <section class="table-workspace">
            <div class="table-toolbar">
                <label class="search-box">
                    <span>搜索元素</span>
                    <input v-model.trim="query" type="search" placeholder="例如：Na、钠、Sodium、11" />
                </label>
                <select v-model="categoryFilter">
                    <option value="all">全部分类</option>
                    <option v-for="(value, key) in categories" :key="key" :value="key">{{ value.label }}</option>
                </select>
                <select v-model="phaseFilter">
                    <option value="all">全部物态</option>
                    <option v-for="(label, key) in phases" :key="key" :value="key">{{ label }}</option>
                </select>
                <button type="button" @click="clearFilters">清除筛选</button>
                <span class="match-count">{{ matchCount }} / 118</span>
            </div>

            <div class="scroll-hint">可横向滚动查看完整 18 族周期表 →</div>
            <div class="table-scroll">
                <div class="group-labels">
                    <span v-for="group in 18" :key="group" :style="{ gridColumn: group }">{{ group }}</span>
                </div>
                <div class="periodic-grid">
                    <router-link
                        v-for="element in mainElements"
                        :key="element.atomicNumber"
                        :to="`/chem-lab/periodic-table/${element.symbol}`"
                        class="element-tile"
                        :class="{ muted: !matches(element) }"
                        :style="tileStyle(element)"
                        :aria-label="`${element.atomicNumber} 号元素 ${element.name} ${element.symbol}`"
                    >
                        <small>{{ element.atomicNumber }}</small>
                        <strong>{{ element.symbol }}</strong>
                        <span>{{ element.name }}</span>
                        <i>{{ element.atomicMass }}</i>
                    </router-link>
                    <div class="series-placeholder lanthanide-placeholder">57–71<br>镧系</div>
                    <div class="series-placeholder actinide-placeholder">89–103<br>锕系</div>
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
import { PERIODIC_ELEMENTS, ELEMENT_CATEGORIES, ELEMENT_PHASES } from "../constants/periodicElements.js"

const categories = ELEMENT_CATEGORIES
const phases = ELEMENT_PHASES
const query = ref("")
const categoryFilter = ref("all")
const phaseFilter = ref("all")
const sceneHost = ref(null)
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

.periodic-header {
    height: 72px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
}

.back-link {
    color: var(--text-secondary);
    font-size: 12px;
    font-weight: 700;
    text-decoration: none;
}

.back-link:hover {
    color: #2aa27f;
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

.table-toolbar {
    display: grid;
    grid-template-columns: minmax(230px, 1fr) 170px 150px auto auto;
    align-items: center;
    gap: 9px;
    margin-bottom: 18px;
    opacity: 0.82;
}

.search-box {
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
.table-toolbar select {
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

.table-toolbar select {
    padding: 0 10px;
}

.table-toolbar button {
    height: 42px;
    padding: 0 14px;
    border: 1px solid var(--border);
    border-radius: 12px;
    background: transparent;
    color: var(--text-secondary);
}

.match-count {
    color: #2aa27f;
    font-family: var(--mono);
    font-size: 11px;
    text-align: right;
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
    margin-bottom: 5px;
    color: var(--text-muted);
    font-family: var(--mono);
    font-size: 9px;
    text-align: center;
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

.series-placeholder {
    display: grid;
    place-items: center;
    border: 1px dashed var(--border);
    border-radius: 9px;
    color: var(--text-muted);
    font-size: 9px;
    text-align: center;
}

.lanthanide-placeholder {
    grid-row: 6;
    grid-column: 3;
}

.actinide-placeholder {
    grid-row: 7;
    grid-column: 3;
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

    .periodic-header {
        height: 60px;
    }

    .table-workspace {
        padding: 10px;
    }

    .table-toolbar {
        grid-template-columns: 1fr 1fr;
    }

    .search-box {
        grid-column: 1 / -1;
    }

    .match-count {
        text-align: left;
    }

    .scroll-hint {
        display: block;
    }
}
</style>
