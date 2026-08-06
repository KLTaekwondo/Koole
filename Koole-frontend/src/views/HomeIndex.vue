<template>
    <div class="home-page">
        <Teleport to="body">
            <div class="home-scene" aria-hidden="true">
                <div ref="sceneHost" class="scene-host"></div>
            </div>
        </Teleport>

        <section class="hero-section">
            <div class="hero-copy">
                <p class="eyebrow">KOOLE / VISUAL KNOWLEDGE</p>
                <h1>把知识变成<br><em>可探索的世界</em></h1>
                <p class="hero-description">九门学科，一个持续生长的可视化平台。观察规律，调节参数，亲手理解那些原本只存在于课本里的内容。</p>
                <div class="hero-actions">
                    <button class="primary-button" type="button" @click="goExplore">开始探索 <span>↗</span></button>
                    <button class="outline-button" type="button" @click="scrollToSubjects">查看学科 <span>↓</span></button>
                </div>
                <div class="hero-meta">
                    <span><b>{{ physicsCount }}</b> 个物理模型</span>
                    <i></i>
                    <span><b>3</b> 个开放实验室</span>
                </div>
            </div>
            <div class="scene-label">INTERACTIVE FIELD / 001</div>
        </section>

        <section ref="subjectsSection" class="subjects-section">
            <header class="section-heading">
                <div>
                    <small>01 / DISCIPLINES</small>
                    <h2>从一个问题开始。</h2>
                </div>
                <p>不同的知识，需要不同的观察方式。选择一门学科，进入它自己的实验现场。</p>
            </header>

            <div
                class="subject-carousel"
                @mouseenter="pauseCarousel"
                @mouseleave="resumeCarousel"
                @focusin="pauseCarousel"
                @focusout="resumeCarousel"
                @pointerdown="startSubjectDrag"
                @pointerup="endSubjectDrag"
                @pointercancel="cancelSubjectDrag"
            >
                <button class="carousel-arrow" :class="{ previous: true }" type="button" aria-label="上一门学科" @click.stop="previousSubject">←</button>
                <div class="carousel-stage">
                    <router-link
                        v-for="(subject, index) in subjects"
                        :key="subject.id"
                        :to="subject.path"
                        class="subject-card"
                        :class="[{ ready: subject.status === 'ready' }, subjectPositionClass(index)]"
                        :style="{ color: subject.color }"
                        :aria-hidden="index !== activeSubject"
                        :tabindex="index === activeSubject ? 0 : -1"
                    >
                        <div class="subject-top">
                            <span>{{ subject.number }}</span>
                            <span>{{ subject.status === 'ready' ? 'OPEN LAB' : 'IN DEVELOPMENT' }}</span>
                        </div>
                        <div class="subject-icon" v-html="subject.icon"></div>
                        <h3>{{ subject.name }}</h3>
                        <p>{{ subject.description }}</p>
                        <div class="subject-bottom">
                            <span>{{ subject.vision }}</span>
                            <b>{{ subject.status === 'ready' ? '进入 ↗' : '查看规划 ↗' }}</b>
                        </div>
                    </router-link>
                </div>
                <button class="carousel-arrow" :class="{ next: true }" type="button" aria-label="下一门学科" @click.stop="nextSubject">→</button>
                <div class="carousel-footer">
                    <span><b>{{ currentSubjectNumber }}</b> / {{ String(subjects.length).padStart(2, "0") }}</span>
                    <div class="carousel-progress"><i :style="{ width: subjectProgress }"></i></div>
                </div>
            </div>
        </section>

        <section class="features-section">
            <header class="features-heading">
                <div>
                    <small>02 / HOW IT WORKS</small>
                    <h2>把学习变成<br><em>可以反复验证的过程。</em></h2>
                </div>
                <p>Koole 不只展示结论，而是把知识拆成可以观察、操作和比较的过程。</p>
            </header>
            <div class="feature-grid">
                <article class="feature-item">
                    <span class="feature-number">01</span>
                    <div class="feature-icon">◌</div>
                    <h3>可视化理解</h3>
                    <p>把公式、结构和抽象规律转化为动态画面，让变化过程真正被看见。</p>
                    <span class="feature-caption">SEE THE RULE</span>
                </article>
                <article class="feature-item">
                    <span class="feature-number">02</span>
                    <div class="feature-icon">↻</div>
                    <h3>自由模拟</h3>
                    <p>自己调节参数、改变条件和重复实验，在操作中发现变量之间的关系。</p>
                    <span class="feature-caption">CHANGE THE INPUT</span>
                </article>
                <article class="feature-item">
                    <span class="feature-number">03</span>
                    <div class="feature-icon">⌁</div>
                    <h3>数据比对</h3>
                    <p>保存不同实验结果并进行对照，从数据变化中判断规律，而不是只记住答案。</p>
                    <span class="feature-caption">COMPARE THE RESULT</span>
                </article>
            </div>
        </section>
    </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue"
import { useRouter } from "vue-router"
import * as THREE from "three"
import { PHYSICS_MODELS } from "../constants/physicsModels.js"
import { SUBJECTS } from "../constants/subjects.js"
import { theme } from "../stores/theme.js"
import { HOME_SUBJECT_ICONS } from "../constants/homeSubjects.js"

const router = useRouter()
const sceneHost = ref(null)
const subjectsSection = ref(null)
const activeSubject = ref(3)
const carouselPaused = ref(false)
const physicsCount = PHYSICS_MODELS.length
const revealObservers = []
const subjectRoutes = Object.fromEntries(SUBJECTS.map(subject => [subject.id, subject]))
const subjects = [
    { id: "chinese", number: "01", name: "语文", description: "从文字、人物与意象，看见文章内部的脉络。", vision: "文本 · 关系 · 意象", color: "#d95b4c", path: subjectRoutes.chinese.path, status: subjectRoutes.chinese.status, icon: HOME_SUBJECT_ICONS.chinese },
    { id: "math", number: "02", name: "数学", description: "拖动变量，让函数、几何和概率呈现变化。", vision: "函数 · 几何 · 概率", color: "#477cdb", path: subjectRoutes.math.path, status: subjectRoutes.math.status, icon: HOME_SUBJECT_ICONS.math },
    { id: "english", number: "03", name: "英语", description: "拆解句子结构，在语境里连接词义与表达。", vision: "语境 · 句法 · 发音", color: "#866bd5", path: subjectRoutes.english.path, status: subjectRoutes.english.status, icon: HOME_SUBJECT_ICONS.english },
    { id: "physics", number: "04", name: "物理", description: "改变参数，观察力、运动、光与电如何作用。", vision: `${physicsCount} 个模型 · 沙盒`, color: "#e05a4d", path: subjectRoutes.physics.path, status: subjectRoutes.physics.status, icon: HOME_SUBJECT_ICONS.physics },
    { id: "chemistry", number: "05", name: "化学", description: "旋转分子与晶体，从微观结构认识物质。", vision: "分子 · 化学键 · 晶体", color: "#2aa27f", path: subjectRoutes.chemistry.path, status: subjectRoutes.chemistry.status, icon: HOME_SUBJECT_ICONS.chemistry },
    { id: "biology", number: "06", name: "生物", description: "进入细胞与生命结构，在三维空间观察层次。", vision: "细胞 · DNA · 神经元", color: "#6ca647", path: subjectRoutes.biology.path, status: subjectRoutes.biology.status, icon: HOME_SUBJECT_ICONS.biology },
    { id: "politics", number: "07", name: "政治", description: "连接概念、制度与现实案例，建立思考框架。", vision: "概念 · 制度 · 案例", color: "#cf9136", path: subjectRoutes.politics.path, status: subjectRoutes.politics.status, icon: HOME_SUBJECT_ICONS.politics },
    { id: "history", number: "08", name: "历史", description: "在时间、人物与事件之间看清因果联系。", vision: "时间 · 人物 · 事件", color: "#a8744c", path: subjectRoutes.history.path, status: subjectRoutes.history.status, icon: HOME_SUBJECT_ICONS.history },
    { id: "geography", number: "09", name: "地理", description: "转动地球、展开地图，理解空间中的自然规律。", vision: "地球 · 地图 · 气候", color: "#2b9cab", path: subjectRoutes.geography.path, status: subjectRoutes.geography.status, icon: HOME_SUBJECT_ICONS.geography },
]

const currentSubjectNumber = computed(() => String(activeSubject.value + 1).padStart(2, "0"))
const subjectProgress = computed(() => `${((activeSubject.value + 1) / subjects.length) * 100}%`)

let renderer = null
let scene = null
let camera = null
let atom = null
let particles = null
let resizeObserver = null
let animationId = 0
let themeStop = null
let carouselTimer = null
let dragStartX = null
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

    atom = new THREE.Group()
    atom.position.set(2.15, 0, 0)
    scene.add(atom)

    const core = new THREE.Mesh(
        new THREE.IcosahedronGeometry(1.08, 3),
        new THREE.MeshPhysicalMaterial({ color: 0xe2683f, emissive: 0x6b1d0d, emissiveIntensity: 0.35, roughness: 0.3, metalness: 0.08, clearcoat: 0.9 }),
    )
    core.name = "core"
    atom.add(core)

    const shell = new THREE.Mesh(
        new THREE.IcosahedronGeometry(1.2, 2),
        new THREE.MeshBasicMaterial({ color: 0xffad8d, wireframe: true, transparent: true, opacity: 0.24 }),
    )
    shell.name = "shell"
    atom.add(shell)

    const orbitSpecs = [
        { radius: 2.1, squash: 0.43, rotation: [0.2, 0.2, -0.35], color: 0x5ecad4, phase: 0 },
        { radius: 2.55, squash: 0.39, rotation: [1.05, 0.4, 0.62], color: 0xf0a170, phase: 2.1 },
        { radius: 2.95, squash: 0.36, rotation: [0.55, 1.2, 1.1], color: 0xb9dadd, phase: 4.2 },
    ]

    atom.userData.electrons = orbitSpecs.map(spec => {
        const points = new THREE.EllipseCurve(0, 0, spec.radius, spec.radius * spec.squash, 0, Math.PI * 2)
            .getPoints(160)
            .map(point => new THREE.Vector3(point.x, point.y, 0))
        const orbit = new THREE.LineLoop(
            new THREE.BufferGeometry().setFromPoints(points),
            new THREE.LineBasicMaterial({ color: spec.color, transparent: true, opacity: 0.62 }),
        )
        orbit.rotation.set(...spec.rotation)
        atom.add(orbit)

        const electron = new THREE.Mesh(
            new THREE.SphereGeometry(0.11, 20, 20),
            new THREE.MeshStandardMaterial({ color: spec.color, emissive: spec.color, emissiveIntensity: 2 }),
        )
        atom.add(electron)
        return { electron, ...spec, rotation: new THREE.Euler(...spec.rotation) }
    })

    const particlePositions = []
    for (let index = 0; index < 220; index += 1) {
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
        new THREE.PointsMaterial({ color: 0x6e9da2, size: 0.035, transparent: true, opacity: 0.7 }),
    )
    scene.add(particles)

    scene.add(new THREE.HemisphereLight(0xffffff, 0x6c777c, 2.2))
    const warmLight = new THREE.PointLight(0xff9a72, 13, 18)
    warmLight.position.set(3.5, 2.4, 4)
    scene.add(warmLight)
    const coolLight = new THREE.PointLight(0x70d5dd, 8, 16)
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
    if (!renderer || !scene || !atom || !particles) return
    const isDark = theme.value === "dark"
    renderer.setClearColor(isDark ? 0x111516 : 0xf4f3ef, 1)
    scene.fog = new THREE.FogExp2(isDark ? 0x111516 : 0xf4f3ef, isDark ? 0.045 : 0.035)

    const core = atom.getObjectByName("core")
    const shell = atom.getObjectByName("shell")
    core.material.color.setHex(isDark ? 0xd75549 : 0xe2683f)
    core.material.emissive.setHex(isDark ? 0x55100c : 0x6b1d0d)
    core.material.emissiveIntensity = isDark ? 0.72 : 0.35
    shell.material.color.setHex(isDark ? 0xff9b91 : 0xd85f3b)
    particles.material.color.setHex(isDark ? 0x91d4da : 0x668f93)
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
    if (!renderer || !scene || !camera || !atom) return
    const seconds = time * 0.001
    const motion = reducedMotion ? 0 : seconds

    atom.rotation.y += (pointerX * 0.16 + motion * 0.12 - atom.rotation.y) * 0.035
    atom.rotation.x += (0.15 - pointerY * 0.1 - atom.rotation.x) * 0.035
    atom.position.y = reducedMotion ? 0 : Math.sin(seconds * 0.72) * 0.12
    atom.userData.electrons.forEach(item => {
        const angle = motion * 0.72 + item.phase
        const point = new THREE.Vector3(item.radius * Math.cos(angle), item.radius * item.squash * Math.sin(angle), 0)
        item.electron.position.copy(point.applyEuler(item.rotation))
    })
    if (particles && !reducedMotion) particles.rotation.y = seconds * 0.012

    camera.position.x += (pointerX * 0.18 - camera.position.x) * 0.025
    camera.position.y += (pointerY * -0.1 - camera.position.y) * 0.025
    camera.lookAt(0.75, 0, 0)
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
    atom = null
    particles = null
}

function subjectPositionClass(index) {
    const offset = (index - activeSubject.value + subjects.length) % subjects.length
    if (offset === 0) return "is-active"
    if (offset === 1) return "is-next"
    if (offset === subjects.length - 1) return "is-previous"
    return "is-hidden"
}

function nextSubject() {
    activeSubject.value = (activeSubject.value + 1) % subjects.length
    restartCarousel()
}

function previousSubject() {
    activeSubject.value = (activeSubject.value - 1 + subjects.length) % subjects.length
    restartCarousel()
}

function startCarousel() {
    if (reducedMotion || carouselPaused.value || carouselTimer) return
    carouselTimer = window.setInterval(() => {
        activeSubject.value = (activeSubject.value + 1) % subjects.length
    }, 5000)
}

function stopCarousel() {
    window.clearInterval(carouselTimer)
    carouselTimer = null
}

function restartCarousel() {
    stopCarousel()
    startCarousel()
}

function pauseCarousel() {
    carouselPaused.value = true
    stopCarousel()
}

function resumeCarousel() {
    carouselPaused.value = false
    startCarousel()
}

function startSubjectDrag(event) {
    dragStartX = event.clientX
    pauseCarousel()
}

function endSubjectDrag(event) {
    if (dragStartX === null) return
    const distance = event.clientX - dragStartX
    dragStartX = null
    if (Math.abs(distance) > 45) {
        if (distance < 0) nextSubject()
        else previousSubject()
    }
    resumeCarousel()
}

function cancelSubjectDrag() {
    dragStartX = null
    resumeCarousel()
}

function goExplore() {
    router.push("/physics-lab")
}

function scrollToSubjects() {
    subjectsSection.value?.scrollIntoView({ behavior: "smooth", block: "start" })
}

onMounted(() => {
    initScene()
    themeStop = watch(theme, applySceneTheme)
    document.querySelectorAll(".reveal-section").forEach(section => {
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => entry.target.classList.toggle("is-visible", entry.isIntersecting))
        }, { threshold: 0.08 })
        observer.observe(section)
        revealObservers.push(observer)
    })
    startCarousel()
})

onBeforeUnmount(() => {
    themeStop?.()
    stopCarousel()
    revealObservers.forEach(observer => observer.disconnect())
    disposeScene()
})
</script>

<style scoped>
.home-scene {
    position: fixed;
    inset: var(--nav-height) 0 0;
    z-index: 1;
    overflow: hidden;
    pointer-events: none;
}

.scene-host,
.scene-host :deep(canvas) {
    width: 100%;
    height: 100%;
    display: block;
}

.home-page {
    --ink: var(--text);
    --muted: var(--text-secondary);
    --line: color-mix(in srgb, var(--border) 82%, transparent);
    position: relative;
    z-index: 2;
    width: min(1180px, calc(100% - 48px));
    margin: -32px auto 0;
    color: var(--ink);
}

.hero-section {
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

.eyebrow,
.section-heading small,
.manifesto-head {
    font-family: var(--mono);
    letter-spacing: 0.12em;
}

.eyebrow,
.section-heading small {
    color: #c94c40;
    font-size: 10px;
    font-weight: 700;
}

.hero-copy h1 {
    margin: 24px 0 22px;
    color: var(--ink);
    font-size: clamp(48px, 5.8vw, 76px);
    font-weight: 850;
    line-height: 1.08;
    letter-spacing: 0;
}

.hero-copy h1 em,
.manifesto-section h2 em {
    color: #c94c40;
    font-style: normal;
}

.hero-description {
    max-width: 570px;
    color: var(--muted);
    font-size: 16px;
    line-height: 1.85;
}

.hero-actions {
    display: flex;
    gap: 12px;
    margin-top: 34px;
}

.primary-button,
.outline-button {
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
}

.primary-button {
    border: 1px solid #c94c40;
    background: #c94c40;
    color: #fff;
}

.outline-button {
    border: 1px solid var(--line);
    background: transparent;
    color: var(--ink);
}

.primary-button:hover,
.outline-button:hover {
    transform: translateY(-2px);
}

.hero-meta {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-top: 42px;
    color: var(--muted);
    font-size: 11px;
}

.hero-meta b {
    color: var(--ink);
    font-family: var(--mono);
    font-size: 17px;
}

.hero-meta i {
    width: 1px;
    height: 24px;
    background: var(--line);
}

.scene-label {
    position: absolute;
    right: max(24px, calc((100vw - 1180px) / 2));
    bottom: 38px;
    color: var(--muted);
    font-family: var(--mono);
    font-size: 9px;
    letter-spacing: 0.1em;
}

.reveal-section {
    opacity: 0;
    transform: translateY(34px);
    transition: opacity 0.8s ease-out, transform 0.8s ease-out;
}

.reveal-section.is-visible {
    opacity: 1;
    transform: translateY(0);
}

.subjects-section {
    width: 100vw;
    margin-left: calc(50% - 50vw);
    padding: 104px max(24px, calc((100vw - 1180px) / 2)) 112px;
    scroll-margin-top: var(--nav-height);
}

.section-heading {
    display: grid;
    grid-template-columns: minmax(0, 1.3fr) minmax(260px, 0.7fr);
    align-items: end;
    gap: 50px;
    margin-bottom: 44px;
}

.section-heading h2 {
    margin-top: 14px;
    color: var(--ink);
    font-size: clamp(34px, 4vw, 49px);
    line-height: 1.18;
}

.section-heading > p {
    color: var(--muted);
    font-size: 13px;
    line-height: 1.8;
}

.subject-carousel {
    position: relative;
    padding: 14px 64px 58px;
    overflow: hidden;
    touch-action: pan-y;
    user-select: none;
}

.carousel-stage {
    position: relative;
    height: 390px;
    perspective: 1200px;
}

.subject-card {
    position: absolute;
    top: 22px;
    left: 50%;
    width: min(390px, 37vw);
    min-height: 340px;
    display: flex;
    flex-direction: column;
    padding: 30px;
    border: 1px solid color-mix(in srgb, var(--line) 86%, var(--ink));
    border-radius: 8px;
    background: var(--bg-card);
    color: var(--ink);
    text-decoration: none;
    box-shadow: 0 22px 54px rgba(20, 28, 34, 0.14), 0 0 0 rgba(20, 28, 34, 0);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    opacity: 0;
    pointer-events: none;
    transform: translateX(-50%) scale(0.78);
    transition: transform 0.58s ease-out, opacity 0.45s ease, border-color 0.3s, box-shadow 0.3s;
}

.subject-card.is-active {
    z-index: 3;
    opacity: 1;
    pointer-events: auto;
    transform: translateX(-50%) translateZ(60px);
}

.subject-card.is-previous {
    z-index: 2;
    opacity: 0.42;
    transform: translateX(calc(-50% - min(34vw, 410px))) rotateY(8deg) scale(0.84);
}

.subject-card.is-next {
    z-index: 2;
    opacity: 0.42;
    transform: translateX(calc(-50% + min(34vw, 410px))) rotateY(-8deg) scale(0.84);
}

.subject-card.is-hidden {
    visibility: hidden;
}

.subject-card:hover.is-active {
    border-color: currentColor;
    background: var(--bg-card);
    box-shadow: 0 24px 58px rgba(20, 28, 34, 0.18), 0 0 26px color-mix(in srgb, currentColor 24%, transparent);
    transform: translateX(-50%) translateY(-5px) translateZ(60px);
}

.subject-top,
.subject-bottom {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.subject-top {
    color: var(--muted);
    font-family: var(--mono);
    font-size: 9px;
}

.subject-icon {
    width: 44px;
    height: 44px;
    display: grid;
    place-items: center;
    margin-top: 32px;
    color: currentColor;
}

.subject-icon :deep(svg) {
    width: 27px;
    height: 27px;
}

.subject-card h3 {
    margin: 18px 0 7px;
    color: var(--ink);
    font-size: 23px;
}

.subject-card > p {
    max-width: 270px;
    color: var(--muted);
    font-size: 12px;
    line-height: 1.75;
}

.subject-bottom {
    margin-top: auto;
    padding-top: 24px;
    color: currentColor;
    font-size: 9px;
    font-weight: 700;
}

.subject-bottom b {
    white-space: nowrap;
}

.carousel-arrow {
    position: absolute;
    top: 180px;
    z-index: 5;
    width: 44px;
    height: 44px;
    border: 1px solid var(--line);
    border-radius: 50%;
    background: transparent;
    color: var(--ink);
    cursor: pointer;
}

.carousel-arrow:hover {
    border-color: #c94c40;
    color: #c94c40;
}

.carousel-arrow.previous { left: 2px; }
.carousel-arrow.next { right: 2px; }

.carousel-footer {
    width: min(390px, 37vw);
    display: flex;
    align-items: center;
    gap: 18px;
    margin: 15px auto 0;
    color: var(--muted);
    font-family: var(--mono);
    font-size: 9px;
}

.carousel-footer b {
    color: var(--ink);
    font-size: 13px;
}

.carousel-progress {
    width: 100%;
    height: 2px;
    background: var(--line);
}

.carousel-progress i {
    display: block;
    height: 100%;
    background: #c94c40;
    transition: width 0.45s ease-out;
}

.manifesto-section {
    min-height: 520px;
    display: flex;
    flex-direction: column;
    padding: clamp(40px, 6vw, 76px);
    margin: 0 0 72px;
    border: 1px solid var(--line);
    border-radius: 8px;
}

.manifesto-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-bottom: 25px;
    border-bottom: 1px solid var(--line);
    color: var(--muted);
    font-size: 9px;
}

.manifesto-content {
    display: grid;
    grid-template-columns: minmax(0, 1.25fr) minmax(280px, 0.75fr);
    align-items: end;
    gap: clamp(40px, 8vw, 120px);
    margin-top: auto;
    padding-top: 80px;
}

.manifesto-section h2 {
    color: var(--ink);
    font-size: clamp(38px, 5vw, 66px);
    line-height: 1.13;
}

.manifesto-copy > p {
    color: var(--muted);
    font-size: 13px;
    line-height: 1.9;
}

.idea-points {
    display: grid;
    gap: 10px;
    margin: 27px 0 30px;
    padding-top: 20px;
    border-top: 1px solid var(--line);
}

.idea-points span {
    color: var(--ink);
    font-size: 11px;
}

.idea-points b {
    margin-right: 14px;
    color: #c94c40;
    font-family: var(--mono);
    font-size: 9px;
}

.features-section {
    padding: 104px 0 128px;
    border-top: 1px solid var(--line);
}

.features-heading {
    display: grid;
    grid-template-columns: minmax(0, 1.3fr) minmax(260px, 0.7fr);
    align-items: end;
    gap: 50px;
    margin-bottom: 52px;
}

.features-heading small {
    color: #c94c40;
    font-family: var(--mono);
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.12em;
}

.features-heading h2 {
    margin-top: 14px;
    color: var(--ink);
    font-size: clamp(34px, 4vw, 49px);
    line-height: 1.18;
}

.features-heading h2 em {
    color: #c94c40;
    font-style: normal;
}

.features-heading > p {
    color: var(--muted);
    font-size: 13px;
    line-height: 1.8;
}

.feature-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    border-top: 1px solid var(--line);
    border-bottom: 1px solid var(--line);
}

.feature-item {
    position: relative;
    min-height: 300px;
    padding: 28px 30px 30px;
    border-right: 1px solid var(--line);
}

.feature-item:last-child {
    border-right: 0;
}

.feature-number,
.feature-caption {
    color: var(--muted);
    font-family: var(--mono);
    font-size: 9px;
    letter-spacing: 0.1em;
}

.feature-icon {
    margin: 38px 0 22px;
    color: #c94c40;
    font-size: 38px;
    line-height: 1;
}

.feature-item h3 {
    margin-bottom: 10px;
    color: var(--ink);
    font-size: 21px;
}

.feature-item p {
    max-width: 260px;
    color: var(--muted);
    font-size: 12px;
    line-height: 1.85;
}

.feature-caption {
    position: absolute;
    right: 30px;
    bottom: 30px;
    color: #c94c40;
    font-size: 8px;
}

.feature-item:hover .feature-icon {
    transform: translateY(-4px);
}
@keyframes copy-in {
    from { opacity: 0; transform: translateY(18px); }
    to { opacity: 1; transform: translateY(0); }
}

@media (max-width: 980px) {
    .hero-copy { width: min(720px, 76%); }
    .subject-carousel { padding-inline: 0; }
    .subject-card { width: min(330px, 78vw); }
    .subject-card.is-previous { transform: translateX(calc(-50% - 70vw)) scale(0.82); }
    .subject-card.is-next { transform: translateX(calc(-50% + 70vw)) scale(0.82); }
    .carousel-footer { width: min(330px, 78vw); }
}

@media (max-width: 680px) {
    .home-page { width: min(100% - 32px, 1180px); }
    .hero-section { min-height: calc(100svh - var(--nav-height)); height: auto; padding: 58px 16px 72px; }
    .hero-copy { width: 100%; }
    .hero-copy h1 { font-size: clamp(40px, 12vw, 54px); }
    .hero-description { max-width: 88%; font-size: 14px; }
    .hero-actions { align-items: stretch; flex-direction: column; width: min(100%, 320px); }
    .scene-label { display: none; }
    .subjects-section { padding: 78px 16px 84px; }
    .section-heading { grid-template-columns: 1fr; gap: 18px; }
    .carousel-stage { height: 360px; }
    .subject-card { width: calc(100% - 52px); min-height: 315px; padding: 22px; }
    .subject-card.is-previous { transform: translateX(-120%) scale(0.86); }
    .subject-card.is-next { transform: translateX(20%) scale(0.86); }
    .carousel-arrow { top: 160px; width: 38px; height: 38px; }
    .carousel-footer { width: calc(100% - 52px); }
    .manifesto-section { min-height: 560px; padding: 32px 24px; }
    .manifesto-content { grid-template-columns: 1fr; gap: 40px; padding-top: 54px; }

    .features-section {
        padding: 78px 0 96px;
    }

    .features-heading {
        grid-template-columns: 1fr;
        gap: 18px;
    }

    .feature-grid {
        grid-template-columns: 1fr;
    }

    .feature-item {
        min-height: 250px;
        border-right: 0;
        border-bottom: 1px solid var(--line);
    }

    .feature-item:last-child {
        border-bottom: 0;
    }
}

@media (prefers-reduced-motion: reduce) {
    .hero-copy { animation: none; }
    .reveal-section { opacity: 1; transform: none; }
    .subject-card,
    .carousel-progress i { transition: none; }
}
</style>
