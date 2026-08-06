<template>
    <div class="subject-page">
        <DepthLabHero
            eyebrow="POLITICS LAB / 政治实验室"
            :title-lines="['连接概念与制度', '建立思考框架']"
            description="连接概念、制度与现实案例，在关系和变化中建立完整的思考框架。"
            accent="#b05ac8"
            accent2="#ed87aa"
            scene-label="MODULE MAP / 007"
            :actions="[{ label: '查看规划', scroll: '#modules', variant: 'outline' }]"
            :meta-items="[
                { value: '03', label: '个规划模块' },
                { value: 'ING', label: '建设中' },
            ]"
            :devices="[buildConceptNetworkDevice]"
            :particle-color="0xb96ccc"
            :particle-color-dark="0xeda0bc"
        />

        <SubjectModules
            kicker="01 / MODULES"
            title="从概念出发，建立框架。"
            description="概念、制度与案例三层递进，让知识彼此连接，让观点有依据。"
            accent="#d56f9f"
            :items="modules"
        />
    </div>
</template>

<script setup>
import * as THREE from "three"
import DepthLabHero from "../components/DepthLabHero.vue"
import SubjectModules from "../components/SubjectModules.vue"

const modules = [
    { name: "概念网络", desc: "梳理核心概念及其联系，避免知识点停留在孤立的定义上。" },
    { name: "制度结构", desc: "分层展示制度构成、运行机制和各部分之间的作用关系。" },
    { name: "现实案例", desc: "把理论放入具体情境，通过案例比较理解观点的适用条件。" },
]

/** 概念网络：中心概念连接制度、权利与责任，体现政治知识的结构关系 */
function buildConceptNetworkDevice() {
    const group = new THREE.Group()
    const center = new THREE.Vector3(0, 0.15, 0)
    const nodes = [
        ["制度", -1.65, 1.15, 0x4f8df5],
        ["权利", 1.65, 1.0, 0xd87575],
        ["责任", -1.55, -1.05, 0x6ca647],
        ["案例", 1.65, -1.2, 0xe0b252],
    ]
    const linkMaterial = new THREE.LineBasicMaterial({ color: 0xcf9136, transparent: true, opacity: 0.42 })
    nodes.forEach(([text, x, y, color]) => {
        group.add(new THREE.Line(
            new THREE.BufferGeometry().setFromPoints([center, new THREE.Vector3(x, y, 0)]),
            linkMaterial,
        ))
        const node = new THREE.Mesh(
            new THREE.SphereGeometry(0.14, 20, 16),
            new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.45, roughness: 0.3 }),
        )
        node.position.set(x, y, 0)
        group.add(node)
        const label = makeConceptLabel(text)
        label.position.set(x, y + (y > center.y ? 0.34 : -0.34), 0.05)
        label.scale.set(1.2, 0.45, 1)
        group.add(label)
    })

    const core = new THREE.Mesh(
        new THREE.SphereGeometry(0.42, 28, 20),
        new THREE.MeshStandardMaterial({ color: 0xcf9136, emissive: 0x6d4610, emissiveIntensity: 0.7, roughness: 0.25, metalness: 0.25 }),
    )
    core.position.copy(center)
    group.add(core)
    const coreLabel = makeConceptLabel("政治", true)
    coreLabel.position.set(center.x, center.y - 0.68, 0.08)
    coreLabel.scale.set(1.35, 0.5, 1)
    group.add(coreLabel)

    group.position.set(2.0, 0.15, 0)
    group.userData.animate = (motion, reducedMotion) => {
        if (reducedMotion) return
        group.position.y = 0.15 + Math.sin(motion * 0.55) * 0.07
        core.scale.setScalar(1 + Math.sin(motion * 1.2) * 0.04)
    }
    return group
}

function makeConceptLabel(text, isCore = false) {
    const canvas = document.createElement("canvas")
    canvas.width = 384
    canvas.height = 144
    const context = canvas.getContext("2d")
    context.font = `${isCore ? "800" : "700"} 62px Arial, sans-serif`
    context.textAlign = "center"
    context.textBaseline = "middle"
    const gradient = context.createLinearGradient(86, 36, 298, 108)
    if (isCore) {
        gradient.addColorStop(0, "#cf9136")
        gradient.addColorStop(1, "#e56b8a")
        context.shadowColor = "rgba(229, 107, 138, 0.34)"
        context.shadowBlur = 14
    } else {
        gradient.addColorStop(0, "#b05ac8")
        gradient.addColorStop(1, "#ed87aa")
        context.shadowColor = "rgba(176, 90, 200, 0.22)"
        context.shadowBlur = 8
    }
    context.fillStyle = gradient
    context.fillText(text, 192, 72)
    const texture = new THREE.CanvasTexture(canvas)
    texture.colorSpace = THREE.SRGBColorSpace
    return new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, transparent: true, depthWrite: false }))
}
</script>

<style scoped>
.subject-page {
    position: relative;
    z-index: 2;
    width: min(1180px, calc(100% - 48px));
    margin: -32px auto 0;
}

.subject-page :deep(.eyebrow),
.subject-page :deep(.hero-copy h1 em),
.subject-page :deep(.section-heading small),
.subject-page :deep(.module-status),
.subject-page :deep(.module-item:hover h3) {
    background: linear-gradient(92deg, #b05ac8 10%, #ed87aa 90%);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
}

.subject-page :deep(.hero-button.primary) {
    border-color: #c968a1;
    background: linear-gradient(100deg, #b05ac8, #ed87aa);
}

.subject-page :deep(.hero-button.outline:hover) {
    border-color: #ed87aa;
    color: #d56f9f;
}

@media (max-width: 680px) {
    .subject-page { width: min(100% - 32px, 1180px); }
}
</style>
