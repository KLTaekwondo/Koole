<template>
    <div class="progress-page">
        <!-- ── 总览 ── -->
        <section class="progress-hero">
            <div class="hero-copy">
                <small class="eyebrow">PROGRESS / 学习进度</small>
                <h1>把做过的实验<br><em>攒成自己的地图</em></h1>
                <p class="hero-desc">
                    每完成一个探索任务，图鉴里就点亮一个模型。进度只保存在这台设备的浏览器里，不上传任何数据。
                </p>
                <div class="hero-actions">
                    <button class="primary-button" type="button" @click="continueLearning">
                        {{ lastVisited ? `继续上次实验 · ${lastVisited.name}` : '去物理实验室' }} <span>↗</span>
                    </button>
                    <button class="outline-button" type="button" @click="goLevels('physics')">物理关卡 <span>→</span></button>
                    <button class="outline-button" type="button" @click="goLevels('math')">数学关卡 <span>→</span></button>
                </div>
            </div>

            <div class="ring-card">
                <svg class="ring" viewBox="0 0 132 132" role="img" :aria-label="`已探索 ${exploredCount} / ${totalModels} 个模型`">
                    <circle class="ring-track" cx="66" cy="66" r="56" />
                    <circle class="ring-value" cx="66" cy="66" r="56" :stroke-dasharray="`${ringDash} 999`" />
                    <text class="ring-count" x="66" y="64">{{ exploredCount }}</text>
                    <text class="ring-total" x="66" y="86">/ {{ totalModels }} 个模型</text>
                </svg>
                <div class="ring-caption">
                    <span class="caption-label">模型探索率</span>
                    <strong>{{ exploredPercent }}%</strong>
                </div>
            </div>
        </section>

        <!-- ── 三个统计 ── -->
        <section class="stat-row">
            <router-link to="/physics-lab/levels" class="stat-card">
                <small>PHYSICS LEVELS</small>
                <strong>{{ physicsDone }} <i>/ {{ physicsTotal }}</i></strong>
                <span>物理关卡通关</span>
            </router-link>
            <router-link to="/math-lab/levels" class="stat-card">
                <small>MATH LEVELS</small>
                <strong>{{ mathDone }} <i>/ {{ mathTotal }}</i></strong>
                <span>数学关卡通关</span>
            </router-link>
            <div class="stat-card">
                <small>RECENT</small>
                <strong>{{ recentModels.length }}</strong>
                <span>最近打开的模型</span>
            </div>
        </section>

        <!-- ── 最近浏览 ── -->
        <section v-if="recentModels.length" class="recent-section">
            <header class="section-heading">
                <div>
                    <small>01 / RECENT</small>
                    <h2>接着上次的地方</h2>
                </div>
            </header>
            <div class="recent-list">
                <button
                    v-for="model in recentModels"
                    :key="model.id"
                    type="button"
                    class="recent-chip"
                    @click="openModel(model.id)"
                >
                    <span>{{ model.name }}</span>
                    <i>{{ model.category }} · {{ model.level }}</i>
                </button>
            </div>
        </section>

        <!-- ── 图鉴 ── -->
        <section class="atlas-section">
            <header class="section-heading">
                <div>
                    <small>02 / ATLAS</small>
                    <h2>模型图鉴</h2>
                </div>
                <p>点亮的表示探索任务已完成。任务在模型页右侧面板里，做完就会记到这里。</p>
            </header>

            <div v-for="group in groupedModels" :key="group.category" class="atlas-group">
                <div class="group-heading">
                    <h3>{{ group.category }}</h3>
                    <span>{{ group.doneCount }} / {{ group.models.length }}</span>
                </div>
                <div class="atlas-grid">
                    <button
                        v-for="model in group.models"
                        :key="model.id"
                        type="button"
                        class="atlas-card"
                        :class="{ done: isExplored(model.id) }"
                        @click="openModel(model.id)"
                    >
                        <span class="card-flag">{{ isExplored(model.id) ? '✓' : '○' }}</span>
                        <span class="card-name">{{ model.name }}</span>
                        <span class="card-meta">{{ model.category }} · {{ model.level }}</span>
                        <span v-if="isExplored(model.id)" class="card-time">{{ formatDate(exploredAt(model.id)) }} 完成</span>
                        <span v-else class="card-time muted">未探索</span>
                    </button>
                </div>
            </div>
        </section>

        <!-- ── 重置 ── -->
        <section class="reset-section">
            <div>
                <h3>清空探索记录</h3>
                <p>只清除模型探索与最近浏览，物理 / 数学关卡的进度不受影响。</p>
            </div>
            <button type="button" class="reset-button" :class="{ armed: resetArmed }" @click="handleReset">
                {{ resetArmed ? '再点一次确认清空' : '清空探索记录' }}
            </button>
        </section>
    </div>
</template>

<script setup>
import { computed, ref } from "vue"
import { useRouter } from "vue-router"
import { PHYSICS_MODELS, CATEGORIES } from "../Logic/physics/physicsModels.js"
import { PHYSICS_LEVELS } from "../Levels/physics/physicsLevels.js"
import { MATH_LEVELS } from "../Levels/math/mathLevels.js"
import { usePhysicsLevelProgress } from "../Logic/physics/engine/levelProgress.js"
import { useMathLevelProgress } from "../Logic/math/levelProgress.js"
import { useLearning } from "../stores/learning.js"
import { success } from "../stores/toast.js"

const router = useRouter()
const { exploredCount, recentIds, isExplored, exploredAt, resetLearning } = useLearning()
const { completedCount: physicsDone } = usePhysicsLevelProgress()
const { completedCount: mathDone } = useMathLevelProgress()

const physicsTotal = PHYSICS_LEVELS.length
const mathTotal = MATH_LEVELS.length
const totalModels = PHYSICS_MODELS.length
const RING_CIRCUMFERENCE = 2 * Math.PI * 56

const exploredPercent = computed(() => totalModels ? Math.round((exploredCount.value / totalModels) * 100) : 0)
const ringDash = computed(() => (exploredPercent.value / 100 * RING_CIRCUMFERENCE).toFixed(2))

const modelMap = new Map(PHYSICS_MODELS.map(model => [model.id, model]))
const recentModels = computed(() => recentIds.value.map(id => modelMap.get(id)).filter(Boolean))
const lastVisited = computed(() => recentModels.value[0] || null)

const groupedModels = computed(() => CATEGORIES
    .map(category => {
        const models = PHYSICS_MODELS.filter(model => model.category === category)
        return {
            category,
            models,
            doneCount: models.filter(model => isExplored(model.id)).length,
        }
    })
    .filter(group => group.models.length > 0))

const resetArmed = ref(false)
let resetTimer = null

function openModel(id) {
    router.push(`/physics-lab/classic/${id}`)
}

function continueLearning() {
    if (lastVisited.value) openModel(lastVisited.value.id)
    else router.push("/physics-lab")
}

function goLevels(subject) {
    router.push(subject === "math" ? "/math-lab/levels" : "/physics-lab/levels")
}

function formatDate(iso) {
    if (!iso) return ""
    const date = new Date(iso)
    if (Number.isNaN(date.getTime())) return ""
    return `${date.getMonth() + 1} 月 ${date.getDate()} 日`
}

function handleReset() {
    if (!resetArmed.value) {
        resetArmed.value = true
        clearTimeout(resetTimer)
        resetTimer = setTimeout(() => { resetArmed.value = false }, 4000)
        return
    }
    clearTimeout(resetTimer)
    resetArmed.value = false
    resetLearning()
    success("探索记录已清空")
}
</script>

<style scoped>
.progress-page {
    width: min(1120px, calc(100% - 48px));
    margin: 0 auto;
    color: var(--text);
    display: grid;
    gap: 56px;
    padding-bottom: 40px;
}

/* ── 总览 ── */
.progress-hero {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 40px;
    align-items: center;
    padding: 56px 0 8px;
}

.eyebrow,
.section-heading small,
.stat-card small {
    font-family: var(--mono);
    letter-spacing: 0.12em;
    color: #c94c40;
    font-size: 10px;
    font-weight: 700;
}

.hero-copy h1 {
    margin: 16px 0 18px;
    font-size: clamp(34px, 4.4vw, 54px);
    line-height: 1.12;
    font-weight: 850;
}

.hero-copy h1 em {
    font-style: normal;
    color: var(--primary);
}

.hero-desc {
    max-width: 540px;
    color: var(--text-secondary);
    line-height: 1.8;
    font-size: 15px;
    margin: 0;
}

.hero-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    margin-top: 28px;
}

.primary-button,
.outline-button {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    padding: 13px 22px;
    border-radius: 999px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: var(--transition);
    font-family: var(--sans);
}

.primary-button {
    border: none;
    background: var(--primary-gradient);
    color: #fff;
    box-shadow: 0 10px 24px rgba(231, 76, 60, 0.24);
}

.primary-button:hover {
    transform: translateY(-1px);
    box-shadow: 0 14px 30px rgba(231, 76, 60, 0.3);
}

.outline-button {
    border: 1px solid var(--border);
    background: transparent;
    color: var(--text);
}

.outline-button:hover {
    border-color: var(--primary);
    color: var(--primary);
}

.ring-card {
    display: grid;
    justify-items: center;
    gap: 12px;
    padding: 24px 28px;
    border: 1px solid var(--border);
    border-radius: var(--radius-xl);
    background: var(--bg-card);
    box-shadow: var(--shadow);
}

.ring {
    width: 168px;
    height: 168px;
}

.ring-track,
.ring-value {
    fill: none;
    stroke-width: 9;
    stroke-linecap: round;
}

.ring-track {
    stroke: var(--border-light);
}

.ring-value {
    stroke: var(--primary);
    transform: rotate(-90deg);
    transform-origin: 66px 66px;
    transition: stroke-dasharray 0.5s var(--ease-out);
}

.ring-count {
    fill: var(--text);
    font-size: 34px;
    font-weight: 850;
    text-anchor: middle;
    font-family: var(--sans);
}

.ring-total {
    fill: var(--text-secondary);
    font-size: 11px;
    text-anchor: middle;
    font-family: var(--sans);
}

.ring-caption {
    display: flex;
    align-items: baseline;
    gap: 8px;
    color: var(--text-secondary);
    font-size: 12px;
}

.ring-caption strong {
    color: var(--primary);
    font-size: 16px;
}

/* ── 统计 ── */
.stat-row {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 16px;
}

.stat-card {
    display: grid;
    gap: 6px;
    padding: 22px 24px;
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    background: var(--bg-card);
    color: var(--text);
    text-decoration: none;
    transition: var(--transition);
}

.stat-card:hover {
    border-color: var(--primary);
    box-shadow: var(--shadow-hover);
    transform: translateY(-2px);
}

.stat-card strong {
    font-size: 34px;
    font-weight: 850;
    line-height: 1.1;
}

.stat-card strong i {
    font-style: normal;
    font-size: 15px;
    font-weight: 600;
    color: var(--text-secondary);
}

.stat-card span {
    font-size: 13px;
    color: var(--text-secondary);
}

/* ── 区块标题 ── */
.section-heading {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 24px;
    margin-bottom: 22px;
}

.section-heading h2 {
    margin: 8px 0 0;
    font-size: clamp(22px, 2.4vw, 30px);
    font-weight: 800;
}

.section-heading p {
    margin: 0;
    max-width: 420px;
    color: var(--text-secondary);
    font-size: 13px;
    line-height: 1.7;
}

/* ── 最近浏览 ── */
.recent-list {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
}

.recent-chip {
    display: inline-flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 2px;
    padding: 10px 16px;
    border: 1px solid var(--border);
    border-radius: 999px;
    background: var(--bg-card);
    color: var(--text);
    cursor: pointer;
    font-family: var(--sans);
    transition: var(--transition);
}

.recent-chip span {
    font-size: 14px;
    font-weight: 600;
}

.recent-chip i {
    font-style: normal;
    font-size: 11px;
    color: var(--text-secondary);
}

.recent-chip:hover {
    border-color: var(--primary);
    color: var(--primary);
}

/* ── 图鉴 ── */
.atlas-group + .atlas-group {
    margin-top: 30px;
}

.group-heading {
    display: flex;
    align-items: baseline;
    gap: 12px;
    margin-bottom: 12px;
    padding-bottom: 8px;
    border-bottom: 1px solid var(--border-light);
}

.group-heading h3 {
    margin: 0;
    font-size: 16px;
    font-weight: 700;
}

.group-heading span {
    font-family: var(--mono);
    font-size: 11px;
    color: var(--text-secondary);
}

.atlas-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(168px, 1fr));
    gap: 12px;
}

.atlas-card {
    position: relative;
    display: grid;
    gap: 4px;
    padding: 16px 18px 14px;
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    background: var(--bg-card);
    color: var(--text-muted);
    text-align: left;
    cursor: pointer;
    font-family: var(--sans);
    transition: var(--transition);
}

.atlas-card:hover {
    border-color: var(--primary);
    transform: translateY(-2px);
    box-shadow: var(--shadow-hover);
}

.atlas-card.done {
    color: var(--text);
    border-color: color-mix(in srgb, var(--primary) 34%, var(--border));
    background: color-mix(in srgb, var(--primary) 5%, var(--bg-card));
}

.card-flag {
    position: absolute;
    top: 12px;
    right: 14px;
    font-size: 13px;
    color: var(--text-muted);
}

.atlas-card.done .card-flag {
    color: var(--primary);
    font-weight: 800;
}

.card-name {
    font-size: 15px;
    font-weight: 700;
    padding-right: 18px;
}

.card-meta {
    font-size: 11px;
    color: var(--text-secondary);
}

.card-time {
    font-size: 11px;
    color: var(--primary);
    margin-top: 4px;
}

.card-time.muted {
    color: var(--text-muted);
}

/* ── 重置 ── */
.reset-section {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 24px;
    padding: 22px 24px;
    border: 1px dashed var(--border);
    border-radius: var(--radius-lg);
}

.reset-section h3 {
    margin: 0 0 6px;
    font-size: 15px;
    font-weight: 700;
}

.reset-section p {
    margin: 0;
    font-size: 13px;
    color: var(--text-secondary);
}

.reset-button {
    flex-shrink: 0;
    padding: 10px 18px;
    border: 1px solid var(--border);
    border-radius: 999px;
    background: transparent;
    color: var(--text-secondary);
    font-size: 13px;
    font-family: var(--sans);
    cursor: pointer;
    transition: var(--transition);
}

.reset-button:hover {
    border-color: var(--primary);
    color: var(--primary);
}

.reset-button.armed {
    border-color: var(--primary);
    background: var(--primary-light);
    color: var(--primary);
    font-weight: 600;
}

/* ── 响应式 ── */
@media (max-width: 860px) {
    .progress-hero {
        grid-template-columns: 1fr;
        padding-top: 32px;
    }

    .ring-card {
        justify-self: start;
    }

    .stat-row {
        grid-template-columns: 1fr;
    }

    .atlas-grid {
        grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    }

    .reset-section {
        flex-direction: column;
        align-items: flex-start;
    }
}
</style>
