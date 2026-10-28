<template>
    <transition name="element-swap" mode="out-in">
    <div v-if="element" :key="element.symbol" class="element-page" :style="{ '--element': color }">
        <!-- ── 顶部：返回 + 相邻元素 ── -->
        <header class="page-bar">
            <router-link to="/chem-lab/periodic-table" class="back-link">
                <svg viewBox="0 0 24 24" aria-hidden="true"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
                元素周期表
            </router-link>
            <nav class="neighbor-nav" aria-label="相邻元素">
                <router-link v-if="previous" :to="`/chem-lab/periodic-table/${previous.symbol}`" class="neighbor" :title="`上一个元素：${previous.name}`">
                    <small>← 上一号</small>
                    <strong>{{ previous.symbol }}</strong>
                    <span>{{ previous.name }}</span>
                </router-link>
                <router-link v-if="next" :to="`/chem-lab/periodic-table/${next.symbol}`" class="neighbor" :title="`下一个元素：${next.name}`">
                    <small>下一号 →</small>
                    <strong>{{ next.symbol }}</strong>
                    <span>{{ next.name }}</span>
                </router-link>
            </nav>
        </header>

        <!-- ── HERO ── -->
        <section class="hero">
            <div class="hero-copy">
                <div class="hero-kicker">
                    <span class="category-chip">{{ categoryLabel(element) }}</span>
                    <span>第 {{ element.period }} 周期</span>
                    <i></i>
                    <span>{{ groupDisplay }}</span>
                    <i></i>
                    <span>{{ element.block }} 区</span>
                    <i></i>
                    <span>{{ phaseLabel(element) }}</span>
                </div>
                <h1>
                    {{ element.name }}
                    <em>{{ element.englishName }}</em>
                </h1>
                <p class="hero-lede">{{ summary }}</p>
                <div class="hero-actions">
                    <button v-if="story" type="button" class="hero-action primary" @click="scrollTo('story')">从它的故事开始 ↓</button>
                    <button v-else type="button" class="hero-action primary" @click="scrollTo('position')">看它在周期表的位置 ↓</button>
                    <router-link to="/chem-lab/periodic-table" class="hero-action ghost">回到周期表</router-link>
                </div>
            </div>

            <div class="hero-atom" :aria-label="`${element.name}的电子层示意图`">
                <span class="hero-symbol" aria-hidden="true">{{ element.symbol }}</span>
                <div class="atom-orbits" aria-hidden="true">
                    <span v-for="(count, index) in element.shells" :key="index" class="atom-orbit" :style="shellStyle(index)">
                        <i v-for="electron in count" :key="electron" :style="electronStyle(index, electron, count)"></i>
                    </span>
                </div>
                <div class="atom-core"><strong>{{ element.symbol }}</strong><small>{{ element.atomicNumber }}</small></div>
                <span class="atom-caption">{{ totalElectrons }} ELECTRONS · {{ element.shells.length }} SHELLS</span>
            </div>
        </section>

        <!-- ── 关键数字 ── -->
        <div class="fact-strip">
            <div>
                <span>原子序数</span>
                <strong>{{ element.atomicNumber }}</strong>
            </div>
            <div>
                <span>相对原子质量</span>
                <strong>{{ element.atomicMass }}</strong>
                <small v-if="isRadioactiveMass(element)">方括号为最稳定同位素的质量数</small>
            </div>
            <div>
                <span>最外层电子</span>
                <strong>{{ element.valenceElectrons }}</strong>
            </div>
            <div>
                <span>电子层数</span>
                <strong>{{ element.shells.length }}</strong>
            </div>
        </div>

        <main class="element-content">
            <!-- ── 01 位置 ── -->
            <section id="position" class="band">
                <header class="band-heading">
                    <span>01 / POSITION</span>
                    <h2>它在周期表的哪一格？</h2>
                    <p>{{ positionLead }}</p>
                </header>
                <MiniPeriodicTable :active="element" />
                <div class="position-notes">
                    <article>
                        <h3>{{ categoryLabel(element) }}</h3>
                        <p>{{ categoryFact(element).summary }}。</p>
                        <p>{{ categoryFact(element).detail }}</p>
                    </article>
                    <article>
                        <h3>{{ element.block }} 区 · {{ groupDisplay }}</h3>
                        <p>{{ blockFact(element) }}</p>
                        <p>{{ phaseFact(element) }}。</p>
                    </article>
                </div>
            </section>

            <!-- ── 02 结构 ── -->
            <section id="structure" class="band">
                <header class="band-heading">
                    <span>02 / STRUCTURE</span>
                    <h2>电子是怎么排布的？</h2>
                    <p>元素在周期表里的位置，本质上由它的电子层结构决定：第几周期 = 有几层电子，第几族 = 最外层或次外层有几个价电子。</p>
                </header>

                <div class="structure-grid">
                    <article class="panel shell-panel">
                        <header class="panel-heading">
                            <span>电子层分布</span>
                            <strong>{{ totalElectrons }} 个电子</strong>
                        </header>
                        <div class="shell-rows">
                            <div v-for="layer in shellLayersData" :key="layer.name" class="shell-row">
                                <span class="shell-name">{{ layer.name }}</span>
                                <div class="shell-bar"><i :style="{ width: `${layer.ratio * 100}%` }"></i></div>
                                <b>{{ layer.count }}<small>/{{ layer.capacity }}</small></b>
                            </div>
                        </div>
                        <p class="panel-note">第 n 层最多容纳 2n² 个电子（K 层 2、L 层 8、M 层 18…）。最外层电子通常直接决定它怎么参与化学反应。</p>
                    </article>

                    <article class="panel">
                        <header class="panel-heading">
                            <span>电子层排布</span>
                            <strong>{{ element.block }} 区</strong>
                        </header>
                        <p class="config-line">{{ element.shells.join(" · ") }}</p>
                        <dl class="config-list">
                            <div><dt>周期</dt><dd>第 {{ element.period }} 周期</dd></div>
                            <div><dt>族</dt><dd>{{ groupDisplay }}</dd></div>
                            <div><dt>分区</dt><dd>{{ element.block }} 区</dd></div>
                            <div><dt>相态</dt><dd>{{ phaseLabel(element) }}</dd></div>
                        </dl>
                        <p class="panel-note">{{ blockFact(element) }}</p>
                    </article>

                    <article class="panel accent-panel">
                        <header class="panel-heading">
                            <span>这一族的关键点</span>
                            <strong>{{ categoryLabel(element) }}</strong>
                        </header>
                        <p class="accent-summary">{{ categoryFact(element).summary }}。</p>
                        <p class="panel-note">{{ categoryFact(element).detail }}</p>
                        <div class="accent-chips">
                            <span v-for="peer in nearestPeers" :key="peer.symbol" class="peer-chip">
                                <router-link :to="`/chem-lab/periodic-table/${peer.symbol}`">{{ peer.symbol }}</router-link>
                                <small>{{ peer.name }}</small>
                            </span>
                        </div>
                    </article>
                </div>
            </section>

            <!-- ── 03 性质 ── -->
            <section id="properties" class="band">
                <header class="band-heading">
                    <span>03 / PROPERTIES</span>
                    <h2>它的物理性质怎么样？</h2>
                    <p>有可靠数据的性质会和同周期、同族里已录入的元素一起画成对比条，方便看出高低。</p>
                </header>

                <div v-if="hasPhysicalData" class="property-grid">
                    <article v-for="prop in propertyCards" :key="prop.key" class="property-card">
                        <header>
                            <span>{{ prop.label }}</span>
                            <strong>{{ prop.display || "暂无可靠数据" }}</strong>
                        </header>
                        <div v-if="prop.peers.length > 1" class="compare-chart">
                            <div
                                v-for="peer in prop.peers"
                                :key="peer.symbol"
                                class="compare-item"
                                :class="{ active: peer.active }"
                                :title="`${peer.name}：${peer.value}${prop.unit ? ` ${prop.unit}` : ''}`"
                            >
                                <div class="compare-track"><i :style="{ height: `${peer.height}%` }"></i></div>
                                <small>{{ peer.symbol }}</small>
                            </div>
                        </div>
                        <p v-else class="compare-note">同周期 / 同族暂无其他可比数据。</p>
                    </article>
                </div>

                <div v-else class="empty-data">
                    <h3>{{ element.name }}的熔沸点、密度、电负性还没有录入可靠数据</h3>
                    <p>这些数值在不同教材和数据库里口径不一，宁可先空着也不写错。可以先看同周期、同族里已经有数据的元素：</p>
                    <div v-if="peersWithData.length" class="peer-chips">
                        <router-link v-for="peer in peersWithData" :key="peer.symbol" :to="`/chem-lab/periodic-table/${peer.symbol}`" class="peer-chip">
                            {{ peer.symbol }}<small>{{ peer.name }}</small>
                        </router-link>
                    </div>
                    <p v-else class="empty-data-note">这个元素附近暂时都没有录入物理数据。</p>
                </div>
            </section>

            <!-- ── 04 邻居 ── -->
            <section id="neighbors" class="band">
                <header class="band-heading">
                    <span>04 / NEIGHBORS</span>
                    <h2>和它同一族、同一周期的元素</h2>
                    <p>同一族的元素最外层电子数相同，化学性质相似；同一周期的元素电子层数相同，从左到右性质逐渐变化。</p>
                </header>
                <div class="neighbor-groups">
                    <article>
                        <h3>{{ groupPeersLabel(element) }}<small>{{ groupPeersData.length }} 个</small></h3>
                        <div class="peer-chips">
                            <router-link v-for="peer in groupPeersData" :key="peer.symbol" :to="`/chem-lab/periodic-table/${peer.symbol}`" class="peer-chip" :style="{ '--peer-color': peer.color }">
                                {{ peer.symbol }}<small>{{ peer.name }}</small>
                            </router-link>
                        </div>
                    </article>
                    <article>
                        <h3>第 {{ element.period }} 周期<small>{{ periodPeersData.length }} 个</small></h3>
                        <div class="peer-chips">
                            <router-link v-for="peer in periodPeersData" :key="peer.symbol" :to="`/chem-lab/periodic-table/${peer.symbol}`" class="peer-chip" :style="{ '--peer-color': peer.color }">
                                {{ peer.symbol }}<small>{{ peer.name }}</small>
                            </router-link>
                        </div>
                    </article>
                </div>
            </section>

            <!-- ── 05 小知识 ── -->
            <section v-if="trivia.length" id="trivia" class="band">
                <header class="band-heading">
                    <span>05 / SMALL NOTES</span>
                    <h2>关于它的小知识</h2>
                    <p>这些信息是从位置、物态和中文字形里直接读出来的，不需要额外查数据表。</p>
                </header>
                <div class="trivia-grid">
                    <article v-for="item in trivia" :key="item.label" class="trivia-card">
                        <span>{{ item.label }}</span>
                        <p>{{ item.text }}</p>
                    </article>
                </div>
            </section>

            <!-- ── 手写故事（有内容时才出现） ── -->
            <template v-if="story">
                <section id="story" class="band">
                    <header class="band-heading">
                        <span>06 / DISCOVERY</span>
                        <h2>人类是怎么认识它的？</h2>
                    </header>
                    <div class="discovery-layout">
                        <div class="discovery-year">{{ story.discovery?.year }}</div>
                        <article>
                            <h3>{{ story.discovery?.title }}</h3>
                            <p>{{ story.discovery?.text }}</p>
                            <p v-if="story.narrative" class="story-narrative">{{ story.narrative }}</p>
                        </article>
                        <aside>
                            <span>自然界中的它</span>
                            <p>{{ story.occurrence }}</p>
                        </aside>
                    </div>
                </section>

                <section v-if="story.applications?.length" class="band">
                    <header class="band-heading">
                        <span>07 / IN THE REAL WORLD</span>
                        <h2>它如何进入我们的生活？</h2>
                    </header>
                    <div class="application-grid">
                        <article v-for="(application, index) in story.applications" :key="application.title">
                            <span>0{{ index + 1 }}</span>
                            <h3>{{ application.title }}</h3>
                            <p>{{ application.text }}</p>
                        </article>
                    </div>
                </section>

                <section v-if="story.reactions?.length" class="band">
                    <header class="band-heading">
                        <span>08 / WATCH THE REACTION</span>
                        <h2>把现象写成化学语言</h2>
                    </header>
                    <div class="reaction-grid">
                        <article v-for="(reaction, index) in story.reactions" :key="reaction.equation" class="reaction-card">
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

                <section v-if="story.question" class="question-band">
                    <span>带着一个问题离开</span>
                    <h2>{{ story.question }}</h2>
                    <div>
                        <a v-if="story.source?.url" :href="story.source.url" target="_blank" rel="noreferrer">资料参考：{{ story.source.label }} ↗</a>
                        <router-link to="/chem-lab/periodic-table">继续探索其他元素 →</router-link>
                    </div>
                </section>
            </template>

            <!-- ── 底部说明（元素切换交给底部胶囊工具盒） ── -->
            <footer class="page-footer">
                <p class="data-note">数据来自公开元素数据整理；缺少统一可靠测量的性质会明确显示「暂无可靠数据」。手写百科内容按批次补充。</p>
            </footer>
        </main>

        <ElementDock :element="element" :previous="previous" :next="next" :total="totalElements" />
    </div>

    <div v-else key="missing" class="missing">
        <h1>没有找到这个元素</h1>
        <p>请检查元素符号，或返回周期表重新选择。</p>
        <router-link to="/chem-lab/periodic-table">返回元素周期表</router-link>
    </div>
    </transition>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, watch } from "vue"
import { useRoute, useRouter } from "vue-router"
import MiniPeriodicTable from "../../../components/MiniPeriodicTable.vue"
import ElementDock from "../../../components/ElementDock.vue"
import {
    PERIODIC_ELEMENTS,
    ELEMENT_CATEGORIES,
    getElementBySymbol,
} from "../../../constants/periodicElements.js"
import { ELEMENT_CONTENT } from "../../../constants/elementContent.js"
import {
    PHYSICAL_PROPERTIES,
    blockFact,
    buildElementSummary,
    categoryFact,
    categoryLabel,
    elementTrivia,
    groupPeers,
    groupPeersLabel,
    isRadioactiveMass,
    peersWithPhysicalData,
    periodPeers,
    phaseFact,
    phaseLabel,
    propertyPeers,
    shellLayers,
} from "../../../Logic/chemistry/elementFacts.js"

const route = useRoute()
const router = useRouter()

const totalElements = PERIODIC_ELEMENTS.length

const element = computed(() => getElementBySymbol(route.params.symbol))
const color = computed(() => (ELEMENT_CATEGORIES[element.value?.category] || ELEMENT_CATEGORIES.unknown).color)
const story = computed(() => (element.value ? ELEMENT_CONTENT[element.value.symbol] || null : null))
const previous = computed(() => (element.value ? PERIODIC_ELEMENTS[element.value.atomicNumber - 2] || null : null))
const next = computed(() => (element.value ? PERIODIC_ELEMENTS[element.value.atomicNumber] || null : null))

const summary = computed(() => buildElementSummary(element.value))
const trivia = computed(() => elementTrivia(element.value))
const totalElectrons = computed(() => element.value?.shells.reduce((sum, count) => sum + count, 0) || 0)
const groupDisplay = computed(() => {
    const current = element.value
    if (!current) return ""
    if (current.group) return `第 ${current.group} 族`
    return current.category === "actinide" ? "锕系" : "镧系"
})
const shellLayersData = computed(() => shellLayers(element.value))

const positionLead = computed(() => {
    const current = element.value
    if (!current) return ""
    if (!current.group) {
        return `${current.name}属于${categoryLabel(current)}，在周期表里单独列在下方，通常用 57–71 或 89–103 的编号区间来定位。`
    }
    return `第 ${current.period} 周期第 ${current.group} 族，属于 ${current.block} 区。周期数告诉你有几层电子，族号告诉你有几个价电子（主族元素）。`
})

const propertyCards = computed(() => PHYSICAL_PROPERTIES.map(property => {
    const current = element.value
    const peers = propertyPeers(current, property.key)
    const max = Math.max(...peers.map(peer => Math.abs(peer.value)), 0)
    return {
        ...property,
        display: displayValue(current?.[property.key], property.unit),
        peers: peers.map(peer => ({
            ...peer,
            height: max > 0 ? Math.max((Math.abs(peer.value) / max) * 100, 6) : 0,
        })),
    }
}))

const hasPhysicalData = computed(() => PHYSICAL_PROPERTIES.some(property => typeof element.value?.[property.key] === "number"))
const peersWithData = computed(() => peersWithPhysicalData(element.value))

const groupPeersData = computed(() => withColor(groupPeers(element.value).sort((a, b) => a.atomicNumber - b.atomicNumber)))
const periodPeersData = computed(() => withColor(periodPeers(element.value).sort((a, b) => a.atomicNumber - b.atomicNumber)))

// 「这一族的关键点」卡片里放最近的几个邻居，避免这一块太空
const nearestPeers = computed(() => {
    const current = element.value
    if (!current) return []
    const pool = groupPeers(current)
    const source = pool.length ? pool : periodPeers(current)
    return withColor(source
        .sort((a, b) => Math.abs(a.atomicNumber - current.atomicNumber) - Math.abs(b.atomicNumber - current.atomicNumber))
        .slice(0, 4))
})

function withColor(list) {
    return list.map(item => ({ ...item, color: (ELEMENT_CATEGORIES[item.category] || ELEMENT_CATEGORIES.unknown).color }))
}

function displayValue(input, unit) {
    if (typeof input !== "number") return null
    const rounded = Math.abs(input) >= 100 ? Math.round(input) : Number(input.toPrecision(4))
    return unit ? `${rounded} ${unit}` : String(rounded)
}

function scrollTo(id) {
    const target = document.getElementById(id)
    if (!target) return
    const behavior = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth"
    target.scrollIntoView({ behavior, block: "start" })
}

// ── 电子层动画（沿用原来的环 + 电子点思路，尺寸收敛一些） ──
function orbitSize(index) {
    return 52 + index * 40
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
        "--electron-size": count > 18 ? 4 : 6,
        "--orbit-radius": `${size / 2}px`,
    }
}

// ── 键盘左右切换元素 ──
function onKeydown(event) {
    if (event.metaKey || event.ctrlKey || event.altKey) return
    const tag = event.target?.tagName
    if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return
    if (event.key === "ArrowLeft" && previous.value) router.push(`/chem-lab/periodic-table/${previous.value.symbol}`)
    if (event.key === "ArrowRight" && next.value) router.push(`/chem-lab/periodic-table/${next.value.symbol}`)
}

onMounted(() => window.addEventListener("keydown", onKeydown))

// 浏览器标签页标题跟着元素走；离开页面时还原，避免标题停在某个元素上
const baseTitle = document.title
watch(element, current => {
    document.title = current ? `${current.name}（${current.symbol}）· 元素周期表 · Koole` : baseTitle
    // 用 ← → 或迷你周期表切换元素时回到顶部，否则会停在上一页的阅读位置
    window.scrollTo({ top: 0 })
}, { immediate: true })

onBeforeUnmount(() => {
    window.removeEventListener("keydown", onKeydown)
    document.title = baseTitle
})
</script>

<style scoped>
.element-page {
    width: min(1180px, calc(100% - 32px));
    /* 底部留出胶囊工具盒的高度，滚到最底也不会被盖住 */
    margin: -20px auto 120px;
    color: var(--text);
}

/* ── 顶部条 ── */
.page-bar {
    min-height: 72px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
}

.back-link {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    color: var(--text-secondary);
    font-size: 12px;
    font-weight: 700;
    text-decoration: none;
}

.back-link svg {
    width: 15px;
    height: 15px;
    fill: none;
    stroke: currentColor;
    stroke-width: 2;
    stroke-linecap: round;
    stroke-linejoin: round;
}

.back-link:hover {
    color: var(--element);
}

.neighbor-nav {
    display: flex;
    gap: 10px;
}

.neighbor {
    display: grid;
    grid-template-columns: auto;
    justify-items: end;
    padding: 6px 12px;
    border: 1px solid var(--border);
    border-radius: 8px;
    color: var(--text);
    text-decoration: none;
    transition: var(--transition);
}

.neighbor small {
    color: var(--text-muted);
    font-size: 9px;
}

.neighbor strong {
    color: var(--element);
    font-family: var(--mono);
    font-size: 14px;
}

.neighbor span {
    color: var(--text-secondary);
    font-size: 10px;
}

.neighbor:hover {
    border-color: var(--element);
    transform: translateY(-1px);
}

/* ── HERO ── */
.hero {
    position: relative;
    display: grid;
    grid-template-columns: minmax(0, 1.15fr) 380px;
    align-items: center;
    gap: 40px;
    overflow: hidden;
    padding: 52px 54px;
    border: 1px solid color-mix(in srgb, var(--element) 40%, var(--border));
    border-radius: 24px;
    background: linear-gradient(120deg, color-mix(in srgb, var(--element) 11%, var(--bg-card)) 0%, var(--bg-card) 64%);
}

.hero::before {
    content: "";
    position: absolute;
    inset: 0;
    background-image:
        linear-gradient(color-mix(in srgb, var(--element) 8%, transparent) 1px, transparent 1px),
        linear-gradient(90deg, color-mix(in srgb, var(--element) 8%, transparent) 1px, transparent 1px);
    background-size: 34px 34px;
    mask-image: linear-gradient(90deg, transparent, #000 56%, #000);
    pointer-events: none;
}

.hero-copy {
    position: relative;
    z-index: 1;
}

.hero-kicker {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px 10px;
    color: var(--text-muted);
    font-family: var(--mono);
    font-size: 10px;
}

.hero-kicker i {
    width: 3px;
    height: 3px;
    border-radius: 50%;
    background: currentColor;
    opacity: 0.6;
}

.category-chip {
    display: inline-flex;
    padding: 5px 10px;
    border-radius: 999px;
    background: color-mix(in srgb, var(--element) 18%, transparent);
    color: var(--element);
    font-weight: 800;
}

.hero h1 {
    margin: 20px 0 16px;
    font-size: clamp(46px, 6vw, 68px);
    line-height: 1.04;
    font-weight: 850;
}

.hero h1 em {
    display: block;
    margin-top: 10px;
    color: var(--text-muted);
    font-family: var(--mono);
    font-size: 15px;
    font-style: normal;
    font-weight: 500;
    letter-spacing: 0.02em;
}

.hero-lede {
    max-width: 620px;
    margin: 0;
    color: var(--text-secondary);
    font-size: 16px;
    line-height: 1.85;
}

.hero-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    margin-top: 26px;
}

.hero-action {
    display: inline-flex;
    align-items: center;
    padding: 10px 16px;
    border: 0;
    border-radius: 8px;
    background: transparent;
    color: var(--element);
    font-family: inherit;
    font-size: 12px;
    font-weight: 800;
    text-decoration: none;
    cursor: pointer;
}

.hero-action.primary {
    background: var(--element);
    color: #fff;
}

.hero-action.ghost {
    border: 1px solid var(--border);
    color: var(--text-secondary);
}

.hero-action.ghost:hover {
    border-color: var(--element);
    color: var(--element);
}

/* ── HERO 原子图 ── */
.hero-atom {
    position: relative;
    z-index: 1;
    display: grid;
    place-items: center;
    width: 360px;
    height: 380px;
    justify-self: center;
}

.hero-symbol {
    position: absolute;
    right: -6px;
    bottom: 6px;
    color: color-mix(in srgb, var(--element) 14%, transparent);
    font-family: var(--mono);
    font-size: 172px;
    font-weight: 800;
    line-height: 1;
    pointer-events: none;
    user-select: none;
}

.atom-orbits {
    position: absolute;
    inset: 0 0 34px;
}

.atom-orbit {
    position: absolute;
    top: 50%;
    left: 50%;
    border: 1px solid color-mix(in srgb, var(--element) 48%, var(--border));
    border-radius: 50%;
    animation: orbit-spin var(--orbit-duration) linear var(--orbit-delay) infinite;
}

.atom-orbit i {
    position: absolute;
    top: 50%;
    left: 50%;
    width: var(--electron-size, 8px);
    height: var(--electron-size, 8px);
    border: 2px solid var(--bg-card);
    border-radius: 50%;
    background: var(--element);
    box-shadow: 0 0 12px color-mix(in srgb, var(--element) 60%, transparent);
    transform: translate(-50%, -50%);
}

.atom-core {
    position: absolute;
    top: calc(50% - 17px);
    left: 50%;
    width: 76px;
    height: 76px;
    display: grid;
    place-items: center;
    border: 1px solid color-mix(in srgb, var(--element) 70%, #fff);
    border-radius: 50%;
    background: var(--element);
    color: #fff;
    box-shadow: 0 14px 42px color-mix(in srgb, var(--element) 32%, transparent);
    transform: translate(-50%, -50%);
}

.atom-core strong {
    font-size: 27px;
    line-height: 1;
}

.atom-core small {
    position: absolute;
    bottom: 8px;
    font-family: var(--mono);
    font-size: 8px;
    opacity: 0.78;
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

/* ── 关键数字 ── */
.fact-strip {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    margin-top: 12px;
    border-block: 1px solid var(--border);
}

.fact-strip > div {
    min-width: 0;
    padding: 18px 22px;
    border-right: 1px solid var(--border);
}

.fact-strip > div:last-child {
    border-right: 0;
}

.fact-strip span {
    display: block;
    color: var(--text-muted);
    font-size: 10px;
}

.fact-strip strong {
    display: block;
    margin-top: 5px;
    color: var(--element);
    font-family: var(--mono);
    font-size: 17px;
    overflow-wrap: anywhere;
}

.fact-strip small {
    display: block;
    margin-top: 4px;
    color: var(--text-muted);
    font-size: 9px;
    line-height: 1.5;
}

/* ── 内容区 ── */
.element-content {
    margin-top: 64px;
}

.band {
    scroll-margin-top: 90px;
    margin-bottom: 78px;
}

.band-heading {
    display: grid;
    grid-template-columns: 240px minmax(0, 1fr);
    align-items: end;
    gap: 8px 24px;
    margin-bottom: 26px;
}

.band-heading > span {
    color: var(--element);
    font-family: var(--mono);
    font-size: 9px;
    font-weight: 800;
    letter-spacing: 0.1em;
}

.band-heading h2 {
    grid-column: 2;
    margin: 0;
    font-size: clamp(26px, 3vw, 34px);
    line-height: 1.2;
}

.band-heading p {
    grid-column: 2;
    max-width: 720px;
    margin: 6px 0 0;
    color: var(--text-secondary);
    font-size: 13px;
    line-height: 1.8;
}

/* ── 01 位置 ── */
.position-notes {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
    margin-top: 22px;
}

.position-notes article {
    padding: 22px 24px;
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    background: var(--bg-card);
}

.position-notes h3 {
    margin: 0 0 10px;
    color: var(--element);
    font-size: 14px;
    font-weight: 800;
}

.position-notes p {
    margin: 0;
    color: var(--text-secondary);
    font-size: 13px;
    line-height: 1.8;
}

.position-notes p + p {
    margin-top: 10px;
}

/* ── 02 结构 ── */
.structure-grid {
    display: grid;
    grid-template-columns: 1.15fr 1fr 1fr;
    gap: 12px;
}

.panel {
    min-width: 0;
    display: flex;
    flex-direction: column;
    padding: 22px;
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    background: color-mix(in srgb, var(--bg-card) 88%, transparent);
}

.panel-heading {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 12px;
    padding-bottom: 14px;
    border-bottom: 1px solid var(--border);
}

.panel-heading span {
    color: var(--text-secondary);
    font-size: 11px;
}

.panel-heading strong {
    color: var(--element);
    font-family: var(--mono);
    font-size: 10px;
}

.shell-rows {
    display: grid;
    gap: 14px;
    margin: 22px 0 18px;
}

.shell-row {
    display: grid;
    grid-template-columns: 26px minmax(0, 1fr) 48px;
    align-items: center;
    gap: 10px;
}

.shell-name {
    color: var(--text-muted);
    font-family: var(--mono);
    font-size: 10px;
}

.shell-bar {
    height: 5px;
    overflow: hidden;
    background: var(--border-light);
    border-radius: 999px;
}

.shell-bar i {
    display: block;
    height: 100%;
    border-radius: inherit;
    background: var(--element);
}

.shell-row b {
    color: var(--element);
    font-family: var(--mono);
    font-size: 10px;
    text-align: right;
}

.shell-row b small {
    color: var(--text-muted);
    font-size: 8px;
}

.config-line {
    margin: 22px 0 8px;
    color: var(--text);
    font-family: var(--mono);
    font-size: 24px;
    font-weight: 800;
    letter-spacing: 0.04em;
    overflow-wrap: anywhere;
}

.config-list {
    margin: 12px 0 0;
}

.config-list div {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 12px;
    padding: 8px 0;
    border-bottom: 1px solid var(--border-light);
}

.config-list dt {
    color: var(--text-muted);
    font-size: 10px;
}

.config-list dd {
    margin: 0;
    font-family: var(--mono);
    font-size: 10px;
    text-align: right;
}

.accent-panel {
    background: color-mix(in srgb, var(--element) 6%, var(--bg-card));
    border-color: color-mix(in srgb, var(--element) 30%, var(--border));
}

.accent-summary {
    margin: 20px 0 10px;
    color: var(--text);
    font-size: 15px;
    font-weight: 700;
    line-height: 1.7;
}

.panel-note {
    margin: 12px 0 0;
    color: var(--text-muted);
    font-size: 10px;
    line-height: 1.75;
}

.accent-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-top: auto;
    padding-top: 16px;
}

/* ── 03 性质 ── */
.property-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 12px;
}

.property-card {
    min-width: 0;
    display: flex;
    flex-direction: column;
    padding: 20px;
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    background: var(--bg-card);
}

.property-card header {
    display: grid;
    gap: 6px;
    padding-bottom: 14px;
    border-bottom: 1px solid var(--border);
}

.property-card header span {
    color: var(--text-muted);
    font-size: 10px;
}

.property-card header strong {
    color: var(--element);
    font-family: var(--mono);
    font-size: 15px;
    overflow-wrap: anywhere;
}

.compare-chart {
    display: flex;
    align-items: flex-end;
    gap: 4px;
    height: 96px;
    margin-top: 16px;
}

.compare-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 5px;
    height: 100%;
    min-width: 0;
}

.compare-track {
    flex: 1;
    width: 100%;
    display: flex;
    align-items: flex-end;
    border-radius: 3px 3px 0 0;
    background: var(--border-light);
    overflow: hidden;
}

.compare-track i {
    display: block;
    width: 100%;
    border-radius: 3px 3px 0 0;
    background: color-mix(in srgb, var(--element) 42%, var(--border));
}

.compare-item small {
    color: var(--text-muted);
    font-family: var(--mono);
    font-size: 8px;
}

.compare-item.active .compare-track i {
    background: var(--element);
}

.compare-item.active small {
    color: var(--element);
    font-weight: 800;
}

.compare-note {
    margin: 12px 0 0;
    color: var(--text-muted);
    font-size: 9px;
    line-height: 1.6;
}

.empty-data {
    padding: 28px 30px;
    border: 1px dashed color-mix(in srgb, var(--element) 36%, var(--border));
    border-radius: var(--radius-lg);
    background: color-mix(in srgb, var(--element) 4%, var(--bg-card));
}

.empty-data h3 {
    margin: 0 0 10px;
    font-size: 16px;
    font-weight: 700;
}

.empty-data p {
    margin: 0;
    color: var(--text-secondary);
    font-size: 13px;
    line-height: 1.8;
}

.empty-data-note {
    margin-top: 12px !important;
    color: var(--text-muted) !important;
    font-size: 12px !important;
}

.empty-data .peer-chips {
    margin-top: 16px;
}

/* ── 04 邻居 / 元素胶囊 ── */
.neighbor-groups {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
}

.neighbor-groups article {
    padding: 22px 24px;
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    background: var(--bg-card);
}

.neighbor-groups h3 {
    display: flex;
    align-items: baseline;
    gap: 8px;
    margin: 0 0 14px;
    font-size: 14px;
    font-weight: 700;
}

.neighbor-groups h3 small {
    color: var(--text-muted);
    font-family: var(--mono);
    font-size: 10px;
    font-weight: 500;
}

.peer-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
}

.peer-chip {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 5px 9px;
    border: 1px solid color-mix(in srgb, var(--peer-color, var(--element)) 34%, var(--border));
    border-radius: 999px;
    background: color-mix(in srgb, var(--peer-color, var(--element)) 10%, var(--bg-card));
    color: var(--text);
    font-family: var(--mono);
    font-size: 11px;
    font-weight: 700;
    text-decoration: none;
    transition: var(--transition);
}

.peer-chip small {
    color: var(--text-secondary);
    font-family: var(--sans);
    font-size: 10px;
    font-weight: 500;
}

.peer-chip:hover {
    border-color: var(--peer-color, var(--element));
    transform: translateY(-1px);
}

.accent-chips .peer-chip {
    border-color: color-mix(in srgb, var(--element) 30%, var(--border));
    background: transparent;
}

/* ── 手写故事区 ── */
.discovery-layout {
    display: grid;
    grid-template-columns: 200px minmax(0, 1fr) minmax(240px, 0.7fr);
    gap: 28px;
    padding-top: 24px;
    border-top: 1px solid var(--border);
}

.discovery-year {
    color: var(--element);
    font-family: var(--mono);
    font-size: 52px;
    font-weight: 800;
    line-height: 1;
}

.discovery-layout h3 {
    margin: 0 0 12px;
    font-size: 20px;
}

.discovery-layout p {
    color: var(--text-secondary);
    font-size: 13px;
    line-height: 1.9;
}

.discovery-layout aside {
    padding-left: 22px;
    border-left: 1px solid var(--border);
}

.discovery-layout aside span {
    color: var(--element);
    font-size: 11px;
    font-weight: 800;
}

.discovery-layout aside p {
    margin-top: 10px;
}

.story-narrative {
    margin-top: 18px;
    padding-top: 18px;
    border-top: 1px solid var(--border);
}

.application-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    border-block: 1px solid var(--border);
}

.application-grid article {
    min-height: 220px;
    padding: 28px;
    border-right: 1px solid var(--border);
}

.application-grid article:last-child {
    border-right: 0;
}

.application-grid article > span {
    color: var(--element);
    font-family: var(--mono);
    font-size: 10px;
}

.application-grid h3 {
    margin: 44px 0 12px;
    font-size: 18px;
}

.application-grid p {
    margin: 0;
    color: var(--text-secondary);
    font-size: 13px;
    line-height: 1.85;
}

.reaction-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
}

.reaction-card {
    min-width: 0;
    overflow: hidden;
    border: 1px solid color-mix(in srgb, var(--element) 26%, var(--border));
    border-radius: var(--radius-lg);
    background: color-mix(in srgb, var(--element) 5%, var(--bg-card));
}

.reaction-card header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 14px 18px;
    border-bottom: 1px solid var(--border);
}

.reaction-card header span {
    color: var(--element);
    font-family: var(--mono);
    font-size: 9px;
    font-weight: 800;
}

.reaction-card header small {
    color: var(--text-muted);
    font-size: 9px;
    text-align: right;
}

.equation {
    overflow-x: auto;
    padding: 26px 18px;
    color: var(--text);
    font-family: var(--mono);
    font-size: 21px;
    font-weight: 800;
    text-align: center;
    white-space: nowrap;
}

.reaction-card dl {
    padding: 0 18px 8px;
}

.reaction-card dl div {
    display: grid;
    grid-template-columns: 82px minmax(0, 1fr);
    gap: 12px;
    padding: 12px 0;
    border-top: 1px solid var(--border);
}

.reaction-card dt {
    color: var(--text-muted);
    font-size: 10px;
}

.reaction-card dd {
    margin: 0;
    color: var(--text-secondary);
    font-size: 11px;
    line-height: 1.7;
}

.safety-note {
    display: flex;
    gap: 9px;
    margin: 10px;
    padding: 11px 12px;
    border-radius: 6px;
    background: color-mix(in srgb, #d97706 10%, transparent);
    color: color-mix(in srgb, #b45309 82%, var(--text));
    font-size: 10px;
    line-height: 1.65;
}

.safety-note strong {
    flex: 0 0 auto;
}

.question-band {
    padding: 46px 0 20px;
    border-top: 2px solid var(--element);
}

.question-band > span {
    color: var(--element);
    font-size: 11px;
    font-weight: 800;
}

.question-band h2 {
    max-width: 820px;
    margin: 16px 0 30px;
    font-size: 34px;
    line-height: 1.4;
}

.question-band > div {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    gap: 14px;
}

.question-band a {
    color: var(--text-secondary);
    font-size: 11px;
    text-decoration: none;
}

.question-band a:hover {
    color: var(--element);
}

/* ── 05 小知识 ── */
.trivia-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 12px;
}

.trivia-card {
    position: relative;
    padding: 20px 22px 20px 24px;
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    background: color-mix(in srgb, var(--element) 4%, var(--bg-card));
}

.trivia-card::before {
    content: "";
    position: absolute;
    top: 20px;
    bottom: 20px;
    left: 0;
    width: 3px;
    border-radius: 0 3px 3px 0;
    background: var(--element);
    opacity: 0.7;
}

.trivia-card span {
    display: inline-block;
    margin-bottom: 8px;
    color: var(--element);
    font-size: 10px;
    font-weight: 800;
    letter-spacing: 0.04em;
}

.trivia-card p {
    margin: 0;
    color: var(--text-secondary);
    font-size: 13px;
    line-height: 1.8;
}

/* ── 底部 ── */
.page-footer {
    padding-top: 32px;
    border-top: 1px solid var(--border);
}

.data-note {
    margin: 0;
    max-width: 720px;
    color: var(--text-muted);
    font-size: 10px;
    line-height: 1.7;
}

/* ── 元素之间切换的过渡（← → 键 / 迷你周期表 / 相邻元素） ── */
.element-swap-enter-active {
    transition: opacity 0.26s var(--ease-out), transform 0.26s var(--ease-out);
}

.element-swap-leave-active {
    transition: opacity 0.12s ease;
}

.element-swap-enter-from {
    opacity: 0;
    transform: translateY(10px);
}

.element-swap-leave-to {
    opacity: 0;
}

/* ── 404 ── */
.missing {
    padding: 130px 20px;
    text-align: center;
}

.missing p {
    margin: 10px 0 25px;
    color: var(--text-secondary);
}

.missing a {
    color: #2aa27f;
}

/* ── 响应式 ── */
@media (max-width: 1080px) {
    .structure-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .accent-panel {
        grid-column: 1 / -1;
    }

    .property-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }
}

@media (max-width: 900px) {
    .hero {
        grid-template-columns: 1fr;
        padding: 40px;
    }

    .hero-atom {
        width: 100%;
        max-width: 340px;
        margin: 0 auto;
    }

    .hero-symbol {
        font-size: 130px;
        right: 0;
    }

    .fact-strip {
        grid-template-columns: repeat(2, 1fr);
    }

    .fact-strip > div:nth-child(2) {
        border-right: 0;
    }

    .fact-strip > div:nth-child(-n + 2) {
        border-bottom: 1px solid var(--border);
    }

    .band-heading {
        grid-template-columns: 1fr;
    }

    .band-heading h2,
    .band-heading p {
        grid-column: 1;
    }

    .discovery-layout {
        grid-template-columns: 150px minmax(0, 1fr);
    }

    .discovery-layout aside {
        grid-column: 2;
        padding: 18px 0 0;
        border-top: 1px solid var(--border);
        border-left: 0;
    }

    .neighbor-groups {
        grid-template-columns: 1fr;
    }
}

@media (max-width: 640px) {
    .element-page {
        width: calc(100% - 20px);
        margin-top: -24px;
    }

    .page-bar {
        min-height: 64px;
    }

    .neighbor span {
        display: none;
    }

    .hero {
        gap: 18px;
        padding: 26px 20px;
        border-radius: 14px;
    }

    .hero h1 {
        font-size: 40px;
    }

    .hero-lede {
        font-size: 14px;
    }

    .hero-atom {
        height: 300px;
        transform: scale(0.9);
    }

    .fact-strip span {
        font-size: 9px;
    }

    .fact-strip strong {
        font-size: 14px;
    }

    .position-notes,
    .structure-grid,
    .property-grid {
        grid-template-columns: 1fr;
    }

    .accent-panel {
        grid-column: auto;
    }

    .discovery-layout {
        grid-template-columns: 1fr;
    }

    .discovery-layout aside {
        grid-column: auto;
    }

    .discovery-year {
        font-size: 42px;
    }

    .application-grid,
    .reaction-grid {
        grid-template-columns: 1fr;
    }

    .application-grid article {
        min-height: 0;
        border-right: 0;
        border-bottom: 1px solid var(--border);
    }

    .application-grid article:last-child {
        border-bottom: 0;
    }

    .application-grid h3 {
        margin-top: 20px;
    }

    .equation {
        font-size: 17px;
    }

    .question-band h2 {
        font-size: 26px;
    }
}

@media (prefers-reduced-motion: reduce) {
    .atom-orbit {
        animation: none;
    }

    .element-swap-enter-active,
    .element-swap-leave-active {
        transition: opacity 0.15s linear;
    }

    .element-swap-enter-from {
        transform: none;
    }
}
</style>
