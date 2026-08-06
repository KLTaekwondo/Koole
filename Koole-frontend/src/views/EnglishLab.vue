<template>
    <div class="subject-page">
        <DepthLabHero
            eyebrow="ENGLISH LAB / 英语实验室"
            :title-lines="['把词汇与句法', '放进真实语境']"
            description="把词汇、句法与真实语境连接起来，让语言结构不再只是需要背诵的规则。"
            accent="#866bd5"
            accent2="#a98cf0"
            scene-label="MODULE MAP / 003"
            :actions="[{ label: '查看规划', scroll: '#modules', variant: 'outline' }]"
            :meta-items="[
                { value: '03', label: '个规划模块' },
                { value: 'ING', label: '建设中' },
            ]"
            :devices="[buildWordsDevice]"
            :particle-color="0x9a7fe0"
            :particle-color-dark="0xbcabf0"
        />

        <SubjectModules
            kicker="01 / MODULES"
            title="把语言拆成可观察的层。"
            description="词汇、句法与发音，每一层都可以单独练习、对照与验证，结构就不再抽象。"
            accent="#866bd5"
            :items="modules"
        />
    </div>
</template>

<script setup>
import * as THREE from "three"
import DepthLabHero from "../components/DepthLabHero.vue"
import SubjectModules from "../components/SubjectModules.vue"

const modules = [
    { name: "语境词汇", desc: "在句子和情境中观察词义变化，建立更稳定的词汇连接。" },
    { name: "句法结构", desc: "分层标记句子成分，看清从句、修饰语和核心结构之间的关系。" },
    { name: "发音训练", desc: "对照音标、重音和语调变化，理解声音如何影响表达。" },
]

/** 英语单词纹理：宽屏画布保证字母比例自然 */
function makeWordTexture(word, isDark, emphasis = false) {
    const canvas = document.createElement("canvas")
    canvas.width = 1024
    canvas.height = 256
    const context = canvas.getContext("2d")
    context.clearRect(0, 0, canvas.width, canvas.height)
    context.font = `${emphasis ? "800" : "700"} ${emphasis ? 170 : 112}px Arial, sans-serif`
    context.textAlign = "center"
    context.textBaseline = "middle"
    context.shadowColor = emphasis ? "rgba(134, 107, 213, 0.55)" : "transparent"
    context.shadowBlur = emphasis ? 22 : 0
    context.fillStyle = isDark ? (emphasis ? "#e0d8ff" : "#c8b9f4") : (emphasis ? "#bca7ff" : "#6d5aa9")
    context.fillText(word, canvas.width / 2, canvas.height / 2)
    const texture = new THREE.CanvasTexture(canvas)
    texture.colorSpace = THREE.SRGBColorSpace
    return texture
}

/** 多个英文单词：围绕 English 错落散开，各自缓慢浮动 */
function buildWordsDevice() {
    const group = new THREE.Group()
    const words = [
        ["English", 0, 0.05, 0.3, -0.02, 0.34, true],
        ["wonder", -2.25, 1.35, 0.05, 0.08, 0.42, false],
        ["explore", 2.45, 1.05, -0.2, -0.06, 0.5, false],
        ["create", -2.1, -1.05, -0.1, -0.1, 0.38, false],
        ["discover", 2.25, -1.15, -0.35, 0.07, 0.55, false],
        ["imagine", -0.65, 2.0, -0.25, -0.05, 0.46, false],
        ["express", 0.85, -2.0, 0.15, 0.1, 0.41, false],
    ]
    const connectorMaterial = new THREE.LineBasicMaterial({
        color: 0x866bd5,
        transparent: true,
        opacity: 0.26,
        depthWrite: false,
    })
    words.slice(1).forEach(([, x, y, z]) => {
        const connector = new THREE.Line(
            new THREE.BufferGeometry().setFromPoints([
                new THREE.Vector3(0, 0.05, -0.08),
                new THREE.Vector3(x, y, z - 0.08),
            ]),
            connectorMaterial,
        )
        group.add(connector)
    })

    const textSprites = words.map(([word, x, y, z, tilt, speed, emphasis], index) => {
        const sprite = new THREE.Sprite(new THREE.SpriteMaterial({
            map: makeWordTexture(word, false, emphasis),
            transparent: true,
            depthWrite: false,
            rotation: tilt,
        }))
        sprite.position.set(x, y, z)
        sprite.scale.set(emphasis ? 3.1 : 2.15, emphasis ? 0.78 : 0.52, 1)
        sprite.userData.word = word
        sprite.userData.emphasis = emphasis
        sprite.userData.baseX = x
        sprite.userData.baseY = y
        sprite.userData.speed = speed
        sprite.userData.phase = index * 1.37
        group.add(sprite)
        return sprite
    })

    group.position.set(1.85, 0.2, 0)
    group.userData.animate = (motion, reducedMotion) => {
        if (reducedMotion) return
        textSprites.forEach(sprite => {
            const t = motion * sprite.userData.speed + sprite.userData.phase
            sprite.position.x = sprite.userData.baseX + Math.sin(t * 0.8) * 0.06
            sprite.position.y = sprite.userData.baseY + Math.sin(t) * 0.08
        })
    }
    group.userData.applyTheme = isDark => {
        textSprites.forEach(sprite => {
            sprite.material.map.dispose()
            sprite.material.map = makeWordTexture(sprite.userData.word, isDark, sprite.userData.emphasis)
            sprite.material.needsUpdate = true
        })
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
    .subject-page { width: min(100% - 32px, 1180px); }
}
</style>
