<template>
    <div class="subject-page">
        <DepthLabHero
            eyebrow="MATHEMATICS LAB / 数学实验室"
            :title-lines="['把抽象关系', '变成看得见的变化']"
            description="拖动变量、改变图形、重复试验，让函数、几何与概率在眼前展开。"
            accent="#477cdb"
            accent2="#7fa8ee"
            scene-label="MODULE MAP / 002"
            :actions="[
                { label: '进入函数画布', to: '/math-lab/function-lab', variant: 'primary' },
                { label: '进入关卡挑战', to: '/math-lab/levels', variant: 'outline' },
                { label: '进入立体几何', to: '/math-lab/geometry-lab', variant: 'outline' },
                { label: '进入概率实验', to: '/math-lab/probability-lab', variant: 'outline' },
            ]"
            :meta-items="[
                { value: '04', label: '个开放模块' },
                { value: 'LIVE', label: '已上线' },
            ]"
            :devices="[buildFunctionDevice]"
            :particle-color="0x5f8fd6"
            :particle-color-dark="0x8fb2ea"
        />

        <FunctionLabLaunch />

        <MathLevelsLaunch />

        <GeometryLabLaunch />

        <ProbabilityLabLaunch />

        <SubjectModules
            kicker="01 / MODULES"
            title="四种方式，让规律自己动起来。"
            description="从函数画布到目标关卡，再到立体几何与概率实验，每一种观察都是一类学习入口。"
            accent="#477cdb"
            :items="modules"
            :links="moduleLinks"
        />
    </div>
</template>

<script setup>
import * as THREE from "three"
import DepthLabHero from "../../components/DepthLabHero.vue"
import FunctionLabLaunch from "../../components/FunctionLabLaunch.vue"
import MathLevelsLaunch from "../../components/MathLevelsLaunch.vue"
import GeometryLabLaunch from "../../components/GeometryLabLaunch.vue"
import ProbabilityLabLaunch from "../../components/ProbabilityLabLaunch.vue"
import SubjectModules from "../../components/SubjectModules.vue"

const modules = [
    { name: "函数画布", desc: "调节参数并观察曲线变化，建立表达式与图像之间的对应关系。" },
    { name: "函数关卡", desc: "带着目标调节参数，让函数图像满足条件，逐关解锁进阶。" },
    { name: "立体几何", desc: "旋转查看棱柱、棱锥与旋转体，在三维空间中理解点、线、面和体积表面积。" },
    { name: "概率实验", desc: "重复随机试验并汇总结果，从频率变化中理解概率规律。" },
]

const moduleLinks = {
    "函数画布": "/math-lab/function-lab",
    "函数关卡": "/math-lab/levels",
    "立体几何": "/math-lab/geometry-lab",
    "概率实验": "/math-lab/probability-lab",
}

/** 正弦波装置：曲线随相位流动，小球沿波形滑行 */
function buildWaveDevice() {
    const group = new THREE.Group()
    const N = 61
    const positions = new Float32Array(N * 3)
    const geo = new THREE.BufferGeometry()
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3))
    const line = new THREE.Line(geo, new THREE.LineBasicMaterial({ color: 0x477cdb, transparent: true, opacity: 0.75 }))
    group.add(line)

    const ball = new THREE.Mesh(
        new THREE.SphereGeometry(0.11, 22, 22),
        new THREE.MeshStandardMaterial({ color: 0x5f8fd6, emissive: 0x224a9b, emissiveIntensity: 1.5, roughness: 0.3 }),
    )
    group.add(ball)

    group.position.set(1.9, -0.2, 0.2)
    const AMP = 0.65
    const K = 2
    group.userData.animate = motion => {
        const phase = motion * 1.2
        const pos = geo.attributes.position
        for (let i = 0; i < N; i += 1) {
            const x = -2.4 + (i / (N - 1)) * 4.8
            pos.setXYZ(i, x, AMP * Math.sin(x * K + phase), 0)
        }
        pos.needsUpdate = true
        const t = (motion * 0.45) % 1
        const bx = -2.4 + t * 4.8
        ball.position.set(bx, AMP * Math.sin(bx * K + phase), 0.05)
    }
    return group
}

/** 函数坐标系装置：右侧坐标轴 + 二次函数抛物线 + 一次函数直线 */
function buildFunctionDevice() {
    const group = new THREE.Group()
    const axisMat = new THREE.LineBasicMaterial({ color: 0x7a8da6, transparent: true, opacity: 0.7 })
    const gridMat = new THREE.LineBasicMaterial({ color: 0x7fa8ee, transparent: true, opacity: 0.14 })
    const quadraticMat = new THREE.LineBasicMaterial({ color: 0x477cdb, transparent: true, opacity: 0.95 })
    const linearMat = new THREE.LineBasicMaterial({ color: 0xe8bd6a, transparent: true, opacity: 0.95 })
    const xMin = -2.4
    const xMax = 2.4
    const yMin = -2.5
    const yMax = 2.5
    const axisZ = 0.08

    // 坐标网格与 x/y 轴
    for (let x = -2; x <= 2; x += 1) {
        group.add(new THREE.Line(
            new THREE.BufferGeometry().setFromPoints([
                new THREE.Vector3(x, yMin, 0),
                new THREE.Vector3(x, yMax, 0),
            ]), gridMat,
        ))
    }
    for (let y = -2; y <= 2; y += 1) {
        group.add(new THREE.Line(
            new THREE.BufferGeometry().setFromPoints([
                new THREE.Vector3(xMin, y, 0),
                new THREE.Vector3(xMax, y, 0),
            ]), gridMat,
        ))
    }
    group.add(new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(xMin, 0, axisZ),
            new THREE.Vector3(xMax, 0, axisZ),
        ]), axisMat,
    ))
    group.add(new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(0, yMin, axisZ),
            new THREE.Vector3(0, yMax, axisZ),
        ]), axisMat,
    ))

    // y = 0.42x² - 0.7：开口向上，顶点落在坐标系中部
    const quadraticPoints = []
    for (let i = 0; i <= 80; i += 1) {
        const x = xMin + (i / 80) * (xMax - xMin)
        quadraticPoints.push(new THREE.Vector3(x, 0.42 * x * x - 0.7, 0.12))
    }
    group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(quadraticPoints), quadraticMat))

    // y = -0.55x + 1.2
    const linearPoints = [
        new THREE.Vector3(xMin, -0.55 * xMin + 1.2, 0.13),
        new THREE.Vector3(xMax, -0.55 * xMax + 1.2, 0.13),
    ]
    group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(linearPoints), linearMat))

    // 标记二次函数顶点与两条函数的交点，增加读图感
    const pointMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, emissive: 0x6b3d00, emissiveIntensity: 0.8 })
    const vertex = new THREE.Mesh(new THREE.SphereGeometry(0.08, 14, 10), pointMat)
    vertex.position.set(0, -0.7, 0.17)
    group.add(vertex)

    group.position.set(2.7, 0.15, 0)
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
