<template>
    <div class="levels-page">
        <header class="levels-hero">
            <div>
                <router-link to="/physics-lab" class="back-link">← 返回物理实验室</router-link>
                <span class="eyebrow">PHYSICS LEVELS / 关卡实验</span>
                <h1>把规律变成<br><em>可以完成的挑战。</em></h1>
                <p>调节参数、运行模型，让实验结果落在目标范围内。每完成一关，就解锁下一次探索。</p>
                <div class="hero-actions">
                    <router-link class="primary-button" :to="`/physics-lab/levels/${firstIncomplete.id}`">继续挑战 <span>↗</span></router-link>
                    <button class="outline-button" type="button" @click="resetProgress">重置进度</button>
                </div>
            </div>
            <div class="progress-card">
                <span>CHALLENGE PROGRESS</span>
                <strong>{{ completedCount }}<small> / {{ levels.length }}</small></strong>
                <div class="progress-track"><i :style="{ width: `${progressPercent}%` }"></i></div>
                <p>{{ progressPercent }}% 的关卡已经完成</p>
            </div>
        </header>

        <main class="chapter-list">
            <section v-for="chapter in chapters" :key="chapter.id" class="chapter-section">
                <header class="chapter-heading">
                    <div>
                        <small>{{ chapterIndex(chapter.id) }} / CHAPTER</small>
                        <h2>{{ chapter.title }}</h2>
                    </div>
                    <p>{{ chapter.description }}</p>
                </header>
                <div class="level-grid">
                    <article v-for="level in chapter.levels" :key="level.id" class="level-card" :class="{ locked: !isUnlocked(level.id), completed: getProgress(level.id).completed }">
                        <div class="level-top">
                            <span class="level-number">{{ String(level.order).padStart(2, "0") }}</span>
                            <span class="level-stars">{{ stars(level) }}</span>
                        </div>
                        <div class="level-icon">{{ isUnlocked(level.id) ? (getProgress(level.id).completed ? "✓" : "→") : "🔒" }}</div>
                        <h3>{{ level.title }}</h3>
                        <p>{{ level.description }}</p>
                        <div class="level-meta"><span>{{ modelName(level.modelId) }}</span><span>{{ difficultyText(level.difficulty) }}</span></div>
                        <router-link v-if="isUnlocked(level.id)" class="level-link" :to="`/physics-lab/levels/${level.id}`">{{ getProgress(level.id).completed ? "再次挑战" : "开始实验" }} <b>↗</b></router-link>
                        <span v-else class="locked-text">完成上一关后解锁</span>
                    </article>
                </div>
            </section>
        </main>
    </div>
</template>

<script setup>
import { computed } from "vue"
import { PHYSICS_LEVELS, PHYSICS_LEVEL_CHAPTERS, getPhysicsLevelModel } from "../constants/physicsLevels.js"
import { usePhysicsLevelProgress } from "../stores/physics/levelProgress.js"

const levels = PHYSICS_LEVELS
const chapters = PHYSICS_LEVEL_CHAPTERS
const { completedCount, firstIncomplete, getProgress, isUnlocked, resetProgress } = usePhysicsLevelProgress()
const progressPercent = computed(() => Math.round(completedCount.value / levels.length * 100))

function chapterIndex(id) { return String(chapters.findIndex(chapter => chapter.id === id) + 1).padStart(2, "0") }
function modelName(id) { return getPhysicsLevelModel({ modelId: id })?.name || id }
function difficultyText(difficulty) { return ["入门", "进阶", "挑战"][difficulty - 1] || "进阶" }
function stars(level) {
    const score = getProgress(level.id).bestScore
    return "★".repeat(score) + "☆".repeat(3 - score)
}
</script>

<style scoped>
.levels-page {
    width: min(1180px, calc(100% - 48px));
    margin: -32px auto 0;
    color: var(--text);
}

.levels-hero {
    min-height: 520px;
    display: grid;
    grid-template-columns: minmax(0, 1.3fr) minmax(260px, 0.7fr);
    align-items: center;
    gap: 80px;
    padding: 74px 0 92px;
}

.back-link {
    display: table;
    margin-bottom: 28px;
    color: var(--text-secondary);
    font-size: 12px;
    font-weight: 700;
    text-decoration: none;
}

.back-link:hover {
    color: var(--primary);
}

.eyebrow,
.chapter-heading small {
    color: #3b82f6;
    font-family: var(--mono);
    font-size: 10px;
    font-weight: 700;
    letter-spacing: .12em;
}

.levels-hero h1 {
    margin: 22px 0;
    font-size: clamp(44px, 6vw, 72px);
    line-height: 1.08;
}

.levels-hero h1 em {
    color: #3b82f6;
    font-style: normal;
}

.levels-hero p {
    max-width: 570px;
    color: var(--text-secondary);
    line-height: 1.85;
}

.hero-actions {
    display: flex;
    gap: 10px;
    margin-top: 30px;
}

.primary-button,
.outline-button {
    min-height: 44px;
    display: inline-flex;
    align-items: center;
    gap: 12px;
    padding: 0 17px;
    border-radius: 999px;
    font-size: 12px;
    font-weight: 700;
    cursor: pointer;
    text-decoration: none;
}

.primary-button {
    border: 1px solid #3b82f6;
    background: #3b82f6;
    color: #fff;
}

.outline-button {
    border: 1px solid var(--border);
    background: transparent;
    color: var(--text);
}

.progress-card {
    padding: 26px;
    border: 1px solid var(--border);
    border-radius: 22px;
    background: var(--bg-card);
    box-shadow: var(--shadow-lg);
}

.progress-card > span {
    color: var(--text-muted);
    font-family: var(--mono);
    font-size: 9px;
    letter-spacing: .1em;
}

.progress-card strong {
    display: block;
    margin: 18px 0;
    color: var(--primary);
    font-family: var(--mono);
    font-size: 58px;
    line-height: 1;
}

.progress-card strong small {
    color: var(--text-muted);
    font-size: 20px;
}

.progress-track {
    height: 5px;
    overflow: hidden;
    border-radius: 999px;
    background: var(--border);
}

.progress-track i {
    display: block;
    height: 100%;
    border-radius: inherit;
    background: linear-gradient(90deg, #3b82f6, #f59e0b);
    transition: width .4s ease;
}

.progress-card p {
    margin-top: 14px;
    font-size: 11px;
}

.chapter-section {
    padding: 74px 0 90px;
    border-top: 1px solid var(--border);
}

.chapter-heading {
    display: grid;
    grid-template-columns: minmax(0, 1.3fr) minmax(260px, .7fr);
    align-items: end;
    gap: 50px;
    margin-bottom: 36px;
}

.chapter-heading h2 {
    margin-top: 12px;
    font-size: clamp(30px, 4vw, 46px);
}

.chapter-heading p {
    color: var(--text-secondary);
    font-size: 13px;
    line-height: 1.8;
}

.level-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 14px;
}

.level-card {
    min-height: 330px;
    display: flex;
    flex-direction: column;
    padding: 24px;
    border: 1px solid var(--border);
    border-radius: 18px;
    background: var(--bg-card);
    transition: transform .25s, border-color .25s, box-shadow .25s;
}

.level-card:hover:not(.locked) {
    transform: translateY(-4px);
    border-color: #3b82f6;
    box-shadow: var(--shadow-hover);
}

.level-card.locked {
    opacity: .52;
}

.level-card.completed {
    border-color: color-mix(in srgb, var(--primary) 45%, var(--border));
}

.level-top,
.level-meta {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.level-number {
    color: var(--text-muted);
    font-family: var(--mono);
    font-size: 10px;
}

.level-stars {
    color: #f0b84b;
    letter-spacing: 2px;
    font-size: 12px;
}

.level-icon {
    margin: 34px 0 15px;
    color: #3b82f6;
    font-size: 25px;
}

.level-card h3 {
    margin-bottom: 8px;
    font-size: 21px;
}

.level-card p {
    color: var(--text-secondary);
    font-size: 12px;
    line-height: 1.75;
}

.level-meta {
    margin-top: auto;
    padding-top: 20px;
    color: var(--text-muted);
    font-family: var(--mono);
    font-size: 9px;
}

.level-link {
    display: flex;
    justify-content: space-between;
    margin-top: 17px;
    color: #3b82f6;
    font-size: 11px;
    font-weight: 700;
    text-decoration: none;
}

.locked-text {
    margin-top: 17px;
    color: var(--text-muted);
    font-size: 11px;
}

@media (max-width: 760px) {
    .levels-page {
        width: calc(100% - 32px);
    }

    .levels-hero {
        grid-template-columns: 1fr;
        gap: 28px;
        padding: 48px 0 66px;
    }

    .chapter-heading {
        grid-template-columns: 1fr;
        gap: 16px;
    }

    .level-grid {
        grid-template-columns: 1fr;
    }

    .level-card {
        min-height: 280px;
    }
}
</style>
