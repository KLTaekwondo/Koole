<template>
    <div class="element-page">
        <template v-if="element">
            <header class="element-header">
                <router-link to="/chem-lab/periodic-table" class="back-link">← 返回元素周期表</router-link>
                <nav><router-link v-if="previous" :to="`/chem-lab/periodic-table/${previous.symbol}`">← {{ previous.symbol }}</router-link><router-link v-if="next" :to="`/chem-lab/periodic-table/${next.symbol}`">{{ next.symbol }} →</router-link></nav>
            </header>
            <section class="element-hero" :style="{ '--element': category.color }">
                <div class="symbol-card"><small>{{ element.atomicNumber }}</small><strong>{{ element.symbol }}</strong><span>{{ element.name }}</span><i>{{ element.atomicMass }}</i></div>
                <div><span class="category-chip">{{ category.label }}</span><h1>{{ element.name }} <em>{{ element.englishName }}</em></h1><p>{{ element.period }} 周期 · {{ element.group ? `${element.group} 族` : "镧系或锕系" }} · {{ element.block }} 区 · {{ phaseLabel }}</p></div>
            </section>
            <main class="detail-grid">
                <section class="detail-card"><span class="card-kicker">01 / BASIC</span><h2>基础信息</h2><dl><div><dt>原子序数</dt><dd>{{ element.atomicNumber }}</dd></div><div><dt>元素符号</dt><dd>{{ element.symbol }}</dd></div><div><dt>中文名称</dt><dd>{{ element.name }}</dd></div><div><dt>英文名称</dt><dd>{{ element.englishName }}</dd></div><div><dt>相对原子质量</dt><dd>{{ element.atomicMass }}</dd></div></dl></section>
                <section class="detail-card"><span class="card-kicker">02 / POSITION</span><h2>周期位置</h2><dl><div><dt>周期</dt><dd>{{ element.period }}</dd></div><div><dt>族</dt><dd>{{ element.group ?? "—" }}</dd></div><div><dt>区块</dt><dd>{{ element.block }} 区</dd></div><div><dt>元素分类</dt><dd>{{ category.label }}</dd></div><div><dt>常温物态</dt><dd>{{ phaseLabel }}</dd></div></dl></section>
                <section class="detail-card shell-card"><span class="card-kicker">03 / ELECTRONS</span><h2>电子结构</h2><div class="shell-diagram"><span v-for="(count, index) in element.shells" :key="index" :style="shellStyle(index)"><b>{{ count }}</b></span><i>{{ element.symbol }}</i></div><dl><div><dt>电子层排布</dt><dd>{{ element.electronConfiguration }}</dd></div><div><dt>价电子数</dt><dd>{{ element.valenceElectrons }}</dd></div><div><dt>常见氧化态</dt><dd>{{ value(element.commonOxidationStates) }}</dd></div></dl></section>
                <section class="detail-card"><span class="card-kicker">04 / PROPERTIES</span><h2>物理性质</h2><dl><div><dt>熔点</dt><dd>{{ measurement(element.meltingPoint, "°C") }}</dd></div><div><dt>沸点</dt><dd>{{ measurement(element.boilingPoint, "°C") }}</dd></div><div><dt>密度</dt><dd>{{ measurement(element.density, "g/cm³") }}</dd></div><div><dt>电负性</dt><dd>{{ value(element.electronegativity) }}</dd></div></dl><p class="data-note">人工合成元素或尚无统一可靠测量的数据会显示“暂无可靠数据”。</p></section>
            </main>
        </template>
        <div v-else class="missing"><h1>没有找到这个元素</h1><p>请检查元素符号，或返回周期表重新选择。</p><router-link to="/chem-lab/periodic-table">返回元素周期表</router-link></div>
    </div>
</template>

<script setup>
import { computed } from "vue"
import { useRoute } from "vue-router"
import { PERIODIC_ELEMENTS, ELEMENT_CATEGORIES, ELEMENT_PHASES, getElementBySymbol } from "../constants/periodicElements.js"
const route = useRoute()
const element = computed(() => getElementBySymbol(route.params.symbol))
const category = computed(() => ELEMENT_CATEGORIES[element.value?.category] || ELEMENT_CATEGORIES.unknown)
const phaseLabel = computed(() => ELEMENT_PHASES[element.value?.phase] || "未知")
const previous = computed(() => element.value ? PERIODIC_ELEMENTS[element.value.atomicNumber - 2] || null : null)
const next = computed(() => element.value ? PERIODIC_ELEMENTS[element.value.atomicNumber] || null : null)
function value(input) { return input === null || input === undefined || input === "" ? "暂无可靠数据" : input }
function measurement(input, unit) { return input === null || input === undefined ? "暂无可靠数据" : `${input} ${unit}` }
function shellStyle(index) { const size = 58 + index * 42; return { width: `${size}px`, height: `${size}px`, margin: `${-size / 2}px 0 0 ${-size / 2}px` } }
</script>

<style scoped>
.element-page {
    width: min(1120px, calc(100% - 32px));
    margin: -20px auto 70px;
    color: var(--text);
}

.element-header {
    min-height: 76px;
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
    display: grid;
    grid-template-columns: 190px minmax(0, 1fr);
    align-items: center;
    gap: 44px;
    padding: 40px;
    border: 1px solid color-mix(in srgb, var(--element) 52%, var(--border));
    border-radius: 24px;
    background: radial-gradient(circle at 12% 25%, color-mix(in srgb, var(--element) 22%, transparent), transparent 38%), var(--bg-card);
}

.symbol-card {
    width: 170px;
    height: 190px;
    display: flex;
    flex-direction: column;
    padding: 16px;
    border: 2px solid var(--element);
    border-radius: 18px;
    background: color-mix(in srgb, var(--element) 13%, var(--bg-card));
}

.symbol-card small {
    color: var(--text-secondary);
}

.symbol-card strong {
    color: var(--element);
    font-size: 72px;
    line-height: 1.05;
}

.symbol-card span {
    font-size: 17px;
}

.symbol-card i {
    margin-top: auto;
    color: var(--text-muted);
    font-family: var(--mono);
    font-size: 11px;
    font-style: normal;
}

.category-chip {
    display: inline-flex;
    padding: 6px 11px;
    border-radius: 999px;
    background: color-mix(in srgb, var(--element) 18%, transparent);
    color: var(--element);
    font-size: 10px;
    font-weight: 700;
}

.element-hero h1 {
    margin: 16px 0 8px;
    font-size: clamp(38px, 6vw, 68px);
}

.element-hero h1 em {
    color: var(--text-muted);
    font-size: .4em;
    font-style: normal;
    font-weight: 500;
}

.element-hero p {
    color: var(--text-secondary);
}

.detail-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 14px;
    margin-top: 14px;
}

.detail-card {
    min-height: 360px;
    padding: 28px;
    border: 1px solid var(--border);
    border-radius: 20px;
    background: var(--bg-card);
}

.card-kicker {
    color: #2aa27f;
    font-family: var(--mono);
    font-size: 9px;
    font-weight: 700;
    letter-spacing: .1em;
}

.detail-card h2 {
    margin: 11px 0 22px;
    font-size: 24px;
}

dl {
    display: grid;
    gap: 0;
}

dl div {
    display: flex;
    justify-content: space-between;
    gap: 20px;
    padding: 11px 0;
    border-bottom: 1px solid var(--border);
}

dt {
    color: var(--text-secondary);
    font-size: 12px;
}

dd {
    color: var(--text);
    font-family: var(--mono);
    font-size: 12px;
    text-align: right;
}

.shell-card {
    position: relative;
    overflow: hidden;
}

.shell-diagram {
    position: relative;
    height: 180px;
    margin-bottom: 8px;
}

.shell-diagram span {
    position: absolute;
    top: 50%;
    left: 50%;
    border: 1px solid color-mix(in srgb, #2aa27f 55%, var(--border));
    border-radius: 50%;
}

.shell-diagram span b {
    position: absolute;
    top: -8px;
    left: 50%;
    padding: 1px 5px;
    border-radius: 999px;
    background: #2aa27f;
    color: #fff;
    font-size: 8px;
    transform: translateX(-50%);
}

.shell-diagram > i {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 38px;
    height: 38px;
    display: grid;
    place-items: center;
    border-radius: 50%;
    background: #2aa27f;
    color: #fff;
    font-size: 13px;
    font-style: normal;
    font-weight: 800;
    transform: translate(-50%, -50%);
}

.data-note {
    margin-top: 20px;
    color: var(--text-muted);
    font-size: 10px;
    line-height: 1.65;
}

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

@media (max-width: 700px) {
    .element-page {
        width: calc(100% - 20px);
    }

    .element-hero {
        grid-template-columns: 1fr;
        gap: 24px;
        padding: 24px;
    }

    .symbol-card {
        width: 142px;
        height: 158px;
    }

    .symbol-card strong {
        font-size: 58px;
    }

    .detail-grid {
        grid-template-columns: 1fr;
    }

    .detail-card {
        min-height: 0;
    }

    .element-header nav {
        gap: 10px;
    }
}
</style>
