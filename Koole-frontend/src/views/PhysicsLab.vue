<template>
    <div class="lab-page">
        <DepthLabHero
            eyebrow="PHYSICS LAB / 物理实验室"
            :title-lines="['把公式变成', '能看见的变化']"
            description="经典模型逐参数推演，物理关卡带目标挑战，沙盒模式自由搭建。三种入口，通往同一套物理规律。"
            accent="#3b82f6"
            accent2="#f59e0b"
            scene-label="MODE SELECT / 001"
            :actions="[
                { label: '进入经典模型', to: '/physics-lab/classic', variant: 'primary' },
                { label: '进入物理关卡', to: '/physics-lab/levels', variant: 'outline' },
                { label: '进入沙盒模式', to: '/physics-lab/sandbox', variant: 'outline' },
            ]"
            :meta-items="[
                { value: String(physicsCount), label: '个经典模型' },
                { value: '∞', label: '无限画布' },
                { value: '3', label: '种入口' },
            ]"
            :devices="devices"
        />

        <section class="modes-section">
            <header class="section-heading">
                <div>
                    <small>01 / MODES</small>
                    <h2>选择你的实验方式。</h2>
                </div>
                <p>经典模型适合逐参数验证规律，物理关卡用目标推动理解，沙盒模式适合自由搭建与试错。三种入口，三种节奏。</p>
            </header>

            <div class="modes-stage">
                <!-- 经典模型 -->
                <router-link to="/physics-lab/classic" class="mode-card mode-classic">
                    <div class="mode-deco deco-arc" aria-hidden="true">
                        <svg viewBox="0 0 200 96" fill="none">
                            <path d="M8 84 Q 62 4, 116 52 T 192 14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-dasharray="5 6" opacity="0.5"/>
                            <circle class="deco-ball" cx="192" cy="14" r="6" fill="currentColor"/>
                        </svg>
                    </div>
                    <div class="mode-top">
                        <span class="mode-index">01 / CLASSIC</span>
                        <span class="mode-chip">6 个模型</span>
                    </div>
                    <div class="mode-icon"><SvgIcon name="classic" :size="27" /></div>
                    <h3>经典模型</h3>
                    <p>六大经典物理模型，参数实时调节，模拟曲线同步对比，附带知识点讲解。</p>
                    <ul class="mode-features">
                        <li>参数实时调节</li>
                        <li>曲线图表对比</li>
                        <li>知识点讲解</li>
                    </ul>
                    <div class="mode-bottom">
                        <span>参数 · 曲线 · 知识点</span>
                        <b>进入 ↗</b>
                    </div>
                </router-link>

                <!-- 物理关卡 -->
                <router-link to="/physics-lab/levels" class="mode-card mode-levels">
                    <div class="mode-deco deco-levels" aria-hidden="true">
                        <span></span><span></span><span></span>
                    </div>
                    <div class="mode-top">
                        <span class="mode-index">02 / LEVELS</span>
                        <span class="mode-chip">6 个关卡</span>
                    </div>
                    <div class="mode-icon"><SvgIcon name="target" :size="27" /></div>
                    <h3>物理关卡</h3>
                    <p>带着明确目标调节参数，让实验结果落在指定范围内，完成后逐关解锁。</p>
                    <ul class="mode-features">
                        <li>目标实验</li>
                        <li>自动判定</li>
                        <li>章节解锁</li>
                    </ul>
                    <div class="mode-bottom">
                        <span>挑战 · 星级 · 解释</span>
                        <b>进入 ↗</b>
                    </div>
                </router-link>

                <!-- 沙盒模式 -->
                <router-link to="/physics-lab/sandbox" class="mode-card mode-sandbox">
                    <div class="mode-deco deco-grid" aria-hidden="true">
                        <span class="deco-ground"></span>
                        <span class="deco-ball"></span>
                    </div>
                    <div class="mode-top">
                        <span class="mode-index">02 / SANDBOX</span>
                        <span class="mode-chip">无限画布</span>
                    </div>
                    <div class="mode-icon"><SvgIcon name="sandbox" :size="27" /></div>
                    <h3>沙盒模式</h3>
                    <p>无限画布自由搭建，拖拽放置物理物体，重力、弹性、地面随手可调。</p>
                    <ul class="mode-features">
                        <li>无限画布</li>
                        <li>拖拽自由搭建</li>
                        <li>环境参数可调</li>
                    </ul>
                    <div class="mode-bottom">
                        <span>拖拽 · 搭建 · 调节</span>
                        <b>进入 ↗</b>
                    </div>
                </router-link>
            </div>
        </section>
    </div>
</template>

<script setup>
import * as THREE from "three"
import { PHYSICS_MODELS } from "../constants"
import DepthLabHero from "../components/DepthLabHero.vue"
import SvgIcon from "../components/SvgIcon.vue"

const physicsCount = PHYSICS_MODELS.length

/* ── 景深场景装置 ─────────────────────────────────────── */

/** 旋臂星系：由星核、四条旋臂与稀疏外围星体组成 */
function buildGalaxyDevice() {
    const group = new THREE.Group()
    const positions = []
    const lightColors = []
    const darkColors = []
    const lightColor = new THREE.Color()
    const darkColor = new THREE.Color()
    const arms = 4
    const starsPerArm = 480

    for (let arm = 0; arm < arms; arm += 1) {
        const armOffset = (arm / arms) * Math.PI * 2
        for (let index = 0; index < starsPerArm; index += 1) {
            const radius = 0.18 + Math.pow(index / starsPerArm, 0.72) * 3.25
            const angle = armOffset + radius * 1.55 + THREE.MathUtils.randFloatSpread(0.34)
            const spread = 0.08 + radius * 0.055
            positions.push(
                Math.cos(angle) * radius + THREE.MathUtils.randFloatSpread(spread),
                THREE.MathUtils.randFloatSpread(0.16 + radius * 0.05),
                Math.sin(angle) * radius + THREE.MathUtils.randFloatSpread(spread),
            )

            const mix = Math.min(radius / 3.4, 1)
            lightColor.set(0xc77b16).lerp(new THREE.Color(0x2657b8), mix)
            darkColor.set(0xffd89a).lerp(new THREE.Color(0x6f9cff), mix)
            lightColors.push(lightColor.r, lightColor.g, lightColor.b)
            darkColors.push(darkColor.r, darkColor.g, darkColor.b)
        }
    }

    // 少量离开主旋臂的星体，让边缘更自然。
    for (let index = 0; index < 280; index += 1) {
        const radius = THREE.MathUtils.randFloat(0.5, 3.7)
        const angle = Math.random() * Math.PI * 2
        positions.push(
            Math.cos(angle) * radius,
            THREE.MathUtils.randFloatSpread(0.28),
            Math.sin(angle) * radius,
        )
        lightColor.set(index % 5 === 0 ? 0xb66d0f : 0x315fae)
        darkColor.set(index % 5 === 0 ? 0xffe5b5 : 0x86a9ff)
        lightColors.push(lightColor.r, lightColor.g, lightColor.b)
        darkColors.push(darkColor.r, darkColor.g, darkColor.b)
    }

    const galaxyGeometry = new THREE.BufferGeometry()
    galaxyGeometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3))
    galaxyGeometry.setAttribute("color", new THREE.Float32BufferAttribute(lightColors, 3))
    const galaxyMaterial = new THREE.PointsMaterial({
        size: 0.052,
        sizeAttenuation: true,
        vertexColors: true,
        transparent: true,
        opacity: 0.9,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
    })
    group.add(new THREE.Points(galaxyGeometry, galaxyMaterial))

    const coreMaterial = new THREE.MeshBasicMaterial({
        color: 0xffd27a,
        transparent: true,
        opacity: 0.9,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
    })
    const core = new THREE.Mesh(new THREE.SphereGeometry(0.28, 28, 20), coreMaterial)
    core.scale.set(1.7, 0.45, 1.7)
    group.add(core)

    const haloMaterial = new THREE.MeshBasicMaterial({
        color: 0xb86d12,
        transparent: true,
        opacity: 0.26,
        side: THREE.DoubleSide,
        blending: THREE.NormalBlending,
        depthWrite: false,
    })
    const halo = new THREE.Mesh(
        new THREE.RingGeometry(0.34, 0.92, 64),
        haloMaterial,
    )
    halo.rotation.x = Math.PI / 2
    group.add(halo)

    group.position.set(2.45, 0.15, -0.35)
    group.rotation.set(0.42, -0.3, -0.1)
    group.userData.animate = (motion, reducedMotion) => {
        if (!reducedMotion) group.rotation.y = -0.3 + motion * 0.025
        core.material.opacity = reducedMotion ? 0.9 : 0.82 + Math.sin(motion * 1.4) * 0.08
    }
    group.userData.applyTheme = isDark => {
        galaxyGeometry.setAttribute("color", new THREE.Float32BufferAttribute(isDark ? darkColors : lightColors, 3))
        galaxyMaterial.opacity = isDark ? 0.95 : 0.92
        galaxyMaterial.blending = isDark ? THREE.AdditiveBlending : THREE.NormalBlending
        galaxyMaterial.needsUpdate = true
        coreMaterial.color.setHex(isDark ? 0xffd27a : 0xb7650d)
        coreMaterial.opacity = isDark ? 0.95 : 0.9
        coreMaterial.blending = isDark ? THREE.AdditiveBlending : THREE.NormalBlending
        coreMaterial.needsUpdate = true
        haloMaterial.color.setHex(isDark ? 0xffc96b : 0xb86d12)
        haloMaterial.opacity = isDark ? 0.17 : 0.26
        haloMaterial.blending = isDark ? THREE.AdditiveBlending : THREE.NormalBlending
        haloMaterial.needsUpdate = true
    }
    return group
}

const devices = [buildGalaxyDevice]
</script>

<style scoped>
.lab-page {
    position: relative;
    z-index: 2;
    width: min(1180px, calc(100% - 48px));
    margin: -32px auto 0;
}

/* ========== 双模式入口 ========== */
.modes-section {
    width: 100vw;
    margin-left: calc(50% - 50vw);
    padding: 104px max(24px, calc((100vw - 1180px) / 2)) 112px;
    animation: section-in 0.8s ease-out both;
    animation-delay: 0.15s;
}

.section-heading {
    display: grid;
    grid-template-columns: minmax(0, 1.3fr) minmax(260px, 0.7fr);
    align-items: end;
    gap: 50px;
    margin-bottom: 44px;
}

.section-heading small {
    font-family: var(--mono);
    letter-spacing: 0.12em;
    color: #3b82f6;
    font-size: 10px;
    font-weight: 700;
}

.section-heading h2 {
    margin-top: 14px;
    color: var(--text);
    font-size: clamp(34px, 4vw, 49px);
    line-height: 1.18;
}

.section-heading > p {
    color: var(--text-secondary);
    font-size: 13px;
    line-height: 1.8;
}

/* 两翼景深舞台：左右卡片带 rotateY 朝向中心，hover 转正前推 */
.modes-stage {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 36px;
    perspective: 1400px;
}

.mode-card {
    --mode: #3b82f6;
    position: relative;
    min-height: 340px;
    display: flex;
    flex-direction: column;
    padding: 30px;
    border: 1px solid color-mix(in srgb, var(--border) 82%, var(--text));
    border-radius: 8px;
    background: var(--bg-card);
    color: var(--mode);
    text-decoration: none;
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    overflow: hidden;
    transform: rotateY(6deg);
    transition: transform 0.5s ease-out, border-color 0.3s, box-shadow 0.3s;
}

.mode-levels {
    --mode: #7c65d9;
    transform: translateY(8px);
}

.mode-sandbox {
    --mode: #f59e0b;
    transform: rotateY(-6deg);
}

.mode-card:hover {
    border-color: var(--mode);
    box-shadow: 0 24px 58px rgba(20, 28, 34, 0.18), 0 0 26px color-mix(in srgb, var(--mode) 24%, transparent);
    transform: rotateY(0deg) translateY(-5px) translateZ(40px);
}

.mode-top,
.mode-bottom {
    display: flex;
    align-items: center;
    justify-content: space-between;
    position: relative;
    z-index: 1;
}

.mode-index {
    color: var(--text-secondary);
    font-family: var(--mono);
    font-size: 9px;
    letter-spacing: 0.1em;
}

.mode-chip {
    font-size: 9px;
    font-weight: 800;
    letter-spacing: 1.2px;
    text-transform: uppercase;
    color: var(--mode);
    background: color-mix(in srgb, var(--mode) 12%, transparent);
    border-radius: 999px;
    padding: 4px 10px;
}

.mode-icon {
    width: 44px;
    height: 44px;
    display: grid;
    place-items: center;
    margin-top: 28px;
    color: var(--mode);
    position: relative;
    z-index: 1;
    transition: transform 0.3s;
}

.mode-card:hover .mode-icon {
    transform: translateY(-3px);
}

.mode-card h3 {
    margin: 18px 0 7px;
    color: var(--text);
    font-size: 23px;
    position: relative;
    z-index: 1;
}

.mode-card > p {
    max-width: 300px;
    color: var(--text-secondary);
    font-size: 12px;
    line-height: 1.75;
    margin: 0;
    position: relative;
    z-index: 1;
}

.mode-features {
    list-style: none;
    margin: 16px 0 0;
    padding: 0;
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    position: relative;
    z-index: 1;
}

.mode-features li {
    font-size: 10px;
    font-weight: 600;
    color: var(--mode);
    border: 1px solid color-mix(in srgb, var(--mode) 34%, transparent);
    border-radius: 999px;
    padding: 4px 10px;
}

.mode-bottom {
    margin-top: auto;
    padding-top: 26px;
    color: var(--text-secondary);
    font-size: 9px;
    position: relative;
    z-index: 1;
}

.mode-bottom b {
    color: var(--mode);
    white-space: nowrap;
    transition: transform 0.25s;
}

.mode-card:hover .mode-bottom b {
    transform: translateX(3px);
}

/* ========== 卡片装饰 ========== */
.mode-deco {
    position: absolute;
    top: 0;
    right: 0;
    width: 200px;
    height: 110px;
    pointer-events: none;
}

/* 经典：抛物线轨迹 */
.deco-arc {
    color: var(--mode);
    opacity: 0.8;
}

.deco-arc svg {
    width: 100%;
    height: 100%;
}

.deco-arc .deco-ball {
    transform-origin: center;
    animation: deco-bounce 2.4s ease-in-out infinite;
}

@keyframes deco-bounce {
    0%,
    100% {
        transform: translateY(0);
    }

    50% {
        transform: translateY(-8px);
    }
}

/* 关卡：递进节点 */
.deco-levels {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 22px;
    opacity: 0.46;
}

.deco-levels::before {
    content: "";
    position: absolute;
    left: 40px;
    right: 26px;
    top: 54px;
    height: 2px;
    background: currentColor;
}

.deco-levels span {
    position: relative;
    width: 12px;
    height: 12px;
    border: 3px solid currentColor;
    border-radius: 50%;
    background: var(--bg-card);
}

.deco-levels span:nth-child(2) {
    transform: translateY(-18px);
}

.deco-levels span:nth-child(3) {
    transform: translateY(-35px);
}

/* 沙盒：网格 + 地面 + 小球 */
.deco-grid {
    background-image:
        linear-gradient(var(--mode) 1px, transparent 1px),
        linear-gradient(90deg, var(--mode) 1px, transparent 1px);
    background-size: 18px 18px;
    opacity: 0.12;
    -webkit-mask-image: radial-gradient(ellipse at 78% 12%, black 20%, transparent 68%);
    mask-image: radial-gradient(ellipse at 78% 12%, black 20%, transparent 68%);
}

.deco-grid .deco-ground {
    position: absolute;
    left: 52px;
    right: 10px;
    bottom: 20px;
    height: 3px;
    border-radius: 2px;
    background: var(--mode);
    opacity: 0.45;
}

.deco-grid .deco-ball {
    position: absolute;
    left: 116px;
    bottom: 26px;
    width: 13px;
    height: 13px;
    border-radius: 50%;
    background: radial-gradient(circle at 35% 30%, #fff 10%, var(--mode) 55%);
    box-shadow: 0 3px 8px rgba(0, 0, 0, 0.25);
    animation: deco-bounce 2s ease-in-out infinite;
}

@keyframes section-in {
    from {
        opacity: 0;
        transform: translateY(34px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

/* ========== 移动端 ========== */
@media (max-width: 980px) {
    .mode-card {
        transform: rotateY(4deg);
    }

    .mode-sandbox {
        transform: rotateY(-4deg);
    }
}

@media (max-width: 680px) {
    .lab-page {
        width: min(100% - 32px, 1180px);
    }

    .modes-section {
        padding: 78px 16px 84px;
    }

    .section-heading {
        grid-template-columns: 1fr;
        gap: 18px;
    }

    .modes-stage {
        grid-template-columns: 1fr;
        gap: 22px;
    }

    .mode-card {
        min-height: 300px;
        transform: none;
    }

    .mode-levels {
        transform: none;
    }

    .mode-sandbox {
        transform: none;
    }

    .mode-card:hover {
        transform: translateY(-5px);
    }
}

@media (prefers-reduced-motion: reduce) {
    .modes-section {
        animation: none;
    }

    .deco-arc .deco-ball,
    .deco-grid .deco-ball {
        animation: none;
    }
}
</style>
