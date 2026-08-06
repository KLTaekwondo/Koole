<template>
    <div class="subject-page">
        <DepthLabHero
            eyebrow="CHINESE LAB / 语文实验室"
            :title-lines="['把文字拆开', '看见文章的脉络']"
            description="从文字进入人物、情感与时代，让文章中的结构、关系与意象清晰可见。"
            accent="#d95b4c"
            accent2="#e8986c"
            scene-label="MODULE MAP / 001"
            :actions="[{ label: '查看规划', scroll: '#modules', variant: 'outline' }]"
            :meta-items="[
                { value: '03', label: '个规划模块' },
                { value: 'ING', label: '建设中' },
            ]"
            :devices="[buildWordsDevice]"
            :particle-color="0xc08a72"
            :particle-color-dark="0xe0b3a0"
        />

        <SubjectModules
            kicker="01 / MODULES"
            title="从三个入口，进入文字内部。"
            description="结构、人物与意象，每一类都是一条进入文章的路径，读法不同，看到的东西也不同。"
            accent="#d95b4c"
            :items="modules"
        />
    </div>
</template>

<script setup>
import * as THREE from "three"
import DepthLabHero from "../components/DepthLabHero.vue"
import SubjectModules from "../components/SubjectModules.vue"

const modules = [
    { name: "文本脉络", desc: "拆解段落结构、论证路径和叙事线索，看清一篇文章如何展开。" },
    { name: "人物关系", desc: "连接人物、事件和立场，在关系图中理解冲突与变化。" },
    { name: "意象探索", desc: "追踪作品中的意象、情绪和语境，理解文字背后的表达。" },
]

/** 诗句精灵纹理：单个诗句（canvas 1024×256 与 sprite 同比例，保证字不变形） */
function makeWordTexture(word, isDark) {
    const canvas = document.createElement("canvas")
    canvas.width = 1024
    canvas.height = 256
    const ctx = canvas.getContext("2d")
    ctx.font = "700 170px 'KaiTi', 'STKaiti', 'Noto Serif SC', serif"
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.fillStyle = isDark ? "#d8c9b0" : "#6b4a35"
    ctx.fillText(word, 512, 128)
    const texture = new THREE.CanvasTexture(canvas)
    texture.colorSpace = THREE.SRGBColorSpace
    return texture
}

/** 漂浮的古诗词名句：围绕中心缓缓浮动，静止构图 */
function buildWordsDevice() {
    const group = new THREE.Group()

    // [词句, x, y, z 深度, 微倾角, 浮动速度]：错落散布，不做对称排布
    const words = [
        ["床前明月光", -2.3, 1.35, 0.3, 0.08, 0.42],
        ["白日依山尽", 2.6, 0.95, -0.2, -0.06, 0.5],
        ["春眠不觉晓", -1.7, -0.2, 0.1, 0.12, 0.36],
        ["锄禾日当午", 2.3, -0.9, -0.4, -0.1, 0.55],
        ["离离原上草", -0.35, 2.0, -0.3, 0.05, 0.46],
        ["举头望明月", 0.5, -1.75, 0.2, -0.15, 0.39],
    ]
    const textSprites = words.map(([word, x, y, z, tilt, speed]) => {
        const sprite = new THREE.Sprite(
            new THREE.SpriteMaterial({ map: makeWordTexture(word, false), transparent: true, depthWrite: false, rotation: tilt }),
        )
        sprite.position.set(x, y, z)
        sprite.scale.set(2.4, 0.6, 1) // 4:1 与 canvas 同比例，字保持正方形
        sprite.userData.word = word
        sprite.userData.baseX = x
        sprite.userData.baseY = y
        sprite.userData.speed = speed
        group.add(sprite)
        return sprite
    })

    group.position.set(1.9, 0.35, 0)
    group.userData.animate = motion => {
        // 词句各自按不同节奏轻微浮动（不旋转）
        textSprites.forEach((sprite, index) => {
            const t = motion * sprite.userData.speed + index * 1.7
            sprite.position.x = sprite.userData.baseX + Math.sin(t * 0.8) * 0.06
            sprite.position.y = sprite.userData.baseY + Math.sin(t) * 0.08
        })
    }
    group.userData.applyTheme = isDark => {
        textSprites.forEach(sprite => {
            sprite.material.map.dispose()
            sprite.material.map = makeWordTexture(sprite.userData.word, isDark)
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
