<template>
    <Teleport to="body">
        <div class="home-scene" aria-hidden="true">
            <div ref="sceneHost" class="scene-host"></div>
        </div>
    </Teleport>
</template>

<script setup>
// 首页背景的三维原子场景。
// 单独拆成一个组件并由 HomeIndex 异步加载：Three.js 体积较大，首屏不需要等它，
// 先出文字与卡片，场景随后补上（失败也不影响首页可用）。
import { onBeforeUnmount, onMounted, ref, watch } from "vue"
import * as THREE from "three"
import { theme } from "../stores/theme.js"

const sceneHost = ref(null)

let renderer = null
let scene = null
let camera = null
let atom = null
let particles = null
let resizeObserver = null
let animationId = 0
let themeStop = null
let pointerX = 0
let pointerY = 0
let reducedMotion = false

function initScene() {
    const host = sceneHost.value
    if (!host) return

    reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    scene = new THREE.Scene()
    camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100)
    camera.position.set(0, 0, 8)

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: "high-performance" })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
    renderer.outputColorSpace = THREE.SRGBColorSpace
    host.appendChild(renderer.domElement)

    atom = new THREE.Group()
    atom.position.set(2.15, 0, 0)
    scene.add(atom)

    const core = new THREE.Mesh(
        new THREE.IcosahedronGeometry(1.08, 3),
        new THREE.MeshPhysicalMaterial({ color: 0xe2683f, emissive: 0x6b1d0d, emissiveIntensity: 0.35, roughness: 0.3, metalness: 0.08, clearcoat: 0.9 }),
    )
    core.name = "core"
    atom.add(core)

    const shell = new THREE.Mesh(
        new THREE.IcosahedronGeometry(1.2, 2),
        new THREE.MeshBasicMaterial({ color: 0xffad8d, wireframe: true, transparent: true, opacity: 0.24 }),
    )
    shell.name = "shell"
    atom.add(shell)

    const orbitSpecs = [
        { radius: 2.1, squash: 0.43, rotation: [0.2, 0.2, -0.35], color: 0x5ecad4, phase: 0 },
        { radius: 2.55, squash: 0.39, rotation: [1.05, 0.4, 0.62], color: 0xf0a170, phase: 2.1 },
        { radius: 2.95, squash: 0.36, rotation: [0.55, 1.2, 1.1], color: 0xb9dadd, phase: 4.2 },
    ]

    atom.userData.electrons = orbitSpecs.map(spec => {
        const points = new THREE.EllipseCurve(0, 0, spec.radius, spec.radius * spec.squash, 0, Math.PI * 2)
            .getPoints(160)
            .map(point => new THREE.Vector3(point.x, point.y, 0))
        const orbit = new THREE.LineLoop(
            new THREE.BufferGeometry().setFromPoints(points),
            new THREE.LineBasicMaterial({ color: spec.color, transparent: true, opacity: 0.62 }),
        )
        orbit.rotation.set(...spec.rotation)
        atom.add(orbit)

        const electron = new THREE.Mesh(
            new THREE.SphereGeometry(0.11, 20, 20),
            new THREE.MeshStandardMaterial({ color: spec.color, emissive: spec.color, emissiveIntensity: 2 }),
        )
        atom.add(electron)
        return { electron, ...spec, rotation: new THREE.Euler(...spec.rotation) }
    })

    const particlePositions = []
    for (let index = 0; index < 220; index += 1) {
        particlePositions.push(
            THREE.MathUtils.randFloatSpread(16),
            THREE.MathUtils.randFloatSpread(10),
            THREE.MathUtils.randFloat(-6, 1),
        )
    }
    const particleGeometry = new THREE.BufferGeometry()
    particleGeometry.setAttribute("position", new THREE.Float32BufferAttribute(particlePositions, 3))
    particles = new THREE.Points(
        particleGeometry,
        new THREE.PointsMaterial({ color: 0x6e9da2, size: 0.035, transparent: true, opacity: 0.7 }),
    )
    scene.add(particles)

    scene.add(new THREE.HemisphereLight(0xffffff, 0x6c777c, 2.2))
    const warmLight = new THREE.PointLight(0xff9a72, 13, 18)
    warmLight.position.set(3.5, 2.4, 4)
    scene.add(warmLight)
    const coolLight = new THREE.PointLight(0x70d5dd, 8, 16)
    coolLight.position.set(-3, -1.5, 3)
    scene.add(coolLight)

    applySceneTheme()
    resizeObserver = new ResizeObserver(resizeScene)
    resizeObserver.observe(host)
    window.addEventListener("pointermove", updatePointer, { passive: true })
    resizeScene()
    animateScene()
}

function applySceneTheme() {
    if (!renderer || !scene || !atom || !particles) return
    const isDark = theme.value === "dark"
    renderer.setClearColor(isDark ? 0x111516 : 0xf4f3ef, 1)
    scene.fog = new THREE.FogExp2(isDark ? 0x111516 : 0xf4f3ef, isDark ? 0.045 : 0.035)

    const core = atom.getObjectByName("core")
    const shell = atom.getObjectByName("shell")
    core.material.color.setHex(isDark ? 0xd75549 : 0xe2683f)
    core.material.emissive.setHex(isDark ? 0x55100c : 0x6b1d0d)
    core.material.emissiveIntensity = isDark ? 0.72 : 0.35
    shell.material.color.setHex(isDark ? 0xff9b91 : 0xd85f3b)
    particles.material.color.setHex(isDark ? 0x91d4da : 0x668f93)
}

function resizeScene() {
    const host = sceneHost.value
    if (!host || !renderer || !camera) return
    const width = Math.max(host.clientWidth, 1)
    const height = Math.max(host.clientHeight, 1)
    renderer.setSize(width, height, false)
    camera.aspect = width / height
    camera.updateProjectionMatrix()
}

function updatePointer(event) {
    pointerX = (event.clientX / window.innerWidth - 0.5) * 2
    pointerY = (event.clientY / window.innerHeight - 0.5) * 2
}

function animateScene(time = 0) {
    if (!renderer || !scene || !camera || !atom) return
    const seconds = time * 0.001
    const motion = reducedMotion ? 0 : seconds

    atom.rotation.y += (pointerX * 0.16 + motion * 0.12 - atom.rotation.y) * 0.035
    atom.rotation.x += (0.15 - pointerY * 0.1 - atom.rotation.x) * 0.035
    atom.position.y = reducedMotion ? 0 : Math.sin(seconds * 0.72) * 0.12
    atom.userData.electrons.forEach(item => {
        const angle = motion * 0.72 + item.phase
        const point = new THREE.Vector3(item.radius * Math.cos(angle), item.radius * item.squash * Math.sin(angle), 0)
        item.electron.position.copy(point.applyEuler(item.rotation))
    })
    if (particles && !reducedMotion) particles.rotation.y = seconds * 0.012

    camera.position.x += (pointerX * 0.18 - camera.position.x) * 0.025
    camera.position.y += (pointerY * -0.1 - camera.position.y) * 0.025
    camera.lookAt(0.75, 0, 0)
    renderer.render(scene, camera)
    animationId = requestAnimationFrame(animateScene)
}

function disposeScene() {
    cancelAnimationFrame(animationId)
    resizeObserver?.disconnect()
    window.removeEventListener("pointermove", updatePointer)
    scene?.traverse(object => {
        object.geometry?.dispose()
        if (Array.isArray(object.material)) object.material.forEach(material => material.dispose())
        else object.material?.dispose()
    })
    renderer?.dispose()
    renderer?.domElement.remove()
    renderer = null
    scene = null
    camera = null
    atom = null
    particles = null
}

onMounted(() => {
    initScene()
    themeStop = watch(theme, applySceneTheme)
})

onBeforeUnmount(() => {
    themeStop?.()
    disposeScene()
})
</script>

<style scoped>
.home-scene {
    position: fixed;
    inset: var(--nav-height) 0 0;
    z-index: 1;
    overflow: hidden;
    pointer-events: none;
}

.scene-host,
.scene-host :deep(canvas) {
    width: 100%;
    height: 100%;
    display: block;
}
</style>
