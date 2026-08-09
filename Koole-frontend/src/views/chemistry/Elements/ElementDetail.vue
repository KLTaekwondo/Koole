<template>
    <div class="element-page">
        <template v-if="element">
            <header class="element-header">
                <router-link to="/chem-lab/periodic-table" class="back-link">← 返回元素周期表</router-link>
                <nav aria-label="相邻元素">
                    <router-link v-if="previous" :to="`/chem-lab/periodic-table/${previous.symbol}`">← {{ previous.symbol }}</router-link>
                    <router-link v-if="next" :to="`/chem-lab/periodic-table/${next.symbol}`">{{ next.symbol }} →</router-link>
                </nav>
            </header>

            <section class="element-hero" :style="{ '--element': category.color }">
                <div class="hero-copy">
                    <div class="hero-kicker">
                        <span class="category-chip">{{ category.label }}</span>
                        <span>{{ phaseLabel }} · 第 {{ element.period }} 周期</span>
                    </div>
                    <h1>{{ element.name }} <em>{{ element.englishName }}</em></h1>
                    <p class="hero-lede">{{ story?.intro || fallbackIntro }}</p>
                    <div class="hero-actions">
                        <button v-if="story" type="button" class="hero-action primary" @click="scrollToStory">从它的故事开始 ↓</button>
                        <router-link v-else to="/chem-lab/periodic-table" class="hero-action primary">查看周期表位置 →</router-link>
                        <span class="hero-location">{{ groupText }} · {{ element.block }} 区</span>
                    </div>
                </div>

                <div class="atom-visual" :aria-label="`${element.name}的电子层示意图`">
                    <div class="atom-orbits" aria-hidden="true">
                        <span v-for="(count, index) in element.shells" :key="index" class="atom-orbit" :style="shellStyle(index)"><i v-for="electron in count" :key="electron" :style="electronStyle(index, electron, count)"></i></span>
                    </div>
                    <div class="atom-core"><strong>{{ element.symbol }}</strong><small>{{ element.atomicNumber }}</small></div>
                    <span class="atom-caption">{{ electronTotal }} ELECTRONS · {{ element.shells.length }} SHELLS</span>
                </div>
            </section>

            <div class="element-stats" :style="{ '--element': category.color }">
                <div><span>原子序数</span><strong>{{ element.atomicNumber }}</strong></div>
                <div><span>相对原子质量</span><strong>{{ element.atomicMass }}</strong></div>
                <div><span>价电子</span><strong>{{ element.valenceElectrons }}</strong></div>
                <div><span>电子排布</span><strong>{{ element.electronConfiguration }}</strong></div>
            </div>

            <main class="element-content">
                <template v-if="story">
                    <section id="story" class="story-section section-band" :style="{ '--element': category.color }">
                        <div class="section-heading">
                            <span>01 / DISCOVERY</span>
                            <h2>人类是怎么认识它的？</h2>
                        </div>
                        <div class="discovery-layout">
                            <div class="discovery-year">{{ story.discovery.year }}</div>
                            <article>
                                <h3>{{ story.discovery.title }}</h3>
                                <p>{{ story.discovery.text }}</p>
                                <p v-if="learning" class="story-narrative">{{ learning.narrative }}</p>
                            </article>
                            <aside><span>自然界中的它</span><p>{{ story.occurrence }}</p></aside>
                        </div>
                    </section>

                    <section class="application-section section-band" :style="{ '--element': category.color }">
                        <div class="section-heading">
                            <span>02 / IN THE REAL WORLD</span>
                            <h2>它如何进入我们的生活？</h2>
                        </div>
                        <div class="application-grid">
                            <article v-for="(application, index) in story.applications" :key="application.title">
                                <span>0{{ index + 1 }}</span>
                                <h3>{{ application.title }}</h3>
                                <p>{{ application.text }}</p>
                            </article>
                        </div>
                    </section>

                    <section v-if="learning?.reactions?.length" class="reaction-section section-band" :style="{ '--element': category.color }">
                        <div class="section-heading">
                            <span>03 / WATCH THE REACTION</span>
                            <h2>把现象写成化学语言</h2>
                        </div>
                        <div class="reaction-grid">
                            <article v-for="(reaction, index) in learning.reactions" :key="reaction.equation" class="reaction-card">
                                <header><span>REACTION / 0{{ index + 1 }}</span><small>{{ reaction.condition }}</small></header>
                                <div class="equation">{{ reaction.equation }}</div>
                                <dl>
                                    <div><dt>观察现象</dt><dd>{{ reaction.phenomenon }}</dd></div>
                                    <div><dt>它解释了什么</dt><dd>{{ reaction.meaning }}</dd></div>
                                </dl>
                                <p class="safety-note"><strong>安全提示</strong>{{ reaction.safety }}</p>
                            </article>
                        </div>
                    </section>
                </template>

                <section class="science-section section-band" :style="{ '--element': category.color }">
                    <div class="section-heading">
                        <span>{{ story ? "04" : "01" }} / WHY IT BEHAVES THIS WAY</span>
                        <h2>再回到元素内部寻找答案</h2>
                    </div>
                    <div class="science-grid">
                        <article class="science-panel shell-panel">
                            <div class="panel-heading"><span>电子层结构</span><strong>{{ element.valenceElectrons }} 个价电子</strong></div>
                            <div class="electron-stage" :aria-label="`${element.name}的电子层与电子数量`">
                                <div class="atom-orbits" aria-hidden="true">
                                    <span v-for="(count, index) in element.shells" :key="index" class="atom-orbit" :style="shellStyle(index)"><i v-for="electron in count" :key="electron" :style="electronStyle(index, electron, count)"></i></span>
                                </div>
                                <div class="atom-core"><strong>{{ element.symbol }}</strong><small>{{ element.atomicNumber }}</small></div>
                            </div>
                            <div class="shell-list">
                                <div v-for="(count, index) in element.shells" :key="index" class="shell-row">
                                    <span>{{ shellNames[index] || `第 ${index + 1} 层` }}</span>
                                    <div class="shell-bar"><i :style="{ width: `${Math.min(count / shellCapacity(index) * 100, 100)}%` }"></i></div>
                                    <b>{{ count }}</b>
                                </div>
                            </div>
                            <p>最外层电子通常直接影响元素参与化学反应的方式。</p>
                        </article>
                        <article class="science-panel property-panel">
                            <div class="panel-heading"><span>物理性质</span><strong>{{ phaseLabel }}</strong></div>
                            <div class="property-grid">
                                <div><span>熔点</span><strong>{{ measurement(element.meltingPoint, "°C") }}</strong></div>
                                <div><span>沸点</span><strong>{{ measurement(element.boilingPoint, "°C") }}</strong></div>
                                <div><span>密度</span><strong>{{ measurement(element.density, "g/cm³") }}</strong></div>
                                <div><span>电负性</span><strong>{{ value(element.electronegativity) }}</strong></div>
                            </div>
                        </article>
                        <article class="science-panel position-panel">
                            <div class="panel-heading"><span>周期表坐标</span><strong>{{ category.label }}</strong></div>
                            <div class="position-map"><span>{{ element.period }}<small>周期</small></span><b>×</b><span>{{ element.group ?? "—" }}<small>族</small></span></div>
                            <dl><div><dt>区块</dt><dd>{{ element.block }} 区</dd></div><div><dt>电子排布</dt><dd>{{ element.electronConfiguration }}</dd></div></dl>
                        </article>
                    </div>
                    <p class="data-note">缺少统一可靠测量的数据会明确显示“暂无可靠数据”。</p>
                </section>

                <section v-if="story" class="question-section" :style="{ '--element': category.color }">
                    <span>带着一个问题离开</span>
                    <h2>{{ story.question }}</h2>
                    <div><a :href="story.source.url" target="_blank" rel="noreferrer">资料参考：{{ story.source.label }} ↗</a><router-link to="/chem-lab/periodic-table">继续探索其他元素 →</router-link></div>
                </section>
                <section v-else class="coming-section">
                    <span>ENCYCLOPEDIA IN PROGRESS</span>
                    <h2>{{ element.name }}的故事正在整理中</h2>
                    <p>当前仍可查看完整的结构与物理数据。百科内容将按每批 10 个元素持续补充。</p>
                </section>
            </main>
        </template>

        <div v-else class="missing"><h1>没有找到这个元素</h1><p>请检查元素符号，或返回周期表重新选择。</p><router-link to="/chem-lab/periodic-table">返回元素周期表</router-link></div>
    </div>
</template>

<script setup>
import { computed } from "vue"
import { useRoute } from "vue-router"
import { PERIODIC_ELEMENTS, ELEMENT_CATEGORIES, ELEMENT_PHASES, getElementBySymbol } from "../../../constants/periodicElements.js"
import { ELEMENT_CONTENT } from "../../../constants/elementContent.js"

const route = useRoute()
const shellNames = ["K 层", "L 层", "M 层", "N 层", "O 层", "P 层", "Q 层"]
const capacities = [2, 8, 18, 32, 32, 18, 8]

const element = computed(() => getElementBySymbol(route.params.symbol))
const category = computed(() => ELEMENT_CATEGORIES[element.value?.category] || ELEMENT_CATEGORIES.unknown)
const phaseLabel = computed(() => ELEMENT_PHASES[element.value?.phase] || "未知")
const previous = computed(() => element.value ? PERIODIC_ELEMENTS[element.value.atomicNumber - 2] || null : null)
const next = computed(() => element.value ? PERIODIC_ELEMENTS[element.value.atomicNumber] || null : null)
const story = computed(() => ELEMENT_CONTENT[element.value?.symbol] || null)
const learning = story
const electronTotal = computed(() => element.value?.shells.reduce((sum, count) => sum + count, 0) || 0)
const groupText = computed(() => element.value?.group ? `第 ${element.value.group} 族` : "镧系或锕系")
const fallbackIntro = computed(() => element.value ? `${element.value.name}位于第 ${element.value.period} 周期，属于${category.value.label}。从电子层结构开始，可以理解它在周期表中的位置与性质。` : "")

function value(input) {
    return input === null || input === undefined || input === "" ? "暂无可靠数据" : input
}

function measurement(input, unit) {
    return input === null || input === undefined ? "暂无可靠数据" : `${input} ${unit}`
}

function shellCapacity(index) {
    return capacities[index] || 32
}

function shellStyle(index) {
    const size = orbitSize(index)
    return {
        width: `${size}px`,
        height: `${size}px`,
        margin: `${-size / 2}px 0 0 ${-size / 2}px`,
        "--orbit-duration": `${6 + index * 1.6}s`,
        "--orbit-delay": `${index * -0.7}s`,
    }
}

function electronStyle(index, electron, count) {
    const size = orbitSize(index)
    const angle = ((electron - 1) / count) * Math.PI * 2
    return {
        left: `${50 + Math.sin(angle) * 50}%`,
        top: `${50 - Math.cos(angle) * 50}%`,
        "--electron-size": `${count > 18 ? 5 : 7}px`,
        "--electron-angle": `${angle}rad`,
        "--orbit-radius": `${size / 2}px`,
    }
}

function orbitSize(index) {
    return 56 + index * 44
}

function scrollToStory() {
    const target = document.getElementById("story")
    if (!target) return
    const behavior = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth"
    target.scrollIntoView({ behavior, block: "start" })
}
</script>

<style scoped>
.element-page {
    width: min(1180px, calc(100% - 32px));
    margin: -20px auto 80px;
    color: var(--text);
}

.element-header {
    min-height: 72px;
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.back-link,
.element-header nav a {
    color: var(--text-secondary);
    font-size: 12px;
    font-weight: 700;
    text-decoration: none;
}

.element-header nav {
    display: flex;
    gap: 18px;
}

.back-link:hover,
.element-header nav a:hover {
    color: #2aa27f;
}

.element-hero {
    position: relative;
    min-height: 500px;
    display: grid;
    grid-template-columns: minmax(0, 1.2fr) 400px;
    align-items: center;
    gap: 48px;
    overflow: hidden;
    padding: 54px 58px;
    border: 1px solid color-mix(in srgb, var(--element) 42%, var(--border));
    border-radius: 24px;
    background: linear-gradient(120deg, color-mix(in srgb, var(--element) 10%, var(--bg-card)) 0%, var(--bg-card) 62%);
}

.element-hero::before {
    content: "";
    position: absolute;
    inset: 0;
    background-image: linear-gradient(color-mix(in srgb, var(--element) 7%, transparent) 1px, transparent 1px), linear-gradient(90deg, color-mix(in srgb, var(--element) 7%, transparent) 1px, transparent 1px);
    background-size: 32px 32px;
    mask-image: linear-gradient(90deg, transparent, #000 58%, #000);
    pointer-events: none;
}

.hero-copy {
    position: relative;
    z-index: 1;
}

.hero-kicker {
    display: flex;
    align-items: center;
    gap: 12px;
    color: var(--text-muted);
    font-family: var(--mono);
    font-size: 10px;
}

.category-chip {
    display: inline-flex;
    padding: 5px 10px;
    border-radius: 999px;
    background: color-mix(in srgb, var(--element) 16%, transparent);
    color: var(--element);
    font-weight: 800;
}

.element-hero h1 {
    margin: 22px 0 18px;
    font-size: 64px;
    line-height: 1.05;
}

.element-hero h1 em {
    display: block;
    margin-top: 10px;
    color: var(--text-muted);
    font-family: var(--mono);
    font-size: 16px;
    font-style: normal;
    font-weight: 500;
}

.hero-lede {
    max-width: 620px;
    color: var(--text-secondary);
    font-size: 17px;
    line-height: 1.9;
}

.hero-actions {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 14px 20px;
    margin-top: 28px;
}

.hero-action {
    display: inline-flex;
    align-items: center;
    padding: 10px 15px;
    border: 0;
    border-radius: 8px;
    background: transparent;
    color: var(--element);
    font-family: inherit;
    font-size: 12px;
    font-weight: 800;
    text-decoration: none;
}

.hero-action.primary {
    background: var(--element);
    color: #fff;
}

.hero-location {
    color: var(--text-muted);
    font-family: var(--mono);
    font-size: 10px;
}

.atom-visual {
    position: relative;
    z-index: 1;
    width: 360px;
    height: 400px;
    display: grid;
    place-items: center;
}

.atom-orbits {
    position: absolute;
    inset: 0 0 40px;
}

.atom-orbit {
    position: absolute;
    top: 50%;
    left: 50%;
    border: 1px solid color-mix(in srgb, var(--element) 52%, var(--border));
    border-radius: 50%;
    animation: orbit-spin var(--orbit-duration) linear var(--orbit-delay) infinite;
}

.atom-orbit i {
    position: absolute;
    top: 50%;
    left: 50%;
    width: var(--electron-size, 9px);
    height: var(--electron-size, 9px);
    border: 2px solid var(--bg-card);
    border-radius: 50%;
    background: var(--element);
    box-shadow: 0 0 14px color-mix(in srgb, var(--element) 64%, transparent);
    transform: translate(-50%, -50%);
}

.atom-core {
    position: absolute;
    top: calc(50% - 20px);
    left: 50%;
    width: 78px;
    height: 78px;
    display: grid;
    place-items: center;
    border: 1px solid color-mix(in srgb, var(--element) 72%, #fff);
    border-radius: 50%;
    background: var(--element);
    color: #fff;
    box-shadow: 0 14px 42px color-mix(in srgb, var(--element) 34%, transparent);
    transform: translate(-50%, -50%);
}

.atom-core strong {
    font-size: 28px;
    line-height: 1;
}

.atom-core small {
    position: absolute;
    bottom: 9px;
    font-family: var(--mono);
    font-size: 8px;
    opacity: 0.75;
}

.atom-caption {
    position: absolute;
    bottom: 0;
    color: var(--text-muted);
    font-family: var(--mono);
    font-size: 9px;
    letter-spacing: 0.08em;
}

@keyframes orbit-spin {
    to { transform: rotate(360deg); }
}

.element-stats {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    margin-top: 12px;
    border-block: 1px solid var(--border);
}

.element-stats > div {
    min-width: 0;
    padding: 20px 22px;
    border-right: 1px solid var(--border);
}

.element-stats > div:last-child { border-right: 0; }
.element-stats span { display: block; color: var(--text-muted); font-size: 10px; }
.element-stats strong { display: block; overflow: hidden; margin-top: 5px; color: var(--element); font-family: var(--mono); font-size: 15px; text-overflow: ellipsis; white-space: nowrap; }

.element-content { margin-top: 68px; }
.section-band { scroll-margin-top: 90px; margin-bottom: 82px; }
.section-heading { display: grid; grid-template-columns: 240px minmax(0, 1fr); align-items: end; gap: 24px; margin-bottom: 30px; }
.section-heading > span { color: var(--element); font-family: var(--mono); font-size: 9px; font-weight: 800; letter-spacing: 0.1em; }
.section-heading h2 { font-size: 34px; line-height: 1.2; }

.discovery-layout {
    display: grid;
    grid-template-columns: 220px minmax(0, 1fr) minmax(260px, 0.7fr);
    gap: 30px;
    padding-top: 26px;
    border-top: 1px solid var(--border);
}

.discovery-year { color: var(--element); font-family: var(--mono); font-size: 58px; font-weight: 800; line-height: 1; }
.discovery-layout h3 { margin-bottom: 12px; font-size: 22px; }
.discovery-layout p { color: var(--text-secondary); line-height: 1.9; }
.discovery-layout aside { padding-left: 24px; border-left: 1px solid var(--border); }
.discovery-layout aside span { color: var(--element); font-size: 11px; font-weight: 800; }
.discovery-layout aside p { margin-top: 10px; font-size: 13px; }
.story-narrative { margin-top: 20px; padding-top: 20px; border-top: 1px solid var(--border); }

.application-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); border-block: 1px solid var(--border); }
.application-grid article { min-height: 240px; padding: 30px; border-right: 1px solid var(--border); }
.application-grid article:last-child { border-right: 0; }
.application-grid article > span { color: var(--element); font-family: var(--mono); font-size: 10px; }
.application-grid h3 { margin: 54px 0 12px; font-size: 20px; }
.application-grid p { color: var(--text-secondary); font-size: 13px; line-height: 1.85; }

.reaction-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
.reaction-card { min-width: 0; overflow: hidden; border: 1px solid color-mix(in srgb, var(--element) 28%, var(--border)); border-radius: 8px; background: color-mix(in srgb, var(--element) 5%, var(--bg-card)); }
.reaction-card header { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 15px 18px; border-bottom: 1px solid var(--border); }
.reaction-card header span { color: var(--element); font-family: var(--mono); font-size: 9px; font-weight: 800; }
.reaction-card header small { color: var(--text-muted); font-size: 9px; text-align: right; }
.equation { overflow-x: auto; padding: 30px 18px; color: var(--text); font-family: var(--mono); font-size: 22px; font-weight: 800; text-align: center; white-space: nowrap; }
.reaction-card dl { padding: 0 18px 8px; }
.reaction-card dl div { display: grid; grid-template-columns: 82px minmax(0, 1fr); gap: 12px; padding: 12px 0; border-top: 1px solid var(--border); }
.reaction-card dt { color: var(--text-muted); font-size: 10px; }
.reaction-card dd { color: var(--text-secondary); font-size: 11px; line-height: 1.7; }
.safety-note { display: flex; gap: 9px; margin: 10px; padding: 11px 12px; border-radius: 6px; background: color-mix(in srgb, #d97706 10%, transparent); color: color-mix(in srgb, #b45309 82%, var(--text)); font-size: 10px; line-height: 1.65; }
.safety-note strong { flex: 0 0 auto; }

.science-grid { display: grid; grid-template-columns: 1.2fr 1fr 1fr; gap: 12px; }
.science-panel { min-width: 0; padding: 24px; border: 1px solid var(--border); border-radius: 8px; background: color-mix(in srgb, var(--bg-card) 86%, transparent); }
.panel-heading { display: flex; justify-content: space-between; gap: 14px; padding-bottom: 16px; border-bottom: 1px solid var(--border); }
.panel-heading span { color: var(--text-secondary); font-size: 11px; }
.panel-heading strong { color: var(--element); font-family: var(--mono); font-size: 10px; }

.shell-list { display: grid; gap: 13px; margin: 24px 0; }
.electron-stage { position: relative; width: 100%; height: 342px; margin-top: 20px; display: grid; place-items: center; overflow: hidden; border-block: 1px solid var(--border); }
.electron-stage .atom-orbits { inset: 0; }
.electron-stage .atom-core { top: 50%; width: 62px; height: 62px; }
.electron-stage .atom-core strong { font-size: 22px; }
.electron-stage .atom-core small { bottom: 7px; }
.electron-stage .atom-orbit { border-color: color-mix(in srgb, var(--element) 68%, var(--border)); }
.electron-stage .atom-orbit i { border-width: 1px; }
.shell-row { display: grid; grid-template-columns: 42px minmax(0, 1fr) 24px; align-items: center; gap: 10px; }
.shell-row > span { color: var(--text-muted); font-size: 10px; }
.shell-row > b { color: var(--element); font-family: var(--mono); font-size: 10px; text-align: right; }
.shell-bar { height: 4px; overflow: hidden; background: var(--border); }
.shell-bar i { display: block; height: 100%; background: var(--element); }
.shell-panel > p { color: var(--text-muted); font-size: 10px; line-height: 1.7; }

.property-grid { display: grid; grid-template-columns: 1fr 1fr; margin-top: 18px; }
.property-grid div { min-width: 0; padding: 16px 8px; border-bottom: 1px solid var(--border); }
.property-grid span { display: block; color: var(--text-muted); font-size: 10px; }
.property-grid strong { display: block; overflow-wrap: anywhere; margin-top: 6px; font-family: var(--mono); font-size: 11px; }

.position-map { display: flex; align-items: center; justify-content: center; gap: 16px; padding: 24px 0; }
.position-map > span { color: var(--element); font-family: var(--mono); font-size: 38px; font-weight: 800; text-align: center; }
.position-map small { display: block; color: var(--text-muted); font-family: var(--sans); font-size: 9px; font-weight: 500; }
.position-map > b { color: var(--border); }
.position-panel dl div { display: flex; justify-content: space-between; gap: 12px; padding: 9px 0; border-bottom: 1px solid var(--border); }
.position-panel dt { color: var(--text-muted); font-size: 10px; }
.position-panel dd { overflow-wrap: anywhere; font-family: var(--mono); font-size: 10px; text-align: right; }
.data-note { margin-top: 12px; color: var(--text-muted); font-size: 9px; }

.question-section { padding: 50px 0 24px; border-top: 2px solid var(--element); }
.question-section > span { color: var(--element); font-size: 11px; font-weight: 800; }
.question-section h2 { max-width: 820px; margin: 18px 0 34px; font-size: 36px; line-height: 1.4; }
.question-section > div { display: flex; justify-content: space-between; flex-wrap: wrap; gap: 14px; }
.question-section a { color: var(--text-secondary); font-size: 11px; text-decoration: none; }
.question-section a:hover { color: var(--element); }

.coming-section { padding: 46px 0; border-top: 1px solid var(--border); text-align: center; }
.coming-section span { color: #2aa27f; font-family: var(--mono); font-size: 9px; }
.coming-section h2 { margin: 12px 0 8px; font-size: 28px; }
.coming-section p { color: var(--text-secondary); }
.missing { padding: 130px 20px; text-align: center; }
.missing p { margin: 10px 0 25px; color: var(--text-secondary); }
.missing a { color: #2aa27f; }

@media (max-width: 900px) {
    .element-hero { grid-template-columns: 1fr; padding: 42px; }
    .atom-visual { width: 100%; max-width: 360px; margin: 0 auto; }
    .element-stats { grid-template-columns: repeat(2, 1fr); }
    .element-stats > div:nth-child(2) { border-right: 0; }
    .element-stats > div:nth-child(-n + 2) { border-bottom: 1px solid var(--border); }
    .discovery-layout { grid-template-columns: 150px minmax(0, 1fr); }
    .discovery-layout aside { grid-column: 2; padding: 20px 0 0; border-top: 1px solid var(--border); border-left: 0; }
    .science-grid { grid-template-columns: 1fr 1fr; }
    .shell-panel { grid-column: 1 / -1; }
}

@media (max-width: 640px) {
    .element-page { width: calc(100% - 20px); margin-top: -24px; }
    .element-header { min-height: 64px; }
    .element-header nav { gap: 10px; }
    .element-hero { min-height: 0; gap: 20px; padding: 28px 22px; border-radius: 14px; }
    .element-hero h1 { font-size: 44px; }
    .hero-lede { font-size: 14px; }
    .atom-visual { height: 300px; transform: scale(0.9); }
    .element-stats > div { padding: 15px 12px; }
    .element-stats strong { font-size: 12px; }
    .element-content { margin-top: 48px; }
    .section-band { margin-bottom: 58px; }
    .section-heading { grid-template-columns: 1fr; gap: 8px; }
    .section-heading h2 { font-size: 27px; }
    .discovery-layout { grid-template-columns: 1fr; }
    .discovery-layout aside { grid-column: auto; }
    .discovery-year { font-size: 48px; }
    .application-grid { grid-template-columns: 1fr; }
    .application-grid article { min-height: 0; border-right: 0; border-bottom: 1px solid var(--border); }
    .application-grid article:last-child { border-bottom: 0; }
    .application-grid h3 { margin-top: 24px; }
    .reaction-grid { grid-template-columns: 1fr; }
    .equation { font-size: 18px; }
    .science-grid { grid-template-columns: 1fr; }
    .shell-panel { grid-column: auto; }
    .question-section h2 { font-size: 28px; }
}

@media (prefers-reduced-motion: reduce) {
    .atom-orbit { animation: none; }
}
</style>
