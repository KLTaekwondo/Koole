<template>
    <div class="geometry-lab">
        <!-- 沉浸式 3D 场景画布：铺满导航栏以下视口，不再局限于容器 -->
        <div ref="sceneHostRef" class="scene-host"></div>

        <!-- 左上角：毛玻璃返回胶囊 + 小标题 -->
        <div class="top-nav">
            <router-link to="/math-lab" class="back-pill" aria-label="返回数学实验室">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
                <span>返回数学实验室</span>
            </router-link>
            <div class="top-title">
                <small>SOLID GEOMETRY / 立体几何</small>
                <h1>旋转它，从不同角度看立体</h1>
            </div>
        </div>

        <!-- 右上角操作组：自动旋转 + 圆锥展开（仅圆锥模型显示展开按钮） -->
        <div class="top-actions">
            <button class="auto-rotate" :class="{ on: autoRotate }" type="button" @click="toggleAutoRotate">
                <i></i>{{ autoRotate ? '自动旋转开' : '自动旋转关' }}
            </button>
            <button v-if="activeModel.kind === 'cone'" class="unfold-btn" :class="{ on: coneUnfold }" type="button" @click="toggleUnfold">
                {{ coneUnfold ? '收起侧面' : '展开侧面' }}
            </button>
        </div>

        <!-- 弧盘选择器：fixed 嵌在浏览器左缘、垂直居中，不随页面滚动 -->
        <ArcPicker
            class="geo-picker"
            aria-label="选择几何体"
            :options="geometryPickerOptions"
            :model-value="activeModelId"
            :size="pickerSize"
            :track-width="pickerTrack"
            :title="{ en: 'SOLID GEOMETRY', zh: '立体几何' }"
            title-vertical
            index-hint
            accent="#477cdb"
            @update:model-value="onPickModel"
        />

        <!-- 底部中央：面上动点面积胶囊工具条（模式切换 + 清除 + 说明） -->
        <div class="area-toolbar">
            <span class="area-toolbar-title">面上动点面积</span>
            <div class="area-modes">
                <button type="button" :class="{ active: areaMode === 'off' }" @click="areaMode = 'off'">浏览</button>
                <button type="button" :class="{ active: areaMode === 'create' }" @click="areaMode = 'create'"><span class="full">加顶点</span><span class="short">加点</span></button>
                <button type="button" :class="{ active: areaMode === 'drag' }" @click="areaMode = 'drag'"><span class="full">拖顶点</span><span class="short">拖点</span></button>
                <button type="button" :class="{ active: areaMode === 'remove' }" @click="areaMode = 'remove'"><span class="full">删顶点</span><span class="short">删点</span></button>
            </div>
            <button class="unfold-btn" type="button" @click="clearArea"><span class="full">清除顶点</span><span class="short">清除</span></button>
            <button class="help-btn" :class="{ on: helpOpen }" type="button" @click="helpOpen = !helpOpen" aria-label="使用说明">?</button>
            <Transition name="card">
                <div v-if="helpOpen" class="help-pop">
                    <div class="help-title">面上动点面积 · 使用说明</div>
                    <ul class="help-list">
                        <li><b>浏览</b>：拖拽旋转、滚轮缩放，点保持不动</li>
                        <li><b>加顶点</b>：点几何体表面加一个顶点；点几个不同面，围成空间多边形看面积变化</li>
                        <li><b>拖顶点</b>：按住顶点拖动改变形状；点表面不会误加点</li>
                        <li><b>删顶点</b>：点某个顶点小球删除它，不用整片清除</li>
                        <li><b>清除顶点</b>：一键清空所有顶点，重新开始</li>
                    </ul>
                    <p class="help-note">点在所属面内移动，不会越出该面；面积只做视觉展示，不显示数值。</p>
                </div>
            </Transition>
        </div>

        <!-- 底部中央操作提示 -->
        <div class="viewport-hint">
            <template v-if="areaMode === 'create'">点表面加顶点 · 拖顶点改变形状</template>
            <template v-else-if="areaMode === 'drag'">拖顶点改变形状 · 点表面不会加点</template>
            <template v-else-if="areaMode === 'remove'">点顶点球删除该点 · 点表面无操作</template>
            <template v-else>拖拽旋转 · 滚轮缩放</template>
        </div>

        <!-- 右下角知识卡片：收起为胶囊（带当前模型名），点击展开 -->
        <div class="knowledge-card" :class="{ open: knowledgeOpen }">
            <Transition name="card">
                <div v-if="knowledgeOpen" class="knowledge-panel">
                <div class="info-heading">
                    <span class="category-chip">{{ activeModel.category }}</span>
                    <h2>{{ activeModel.name }}</h2>
                    <button class="knowledge-close" type="button" @click="knowledgeOpen = false" aria-label="关闭知识卡">✕</button>
                </div>

                <template v-if="activeModel.counts">
                    <div class="counts">
                        <div><span>顶点 V</span><b>{{ activeModel.counts.v }}</b></div>
                        <div><span>棱 E</span><b>{{ activeModel.counts.e }}</b></div>
                        <div><span>面 F</span><b>{{ activeModel.counts.f }}</b></div>
                    </div>
                    <p class="euler">欧拉公式验证：V − E + F = {{ eulerResult }}</p>
                </template>
                <p v-else class="curved-note">由曲面围成，没有棱和顶点</p>

                <div class="formula-grid">
                    <div class="formula-card">
                        <small>体积</small>
                        <code>{{ activeModel.formula.volume }}</code>
                        <strong>{{ activeModel.example.volume }}<span> 单位³</span></strong>
                        <em>{{ activeModel.example.note }}</em>
                    </div>
                    <div class="formula-card">
                        <small>表面积</small>
                        <code>{{ activeModel.formula.surface }}</code>
                        <strong>{{ activeModel.example.surface }}<span> 单位²</span></strong>
                        <em>{{ activeModel.example.note }}</em>
                    </div>
                </div>

                <p v-if="activeModel.variables" class="formula-vars">其中：{{ activeModel.variables }}</p>

                <div class="knowledge">
                    <MdPreview
                        :modelValue="activeModel.knowledge"
                        :theme="theme"
                        previewTheme="stackoverflow"
                        codeTheme="stackoverflow"
                        :noKatex="false"
                        style="background: transparent;"
                    />
                </div>

                <!-- 动手实践提示：把"侧面展开"落到手上，独立样式块 -->
                <div v-if="activeModel.tryIt" class="try-it">
                    <span class="try-it-icon">✂️</span>
                    <div>
                        <b>动手试试</b>
                        <p>{{ activeModel.tryIt }}</p>
                    </div>
                </div>
            </div>
            </Transition>
            <button class="knowledge-trigger" type="button" @click="knowledgeOpen = !knowledgeOpen" :aria-expanded="knowledgeOpen">
                <span>📖 {{ activeModel.name }}</span>
                <svg class="chev" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
            </button>
        </div>
    </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue"
import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"
import { CSS2DRenderer, CSS2DObject } from "three/examples/jsm/renderers/CSS2DRenderer.js"
import { MdPreview } from "md-editor-v3"
import "md-editor-v3/lib/preview.css"
import { theme } from "../../../stores/theme.js"
import ArcPicker from "../../../components/ArcPicker.vue"
import { GEOMETRY_MODELS } from "../../../Logic/math/geometryModels.js"
import { buildGeometry, applyGeometryTheme, disposeGeometry, setConeUnfold } from "../../../Logic/math/geometryBuilder.js"

const sceneHostRef = ref(null)
const activeModelId = ref(GEOMETRY_MODELS[0].id)
const autoRotate = ref(true)
const knowledgeOpen = ref(false) // 右下知识卡片：默认收起为胶囊
const areaMode = ref("create") // "表面选点面积"模式：off 浏览 / create 加顶点 / drag 拖顶点 / remove 删顶点（互斥，拖动不误触加点）
const helpOpen = ref(false) // 右上角"?"帮助气泡：面积功能使用说明
const coneUnfold = ref(false) // 圆锥侧面展开状态（按钮切换）
let unfoldData = null // 当前圆锥的可展开数据（来自 buildGeometry，非 cone 时为 null）
let unfoldT = 0 // 当前展开程度
let unfoldTarget = 0 // 目标展开程度（0=闭合锥体，1=完全展开）
let unfoldLabels = [] // 圆锥展开标注（母线 l、弧长=底面周长）的 CSS2D 对象

// 弧盘尺寸：窄屏缩小，避免遮挡；轨道宽随尺寸适配，保证 3 字选项放得下
const isNarrow = ref(false)
const narrowMq = window.matchMedia("(max-width: 900px)")
function updateNarrow() {
    isNarrow.value = narrowMq.matches
}
updateNarrow()
narrowMq.addEventListener?.("change", updateNarrow)
const pickerSize = computed(() => (isNarrow.value ? 280 : 400))
const pickerTrack = computed(() => (isNarrow.value ? 50 : 72))

const activeModel = computed(() => GEOMETRY_MODELS.find(model => model.id === activeModelId.value))
const eulerResult = computed(() => {
    const counts = activeModel.value.counts
    return counts ? counts.v - counts.e + counts.f : null
})

// 弧盘选择器：几何体列表 → { label, value }
const geometryPickerOptions = computed(() =>
    GEOMETRY_MODELS.map(model => ({ label: model.name, value: model.id })),
)

function onPickModel(id) {
    const model = GEOMETRY_MODELS.find(item => item.id === id)
    if (model) selectModel(model)
}

let renderer = null
let scene = null
let camera = null
let controls = null
let css2dRenderer = null
let modelGroup = null
let labelLayer = null
let resizeObserver = null
let animationId = 0
let reducedMotion = false

// 正方体"表面自选点面积"：点一下任意面加顶点，顶点围成多边形，拖顶点看面积变化（纯视觉）
let areaPoint = null // cube 时的多边形数据（见 buildAreaPoint）
let areaPts = [] // 选中的顶点 { pos: Vector3, n: Vector3 }，n 为该点吸附的面法线，顺序即多边形顶点顺序
let areaSpheres = [] // 对应的小球 mesh，与 areaPts 一一对应
let draggingArea = false // 是否正在拖动顶点
let draggingAreaIndex = -1 // 正在拖动的顶点下标
const areaRaycaster = new THREE.Raycaster()
const areaNdc = new THREE.Vector2()
// 各模型的面顶点状态（内存级 Map）：切模型时保存、切回来恢复；刷新页面后丢失
const areaStateByModel = new Map()

function initScene() {
    const host = sceneHostRef.value
    if (!host) return

    reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (reducedMotion) autoRotate.value = false
    scene = new THREE.Scene()
    camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100)
    camera.position.set(0, 0, 6)

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: "high-performance" })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
    renderer.outputColorSpace = THREE.SRGBColorSpace
    host.appendChild(renderer.domElement)

    // CSS2D 顶点字母标签层（覆盖在 WebGL 之上，不拦截交互）
    css2dRenderer = new CSS2DRenderer()
    css2dRenderer.domElement.style.position = "absolute"
    css2dRenderer.domElement.style.top = "0"
    css2dRenderer.domElement.style.left = "0"
    css2dRenderer.domElement.style.pointerEvents = "none"
    host.appendChild(css2dRenderer.domElement)

    controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.08
    controls.autoRotate = autoRotate.value
    controls.autoRotateSpeed = 1.6
    // 用户拖拽后自动暂停自动旋转（可手动恢复）
    controls.addEventListener("start", () => {
        if (autoRotate.value) toggleAutoRotate()
    })

    // 正方体面上动点拖动：capture 阶段先于 OrbitControls 处理，命中小球才拦截
    renderer.domElement.addEventListener("pointerdown", onAreaPointerDown, true)
    renderer.domElement.addEventListener("pointermove", onAreaPointerMove)
    renderer.domElement.addEventListener("pointerup", onAreaPointerUp)
    renderer.domElement.addEventListener("click", onAreaClick)

    labelLayer = new THREE.Group()
    scene.add(labelLayer)

    scene.add(new THREE.HemisphereLight(0xffffff, 0x6c777c, 2.2))
    const warmLight = new THREE.PointLight(0xffb066, 12, 18)
    warmLight.position.set(3.2, 2.2, 4)
    scene.add(warmLight)
    const coolLight = new THREE.PointLight(0x8fc8ff, 9, 16)
    coolLight.position.set(-3, -1.5, 3)
    scene.add(coolLight)

    applySceneTheme()
    resizeObserver = new ResizeObserver(resizeScene)
    resizeObserver.observe(host)
    resizeScene()
    setModel(activeModel.value)
    animateScene()
}

function setModel(model) {
    if (modelGroup) {
        scene.remove(modelGroup)
        disposeGeometry(modelGroup)
        modelGroup = null
    }
    clearLabels()

    // 切模型时若正在拖顶点，先松开，避免 controls 被锁死
    if (draggingArea) {
        draggingArea = false
        if (controls) controls.enabled = true
    }
    areaPoint = null
    areaPts = []
    areaSpheres = []
    draggingAreaIndex = -1

    const { group, vertices, unfold } = buildGeometry(model.kind, theme.value === "dark")
    modelGroup = group
    scene.add(group)

    // 圆锥展开数据：切换模型时重置到闭合态（非 cone 为 null，动画分支自然跳过）
    unfoldData = unfold
    unfoldT = 0
    unfoldTarget = 0
    coneUnfold.value = false
    // 圆锥展开标注：母线 l + 底面周长公式，随展开动画定位；非圆锥无标注
    unfoldLabels = []
    if (unfold) {
        for (const text of ["母线 l", "底面周长 2πr\n= (x/360)·2πl\nx：扇形圆心角(°)"]) {
            const div = document.createElement("div")
            div.className = "unfold-label"
            div.textContent = text
            const obj = new CSS2DObject(div)
            obj.visible = false
            labelLayer.add(obj)
            unfoldLabels.push(obj)
        }
    }

    // 顶点字母标签：CSS2D 跟随顶点位置
    for (const { pos, label } of vertices) {
        const div = document.createElement("div")
        div.className = "vertex-label"
        div.textContent = label
        const labelObject = new CSS2DObject(div)
        labelObject.position.copy(pos)
        labelLayer.add(labelObject)
    }

    // 面上自选点面积：所有几何体都构建（平面几何体完整支持；圆柱/圆锥的底面圆盘、球的曲面同样可选点）
    areaPoint = buildAreaPoint()
    modelGroup.add(areaPoint.group)
    // 恢复该模型保存过的顶点（切回来不丢）；无记录且是正方体 → 初始示例；其余空白自选
    const savedArea = areaStateByModel.get(model.id)
    if (savedArea && savedArea.length) {
        areaPts = deserializeAreaState(savedArea)
        rebuildArea()
    } else if (model.kind === "cube") {
        const fn = new THREE.Vector3(0, 0, 1) // 前脸法线（BoxGeometry 的 +z 面朝外）
        const makePt = (x, y, z) => makeAreaPt({ point: new THREE.Vector3(x, y, z), face: { normal: fn } })
        areaPts = [
            makePt(-0.5, -0.4, 0.8),
            makePt(0.55, -0.5, 0.8),
            makePt(0.5, 0.45, 0.8),
            makePt(-0.45, 0.35, 0.8),
        ]
        rebuildArea()
    }

    fitCamera()
}

function clearLabels() {
    while (labelLayer.children.length) {
        const child = labelLayer.children[0]
        labelLayer.remove(child)
        child.element?.remove?.()
    }
}

// 按模型包围球调整相机距离，保证完整可见
function fitCamera() {
    const box = new THREE.Box3().setFromObject(modelGroup)
    const sphere = box.getBoundingSphere(new THREE.Sphere())
    camera.position.set(0, 0, Math.max(sphere.radius * 2.8, 3))
    controls.target.set(0, 0, 0)
    controls.minDistance = Math.max(sphere.radius * 1.2, 1.5)
    controls.maxDistance = sphere.radius * 8
    controls.update()
}

function resizeScene() {
    const host = sceneHostRef.value
    if (!host || !renderer || !camera || !css2dRenderer) return
    const width = Math.max(host.clientWidth, 1)
    const height = Math.max(host.clientHeight, 1)
    renderer.setSize(width, height, false)
    css2dRenderer.setSize(width, height)
    camera.aspect = width / height
    camera.updateProjectionMatrix()
}

function applySceneTheme() {
    if (!renderer || !scene) return
    const isDark = theme.value === "dark"
    renderer.setClearColor(isDark ? 0x10141b : 0xf2f4f8, 1)
    if (modelGroup) applyGeometryTheme(modelGroup, isDark)
}

function animateScene() {
    animationId = requestAnimationFrame(animateScene)
    // 圆锥展开/收起缓动：t 逼近目标后定格，并重新取景容纳展开图
    if (unfoldData && unfoldT !== unfoldTarget) {
        unfoldT += (unfoldTarget - unfoldT) * 0.1
        const reached = Math.abs(unfoldT - unfoldTarget) < 0.002
        if (reached) unfoldT = unfoldTarget
        setConeUnfold(unfoldData, unfoldT)
        // 标注跟随展开锚点，展开到一定程度才显示、收起即隐
        const showLabels = unfoldT > 0.15
        for (let i = 0; i < unfoldLabels.length; i++) {
            const pos = i === 0 ? unfoldData.anchors.genMid : unfoldData.anchors.arcMid
            unfoldLabels[i].position.copy(pos)
            unfoldLabels[i].visible = showLabels
        }
        if (reached) fitCamera()
    }
    controls.update()
    renderer.render(scene, camera)
    css2dRenderer.render(scene, camera)
}

function disposeScene() {
    cancelAnimationFrame(animationId)
    renderer?.domElement.removeEventListener("pointerdown", onAreaPointerDown, true)
    renderer?.domElement.removeEventListener("pointermove", onAreaPointerMove)
    renderer?.domElement.removeEventListener("pointerup", onAreaPointerUp)
    renderer?.domElement.removeEventListener("click", onAreaClick)
    draggingArea = false
    draggingAreaIndex = -1
    areaPoint = null
    areaSpheres = []
    resizeObserver?.disconnect()
    controls?.dispose()
    if (modelGroup) {
        scene.remove(modelGroup)
        disposeGeometry(modelGroup)
    }
    renderer?.dispose()
    renderer?.domElement.remove()
    css2dRenderer?.domElement.remove()
    renderer = null
    scene = null
    camera = null
    controls = null
    modelGroup = null
    unfoldData = null
    unfoldLabels = []
}

function selectModel(model) {
    // 保存当前模型的面顶点状态（内存级），切回来时恢复
    if (areaPoint) areaStateByModel.set(activeModelId.value, serializeAreaState())
    activeModelId.value = model.id
    setModel(model)
}

function toggleAutoRotate() {
    autoRotate.value = !autoRotate.value
    if (controls) controls.autoRotate = autoRotate.value
}

function toggleUnfold() {
    if (!unfoldData) return
    coneUnfold.value = !coneUnfold.value
    unfoldTarget = coneUnfold.value ? 1 : 0
}

// ========== 正方体"表面自选点面积"：点一下任意面加顶点，围成多边形，拖顶点看面积变化 ==========
const AREA_MAX_POINTS = 10 // 顶点上限，防拖放失控
const AREA_FACE_HALF = 0.8 // 正方体半边长：仅 cube 初始示例点（手工构造、无 mesh）用方形回退约束

// 面顶点序列化：Vector3（pos/n/center/u/v）转 plain，poly 本就是 {x,y} 数组，随 Map 存内存
function serializeAreaState() {
    return areaPts.map(pt => ({
        pos: { x: pt.pos.x, y: pt.pos.y, z: pt.pos.z },
        n: { x: pt.n.x, y: pt.n.y, z: pt.n.z },
        center: { x: pt.center.x, y: pt.center.y, z: pt.center.z },
        u: { x: pt.u.x, y: pt.u.y, z: pt.u.z },
        v: { x: pt.v.x, y: pt.v.y, z: pt.v.z },
        poly: pt.poly,
    }))
}
// 恢复：plain 重建 Vector3，poly 直接复用（约束逻辑只读 .x/.y）
function deserializeAreaState(saved) {
    return saved.map(s => ({
        pos: new THREE.Vector3(s.pos.x, s.pos.y, s.pos.z),
        n: new THREE.Vector3(s.n.x, s.n.y, s.n.z),
        center: new THREE.Vector3(s.center.x, s.center.y, s.center.z),
        u: new THREE.Vector3(s.u.x, s.u.y, s.u.z),
        v: new THREE.Vector3(s.v.x, s.v.y, s.v.z),
        poly: s.poly,
    }))
}

function buildAreaPoint() {
    const group = new THREE.Group()

    // 多边形半透明填充：顶点≥3 才可见，随顶点实时重算（三角剖分）
    const fillGeo = new THREE.BufferGeometry()
    const fillMat = new THREE.MeshBasicMaterial({
        color: 0x477cdb,
        transparent: true,
        opacity: 0.3,
        side: THREE.DoubleSide,
        depthWrite: false,
        // 点贴在几何体表面上，polygonOffset 让填充浮在面上，避免 z-fighting 闪烁
        polygonOffset: true,
        polygonOffsetFactor: -1,
        polygonOffsetUnits: -1,
    })
    const fill = new THREE.Mesh(fillGeo, fillMat)
    group.add(fill)

    // 多边形边线：按顶点顺序连线，首尾闭合
    const edgeGeo = new THREE.BufferGeometry()
    const edgeMat = new THREE.LineBasicMaterial({ color: 0x3d6fc7, transparent: true, opacity: 0.95 })
    group.add(new THREE.LineLoop(edgeGeo, edgeMat))

    return { group, fill, fillGeo, edgeGeo }
}

// 为命中面构造顶点数据：位置 + 法线 + 面内约束基准（中心、正交基、所属面凸多边形），拖动时不越过该面
// 真实射线命中（带 mesh）→ 提取所属面轮廓做约束；手工构造的示例点（无 mesh）→ 用方形回退
function makeAreaPt(hit) {
    const n = hit.face.normal.clone()
    const bound = hit.object ? extractFacePolygon(hit) : fallbackSquareBound(n)
    const pos = hit.point.clone().addScaledVector(n, 0.02) // 沿法线微微抬出，防 z-fighting
    return { pos, n, center: bound.center, u: bound.u, v: bound.v, poly: bound.poly }
}

// 手工示例点的面内约束回退：以法线方向半边长处为面中心的正方形（正方体初始四边形用）
function fallbackSquareBound(n) {
    const axis = Math.abs(n.x) < 0.9 ? new THREE.Vector3(1, 0, 0) : new THREE.Vector3(0, 1, 0)
    const u = new THREE.Vector3().crossVectors(n, axis).normalize()
    const v = new THREE.Vector3().crossVectors(n, u).normalize()
    const center = n.clone().multiplyScalar(AREA_FACE_HALF)
    const poly = [
        { x: -AREA_FACE_HALF, y: -AREA_FACE_HALF },
        { x: AREA_FACE_HALF, y: -AREA_FACE_HALF },
        { x: AREA_FACE_HALF, y: AREA_FACE_HALF },
        { x: -AREA_FACE_HALF, y: AREA_FACE_HALF },
    ]
    return { center, u, v, poly }
}

// 提取命中三角形所属的整个平面（凸多边形轮廓），作为该点拖动时的面内边界。
// 原理：扫描几何体所有三角形，法线平行且质心在同一平面即属于同一面，收集顶点去重后按角度排序。
// 对棱柱/棱锥/旋转体底面（正多边形）都成立；球/曲面侧面的相邻三角形不共面，会得到很小轮廓，约束很紧但不越面。
function extractFacePolygon(hit) {
    const geo = hit.object.geometry
    const pos = geo.getAttribute("position")
    const index = geo.getIndex()
    const triCount = index ? index.count / 3 : pos.count / 3
    const n = hit.face.normal.clone()
    // 命中三角形第一个顶点作为面参考点
    const i0 = index ? index.getX(hit.faceIndex * 3) : hit.faceIndex * 3
    const ref = new THREE.Vector3(pos.getX(i0), pos.getY(i0), pos.getZ(i0))
    const getVert = (i) => new THREE.Vector3(pos.getX(i), pos.getY(i), pos.getZ(i))

    const pts = []
    const seen = new Set()
    const EPS = 1e-3
    for (let t = 0; t < triCount; t++) {
        const a = index ? index.getX(t * 3) : t * 3
        const b = index ? index.getX(t * 3 + 1) : t * 3 + 1
        const c = index ? index.getX(t * 3 + 2) : t * 3 + 2
        const va = getVert(a)
        const vb = getVert(b)
        const vc = getVert(c)
        // 三角形法线与命中面法线平行（同向或反向都算，只关心共面）
        const tn = new THREE.Vector3().crossVectors(vb.clone().sub(va), vc.clone().sub(va)).normalize()
        if (Math.abs(tn.dot(n)) < 0.99) continue
        // 质心到参考点所在平面距离足够小 → 共面
        const cen = va.clone().add(vb).add(vc).multiplyScalar(1 / 3)
        if (Math.abs(cen.clone().sub(ref).dot(n)) > EPS) continue
        for (const vert of [va, vb, vc]) {
            const key = `${vert.x.toFixed(4)},${vert.y.toFixed(4)},${vert.z.toFixed(4)}`
            if (!seen.has(key)) {
                seen.add(key)
                pts.push(vert)
            }
        }
    }

    // 面内正交基 u/v + 几何中心，顶点投影成 2D 凸多边形并绕法线逆时针排序
    const axis = Math.abs(n.x) < 0.9 ? new THREE.Vector3(1, 0, 0) : new THREE.Vector3(0, 1, 0)
    const u = new THREE.Vector3().crossVectors(n, axis).normalize()
    const v = new THREE.Vector3().crossVectors(n, u).normalize()
    const center = new THREE.Vector3()
    pts.forEach(p => center.add(p))
    center.multiplyScalar(1 / Math.max(pts.length, 1))
    const poly = pts
        .map(p => {
            const d = p.clone().sub(center)
            return { x: d.dot(u), y: d.dot(v) }
        })
        .sort((p, q) => Math.atan2(p.y, p.x) - Math.atan2(q.y, q.x))

    return { center, u, v, poly }
}

// 把 (x, y) 约束到逆时针凸多边形 poly 内：在内部原样返回；
// 在外部返回离它最近的边上的最近点（遍历每条边取线段最近点最小值）
function clampToPolygon2d(x, y, poly) {
    let inside = true
    let bx = x
    let by = y
    let bd = Infinity
    for (let i = 0; i < poly.length; i++) {
        const a = poly[i]
        const b = poly[(i + 1) % poly.length]
        const ex = b.x - a.x
        const ey = b.y - a.y
        // 逆时针凸多边形：点在每条边左侧（叉积 ≥ 0）才算在内部
        if (ex * (y - a.y) - ey * (x - a.x) < 0) inside = false
        // 点到线段最近点
        const len2 = ex * ex + ey * ey
        const t = len2 ? Math.max(0, Math.min(1, ((x - a.x) * ex + (y - a.y) * ey) / len2)) : 0
        const px = a.x + ex * t
        const py = a.y + ey * t
        const d = (x - px) * (x - px) + (y - py) * (y - py)
        if (d < bd) {
            bd = d
            bx = px
            by = py
        }
    }
    return inside ? { x, y } : { x: bx, y: by }
}

// 根据 areaPts 同步小球、边线、填充（顶点增删/拖动后都调它）
function rebuildArea() {
    if (!areaPoint) return
    const n = areaPts.length

    // 小球与顶点一一对应：多了删、少了建
    while (areaSpheres.length > n) {
        const s = areaSpheres.pop()
        areaPoint.group.remove(s)
        s.geometry.dispose()
        s.material.dispose()
    }
    while (areaSpheres.length < n) {
        const s = new THREE.Mesh(
            new THREE.SphereGeometry(0.09, 18, 14),
            new THREE.MeshStandardMaterial({
                color: 0xe8bd6a,
                emissive: 0x8a6d1a,
                emissiveIntensity: 0.8,
                roughness: 0.35,
                metalness: 0.15,
            }),
        )
        areaPoint.group.add(s)
        areaSpheres.push(s)
    }
    areaSpheres.forEach((s, i) => s.position.copy(areaPts[i].pos))

    // 边线：顶点顺序连成闭合折线（顶点数没变则复用 buffer，拖动时零分配）
    if (areaPoint.edgeGeo.getAttribute("position")?.count !== n) {
        areaPoint.edgeGeo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(n * 3), 3))
    }
    const ep = areaPoint.edgeGeo.attributes.position.array
    areaPts.forEach((pt, i) => {
        ep[i * 3] = pt.pos.x
        ep[i * 3 + 1] = pt.pos.y
        ep[i * 3 + 2] = pt.pos.z
    })
    areaPoint.edgeGeo.attributes.position.needsUpdate = true

    // 填充：顶点≥3 时三角剖分。
    // 先投影到平均法线平面决定"哪几个点连成三角形"（earcut，支持凹多边形），
    // 再取真实 3D 位置填充——点跨面时也能连出一个空间多边形，拖动面积照常变化。
    if (n >= 3) {
        // 平均法线 → 建立局部正交基，把点投到 2D 做三角剖分
        const nAvg = new THREE.Vector3()
        areaPts.forEach(pt => nAvg.add(pt.n))
        nAvg.normalize()
        const axis = Math.abs(nAvg.x) < 0.9 ? new THREE.Vector3(1, 0, 0) : new THREE.Vector3(0, 1, 0)
        const u = new THREE.Vector3().crossVectors(nAvg, axis).normalize()
        const v = new THREE.Vector3().crossVectors(nAvg, u).normalize()
        const tris = THREE.ShapeUtils.triangulateShape(
            areaPts.map(pt => new THREE.Vector2(pt.pos.dot(u), pt.pos.dot(v))),
            [],
        )
        if (tris.length) {
            const triCount = tris.length * 3
            if (areaPoint.fillGeo.getAttribute("position")?.count !== triCount) {
                areaPoint.fillGeo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(triCount * 3), 3))
            }
            const tp = areaPoint.fillGeo.attributes.position.array
            tris.forEach((idx, ti) => {
                for (let k = 0; k < 3; k++) {
                    const p = areaPts[idx[k]].pos
                    tp[ti * 9 + k * 3] = p.x
                    tp[ti * 9 + k * 3 + 1] = p.y
                    tp[ti * 9 + k * 3 + 2] = p.z
                }
            })
            areaPoint.fillGeo.attributes.position.needsUpdate = true
            areaPoint.fill.visible = true
        } else {
            areaPoint.fill.visible = false
        }
    } else {
        areaPoint.fill.visible = false
    }
}

// 清空所有顶点，回到自选起点
function clearArea() {
    areaPts = []
    draggingAreaIndex = -1
    rebuildArea()
}

// 删除指定顶点（删顶点模式轻点小球触发）：splice 后 rebuildArea 自动补齐小球/边线/填充
function removeAreaPoint(index) {
    if (index < 0 || index >= areaPts.length) return
    areaPts.splice(index, 1)
    if (draggingAreaIndex === index) draggingAreaIndex = -1
    else if (draggingAreaIndex > index) draggingAreaIndex -= 1
    rebuildArea()
}

// 射线命中几何体表面（只认 face 网格），返回命中信息供加点；点可以加到任意面上
function pickFace(e) {
    const rect = renderer.domElement.getBoundingClientRect()
    areaNdc.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
    areaNdc.y = -((e.clientY - rect.top) / rect.height) * 2 + 1
    areaRaycaster.setFromCamera(areaNdc, camera)
    const hits = areaRaycaster.intersectObjects(modelGroup.children, true)
    for (const h of hits) {
        if (h.object.userData?.geometryTag === "face") return h
    }
    return null
}

// 射线与"过 pt.center、法线 pt.n"的平面求交，并把交点约束到该面范围内（点不出这个面）
function planePointAt(e, pt) {
    const rect = renderer.domElement.getBoundingClientRect()
    areaNdc.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
    areaNdc.y = -((e.clientY - rect.top) / rect.height) * 2 + 1
    areaRaycaster.setFromCamera(areaNdc, camera)
    const ray = areaRaycaster.ray
    const denom = ray.direction.dot(pt.n)
    if (Math.abs(denom) < 1e-6) return null // 视线与面平行
    const t = pt.center.clone().sub(ray.origin).dot(pt.n) / denom
    if (t <= 0) return null
    const hit = ray.origin.clone().addScaledVector(ray.direction, t)
    // 相对面中心分解到 u/v，约束到所属面凸多边形内，再映射回 3D——点就锁在所属面内
    const d = hit.clone().sub(pt.center)
    const clamped = clampToPolygon2d(d.dot(pt.u), d.dot(pt.v), pt.poly)
    return pt.center.clone().addScaledVector(pt.u, clamped.x).addScaledVector(pt.v, clamped.y)
}

// 命中顶点小球则返回其下标，否则 -1（决定"拖顶点"还是"转相机/加点"）
function pickAreaPoint(e) {
    const rect = renderer.domElement.getBoundingClientRect()
    areaNdc.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
    areaNdc.y = -((e.clientY - rect.top) / rect.height) * 2 + 1
    areaRaycaster.setFromCamera(areaNdc, camera)
    const hits = areaRaycaster.intersectObjects(areaSpheres)
    if (!hits.length) return -1
    return areaSpheres.indexOf(hits[0].object)
}

// 轻点几何体表面 → 在该面加一个顶点（吸附到命中面，沿法线微微抬出防 z-fighting）；
// 删顶点模式轻点顶点球 → 删除该点
function onAreaClick(e) {
    if (!areaPoint || !renderer || !camera) return
    if (areaMode.value === "remove") {
        const idx = pickAreaPoint(e)
        if (idx >= 0) removeAreaPoint(idx)
        return
    }
    if (areaMode.value !== "create" || areaPts.length >= AREA_MAX_POINTS) return
    if (pickAreaPoint(e) >= 0) return // 点在小球上算拖动，不加点
    const hit = pickFace(e)
    if (!hit) return
    areaPts.push(makeAreaPt(hit))
    rebuildArea()
}

// 按住顶点 → 拖动它（capture 阶段拦截，OrbitControls 不参与）
function onAreaPointerDown(e) {
    if (!areaPoint || areaMode.value === "off" || areaMode.value === "remove" || !renderer || !camera) return
    const idx = pickAreaPoint(e)
    if (idx < 0) return // 没命中顶点 → 交给 OrbitControls 旋转
    draggingArea = true
    draggingAreaIndex = idx
    if (controls) controls.enabled = false
    renderer.domElement.setPointerCapture?.(e.pointerId)
    e.preventDefault()
    e.stopImmediatePropagation()
}

function onAreaPointerMove(e) {
    if (!draggingArea || draggingAreaIndex < 0) return
    const pt = areaPts[draggingAreaIndex]
    const next = planePointAt(e, pt)
    if (next) {
        pt.pos.copy(next)
        rebuildArea()
    }
}

function onAreaPointerUp() {
    if (!draggingArea) return
    draggingArea = false
    draggingAreaIndex = -1
    if (controls) controls.enabled = true
}

watch(theme, applySceneTheme)

onMounted(() => {
    initScene()
})

onBeforeUnmount(() => {
    disposeScene()
    narrowMq.removeEventListener?.("change", updateNarrow)
})
</script>

<style scoped>
/* ========== 沉浸式全屏画布 ========== */
.geometry-lab {
    position: relative;
    z-index: 2;
    /* 高度 = 视口 - 导航栏；负 margin 抵消 main-content 上下 padding(32px×2)，画布从导航栏下铺满到视口底部 */
    height: calc(100vh - var(--nav-height));
    margin: -32px 0;
    overflow: hidden;
}

.scene-host,
.scene-host :deep(canvas) {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    display: block;
}

/* ========== 左上角导航：返回胶囊 + 小标题 ========== */
.top-nav {
    position: absolute;
    top: 16px;
    left: 16px;
    z-index: 20;
    display: flex;
    align-items: center;
    gap: 14px;
    pointer-events: none;
}

.back-pill {
    pointer-events: auto;
    display: inline-flex;
    align-items: center;
    gap: 7px;
    padding: 8px 15px;
    border: 1px solid var(--border);
    border-radius: 999px;
    background: color-mix(in srgb, var(--bg-card) 82%, transparent);
    color: var(--text-secondary);
    font-size: 12px;
    font-weight: 700;
    text-decoration: none;
    white-space: nowrap;
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    box-shadow: 0 4px 18px rgba(0, 0, 0, 0.08);
    transition: color 0.18s, border-color 0.18s;
}

.back-pill:hover {
    color: #477cdb;
    border-color: color-mix(in srgb, #477cdb 45%, transparent);
}

.top-title small {
    display: block;
    color: var(--text-muted);
    font-family: var(--mono);
    font-size: 9px;
    letter-spacing: 0.14em;
}

.top-title h1 {
    margin: 3px 0 0;
    font-size: 16px;
    line-height: 1.2;
    text-shadow: 0 1px 3px color-mix(in srgb, var(--bg-card) 72%, transparent);
}

/* ========== 右上角操作组：自动旋转 + 圆锥展开 ========== */
.top-actions {
    position: absolute;
    top: 16px;
    right: 16px;
    z-index: 20;
    display: flex;
    align-items: center;
    gap: 10px;
}

.auto-rotate {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    padding: 8px 14px;
    border: 1px solid var(--border);
    border-radius: 999px;
    background: color-mix(in srgb, var(--bg-card) 82%, transparent);
    color: var(--text-secondary);
    font-size: 11px;
    font-weight: 700;
    cursor: pointer;
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    box-shadow: 0 4px 18px rgba(0, 0, 0, 0.08);
}

.auto-rotate i {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: var(--text-muted);
}

.auto-rotate.on {
    border-color: color-mix(in srgb, #477cdb 55%, transparent);
    color: #477cdb;
}

.auto-rotate.on i {
    background: #4fe3a2;
    box-shadow: 0 0 0 3px rgba(79, 227, 162, 0.2);
}

/* 圆锥展开按钮：学科蓝描边，展开中实心蓝底 */
.unfold-btn {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    padding: 8px 14px;
    border: 1px solid color-mix(in srgb, #477cdb 55%, var(--border));
    border-radius: 999px;
    background: color-mix(in srgb, var(--bg-card) 82%, transparent);
    color: #477cdb;
    font-size: 11px;
    font-weight: 700;
    cursor: pointer;
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    box-shadow: 0 4px 18px rgba(0, 0, 0, 0.08);
    transition: background 0.18s, color 0.18s, box-shadow 0.18s;
}

.unfold-btn:hover {
    box-shadow: 0 6px 22px rgba(71, 124, 219, 0.32);
}

.unfold-btn.on {
    background: linear-gradient(135deg, #477cdb, #6b9bf0);
    color: #fff;
    box-shadow: 0 6px 20px rgba(71, 124, 219, 0.42);
}

/* ========== 底部"面上动点面积"胶囊工具条 ========== */
.area-toolbar {
    position: absolute;
    left: 50%;
    bottom: 20px;
    transform: translateX(-50%);
    z-index: 30;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 10px;
    border: 1px solid color-mix(in srgb, #477cdb 34%, var(--border));
    border-radius: 999px;
    background: color-mix(in srgb, var(--bg-card) 85%, transparent);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.14);
}

.area-toolbar-title {
    padding: 0 4px 0 8px;
    font-family: var(--mono);
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.08em;
    white-space: nowrap;
    color: var(--text-muted);
}

/* 模式按钮组：容器视觉由外层 .area-toolbar 胶囊提供，这里只做分组 */
.area-modes {
    display: inline-flex;
    align-items: center;
}

.area-modes button {
    padding: 6px 13px;
    border: none;
    border-radius: 999px;
    background: transparent;
    color: var(--text-secondary);
    font-size: 11px;
    font-weight: 700;
    line-height: 1;
    cursor: pointer;
    transition: background 0.18s, color 0.18s, box-shadow 0.18s;
}

.area-modes button:hover {
    color: #477cdb;
}

.area-modes button.active {
    background: linear-gradient(135deg, #477cdb, #6b9bf0);
    color: #fff;
    box-shadow: 0 4px 14px rgba(71, 124, 219, 0.4);
}

/* 按钮文字双态：桌面显示全称（full），手机显示精简（short），避免窄屏文字挤压 */
.area-modes button .short,
.area-toolbar .unfold-btn .short {
    display: none;
}

/* 右上角"?"帮助按钮 + 面积功能使用说明气泡 */
.help-btn {
    width: 30px;
    height: 30px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: 1px solid color-mix(in srgb, #477cdb 55%, var(--border));
    border-radius: 50%;
    background: color-mix(in srgb, var(--bg-card) 82%, transparent);
    color: #477cdb;
    font-family: var(--mono);
    font-size: 14px;
    font-weight: 700;
    line-height: 1;
    cursor: pointer;
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    box-shadow: 0 4px 18px rgba(0, 0, 0, 0.08);
    transition: background 0.18s, color 0.18s, box-shadow 0.18s;
}

.help-btn:hover {
    box-shadow: 0 6px 22px rgba(71, 124, 219, 0.32);
}

.help-btn.on {
    background: linear-gradient(135deg, #477cdb, #6b9bf0);
    color: #fff;
    box-shadow: 0 6px 20px rgba(71, 124, 219, 0.42);
}

/* 说明气泡：锚定在操作组下方右侧，毛玻璃风格与知识卡一致 */
.help-pop {
    position: absolute;
    bottom: calc(100% + 10px);
    left: 50%;
    transform: translateX(-50%);
    width: 320px;
    max-width: calc(100vw - 40px);
    padding: 16px 18px;
    border: 1px solid color-mix(in srgb, #477cdb 34%, var(--border));
    border-radius: 14px;
    background: color-mix(in srgb, var(--bg-card) 92%, #477cdb 5%);
    backdrop-filter: blur(14px);
    -webkit-backdrop-filter: blur(14px);
    box-shadow: 0 12px 40px rgba(71, 124, 219, 0.2);
    z-index: 50;
}

.help-title {
    margin-bottom: 10px;
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 0.02em;
    color: #477cdb;
}

.help-list {
    margin: 0;
    padding: 0;
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.help-list li {
    font-size: 12px;
    line-height: 1.6;
    color: var(--text-secondary);
}

.help-list b {
    margin-right: 2px;
    color: #477cdb;
    font-weight: 700;
}

.help-note {
    margin: 12px 0 0;
    padding-top: 10px;
    border-top: 1px dashed var(--border);
    font-size: 11px;
    line-height: 1.6;
    color: var(--text-muted);
}

/* ========== 弧盘选择器：fixed 嵌屏幕左缘 ========== */
.geo-picker {
    position: fixed;
    left: 0;
    top: 50%;
    transform: translate(-50%, -50%);
    z-index: 30;
}

/* ========== 底部中央操作提示 ========== */
.viewport-hint {
    position: absolute;
    left: 50%;
    bottom: 84px;
    transform: translateX(-50%);
    z-index: 10;
    color: var(--text-muted);
    font-family: var(--mono);
    font-size: 9px;
    letter-spacing: 0.08em;
    pointer-events: none;
}

/* ========== 右下角知识卡片：收起为胶囊，点击展开 ========== */
.knowledge-card {
    position: absolute;
    right: 16px;
    bottom: 16px;
    z-index: 40;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 10px;
}

.knowledge-trigger {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 10px 18px;
    border: 1px solid rgba(255, 255, 255, 0.18);
    border-radius: 999px;
    background: linear-gradient(135deg, #477cdb, #6b9bf0);
    color: #fff;
    font-size: 12px;
    font-weight: 700;
    cursor: pointer;
    box-shadow: 0 6px 20px rgba(71, 124, 219, 0.42);
    transition: background 0.2s, box-shadow 0.2s, transform 0.2s;
}

.knowledge-trigger:hover {
    background: linear-gradient(135deg, #3d6fc7, #5d8fea);
    box-shadow: 0 8px 26px rgba(71, 124, 219, 0.52);
    transform: translateY(-1px);
}

.knowledge-trigger .chev {
    color: rgba(255, 255, 255, 0.85);
    transition: transform 0.2s var(--ease-out);
}

.knowledge-card.open .knowledge-trigger .chev {
    transform: rotate(180deg);
}

.knowledge-panel {
    position: relative;
    width: 400px;
    max-height: min(60vh, 520px);
    overflow-y: auto;
    padding: 20px;
    border: 1px solid color-mix(in srgb, #477cdb 34%, var(--border));
    border-radius: 16px;
    background: color-mix(in srgb, var(--bg-card) 92%, #477cdb 5%);
    backdrop-filter: blur(14px);
    -webkit-backdrop-filter: blur(14px);
    box-shadow: 0 12px 40px rgba(71, 124, 219, 0.2);
}

/* 顶部学科色渐变条：一眼识别数学知识卡 */
.knowledge-panel::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, #477cdb, #8fb2ea);
    border-radius: 16px 16px 0 0;
}

/* 展开/收起过渡：从按钮位置向上滑出 */
.card-enter-active,
.card-leave-active {
    transition: opacity 0.22s var(--ease-out), transform 0.22s var(--ease-out);
}

.card-enter-from,
.card-leave-to {
    opacity: 0;
    transform: translateY(14px);
}

.knowledge-panel::-webkit-scrollbar {
    width: 5px;
}

.knowledge-panel::-webkit-scrollbar-thumb {
    background: color-mix(in srgb, var(--text-muted) 40%, transparent);
    border-radius: 10px;
}

.info-heading {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 20px;
}

.info-heading h2 {
    margin: 0;
    font-size: 22px;
    font-weight: 800;
    line-height: 1.2;
    letter-spacing: 0.01em;
}

.knowledge-close {
    margin-left: auto;
    background: none;
    border: none;
    cursor: pointer;
    font-size: 14px;
    color: var(--text-muted);
    padding: 4px 8px;
    border-radius: 6px;
    line-height: 1;
    transition: color 0.15s, background 0.15s;
}

.knowledge-close:hover {
    color: var(--text);
    background: color-mix(in srgb, var(--text-muted) 14%, transparent);
}

.category-chip {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    flex: 0 0 auto;
    padding: 5px 11px;
    border-radius: 999px;
    background: color-mix(in srgb, #477cdb 13%, transparent);
    border: 1px solid color-mix(in srgb, #477cdb 26%, transparent);
    color: #477cdb;
    font-size: 10px;
    font-weight: 800;
}

/* 类别前的小圆点：棱柱 / 棱锥 / 旋转体一眼区分 */
.category-chip::before {
    content: '';
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: currentColor;
    box-shadow: 0 0 0 3px color-mix(in srgb, #477cdb 18%, transparent);
}

.counts {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    border-radius: 12px;
    background: color-mix(in srgb, #477cdb 7%, var(--bg-card));
    border: 1px solid color-mix(in srgb, #477cdb 16%, var(--border));
    overflow: hidden;
}

.counts > div {
    padding: 14px 0;
    text-align: center;
    border-right: 1px solid color-mix(in srgb, #477cdb 12%, var(--border));
    transition: background 0.2s var(--ease-out);
}

.counts > div:last-child {
    border-right: 0;
}

.counts > div:hover {
    background: color-mix(in srgb, #477cdb 10%, transparent);
}

.counts span {
    display: block;
    color: var(--text-muted);
    font-size: 10px;
    letter-spacing: 0.04em;
}

.counts b {
    display: block;
    margin-top: 5px;
    color: #477cdb;
    font-family: var(--mono);
    font-size: 22px;
    line-height: 1;
    font-weight: 800;
}

.euler,
.curved-note {
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 14px 0 0;
    padding: 10px 12px;
    border-radius: 10px;
    font-size: 12px;
    font-weight: 700;
}

/* 欧拉验证：浅蓝徽章 + ✓，一眼看出"验证"动作 */
.euler {
    color: #477cdb;
    background: color-mix(in srgb, #477cdb 9%, transparent);
    border: 1px solid color-mix(in srgb, #477cdb 20%, transparent);
    font-family: var(--mono);
}

.euler::before {
    content: '✓';
    flex: 0 0 auto;
    font-size: 13px;
    font-weight: 900;
}

/* 旋转体说明：中性灰徽章，与多面体区分开 */
.curved-note {
    color: var(--text-secondary);
    background: color-mix(in srgb, var(--text-muted) 8%, transparent);
    border: 1px solid var(--border-light);
}

.curved-note::before {
    content: '◌';
    flex: 0 0 auto;
    font-size: 13px;
    color: var(--text-muted);
}

.formula-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    margin-top: 18px;
}

.formula-card {
    position: relative;
    min-width: 0;
    padding: 14px 14px 13px 16px;
    border: 1px solid color-mix(in srgb, #477cdb 18%, var(--border));
    border-radius: 12px;
    background: linear-gradient(160deg, color-mix(in srgb, #477cdb 7%, var(--bg-card)), var(--bg-card) 62%);
    overflow: hidden;
    transition: transform 0.2s var(--ease-out), box-shadow 0.2s var(--ease-out), border-color 0.2s var(--ease-out);
}

/* 左侧学科色竖条：公式卡与普通信息区分开 */
.formula-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    width: 3px;
    background: linear-gradient(180deg, #477cdb, #8fb2ea);
    border-radius: 3px 0 0 3px;
}

.formula-card:hover {
    transform: translateY(-2px);
    border-color: color-mix(in srgb, #477cdb 34%, var(--border));
    box-shadow: 0 8px 20px rgba(71, 124, 219, 0.14);
}

.formula-card small {
    color: #477cdb;
    font-size: 10px;
    font-weight: 800;
    letter-spacing: 0.06em;
}

.formula-card code {
    display: block;
    margin-top: 9px;
    color: var(--text);
    font-family: var(--mono);
    font-size: 15px;
    font-weight: 700;
    line-height: 1.4;
    overflow-wrap: anywhere;
}

.formula-card strong {
    display: block;
    margin-top: 10px;
    color: #477cdb;
    font-family: var(--mono);
    font-size: 30px;
    line-height: 1;
}

.formula-card strong span {
    font-size: 12px;
    font-weight: 700;
}

.formula-card em {
    display: block;
    margin-top: 7px;
    color: var(--text-muted);
    font-size: 9px;
    font-style: normal;
}

/* 公式变量说明：带图标 + 浅蓝底要点条，从正文里独立出来 */
.formula-vars {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    margin: 14px 0 0;
    padding: 10px 12px;
    border-radius: 10px;
    background: color-mix(in srgb, #477cdb 6%, transparent);
    border: 1px solid color-mix(in srgb, #477cdb 14%, var(--border));
    color: var(--text-secondary);
    font-size: 12px;
    line-height: 1.7;
}

.formula-vars::before {
    content: '📐';
    flex: 0 0 auto;
    font-size: 13px;
    line-height: 1.6;
}

.knowledge {
    margin-top: 22px;
    padding-top: 18px;
    border-top: 1px solid var(--border-light);
}

/* —— 知识正文 markdown 深度定制：让渲染内容与卡片风格统一 —— */
.knowledge :deep(.md-editor-preview) {
    color: var(--text-secondary);
    font-size: 13px;
    line-height: 1.75;
}

/* 小标题：深色加粗 + 底部细线，节奏与卡片一致 */
.knowledge :deep(.md-editor-preview h2),
.knowledge :deep(.md-editor-preview h3) {
    color: var(--text);
    font-weight: 800;
    margin: 22px 0 10px;
    padding-bottom: 8px;
    border-bottom: 1px solid var(--border-light);
    line-height: 1.4;
}

.knowledge :deep(.md-editor-preview h2:first-child) {
    margin-top: 0;
}

/* 段落与列表：正文字号行高统一 */
.knowledge :deep(.md-editor-preview p),
.knowledge :deep(.md-editor-preview ul) {
    margin: 8px 0;
}

.knowledge :deep(.md-editor-preview ul) {
    padding-left: 18px;
}

.knowledge :deep(.md-editor-preview li) {
    margin: 5px 0;
    line-height: 1.7;
}

.knowledge :deep(.md-editor-preview li::marker) {
    color: #477cdb;
}

/* 行内 / 块级公式：学科蓝 */
.knowledge :deep(.md-editor-preview .katex) {
    color: #477cdb;
    font-size: 1.06em;
}

/* 加粗：比正文深一档 */
.knowledge :deep(.md-editor-preview strong) {
    color: var(--text);
    font-weight: 800;
}

/* 观察视角引用：左蓝条 + 浅蓝底 + 眼睛图标，一眼可辨 */
.knowledge :deep(.md-editor-preview blockquote) {
    margin: 14px 0;
    padding: 11px 13px 11px 15px;
    border-left: 3px solid #477cdb;
    border-radius: 0 10px 10px 0;
    background: color-mix(in srgb, #477cdb 7%, transparent);
    color: var(--text-secondary);
}

.knowledge :deep(.md-editor-preview blockquote p) {
    margin: 0;
}

.knowledge :deep(.md-editor-preview blockquote::before) {
    content: '👁 ';
    color: #477cdb;
    font-weight: 800;
}

/* 分隔线 */
.knowledge :deep(.md-editor-preview hr) {
    margin: 16px 0;
    border: 0;
    border-top: 1px solid var(--border-light);
}

/* 动手实践提示条：虚线学科蓝描边 + 浅蓝底 + ✂️ 图标，与正文区分 */
.try-it {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    margin-top: 20px;
    padding: 14px 16px;
    border-radius: 14px;
    border: 1px dashed color-mix(in srgb, #477cdb 46%, var(--border));
    background: linear-gradient(135deg, color-mix(in srgb, #477cdb 13%, var(--bg-card)), color-mix(in srgb, #6b9bf0 8%, var(--bg-card)));
}

.try-it-icon {
    flex: 0 0 auto;
    font-size: 22px;
    line-height: 1;
}

.try-it b {
    display: block;
    color: #477cdb;
    font-size: 12px;
    font-weight: 800;
    letter-spacing: 0.05em;
}

.try-it p {
    margin: 4px 0 0;
    color: var(--text-secondary);
    font-size: 12px;
    line-height: 1.7;
}

/* CSS2D 顶点字母标签：脱离 scoped，需全局样式 */
:global(.vertex-label) {
    color: #477cdb;
    font-family: var(--mono);
    font-size: 13px;
    font-weight: 700;
    pointer-events: none;
    text-shadow: 0 1px 4px rgba(0, 0, 0, 0.35), 0 0 2px var(--bg-card);
    transform: translate(7px, -4px);
    user-select: none;
}

/* CSS2D 圆锥展开标注：母线长 + 底面周长公式，毛玻璃小胶囊，中心锚定锚点 */
:global(.unfold-label) {
    color: #477cdb;
    font-family: var(--mono);
    font-size: 12px;
    font-weight: 700;
    white-space: pre-line;
    text-align: center;
    line-height: 1.55;
    padding: 3px 10px;
    border: 1px solid color-mix(in srgb, #477cdb 42%, var(--border));
    border-radius: 999px;
    background: color-mix(in srgb, var(--bg-card) 80%, transparent);
    backdrop-filter: blur(6px);
    -webkit-backdrop-filter: blur(6px);
    transform: translate(-50%, -50%);
    pointer-events: none;
    user-select: none;
}

/* ========== 响应式 ========== */
@media (max-width: 900px) {
    .knowledge-panel {
        width: 380px;
    }

    .top-title h1 {
        font-size: 14px;
    }
}

@media (max-width: 600px) {
    .top-title {
        display: none;
    }

    .knowledge-panel {
        width: min(340px, calc(100vw - 48px));
        max-height: 55vh;
    }

    .top-actions {
        top: 12px;
        right: 12px;
    }

    /* 知识卡片：移到右上角（右下被弧盘和工具条占着），收起胶囊时只占右上角 */
    .knowledge-card {
        right: 12px;
        top: 54px;
        bottom: auto;
    }

    /* 面积工具条：手机端占满宽度（90%，上限 460px），内部按钮舒展，字不挤 */
    .area-toolbar {
        width: min(90%, 460px);
        max-width: calc(100vw - 16px);
        justify-content: center;
        gap: 7px;
        padding: 7px 12px;
    }
    .area-toolbar-title {
        display: none;
    }
    .area-modes button .full,
    .area-toolbar .unfold-btn .full {
        display: none;
    }
    .area-modes button .short,
    .area-toolbar .unfold-btn .short {
        display: inline;
    }
    /* 模式组和右侧清除/帮助之间加分隔线：视觉分组，缓解"字糊成一团" */
    .area-modes {
        border-right: 1px solid color-mix(in srgb, #477cdb 22%, var(--border));
        padding-right: 4px;
    }
    .area-modes button {
        padding: 7px 12px;
        font-size: 11px;
        letter-spacing: 0.04em;
    }
    .area-toolbar .unfold-btn {
        padding: 7px 13px;
        font-size: 11px;
        letter-spacing: 0.04em;
    }
}
</style>
