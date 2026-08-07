<template>
    <div class="biology-page">
        <DepthLabHero
            eyebrow="BIOLOGY LAB / 生物实验室"
            :title-lines="['进入生命内部', '在空间里看见层次']"
            description="先用 3D 把结构搭出来，能旋转、能缩放，看起来会比平面图直观很多。"
            accent="#6ca647"
            accent2="#8fd06a"
            scene-label="STRUCTURES / 006"
            :actions="[{ label: '进入结构模型库', scroll: '#models', variant: 'primary' }]"
            :meta-items="[
                { value: '03', label: '个结构模型' },
                { value: '3D', label: '自由旋转' },
            ]"
            :devices="[buildDnaDevice]"
            :particle-color="0x6cb35a"
            :particle-color-dark="0x9cd08a"
        />

        <section id="models" class="bio-layout">
            <aside class="model-picker">
                <button
                    v-for="item in models"
                    :key="item.id"
                    class="model-tab"
                    :class="{ active: activeModelId === item.id }"
                    @click="selectModel(item.id)"
                >
                    <span class="tab-icon" v-html="item.icon"></span>
                    <span>
                        <strong>{{ item.name }}</strong>
                        <small>{{ item.short }}</small>
                    </span>
                </button>
            </aside>

            <div class="viewer-card">
                <div ref="viewerRef" class="three-viewer"></div>
                <div class="viewer-hint">拖拽旋转 · 滚轮缩放 · 双击重置视角</div>
            </div>

            <aside class="info-card">
                <h2>{{ activeModel.name }}</h2>
                <p>{{ activeModel.desc }}</p>
                <div class="info-block">
                    <h3>可以重点看</h3>
                    <ul>
                        <li v-for="point in activeModel.points" :key="point">{{ point }}</li>
                    </ul>
                </div>
                <div class="info-block">
                    <h3>小提示</h3>
                    <p>{{ activeModel.tip }}</p>
                </div>
            </aside>
        </section>
    </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from "vue"
import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"
import { BIOLOGY_MODELS } from "../constants/biologyModels.js"
import DepthLabHero from "../components/DepthLabHero.vue"

const viewerRef = ref(null)
const activeModelId = ref("cell")
const models = BIOLOGY_MODELS

const activeModel = computed(() => models.find(item => item.id === activeModelId.value) || models[0])

let scene = null
let camera = null
let renderer = null
let controls = null
let resizeObserver = null
let themeObserver = null
let animationId = null
let modelGroup = null
let disposed = false

/* ── 景深场景装置：旋转 DNA 双螺旋 ─────────────────────── */

function buildDnaDevice() {
    const group = new THREE.Group()
    const orientation = new THREE.Group()
    const dna = new THREE.Group()
    orientation.add(dna)
    group.add(orientation)
    const height = 4.2
    const radius = 1.0
    const turns = 2.4
    const segments = 110
    const pointsA = []
    const pointsB = []

    for (let i = 0; i <= segments; i += 1) {
        const t = i / segments
        const angle = t * Math.PI * 2 * turns
        const y = (t - 0.5) * height
        pointsA.push(new THREE.Vector3(Math.cos(angle) * radius, y, Math.sin(angle) * radius))
        pointsB.push(new THREE.Vector3(Math.cos(angle + Math.PI) * radius, y, Math.sin(angle + Math.PI) * radius))
    }
    const curveA = new THREE.CatmullRomCurve3(pointsA)
    const curveB = new THREE.CatmullRomCurve3(pointsB)
    dna.add(new THREE.Mesh(
        new THREE.TubeGeometry(curveA, 160, 0.04, 10, false),
        new THREE.MeshStandardMaterial({ color: 0xe74c3c, roughness: 0.35 }),
    ))
    dna.add(new THREE.Mesh(
        new THREE.TubeGeometry(curveB, 160, 0.04, 10, false),
        new THREE.MeshStandardMaterial({ color: 0x3498db, roughness: 0.35 }),
    ))

    // 两侧碱基连接到糖-磷酸骨架，中间以虚线表示氢键：A–T 两条，C–G 三条。
    for (let i = 0; i <= 20; i += 1) {
        const t = i / 20
        const angle = t * Math.PI * 2 * turns
        const y = (t - 0.5) * height
        const a = new THREE.Vector3(Math.cos(angle) * radius, y, Math.sin(angle) * radius)
        const b = new THREE.Vector3(Math.cos(angle + Math.PI) * radius, y, Math.sin(angle + Math.PI) * radius)
        addBasePair(dna, a, b, i % 2 === 0 ? "AT" : "CG")
    }

    // 原始螺旋沿 Y 轴生成，外层容器将整条链斜向摆放；dna 保留局部 Y 轴作为中心轴。
    orientation.rotation.z = -Math.PI / 4
    group.position.set(2.0, 0.1, 0)
    group.userData.animate = (motion, reducedMotion) => {
        group.position.y = reducedMotion ? 0.1 : 0.1 + Math.sin(motion * 0.5) * 0.08
        // 先绕 DNA 自身中心轴（局部 Y 轴）旋转，再由 orientation 横向映射到画面。
        dna.rotation.y = reducedMotion ? 0 : motion * 0.18
    }
    return group
}

function addBasePair(group, a, b, pairType) {
    const direction = new THREE.Vector3().subVectors(b, a)
    const leftBaseEnd = a.clone().addScaledVector(direction, 0.4)
    const rightBaseEnd = a.clone().addScaledVector(direction, 0.6)
    const colors = pairType === "AT" ? [0xf0c674, 0x7fa8ee] : [0xd87575, 0xc79be8]
    group.add(createBar(a, leftBaseEnd, 0.028, colors[0]))
    group.add(createBar(rightBaseEnd, b, 0.028, colors[1]))

    const hydrogenBondCount = pairType === "AT" ? 2 : 3
    const bondDirection = direction.clone().normalize()
    const sideOffset = new THREE.Vector3(-bondDirection.z, 0, bondDirection.x).normalize()
    const bondLength = leftBaseEnd.distanceTo(rightBaseEnd)
    const dashLength = bondLength / 7
    for (let bondIndex = 0; bondIndex < hydrogenBondCount; bondIndex += 1) {
        const offset = (bondIndex - (hydrogenBondCount - 1) / 2) * 0.045
        for (let dashIndex = 0; dashIndex < 4; dashIndex += 1) {
            const start = leftBaseEnd.clone()
                .addScaledVector(bondDirection, dashIndex * dashLength * 2)
                .addScaledVector(sideOffset, offset)
            const end = start.clone().addScaledVector(bondDirection, dashLength)
            group.add(createBar(start, end, 0.009, 0xb8a77d))
        }
    }
}

function createBar(a, b, radius, color) {
    const dir = new THREE.Vector3().subVectors(b, a)
    const len = dir.length()
    const mesh = new THREE.Mesh(
        new THREE.CylinderGeometry(radius, radius, len, 8),
        new THREE.MeshStandardMaterial({ color, roughness: 0.4 }),
    )
    mesh.position.copy(a).add(b).multiplyScalar(0.5)
    mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize())
    return mesh
}

function selectModel(id) {
    if (activeModelId.value === id) return
    activeModelId.value = id
    buildActiveModel()
}

function initThree() {
    const host = viewerRef.value
    if (!host) return

    scene = new THREE.Scene()
    camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100)
    camera.position.set(5.2, 3.8, 6.4)

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.setClearAlpha(0)
    host.appendChild(renderer.domElement)

    controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.08
    controls.minDistance = 3
    controls.maxDistance = 13
    controls.target.set(0, 0, 0)

    renderer.domElement.addEventListener("dblclick", resetCamera)

    const ambient = new THREE.AmbientLight(0xffffff, 0.7)
    const key = new THREE.DirectionalLight(0xffffff, 1.1)
    key.position.set(4, 6, 5)
    const rim = new THREE.DirectionalLight(0x88ccff, 0.55)
    rim.position.set(-5, 3, -4)
    scene.add(ambient, key, rim)

    resizeObserver = new ResizeObserver(resizeRenderer)
    resizeObserver.observe(host)

    themeObserver = new MutationObserver(updateSceneTheme)
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] })

    updateSceneTheme()
    resizeRenderer()
    buildActiveModel()
    animate()
}

function resetCamera() {
    if (!camera || !controls) return
    camera.position.set(5.2, 3.8, 6.4)
    controls.target.set(0, 0, 0)
    controls.update()
}

function updateSceneTheme() {
    if (!scene) return
    const isDark = document.documentElement.getAttribute("data-theme") === "dark"
    scene.fog = new THREE.Fog(isDark ? 0x151515 : 0xf7f3ef, 9, 18)
}

function resizeRenderer() {
    const host = viewerRef.value
    if (!host || !renderer || !camera) return
    const rect = host.getBoundingClientRect()
    const width = Math.max(1, Math.floor(rect.width))
    const height = Math.max(1, Math.floor(rect.height))
    renderer.setSize(width, height, false)
    camera.aspect = width / height
    camera.updateProjectionMatrix()
}

function animate() {
    if (disposed) return
    animationId = requestAnimationFrame(animate)
    if (modelGroup) {
        modelGroup.rotation.y += activeModelId.value === "dna" ? 0.008 : 0.003
    }
    if (controls) controls.update()
    if (renderer && scene && camera) renderer.render(scene, camera)
}

function buildActiveModel() {
    if (!scene) return
    clearModel()
    if (activeModelId.value === "dna") modelGroup = createDnaModel()
    else if (activeModelId.value === "neuron") modelGroup = createNeuronModel()
    else modelGroup = createCellModel()
    scene.add(modelGroup)
}

function clearModel() {
    if (!scene || !modelGroup) return
    scene.remove(modelGroup)
    disposeObject(modelGroup)
    modelGroup = null
}

function disposeObject(obj) {
    obj.traverse(child => {
        if (child.geometry) child.geometry.dispose()
        const material = child.material
        if (Array.isArray(material)) material.forEach(m => m.dispose())
        else if (material) material.dispose()
    })
}

function createCellModel() {
    const group = new THREE.Group()

    const membrane = new THREE.Mesh(
        new THREE.SphereGeometry(2, 64, 32),
        new THREE.MeshPhysicalMaterial({
            color: 0x7dd3fc,
            transparent: true,
            opacity: 0.22,
            roughness: 0.25,
            metalness: 0,
            transmission: 0.25,
            side: THREE.DoubleSide,
        })
    )
    group.add(membrane)

    const nucleus = new THREE.Mesh(
        new THREE.SphereGeometry(0.64, 36, 24),
        new THREE.MeshStandardMaterial({ color: 0x8e44ad, roughness: 0.45 })
    )
    nucleus.position.set(-0.25, 0.08, 0.15)
    group.add(nucleus)

    const nucleolus = new THREE.Mesh(
        new THREE.SphereGeometry(0.22, 24, 16),
        new THREE.MeshStandardMaterial({ color: 0xf5b7ff, roughness: 0.35 })
    )
    nucleolus.position.set(-0.05, 0.20, 0.48)
    group.add(nucleolus)

    const mitoMaterial = new THREE.MeshStandardMaterial({ color: 0xe67e22, roughness: 0.45 })
    const mitochondria = [
        [-1.1, -0.55, 0.55, 0.45],
        [1.05, 0.48, -0.35, -0.35],
        [0.72, -0.82, -0.75, 0.2],
    ]
    mitochondria.forEach(([x, y, z, rot]) => {
        const mito = new THREE.Mesh(new THREE.SphereGeometry(0.28, 24, 16), mitoMaterial.clone())
        mito.scale.set(1.9, 0.72, 0.72)
        mito.position.set(x, y, z)
        mito.rotation.set(0.2, rot, 0.35)
        group.add(mito)

        const inner = new THREE.Mesh(
            new THREE.TorusGeometry(0.18, 0.018, 8, 36),
            new THREE.MeshStandardMaterial({ color: 0xffd08a })
        )
        inner.scale.set(1.4, 0.7, 0.7)
        inner.position.copy(mito.position)
        inner.rotation.copy(mito.rotation)
        group.add(inner)
    })

    const erMaterial = new THREE.MeshStandardMaterial({ color: 0x2ecc71, roughness: 0.5, side: THREE.DoubleSide })
    for (let i = 0; i < 4; i++) {
        const strip = new THREE.Mesh(new THREE.TorusGeometry(0.82 + i * 0.16, 0.018, 8, 80, Math.PI * 1.18), erMaterial)
        strip.position.set(-0.2, -0.02, 0.08)
        strip.rotation.set(1.15, 0.25, i * 0.35)
        group.add(strip)
    }

    const ribosomeMaterial = new THREE.MeshStandardMaterial({ color: 0xf1c40f, roughness: 0.55 })
    const points = [
        [-1.35, 0.92, 0.2], [1.35, -0.18, 0.58], [0.32, 1.16, -0.7],
        [-0.58, -1.18, -0.55], [1.08, 0.98, 0.02], [-1.2, 0.05, -0.78],
        [0.2, -1.28, 0.7], [1.45, 0.2, -0.5], [-0.95, 0.55, 0.95],
    ]
    points.forEach(pos => {
        const dot = new THREE.Mesh(new THREE.SphereGeometry(0.075, 12, 8), ribosomeMaterial)
        dot.position.set(...pos)
        group.add(dot)
    })

    addLabelSprite(group, "细胞膜", new THREE.Vector3(0, 2.35, 0), "#3498db")
    addLabelSprite(group, "细胞核", new THREE.Vector3(-0.25, 0.95, 0.2), "#8e44ad")
    addLabelSprite(group, "线粒体", new THREE.Vector3(1.15, -0.95, -0.2), "#e67e22")

    return group
}

function createDnaModel() {
    const group = new THREE.Group()
    const height = 4.5
    const radius = 1.05
    const turns = 2.6
    const segments = 120
    const pointsA = []
    const pointsB = []

    for (let i = 0; i <= segments; i++) {
        const t = i / segments
        const angle = t * Math.PI * 2 * turns
        const y = (t - 0.5) * height
        pointsA.push(new THREE.Vector3(Math.cos(angle) * radius, y, Math.sin(angle) * radius))
        pointsB.push(new THREE.Vector3(Math.cos(angle + Math.PI) * radius, y, Math.sin(angle + Math.PI) * radius))
    }

    const curveA = new THREE.CatmullRomCurve3(pointsA)
    const curveB = new THREE.CatmullRomCurve3(pointsB)
    group.add(new THREE.Mesh(new THREE.TubeGeometry(curveA, 180, 0.045, 10, false), new THREE.MeshStandardMaterial({ color: 0xe74c3c, roughness: 0.35 })))
    group.add(new THREE.Mesh(new THREE.TubeGeometry(curveB, 180, 0.045, 10, false), new THREE.MeshStandardMaterial({ color: 0x3498db, roughness: 0.35 })))

    const baseColors = [0xf1c40f, 0x2ecc71, 0x9b59b6, 0xe67e22]
    for (let i = 0; i <= 28; i++) {
        const t = i / 28
        const angle = t * Math.PI * 2 * turns
        const y = (t - 0.5) * height
        const a = new THREE.Vector3(Math.cos(angle) * radius, y, Math.sin(angle) * radius)
        const b = new THREE.Vector3(Math.cos(angle + Math.PI) * radius, y, Math.sin(angle + Math.PI) * radius)
        const color = baseColors[i % baseColors.length]
        group.add(createCylinderBetween(a, b, 0.025, color))

        const beadA = new THREE.Mesh(new THREE.SphereGeometry(0.095, 16, 10), new THREE.MeshStandardMaterial({ color: 0xe74c3c }))
        beadA.position.copy(a)
        const beadB = new THREE.Mesh(new THREE.SphereGeometry(0.095, 16, 10), new THREE.MeshStandardMaterial({ color: 0x3498db }))
        beadB.position.copy(b)
        group.add(beadA, beadB)
    }

    addLabelSprite(group, "双螺旋骨架", new THREE.Vector3(0, 2.65, 0), "#e74c3c")
    addLabelSprite(group, "碱基对", new THREE.Vector3(1.65, 0, 0), "#2ecc71")
    return group
}

function createNeuronModel() {
    const group = new THREE.Group()
    const somaMaterial = new THREE.MeshStandardMaterial({ color: 0x9b59b6, roughness: 0.42 })
    const soma = new THREE.Mesh(new THREE.SphereGeometry(0.72, 40, 24), somaMaterial)
    soma.scale.set(1.12, 0.92, 1)
    group.add(soma)

    const nucleus = new THREE.Mesh(new THREE.SphereGeometry(0.22, 20, 12), new THREE.MeshStandardMaterial({ color: 0xf5b7ff }))
    nucleus.position.set(0.1, 0.08, 0.26)
    group.add(nucleus)

    const branchColor = 0x8e44ad
    const dendrites = [
        [[-0.45, 0.35, 0], [-1.1, 0.9, 0.25], [-1.8, 1.2, 0.2], [-2.35, 1.55, 0.55]],
        [[-0.55, 0.02, 0], [-1.3, 0.08, -0.2], [-2.0, -0.15, -0.55], [-2.5, -0.45, -0.75]],
        [[-0.28, -0.48, 0.05], [-0.8, -1.05, 0.25], [-1.35, -1.45, 0.15]],
        [[0.05, 0.62, 0], [0.0, 1.35, -0.2], [-0.35, 1.9, -0.45]],
        [[0.38, 0.35, 0], [0.95, 0.85, 0.35], [1.45, 1.2, 0.45]],
    ]
    dendrites.forEach(path => {
        group.add(createTube(path.map(p => new THREE.Vector3(...p)), 0.05, branchColor))
        const end = path[path.length - 1]
        addBranchTip(group, new THREE.Vector3(...end), branchColor)
    })

    const axonPoints = [
        new THREE.Vector3(0.68, -0.08, 0),
        new THREE.Vector3(1.35, -0.25, 0.08),
        new THREE.Vector3(2.15, -0.36, 0.02),
        new THREE.Vector3(3.0, -0.25, -0.08),
        new THREE.Vector3(3.85, -0.05, 0),
    ]
    group.add(createTube(axonPoints, 0.075, 0x3498db))

    const endBase = axonPoints[axonPoints.length - 1]
    const terminals = [
        [endBase, new THREE.Vector3(4.35, 0.35, 0.25), new THREE.Vector3(4.8, 0.55, 0.45)],
        [endBase, new THREE.Vector3(4.35, -0.05, -0.05), new THREE.Vector3(4.85, -0.10, -0.2)],
        [endBase, new THREE.Vector3(4.25, -0.48, 0.2), new THREE.Vector3(4.7, -0.75, 0.35)],
    ]
    terminals.forEach(path => {
        group.add(createTube(path, 0.045, 0x3498db))
        addBranchTip(group, path[path.length - 1], 0x3498db)
    })

    addLabelSprite(group, "细胞体", new THREE.Vector3(0, 1.05, 0), "#9b59b6")
    addLabelSprite(group, "树突", new THREE.Vector3(-2.2, 1.85, 0.55), "#8e44ad")
    addLabelSprite(group, "轴突", new THREE.Vector3(3.1, 0.35, 0), "#3498db")

    group.position.x = -0.9
    return group
}

function createTube(points, radius, color) {
    const curve = new THREE.CatmullRomCurve3(points)
    return new THREE.Mesh(
        new THREE.TubeGeometry(curve, 48, radius, 10, false),
        new THREE.MeshStandardMaterial({ color, roughness: 0.42 })
    )
}

function addBranchTip(group, position, color) {
    const tip = new THREE.Mesh(new THREE.SphereGeometry(0.11, 16, 10), new THREE.MeshStandardMaterial({ color }))
    tip.position.copy(position)
    group.add(tip)
}

function createCylinderBetween(start, end, radius, color) {
    const dir = new THREE.Vector3().subVectors(end, start)
    const len = dir.length()
    const geometry = new THREE.CylinderGeometry(radius, radius, len, 10)
    const material = new THREE.MeshStandardMaterial({ color, roughness: 0.36 })
    const mesh = new THREE.Mesh(geometry, material)
    mesh.position.copy(start).add(end).multiplyScalar(0.5)
    mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize())
    return mesh
}

function addLabelSprite(group, text, position, color) {
    const canvas = document.createElement("canvas")
    canvas.width = 256
    canvas.height = 96
    const ctx = canvas.getContext("2d")
    ctx.fillStyle = "rgba(255,255,255,0.92)"
    ctx.strokeStyle = color
    ctx.lineWidth = 4
    roundRect(ctx, 12, 18, 232, 54, 16)
    ctx.fill()
    ctx.stroke()
    ctx.fillStyle = "#222"
    ctx.font = "bold 28px sans-serif"
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.fillText(text, 128, 46)
    const texture = new THREE.CanvasTexture(canvas)
    const material = new THREE.SpriteMaterial({ map: texture, transparent: true })
    const sprite = new THREE.Sprite(material)
    sprite.position.copy(position)
    sprite.scale.set(1.25, 0.47, 1)
    group.add(sprite)
}

function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath()
    ctx.moveTo(x + r, y)
    ctx.lineTo(x + w - r, y)
    ctx.quadraticCurveTo(x + w, y, x + w, y + r)
    ctx.lineTo(x + w, y + h - r)
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
    ctx.lineTo(x + r, y + h)
    ctx.quadraticCurveTo(x, y + h, x, y + h - r)
    ctx.lineTo(x, y + r)
    ctx.quadraticCurveTo(x, y, x + r, y)
    ctx.closePath()
}

onMounted(async () => {
    await nextTick()
    disposed = false
    initThree()
})

onBeforeUnmount(() => {
    disposed = true
    if (animationId) cancelAnimationFrame(animationId)
    animationId = null
    if (resizeObserver) resizeObserver.disconnect()
    if (themeObserver) themeObserver.disconnect()
    if (renderer?.domElement) renderer.domElement.removeEventListener("dblclick", resetCamera)
    clearModel()
    controls?.dispose()
    renderer?.dispose()
    if (renderer?.domElement?.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement)
    scene = null
    camera = null
    renderer = null
    controls = null
})
</script>

<style scoped>
.biology-page {
    position: relative;
    z-index: 2;
    width: min(1280px, calc(100% - 48px));
    margin: -32px auto 0;
}

.bio-layout {
    display: grid;
    grid-template-columns: 220px minmax(0, 1fr) 280px;
    gap: 14px;
    align-items: stretch;
    padding: 0 20px 28px;
}

.model-picker,
.viewer-card,
.info-card {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow);
}

.model-picker {
    padding: 10px;
    height: 620px;
}

.model-tab {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px;
    margin-bottom: 8px;
    border: 1px solid transparent;
    border-radius: var(--radius);
    background: transparent;
    color: var(--text-secondary);
    text-align: left;
    cursor: pointer;
    transition: var(--transition);
}

.model-tab:hover,
.model-tab.active {
    border-color: var(--primary);
    background: var(--primary-light);
    color: var(--primary);
}

.tab-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 34px;
    height: 34px;
    border-radius: 10px;
    background: var(--bg-card-hover);
    flex-shrink: 0;
}

.model-tab strong,
.model-tab small {
    display: block;
}

.model-tab strong {
    margin-bottom: 3px;
    font-size: 14px;
}

.model-tab small {
    color: var(--text-muted);
    font-size: 11px;
    line-height: 1.4;
}

.viewer-card {
    position: relative;
    overflow: hidden;
    min-height: 620px;
}

.three-viewer {
    width: 100%;
    height: 620px;
    background:
        radial-gradient(circle at 30% 20%, rgba(52, 152, 219, 0.16), transparent 32%),
        radial-gradient(circle at 75% 70%, rgba(231, 76, 60, 0.13), transparent 34%),
        linear-gradient(135deg, rgba(255,255,255,0.65), rgba(245,245,245,0.35));
}

:root[data-theme="dark"] .three-viewer {
    background:
        radial-gradient(circle at 30% 20%, rgba(52, 152, 219, 0.12), transparent 32%),
        radial-gradient(circle at 75% 70%, rgba(231, 76, 60, 0.12), transparent 34%),
        linear-gradient(135deg, rgba(20,20,20,0.85), rgba(36,36,36,0.75));
}

.three-viewer :deep(canvas) {
    display: block;
    width: 100%;
    height: 100%;
}

.viewer-hint {
    position: absolute;
    left: 16px;
    bottom: 14px;
    padding: 7px 12px;
    border-radius: 999px;
    background: rgba(0, 0, 0, 0.55);
    color: #fff;
    font-size: 12px;
    backdrop-filter: blur(8px);
}

.info-card {
    padding: 20px;
    height: 620px;
    overflow-y: auto;
}

.info-card h2 {
    margin: 0 0 10px;
    color: var(--text-dark);
    font-size: 22px;
}

.info-card > p {
    margin: 0 0 18px;
    color: var(--text-secondary);
    line-height: 1.75;
}

.info-block {
    margin-top: 18px;
    padding-top: 16px;
    border-top: 1px solid var(--border);
}

.info-block h3 {
    margin: 0 0 10px;
    color: var(--primary);
    font-size: 14px;
}

.info-block ul {
    margin: 0;
    padding-left: 18px;
    color: var(--text-secondary);
    line-height: 1.8;
}

.info-block p {
    margin: 0;
    color: var(--text-secondary);
    line-height: 1.75;
}

@media (max-width: 980px) {
    .bio-layout {
        grid-template-columns: 1fr;
    }

    .model-picker {
        height: auto;
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 8px;
    }

    .model-tab {
        margin-bottom: 0;
    }

    .info-card {
        height: auto;
    }
}

@media (max-width: 640px) {
    .biology-page {
        width: min(100% - 32px, 1280px);
    }

    .bio-layout {
        padding: 0 10px 20px;
    }

    .model-picker {
        grid-template-columns: 1fr;
    }

    .viewer-card,
    .three-viewer {
        min-height: 500px;
        height: 500px;
    }
}
</style>
