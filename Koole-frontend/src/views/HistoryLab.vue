<template>
    <div class="subject-page">
        <DepthLabHero
            eyebrow="HISTORY LAB / 历史实验室"
            :title-lines="['沿着时间与人物', '看清因果联系']"
            description="沿着时间、人物与事件寻找因果联系，看见时代如何一步步发生变化。"
            accent="#a8744c"
            accent2="#c9a06a"
            scene-label="MODULE MAP / 008"
            :actions="[{ label: '查看规划', scroll: '#modules', variant: 'outline' }]"
            :meta-items="[
                { value: '03', label: '个规划模块' },
                { value: 'ING', label: '建设中' },
            ]"
            :devices="[buildTimelineDevice]"
            :particle-color="0xb08a60"
            :particle-color-dark="0xd0b090"
        />

        <SubjectModules
            kicker="01 / MODULES"
            title="让时间线可以被拖动。"
            description="事件、人物与因果，回到时间尺度上一起看，时代的变化才连得起来。"
            accent="#a8744c"
            :items="modules"
        />
    </div>
</template>

<script setup>
import * as THREE from "three"
import DepthLabHero from "../components/DepthLabHero.vue"
import SubjectModules from "../components/SubjectModules.vue"

const modules = [
    { name: "动态时间线", desc: "把分散事件放回同一时间尺度，观察前后关系与历史阶段。" },
    { name: "人物图谱", desc: "连接人物、组织与立场，理解个人选择如何嵌入时代背景。" },
    { name: "事件因果", desc: "比较背景、过程和影响，分析历史变化中的多重原因。" },
]

/** 历史时间线：单条年代轴、事件节点与人物/事件标签 */
function buildTimelineDevice() {
    const group = new THREE.Group()
    const lineMaterial = new THREE.LineBasicMaterial({ color: 0xc9a06a, transparent: true, opacity: 0.72 })
    const timeline = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(-2.7, 0, 0),
            new THREE.Vector3(2.7, 0, 0),
        ]),
        lineMaterial,
    )
    group.add(timeline)

    const nodeColors = [0xd87575, 0xc9a06a, 0x7fa8ee, 0x9fc58b]
    const events = [
        ["文明", -2.25, 0.42, 0.1, 0.34],
        ["制度", -0.78, -0.5, -0.08, 0.42],
        ["交流", 0.72, 0.48, 0.05, 0.38],
        ["变革", 2.25, -0.5, -0.1, 0.46],
    ]
    const labels = []
    events.forEach(([text, x, y, z, speed], index) => {
        const node = new THREE.Mesh(
            new THREE.SphereGeometry(0.11, 20, 16),
            new THREE.MeshStandardMaterial({
                color: nodeColors[index],
                emissive: nodeColors[index],
                emissiveIntensity: 0.45,
                roughness: 0.3,
            }),
        )
        node.position.set(x, 0, z)
        group.add(node)
        const stem = new THREE.Line(
            new THREE.BufferGeometry().setFromPoints([
                new THREE.Vector3(x, 0, z),
                new THREE.Vector3(x, y * 0.7, z),
            ]),
            lineMaterial,
        )
        group.add(stem)
        const label = makeTimelineLabel(text, nodeColors[index])
        label.position.set(x, y, z)
        label.scale.set(1.1, 0.42, 1)
        label.userData.baseX = x
        label.userData.baseY = y
        label.userData.speed = speed
        label.userData.phase = index * 1.2
        group.add(label)
        labels.push(label)
    })

    group.position.set(2.0, 0.2, 0)
    group.rotation.z = -0.08
    group.userData.animate = (motion, reducedMotion) => {
        if (reducedMotion) return
        labels.forEach(label => {
            const t = motion * label.userData.speed + label.userData.phase
            label.position.x = label.userData.baseX + Math.sin(t) * 0.04
            label.position.y = label.userData.baseY + Math.sin(t * 0.8) * 0.06
        })
    }
    return group
}

function makeTimelineLabel(text, color) {
    const canvas = document.createElement("canvas")
    canvas.width = 512
    canvas.height = 192
    const context = canvas.getContext("2d")
    context.font = "700 72px Arial, sans-serif"
    context.textAlign = "center"
    context.textBaseline = "middle"
    context.fillStyle = "#5f4737"
    context.fillText(text, 256, 96)
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

@media (max-width: 680px) {
    .subject-page { width: min(100% - 32px, 1180px); }
}
</style>
