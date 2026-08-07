<template>
    <div class="chem-page">
        <DepthLabHero
            eyebrow="CHEMISTRY LAB / 化学实验室"
            :title-lines="['把分子转起来', '从微观认识物质']"
            description="从元素的周期规律到分子与晶体的空间结构，在微观尺度认识物质。"
            accent="#2aa27f"
            accent2="#56c9a8"
            scene-label="CHEMISTRY / 005"
            :actions="[
                { label: '查看元素周期表', to: '/chem-lab/periodic-table', variant: 'primary' },
                { label: '进入分子模型库', scroll: '#models', variant: 'outline' },
            ]"
            :meta-items="[
                { value: '118', label: '个化学元素' },
                { value: '05', label: '个分子模型' },
                { value: '3D', label: '自由旋转' },
            ]"
            :devices="[buildSodiumIonDevice]"
            :particle-color="0x4fa88f"
            :particle-color-dark="0x7fd0b4"
        />

        <router-link to="/chem-lab/periodic-table" class="periodic-entry">
            <div class="entry-copy">
                <span>01 / ELEMENTS</span>
                <h2>从周期表，看见元素之间的规律。</h2>
                <p>搜索 118 个元素，比较族、周期、电子层排布与常见物理性质。</p>
                <b>打开元素周期表 ↗</b>
            </div>
            <div class="mini-table" aria-hidden="true">
                <i v-for="index in 36" :key="index" :class="{ active: [1, 2, 7, 12, 18, 24, 29, 36].includes(index) }"></i>
            </div>
        </router-link>

        <section id="models" class="chem-layout">
            <aside class="model-picker">
                <button
                    v-for="item in models"
                    :key="item.id"
                    class="model-tab"
                    :class="{ active: activeModelId === item.id }"
                    @click="selectModel(item.id)"
                >
                    <span class="formula">{{ item.formula }}</span>
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
                    <h3>结构特征</h3>
                    <ul>
                        <li v-for="point in activeModel.points" :key="point">{{ point }}</li>
                    </ul>
                </div>

                <div class="info-block">
                    <h3>看模型时抓住</h3>
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
import { CHEMISTRY_MODELS } from "../constants/chemistryModels.js"
import DepthLabHero from "../components/DepthLabHero.vue"

const viewerRef = ref(null)
const activeModelId = ref("water")
const models = CHEMISTRY_MODELS

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

/* ── 景深场景装置：Na⁺ 原子核 + 电子层轨道 ─────────────── */

function buildSodiumIonDevice() {
    const group = new THREE.Group()
    const nucleus = new THREE.Group()
    const protonMaterial = new THREE.MeshStandardMaterial({
        color: 0xe85d75,
        emissive: 0x6d1f32,
        emissiveIntensity: 0.45,
        roughness: 0.3,
    })
    const neutronMaterial = new THREE.MeshStandardMaterial({
        color: 0x6d8fbd,
        emissive: 0x253c68,
        emissiveIntensity: 0.3,
        roughness: 0.36,
    })
    const nucleonGeometry = new THREE.SphereGeometry(0.24, 20, 16)
    const nucleons = [
        [-0.2, 0.18, 0.12, true], [0.2, 0.18, -0.08, false],
        [-0.28, -0.12, -0.1, true], [0.05, -0.2, 0.16, false],
        [0.3, -0.1, -0.16, true], [0, 0.02, -0.25, false],
    ]
    nucleons.forEach(([x, y, z, isProton]) => {
        const mesh = new THREE.Mesh(nucleonGeometry, isProton ? protonMaterial : neutronMaterial)
        mesh.position.set(x, y, z)
        nucleus.add(mesh)
    })
    group.add(nucleus)

    const orbitSpecs = [
        { radius: 1.3, count: 2, tilt: [0.62, 0.15, 0.12], speed: 0.72 },
        { radius: 2.05, count: 8, tilt: [1.12, -0.32, -0.18], speed: -0.38 },
    ]
    const electrons = []
    orbitSpecs.forEach((spec, shellIndex) => {
        const orbit = new THREE.Mesh(
            new THREE.TorusGeometry(spec.radius, 0.018, 8, 96),
            new THREE.MeshStandardMaterial({
                color: shellIndex === 0 ? 0x56c9a8 : 0x2aa27f,
                transparent: true,
                opacity: 0.42,
                side: THREE.DoubleSide,
            }),
        )
        orbit.rotation.set(...spec.tilt)
        group.add(orbit)

        for (let index = 0; index < spec.count; index += 1) {
            const electron = new THREE.Mesh(
                new THREE.SphereGeometry(0.075, 16, 12),
                new THREE.MeshStandardMaterial({
                    color: 0xb4ffe7,
                    emissive: 0x18a87b,
                    emissiveIntensity: 2,
                    roughness: 0.25,
                }),
            )
            electron.userData = {
                radius: spec.radius,
                tilt: spec.tilt,
                angle: index / spec.count * Math.PI * 2,
                speed: spec.speed,
            }
            group.add(electron)
            electrons.push(electron)
        }
    })

    addLabelSprite(group, "Na⁺", new THREE.Vector3(0, -0.95, 0.2), "#2aa27f", 1.15)
    group.position.set(2.15, 0.1, 0)
    group.rotation.set(0.08, -0.18, 0)
    group.userData.animate = (motion, reducedMotion) => {
        if (!reducedMotion) group.rotation.y = -0.18 + Math.sin(motion * 0.35) * 0.05
        electrons.forEach(electron => {
            const { radius, tilt, angle, speed } = electron.userData
            const point = new THREE.Vector3(
                Math.cos(angle + motion * speed) * radius,
                Math.sin(angle + motion * speed) * radius,
                0,
            ).applyEuler(new THREE.Euler(...tilt))
            electron.position.copy(point)
        })
    }
    group.userData.applyTheme = isDark => {
        group.children.forEach(child => {
            if (child.material?.transparent) child.material.opacity = isDark ? 0.52 : 0.36
        })
    }
    return group
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
    camera.position.set(5.4, 3.9, 6.6)

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.setClearAlpha(0)
    host.appendChild(renderer.domElement)

    controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.08
    controls.minDistance = 2.6
    controls.maxDistance = 14
    controls.target.set(0, 0, 0)

    renderer.domElement.addEventListener("dblclick", resetCamera)

    const ambient = new THREE.AmbientLight(0xffffff, 0.75)
    const key = new THREE.DirectionalLight(0xffffff, 1.15)
    key.position.set(4, 6, 5)
    const fill = new THREE.DirectionalLight(0x9ed8ff, 0.45)
    fill.position.set(-5, 2, -4)
    scene.add(ambient, key, fill)

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
    camera.position.set(5.4, 3.9, 6.6)
    controls.target.set(0, 0, 0)
    controls.update()
}

function updateSceneTheme() {
    if (!scene) return
    const isDark = document.documentElement.getAttribute("data-theme") === "dark"
    scene.fog = new THREE.Fog(isDark ? 0x151515 : 0xf7f3ef, 10, 20)
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
    if (modelGroup) modelGroup.rotation.y += activeModelId.value === "sodium-chloride" ? 0.0025 : 0.005
    if (controls) controls.update()
    if (renderer && scene && camera) renderer.render(scene, camera)
}

function buildActiveModel() {
    if (!scene) return
    clearModel()
    const builders = {
        water: createWaterModel,
        "carbon-dioxide": createCarbonDioxideModel,
        methane: createMethaneModel,
        "sodium-chloride": createSodiumChlorideModel,
        benzene: createBenzeneModel,
    }
    modelGroup = (builders[activeModelId.value] || createWaterModel)()
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
        if (Array.isArray(material)) material.forEach(disposeMaterial)
        else if (material) disposeMaterial(material)
    })
}

function disposeMaterial(material) {
    if (material.map) material.map.dispose()
    material.dispose()
}

const atomColors = {
    H: 0xffffff,
    O: 0xe74c3c,
    C: 0x222222,
    Na: 0x9b59b6,
    Cl: 0x2ecc71,
}

function atom(element, radius, position, label = element) {
    const material = new THREE.MeshPhysicalMaterial({
        color: atomColors[element] || 0x95a5a6,
        roughness: 0.28,
        metalness: 0.05,
        clearcoat: 0.45,
    })
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(radius, 48, 28), material)
    mesh.position.copy(position)
    mesh.userData.label = label
    return mesh
}

function bond(start, end, radius = 0.055, color = 0xb0b7c3) {
    return createCylinderBetween(start, end, radius, color)
}

function createWaterModel() {
    const group = new THREE.Group()
    const bondLen = 1.55
    const halfAngle = 104.5 / 2 * Math.PI / 180
    const oxygen = new THREE.Vector3(0, 0, 0)
    const h1 = new THREE.Vector3(Math.sin(halfAngle) * bondLen, Math.cos(halfAngle) * bondLen, 0)
    const h2 = new THREE.Vector3(-Math.sin(halfAngle) * bondLen, Math.cos(halfAngle) * bondLen, 0)

    group.add(atom("O", 0.58, oxygen), atom("H", 0.32, h1), atom("H", 0.32, h2))
    group.add(bond(oxygen, h1), bond(oxygen, h2))
    group.add(createAngleArc(oxygen, 0.82, 104.5, 0xf1c40f))
    addLabelSprite(group, "O", new THREE.Vector3(0, -0.82, 0), "#e74c3c")
    addLabelSprite(group, "104.5°", new THREE.Vector3(0, 0.72, 0.08), "#f1c40f", 0.8)
    return group
}

function createCarbonDioxideModel() {
    const group = new THREE.Group()
    const c = new THREE.Vector3(0, 0, 0)
    const o1 = new THREE.Vector3(-1.75, 0, 0)
    const o2 = new THREE.Vector3(1.75, 0, 0)

    group.add(atom("O", 0.52, o1), atom("C", 0.45, c), atom("O", 0.52, o2))
    group.add(bond(o1, c, 0.06), bond(c, o2, 0.06))
    group.add(createCylinderBetween(new THREE.Vector3(-1.35, 0.16, 0), new THREE.Vector3(-0.4, 0.16, 0), 0.025, 0xd0d7de))
    group.add(createCylinderBetween(new THREE.Vector3(0.4, 0.16, 0), new THREE.Vector3(1.35, 0.16, 0), 0.025, 0xd0d7de))
    addLabelSprite(group, "180° 直线型", new THREE.Vector3(0, 0.95, 0), "#3498db", 1.15)
    return group
}

function createMethaneModel() {
    const group = new THREE.Group()
    const center = new THREE.Vector3(0, 0, 0)
    const dirs = [
        new THREE.Vector3(1, 1, 1),
        new THREE.Vector3(1, -1, -1),
        new THREE.Vector3(-1, 1, -1),
        new THREE.Vector3(-1, -1, 1),
    ].map(v => v.normalize().multiplyScalar(1.65))

    group.add(atom("C", 0.52, center))
    dirs.forEach(pos => {
        group.add(atom("H", 0.31, pos), bond(center, pos, 0.055))
    })
    addLabelSprite(group, "正四面体", new THREE.Vector3(0, 1.85, 0), "#9b59b6", 1.0)
    addLabelSprite(group, "约 109.5°", new THREE.Vector3(1.55, -1.1, 0.6), "#f1c40f", 0.92)
    return group
}

function createSodiumChlorideModel() {
    const group = new THREE.Group()
    const gap = 0.78
    const count = 4
    const start = -(count - 1) * gap / 2
    const positions = []

    for (let x = 0; x < count; x++) {
        for (let y = 0; y < count; y++) {
            for (let z = 0; z < count; z++) {
                const element = (x + y + z) % 2 === 0 ? "Na" : "Cl"
                const pos = new THREE.Vector3(start + x * gap, start + y * gap, start + z * gap)
                positions.push({ pos, element })
                group.add(atom(element, element === "Na" ? 0.22 : 0.30, pos, element === "Na" ? "Na⁺" : "Cl⁻"))
            }
        }
    }

    const lineMaterial = new THREE.LineBasicMaterial({ color: 0xb0b7c3, transparent: true, opacity: 0.26 })
    positions.forEach((a, i) => {
        for (let j = i + 1; j < positions.length; j++) {
            const b = positions[j]
            const dist = a.pos.distanceTo(b.pos)
            if (Math.abs(dist - gap) < 0.01) {
                const geometry = new THREE.BufferGeometry().setFromPoints([a.pos, b.pos])
                group.add(new THREE.Line(geometry, lineMaterial))
            }
        }
    })

    addLabelSprite(group, "Na⁺", new THREE.Vector3(-1.9, 1.55, 0), "#9b59b6", 0.72)
    addLabelSprite(group, "Cl⁻", new THREE.Vector3(1.9, 1.55, 0), "#2ecc71", 0.72)
    return group
}

function createBenzeneModel() {
    const group = new THREE.Group()
    const carbonRadius = 1.45
    const hydrogenRadius = 2.08
    const carbons = []
    const hydrogens = []

    for (let i = 0; i < 6; i++) {
        const angle = Math.PI / 6 + i * Math.PI * 2 / 6
        carbons.push(new THREE.Vector3(Math.cos(angle) * carbonRadius, Math.sin(angle) * carbonRadius, 0))
        hydrogens.push(new THREE.Vector3(Math.cos(angle) * hydrogenRadius, Math.sin(angle) * hydrogenRadius, 0))
    }

    carbons.forEach((pos, i) => {
        group.add(atom("C", 0.28, pos), atom("H", 0.18, hydrogens[i]))
        group.add(bond(pos, hydrogens[i], 0.035, 0xd0d7de))
        group.add(bond(pos, carbons[(i + 1) % 6], 0.045, 0x6c7a86))
    })

    const ring = new THREE.Mesh(
        new THREE.TorusGeometry(0.72, 0.025, 10, 96),
        new THREE.MeshStandardMaterial({ color: 0xf1c40f, roughness: 0.35 })
    )
    group.add(ring)
    addLabelSprite(group, "平面六元环", new THREE.Vector3(0, 2.55, 0), "#f1c40f", 1.1)
    return group
}

function createAngleArc(center, radius, degree, color) {
    const points = []
    const start = (90 - degree / 2) * Math.PI / 180
    const end = (90 + degree / 2) * Math.PI / 180
    for (let i = 0; i <= 40; i++) {
        const t = start + (end - start) * i / 40
        points.push(new THREE.Vector3(center.x + Math.cos(t) * radius, center.y + Math.sin(t) * radius, 0.05))
    }
    return createTube(points, 0.018, color)
}

function createTube(points, radius, color) {
    const curve = new THREE.CatmullRomCurve3(points)
    return new THREE.Mesh(
        new THREE.TubeGeometry(curve, 48, radius, 10, false),
        new THREE.MeshStandardMaterial({ color, roughness: 0.36 })
    )
}

function createCylinderBetween(start, end, radius, color) {
    const dir = new THREE.Vector3().subVectors(end, start)
    const len = dir.length()
    const geometry = new THREE.CylinderGeometry(radius, radius, len, 16)
    const material = new THREE.MeshStandardMaterial({ color, roughness: 0.34 })
    const mesh = new THREE.Mesh(geometry, material)
    mesh.position.copy(start).add(end).multiplyScalar(0.5)
    mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize())
    return mesh
}

function addLabelSprite(group, text, position, color, scale = 1) {
    const canvas = document.createElement("canvas")
    canvas.width = 256
    canvas.height = 96
    const ctx = canvas.getContext("2d")
    ctx.fillStyle = "rgba(255,255,255,0.93)"
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
    sprite.scale.set(1.25 * scale, 0.47 * scale, 1)
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
.chem-page {
    position: relative;
    z-index: 2;
    width: min(1280px, calc(100% - 48px));
    margin: -32px auto 0;
}

.periodic-entry {
    width: calc(100% - 40px);
    min-height: 260px;
    display: grid;
    grid-template-columns: minmax(0, 1fr) 360px;
    align-items: center;
    gap: 50px;
    margin: 0 20px 18px;
    padding: 38px 44px;
    border: 1px solid color-mix(in srgb, #2aa27f 38%, var(--border));
    border-radius: var(--radius-lg);
    background: radial-gradient(circle at 82% 40%, rgba(42, 162, 127, .15), transparent 34%), var(--bg-card);
    color: var(--text);
    text-decoration: none;
    box-shadow: var(--shadow);
    transition: transform .3s, box-shadow .3s, border-color .3s;
}
.periodic-entry:hover {
    border-color: #2aa27f;
    box-shadow: var(--shadow-hover);
    transform: translateY(-3px);
    text-decoration: none;
}

.entry-copy > span {
    color: #2aa27f;
    font-family: var(--mono);
    font-size: 9px;
    font-weight: 700;
    letter-spacing: .12em;
}

.entry-copy h2 {
    max-width: 620px;
    margin: 14px 0 10px;
    font-size: clamp(26px, 4vw, 42px);
    line-height: 1.2;
}

.entry-copy p {
    max-width: 600px;
    color: var(--text-secondary);
    font-size: 13px;
    line-height: 1.8;
}

.entry-copy b {
    display: inline-block;
    margin-top: 24px;
    color: #2aa27f;
    font-size: 12px;
}

.mini-table {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 7px;
    transform: perspective(700px) rotateY(-10deg) rotateX(4deg);
}

.mini-table i {
    aspect-ratio: 1;
    border: 1px solid rgba(42, 162, 127, .3);
    border-radius: 5px;
    background: rgba(42, 162, 127, .08);
}

.mini-table i.active {
    background: #2aa27f;
    box-shadow: 0 6px 18px rgba(42, 162, 127, .26);
}

.chem-layout {
    display: grid;
    grid-template-columns: 230px minmax(0, 1fr) 290px;
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
    padding: 11px;
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

.formula {
    width: 46px;
    height: 36px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    border-radius: 10px;
    background: var(--bg-card-hover);
    font-family: var(--mono);
    font-size: 14px;
    font-weight: 800;
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
        radial-gradient(circle at 30% 20%, rgba(46, 204, 113, 0.14), transparent 32%),
        radial-gradient(circle at 76% 72%, rgba(52, 152, 219, 0.14), transparent 34%),
        linear-gradient(135deg, rgba(255,255,255,0.70), rgba(245,245,245,0.35));
}

:root[data-theme="dark"] .three-viewer {
    background:
        radial-gradient(circle at 30% 20%, rgba(46, 204, 113, 0.12), transparent 32%),
        radial-gradient(circle at 76% 72%, rgba(52, 152, 219, 0.12), transparent 34%),
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

@media (max-width: 1020px) {
    .periodic-entry {
        grid-template-columns: 1fr 260px;
        gap: 24px;
        padding: 30px;
    }

    .chem-layout {
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
    .chem-page {
        width: min(100% - 32px, 1280px);
    }

    .periodic-entry {
        width: calc(100% - 20px);
        grid-template-columns: 1fr;
        margin-inline: 10px;
        padding: 24px;
    }

    .mini-table {
        display: none;
    }

    .chem-layout {
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
