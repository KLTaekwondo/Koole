<template>
    <div class="subject-page">
        <DepthLabHero
            eyebrow="GEOGRAPHY LAB / 地理实验室"
            :title-lines="['转动地球', '理解空间的规律']"
            description="转动地球、展开地图、观察气候变化，从空间关系中理解自然与人类活动。"
            accent="#2b9cab"
            accent2="#56c5d5"
            scene-label="MODULE MAP / 009"
            :actions="[{ label: '查看规划', scroll: '#modules', variant: 'outline' }]"
            :meta-items="[
                { value: '03', label: '个规划模块' },
                { value: 'ING', label: '建设中' },
            ]"
            :devices="[buildGlobeDevice]"
            :particle-color="0x4fb4c4"
            :particle-color-dark="0x86d2de"
        />

        <SubjectModules
            kicker="01 / MODULES"
            title="从地球尺度看世界。"
            description="空间、分布与气候，三层视角逐步拉近，让自然规律从地图中显现出来。"
            accent="#2b9cab"
            :items="modules"
        />
    </div>
</template>

<script setup>
import * as THREE from "three"
import DepthLabHero from "../components/DepthLabHero.vue"
import SubjectModules from "../components/SubjectModules.vue"

const modules = [
    { name: "三维地球", desc: "从全球尺度观察经纬、地形和板块之间的空间关系。" },
    { name: "地图分析", desc: "切换图层并比较区域差异，让分布规律从地图中显现出来。" },
    { name: "气候系统", desc: "调节纬度、海陆与环流条件，观察气候要素如何相互影响。" },
]

/** 地球仪：带陆地纹理、倾斜地轴、子午环和稳定底座 */
function buildGlobeDevice() {
    const group = new THREE.Group()
    const globePivot = new THREE.Group()
    globePivot.rotation.z = -23.4 * Math.PI / 180
    group.add(globePivot)

    const mapCanvas = document.createElement("canvas")
    mapCanvas.width = 1024
    mapCanvas.height = 512
    const context = mapCanvas.getContext("2d")
    context.fillStyle = "#287f9b"
    context.fillRect(0, 0, mapCanvas.width, mapCanvas.height)
    context.fillStyle = "#77ae68"

    // 简化大陆轮廓，重点保留世界地图的整体识别感。
    const continents = [
        [[70, 105], [145, 72], [225, 95], [250, 145], [205, 180], [180, 238], [125, 220], [95, 165]],
        [[250, 250], [310, 275], [330, 350], [300, 435], [260, 390], [235, 310]],
        [[465, 120], [535, 90], [610, 115], [660, 95], [750, 120], [805, 175], [755, 215], [675, 190], [625, 235], [565, 210], [525, 165]],
        [[530, 225], [610, 220], [650, 285], [620, 370], [565, 405], [525, 330], [500, 265]],
        [[820, 335], [885, 315], [930, 350], [910, 395], [845, 400], [810, 365]],
        [[900, 115], [935, 95], [955, 120], [935, 145]],
    ]
    continents.forEach(points => {
        context.beginPath()
        context.moveTo(points[0][0], points[0][1])
        points.slice(1).forEach(([x, y]) => context.lineTo(x, y))
        context.closePath()
        context.fill()
    })

    // 极区与少量地形色块，避免球面像单纯的双色玩具球。
    context.fillStyle = "rgba(235, 244, 231, 0.82)"
    context.fillRect(0, 0, 1024, 25)
    context.fillRect(0, 487, 1024, 25)
    context.fillStyle = "rgba(220, 190, 104, 0.35)"
    context.beginPath()
    context.ellipse(600, 270, 62, 30, -0.2, 0, Math.PI * 2)
    context.fill()

    const mapTexture = new THREE.CanvasTexture(mapCanvas)
    mapTexture.colorSpace = THREE.SRGBColorSpace
    const globeMaterial = new THREE.MeshStandardMaterial({ map: mapTexture, roughness: 0.66, metalness: 0.02 })
    const globe = new THREE.Mesh(new THREE.SphereGeometry(1.28, 64, 40), globeMaterial)
    globePivot.add(globe)

    const gridMaterial = new THREE.LineBasicMaterial({ color: 0xb9edf1, transparent: true, opacity: 0.22 })
    const grid = new THREE.LineSegments(
        new THREE.WireframeGeometry(new THREE.SphereGeometry(1.292, 24, 12)),
        gridMaterial,
    )
    globe.add(grid)

    const frameMaterial = new THREE.MeshStandardMaterial({ color: 0xb48a4a, roughness: 0.38, metalness: 0.55 })
    const meridian = new THREE.Mesh(
        new THREE.TorusGeometry(1.45, 0.035, 10, 120),
        frameMaterial,
    )
    globePivot.add(meridian)

    const axis = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 3.35, 12), frameMaterial)
    globePivot.add(axis)

    const support = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.11, 1.0, 16), frameMaterial)
    support.position.y = -1.78
    group.add(support)
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.72, 0.9, 0.16, 36), frameMaterial)
    base.position.y = -2.3
    group.add(base)

    group.position.set(2.05, 0.45, 0)
    group.userData.animate = (motion, reducedMotion) => {
        globe.rotation.y = reducedMotion ? 0.4 : 0.4 + motion * 0.09
    }
    group.userData.applyTheme = isDark => {
        gridMaterial.opacity = isDark ? 0.32 : 0.18
        frameMaterial.color.setHex(isDark ? 0xd1a65f : 0xb48a4a)
    }
    return group
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
    .subject-page {
        width: min(100% - 32px, 1180px);
    }
}
</style>
