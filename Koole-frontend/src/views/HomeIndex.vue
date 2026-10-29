<template>
    <div class="home-page">
        <HomeScene />

        <section class="hero-section">
            <div class="hero-copy">
                <p class="eyebrow">KOOLE / VISUAL KNOWLEDGE</p>
                <h1>把知识变成<br><em>可探索的世界</em></h1>
                <p class="hero-description">理科可视实验室：物理、数学、化学。观察规律，调节参数，亲手理解那些原本只存在于课本里的内容。</p>
                <div class="hero-actions">
                    <button class="primary-button" type="button" @click="goExplore">开始探索 <span>↗</span></button>
                    <button class="outline-button" type="button" @click="scrollToSubjects">查看学科 <span>↓</span></button>
                </div>
                <div class="hero-meta">
                    <span><b>{{ physicsCount }}</b> 个物理模型</span>
                    <i></i>
                    <span><b>{{ openLabCount }}</b> 个开放实验室</span>
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
                        v-for="(subject, index) in subjectCards"
                        :key="subject.id"
                        :to="subject.path"
                        class="subject-card"
                        :class="[subject.tier, subjectPositionClass(index)]"
                        :style="{ color: subject.color }"
                        :aria-hidden="index !== activeSubject"
                        :tabindex="index === activeSubject ? 0 : -1"
                    >
                        <div class="subject-top">
                            <span>{{ subject.number }}</span>
                            <span>{{ subject.tier === 'public' ? 'OPEN LAB' : subject.tier === 'planned' ? 'COMING SOON' : 'MORE' }}</span>
                        </div>
                        <div class="subject-icon" v-html="subject.icon"></div>
                        <h3>{{ subject.name }}</h3>
                        <p>{{ subject.description }}</p>
                        <div class="subject-bottom">
                            <span>{{ subject.vision }}</span>
                            <b>{{ subject.tier === 'public' ? '进入 ↗' : subject.tier === 'planned' ? '即将开放 ↗' : '查看规划 ↗' }}</b>
                        </div>
                    </router-link>
                </div>
                <button class="carousel-arrow" :class="{ next: true }" type="button" aria-label="下一门学科" @click.stop="nextSubject">→</button>
                <div class="carousel-footer">
                    <span><b>{{ currentSubjectNumber }}</b> / {{ String(subjectCards.length).padStart(2, "0") }}</span>
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
import { computed, defineAsyncComponent, onBeforeUnmount, onMounted, ref } from "vue"
import { useRouter } from "vue-router"
import { ARCHIVED_SUBJECTS, SUBJECTS } from "../constants/subjects.js"
import { PHYSICS_MODEL_COUNT } from "../constants/siteStats.js"
import { HOME_SUBJECT_ICONS } from "../constants/homeSubjects.js"

// 首页背景的三维原子场景单独拆包，异步加载：Three.js 不进首屏，先出文字与卡片
const HomeScene = defineAsyncComponent(() => import("../components/HomeScene.vue"))

const router = useRouter()
const subjectsSection = ref(null)
const carouselPaused = ref(false)
const physicsCount = PHYSICS_MODEL_COUNT
const revealObservers = []// 首页学科卡片：public + planned 各占一张，archived 收进一张「其他学科」卡片。
// 卡片信息全部来自 constants/subjects.js，这里不再硬编码学科名称、描述和颜色。
const MORE_SUBJECTS_ICON = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="18" cy="12" r="1.6"/></svg>`

const subjectCards = [
    ...SUBJECTS
        .filter(subject => subject.visibility === "public" || subject.visibility === "planned")
        .map(subject => ({
            ...subject,
            tier: subject.visibility === "public" ? "public" : "planned",
            icon: HOME_SUBJECT_ICONS[subject.id],
            vision: subject.id === "physics" ? `${physicsCount} 个模型 · 关卡 · 沙盒` : subject.vision,
        })),
    ...(ARCHIVED_SUBJECTS.length ? [{
        id: "more",
        tier: "more",
        number: String(SUBJECTS.length - ARCHIVED_SUBJECTS.length + 1).padStart(2, "0"),
        name: "其他学科",
        path: "/subjects",
        color: "#7c8794",
        description: `${ARCHIVED_SUBJECTS.map(subject => subject.name).join("、")}等学科暂未纳入规划。`,
        vision: "查看规划",
        icon: MORE_SUBJECTS_ICON,
    }] : []),
]

const initialSubjectIndex = Math.max(subjectCards.findIndex(subject => subject.id === "physics"), 0)
const activeSubject = ref(initialSubjectIndex)
const openLabCount = SUBJECTS.filter(subject => subject.visibility === "public").length

const currentSubjectNumber = computed(() => String(activeSubject.value + 1).padStart(2, "0"))
const subjectProgress = computed(() => `${((activeSubject.value + 1) / subjectCards.length) * 100}%`)

let carouselTimer = null
let dragStartX = null
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches

function subjectPositionClass(index) {
    const offset = (index - activeSubject.value + subjectCards.length) % subjectCards.length
    if (offset === 0) return "is-active"
    if (offset === 1) return "is-next"
    if (offset === subjectCards.length - 1) return "is-previous"
    return "is-hidden"
}

function nextSubject() {
    activeSubject.value = (activeSubject.value + 1) % subjectCards.length
    restartCarousel()
}

function previousSubject() {
    activeSubject.value = (activeSubject.value - 1 + subjectCards.length) % subjectCards.length
    restartCarousel()
}

function startCarousel() {
    if (reducedMotion || carouselPaused.value || carouselTimer) return
    carouselTimer = window.setInterval(() => {
        activeSubject.value = (activeSubject.value + 1) % subjectCards.length
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
    stopCarousel()
    revealObservers.forEach(observer => observer.disconnect())
})
</script>

<style scoped>
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

/* 计划中 / 其他学科：用虚线边框和更淡的底色与已开放学科区分 */
.subject-card.planned,
.subject-card.more {
    border-style: dashed;
    background: color-mix(in srgb, var(--bg-card) 82%, transparent);
}

.subject-card.planned .subject-top span:last-child,
.subject-card.more .subject-top span:last-child {
    color: var(--text-muted);
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

.carousel-arrow.previous {
    left: 2px;
}

.carousel-arrow.next {
    right: 2px;
}

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

    .subject-carousel {
        padding-inline: 0;
    }

    .subject-card {
        width: min(330px, 78vw);
    }

    .subject-card.is-previous {
        transform: translateX(calc(-50% - 70vw)) scale(0.82);
    }

    .subject-card.is-next {
        transform: translateX(calc(-50% + 70vw)) scale(0.82);
    }

    .carousel-footer {
        width: min(330px, 78vw);
    }
}

@media (max-width: 680px) {
    .home-page {
        width: min(100% - 32px, 1180px);
    }

    .hero-section {
        min-height: calc(100svh - var(--nav-height));
        height: auto;
        padding: 58px 16px 72px;
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

    .subjects-section {
        padding: 78px 16px 84px;
    }

    .section-heading {
        grid-template-columns: 1fr;
        gap: 18px;
    }

    .carousel-stage {
        height: 360px;
    }

    .subject-card {
        width: calc(100% - 52px);
        min-height: 315px;
        padding: 22px;
    }

    .subject-card.is-previous {
        transform: translateX(-120%) scale(0.86);
    }

    .subject-card.is-next {
        transform: translateX(20%) scale(0.86);
    }

    .carousel-arrow {
        top: 160px;
        width: 38px;
        height: 38px;
    }

    .carousel-footer {
        width: calc(100% - 52px);
    }

    .manifesto-section {
        min-height: 560px;
        padding: 32px 24px;
    }

    .manifesto-content {
        grid-template-columns: 1fr;
        gap: 40px;
        padding-top: 54px;
    }

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
    .hero-copy {
        animation: none;
    }

    .reveal-section {
        opacity: 1;
        transform: none;
    }

    .subject-card,
    .carousel-progress i {
        transition: none;
    }
}
</style>
