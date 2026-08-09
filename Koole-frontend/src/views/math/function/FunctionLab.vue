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

        <div class="top-toolbar">
            <button class="icon-button" type="button" title="返回数学实验室" @click="router.push('/math-lab')">
                <img :src="navBackIcon" alt="" />
            </button>
            <i></i>
            <div class="toolbar-title">
                <small>FUNCTION CANVAS</small>
                <strong>函数无限画布</strong>
            </div>
            <i></i>
            <button class="pill-button" type="button" @click="addFunction">添加函数</button>
            <button class="pill-button" type="button" @click="resetView">重置视角</button>
        </div>

        <div class="status-strip">
            <span>{{ functions.length }} 个函数对象</span>
            <i></i>
            <span>{{ Math.round(view.scale * 100) }}%</span>
            <i></i>
            <span>{{ dragLabel }}</span>
        </div>

        <transition name="panel-pop" mode="out-in">
            <aside v-if="!objectsCollapsed" class="function-panel" key="function-panel">
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
                        <label class="expression-row">
                            <span>方程</span>
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
        </aside>
        </transition>

        <transition name="capsule-pop">
            <button
                v-if="objectsCollapsed"
                class="function-panel-capsule"
            type="button"
            aria-label="展开函数对象面板"
            @click="objectsCollapsed = false"
        >
            <span class="capsule-signal"></span>
            <span>函数对象</span>
            <b>{{ functions.length }}</b>
        </button>
        </transition>

        <div class="readout" v-if="activeFunction">
            <small>LIVE</small>
            <strong>{{ activeFunction.label }}</strong>
            <span>x = {{ formatValue(probeX) }}</span>
            <b>f(x) = {{ formatValue(evaluateWorld(activeFunction, probeX)) }}</b>
        </div>
    </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from "vue"
import { useRouter } from "vue-router"
import { theme } from "../../../stores/theme.js"
import navBackIcon from "../../../assets/icons/nav-back.svg"

const router = useRouter()

// 表达式中的字母：这些是变量 / 常数 / 函数名，不作为可调参数
const RESERVED_NAMES = new Set(["x", "y", "pi", "e", "sin", "cos", "tan", "sqrt", "abs", "log", "ln", "exp"])
const canvasRef = ref(null)
const activeId = ref(1)
const objectsCollapsed = ref(true)
const probeX = ref(0)
const view = reactive({ x: 0, y: 0, scale: 58 })
const dragState = reactive({ type: "", id: 0, key: "", startX: 0, startY: 0, lastX: 0, lastY: 0 })

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
const dragLabel = computed(() => {
    if (dragState.type === "pan") return "正在平移画布"
    if (dragState.type === "function") return "正在拖动函数"
    if (dragState.type === "control") return "正在重算参数"
    return "拖动曲线或控制点"
})

const mathFunctions = {
    sin: Math.sin,
    cos: Math.cos,
    tan: Math.tan,
    sqrt: Math.sqrt,
    abs: Math.abs,
    log: Math.log10,
    ln: Math.log,
    exp: Math.exp,
}

// 从表达式提取可调参数：按出现顺序去重，排除保留名
function extractParameters(expression) {
    const normalized = normalizeExpression(expression).replace(/\s+/g, "")
    const matches = normalized.match(/[a-zA-Z]+/g) || []
    const result = []
    for (const match of matches) {
        if (!RESERVED_NAMES.has(match) && !result.includes(match)) result.push(match)
    }
    return result
}

// 表达式变化时同步参数表：保留仍存在的旧值，新参数默认 1
function updateParamKeys(fn) {
    const keys = extractParameters(fn.expression)
    const params = {}
    for (const key of keys) params[key] = key in fn.params ? fn.params[key] : 1
    fn.params = params
    fn.paramKeys = keys
}

function hasParams(fn, keys) {
    return keys.every(key => key in fn.params)
}

// 滑块范围跟随参数当前值扩展
function paramRange(value) {
    return [Math.min(0, value) - 5, Math.max(0, value) + 5]
}

const expressionCache = new Map()

// 隐式方程等值线：marching squares 的 16 种 case 索引
// （bit0=a 左上, bit1=b 右上, bit2=c 左下, bit3=d 右下），
// 值是需要连接的边编号、两两一组：E0 上边、E1 右边、E2 下边、E3 左边
const MS_CASES = [
    [], [3, 0], [0, 1], [3, 1], [3, 2], [0, 2], [0, 2], [1, 2],
    [1, 2], [0, 2], [0, 2], [3, 2], [1, 3], [0, 1], [0, 3], [],
]

let resizeObserver = null
let drawFrame = 0
let implicitWorker = null
let implicitRequestId = 0

function scheduleDraw() {
    cancelAnimationFrame(drawFrame)
    drawFrame = requestAnimationFrame(draw)
}

function createFunction(config) {
    const fn = {
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
    }
    updateParamKeys(fn)
    return fn
}

function normalizeExpression(expression) {
    return String(expression || "")
        .replace(/[²]/g, "^2")
        .replace(/[³]/g, "^3")
        .replace(/\b([xy])([23])\b/g, "$1^$2")
        .replace(/π/g, "pi")
        .replace(/\b(\d+(?:\.\d+)?)x\b/g, "$1*x")
        .replace(/\)(?=[a-zA-Z0-9])/g, ")*")
        .replace(/(\d|x|y|pi)\(/g, "$1*(")
}

function splitEquation(expression) {
    const normalized = normalizeExpression(expression).replace(/\s+/g, "")
    const separator = normalized.indexOf("=")
    if (separator < 0) return { left: "y", right: normalized }
    return { left: normalized.slice(0, separator), right: normalized.slice(separator + 1) }
}

function evaluateExpression(expression, scope) {
    const normalized = normalizeExpression(expression)
    const prepared = normalized
        .replace(/\^/g, "**")
        .replace(/\b(sin|cos|tan|sqrt|abs|log|ln|exp)\b/g, "mathFunctions.$1")
        .replace(/\bpi\b/g, "Math.PI")
        .replace(/\be\b/g, "Math.E")
    try {
        const names = Object.keys(scope)
        const cacheKey = `${prepared}|${names.join(',')}`
        let evaluator = expressionCache.get(cacheKey)
        if (!evaluator) {
            evaluator = Function("mathFunctions", ...names, `return ${prepared}`)
            expressionCache.set(cacheKey, evaluator)
        }
        return evaluator(mathFunctions, ...names.map(name => scope[name]))
    } catch {
        return NaN
    }
}

function evaluateEquation(fn, x, y) {
    const equation = splitEquation(fn.expression)
    const scope = { x: x - fn.offsetX, y: y - fn.offsetY, ...fn.params }
    const left = evaluateExpression(equation.left, scope)
    const right = evaluateExpression(equation.right, scope)
    return Number.isFinite(left) && Number.isFinite(right) ? left - right : NaN
}

function evaluateWorld(fn, worldX) {
    const equation = splitEquation(fn.expression)
    if (equation.left !== "y") return solveImplicitY(fn, worldX)
    return evaluateExpression(equation.right, { x: worldX - fn.offsetX, ...fn.params }) + fn.offsetY
}

function solveImplicitYs(fn, worldX) {
    const values = []
    let previousY = -12
    let previousValue = evaluateEquation(fn, worldX, previousY)
    for (let index = 1; index <= 144; index += 1) {
        const currentY = -12 + index * (24 / 144)
        const currentValue = evaluateEquation(fn, worldX, currentY)
        if (Number.isFinite(previousValue) && Number.isFinite(currentValue) && previousValue * currentValue <= 0) {
            const ratio = Math.abs(previousValue) / (Math.abs(previousValue) + Math.abs(currentValue) || 1)
            const root = previousY + (currentY - previousY) * ratio
            if (!values.some(value => Math.abs(value - root) < 0.12)) values.push(root)
        }
        previousY = currentY
        previousValue = currentValue
    }
    return values
}

function solveImplicitY(fn, worldX) {
    return solveImplicitYs(fn, worldX)[0] ?? NaN
}

function formatValue(value) {
    return Number.isFinite(value) ? Number(value.toFixed(3)).toString() : "未定义"
}

function worldToScreen(x, y) {
    const canvas = canvasRef.value
    const width = canvas?.clientWidth || 1
    const height = canvas?.clientHeight || 1
    return [width / 2 + (x - view.x) * view.scale, height / 2 - (y - view.y) * view.scale]
}

function screenToWorld(x, y) {
    const canvas = canvasRef.value
    const width = canvas?.clientWidth || 1
    const height = canvas?.clientHeight || 1
    return [(x - width / 2) / view.scale + view.x, (height / 2 - y) / view.scale + view.y]
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

    drawBackground(ctx, width, height)
    drawGrid(ctx, width, height)
    drawAxes(ctx, width, height)
    functions.forEach(fn => drawFunction(ctx, fn, width))
    functions.forEach(fn => drawFunctionHandles(ctx, fn))
    if (activeFunction.value) drawProbe(ctx, activeFunction.value)
}

function drawBackground(ctx, width, height) {
    const isDark = theme.value === "dark"
    const gradient = ctx.createRadialGradient(width * 0.72, height * 0.26, 0, width * 0.72, height * 0.26, Math.max(width, height) * 0.8)
    gradient.addColorStop(0, isDark ? "#1f2f4d" : "#edf4ff")
    gradient.addColorStop(0.45, isDark ? "#121820" : "#f8fbff")
    gradient.addColorStop(1, isDark ? "#0f1319" : "#f5f6f8")
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, width, height)
}

function drawGrid(ctx, width, height) {
    const [left, top] = screenToWorld(0, 0)
    const [right, bottom] = screenToWorld(width, height)
    const step = niceStep()
    const axis = worldToScreen(0, 0)
    ctx.lineWidth = 1
    ctx.strokeStyle = theme.value === "dark" ? "rgba(150, 174, 214, 0.13)" : "rgba(92, 117, 150, 0.16)"
    ctx.fillStyle = theme.value === "dark" ? "rgba(185, 199, 225, 0.62)" : "rgba(80, 100, 130, 0.68)"
    ctx.font = "11px var(--mono, monospace)"
    ctx.textAlign = "center"
    for (let x = Math.floor(left / step) * step; x <= right; x += step) {
        const [sx] = worldToScreen(x, 0)
        ctx.beginPath()
        ctx.moveTo(sx, 0)
        ctx.lineTo(sx, height)
        ctx.stroke()
        if (Math.abs(x) > step / 8) ctx.fillText(formatTick(x), sx, clamp(axis[1] + 16, 16, height - 8))
    }
    ctx.textAlign = "right"
    for (let y = Math.floor(bottom / step) * step; y <= top; y += step) {
        const [, sy] = worldToScreen(0, y)
        ctx.beginPath()
        ctx.moveTo(0, sy)
        ctx.lineTo(width, sy)
        ctx.stroke()
        if (Math.abs(y) > step / 8) ctx.fillText(formatTick(y), clamp(axis[0] - 8, 32, width - 8), sy + 4)
    }
}

function drawAxes(ctx, width, height) {
    const [axisX, axisY] = worldToScreen(0, 0)
    ctx.strokeStyle = theme.value === "dark" ? "rgba(220, 228, 246, 0.5)" : "rgba(55, 72, 96, 0.56)"
    ctx.lineWidth = 1.8
    ctx.beginPath()
    ctx.moveTo(0, axisY)
    ctx.lineTo(width, axisY)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(axisX, 0)
    ctx.lineTo(axisX, height)
    ctx.stroke()
    ctx.fillStyle = theme.value === "dark" ? "rgba(220, 228, 246, 0.78)" : "rgba(55, 72, 96, 0.78)"
    ctx.font = "700 11px var(--mono, monospace)"
    ctx.fillText("x", width - 18, axisY - 10)
    ctx.fillText("y", axisX + 12, 18)
}

function drawFunction(ctx, fn, width) {
    ctx.save()
    ctx.strokeStyle = fn.color
    ctx.lineWidth = activeId.value === fn.id ? 4 : 2.4
    ctx.shadowColor = fn.color
    ctx.shadowBlur = activeId.value === fn.id ? 16 : 6
    ctx.lineJoin = "round"
    if (splitEquation(fn.expression).left !== "y") {
        drawImplicitFunction(ctx, fn, width)
        ctx.restore()
        return
    }
    ctx.beginPath()
    let started = false
    for (let sx = -20; sx <= width + 20; sx += 2) {
        const [worldX] = screenToWorld(sx, 0)
        const worldY = evaluateWorld(fn, worldX)
        if (!Number.isFinite(worldY) || Math.abs(worldY) > 10000) {
            started = false
            continue
        }
        const [, sy] = worldToScreen(worldX, worldY)
        if (!started) {
            ctx.moveTo(sx, sy)
            started = true
        } else {
            ctx.lineTo(sx, sy)
        }
    }
    ctx.stroke()
    ctx.restore()
}

function drawImplicitFunction(ctx, fn, width) {
    const height = canvasRef.value.clientHeight
    const step = Math.max(8, Math.min(16, 13 - view.scale / 50))
    const columns = Math.ceil(width / step)
    const rows = Math.ceil(height / step)
    const values = new Float64Array((columns + 1) * (rows + 1))

    for (let row = 0; row <= rows; row += 1) {
        const sy = row * step
        const [, y] = screenToWorld(0, sy)
        for (let column = 0; column <= columns; column += 1) {
            const sx = column * step
            const [x] = screenToWorld(sx, 0)
            values[row * (columns + 1) + column] = evaluateEquation(fn, x, y)
        }
    }

    // marching squares：网格单元内用线性插值求出曲线与四边的交点，
    // 把相邻格子的小方块替换成首尾相接的连续线段
    ctx.beginPath()
    ctx.lineWidth = fn.id === activeId.value ? 2.6 : 2
    ctx.shadowBlur = 0
    for (let row = 0; row < rows; row += 1) {
        const sy = row * step
        for (let column = 0; column < columns; column += 1) {
            const sx = column * step
            const index = row * (columns + 1) + column
            const vA = values[index]
            const vB = values[index + 1]
            const vC = values[index + columns + 1]
            const vD = values[index + columns + 2]
            if (![vA, vB, vC, vD].every(Number.isFinite)) continue
            const caseIndex = (vA < 0 ? 1 : 0) | (vB < 0 ? 2 : 0) | (vC < 0 ? 4 : 0) | (vD < 0 ? 8 : 0)
            const edges = MS_CASES[caseIndex]
            for (let i = 0; i < edges.length; i += 2) {
                const p0 = edgeIntersection(edges[i], vA, vB, vC, vD, sx, sy, step)
                const p1 = edgeIntersection(edges[i + 1], vA, vB, vC, vD, sx, sy, step)
                ctx.moveTo(p0[0], p0[1])
                ctx.lineTo(p1[0], p1[1])
            }
        }
    }
    ctx.stroke()
}

// 曲线与网格单元四边的交点线性插值：E0 上边(a-b)、E1 右边(b-d)、E2 下边(c-d)、E3 左边(a-c)
function edgeIntersection(edge, vA, vB, vC, vD, sx, sy, step) {
    const ratio = (v0, v1) => {
        const denominator = v0 - v1
        if (denominator === 0) return 0.5
        return Math.max(0, Math.min(1, v0 / denominator))
    }
    if (edge === 0) return [sx + step * ratio(vA, vB), sy]
    if (edge === 1) return [sx + step, sy + step * ratio(vB, vD)]
    if (edge === 2) return [sx + step * ratio(vC, vD), sy + step]
    return [sx, sy + step * ratio(vA, vC)]
}

function drawFunctionHandles(ctx, fn) {
    const selected = activeId.value === fn.id
    const alpha = selected ? 1 : 0.38
    const center = getObjectPoint(fn)
    drawHandle(ctx, fn, center.x, center.y, selected ? "拖" : "", alpha, selected ? 10 : 6)
    if (!selected) return
    getControlPoints(fn).forEach(point => drawHandle(ctx, fn, point.x, point.y, point.label, 1, 8))
}

function drawHandle(ctx, fn, x, y, label, alpha, radius) {
    const [sx, sy] = worldToScreen(x, y)
    ctx.save()
    ctx.globalAlpha = alpha
    ctx.fillStyle = fn.color
    ctx.strokeStyle = theme.value === "dark" ? "#151b24" : "#ffffff"
    ctx.lineWidth = 2.5
    ctx.beginPath()
    ctx.arc(sx, sy, radius, 0, Math.PI * 2)
    ctx.fill()
    ctx.stroke()
    if (label) {
        ctx.fillStyle = theme.value === "dark" ? "#f6f8fc" : "#16202f"
        ctx.font = "700 11px var(--mono, monospace)"
        ctx.fillText(label, sx + radius + 7, sy - radius - 3)
    }
    ctx.restore()
}

function drawProbe(ctx, fn) {
    const y = evaluateWorld(fn, probeX.value)
    if (!Number.isFinite(y)) return
    const [sx, sy] = worldToScreen(probeX.value, y)
    const [, axisY] = worldToScreen(0, 0)
    ctx.save()
    ctx.strokeStyle = `${fn.color}88`
    ctx.lineWidth = 1.2
    ctx.setLineDash([5, 6])
    ctx.beginPath()
    ctx.moveTo(sx, axisY)
    ctx.lineTo(sx, sy)
    ctx.stroke()
    ctx.setLineDash([])
    ctx.fillStyle = fn.color
    ctx.strokeStyle = theme.value === "dark" ? "#151b24" : "#ffffff"
    ctx.lineWidth = 2.5
    ctx.beginPath()
    ctx.arc(sx, sy, 6.5, 0, Math.PI * 2)
    ctx.fill()
    ctx.stroke()
    ctx.restore()
}

function getObjectPoint(fn) {
    if (fn.kind === "parabola" && hasParams(fn, ["a", "b", "c"])) return { x: fn.offsetX + Number(fn.params.b || 0), y: fn.offsetY + Number(fn.params.c || 0) }
    if (fn.kind === "sine" && hasParams(fn, ["a", "b", "c"])) return { x: fn.offsetX, y: fn.offsetY + Number(fn.params.c || 0) }
    return { x: fn.offsetX, y: fn.offsetY }
}

function getControlPoints(fn) {
    if (fn.kind === "parabola" && hasParams(fn, ["a", "b", "c"])) {
        const b = Number(fn.params.b || 0)
        const c = Number(fn.params.c || 0)
        const a = Number(fn.params.a || 0)
        return [
            { key: "vertex", label: "顶点", x: fn.offsetX + b, y: fn.offsetY + c },
            { key: "shape", label: "开口", x: fn.offsetX + b + 1, y: fn.offsetY + a + c },
        ]
    }
    if (fn.kind === "sine" && hasParams(fn, ["a", "b", "c"])) {
        const a = Number(fn.params.a || 0)
        const c = Number(fn.params.c || 0)
        return [
            { key: "center", label: "中线", x: fn.offsetX, y: fn.offsetY + c },
            { key: "amplitude", label: "振幅", x: fn.offsetX, y: fn.offsetY + c + a },
        ]
    }
    return []
}

function niceStep() {
    const target = 90 / view.scale
    const power = 10 ** Math.floor(Math.log10(target))
    const normalized = target / power
    return (normalized < 2 ? 1 : normalized < 5 ? 2 : 5) * power
}

function formatTick(value) {
    return Number(value.toFixed(4)).toString()
}

function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value))
}

function selectFunction(id) {
    activeId.value = id
    draw()
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
    draw()
}

function removeFunction(id) {
    if (functions.length <= 1) return
    const index = functions.findIndex(fn => fn.id === id)
    if (index >= 0) functions.splice(index, 1)
    if (activeId.value === id) activeId.value = functions[0].id
    draw()
}

function hitTest(sx, sy) {
    const active = activeFunction.value
    if (active && splitEquation(active.expression).left === "y") {
        for (const point of getControlPoints(active)) {
            const [px, py] = worldToScreen(point.x, point.y)
            if (Math.hypot(sx - px, sy - py) <= 18) return { type: "control", id: active.id, key: point.key }
        }
    }

    for (let index = functions.length - 1; index >= 0; index -= 1) {
        const fn = functions[index]
        const [worldX, worldY] = screenToWorld(sx, sy)
        const curveY = evaluateWorld(fn, worldX)
        if (Number.isFinite(curveY) && Math.abs(worldY - curveY) <= 16 / view.scale) {
            return { type: "function", id: fn.id, key: "" }
        }
        const objectPoint = getObjectPoint(fn)
        const [px, py] = worldToScreen(objectPoint.x, objectPoint.y)
        if (Math.hypot(sx - px, sy - py) <= 20) return { type: "function", id: fn.id, key: "" }
    }
    return { type: "pan", id: 0, key: "" }
}

function onPointerDown(event) {
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
    if (hit.id) activeId.value = hit.id
    canvas.setPointerCapture(event.pointerId)
    draw()
}

function onPointerMove(event) {
    if (!dragState.type) return
    const dx = event.clientX - dragState.lastX
    const dy = event.clientY - dragState.lastY
    const fn = functions.find(item => item.id === dragState.id)

    if (dragState.type === "pan") {
        view.x -= dx / view.scale
        view.y += dy / view.scale
    } else if (fn && dragState.type === "function") {
        fn.offsetX += dx / view.scale
        fn.offsetY -= dy / view.scale
    } else if (fn && dragState.type === "control") {
        updateControlFromPointer(fn, dragState.key, event)
    }

    const rect = canvasRef.value.getBoundingClientRect()
    probeX.value = screenToWorld(event.clientX - rect.left, 0)[0]
    dragState.lastX = event.clientX
    dragState.lastY = event.clientY
    draw()
}

function updateControlFromPointer(fn, key, event) {
    if (splitEquation(fn.expression).left !== "y") return
    const rect = canvasRef.value.getBoundingClientRect()
    const [wx, wy] = screenToWorld(event.clientX - rect.left, event.clientY - rect.top)
    if (fn.kind === "parabola") {
        if (key === "vertex") {
            fn.params.b = wx - fn.offsetX
            fn.params.c = wy - fn.offsetY
        }
        if (key === "shape") fn.params.a = wy - fn.offsetY - Number(fn.params.c || 0)
        return
    }
    if (key === "center") fn.params.c = wy - fn.offsetY
    if (key === "amplitude") fn.params.a = wy - fn.offsetY - Number(fn.params.c || 0)
}

function onPointerUp() {
    dragState.type = ""
    dragState.id = 0
    dragState.key = ""
}

function onWheel(event) {
    const rect = canvasRef.value.getBoundingClientRect()
    const sx = event.clientX - rect.left
    const sy = event.clientY - rect.top
    const [beforeX, beforeY] = screenToWorld(sx, sy)
    view.scale = clamp(view.scale * (event.deltaY < 0 ? 1.12 : 1 / 1.12), 24, 190)
    const [afterX, afterY] = screenToWorld(sx, sy)
    view.x += beforeX - afterX
    view.y += beforeY - afterY
    draw()
}

function resetView() {
    view.x = 0
    view.y = 0
    view.scale = 58
    draw()
}

function resizeCanvas() {
    const canvas = canvasRef.value
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const dpr = window.devicePixelRatio || 1
    canvas.width = Math.floor(rect.width * dpr)
    canvas.height = Math.floor(rect.height * dpr)
    draw()
}

watch(functions, scheduleDraw, { deep: true })
watch(theme, scheduleDraw)

// 表达式变化时重新提取参数，并保留仍存在的旧参数值
watch(
    () => functions.map(fn => fn.expression),
    () => {
        functions.forEach(updateParamKeys)
        scheduleDraw()
    },
)

onMounted(async () => {
    await nextTick()
    resizeCanvas()
    resizeObserver = new ResizeObserver(resizeCanvas)
    resizeObserver.observe(canvasRef.value)
})

onBeforeUnmount(() => {
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

.top-toolbar {
    position: absolute;
    top: 14px;
    left: 14px;
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

.top-toolbar > i,
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

.toolbar-title {
    display: grid;
    gap: 2px;
    padding-right: 4px;
}

.toolbar-title small,
.panel-heading small,
.readout small {
    color: var(--primary);
    font-family: var(--mono);
    font-size: 9px;
    letter-spacing: 0.12em;
}

.toolbar-title strong {
    color: var(--text);
    font-size: 13px;
    line-height: 1;
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

.panel-pop-enter-active,
.panel-pop-leave-active,
.capsule-pop-enter-active,
.capsule-pop-leave-active {
    transition: opacity 0.24s ease, transform 0.28s var(--ease-out, ease-out);
}

.panel-pop-enter-from,
.panel-pop-leave-to {
    opacity: 0;
    transform: translateX(28px) scale(0.97);
}

.capsule-pop-enter-from,
.capsule-pop-leave-to {
    opacity: 0;
    transform: translateX(18px) scale(0.86);
}

.function-panel-capsule {
    position: absolute;
    top: 14px;
    right: 14px;
    z-index: 5;
    min-height: 46px;
    display: inline-flex;
    align-items: center;
    gap: 9px;
    padding: 0 15px;
    border: 1px solid color-mix(in srgb, var(--border) 76%, transparent);
    border-radius: 999px;
    background: color-mix(in srgb, var(--bg-card) 88%, transparent);
    box-shadow: 0 14px 42px rgba(15, 23, 32, 0.18);
    color: var(--text);
    font-size: 12px;
    font-weight: 800;
    backdrop-filter: blur(18px);
    -webkit-backdrop-filter: blur(18px);
}

.function-panel-capsule:hover {
    border-color: var(--primary);
    color: var(--primary);
    transform: translateY(-1px);
}

.capsule-signal {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--primary);
    box-shadow: 0 0 0 5px var(--primary-light);
}

.function-panel-capsule b {
    min-width: 20px;
    padding: 3px 6px;
    border-radius: 999px;
    background: var(--primary-light);
    color: var(--primary);
    font-family: var(--mono);
    font-size: 10px;
}

.function-panel {
    position: absolute;
    top: 14px;
    right: 14px;
    bottom: 14px;
    z-index: 5;
    width: min(360px, calc(100vw - 28px));
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
    left: 22px;
    bottom: 70px;
    z-index: 4;
    min-width: 190px;
    display: grid;
    gap: 5px;
    padding: 13px 15px;
    border: 1px solid color-mix(in srgb, var(--border) 74%, transparent);
    border-radius: 14px;
    background: color-mix(in srgb, var(--bg-card) 82%, transparent);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
}

.readout strong {
    color: var(--text);
    font-size: 13px;
}

.readout span,
.readout b {
    font-family: var(--mono);
    font-size: 12px;
}

.readout span {
    color: var(--text-secondary);
}

.readout b {
    color: var(--primary);
}

@media (max-width: 820px) {
    .function-panel-capsule {
        top: auto;
        right: 14px;
        bottom: 14px;
    }

    .top-toolbar {
        right: 14px;
        max-width: calc(100vw - 28px);
        overflow-x: auto;
        border-radius: 18px;
    }

    .function-panel {
        top: auto;
        right: 8px;
        bottom: 8px;
        left: 8px;
        width: auto;
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

    .toolbar-title {
        display: none;
    }

    .pill-button {
        min-width: max-content;
    }
}
</style>
