<template>
    <div class="function-lab">
        <canvas
            ref="canvasRef"
            :class="{ 'geo-active': toolMode !== 'drag' }"
            @pointerdown="onPointerDown"
            @pointermove="onPointerMove"
            @pointerup="onPointerUp"
            @pointercancel="onPointerUp"
            @wheel.prevent="onWheel"
            @dblclick="onCanvasDblClick"
        ></canvas>

        <!-- 几何点标签编辑输入框 -->
        <input
            v-if="editingPointId !== null"
            v-model="editLabelText"
            class="geo-label-editor"
            :style="geoEditorStyle"
            @keydown.enter="commitGeoLabel"
            @keydown.esc="cancelGeoLabel"
            @blur="commitGeoLabel"
        />

        <div class="bottom-toolbar">
            <button class="icon-button" type="button" title="返回数学实验室" @click="router.push('/math-lab')">
                <img :src="navBackIcon" alt="" />
            </button>
            <div class="toolbar-row toolbar-row--actions">
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
                <button
                    class="pill-button pill-danger"
                    type="button"
                    title="清空画布，回到默认图形"
                    @click="resetScene"
                >重置画布</button>
                <div class="preset-wrap">
                    <button class="pill-button" type="button" @click="saveMenuOpen = !saveMenuOpen">保存 ▾</button>
                    <transition name="panel-pop">
                        <div v-if="saveMenuOpen" class="preset-menu save-menu">
                            <div class="save-hint">改动会自动存档到本机，可手动恢复或导出分享</div>
                            <button class="preset-item" type="button" @click="restoreAutosave">恢复上次图形</button>
                            <div class="preset-divider"></div>
                            <button class="preset-item" type="button" @click="exportScene">导出图形（下载文件）</button>
                            <button class="preset-item" type="button" @click="openImportPicker">导入图形（选择文件）</button>
                        </div>
                    </transition>
                    <input
                        ref="importInputRef"
                        type="file"
                        accept=".json,application/json"
                        class="import-file-input"
                        @change="importSceneFile"
                    />
                </div>
            </div>
            <div class="toolbar-row toolbar-row--modes">
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
                    <button
                        class="pill-button"
                        :class="{ 'has-mode': intersectMode !== 'off' }"
                        type="button"
                        @click="intersectMenuOpen = !intersectMenuOpen"
                    >
                        <span v-if="intersectMode !== 'off'" class="mode-dot mode-dot--intersect"></span>
                        交叉 · {{ intersectModeLabel }} ▾
                    </button>
                    <transition name="panel-pop">
                        <div v-if="intersectMenuOpen" class="preset-menu intersect-menu">
                            <button
                                class="preset-item"
                                type="button"
                                :class="{ active: intersectMode === 'off' }"
                                @click="intersectMode = 'off'; intersectMenuOpen = false; scheduleDraw()"
                            >不交叉</button>
                            <button
                                class="preset-item"
                                type="button"
                                :class="{ active: intersectMode === 'all' }"
                                @click="intersectMode = 'all'; intersectMenuOpen = false; scheduleDraw()"
                            >全交叉</button>
                            <button
                                class="preset-item"
                                type="button"
                                :class="{ active: intersectMode === 'partial' }"
                                @click="intersectMode = 'partial'; intersectMenuOpen = false; scheduleDraw()"
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
                <i></i>
                <div class="preset-wrap">
                    <button
                        class="pill-button"
                        :class="{ 'has-mode': toolMode !== 'drag' }"
                        type="button"
                        @click="geoMenuOpen = !geoMenuOpen"
                    >
                        <span v-if="toolMode !== 'drag'" class="mode-dot mode-dot--geo"></span>
                        几何 · {{ toolModeLabel }} ▾
                    </button>
                    <transition name="panel-pop">
                        <div v-if="geoMenuOpen" class="preset-menu geo-menu">
                            <button
                                class="preset-item"
                                type="button"
                                :class="{ active: toolMode === 'drag' }"
                                @click="setToolMode('drag')"
                            >拖动</button>
                            <button
                                class="preset-item"
                                type="button"
                                :class="{ active: toolMode === 'point' }"
                                @click="setToolMode('point')"
                            >选点</button>
                            <button
                                class="preset-item"
                                type="button"
                                :class="{ active: toolMode === 'line' }"
                                @click="setToolMode('line')"
                            >连线</button>
                            <div class="intersect-list">
                                <button class="preset-item" type="button" @click="clearGeometry">清空几何</button>
                            </div>
                        </div>
                    </transition>
                </div>
            </div>
        </div>

        <div class="status-strip">
            <span>{{ functions.length }} 个函数对象</span>
            <i></i>
            <span>{{ Math.round(view.scale * 100) }}%</span>
            <i></i>
            <span>{{ dragLabel }}</span>
        </div>

        <div class="top-actions">
        <div class="help-wrap">
            <button class="help-toggle" type="button" @click="helpOpen = !helpOpen" :aria-expanded="helpOpen">使用介绍</button>
            <transition name="panel-pop">
                <div v-if="helpOpen" class="help-card">
                    <button class="help-close" type="button" aria-label="关闭使用介绍" @click="helpOpen = false">×</button>
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

                    <section>
                        <h4>几何工具（点 / 线 / 动点）</h4>
                        <p>底部"几何"菜单切换工具：<b>选点</b>在画布点一下放一个点，<b>连线</b>依次点两个点连成线，<b>拖动</b>拖动点改变图形</p>
                        <p>拖动点靠近函数曲线会自动吸附到曲线上，之后沿曲线滑动；拖远即可脱离（隐式方程暂不支持轨道）</p>
                        <p>点自动编号 <code>A、B、C...</code>，<b>双击标签</b>可改成任意名字</p>
                        <p>开启"吸附"时，放点/拖点会吸附到细刻度，方便对齐</p>
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

        <ConfirmDialog ref="confirmDialogRef" />
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
import ConfirmDialog from "../../../components/ConfirmDialog.vue"

const router = useRouter()
const confirmDialogRef = ref(null) // 自定义确认弹窗
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
const isNarrow = ref(false) // 窄屏断点：手机端双击改缩放、桌面双击还原视图

// 多点触控捏合：跟踪活动指针，两指时以中点为锚缩放 + 跟随中点平移
const activePointers = new Map() // pointerId -> { x, y }（屏幕坐标）
let pinchStart = null // 双指起始基准 { dist, midX, midY, scale }
const helpOpen = ref(false) // 左下角"使用介绍"说明卡展开状态
const intersectMode = ref("off") // off | all | partial：函数交叉模式
const intersectIds = ref([]) // 部分交叉时勾选的函数 id 集合
const intersectMenuOpen = ref(false) // 交叉菜单展开状态
const hoverScreen = ref(null) // 鼠标屏幕坐标，供交点悬停
const snapEnabled = ref(true) // 拖动函数时是否吸附到细粒度刻度
const toolMode = ref("drag") // drag | point | line：几何工具模式
const geoPoints = ref([]) // [{id, x, y}] 用户放的点（世界坐标）
const geoSegments = ref([]) // [{from, to}] 用户连线（存点 id）
const lineStartId = ref(null) // 连线模式当前起点点 id
const geoMenuOpen = ref(false) // 几何菜单展开状态
const saveMenuOpen = ref(false) // 保存菜单展开状态
const importInputRef = ref(null) // 隐藏的图形文件选择框
const toolModeLabel = computed(() => ({ drag: "拖动", point: "选点", line: "连线" })[toolMode.value] || "几何")
const intersectModeLabel = computed(() => ({ off: "不交叉", all: "全交叉", partial: "部分交叉" })[intersectMode.value] || "交叉")
let geoNextId = 1
const editingPointId = ref(null) // 正在编辑标签的几何点 id
const editLabelText = ref("") // 编辑输入框文本
const geoEditorStyle = ref({}) // 编辑输入框定位样式

// 默认初始画布：两个示例函数的纯配置，首次进入与"重置画布"共用
const defaultFunctionConfigs = [
    { id: 1, label: "抛物线对象", expression: "a * (x - b)^2 + c", color: "#477cdb", offsetX: -2, offsetY: 0.4, params: { a: 0.42, b: 0, c: -1.2 }, kind: "parabola", mode: "explicit" },
    { id: 2, label: "正弦波对象", expression: "a * sin(b * x) + c", color: "#e8bd6a", offsetX: 2.4, offsetY: -0.2, params: { a: 1.1, b: 1, c: 0 }, kind: "sine", mode: "explicit" },
]

const functions = reactive(defaultFunctionConfigs.map(config => createFunction(config)))

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
    // 解绑吸附到该函数的几何点，避免悬空引用：点变回自由点，留在原位
    for (const point of geoPoints.value) {
        if (point.track === id) point.track = null
    }
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
    // 几何点优先：用户放的点可拖/可连线（函数交叉交点是计算产物，不在 geoPoints，天然不可拖）
    for (let index = geoPoints.value.length - 1; index >= 0; index -= 1) {
        const point = geoPoints.value[index]
        const [px, py] = worldToScreen(point.x, point.y, view, canvasWidth.value, canvasHeight.value)
        if (Math.hypot(sx - px, sy - py) <= 10) return { type: "geopoint", id: point.id, key: "" }
    }
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
    geoMenuOpen.value = false
    saveMenuOpen.value = false

    // 捏合只对触摸生效：鼠标/触控笔按下时先清掉可能残留的指针，
    // 避免残留指针把鼠标误判成"第二根手指"，导致整个画布点选/拖动失效
    if (event.pointerType !== "touch") {
        activePointers.clear()
        pinchStart = null
    } else {
        // 记录活动指针；第二根手指落下 → 进入捏合缩放，取消当前单指拖动
        activePointers.set(event.pointerId, { x: event.clientX, y: event.clientY })
        if (activePointers.size === 2) {
            dragState.type = ""
            dragState.id = 0
            dragState.key = ""
            const [p1, p2] = [...activePointers.values()]
            pinchStart = {
                dist: Math.hypot(p1.x - p2.x, p1.y - p2.y),
                midX: (p1.x + p2.x) / 2,
                midY: (p1.y + p2.y) / 2,
                scale: view.scale,
            }
            canvasRef.value?.setPointerCapture(event.pointerId)
            return
        }
        if (activePointers.size > 2) {
            pinchStart = null
            return
        }
    }

    const canvas = canvasRef.value
    const rect = canvas.getBoundingClientRect()
    const sx = event.clientX - rect.left
    const sy = event.clientY - rect.top
    const hit = hitTest(sx, sy)

    // 选点工具：只在空白处放新点；命中函数/几何点则落回下方拖动逻辑
    if (toolMode.value === "point" && hit.type === "pan") {
        placeGeoPoint(sx, sy)
        canvas.setPointerCapture(event.pointerId)
        scheduleDraw()
        return
    }

    // 连线工具：点几何点，起点→目标连线段，目标变新起点（持续连线）；其余落回拖动逻辑
    if (toolMode.value === "line") {
        if (hit.type === "geopoint") {
            const targetId = hit.id
            if (lineStartId.value === null) {
                lineStartId.value = targetId
            } else if (lineStartId.value !== targetId) {
                geoSegments.value.push({ from: lineStartId.value, to: targetId })
                lineStartId.value = targetId
            }
            canvas.setPointerCapture(event.pointerId)
            scheduleDraw()
            return
        }
        // 非几何点：落回下方函数拖动/平移逻辑
    }

    // 拖动工具（默认）：命中几何点 → 拖动；否则落回函数/平移
    if (hit.type === "geopoint") {
        const point = geoPoints.value.find(item => item.id === hit.id)
        dragState.type = "geopoint"
        dragState.id = hit.id
        dragState.key = ""
        dragState.startX = event.clientX
        dragState.startY = event.clientY
        dragState.lastX = event.clientX
        dragState.lastY = event.clientY
        dragState.startOX = point.x
        dragState.startOY = point.y
        canvas.setPointerCapture(event.pointerId)
        scheduleDraw()
        return
    }

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

// 在屏幕坐标处放一个几何点（世界坐标 + 吸附 + 自动编号标签）
function placeGeoPoint(sx, sy) {
    let [worldX, worldY] = screenToWorld(sx, sy, view, canvasWidth.value, canvasHeight.value)
    if (snapEnabled.value) {
        const step = snapStep(view.scale)
        worldX = Math.round(worldX / step) * step
        worldY = Math.round(worldY / step) * step
    }
    geoPoints.value.push({ id: geoNextId, x: worldX, y: worldY, track: null, label: nextGeoLabel() })
    geoNextId += 1
}

// 自动编号标签：A、B、C... 超出 Z 后接 A1、B1...
function nextGeoLabel() {
    const used = new Set(geoPoints.value.map(point => point.label))
    let index = 0
    while (true) {
        const letter = String.fromCharCode(65 + (index % 26))
        const suffix = index >= 26 ? Math.floor(index / 26) : ""
        const candidate = `${letter}${suffix}`
        if (!used.has(candidate)) return candidate
        index += 1
    }
}

// 找离世界坐标最近的显式函数曲线；足够近返回 { fn, y }，否则 null
function snapTrack(worldX, worldY) {
    let best = null
    let bestDist = Infinity
    for (const fn of functions) {
        if (compileEquation(fn).left !== "y") continue // 只支持显式函数轨道
        const y = evaluateWorld(fn, worldX)
        if (!Number.isFinite(y)) continue
        const dist = Math.abs(worldY - y)
        if (dist < bestDist) {
            bestDist = dist
            best = { fn, y }
        }
    }
    const threshold = 16 / view.scale // 屏幕约 16px 内触发吸附
    return bestDist < threshold ? best : null
}

// 切换几何工具：换工具时清空连线起点，并收起下拉抽屉
function setToolMode(mode) {
    toolMode.value = mode
    lineStartId.value = null
    geoMenuOpen.value = false
    scheduleDraw()
}

function clearGeometry() {
    geoPoints.value = []
    geoSegments.value = []
    lineStartId.value = null
    geoMenuOpen.value = false
    scheduleDraw()
}

// ---- 场景持久化：自动保存本机 + 导出/导入文件分享 ----

const SCENE_KEY = "koole.functionlab.scene.v1" // localStorage 键；version 升版时换键避免解析旧结构
let saveTimer = 0

// 画布完整状态 → 可 JSON 化的纯对象（函数不含运行期缓存字段，mode 由 expression 推导）
function serializeScene() {
    return {
        version: 1,
        view: { x: view.x, y: view.y, scale: view.scale },
        functions: functions.map(fn => ({
            id: fn.id,
            label: fn.label,
            expression: fn.expression,
            color: fn.color,
            offsetX: fn.offsetX,
            offsetY: fn.offsetY,
            params: { ...fn.params },
            kind: fn.kind,
            collapsed: fn.collapsed,
        })),
        geoPoints: geoPoints.value.map(point => ({ ...point })),
        geoSegments: geoSegments.value.map(segment => ({ ...segment })),
        intersectMode: intersectMode.value,
        intersectIds: [...intersectIds.value],
        snapEnabled: snapEnabled.value,
        toolMode: toolMode.value,
    }
}

// 从序列化状态恢复画布：重建函数与几何对象，更新计数器与选中态
function restoreScene(state) {
    if (!state || state.version !== 1 || !Array.isArray(state.functions) || state.functions.length === 0) return
    functions.splice(0, functions.length, ...state.functions.map(fn => createFunction(fn)))
    Object.assign(view, state.view)
    geoPoints.value = state.geoPoints.map(point => ({ ...point }))
    geoSegments.value = state.geoSegments.map(segment => ({ ...segment }))
    intersectMode.value = state.intersectMode || "off"
    intersectIds.value = [...(state.intersectIds || [])]
    snapEnabled.value = state.snapEnabled ?? true
    toolMode.value = state.toolMode || "drag"
    lineStartId.value = null
    geoNextId = geoPoints.value.reduce((max, point) => Math.max(max, point.id), 0) + 1
    activeId.value = functions[0].id
    hasSelection.value = false
    saveMenuOpen.value = false
    scheduleDraw()
}

// 重置画布到默认初始图形，并清空本机自动存档；自定义弹窗确认后才执行，避免误触丢图
async function resetScene() {
    const confirmed = await confirmDialogRef.value?.show("当前图形会被默认初始图形替换。", "重置画布", "重置")
    if (!confirmed) return
    functions.splice(0, functions.length, ...defaultFunctionConfigs.map(config => createFunction(config)))
    Object.assign(view, { x: 0, y: 0, scale: 58 })
    geoPoints.value = []
    geoSegments.value = []
    lineStartId.value = null
    intersectMode.value = "off"
    intersectIds.value = []
    snapEnabled.value = true
    toolMode.value = "drag"
    activeId.value = functions[0].id
    hasSelection.value = false
    geoNextId = 1
    try {
        localStorage.removeItem(SCENE_KEY)
    } catch {
        // 存储不可用时忽略
    }
    saveMenuOpen.value = false
    scheduleDraw()
}

// 主动从本机存档恢复上次图形：覆盖当前画布前用自定义弹窗确认，避免误触丢图
async function restoreAutosave() {
    try {
        const raw = localStorage.getItem(SCENE_KEY)
        if (!raw) {
            await confirmDialogRef.value?.show("本机还没有保存过的图形，先去画布上搭一个吧。", "暂无存档", "知道了", false)
            return
        }
        const state = JSON.parse(raw)
        if (!state || state.version !== 1) {
            await confirmDialogRef.value?.show("本机存档无法识别，可能是旧版本留下的。", "恢复失败", "知道了", false)
            return
        }
        const confirmed = await confirmDialogRef.value?.show("当前画布会被替换为上次保存的图形。", "恢复上次图形", "恢复")
        if (!confirmed) return
        restoreScene(state)
    } catch {
        console.error("恢复失败：本机存档无法解析")
    }
}

// 防抖写入 localStorage：拖动函数/几何点时 watch 高频触发，只在停止后落盘一次
function persistScene() {
    clearTimeout(saveTimer)
    saveTimer = setTimeout(() => {
        try {
            localStorage.setItem(SCENE_KEY, JSON.stringify(serializeScene()))
        } catch {
            // 存储不可用（隐私模式/容量满）时静默跳过，不影响使用
        }
    }, 600)
}

// 导出图形为可分享的 .koole.json 文件
function exportScene() {
    const blob = new Blob([JSON.stringify(serializeScene(), null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement("a")
    anchor.href = url
    anchor.download = `koole-函数图形-${new Date().toISOString().slice(0, 10)}.koole.json`
    anchor.click()
    URL.revokeObjectURL(url)
    saveMenuOpen.value = false
}

function openImportPicker() {
    importInputRef.value?.click()
}

// 读取导入文件并恢复画布；文件格式错误时提示且不动当前画布
function importSceneFile(event) {
    const file = event.target.files?.[0]
    event.target.value = ""
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
        try {
            const state = JSON.parse(String(reader.result))
            restoreScene(state)
        } catch {
            console.error("导入失败：图形文件格式不正确")
        }
    }
    reader.readAsText(file)
    saveMenuOpen.value = false
}

// 任何画布状态变化（函数/几何点/交叉/视角/工具）都会触发自动保存
watch(
    () => serializeScene(),
    () => persistScene(),
    { deep: true }
)

// 双击画布：命中几何点 → 编辑标签；否则重置视图
function onCanvasDblClick(event) {
    const rect = canvasRef.value.getBoundingClientRect()
    const sx = event.clientX - rect.left
    const sy = event.clientY - rect.top
    const hit = hitTest(sx, sy)
    if (hit.type === "geopoint") {
        const point = geoPoints.value.find(item => item.id === hit.id)
        if (point) {
            const [px, py] = worldToScreen(point.x, point.y, view, canvasWidth.value, canvasHeight.value)
            editingPointId.value = point.id
            editLabelText.value = point.label || ""
            geoEditorStyle.value = { left: `${px + 10}px`, top: `${py - 34}px` }
        }
        return
    }
    // 窄屏（手机/平板）双击：已放大则还原视图，否则以点击处为中心放大两倍，代替滚轮缩放；
    // 桌面双击保持原语义：还原视图
    if (isNarrow.value) {
        if (view.scale >= 116) resetView()
        else zoomAt(sx, sy, 2)
        return
    }
    resetView()
}

function commitGeoLabel() {
    if (editingPointId.value !== null) {
        const point = geoPoints.value.find(item => item.id === editingPointId.value)
        if (point) {
            const label = editLabelText.value.trim()
            point.label = label || null
        }
        cancelGeoLabel()
    }
}

function cancelGeoLabel() {
    editingPointId.value = null
    editLabelText.value = ""
    scheduleDraw()
}

function onPointerMove(event) {
    const rect = canvasRef.value.getBoundingClientRect()
    const sx = event.clientX - rect.left
    const sy = event.clientY - rect.top

    const pointer = activePointers.get(event.pointerId)
    if (pointer) {
        pointer.x = event.clientX
        pointer.y = event.clientY
    }

    // 双指捏合：以两指中点为锚缩放，并跟随中点移动平移画布（增量法）；只对触摸生效，鼠标移动不会被吞
    if (event.pointerType === "touch" && pinchStart && activePointers.size === 2) {
        const [p1, p2] = [...activePointers.values()]
        const dist = Math.hypot(p1.x - p2.x, p1.y - p2.y)
        const midX = (p1.x + p2.x) / 2
        const midY = (p1.y + p2.y) / 2
        const midSX = midX - rect.left
        const midSY = midY - rect.top
        // 锚定缩放：保持中点的世界坐标不动
        const [beforeX, beforeY] = screenToWorld(midSX, midSY, view, canvasWidth.value, canvasHeight.value)
        view.scale = clamp(pinchStart.scale * (dist / pinchStart.dist), 24, 320)
        const [afterX, afterY] = screenToWorld(midSX, midSY, view, canvasWidth.value, canvasHeight.value)
        view.x += beforeX - afterX
        view.y += beforeY - afterY
        // 跟随中点位移平移
        const dx = midX - pinchStart.midX
        const dy = midY - pinchStart.midY
        view.x -= dx / view.scale
        view.y += dy / view.scale
        pinchStart.midX = midX
        pinchStart.midY = midY
        // 缩放期间走草稿精度，停止后恢复
        zoomActive.value = true
        clearTimeout(zoomTimer)
        zoomTimer = setTimeout(() => {
            zoomActive.value = false
            scheduleDraw()
        }, 150)
        scheduleDraw()
        return
    }

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
    } else if (dragState.type === "geopoint") {
        const point = geoPoints.value.find(item => item.id === dragState.id)
        if (point) {
            const worldX = dragState.startOX + (event.clientX - dragState.startX) / view.scale
            const worldY = dragState.startOY - (event.clientY - dragState.startY) / view.scale
            // 已吸附轨道：沿曲线走（y 由函数算，x 自由滑动）
            if (point.track !== null) {
                const trackFn = functions.find(item => item.id === point.track)
                if (trackFn) {
                    const trackY = evaluateWorld(trackFn, worldX)
                    // 鼠标离轨道过远 → 脱离轨道，恢复自由拖动
                    const detachDist = 30 / view.scale
                    if (Math.abs(worldY - trackY) > detachDist) {
                        point.track = null
                    } else if (Number.isFinite(trackY)) {
                        point.x = worldX
                        point.y = trackY
                    } else {
                        point.x = worldX
                        point.y = worldY
                    }
                }
            }
            // 未吸附轨道：尝试吸附最近的显式函数轨道
            if (point.track === null) {
                const snap = snapTrack(worldX, worldY)
                if (snap) {
                    point.track = snap.fn.id
                    point.x = worldX
                    point.y = snap.y
                } else if (snapEnabled.value) {
                    const step = snapStep(view.scale)
                    point.x = Math.round(worldX / step) * step
                    point.y = Math.round(worldY / step) * step
                } else {
                    point.x = worldX
                    point.y = worldY
                }
            }
        }
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

function onPointerUp(event) {
    activePointers.delete(event.pointerId)
    // 仍有两根手指：以剩余两指重新初始化捏合基准；不足两根则退出捏合
    if (activePointers.size >= 2) {
        const [p1, p2] = [...activePointers.values()]
        pinchStart = {
            dist: Math.hypot(p1.x - p2.x, p1.y - p2.y),
            midX: (p1.x + p2.x) / 2,
            midY: (p1.y + p2.y) / 2,
            scale: view.scale,
        }
    } else {
        pinchStart = null
        // 所有指针都已抬起：彻底清空残留，避免幽灵指针把后续鼠标点按误判成双指
        activePointers.clear()
    }
    if (activePointers.size <= 1) {
        dragState.type = ""
        dragState.id = 0
        dragState.key = ""
    }
    scheduleDraw()
}

function onWheel(event) {
    const rect = canvasRef.value.getBoundingClientRect()
    const sx = event.clientX - rect.left
    const sy = event.clientY - rect.top
    zoomAt(sx, sy, event.deltaY < 0 ? 1.06 : 1 / 1.06)
}

// 以屏幕点 (sx, sy) 为锚缩放视图；缩放期间用草稿精度采样，停止 150ms 后恢复
function zoomAt(sx, sy, factor) {
    const [beforeX, beforeY] = screenToWorld(sx, sy, view, canvasWidth.value, canvasHeight.value)
    view.scale = clamp(view.scale * factor, 24, 320)
    const [afterX, afterY] = screenToWorld(sx, sy, view, canvasWidth.value, canvasHeight.value)
    view.x += beforeX - afterX
    view.y += beforeY - afterY
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
        geoPoints: geoPoints.value,
        geoSegments: geoSegments.value,
        lineStartId: lineStartId.value,
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
    const narrowQuery = window.matchMedia("(max-width: 900px)")
    isNarrow.value = narrowQuery.matches
    narrowQuery.addEventListener?.("change", onNarrowChange)
})

onBeforeUnmount(() => {
    clearTimeout(zoomTimer)
    resizeObserver?.disconnect()
    window.matchMedia("(max-width: 900px)").removeEventListener?.("change", onNarrowChange)
})

function onNarrowChange(event) {
    isNarrow.value = event.matches
}
</script>

<style scoped>
.function-lab {
    /* 覆盖全局物理红为主题学科蓝：函数画布隶属数学实验室，统一使用数学蓝 */
    --primary: #477cdb;
    --primary-dark: #3a63a8;
    --primary-hover: #5f8fd6;

    position: relative;
    width: 100%;
    height: calc(100vh - var(--nav-height));
    margin: -32px 0;
    overflow: hidden;
    background: var(--bg);
}

/* 深色下用更亮的蓝，与浅色主题层次一致 */
:root[data-theme="dark"] .function-lab {
    --primary: #6f9be8;
    --primary-dark: #477cdb;
    --primary-hover: #8fc8ff;
}

.function-lab canvas {
    width: 100%;
    height: 100%;
    display: block;
    cursor: grab;
    touch-action: none;
}

.function-lab canvas.geo-active {
    cursor: crosshair;
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

.bottom-toolbar .toolbar-row > i,
.status-strip > i {
    width: 1px;
    height: 24px;
    background: var(--border);
}

/* 工具条内部行：桌面与单行排列一致，窄屏拆两行 */
.toolbar-row {
    display: flex;
    align-items: center;
    gap: 10px;
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
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
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

/* 危险操作按钮：重置画布这类不可逆操作用红色文字提示 */
.pill-button.pill-danger {
    color: var(--primary);
    border-color: color-mix(in srgb, var(--primary) 45%, var(--border));
}

.pill-button.pill-danger:hover {
    color: var(--primary-hover, var(--primary));
}

/* 下拉按钮当前模式色点：交叉用交点金、几何用青色，非默认态按钮淡色底高亮 */
.mode-dot {
    width: 8px;
    height: 8px;
    flex: none;
    border-radius: 50%;
}

.mode-dot--intersect {
    background: #f6c94a;
    box-shadow: 0 0 8px rgba(246, 201, 74, 0.55);
}

.mode-dot--geo {
    background: #4cc9f0;
    box-shadow: 0 0 8px rgba(76, 201, 240, 0.55);
}

.pill-button.has-mode {
    border-color: color-mix(in srgb, var(--primary) 50%, transparent);
    background: color-mix(in srgb, var(--primary) 12%, transparent);
    color: var(--text);
}

.preset-wrap {
    position: relative;
}

.preset-menu {
    position: absolute;
    bottom: calc(100% + 8px);
    left: 50%;
    transform: translateX(-50%);
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

/* 保存菜单：顶部提示行 + 隐藏的文件选择框 */
.save-menu {
    min-width: 210px;
}

.save-hint {
    padding: 6px 12px 8px;
    color: var(--text-muted);
    font-size: 11px;
    line-height: 1.5;
}

.import-file-input {
    display: none;
}

/* 保存菜单分隔线与危险操作项 */
.preset-divider {
    height: 1px;
    margin: 4px 8px;
    background: var(--border);
}

.preset-item.preset-danger {
    color: var(--primary);
}

.preset-item.preset-danger:hover {
    background: color-mix(in srgb, var(--primary) 12%, transparent);
    color: var(--primary-hover, var(--primary));
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

.geo-label-editor {
    position: absolute;
    z-index: 6;
    width: 60px;
    height: 26px;
    padding: 0 8px;
    border: 2px solid var(--primary);
    border-radius: 8px;
    background: var(--bg-card);
    color: var(--text);
    font-family: var(--mono);
    font-size: 13px;
    font-weight: 700;
    outline: none;
}

.geo-label-editor:focus {
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--primary) 18%, transparent);
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

/* 使用介绍卡右上角关闭按钮：卡片占满时也能一键收起 */
.help-close {
    position: absolute;
    top: 10px;
    right: 10px;
    z-index: 1;
    width: 26px;
    height: 26px;
    display: grid;
    place-items: center;
    border: 1px solid var(--border);
    border-radius: 50%;
    background: var(--bg-card);
    color: var(--text-muted);
    font-size: 15px;
    line-height: 1;
    cursor: pointer;
}

.help-close:hover {
    border-color: var(--primary);
    color: var(--primary);
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
    background: #fff;
    color: var(--primary);
    font-family: var(--mono);
    font-size: 10px;
    font-weight: 700;
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
    border: 1px solid var(--primary);
    border-radius: 999px;
    background: var(--primary);
    color: #fff;
    font-size: 12px;
    font-weight: 700;
    box-shadow: 0 6px 20px color-mix(in srgb, var(--primary) 40%, transparent);
    backdrop-filter: blur(14px);
    -webkit-backdrop-filter: blur(14px);
    cursor: pointer;
    transition: background 0.2s, box-shadow 0.2s, transform 0.2s;
}

.objects-toggle:hover {
    border-color: color-mix(in srgb, var(--primary) 82%, #000);
    background: color-mix(in srgb, var(--primary) 82%, #000);
    color: #fff;
    box-shadow: 0 8px 26px color-mix(in srgb, var(--primary) 52%, transparent);
    transform: translateY(-1px);
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
    /* 底部工具条拆两行：第一行 返回+添加/重置/保存，第二行 吸附/交叉/几何，整体居中 */
    .bottom-toolbar {
        left: 50%;
        right: auto;
        transform: translateX(-50%);
        width: max-content;
        max-width: calc(100vw - 16px);
        flex-wrap: wrap;
        justify-content: center;
        gap: 6px;
        row-gap: 8px;
        overflow-x: visible;
        border-radius: 18px;
        padding: 8px 6px;
    }

    .toolbar-row {
        flex-wrap: wrap;
        justify-content: center;
        gap: 6px;
    }

    .toolbar-row--modes {
        flex-basis: 100%;
        border-top: 1px solid color-mix(in srgb, var(--border) 65%, transparent);
        padding-top: 7px;
    }

    /* 下拉菜单在胶囊按钮正上方居中弹出：不盖住底部工具栏，中心对齐按钮 */
    .preset-menu {
        z-index: 30;
        min-width: min(220px, calc(100vw - 16px));
        max-width: calc(100vw - 16px);
        max-height: 55vh;
        overflow-y: auto;
        border-radius: 16px;
    }

    /* 保存/交叉菜单继承 preset-menu 的最小宽度，窄屏下保持一致，不再单独收窄 */

    .pill-button {
        min-height: 34px;
        padding: 0 10px;
        font-size: 11px;
    }

    /* 函数对象面板：从右上角按钮向下展开，避免盖住顶部读数区 */
    .function-panel {
        top: calc(100% + 8px);
        right: 0;
        bottom: auto;
        left: auto;
        width: min(320px, calc(100vw - 28px));
        max-height: 42vh;
    }

    /* 读数面板改为顶部居中横条（不再隐藏），位于右上角动作组下方，LIVE 读数在手机上可用 */
    .readout {
        top: 54px;
        left: 50%;
        right: auto;
        transform: translateX(-50%);
        min-width: 0;
        width: max-content;
        max-width: calc(100vw - 16px);
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 8px;
        padding: 8px 12px;
        border-radius: 12px;
    }

    .readout small {
        max-width: 130px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .probe-mode button {
        flex: none;
        min-height: 24px;
        padding: 0 9px;
    }

    .probe-x {
        flex: none;
    }

    .probe-x input {
        width: 66px;
        height: 28px;
    }

    .readout b {
        white-space: nowrap;
        font-size: 13px;
    }

    .status-strip {
        display: none;
    }

    /* 使用介绍 + 函数对象收拢到右上角横排；其内弹出卡相对本容器定位 */
    .top-actions {
        position: absolute;
        top: 10px;
        right: 12px;
        z-index: 6;
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .help-wrap,
    .objects-wrap {
        position: static;
        z-index: auto;
    }

    /* 使用介绍卡：从"使用介绍"按钮正下方向下展开，右缘贴屏幕右边缘，避免横向溢出 */
    .help-card {
        position: absolute;
        top: calc(100% + 8px);
        left: auto;
        right: 0;
        bottom: auto;
        margin: 0;
        z-index: 20;
        width: min(340px, calc(100vw - 24px));
        max-height: 60vh;
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
