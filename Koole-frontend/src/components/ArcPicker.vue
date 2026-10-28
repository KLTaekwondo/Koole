<template>
    <div
        ref="rootRef"
        class="arc-picker"
        :class="{ disabled }"
        :style="{ '--accent': accent, '--ap-tw': trackWidth + 'px' }"
        role="slider"
        tabindex="0"
        aria-label="半圆选项选择器"
        :aria-valuenow="currentLabel"
        @wheel.prevent="onWheel"
        @pointerdown="onPointerDown"
        @pointermove="onPointerMove"
        @pointerup="onPointerUp"
        @pointercancel="onPointerUp"
        @keydown="onKeydown"
    >
        <svg :width="size" :height="size" :viewBox="`0 0 ${size} ${size}`">
            <defs>
                <!-- 轨道渐变：从左（弧顶/底）到右（指针 0°）由淡入深，引导视线到选中槽 -->
                <linearGradient :id="trackGradId" x1="0" y1="0" x2="1" y2="0">
                    <stop class="ap-track-grad-a" offset="0%" />
                    <stop class="ap-track-grad-b" offset="55%" />
                    <stop class="ap-track-grad-c" offset="100%" />
                </linearGradient>
            </defs>
            <!-- 环形轨道（渐变描边）+ 选中槽高亮段 -->
            <path class="ap-track" :d="trackD" :stroke="`url(#${trackGradId})`" />
            <path class="ap-highlight" :d="highlightD" />
            <!-- 大 / 小圆边界线 -->
            <path class="ap-ring" :d="outerArcD" />
            <path class="ap-ring" :d="innerArcD" />

            <!-- 选项标签：沿环排布，超出弧的部分不渲染（即"收到左边消失"） -->
            <g
                v-for="item in labels"
                :key="item.key"
                class="ap-slot"
                :class="{ active: item.active }"
                :opacity="item.opacity"
                :transform="`translate(${item.x} ${item.y}) rotate(${item.theta})`"
                @pointerdown.stop.prevent="select(item.key)"
            >
                <text
                    class="ap-label"
                    text-anchor="middle"
                    dominant-baseline="central"
                    :style="{ fontSize: item.fontSize + 'px' }"
                >{{ item.label }}</text>
            </g>

            <!-- 指针：固定在弧正中（正右 0°） -->
            <g class="ap-needle">
                <path :d="needleD" />
                <circle class="ap-hub" :r="size * 0.02" />
                <circle class="ap-hub-core" :r="size * 0.008" />
            </g>

            <!-- 中心标题徽章：学科色圆盘打底 + 双层小标。
                 titleVertical 竖排时中文逐字一列、英文横排在上；
                 title-offset-x 用于嵌屏幕左缘时把文字偏到可见半圆内（竖排自动避让） -->
            <g v-if="title" class="ap-title">
                <circle class="ap-title-disc" :cx="cx" :cy="cy" :r="titleDiscR" />
                <g :transform="`translate(${cx + titleOffsetEffective} ${cy})`">
                    <!-- 竖排：英文整段旋转 90° 竖排在中文列左侧，中文逐字竖直一列 -->
                    <template v-if="titleVertical">
                        <text
                            v-if="titleEn"
                            class="ap-title-en ap-title-en-vt"
                            :style="{ fontSize: titleEnFont + 'px' }"
                            :x="titleEnColX"
                            :y="titleEnStartY"
                            :transform="`rotate(90 ${titleEnColX} ${titleEnStartY})`"
                        >{{ titleEn }}</text>
                        <text
                            v-for="(ch, i) in titleZhChars"
                            :key="i"
                            class="ap-title-zh"
                            :style="{ fontSize: titleZhFont + 'px' }"
                            :y="titleZhY(i)"
                        >{{ ch }}</text>
                    </template>
                    <!-- 横排双层：英文上 / 中文下 -->
                    <template v-else>
                        <text
                            v-if="titleEn"
                            class="ap-title-en"
                            :style="{ fontSize: titleEnFont + 'px' }"
                            y="-13"
                        >{{ titleEn }}</text>
                        <text
                            class="ap-title-zh"
                            :class="{ 'with-en': titleEn }"
                            :style="{ fontSize: titleZhFont + 'px' }"
                            y="0"
                        >{{ titleZh }}</text>
                    </template>
                </g>
            </g>

            <!-- 序号提示：竖排标题时逐字竖直一列（与竖排标题配套）/ 横排时单行底部内侧，常显不随滚动淡出 -->
            <text
                v-if="indexHint"
                class="ap-index-hint"
                :x="indexHintX"
                :y="indexHintY"
                text-anchor="middle"
            >
                <template v-if="titleVertical">
                    <tspan
                        v-for="(ch, i) in indexHintChars"
                        :key="i"
                        :x="indexHintX"
                        :y="indexHintY + i * indexHintLineH"
                    >{{ ch }}</tspan>
                </template>
                <template v-else>{{ currentIndex + 1 }} / {{ list.length }}</template>
            </text>
        </svg>
    </div>
</template>

<script>
// 模块级唯一 id 计数器：ArcPicker 可能同页多实例，SVG 渐变 id 不能冲突
let _apUid = 0
</script>

<script setup>
import { computed, onBeforeUnmount, ref, watch } from "vue"

const props = defineProps({
    options: { type: Array, required: true }, // ['A','B'] 或 [{ label, value }]
    modelValue: { type: [String, Number], default: null },
    accent: { type: String, default: "#477cdb" },
    size: { type: Number, default: 300 },
    trackWidth: { type: Number, default: 44 },
    slotAngle: { type: Number, default: 24 }, // 相邻选项的槽位角（度）
    visibleAngle: { type: Number, default: 80 }, // 可见窗口（度），超出淡出
    disabled: { type: Boolean, default: false },
    // 中心标题：字符串（单行）或 { en, zh }（英文小标上 + 中文大字下）
    title: { type: [String, Object], default: null },
    // 竖排模式：中文逐字竖直一列，英文横排小标在上（更契合嵌边竖向布局）
    titleVertical: { type: Boolean, default: false },
    // 序号提示：弧下方常显"当前项 / 总数"（如 3 / 10），帮用户知道一共几项、滚到哪
    indexHint: { type: Boolean, default: false },
    // 标题水平偏移（px，正=右）：嵌屏幕左缘时把文字偏到可见半圆内，避免被切
    titleOffsetX: { type: Number, default: 0 },
})
const emit = defineEmits(["update:modelValue", "change"])

const rootRef = ref(null)
const trackGradId = `ap-track-grad-${++_apUid}` // 轨道渐变唯一 id（多实例不冲突）

// 选项归一化：字符串 → { label, value }
const list = computed(() =>
    props.options.map((o) => (typeof o === "string" ? { label: o, value: o } : { label: o.label, value: o.value ?? o.label })),
)
const maxIndex = computed(() => Math.max(list.value.length - 1, 0))

// —— 几何：右半圆（顶部 -90° → 正右 0° → 底部 +90°），直径在左、弧朝右 ——
const cx = computed(() => props.size / 2)
const cy = computed(() => props.size / 2)
const R1 = computed(() => props.size / 2 - 18) // 外圆
const R2 = computed(() => R1.value - props.trackWidth) // 内圆
const Rm = computed(() => (R1.value + R2.value) / 2) // 选项轨道
const baseFont = computed(() => Math.round(props.size * 0.05))

// —— 中心标题徽章 ——
const titleDiscR = computed(() => Math.max(R2.value - 3, 40)) // 学科色圆盘半径：填满整个内圆（留 3px 描边空间）
const titleEn = computed(() => (props.title && typeof props.title === "object" ? props.title.en : ""))
const titleZh = computed(() => (props.title && typeof props.title === "object" ? props.title.zh : props.title))
const titleEnFont = computed(() => Math.round(props.size * 0.024))
const titleZhFont = computed(() => Math.round(props.size * 0.05))
const titleVertical = computed(() => props.titleVertical)

// 竖排布局：中文逐字竖直一列（行高按字号的 1.45 倍）；
// 英文整段旋转 90° 竖排（列宽=字母高），落在中文列左侧、垂直居中于列
const titleZhChars = computed(() => [...titleZh.value])
const titleLineH = computed(() => Math.round(titleZhFont.value * 1.45))
const titleColTop = computed(() => -(titleZhChars.value.length * titleLineH.value) / 2)
const titleZhY = i => titleColTop.value + titleLineH.value / 2 + i * titleLineH.value
const titleEnColX = computed(() => -(titleZhFont.value / 2 + 8 + titleEnFont.value))
const titleEnStartY = computed(() => {
    const colH = titleZhChars.value.length * titleLineH.value
    return titleColTop.value + (colH - titleEnWidth.value) / 2
})

// 标题水平偏移：调用方显式传 titleOffsetX 则用之；否则自动避让屏幕左缘——
// 横排取 0（默认居中圆心），竖排取内容（中文列 + 英文列）半宽，保证文字完整可见
const titleEnWidth = computed(() => Math.round(titleEnFont.value * 0.62 * titleEn.value.length))
const titleOffsetEffective = computed(() => {
    if (props.titleOffsetX) return props.titleOffsetX
    if (titleVertical.value) {
        const contentHalf = titleZhFont.value / 2 + 8 + (titleEn.value ? titleEnFont.value : 0)
        return Math.ceil(contentHalf + 6)
    }
    return 0
})

// 序号提示：竖排标题时在标题列右侧逐字竖直一列（行高按字号 1.4 倍）；
// 横排时放圆盘底部内侧居中
const indexHintLineH = computed(() => Math.round(11 * 1.4))
const indexHintChars = computed(() => [...`${currentIndex.value + 1} / ${list.value.length}`])
const indexHintX = computed(() =>
    titleVertical.value
        ? cx.value + titleOffsetEffective.value + titleZhFont.value + 10
        : cx.value,
)
const indexHintY = computed(() => {
    if (titleVertical.value) {
        // 竖排：整列以圆盘中心垂直居中
        return cy.value - ((indexHintChars.value.length - 1) * indexHintLineH.value) / 2
    }
    return cy.value + titleDiscR.value - 16
})

const rad = (deg) => (deg * Math.PI) / 180
function polar(R, deg) {
    const r = rad(deg)
    return { x: cx.value + R * Math.cos(r), y: cy.value + R * Math.sin(r) }
}
function halfArcPath(R) {
    const s = polar(R, -90)
    const e = polar(R, 90)
    return `M ${s.x} ${s.y} A ${R} ${R} 0 0 1 ${e.x} ${e.y}`
}

const trackD = computed(() => halfArcPath(Rm.value))
const outerArcD = computed(() => halfArcPath(R1.value))
const innerArcD = computed(() => halfArcPath(R2.value))
const highlightD = computed(() => {
    const s = polar(Rm.value, -props.slotAngle / 2)
    const e = polar(Rm.value, props.slotAngle / 2)
    return `M ${s.x} ${s.y} A ${Rm.value} ${Rm.value} 0 0 1 ${e.x} ${e.y}`
})
// 指针：外沿小三角（尖贴轨道外缘指向内），不穿过轨道带，避免遮挡选中项文字
const needleD = computed(() => {
    const t = cx.value + R1.value + 1
    const b = cx.value + R1.value + 13
    return `M ${t} ${cy.value} L ${b} ${cy.value - 9} L ${b} ${cy.value + 9} Z`
})

// —— 滚动状态：index 为平滑显示位置（小数），targetIndex 为磁吸目标（整数） ——
const index = ref(0)
const targetIndex = ref(0)
let lastEmitted = -1

let rafId = 0
let wheelAcc = 0
let dragging = false
let dragBaseAngle = 0
let dragStartIndex = 0

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v))

function cancelRaf() {
    if (rafId) {
        cancelAnimationFrame(rafId)
        rafId = 0
    }
}
function startAnim() {
    if (rafId) return
    rafId = requestAnimationFrame(tick)
}
function tick() {
    const diff = targetIndex.value - index.value
    if (Math.abs(diff) < 0.001) {
        index.value = targetIndex.value
        rafId = 0
        return
    }
    index.value += diff * 0.18
    rafId = requestAnimationFrame(tick)
}

// —— 选中同步：round(index) 变化时向外广播 ——
const currentIndex = computed(() => clamp(Math.round(index.value), 0, maxIndex.value))
const currentLabel = computed(() => list.value[currentIndex.value]?.label ?? "")
watch(index, () => {
    const i = currentIndex.value
    if (i === lastEmitted) return
    lastEmitted = i
    const opt = list.value[i]
    emit("update:modelValue", opt?.value)
    emit("change", { value: opt?.value, index: i })
})

// 外部 modelValue 变化（含初始值）→ 直接定位
watch(
    () => props.modelValue,
    (val) => {
        const i = list.value.findIndex((o) => o.value === val)
        if (i < 0) return
        cancelRaf()
        index.value = i
        targetIndex.value = i
        lastEmitted = i
    },
    { immediate: true },
)

// —— 交互：滚轮（每 96px 走一个槽，累加取整） ——
function onWheel(e) {
    if (props.disabled) return
    e.preventDefault()
    wheelAcc += e.deltaY
    let step = 0
    while (wheelAcc >= 96) {
        wheelAcc -= 96
        step += 1
    }
    while (wheelAcc <= -96) {
        wheelAcc += 96
        step -= 1
    }
    if (!step) return
    targetIndex.value = clamp(targetIndex.value - step, 0, maxIndex.value)
    startAnim()
}

// —— 交互：点击选项（用 pointerdown 直接选中，绕开 pointer capture 吞掉 click 的问题） ——
function select(i) {
    if (props.disabled) return
    targetIndex.value = i
    startAnim()
}

// —— 交互：拖拽弧区旋转 ——
function onPointerDown(e) {
    if (props.disabled || dragging) return
    dragging = true
    dragBaseAngle = angleOf(e)
    dragStartIndex = targetIndex.value
    rootRef.value?.setPointerCapture?.(e.pointerId)
}
function onPointerMove(e) {
    if (!dragging) return
    const d = normAngle(angleOf(e) - dragBaseAngle)
    const step = Math.round(d / rad(props.slotAngle))
    targetIndex.value = clamp(dragStartIndex - step, 0, maxIndex.value)
    startAnim()
}
function onPointerUp() {
    dragging = false
}
function angleOf(e) {
    const rect = rootRef.value.getBoundingClientRect()
    return Math.atan2(e.clientY - (rect.top + rect.height / 2), e.clientX - (rect.left + rect.width / 2))
}
function normAngle(a) {
    return ((a + Math.PI) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI) - Math.PI
}

// —— 交互：键盘方向键 ——
function onKeydown(e) {
    if (props.disabled) return
    const step =
        e.key === "ArrowDown" || e.key === "ArrowRight" ? -1
        : e.key === "ArrowUp" || e.key === "ArrowLeft" ? 1
        : 0
    if (!step) return
    e.preventDefault()
    targetIndex.value = clamp(targetIndex.value + step, 0, maxIndex.value)
    startAnim()
}

// —— 选项标签布局：角度随 index 平滑移动，边缘淡出 ——
const labels = computed(() => {
    const halfSlot = props.slotAngle / 2
    const fadeStart = 40
    const out = []
    for (let i = 0; i < list.value.length; i += 1) {
        const theta = (i - index.value) * props.slotAngle
        const abs = Math.abs(theta)
        if (abs > props.visibleAngle) continue
        const p = polar(Rm.value, theta)
        // active 判定 |θ| < slotAngle/2 等价于 round(index) === i，与选中逻辑严格一致
        const active = abs < halfSlot
        const opacity = abs <= fadeStart ? 1 : Math.max(0, 1 - (abs - fadeStart) / (props.visibleAngle - fadeStart))
        const fontScale = active ? 1.12 : Math.max(0.78, 1 - abs / 320)
        out.push({
            key: i,
            label: list.value[i].label,
            x: p.x,
            y: p.y,
            theta,
            active,
            opacity: Number(opacity.toFixed(3)),
            fontSize: Math.round(baseFont.value * fontScale),
        })
    }
    return out
})

onBeforeUnmount(cancelRaf)
</script>

<style scoped>
.arc-picker {
    display: inline-block;
    max-width: 100%;
    user-select: none;
    -webkit-tap-highlight-color: transparent;
    touch-action: none;
    cursor: grab;
}

.arc-picker:active {
    cursor: grabbing;
}

.arc-picker.disabled {
    cursor: not-allowed;
    opacity: 0.5;
}

.arc-picker:focus-visible {
    outline: 2px solid color-mix(in srgb, var(--accent) 60%, transparent);
    outline-offset: 4px;
    border-radius: 12px;
}

.arc-picker svg {
    display: block;
    max-width: 100%;
    height: auto;
}

/* 环形轨道：渐变描边（stroke 由模板 url(#渐变) 提供） */
.ap-track {
    fill: none;
    stroke-width: var(--ap-tw);
    stroke-linecap: butt;
}

/* 轨道渐变 stop：弧两端（顶/底）淡 → 指针处（0°）深，引导视线到选中槽 */
.ap-track-grad-a {
    stop-color: var(--text-muted);
    stop-opacity: 0.2;
}

.ap-track-grad-b {
    stop-color: var(--text-muted);
    stop-opacity: 0.34;
}

.ap-track-grad-c {
    stop-color: var(--text-muted);
    stop-opacity: 0.46;
}

/* 轨道内沿刻度已移除：由中心徽章盘填满内圆，更干净 */

/* 选中槽高亮：指针两侧各半个槽位 */
.ap-highlight {
    fill: none;
    stroke: var(--accent);
    stroke-width: var(--ap-tw);
    stroke-linecap: butt;
    filter: drop-shadow(0 0 6px color-mix(in srgb, var(--accent) 55%, transparent));
}

/* 大 / 小圆边界线 */
.ap-ring {
    fill: none;
    stroke: var(--border);
    stroke-width: 1.5;
}

.ap-slot {
    cursor: pointer;
}

.ap-slot.active {
    cursor: default;
}

/* 选项文字：沿径向朝圆心方向排布（指针处水平正立） */
.ap-label {
    fill: var(--text-secondary);
    font-family: var(--mono);
    font-weight: 500;
    letter-spacing: 0.02em;
    transition:
        fill 0.28s var(--ease-out),
        opacity 0.28s var(--ease-out),
        font-size 0.28s var(--ease-out);
}

/* 选中项：蓝底白字（高亮槽带为强调蓝，文字反白），一眼可辨 */
.ap-slot.active .ap-label {
    fill: #fff;
    font-weight: 700;
}

/* 指针 + 中心轴承 */
.ap-needle path {
    fill: var(--accent);
    filter: drop-shadow(0 2px 4px color-mix(in srgb, var(--accent) 40%, transparent));
}

.ap-hub {
    fill: var(--bg-card);
    stroke: var(--accent);
    stroke-width: 2;
}

.ap-hub-core {
    fill: var(--accent);
}

/* 中心标题徽章：学科色半透明圆盘 + 双层小标 */
.ap-title-disc {
    fill: color-mix(in srgb, var(--accent) 16%, transparent);
    stroke: color-mix(in srgb, var(--accent) 32%, transparent);
    stroke-width: 1.5;
}

.ap-title-en {
    fill: var(--accent);
    font-family: var(--mono);
    font-weight: 600;
    letter-spacing: 0.18em;
    text-anchor: middle;
    dominant-baseline: central;
    pointer-events: none;
}

/* 竖排英文：旋转 90° 后从上往下排、字母横躺，脱离横排的居中锚定改用起点锚定 */
.ap-title-en-vt {
    text-anchor: start;
    dominant-baseline: alphabetic;
    letter-spacing: 0.1em;
}

.ap-title-zh {
    fill: var(--text);
    font-weight: 700;
    letter-spacing: 0.04em;
    text-anchor: middle;
    dominant-baseline: central;
    pointer-events: none;
    transition: fill 0.28s var(--ease-out);
}

.ap-title-zh.with-en {
    transform: translateY(15px);
}

/* 序号提示：弧下方"第 x / 总数" */
.ap-index-hint {
    fill: var(--text-muted);
    font-family: var(--mono);
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.1em;
    pointer-events: none;
}
</style>
