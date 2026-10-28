// 元素详情页用的派生内容。
// 这里不重复录入手写数据，而是把 periodicElements.js 里的结构化数据
// （周期 / 族 / 区 / 电子层 / 物态 / 物理性质）翻译成学生能读懂的文字与对比数据。
// 手写故事内容仍然放在 constants/elementContent.js，页面按需渲染。
import { PERIODIC_ELEMENTS, ELEMENT_CATEGORIES, ELEMENT_PHASES } from "../../constants/periodicElements.js"

// 各分类的一句话特征 + 展开说明（内容为通行化学结论，不涉及单个元素的特殊数值）
export const CATEGORY_FACTS = {
    "alkali-metal": {
        summary: "最外层只有 1 个电子，容易失去形成 +1 价离子",
        detail: "碱金属与水反应会生成氢氧化物和氢气，活泼性从锂到铯逐渐增强。它们太容易和空气、水反应，所以通常存放在煤油里。",
    },
    "alkaline-earth": {
        summary: "最外层 2 个电子，通常失去 2 个电子形成 +2 价",
        detail: "活泼性比碱金属弱一些。钙和镁是最常见的碱土金属，氢氧化钙的水溶液就是石灰水。",
    },
    "transition-metal": {
        summary: "d 区金属，价电子包含 d 轨道电子，化合价多变",
        detail: "导电、导热性好，很多能形成配合物、作催化剂或组成合金。铁有 +2、+3 价，锰的价态更多，说的就是这类元素。",
    },
    "post-transition": {
        summary: "金属性向非金属性过渡的金属，熔点通常偏低、质地偏软",
        detail: "铝、锡、铅都属于这一类，常用来做合金、镀层和焊料。",
    },
    metalloid: {
        summary: "性质介于金属和非金属之间，是半导体的基础",
        detail: "导电性随温度升高而增强。硅和锗撑起了整个芯片产业，说的就是类金属。",
    },
    nonmetal: {
        summary: "电负性较大，容易得到电子，多形成共价化合物",
        detail: "同周期从左到右非金属性逐渐增强。非金属单质可能是气体、液体或固体，差别很大。",
    },
    halogen: {
        summary: "最外层 7 个电子，容易得到 1 个电子形成 -1 价",
        detail: "从氟到碘，活泼性逐渐减弱：单质颜色变深，状态由气态变为液态再到固态。",
    },
    "noble-gas": {
        summary: "最外层 8 个电子（氦是 2 个），电子结构稳定",
        detail: "化学性质很不活泼，长期被当作“惰性气体”。直到 1962 年才制出第一个稀有气体化合物，这个结论才被修正。",
    },
    lanthanide: {
        summary: "4f 轨道逐步填充的镧系元素，彼此性质非常接近",
        detail: "它们常共生在同一种矿物里，分离非常困难。钕铁硼磁体、荧光粉、激光材料都离不开镧系元素。",
    },
    actinide: {
        summary: "5f 轨道逐步填充的锕系元素，全部具有放射性",
        detail: "铀、钚是核能与核燃料循环的关键材料，半衰期越长越容易在自然界中找到。",
    },
    unknown: {
        summary: "人工合成的超重元素，性质主要靠理论预测",
        detail: "半衰期极短，只能在实验室里一个个合成出来，很多性质还在研究中。",
    },
}

// 电子排布分区：s / p / d / f 区
export const BLOCK_FACTS = {
    s: "s 区：价电子填在 s 轨道，主要是第 1、2 族（氢、氦也属于 s 区）。",
    p: "p 区：价电子填在 p 轨道，覆盖第 13–18 族，非金属、类金属和部分金属都在这里。",
    d: "d 区：价电子填在 d 轨道，也就是第 3–12 族的过渡金属，化合价变化最丰富。",
    f: "f 区：价电子填在 f 轨道，即镧系和锕系，通常单独列在周期表下方。",
}

export const PHASE_FACTS = {
    solid: "常温常压下呈固态",
    liquid: "常温常压下呈液态（这样的元素只有汞和溴）",
    gas: "常温常压下呈气态",
    unknown: "超重元素，常温下的物态只能推测",
}

const SHELL_NAMES = ["K", "L", "M", "N", "O", "P", "Q"]
const SHELL_CAPACITY = [2, 8, 18, 32, 32, 18, 8]

export function categoryFact(element) {
    return CATEGORY_FACTS[element?.category] || CATEGORY_FACTS.unknown
}

export function blockFact(element) {
    return BLOCK_FACTS[element?.block] || ""
}

export function phaseFact(element) {
    return PHASE_FACTS[element?.phase] || ""
}

export function categoryLabel(element) {
    return (ELEMENT_CATEGORIES[element?.category] || ELEMENT_CATEGORIES.unknown).label
}

export function phaseLabel(element) {
    return ELEMENT_PHASES[element?.phase] || "未知"
}

/** 自动生成的一句话介绍，不依赖手写内容 */
export function buildElementSummary(element) {
    if (!element) return ""
    const groupPart = element.group ? `第 ${element.group} 族` : "镧系/锕系"
    const phaseWord = element.phase === "unknown" ? "物态未知" : `常温下呈${phaseLabel(element)}`
    return `${element.name}是第 ${element.period} 周期${groupPart}的${categoryLabel(element)}元素，${phaseWord}，最外层有 ${element.valenceElectrons} 个电子。`
}

/** 电子层明细：K/L/M… + 每层电子数 + 该层容量 */
export function shellLayers(element) {
    if (!element?.shells) return []
    return element.shells.map((count, index) => ({
        name: SHELL_NAMES[index] || `第 ${index + 1} 层`,
        index,
        count,
        capacity: SHELL_CAPACITY[index] || 32,
        ratio: Math.min(count / (SHELL_CAPACITY[index] || 32), 1),
    }))
}

/** 同族元素；镧系/锕系没有族号，改用同系列 */
export function groupPeers(element) {
    if (!element) return []
    if (element.group) {
        return PERIODIC_ELEMENTS.filter(item => item.group === element.group && item.atomicNumber !== element.atomicNumber)
    }
    return PERIODIC_ELEMENTS.filter(item => item.category === element.category && item.atomicNumber !== element.atomicNumber)
}

export function groupPeersLabel(element) {
    return element?.group ? `第 ${element.group} 族` : "同系列"
}

/** 同周期元素（按原子序数排列） */
export function periodPeers(element) {
    if (!element) return []
    return PERIODIC_ELEMENTS.filter(item => item.period === element.period && item.atomicNumber !== element.atomicNumber)
}

/** 物理性质字段定义（顺序即页面展示顺序） */
export const PHYSICAL_PROPERTIES = [
    { key: "meltingPoint", label: "熔点", unit: "°C" },
    { key: "boilingPoint", label: "沸点", unit: "°C" },
    { key: "density", label: "密度", unit: "g/cm³" },
    { key: "electronegativity", label: "电负性", unit: "" },
]

export function formatProperty(value_, unit) {
    if (value_ === null || value_ === undefined || value_ === "") return null
    return unit ? `${value_} ${unit}` : String(value_)
}

/**
 * 某个物理性质在「同周期 + 同族」范围内有数据的元素，用于画对比条。
 * 返回按原子序数排序的数组，active 标记当前元素；当前元素没有数据时返回空数组。
 */
export function propertyPeers(element, key) {
    if (!element || typeof element[key] !== "number") return []
    const scope = new Set([
        ...periodPeers(element).map(item => item.atomicNumber),
        ...groupPeers(element).map(item => item.atomicNumber),
        element.atomicNumber,
    ])
    return PERIODIC_ELEMENTS
        .filter(item => scope.has(item.atomicNumber) && typeof item[key] === "number")
        .sort((a, b) => a.atomicNumber - b.atomicNumber)
        .map(item => ({
            symbol: item.symbol,
            name: item.name,
            atomicNumber: item.atomicNumber,
            value: item[key],
            active: item.atomicNumber === element.atomicNumber,
        }))
}

/** 同周期 / 同族里已经录入了物理性质数据的元素（用于“数据待补”时给引导） */
export function peersWithPhysicalData(element) {
    const all = [...periodPeers(element), ...groupPeers(element)]
    const seen = new Set()
    return all
        .filter(item => PHYSICAL_PROPERTIES.some(prop => typeof item[prop.key] === "number"))
        .filter(item => {
            if (seen.has(item.atomicNumber)) return false
            seen.add(item.atomicNumber)
            return true
        })
        .sort((a, b) => a.atomicNumber - b.atomicNumber)
}

/** 质量数带方括号表示没有稳定同位素 */
export function isRadioactiveMass(element) {
    return typeof element?.atomicMass === "string" && element.atomicMass.startsWith("[")
}
