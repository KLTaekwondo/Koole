<template>
    <Teleport to="body">
        <div class="depth-scene" :style="heroStyle" aria-hidden="true">
            <div ref="sceneHost" class="scene-host"></div>
        </div>
    </Teleport>

    <section class="depth-hero" :style="heroStyle">
        <div class="hero-copy">
            <p class="eyebrow">{{ eyebrow }}</p>
            <h1>
                <template v-for="(line, index) in titleLines" :key="index">
                    <template v-if="index > 0"><br></template>
                    <em v-if="index === titleLines.length - 1">{{ line }}</em>
                    <template v-else>{{ line }}</template>
                </template>
            </h1>
            <p class="hero-description">{{ description }}</p>
            <div v-if="toActions.length || scrollActions.length" class="hero-actions">
                <router-link
                    v-for="item in toActions"
                    :key="item.label"
                    :to="item.to"
                    class="hero-button"
                    :class="item.variant"
                >{{ item.label }} <span>→</span></router-link>
                <button
                    v-for="item in scrollActions"
                    :key="item.label"
                    type="button"
                    class="hero-button"
                    :class="item.variant"
                    @click="scrollToTarget(item.scroll)"
                >{{ item.label }} <span>↓</span></button>
            </div>
            <div v-if="metaItems.length" class="hero-meta">
                <template v-for="(item, index) in metaItems" :key="item.label">
                    <template v-if="index > 0"><i></i></template>
                    <span><b>{{ item.value }}</b> {{ item.label }}</span>
                </template>
            </div>
        </div>
        <div v-if="sceneLabel" class="scene-label">{{ sceneLabel }}</div>
    </section>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue"
import * as THREE from "three"
import { theme } from "../stores/theme.js"

/**
 * 科目实验室景深首屏：固定背景 3D 场景（鼠标视差）+ 介绍 hero。
 * devices 为装置工厂数组，工厂签名 build(scene) => THREE.Object3D，
 * 返回对象可挂 userData.animate(motion, reducedMotion) 与
 * userData.applyTheme(isDark) 参与每帧动画与主题切换。
 */
const props = defineProps({
    eyebrow: { type: String, default: "" },
    titleLines: { type: Array, default: () => [] },
    description: { type: String, default: "" },
    accent: { type: String, default: "#3b82f6" },
    accent2: { type: String, default: "#f59e0b" },
    sceneLabel: { type: String, default: "" },
    actions: { type: Array, default: () => [] },
    metaItems: { type: Array, default: () => [] },
    devices: { type: Array, default: () => [] },
    particleColor: { type: Number, default: 0x7f9fb8 },
    particleColorDark: { type: Number, default: 0x9fc4da },
})

const sceneHost = ref(null)
const heroStyle = { "--hero-accent": props.accent, "--hero-accent2": props.accent2 }
const toActions = computed(() => props.actions.filter(item => item.to))
const scrollActions = computed(() => props.actions.filter(item => item.scroll))

function scrollToTarget(selector) {
    document.querySelector(selector)?.scrollIntoView({ behavior: "smooth", block: "start" })
}

let renderer = null
let scene = null
let camera = null
let lab = null
let particles = null
let resizeObserver = null
let animationId = 0
let themeStop = null
let pointerX = 0
let pointerY = 0
let reducedMotion = false

function initScene() {
    const host = sceneHost.value
    if (!host) return

    reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    scene = new THREE.Scene()
    camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100)
    camera.position.set(0, 0, 8)

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: "high-performance" })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
    renderer.outputColorSpace = THREE.SRGBColorSpace
    host.appendChild(renderer.domElement)

    lab = new THREE.Group()
    scene.add(lab)

    // 装置工厂：返回 Object3D，挂 userData.animate / userData.applyTheme
    props.devices.forEach(build => {
        const device = build(scene)
        if (device) lab.add(device)
    })

    const particlePositions = []
    for (let index = 0; index < 180; index += 1) {
        particlePositions.push(
            THREE.MathUtils.randFloatSpread(16),
            THREE.MathUtils.randFloatSpread(10),
            THREE.MathUtils.randFloat(-6, 1),
        )
    }
    const particleGeometry = new THREE.BufferGeometry()
    particleGeometry.setAttribute("position", new THREE.Float32BufferAttribute(particlePositions, 3))
    particles = new THREE.Points(
        particleGeometry,
        new THREE.PointsMaterial({ color: props.particleColor, size: 0.032, transparent: true, opacity: 0.7 }),
    )
    scene.add(particles)

    scene.add(new THREE.HemisphereLight(0xffffff, 0x6c777c, 2.2))
    const warmLight = new THREE.PointLight(0xffb066, 12, 18)
    warmLight.position.set(3.2, 2.2, 4)
    scene.add(warmLight)
    const coolLight = new THREE.PointLight(0x8fc8ff, 9, 16)
    coolLight.position.set(-3, -1.5, 3)
    scene.add(coolLight)

    applySceneTheme()
    resizeObserver = new ResizeObserver(resizeScene)
    resizeObserver.observe(host)
    window.addEventListener("pointermove", updatePointer, { passive: true })
    resizeScene()
    animateScene()
}

function applySceneTheme() {
    if (!renderer || !scene) return
    const isDark = theme.value === "dark"
    renderer.setClearColor(isDark ? 0x11151a : 0xf4f3ef, 1)
    scene.fog = new THREE.FogExp2(isDark ? 0x11151a : 0xf4f3ef, isDark ? 0.045 : 0.035)

    lab?.children.forEach(child => child.userData?.applyTheme?.(isDark))
    if (particles) particles.material.color.setHex(isDark ? props.particleColorDark : props.particleColor)
}

function resizeScene() {
    const host = sceneHost.value
    if (!host || !renderer || !camera) return
    const width = Math.max(host.clientWidth, 1)
    const height = Math.max(host.clientHeight, 1)
    renderer.setSize(width, height, false)
    camera.aspect = width / height
    camera.updateProjectionMatrix()
}

function updatePointer(event) {
    pointerX = (event.clientX / window.innerWidth - 0.5) * 2
    pointerY = (event.clientY / window.innerHeight - 0.5) * 2
}

function animateScene(time = 0) {
    if (!renderer || !scene || !camera || !lab) return
    const seconds = time * 0.001
    const motion = reducedMotion ? 0 : seconds

    // 装置自带动画
    lab.children.forEach(child => child.userData?.animate?.(motion, reducedMotion))

    // 装置组整体视差（只随鼠标微动，不持续旋转）
    lab.rotation.y += (pointerX * 0.14 - lab.rotation.y) * 0.035
    lab.rotation.x += (0.08 - pointerY * 0.08 - lab.rotation.x) * 0.035
    lab.position.y = reducedMotion ? 0 : Math.sin(seconds * 0.6) * 0.1
    if (particles && !reducedMotion) particles.rotation.y = seconds * 0.012

    camera.position.x += (pointerX * 0.18 - camera.position.x) * 0.025
    camera.position.y += (pointerY * -0.1 - camera.position.y) * 0.025
    camera.lookAt(0.2, 0.05, 0)
    renderer.render(scene, camera)
    animationId = requestAnimationFrame(animateScene)
}

function disposeScene() {
    cancelAnimationFrame(animationId)
    resizeObserver?.disconnect()
    window.removeEventListener("pointermove", updatePointer)
    scene?.traverse(object => {
        object.geometry?.dispose()
        if (Array.isArray(object.material)) object.material.forEach(material => material.dispose())
        else object.material?.dispose()
    })
    renderer?.dispose()
    renderer?.domElement.remove()
    renderer = null
    scene = null
    camera = null
    lab = null
    particles = null
}

onMounted(() => {
    initScene()
    themeStop = watch(theme, applySceneTheme)
})

onBeforeUnmount(() => {
    themeStop?.()
    disposeScene()
})
</script>

<style scoped>
.depth-scene {
    position: fixed;
    inset: var(--nav-height) 0 0;
    z-index: 1;
    overflow: hidden;
    pointer-events: none;
}

.depth-scene::after {
    content: "";
    position: absolute;
    right: -8vw;
    bottom: -16vh;
    width: min(68vw, 920px);
    height: min(68vw, 920px);
    border-radius: 50%;
    background:
        radial-gradient(circle at 50% 50%,
            color-mix(in srgb, var(--hero-accent2) 34%, transparent) 0%,
            color-mix(in srgb, var(--hero-accent) 20%, transparent) 38%,
            transparent 74%);
    filter: blur(18px);
}

:global(:root[data-theme="dark"]) .depth-scene::after {
    background:
        radial-gradient(circle at 50% 50%,
            color-mix(in srgb, var(--hero-accent2) 18%, transparent) 0%,
            color-mix(in srgb, var(--hero-accent) 10%, transparent) 38%,
            transparent 72%);
}

.scene-host,
.scene-host :deep(canvas) {
    width: 100%;
    height: 100%;
    display: block;
}

.depth-hero {
    position: relative;
    width: 100vw;
    height: calc(100svh - var(--nav-height));
    min-height: 620px;
    display: flex;
    align-items: center;
    margin-left: calc(50% - 50vw);
    padding: 80px max(24px, calc((100vw - 1180px) / 2)) 96px;
}

.hero-copy {
    width: min(650px, 62vw);
    animation: copy-in 0.8s ease-out both;
}

.eyebrow {
    font-family: var(--mono);
    letter-spacing: 0.12em;
    color: var(--hero-accent);
    font-size: 10px;
    font-weight: 700;
}

.hero-copy h1 {
    margin: 24px 0 22px;
    color: var(--text);
    font-size: clamp(44px, 5.4vw, 68px);
    font-weight: 850;
    line-height: 1.08;
    letter-spacing: 0;
}

/* 标题强调字：accent → accent2 渐变 */
.hero-copy h1 em {
    font-style: normal;
    background: linear-gradient(92deg, var(--hero-accent) 15%, var(--hero-accent2) 85%);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
}

.hero-description {
    max-width: 570px;
    color: var(--text-secondary);
    font-size: 16px;
    line-height: 1.85;
}

.hero-actions {
    display: flex;
    gap: 12px;
    margin-top: 34px;
}

.hero-button {
    min-height: 46px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 16px;
    padding: 0 21px;
    border-radius: 6px;
    font-size: 13px;
    font-weight: 700;
    cursor: pointer;
    text-decoration: none;
    transition: transform 0.2s, box-shadow 0.25s, border-color 0.25s, color 0.25s;
}

.hero-button.primary {
    border: 1px solid var(--hero-accent);
    background: var(--hero-accent);
    color: #fff;
}

.hero-button.outline {
    border: 1px solid color-mix(in srgb, var(--border) 82%, transparent);
    background: transparent;
    color: var(--text);
}

.hero-button:hover {
    transform: translateY(-2px);
}

.hero-button.primary:hover {
    box-shadow: 0 10px 26px color-mix(in srgb, var(--hero-accent) 48%, transparent);
}

.hero-button.outline:hover {
    border-color: var(--hero-accent2);
    color: var(--hero-accent2);
}

.hero-meta {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-top: 42px;
    color: var(--text-secondary);
    font-size: 11px;
}

.hero-meta b {
    color: var(--text);
    font-family: var(--mono);
    font-size: 17px;
}

.hero-meta i {
    width: 1px;
    height: 24px;
    background: color-mix(in srgb, var(--border) 82%, transparent);
}

.scene-label {
    position: absolute;
    right: max(24px, calc((100vw - 1180px) / 2));
    bottom: 38px;
    color: var(--text-secondary);
    font-family: var(--mono);
    font-size: 9px;
    letter-spacing: 0.1em;
}

@keyframes copy-in {
    from {
        opacity: 0;
        transform: translateY(18px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@media (max-width: 980px) {
    .hero-copy {
        width: min(720px, 76%);
    }
}

@media (max-width: 680px) {
    .depth-hero {
        min-height: calc(100svh - var(--nav-height));
        height: auto;
        padding: 58px 16px 72px;
    }

    .depth-scene::after {
        right: -38vw;
        bottom: -8vh;
        width: 110vw;
        height: 110vw;
        opacity: 0.82;
    }

    .hero-copy {
        width: 100%;
    }

    .hero-copy h1 {
        font-size: clamp(40px, 12vw, 54px);
    }

    .hero-description {
        max-width: 88%;
        font-size: 14px;
    }

    .hero-actions {
        align-items: stretch;
        flex-direction: column;
        width: min(100%, 320px);
    }

    .scene-label {
        display: none;
    }
}

@media (prefers-reduced-motion: reduce) {
    .hero-copy {
        animation: none;
    }
}
</style>
