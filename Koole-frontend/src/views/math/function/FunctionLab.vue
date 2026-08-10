<template>
    <div class="function-lab">
        <canvas
            ref="canvasRef"
            @pointerdown="onPointerDown"
            @pointermove="onPointerMove"
            @pointerup="onPointerUp"
            @pointercancel="onPointerUp"
            @wheel.prevent="onWheel"
            @dblclick="resetView"
        ></canvas>

        <div class="bottom-toolbar">
            <button class="icon-button" type="button" title="返回数学实验室" @click="router.push('/math-lab')">
                <img :src="navBackIcon" alt="" />
            </button>
            <i></i>
            <div class="preset-wrap">
                <button class="pill-button" type="button" @click="presetMenuOpen = !presetMenuOpen">添加函数 ▾</button>
                <transition name="panel-pop">
                    <div v-if="presetMenuOpen" class="preset-menu">
                        <button v-for="preset in FUNCTION_PRESETS" :key="preset.label" class="preset-item" type="button" :style="{ '--fn-color': preset.color }" @click="addPreset(preset)">
                            <span class="preset-symbol">{{ preset.symbol }}</span>
                            <span>{{ preset.label }}</span>
                        </button>
                    </div>
                </transition>
            </div>
            <button class="pill-button" type="button" @click="resetView">重置视角</button>
            <i></i>
            <button
                class="pill-button"
                :class="{ 'is-on': snapEnabled }"
                type="button"
                title="拖动函数时吸附到刻度，关闭可自由定位"
                @click="snapEnabled = !snapEnabled"
            >吸附 {{ snapEnabled ? '开' : '关' }}</button>
            <i></i>
            <div class="preset-wrap">
                <button class="pill-button" type="button" @click="intersectMenuOpen = !intersectMenuOpen">交叉 ▾</button>
                <transition name="panel-pop">
                    <div v-if="intersectMenuOpen" class="preset-menu intersect-menu">
                        <button
                            class="preset-item"
                            type="button"
                            :class="{ active: intersectMode === 'off' }"
                            @click="intersectMode = 'off'; scheduleDraw()"
                        >不交叉</button>
                        <button
                            class="preset-item"
                            type="button"
                            :class="{ active: intersectMode === 'all' }"
                            @click="intersectMode = 'all'; scheduleDraw()"
                        >全交叉</button>
                        <button
                            class="preset-item"
                            type="button"
                            :class="{ active: intersectMode === 'partial' }"
                            @click="intersectMode = 'partial'; scheduleDraw()"
                        >部分交叉</button>
                        <div v-if="intersectMode === 'partial'" class="intersect-list">
                            <label v-for="fn in functions" :key="fn.id" class="intersect-row">
                                <input
                                    type="checkbox"
                                    :checked="intersectIds.includes(fn.id)"
                                    @change="toggleIntersectId(fn.id)"
                                />
                                <span class="intersect-swatch" :style="{ background: fn.color }"></span>
                                <span>{{ fn.label }}</span>
                            </label>
                            <small class="intersect-count">已选 {{ intersectIds.length }} 个</small>
                        </div>
                    </div>
                </transition>
            </div>
        </div>

        <div class="status-strip">
            <span>{{ functions.length }} 个函数对象</span>
            <i></i>
            <span>{{ Math.round(view.scale * 100) }}%</span>
            <i></i>
            <span>{{ dragLabel }}</span>
        </div>

        <div class="help-wrap">
            <button class="help-toggle" type="button" @click="helpOpen = !helpOpen" :aria-expanded="helpOpen">使用介绍</button>
            <transition name="panel-pop">
                <div v-if="helpOpen" class="help-card">
                    <header class="help-head">
                        <small>HOW TO WRITE</small>
                        <strong>函数式子怎么写</strong>
                    </header>

                    <section>
                        <h4>两类写法</h4>
                        <p><b>显式函数</b>（y 等于一个关于 x 的式子）</p>
                        <code>y = sin(x)</code>
                        <code>y = x^2 - 1</code>
                        <code>y = 2*x + 3</code>
                        <p><b>隐式方程</b>（等号两侧都有 x / y，画出一条曲线）</p>
                        <code>x^2 + y^2 = r^2</code>
                        <code>x^2/a^2 + y^2/b^2 = 1</code>
                        <code>(x^2+y^2-1)^3 = x^2*y^3</code>
                    </section>

                    <section>
                        <h4>支持的运算与函数</h4>
                        <p>四则运算 <code>+ - * /</code>，幂用 <code>^</code></p>
                        <p>函数 <code>sin cos tan sqrt abs log ln exp</code>（必须带括号，如 <code>sin(x)</code>）</p>
                        <p>常数 <code>pi</code>、<code>e</code></p>
                        <p>参数：任意字母（如 <code>a b c r</code>）会变成可拖滑块</p>
                    </section>

                    <section>
                        <h4>小提示</h4>
                        <p>幂有三种写法都认：<code>x^2</code>、<code>x2</code>、<code>x²</code> 都会被识别成 x 的平方</p>
                        <p><code>2*x</code> 可写成 <code>2x</code>（自动补乘号），但函数名必须带括号：<code>sinx</code> 不行，要 <code>sin(x)</code></p>
                        <p>拖动函数可以移动它的位置，<code>a</code>、<code>b</code>、<code>r</code> 滑块实时改变形状</p>
                    </section>
                </div>
            </transition>
        </div>

        <div class="objects-wrap">
            <button class="objects-toggle" type="button" @click="objectsCollapsed = !objectsCollapsed">函数对象 <b class="fn-count">{{ functions.length }}</b></button>
            <transition name="panel-pop">
                <div v-if="!objectsCollapsed" class="function-panel" key="function-panel">
                    <header class="panel-heading">
                        <div>
                            <small>OBJECTS</small>
                            <h2>函数对象</h2>
                        </div>
                        <div class="heading-actions">
                            <button class="compact-button" type="button" title="添加函数" @click="addFunction">+</button>
                            <button class="collapse-button" type="button" aria-label="收起函数对象面板" @click="objectsCollapsed = true">收起</button>
                        </div>
                    </header>

                    <div class="function-list">
                <article
                    v-for="fn in functions"
                    :key="fn.id"
                    class="function-card"
                    :class="{ active: activeId === fn.id }"
                    :style="{ '--fn-color': fn.color }"
                    @pointerdown.stop="selectFunction(fn.id)"
                >
                    <div class="card-top">
                        <span class="function-swatch"></span>
                        <input v-model="fn.label" type="text" aria-label="函数名称" />
                        <button class="card-toggle" type="button" :aria-label="fn.collapsed ? '展开函数对象' : '收起函数对象'" @click.stop="fn.collapsed = !fn.collapsed">
                            {{ fn.collapsed ? '展开' : '收起' }}
                        </button>
                        <button class="delete-button" type="button" aria-label="删除函数" @click.stop="removeFunction(fn.id)">×</button>
                    </div>

                    <template v-if="!fn.collapsed">
                        <div class="live-equation">
                            <small>实时算子</small>
                            <code>{{ displayEquation(fn) }}</code>
                        </div>
                        <label class="expression-row">
                            <span>原始算子</span>
                            <input v-model="fn.expression" type="text" placeholder="y^2 = x^2 或 y = sin(x)" />
                        </label>
                        <small class="expression-help">支持显式函数和隐式方程，输入等号两侧表达式即可。</small>

                        <div v-if="fn.paramKeys.length" class="params-grid">
                            <label v-for="key in fn.paramKeys" :key="key">
                                <span class="param-key">{{ key }}</span>
                                <input class="param-range" type="range" :min="paramRange(fn.params[key])[0]" :max="paramRange(fn.params[key])[1]" step="0.1" v-model.number="fn.params[key]" />
                                <input class="param-number" v-model.number="fn.params[key]" type="number" step="0.1" />
                            </label>
                        </div>
                        <small v-else class="expression-help">这个表达式没有可调参数，直接编辑方程即可。</small>

                        <dl class="live-values">
                            <div>
                                <dt>位置</dt>
                                <dd>({{ formatValue(fn.offsetX) }}, {{ formatValue(fn.offsetY) }})</dd>
                            </div>
                            <div>
                                <dt>当前值</dt>
                                <dd>{{ formatValue(evaluateWorld(fn, probeX)) }}</dd>
                            </div>
                        </dl>
                    </template>
                </article>
            </div>
                </div>
            </transition>
        </div>

        <div class="readout" v-if="hasSelection && activeFunction" :style="{ '--fn-color': activeFunction.color }">
            <small>LIVE · {{ activeFunction.label }}</small>
            <div class="probe-mode">
                <button type="button" :class="{ on: probeModeX }" @click="probeModeX = true">x → y</button>
                <button type="button" :class="{ on: !probeModeX }" @click="probeModeX = false">y → x</button>
            </div>
            <label class="probe-x" v-if="probeModeX">
                <span>x</span>
                <input v-model.number="probeX" type="number" step="0.1" aria-label="探针 x 坐标" />
            </label>
            <label class="probe-x" v-else>
                <span>y</span>
                <input v-model.number="probeY" type="number" step="0.1" aria-label="反查 y 坐标" />
            </label>
            <template v-if="probeModeX && probeYValues.length">
                <b v-for="(y, i) in probeYValues" :key="i">y{{ probeYValues.length > 1 ? `₍${i + 1}₎` : "" }} = {{ formatLive(y) }}</b>
            </template>
            <template v-else-if="!probeModeX && probeXValues.length">
                <b v-for="(x, i) in probeXValues" :key="i">x{{ probeXValues.length > 1 ? `₍${i + 1}₎` : "" }} = {{ formatLive(x) }}</b>
            </template>
            <b v-else class="no-hit">无交点</b>
        </div>
    </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from "vue"
import { useRouter } from "vue-router"
import { theme } from "../../../stores/theme.js"
import navBackIcon from "../../../assets/icons/nav-back.svg"
import { createView, worldToScreen, screenToWorld } from "../../../Logic/math/camera.js"
import { evaluateWorld, formatValue, paramRange, splitEquation, updateParamKeys, compileEquation, probeValues, probeXValues as probeXValuesFn } from "../../../Logic/math/evaluator.js"
import { sampleExplicit, sampleImplicit } from "../../../Logic/math/sampler.js"
import { findIntersections } from "../../../Logic/math/intersections.js"
import { drawMathScene, getObjectPoint, snapStep } from "../../../Logic/math/renderer.js"

const router = useRouter()
const canvasRef = ref(null)
const canvasWidth = computed(() => canvasRef.value?.clientWidth || 1)
const canvasHeight = computed(() => canvasRef.value?.clientHeight || 1)
const activeId = ref(1)
const hasSelection = ref(false) // 是否主动点选过函数（LIVE 面板只在选中后出现）
const objectsCollapsed = ref(true)
const probeX = ref(0)
const view = createView()
const dragState = reactive({ type: "", id: 0, key: "", startX: 0, startY: 0, lastX: 0, lastY: 0, startOX: 0, startOY: 0 })
const zoomActive = ref(false) // 缩放滚轮进行中走 draft 精度，停止后恢复 fine
let zoomTimer = 0
const helpOpen = ref(false) // 左下角"使用介绍"说明卡展开状态
const intersectMode = ref("off") // off | all | partial：函数交叉模式
const intersectIds = ref([]) // 部分交叉时勾选的函数 id 集合
const intersectMenuOpen = ref(false) // 交叉菜单展开状态
const hoverScreen = ref(null) // 鼠标屏幕坐标，供交点悬停
const snapEnabled = ref(true) // 拖动函数时是否吸附到细粒度刻度

const functions = reactive([
    createFunction({
        id: 1,
        label: "抛物线对象",
        expression: "a * (x - b)^2 + c",
        color: "#477cdb",
        offsetX: -2,
        offsetY: 0.4,
        params: { a: 0.42, b: 0, c: -1.2 },
        kind: "parabola",
        mode: "explicit",
    }),
    createFunction({
        id: 2,
        label: "正弦波对象",
        expression: "a * sin(b * x) + c",
        color: "#e8bd6a",
        offsetX: 2.4,
        offsetY: -0.2,
        params: { a: 1.1, b: 1, c: 0 },
        kind: "sine",
        mode: "explicit",
    }),
])

const activeFunction = computed(() => functions.find(fn => fn.id === activeId.value) || functions[0])
// 当前选中函数在 probeX 处的全部 y 值（显式单值、隐式多交点）
const probeYValues = computed(() => (activeFunction.value ? probeValues(activeFunction.value, probeX.value) : []))
// 查询方向：true 表示"输入 x 查 y"，false 表示"输入 y 查 x"
const probeModeX = ref(true)
const probeY = ref(0) // y→x 模式下的输入 y
const probeXValues = computed(() => (activeFunction.value ? probeXValuesFn(activeFunction.value, probeY.value) : []))
// LIVE 读数显示保留两位小数，避免读数太细、看着眼花
function formatLive(value) {
    return Number.isFinite(value) ? Number(value.toFixed(2)).toString() : "无交点"
}
const dragLabel = computed(() => {
    if (dragState.type === "pan") return "正在平移画布"
    if (dragState.type === "function") return "正在拖动函数"
    return "拖动曲线或对象点"
})

// 函数对象工厂：构建状态 + 预编译表达式
function createFunction(config) {
    const fn = reactive({
        id: config.id,
        label: config.label,
        expression: config.expression,
        color: config.color,
        offsetX: config.offsetX,
        offsetY: config.offsetY,
        params: config.params,
        kind: config.kind,
        mode: config.mode || (splitEquation(config.expression).left === "y" ? "explicit" : "implicit"),
        collapsed: false,
    })
    updateParamKeys(fn)
    compileEquation(fn)
    return fn
}

// 展示层换算：把 offset 折进原始式子，生成"实时算子"文本（不改 fn.expression / offset，不重算）
// 隐式：所有独立 x/y → (x - offsetX)/(y - offsetY)；显式：右式 x 平移 + 末尾整体 y 偏移。
function displayEquation(fn) {
    const { left, right } = compileEquation(fn)
    const ox = fn.offsetX
    const oy = fn.offsetY
    const fmtOffset = value => {
        const text = formatValue(value)
        return text.startsWith("-") ? `+ ${text.slice(1)}` : `- ${text}`
    }
    const shift = (expr, name, offset) => (offset === 0 ? expr : expr.replace(new RegExp(`\\b${name}\\b`, "g"), `(${name} ${fmtOffset(offset)})`))
    if (left !== "y") {
        return `${shift(shift(left, "x", ox), "y", oy)} = ${shift(shift(right, "x", ox), "y", oy)}`
    }
    let text = shift(right, "x", ox)
    if (oy !== 0) text = `${text} ${oy > 0 ? "+" : "-"} ${Math.abs(formatValue(oy))}`
    return `y = ${text}`
}

function selectFunction(id) {
    activeId.value = id
    hasSelection.value = true
    scheduleDraw()
}

function addFunction() {
    const id = Math.max(...functions.map(fn => fn.id), 0) + 1
    functions.push(createFunction({
        id,
        label: `函数对象 ${id}`,
        expression: "a * sin(b * x) + c",
        color: ["#d66b9a", "#34a853", "#f97316", "#7c65d9"][id % 4],
        offsetX: view.x,
        offsetY: view.y,
        params: { a: 1, b: 1, c: 0 },
        kind: "sine",
        mode: "explicit",
    }))
    activeId.value = id
    scheduleDraw()
}

// 常用函数预设库：一键添加常用曲线，避免手打方程
const FUNCTION_PRESETS = [
    { label: "正弦波", symbol: "∿", expression: "a * sin(b * x) + c", params: { a: 1, b: 1, c: 0 }, color: "#e8bd6a", kind: "sine" },
    { label: "抛物线", symbol: "⌒", expression: "a * (x - b)^2 + c", params: { a: 0.5, b: 0, c: 0 }, color: "#477cdb", kind: "parabola" },
    { label: "直线", symbol: "╱", expression: "k * x + b", params: { k: 1, b: 0 }, color: "#34a853", kind: "line" },
    { label: "指数曲线", symbol: "⤴", expression: "a * exp(b * x) + c", params: { a: 1, b: 0.5, c: 0 }, color: "#f97316", kind: "exp" },
    { label: "圆", symbol: "◯", expression: "x^2 + y^2 = r^2", params: { r: 1.5 }, color: "#d66b9a", kind: "circle" },
    { label: "椭圆", symbol: "⬭", expression: "x^2 / a^2 + y^2 / b^2 = 1", params: { a: 2, b: 1 }, color: "#7c65d9", kind: "ellipse" },
    { label: "双曲线", symbol: "∽", expression: "x^2 / a^2 - y^2 / b^2 = 1", params: { a: 1.5, b: 1 }, color: "#ef4444", kind: "hyperbola" },
    { label: "爱心", symbol: "♥", expression: "(x^2 + y^2 - 1)^3 = x^2 * y^3", params: {}, color: "#e74c3c", kind: "heart" },
]

const presetMenuOpen = ref(false)

function addPreset(preset) {
    const id = Math.max(...functions.map(fn => fn.id), 0) + 1
    functions.push(createFunction({
        id,
        label: preset.label,
        expression: preset.expression,
        color: preset.color,
        offsetX: view.x,
        offsetY: view.y,
        params: { ...preset.params },
        kind: preset.kind,
    }))
    activeId.value = id
    presetMenuOpen.value = false
    scheduleDraw()
}

function removeFunction(id) {
    if (functions.length <= 1) return
    const index = functions.findIndex(fn => fn.id === id)
    if (index >= 0) functions.splice(index, 1)
    if (activeId.value === id) activeId.value = functions[0].id
    scheduleDraw()
}

function toggleIntersectId(id) {
    intersectIds.value = intersectIds.value.includes(id)
        ? intersectIds.value.filter(item => item !== id)
        : [...intersectIds.value, id]
    scheduleDraw()
}

function hitTest(sx, sy) {
    for (let index = functions.length - 1; index >= 0; index -= 1) {
        const fn = functions[index]
        const [worldX, worldY] = screenToWorld(sx, sy, view, canvasWidth.value, canvasHeight.value)
        const curveY = evaluateWorld(fn, worldX)
        if (Number.isFinite(curveY) && Math.abs(worldY - curveY) <= 16 / view.scale) {
            return { type: "function", id: fn.id, key: "" }
        }
        const objectPoint = getObjectPoint(fn)
        const [px, py] = worldToScreen(objectPoint.x, objectPoint.y, view, canvasWidth.value, canvasHeight.value)
        if (Math.hypot(sx - px, sy - py) <= 20) return { type: "function", id: fn.id, key: "" }
    }
    return { type: "pan", id: 0, key: "" }
}

function onPointerDown(event) {
    presetMenuOpen.value = false
    intersectMenuOpen.value = false
    const canvas = canvasRef.value
    const rect = canvas.getBoundingClientRect()
    const hit = hitTest(event.clientX - rect.left, event.clientY - rect.top)
    dragState.type = hit.type
    dragState.id = hit.id
    dragState.key = hit.key
    dragState.startX = event.clientX
    dragState.startY = event.clientY
    dragState.lastX = event.clientX
    dragState.lastY = event.clientY
    if (hit.id) {
        activeId.value = hit.id
        hasSelection.value = true
        // 记录拖动起点时函数的 offset，吸附计算以它为基准，避免浮点累加漂移
        const fn = functions.find(item => item.id === hit.id)
        if (fn) {
            dragState.startOX = fn.offsetX
            dragState.startOY = fn.offsetY
        }
    }
    canvas.setPointerCapture(event.pointerId)
    scheduleDraw()
}

function onPointerMove(event) {
    const rect = canvasRef.value.getBoundingClientRect()
    const sx = event.clientX - rect.left
    const sy = event.clientY - rect.top

    if (!dragState.type) {
        // 非拖动：更新悬停坐标（交点坐标气泡用），变化才重绘
        if (hoverScreen.value === null || hoverScreen.value[0] !== sx || hoverScreen.value[1] !== sy) {
            hoverScreen.value = [sx, sy]
            scheduleDraw()
        }
        return
    }

    // 拖动中：清空悬停，避免拖动误判
    if (hoverScreen.value !== null) {
        hoverScreen.value = null
    }
    const dx = event.clientX - dragState.lastX
    const dy = event.clientY - dragState.lastY
    const fn = functions.find(item => item.id === dragState.id)

    if (dragState.type === "pan") {
        view.x -= dx / view.scale
        view.y += dy / view.scale
    } else if (fn && dragState.type === "function") {
        // 新位置 = 起点 offset + 位移；吸附开启时取整到细粒度刻度（随缩放变细）
        const worldX = dragState.startOX + (event.clientX - dragState.startX) / view.scale
        const worldY = dragState.startOY - (event.clientY - dragState.startY) / view.scale
        if (snapEnabled.value) {
            const step = snapStep(view.scale)
            fn.offsetX = Math.round(worldX / step) * step
            fn.offsetY = Math.round(worldY / step) * step
        } else {
            fn.offsetX = worldX
            fn.offsetY = worldY
        }
    }

    dragState.lastX = event.clientX
    dragState.lastY = event.clientY
    scheduleDraw()
}

function onPointerUp() {
    dragState.type = ""
    dragState.id = 0
    dragState.key = ""
    scheduleDraw()
}

function onWheel(event) {
    const rect = canvasRef.value.getBoundingClientRect()
    const sx = event.clientX - rect.left
    const sy = event.clientY - rect.top
    const [beforeX, beforeY] = screenToWorld(sx, sy, view, canvasWidth.value, canvasHeight.value)
    view.scale = clamp(view.scale * (event.deltaY < 0 ? 1.06 : 1 / 1.06), 24, 320)
    const [afterX, afterY] = screenToWorld(sx, sy, view, canvasWidth.value, canvasHeight.value)
    view.x += beforeX - afterX
    view.y += beforeY - afterY
    // 缩放期间用 draft 精度（大步长），停止滚动 150ms 后恢复 fine
    zoomActive.value = true
    clearTimeout(zoomTimer)
    zoomTimer = setTimeout(() => {
        zoomActive.value = false
        scheduleDraw()
    }, 150)
    scheduleDraw()
}

function resetView() {
    view.x = 0
    view.y = 0
    view.scale = 58
    scheduleDraw()
}

function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value))
}

// ---- 统一 rAF 调度 ----

let drawFrame = 0

function scheduleDraw() {
    cancelAnimationFrame(drawFrame)
    drawFrame = requestAnimationFrame(draw)
}

function draw() {
    const canvas = canvasRef.value
    const ctx = canvas?.getContext("2d")
    if (!canvas || !ctx) return

    const dpr = window.devicePixelRatio || 1
    const width = canvas.clientWidth
    const height = canvas.clientHeight
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, width, height)

    // 交互拖动 / 缩放滚轮时用草稿精度采样（大步长），静止后恢复精细
    const quality = dragState.type || zoomActive.value ? "draft" : "fine"
    for (const fn of functions) {
        // 采样与渲染统一以"表达式左侧是否 y"为准现判（renderer 亦如此），
        // 避免 fn.mode 在表达式编辑后失同步导致隐式方程走错采样路径。
        if (compileEquation(fn).left === "y") sampleExplicit(fn, view, width, height)
        else sampleImplicit(fn, view, width, height, quality)
    }

    const intersections = computeIntersections(view, width, height)

    drawMathScene(ctx, canvas, {
        theme: theme.value,
        view,
        width,
        height,
        dpr,
        functions,
        probeX: probeX.value,
        probeModeX: probeModeX.value,
        probeY: probeY.value,
        activeId: activeId.value,
        intersections,
        hoverScreen: hoverScreen.value,
    })
}

// 按交叉模式计算交点：off 不显示；all 两两求交；partial 只对勾选函数求交
function computeIntersections(view, width, height) {
    if (intersectMode.value === "off") return []
    const ids = intersectMode.value === "partial" ? new Set(intersectIds.value) : null
    const results = []
    for (let i = 0; i < functions.length; i += 1) {
        for (let j = i + 1; j < functions.length; j += 1) {
            const a = functions[i]
            const b = functions[j]
            if (ids && (!ids.has(a.id) || !ids.has(b.id))) continue
            results.push(...findIntersections(a, b, view, width, height))
        }
    }
    return results
}

function resizeCanvas() {
    const canvas = canvasRef.value
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const dpr = window.devicePixelRatio || 1
    canvas.width = Math.floor(rect.width * dpr)
    canvas.height = Math.floor(rect.height * dpr)
    scheduleDraw()
}

watch(functions, scheduleDraw, { deep: true })
watch(theme, scheduleDraw)
watch(probeX, scheduleDraw)
watch(probeY, scheduleDraw)
watch(probeModeX, scheduleDraw)

// 表达式变化时重新提取参数，并保留仍存在的旧参数值
watch(
    () => functions.map(fn => fn.expression),
    () => {
        functions.forEach(fn => {
            updateParamKeys(fn)
            compileEquation(fn)
        })
        scheduleDraw()
    },
)

let resizeObserver = null

onMounted(async () => {
    await nextTick()
    resizeCanvas()
    resizeObserver = new ResizeObserver(resizeCanvas)
    resizeObserver.observe(canvasRef.value)
})

onBeforeUnmount(() => {
    clearTimeout(zoomTimer)
    resizeObserver?.disconnect()
})
</script>

<style scoped>
.function-lab {
    position: relative;
    width: 100%;
    height: calc(100vh - var(--nav-height));
    margin: -32px 0;
    overflow: hidden;
    background: var(--bg);
}

.function-lab canvas {
    width: 100%;
    height: 100%;
    display: block;
    cursor: grab;
    touch-action: none;
}

.function-lab canvas:active {
    cursor: grabbing;
}

.bottom-toolbar {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    bottom: 40px;
    z-index: 5;
    min-height: 54px;
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 10px;
    border: 1px solid color-mix(in srgb, var(--border) 76%, transparent);
    border-radius: 999px;
    background: color-mix(in srgb, var(--bg-card) 86%, transparent);
    box-shadow: 0 14px 42px rgba(15, 23, 32, 0.16);
    backdrop-filter: blur(18px);
    -webkit-backdrop-filter: blur(18px);
}

.bottom-toolbar > i,
.status-strip > i {
    width: 1px;
    height: 24px;
    background: var(--border);
}

.icon-button {
    width: 38px;
    height: 38px;
    display: grid;
    place-items: center;
    border: 1px solid var(--border);
    border-radius: 50%;
    background: var(--bg-card);
}

.icon-button img {
    width: 15px;
    height: 15px;
}

.panel-heading small,
.readout small {
    color: var(--primary);
    font-family: var(--mono);
    font-size: 9px;
    letter-spacing: 0.12em;
}

.pill-button,
.compact-button {
    min-height: 36px;
    padding: 0 13px;
    border: 1px solid var(--border);
    border-radius: 999px;
    background: transparent;
    color: var(--text-secondary);
    font-size: 12px;
    font-weight: 700;
}

.pill-button:hover,
.compact-button:hover,
.icon-button:hover {
    border-color: var(--primary);
    color: var(--primary);
}

.pill-button.is-on {
    background: var(--primary);
    border-color: var(--primary);
    color: #ffffff;
}

.preset-wrap {
    position: relative;
}

.preset-menu {
    position: absolute;
    bottom: calc(100% + 8px);
    left: 0;
    z-index: 20;
    min-width: 200px;
    display: grid;
    gap: 2px;
    padding: 6px;
    border: 1px solid var(--border);
    border-radius: 14px;
    background: var(--bg-card);
    box-shadow: 0 18px 44px rgba(15, 23, 32, 0.18);
}

.preset-item {
    display: flex;
    align-items: center;
    gap: 10px;
    min-height: 38px;
    padding: 0 12px;
    border: 0;
    border-radius: 9px;
    background: transparent;
    color: var(--text-secondary);
    font-size: 13px;
    font-weight: 600;
    text-align: left;
    cursor: pointer;
}

.preset-item:hover {
    background: color-mix(in srgb, var(--fn-color, var(--primary)) 12%, transparent);
    color: var(--text);
}

.preset-item.active {
    background: color-mix(in srgb, var(--fn-color, var(--primary)) 16%, transparent);
    color: var(--text);
}

.intersect-menu {
    min-width: 210px;
}

.intersect-list {
    margin-top: 4px;
    padding-top: 6px;
    border-top: 1px solid var(--border);
    display: grid;
    gap: 2px;
}

.intersect-row {
    display: flex;
    align-items: center;
    gap: 9px;
    min-height: 32px;
    padding: 0 12px;
    border-radius: 8px;
    color: var(--text-secondary);
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
}

.intersect-row:hover {
    background: color-mix(in srgb, var(--border) 32%, transparent);
    color: var(--text);
}

.intersect-row input {
    width: 14px;
    height: 14px;
    accent-color: var(--primary);
    cursor: pointer;
}

.intersect-swatch {
    width: 10px;
    height: 10px;
    border-radius: 3px;
    flex: none;
}

.intersect-count {
    padding: 6px 12px 2px;
    color: var(--text-muted);
    font-size: 10px;
}

.preset-symbol {
    width: 26px;
    color: var(--fn-color, var(--primary));
    font-family: var(--mono);
    font-size: 16px;
    text-align: center;
}

.status-strip {
    position: absolute;
    left: 22px;
    bottom: 20px;
    z-index: 4;
    min-height: 36px;
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 0 14px;
    border: 1px solid color-mix(in srgb, var(--border) 72%, transparent);
    border-radius: 999px;
    background: color-mix(in srgb, var(--bg-card) 78%, transparent);
    color: var(--text-muted);
    font-size: 11px;
    backdrop-filter: blur(14px);
    -webkit-backdrop-filter: blur(14px);
}

.help-wrap {
    position: absolute;
    left: 22px;
    bottom: 64px;
    z-index: 4;
}

.help-toggle {
    min-height: 34px;
    padding: 0 16px;
    border: 1px solid var(--primary);
    border-radius: 999px;
    background: var(--primary);
    color: #ffffff;
    font-size: 12px;
    font-weight: 800;
    box-shadow: 0 6px 18px color-mix(in srgb, var(--primary) 32%, transparent);
    cursor: pointer;
}

.help-toggle:hover {
    filter: brightness(1.08);
    box-shadow: 0 8px 22px color-mix(in srgb, var(--primary) 42%, transparent);
}

.help-card {
    position: absolute;
    left: 0;
    bottom: calc(100% + 8px);
    width: 320px;
    max-height: 60vh;
    overflow-y: auto;
    display: grid;
    gap: 14px;
    padding: 16px;
    border: 1px solid var(--border);
    border-radius: 16px;
    background: var(--bg-card);
    box-shadow: 0 18px 44px rgba(15, 23, 32, 0.18);
}

.help-head {
    display: grid;
    gap: 3px;
}

.help-head small {
    color: var(--primary);
    font-family: var(--mono);
    font-size: 9px;
    letter-spacing: 0.12em;
}

.help-head strong {
    color: var(--text);
    font-size: 14px;
}

.help-card section {
    display: grid;
    gap: 6px;
}

.help-card h4 {
    margin: 0;
    color: var(--text);
    font-size: 12px;
}

.help-card p {
    margin: 0;
    color: var(--text-secondary);
    font-size: 12px;
    line-height: 1.6;
}

.help-card p b {
    color: var(--text);
}

.help-card code {
    display: block;
    width: fit-content;
    max-width: 100%;
    padding: 2px 7px;
    border-radius: 6px;
    background: color-mix(in srgb, var(--border) 38%, transparent);
    color: var(--primary);
    font-family: var(--mono);
    font-size: 11px;
    word-break: break-all;
}

.panel-pop-enter-active,
.panel-pop-leave-active {
    transition: opacity 0.24s ease, transform 0.28s var(--ease-out, ease-out);
}

.panel-pop-enter-from,
.panel-pop-leave-to {
    opacity: 0;
    transform: translateY(18px) scale(0.97);
}

.fn-count {
    display: inline-grid;
    place-items: center;
    min-width: 18px;
    height: 18px;
    padding: 0 5px;
    margin-left: 2px;
    border-radius: 999px;
    background: var(--primary-light);
    color: var(--primary);
    font-family: var(--mono);
    font-size: 10px;
}

.objects-wrap {
    position: absolute;
    right: 22px;
    bottom: 20px;
    z-index: 5;
}

.objects-toggle {
    min-height: 34px;
    display: inline-flex;
    align-items: center;
    gap: 7px;
    padding: 0 16px;
    border: 1px solid color-mix(in srgb, var(--border) 72%, transparent);
    border-radius: 999px;
    background: color-mix(in srgb, var(--bg-card) 78%, transparent);
    color: var(--text-secondary);
    font-size: 12px;
    font-weight: 700;
    backdrop-filter: blur(14px);
    -webkit-backdrop-filter: blur(14px);
    cursor: pointer;
}

.objects-toggle:hover {
    border-color: var(--primary);
    color: var(--primary);
}

.function-panel {
    position: absolute;
    right: 0;
    bottom: calc(100% + 8px);
    z-index: 5;
    width: min(400px, calc(100vw - 44px));
    max-height: calc(100vh - 220px);
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 16px;
    border: 1px solid color-mix(in srgb, var(--border) 76%, transparent);
    border-radius: 22px;
    background: color-mix(in srgb, var(--bg-card) 88%, transparent);
    box-shadow: 0 20px 60px rgba(15, 23, 32, 0.2);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
}

.panel-heading {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
}

.heading-actions {
    display: flex;
    align-items: center;
    gap: 7px;
}

.collapse-button,
.card-toggle,
.collapsed-panel-entry {
    min-height: 30px;
    padding: 0 10px;
    border: 1px solid var(--border);
    border-radius: 999px;
    background: transparent;
    color: var(--text-secondary);
    font-size: 10px;
    font-weight: 700;
}

.collapse-button:hover,
.card-toggle:hover,
.collapsed-panel-entry:hover {
    border-color: var(--primary);
    color: var(--primary);
}

.collapsed-panel-entry {
    width: 100%;
    min-height: 40px;
}

.panel-heading h2 {
    margin-top: 4px;
    color: var(--text);
    font-size: 18px;
}

.compact-button {
    width: 36px;
    padding: 0;
    color: var(--primary);
    font-size: 18px;
}

.function-list {
    min-height: 0;
    display: grid;
    align-content: start;
    gap: 10px;
    overflow-y: auto;
}

.function-card {
    display: grid;
    gap: 10px;
    padding: 12px;
    border: 1px solid color-mix(in srgb, var(--border) 82%, transparent);
    border-left: 3px solid var(--fn-color);
    border-radius: 14px;
    background: color-mix(in srgb, var(--bg-card-hover) 72%, transparent);
    cursor: pointer;
}

.function-card.active {
    border-color: color-mix(in srgb, var(--fn-color) 52%, var(--border));
    background: color-mix(in srgb, var(--fn-color) 10%, var(--bg-card));
}

.card-top {
    display: flex;
    align-items: center;
    gap: 8px;
}

.function-swatch {
    width: 10px;
    height: 10px;
    flex-shrink: 0;
    border-radius: 50%;
    background: var(--fn-color);
    box-shadow: 0 0 0 5px color-mix(in srgb, var(--fn-color) 16%, transparent);
}

.card-top input {
    min-width: 0;
    flex: 1;
    border: 0;
    outline: 0;
    background: transparent;
    color: var(--text);
    font-size: 13px;
    font-weight: 800;
}

.delete-button {
    width: 26px;
    height: 26px;
    border: 0;
    border-radius: 50%;
    background: transparent;
    color: var(--text-muted);
    font-size: 18px;
    line-height: 1;
}

.delete-button:hover {
    background: color-mix(in srgb, #ef4444 12%, transparent);
    color: #ef4444;
}

.expression-row {
    display: flex;
    align-items: center;
    gap: 8px;
    color: var(--text-secondary);
    font-family: var(--mono);
    font-size: 12px;
}

.live-equation {
    display: flex;
    flex-direction: column;
    gap: 5px;
    margin-bottom: 8px;
    padding: 10px 12px;
    border: 1px solid color-mix(in srgb, var(--fn-color) 34%, transparent);
    border-radius: 9px;
    background: color-mix(in srgb, var(--fn-color) 7%, var(--bg-card));
}

.live-equation small {
    color: var(--text-muted);
    font-size: 11px;
    letter-spacing: 0.08em;
}

.live-equation code {
    color: var(--fn-color);
    font-family: var(--mono);
    font-size: 15px;
    font-weight: 700;
    word-break: break-all;
}

.expression-row input {
    min-width: 0;
    width: 100%;
    height: 36px;
    padding: 0 10px;
    border: 1px solid var(--border);
    border-radius: 9px;
    background: var(--bg-card);
    color: var(--text);
    font-family: var(--mono);
    font-size: 12px;
    outline: none;
}

.expression-row input:focus,
.params-grid input:focus {
    border-color: var(--fn-color);
}

.expression-help {
    color: var(--text-muted);
    font-size: 10px;
    line-height: 1.5;
}

.function-card:not(.active) .expression-help {
    display: none;
}

.params-grid {
    display: grid;
    gap: 9px;
}

.params-grid label {
    display: grid;
    grid-template-columns: 26px minmax(0, 1fr) 62px;
    align-items: center;
    gap: 9px;
    color: var(--text-muted);
    font-family: var(--mono);
    font-size: 10px;
}

.param-key {
    font-weight: 700;
}

.param-range {
    width: 100%;
    accent-color: var(--fn-color);
    cursor: pointer;
}

.params-grid .param-number {
    width: 100%;
    height: 30px;
    padding: 0 6px;
    border: 1px solid var(--border);
    border-radius: 8px;
    background: var(--bg-card);
    color: var(--text);
    font-size: 11px;
    outline: none;
    text-align: right;
}

.live-values {
    display: grid;
    gap: 5px;
    margin: 0;
    padding-top: 8px;
    border-top: 1px solid var(--border);
}

.live-values div {
    display: flex;
    justify-content: space-between;
    gap: 12px;
}

.live-values dt,
.live-values dd {
    margin: 0;
    font-family: var(--mono);
    font-size: 10px;
}

.live-values dt {
    color: var(--text-muted);
}

.live-values dd {
    color: var(--primary);
}

.readout {
    position: absolute;
    top: 18px;
    left: 22px;
    z-index: 4;
    min-width: 210px;
    display: grid;
    gap: 7px;
    padding: 14px 16px 14px 20px;
    border: 1px solid color-mix(in srgb, var(--fn-color, var(--primary)) 38%, transparent);
    border-left: 4px solid var(--fn-color, var(--primary));
    border-radius: 14px;
    background: color-mix(in srgb, var(--bg-card) 94%, transparent);
    box-shadow: 0 12px 32px color-mix(in srgb, var(--fn-color, var(--primary)) 18%, transparent);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
}

.readout small {
    color: var(--fn-color, var(--primary));
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 0.12em;
}

.probe-mode {
    display: flex;
    gap: 4px;
}

.probe-mode button {
    flex: 1;
    min-height: 26px;
    border: 1px solid color-mix(in srgb, var(--border) 60%, transparent);
    border-radius: 999px;
    background: transparent;
    color: var(--text-muted);
    font-family: var(--mono);
    font-size: 11px;
    font-weight: 700;
    cursor: pointer;
}

.probe-mode button.on {
    background: var(--fn-color, var(--primary));
    border-color: var(--fn-color, var(--primary));
    color: #ffffff;
}

.probe-x {
    display: flex;
    align-items: center;
    gap: 8px;
}

.probe-x span {
    color: var(--text-secondary);
    font-family: var(--mono);
    font-size: 13px;
}

.probe-x input {
    width: 90px;
    height: 30px;
    padding: 0 8px;
    border: 1px solid color-mix(in srgb, var(--fn-color, var(--primary)) 42%, transparent);
    border-radius: 8px;
    background: color-mix(in srgb, var(--bg-card) 90%, transparent);
    color: var(--text);
    font-family: var(--mono);
    font-size: 13px;
    font-weight: 700;
    outline: none;
}

.probe-x input:focus {
    border-color: var(--fn-color, var(--primary));
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--fn-color, var(--primary)) 18%, transparent);
}

.readout b {
    color: var(--fn-color, var(--primary));
    font-family: var(--mono);
    font-size: 14px;
    font-weight: 800;
}

.readout b.no-hit {
    color: var(--text-muted);
}

@media (max-width: 820px) {
    .bottom-toolbar {
        right: 14px;
        max-width: calc(100vw - 28px);
        overflow-x: auto;
        border-radius: 18px;
    }

    .function-panel {
        top: auto;
        right: 0;
        bottom: calc(100% + 8px);
        left: auto;
        width: min(320px, calc(100vw - 28px));
        max-height: 42vh;
    }

    .status-strip,
    .readout {
        display: none;
    }
}

@media (max-width: 680px) {
    .function-lab {
        height: calc(100vh - var(--nav-height));
        margin: -32px 0;
    }

    .pill-button {
        min-width: max-content;
    }
}
</style>
