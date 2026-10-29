<template>
    <div v-if="item" class="detail-page">
        <header class="detail-header">
            <router-link to="/knowledge" class="back-link">← 知识小站</router-link>
            <div class="kicker">
                <span class="era-badge">{{ item.era }}</span>
                <span>{{ item.category }}</span>
            </div>
            <h1>{{ item.title }}</h1>
            <p class="hook">{{ item.hook }}</p>
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
                            <p>{{ beat.text }}</p>
                        </div>
                    </li>
                </ol>
                <aside v-if="item.misconception" class="misconception">
                    <strong>这里容易被想错</strong>
                    <p>{{ item.misconception }}</p>
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
                    <li v-for="pitfall in item.pitfalls" :key="pitfall">{{ pitfall }}</li>
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

            <footer class="detail-footer">
                <div v-if="item.sources?.length" class="sources">
                    <span>参考资料</span>
                    <a v-for="source in item.sources" :key="source.url" :href="source.url" target="_blank" rel="noreferrer">{{ source.label }} ↗</a>
                </div>
                <router-link to="/knowledge" class="back-footer">← 回到知识小站</router-link>
            </footer>
        </main>
    </div>

    <div v-else class="missing">
        <h1>没有找到这个现象</h1>
        <p>它可能还没写完，或者链接已经失效。</p>
        <router-link to="/knowledge">回到知识小站</router-link>
    </div>
</template>

<script setup>
import { computed, onMounted, watch } from "vue"
import { useRoute } from "vue-router"
import { MdPreview } from "md-editor-v3"
import "md-editor-v3/lib/preview.css"
import { theme } from "../../stores/theme.js"
import { getPhenomenonById } from "../../content/phenomena.mjs"

const route = useRoute()
const item = computed(() => getPhenomenonById(route.params.id))

// 「去模拟」链接：把文章里预设的参数一起带过去，打开就是那组条件
const simulationLink = computed(() => {
    const simulation = item.value?.simulation
    if (!simulation?.modelId) return "/knowledge"
    return {
        path: `/physics-lab/classic/${simulation.modelId}`,
        query: simulation.params || {},
    }
})

const updateTitle = () => {
    document.title = item.value ? `${item.value.title} · 知识小站 · Koole` : "知识小站 · Koole"
}

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

/* ── 头部 ── */
.detail-header {
    display: grid;
    gap: 12px;
    padding: 40px 0 18px;
}

.back-link {
    color: var(--text-secondary);
    font-size: 12px;
    font-weight: 700;
    text-decoration: none;
}

.back-link:hover {
    color: var(--primary);
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
    background: var(--primary-light);
    color: var(--primary);
    font-weight: 800;
}

.detail-header h1 {
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
    color: var(--primary);
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
    color: var(--primary);
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
    background: var(--primary);
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--primary) 16%, transparent);
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
    border: 1px solid color-mix(in srgb, var(--primary) 30%, var(--border));
    border-radius: var(--radius-xl);
    background:
        radial-gradient(circle at 12% 0%, color-mix(in srgb, var(--primary) 16%, transparent), transparent 60%),
        color-mix(in srgb, var(--primary) 5%, var(--bg-card));
}

.cta-kicker {
    color: var(--primary);
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
    background: var(--primary-gradient);
    color: #fff;
    font-size: 14px;
    font-weight: 700;
    text-decoration: none;
    box-shadow: 0 12px 28px color-mix(in srgb, var(--primary) 26%, transparent);
    transition: transform 0.25s var(--ease-out), box-shadow 0.25s var(--ease-out);
}

.cta-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 16px 34px color-mix(in srgb, var(--primary) 32%, transparent);
}

.cta-model {
    color: var(--text-muted);
    font-family: var(--mono);
    font-size: 11px;
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
    color: var(--primary);
}

.back-footer {
    color: var(--text-secondary);
    font-size: 12px;
    text-decoration: none;
}

.back-footer:hover {
    color: var(--primary);
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
    color: var(--primary);
}

@media (max-width: 760px) {
    .detail-page {
        width: calc(100% - 28px);
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
