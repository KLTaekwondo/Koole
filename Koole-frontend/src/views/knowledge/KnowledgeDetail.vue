<template>
    <div v-if="item" class="detail-page" :style="{ '--subject': accent }">
        <!-- 封面：学科色渐变 + 主题线条，向下渐隐到正文 -->
        <header class="article-cover">
            <div class="cover-inner">
                <button type="button" class="back-link" @click="goBack">← 物理实验室 · 现象与发现</button>
                <div class="kicker">
                    <span class="era-badge">{{ item.era }}</span>
                    <span>{{ item.category }}</span>
                    <span v-if="item.figure?.name" class="kicker-figure">{{ item.figure.name }}</span>
                </div>
                <h1>{{ item.title }}</h1>
                <p class="hook">{{ item.hook }}</p>

                <!-- 主人公：卡片上只写名字，这里给出生卒年与身份 -->
                <div v-if="item.figure" class="figure-strip">
                    <div class="figure-main">
                        <span class="figure-label">主人公</span>
                        <strong>{{ item.figure.name }}</strong>
                        <span v-if="item.figure.years" class="figure-years">{{ item.figure.years }}</span>
                        <p v-if="item.figure.note">{{ item.figure.note }}</p>
                    </div>
                    <div v-for="figure in item.coFigures || []" :key="figure.name" class="figure-co">
                        <span class="figure-label">共同相关</span>
                        <strong>{{ figure.name }}</strong>
                        <span v-if="figure.years" class="figure-years">{{ figure.years }}</span>
                        <p v-if="figure.note">{{ figure.note }}</p>
                    </div>
                </div>
            </div>

            <PhenomenonMotif class="cover-motif" :variant="item.visual" :color="accent" :opacity="0.42" />
        </header>

        <main class="detail-content">
            <section class="band">
                <header class="band-heading">
                    <span>01 / STORY</span>
                    <h2>这个现象是怎么被发现的？</h2>
                </header>
                <ol class="story-list">
                    <li v-for="(beat, index) in item.story" :key="index" class="story-beat">
                        <span class="beat-year">{{ beat.year }}</span>
                        <span class="beat-dot" aria-hidden="true"></span>
                        <div class="beat-body">
                            <h3>{{ beat.title }}</h3>
                            <!-- 含公式的段落走 md-editor 渲染（KaTeX），其余保持普通段落，避免多挂组件 -->
                            <MdPreview
                                v-if="needsMarkdown(beat.text)"
                                class="beat-math"
                                :modelValue="beat.text"
                                :theme="theme"
                                previewTheme="stackoverflow"
                                codeTheme="stackoverflow"
                                :noKatex="false"
                                style="background: transparent;"
                            />
                            <p v-else>{{ beat.text }}</p>
                        </div>
                    </li>
                </ol>
                <aside v-if="item.misconception" class="misconception">
                    <strong>这里容易被想错</strong>
                    <MdPreview
                        v-if="needsMarkdown(item.misconception)"
                        class="beat-math misconception-math"
                        :modelValue="item.misconception"
                        :theme="theme"
                        previewTheme="stackoverflow"
                        codeTheme="stackoverflow"
                        :noKatex="false"
                        style="background: transparent;"
                    />
                    <p v-else>{{ item.misconception }}</p>
                </aside>
            </section>

            <section class="band">
                <header class="band-heading">
                    <span>02 / KNOWLEDGE</span>
                    <h2>背后的规律</h2>
                </header>
                <div class="knowledge-body">
                    <MdPreview
                        :modelValue="item.knowledge"
                        :theme="theme"
                        previewTheme="stackoverflow"
                        codeTheme="stackoverflow"
                        :noKatex="false"
                        style="background: transparent;"
                    />
                </div>
            </section>

            <section v-if="item.pitfalls?.length" class="band">
                <header class="band-heading">
                    <span>03 / PITFALLS</span>
                    <h2>容易看错的地方</h2>
                </header>
                <ul class="pitfall-list">
                    <li v-for="pitfall in item.pitfalls" :key="pitfall">
                        <!-- 易错点里常带 $变量$，含公式的条目走 Markdown 渲染，否则原样显示 -->
                        <MdPreview
                            v-if="needsMarkdown(pitfall)"
                            class="pitfall-math"
                            :modelValue="pitfall"
                            :theme="theme"
                            previewTheme="stackoverflow"
                            codeTheme="stackoverflow"
                            :noKatex="false"
                            style="background: transparent;"
                        />
                        <template v-else>{{ pitfall }}</template>
                    </li>
                </ul>
            </section>

            <section class="band cta-band">
                <div class="cta-copy">
                    <span class="cta-kicker">04 / TRY IT</span>
                    <h2>{{ item.simulation?.prompt || "想不想亲手试一试？" }}</h2>
                    <p>不用背结论，把参数拖一遍，看看哪个量变了、哪个量没变。</p>
                </div>
                <div class="cta-actions">
                    <router-link v-if="item.simulation?.modelId" :to="simulationLink" class="cta-button">
                        {{ item.simulation.cta || "去模拟看看" }} →
                    </router-link>
                    <span v-if="item.simulation?.modelName" class="cta-model">{{ item.simulation.modelName }}</span>
                </div>
            </section>

            <!-- 接着读：同主人公优先，再用同分类补足，最后是年代上的前后篇 -->
            <section v-if="relatedItems.length || prevItem || nextItem" class="related-band">
                <header class="band-heading">
                    <span>05 / KEEP READING</span>
                    <h2>接着读</h2>
                </header>

                <div v-if="relatedItems.length" class="related-grid">
                    <router-link
                        v-for="related in relatedItems"
                        :key="related.id"
                        :to="`/physics-lab/phenomena/${related.id}`"
                        class="related-card"
                    >
                        <div class="related-top">
                            <span class="related-era">{{ related.era }}</span>
                            <span class="related-why">{{ relatedReason(related) }}</span>
                        </div>
                        <h3>{{ related.title }}</h3>
                        <p>{{ related.hook }}</p>
                    </router-link>
                </div>

                <nav v-if="prevItem || nextItem" class="related-pager" aria-label="按年代前后翻页">
                    <router-link v-if="prevItem" :to="`/physics-lab/phenomena/${prevItem.id}`" class="pager-link">
                        <small>← 更早的发现</small>
                        <span>{{ prevItem.title }}</span>
                    </router-link>
                    <router-link v-if="nextItem" :to="`/physics-lab/phenomena/${nextItem.id}`" class="pager-link is-next">
                        <small>更晚的发现 →</small>
                        <span>{{ nextItem.title }}</span>
                    </router-link>
                </nav>
            </section>

            <footer class="detail-footer">
                <div v-if="item.sources?.length" class="sources">
                    <span>参考资料</span>
                    <a v-for="source in item.sources" :key="source.url" :href="source.url" target="_blank" rel="noreferrer">{{ source.label }} ↗</a>
                </div>
                <button type="button" class="back-footer" @click="goBack">← 回到物理实验室</button>
            </footer>
        </main>
    </div>

    <div v-else class="missing">
        <h1>没有找到这个现象</h1>
        <p>它可能还没写完，或者链接已经失效。</p>
        <router-link to="/physics-lab">回到物理实验室</router-link>
    </div>
</template>

<script setup>
import { computed, onMounted, watch } from "vue"
import { useRoute, useRouter } from "vue-router"
import { MdPreview } from "md-editor-v3"
// 让 md-editor 用本地 KaTeX（默认从 unpkg CDN 加载，离线时公式不渲染）
import "../../plugins/markdown.js"

import "md-editor-v3/lib/preview.css"
import PhenomenonMotif from "../../components/PhenomenonMotif.vue"
import { theme } from "../../stores/theme.js"
import { getPhenomenaBySubject, getPhenomenonById } from "../../content/phenomena.mjs"
import { getSubjectById } from "../../constants/subjects.js"

const route = useRoute()
const router = useRouter()
const item = computed(() => getPhenomenonById(route.params.id))

// 「返回」统一走 router.push，不用 history.back()：
// 文章之间可以互相跳（文末「接着读」），此时 back() 会退到上一篇而不是物理主页；
// 直接打开文章时 back() 还可能把用户带出站外。滚动位置的恢复交给时间轴自己的记忆逻辑。
function goBack() {
    router.push("/physics-lab")
}

// 文章主题色跟随所属学科（物理蓝 / 化学绿 / 数学蓝），不再用主站红
const accent = computed(() => {
    const subject = getSubjectById(item.value?.subject || "physics")
    return subject?.accent || subject?.color || "#3b82f6"
})

// 「去模拟」链接：把文章里预设的参数一起带过去，打开就是那组条件
const simulationLink = computed(() => {
    const simulation = item.value?.simulation
    if (!simulation?.modelId) return "/physics-lab"
    return {
        path: `/physics-lab/classic/${simulation.modelId}`,
        query: simulation.params || {},
    }
})

const updateTitle = () => {
    document.title = item.value ? `${item.value.title} · 现象与发现 · Koole` : "现象与发现 · Koole"
}

// 故事、易错点里可能带 $...$ 公式，也可能带 **加粗**、`代码`，
// 只要出现 Markdown 语法就走 MdPreview 渲染，纯文本段落仍用 <p>，避免多挂组件。
const needsMarkdown = text => typeof text === "string" && /[$`*]/.test(text)

// ── 接着读 ──
// 优先同一主人公（比如伽利略的三篇），再用同分类补足，最多 3 篇
const siblingItems = computed(() => {
    const current = item.value
    if (!current) return []
    return getPhenomenaBySubject(current.subject || "physics").filter(other => other.id !== current.id)
})

const relatedItems = computed(() => {
    const current = item.value
    if (!current) return []
    const byFigure = siblingItems.value.filter(other => (
        current.figure?.name && other.figure?.name === current.figure.name
    ))
    const byCategory = siblingItems.value.filter(other => (
        other.category === current.category && !byFigure.includes(other)
    ))
    const picked = [...byFigure, ...byCategory].slice(0, 3)
    // 不够 3 篇时用其他任意篇目补足，避免空一大块
    const rest = siblingItems.value.filter(other => !picked.includes(other))
    return [...picked, ...rest].slice(0, 3)
})

function relatedReason(other) {
    const current = item.value
    if (current?.figure?.name && other.figure?.name === current.figure.name) {
        return `同为 ${other.figure.name} 的发现`
    }
    if (other.category === current?.category) return `同属${other.category}`
    return "同期物理"
}

// 年代上的前后篇
const eraOrder = computed(() => getPhenomenaBySubject(item.value?.subject || "physics"))
const currentIndex = computed(() => eraOrder.value.findIndex(other => other.id === item.value?.id))
const prevItem = computed(() => (currentIndex.value > 0 ? eraOrder.value[currentIndex.value - 1] : null))
const nextItem = computed(() => {
    const index = currentIndex.value
    return index >= 0 && index < eraOrder.value.length - 1 ? eraOrder.value[index + 1] : null
})

onMounted(updateTitle)
watch(() => route.params.id, updateTitle)
</script>

<style scoped>
.detail-page {
    width: min(1080px, calc(100% - 48px));
    margin: 0 auto;
    padding-bottom: 96px;
    color: var(--text);
}

/* ── 封面：学科色渐变 + 细网格 + 主题线条，底部渐隐进正文 ── */
.article-cover {
    position: relative;
    width: 100vw;
    margin: -32px calc(50% - 50vw) 0;
    padding: 40px max(24px, calc((100vw - 1080px) / 2)) 46px;
    overflow: hidden;
    background:
        radial-gradient(circle at 78% 12%, color-mix(in srgb, var(--subject) 22%, transparent), transparent 58%),
        linear-gradient(160deg, color-mix(in srgb, var(--subject) 12%, var(--bg)) 0%, var(--bg) 76%);
}

/* 细网格 + 底部渐隐，避免封面和正文之间出现硬边 */
.article-cover::before {
    content: "";
    position: absolute;
    inset: 0;
    background-image:
        linear-gradient(color-mix(in srgb, var(--subject) 9%, transparent) 1px, transparent 1px),
        linear-gradient(90deg, color-mix(in srgb, var(--subject) 9%, transparent) 1px, transparent 1px);
    background-size: 32px 32px;
    mask-image: linear-gradient(to bottom, #000 0%, #000 48%, transparent 100%);
    -webkit-mask-image: linear-gradient(to bottom, #000 0%, #000 48%, transparent 100%);
    pointer-events: none;
}

.article-cover::after {
    content: "";
    position: absolute;
    right: 0;
    bottom: 0;
    left: 0;
    height: 90px;
    background: linear-gradient(to bottom, transparent, var(--bg));
    pointer-events: none;
}

.cover-inner {
    position: relative;
    z-index: 1;
    display: grid;
    gap: 12px;
    max-width: 720px;
}

/* 主题线条：贴封面右下角，随学科色，弱化到不抢文字 */
.cover-motif {
    position: absolute;
    right: max(24px, calc((100vw - 1080px) / 2 - 90px));
    bottom: 22px;
    z-index: 1;
    width: min(420px, 34vw);
    height: 340px;
    pointer-events: none;
    mask-image: radial-gradient(circle at 60% 55%, #000 30%, transparent 78%);
    -webkit-mask-image: radial-gradient(circle at 60% 55%, #000 30%, transparent 78%);
}

/* ── 头部 ── */

/* 返回入口是 button（保持按钮语义），这里抹掉默认按钮外观 */
.back-link,
.back-footer {
    justify-self: start;
    width: fit-content;
    border: 0;
    background: transparent;
    padding: 0;
    font-family: inherit;
    text-align: left;
    cursor: pointer;
}

.back-link {
    color: var(--text-secondary);
    font-size: 12px;
    font-weight: 700;
    text-decoration: none;
}

.back-link:hover {
    color: var(--subject);
}

.kicker {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-top: 8px;
    color: var(--text-muted);
    font-family: var(--mono);
    font-size: 11px;
}

.era-badge {
    padding: 4px 10px;
    border-radius: 999px;
    background: color-mix(in srgb, var(--subject) 16%, transparent);
    color: var(--subject);
    font-weight: 800;
}

.cover-inner h1 {
    margin: 0;
    font-size: clamp(30px, 4.6vw, 50px);
    line-height: 1.16;
    font-weight: 850;
}

.hook {
    max-width: 720px;
    margin: 0;
    color: var(--text-secondary);
    font-size: 16px;
    line-height: 1.9;
}

/* ── 主人公 ── */
.figure-strip {
    display: grid;
    gap: 10px;
    margin-top: 24px;
    max-width: 880px;
}

.figure-main,
.figure-co {
    display: grid;
    grid-template-columns: auto auto auto minmax(0, 1fr);
    align-items: baseline;
    gap: 4px 12px;
    padding: 14px 18px;
    border-left: 3px solid var(--subject);
    border-radius: 0 12px 12px 0;
    /* 学科色打底而不是半透明白：在浅色页面和 3D 背景前都能看清边界 */
    background: color-mix(in srgb, var(--subject) 13%, var(--bg-card));
}

.figure-co {
    border-left-color: color-mix(in srgb, var(--subject) 42%, var(--border));
    background: color-mix(in srgb, var(--subject) 7%, var(--bg-card));
}

/* 「主人公 / 共同相关」做成小色块标签，代替原来的浅灰小字 */
.figure-label {
    padding: 3px 8px;
    border-radius: 999px;
    background: var(--subject);
    color: #fff;
    font-family: var(--mono);
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.04em;
    white-space: nowrap;
}

/* 共同相关：同样是实心标签，只把字号压小一点表示次级，保证对比度 */
.figure-co .figure-label {
    background: color-mix(in srgb, var(--subject) 82%, #0f2740);
    font-size: 9.5px;
    letter-spacing: 0.02em;
}

.figure-main strong,
.figure-co strong {
    color: var(--text);
    font-size: 16px;
    font-weight: 800;
}

.figure-years {
    color: var(--text-secondary);
    font-family: var(--mono);
    font-size: 11.5px;
    font-variant-numeric: tabular-nums;
}

.figure-main p,
.figure-co p {
    grid-column: 1 / -1;
    margin: 2px 0 0;
    color: var(--text);
    font-size: 13px;
    line-height: 1.85;
    opacity: 0.86;
}

@media (max-width: 640px) {
    .figure-main,
    .figure-co {
        grid-template-columns: auto auto minmax(0, 1fr);
        gap: 4px 8px;
        padding: 12px 14px;
    }

    .figure-main strong,
    .figure-co strong {
        font-size: 15px;
    }

    .figure-main p,
    .figure-co p {
        font-size: 12.5px;
    }
}

/* ── 通用段落 ── */
.detail-content {
    margin-top: 18px;
}

.band {
    margin-bottom: 60px;
}

.band-heading {
    display: grid;
    grid-template-columns: 200px minmax(0, 1fr);
    align-items: end;
    gap: 24px;
    margin-bottom: 24px;
}

.band-heading > span {
    color: var(--subject);
    font-family: var(--mono);
    font-size: 10px;
    font-weight: 800;
    letter-spacing: 0.1em;
}

.band-heading h2 {
    margin: 0;
    font-size: clamp(22px, 2.6vw, 30px);
    line-height: 1.25;
}

/* ── 故事时间轴 ── */
.story-list {
    position: relative;
    margin: 0;
    padding: 0;
    list-style: none;
}

.story-list::before {
    content: "";
    position: absolute;
    top: 14px;
    bottom: 14px;
    left: 92px;
    width: 1px;
    background: var(--border);
}

.story-beat {
    position: relative;
    display: grid;
    grid-template-columns: 76px 16px minmax(0, 1fr);
    gap: 8px;
    padding-bottom: 28px;
}

.beat-year {
    padding-top: 2px;
    color: var(--subject);
    font-family: var(--mono);
    font-size: 12px;
    font-weight: 700;
    text-align: right;
}

.beat-dot {
    justify-self: center;
    width: 11px;
    height: 11px;
    margin-top: 6px;
    border: 2px solid var(--bg-card);
    border-radius: 50%;
    background: var(--subject);
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--subject) 16%, transparent);
}

.beat-body h3 {
    margin: 0 0 8px;
    font-size: 18px;
}

.beat-body p {
    margin: 0;
    color: var(--text-secondary);
    font-size: 14px;
    line-height: 1.95;
}

/* 含公式的段落：抹掉 md-editor 预览的默认间距，让它读起来和普通段落一致 */
.beat-math {
    margin: 0;
}

.beat-math :deep(.md-editor-preview) {
    padding: 0;
    background: transparent;
    color: var(--text-secondary);
    font-size: 14px;
    line-height: 1.95;
}

.beat-math :deep(.md-editor-preview p) {
    margin: 0;
    font-size: 14px;
    line-height: 1.95;
}

.beat-math :deep(.katex) {
    font-size: 1.02em;
    color: var(--subject);
}

.misconception-math :deep(.md-editor-preview) {
    color: var(--text-secondary);
    font-size: 13px;
    line-height: 1.9;
}

.misconception-math :deep(.md-editor-preview p) {
    font-size: 13px;
    line-height: 1.9;
}

.misconception {
    display: grid;
    gap: 6px;
    margin-top: 6px;
    padding: 18px 22px;
    border: 1px solid color-mix(in srgb, #d97706 26%, var(--border));
    border-radius: var(--radius-lg);
    background: color-mix(in srgb, #d97706 7%, var(--bg-card));
}

.misconception strong {
    color: color-mix(in srgb, #b45309 84%, var(--text));
    font-size: 12px;
}

.misconception p {
    margin: 0;
    color: var(--text-secondary);
    font-size: 13px;
    line-height: 1.9;
}

/* ── 知识点 ── */
.knowledge-body {
    padding: clamp(18px, 3vw, 32px);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    background: var(--bg-card);
}

.knowledge-body :deep(.md-editor-preview) {
    background: transparent;
    color: var(--text);
    font-size: 14.5px;
    line-height: 1.9;
}

.knowledge-body :deep(.md-editor-preview h2) {
    margin: 18px 0 8px;
    font-size: 18px;
}

.knowledge-body :deep(.md-editor-preview h2:first-child) {
    margin-top: 0;
}

.knowledge-body :deep(.md-editor-preview h3) {
    margin: 14px 0 6px;
    font-size: 15.5px;
}

.knowledge-body :deep(.md-editor-preview p),
.knowledge-body :deep(.md-editor-preview li) {
    font-size: 14px;
    line-height: 1.9;
}

.knowledge-body :deep(.md-editor-preview ul) {
    padding-left: 20px;
}

/* ── 易错点 ── */
.pitfall-list {
    display: grid;
    gap: 10px;
    margin: 0;
    padding: 0;
    list-style: none;
}

/* 含公式的易错点：抹掉 md-editor 预览的默认间距与内边距，和普通条目一致 */
.pitfall-math {
    margin: 0;
}

.pitfall-math :deep(.md-editor-preview) {
    padding: 0;
    background: transparent;
    color: inherit;
    font-size: 13.5px;
    line-height: 1.8;
}

.pitfall-math :deep(.md-editor-preview p) {
    margin: 0;
    font-size: 13.5px;
    line-height: 1.8;
}

.pitfall-math :deep(.md-editor-preview ul) {
    margin: 0;
    padding-left: 18px;
}

.pitfall-math :deep(.katex) {
    font-size: 1.02em;
}

.pitfall-list li {
    position: relative;
    padding: 14px 18px 14px 42px;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    background: var(--bg-card);
    color: var(--text-secondary);
    font-size: 13.5px;
    line-height: 1.8;
}

.pitfall-list li::before {
    content: "×";
    position: absolute;
    top: 50%;
    left: 16px;
    width: 16px;
    height: 16px;
    margin-top: -8px;
    border-radius: 50%;
    background: color-mix(in srgb, #d97706 16%, transparent);
    color: #b45309;
    font-size: 11px;
    font-weight: 800;
    line-height: 16px;
    text-align: center;
}

/* ── 实例化入口 ── */
.cta-band {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 24px;
    padding: clamp(24px, 4vw, 40px);
    border: 1px solid color-mix(in srgb, var(--subject) 30%, var(--border));
    border-radius: var(--radius-xl);
    background:
        radial-gradient(circle at 12% 0%, color-mix(in srgb, var(--subject) 16%, transparent), transparent 60%),
        color-mix(in srgb, var(--subject) 5%, var(--bg-card));
}

.cta-kicker {
    color: var(--subject);
    font-family: var(--mono);
    font-size: 10px;
    font-weight: 800;
    letter-spacing: 0.1em;
}

.cta-copy h2 {
    max-width: 640px;
    margin: 10px 0 10px;
    font-size: clamp(20px, 2.6vw, 28px);
    line-height: 1.4;
}

.cta-copy p {
    margin: 0;
    color: var(--text-secondary);
    font-size: 13px;
    line-height: 1.8;
}

.cta-actions {
    display: grid;
    gap: 10px;
    justify-items: start;
}

.cta-button {
    display: inline-flex;
    align-items: center;
    padding: 14px 26px;
    border-radius: 999px;
    background: linear-gradient(135deg, var(--subject), color-mix(in srgb, var(--subject) 74%, #ffffff));
    color: #fff;
    font-size: 14px;
    font-weight: 700;
    text-decoration: none;
    box-shadow: 0 12px 28px color-mix(in srgb, var(--subject) 26%, transparent);
    transition: transform 0.25s var(--ease-out), box-shadow 0.25s var(--ease-out);
}

.cta-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 16px 34px color-mix(in srgb, var(--subject) 32%, transparent);
}

.cta-model {
    color: var(--text-muted);
    font-family: var(--mono);
    font-size: 11px;
}

/* ── 接着读 ── */
.related-band {
    margin-top: 12px;
    padding-top: 8px;
}

.related-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
    gap: 12px;
    margin-bottom: 22px;
}

.related-card {
    display: grid;
    gap: 8px;
    padding: 18px 20px;
    border: 0;
    border-radius: var(--radius-lg);
    background: color-mix(in srgb, var(--subject) 6%, var(--bg-card));
    color: var(--text);
    text-decoration: none;
    transition: transform 0.25s var(--ease-out), background 0.25s, box-shadow 0.25s;
}

.related-card:hover,
.related-card:focus-visible {
    transform: translateY(-2px);
    background: color-mix(in srgb, var(--subject) 10%, var(--bg-card));
    box-shadow: 0 12px 28px color-mix(in srgb, var(--subject) 16%, transparent);
}

.related-top {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
}

.related-era {
    color: var(--subject);
    font-family: var(--mono);
    font-size: 15px;
    font-weight: 800;
    font-variant-numeric: tabular-nums;
}

.related-why {
    padding: 2px 8px;
    border-radius: 999px;
    background: color-mix(in srgb, var(--subject) 14%, transparent);
    color: color-mix(in srgb, var(--subject) 82%, var(--text));
    font-size: 10px;
    font-weight: 600;
}

.related-card h3 {
    margin: 0;
    font-size: 15.5px;
    line-height: 1.45;
}

.related-card p {
    margin: 0;
    color: var(--text-secondary);
    font-size: 12.5px;
    line-height: 1.75;
}

.related-pager {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 12px;
    padding-top: 18px;
    border-top: 1px solid var(--border-light);
}

.pager-link {
    display: grid;
    gap: 4px;
    color: var(--text);
    text-decoration: none;
}

.pager-link small {
    color: var(--text-muted);
    font-family: var(--mono);
    font-size: 10px;
}

.pager-link span {
    font-size: 13.5px;
    font-weight: 600;
    line-height: 1.5;
}

.pager-link:hover span {
    color: var(--subject);
}

.pager-link.is-next {
    text-align: right;
    justify-items: end;
}

/* ── 底部 ── */
.detail-footer {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding-top: 24px;
    border-top: 1px solid var(--border);
}

.sources {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 14px;
    color: var(--text-muted);
    font-size: 11px;
}

.sources a {
    color: var(--text-secondary);
    text-decoration: none;
}

.sources a:hover {
    color: var(--subject);
}

.back-footer {
    color: var(--text-secondary);
    font-size: 12px;
    text-decoration: none;
}

.back-footer:hover {
    color: var(--subject);
}

.missing {
    padding: 130px 20px;
    text-align: center;
}

.missing p {
    margin: 10px 0 24px;
    color: var(--text-secondary);
}

.missing a {
    color: var(--subject);
}

@media (max-width: 760px) {
    .detail-page {
        width: calc(100% - 28px);
    }

    /* 封面收紧，主题线条缩小并贴近角落 */
    .article-cover {
        margin-top: -24px;
        padding: 26px 18px 32px;
    }

    .cover-inner {
        max-width: none;
    }

    .cover-motif {
        right: 4px;
        bottom: 4px;
        width: 190px;
        height: 170px;
        opacity: 0.66;
    }

    .related-grid {
        grid-template-columns: 1fr;
    }

    .pager-link.is-next {
        justify-items: start;
        text-align: left;
    }

    .band-heading {
        grid-template-columns: 1fr;
        gap: 6px;
    }

    .story-list::before {
        left: 60px;
    }

    .story-beat {
        grid-template-columns: 48px 14px minmax(0, 1fr);
        gap: 6px;
        padding-bottom: 22px;
    }

    .beat-year {
        font-size: 10px;
    }

    .beat-body h3 {
        font-size: 16px;
    }

    .beat-body p {
        font-size: 13px;
    }

    .cta-band {
        flex-direction: column;
        align-items: flex-start;
    }
}
</style>
