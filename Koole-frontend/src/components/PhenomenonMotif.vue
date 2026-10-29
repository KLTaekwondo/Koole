<template>
    <svg class="phenomenon-motif" :viewBox="viewBox" fill="none" aria-hidden="true">
        <g :stroke="color" :stroke-width="strokeWidth" stroke-linecap="round" stroke-linejoin="round" :opacity="opacity">
            <template v-for="(shape, index) in shapes" :key="index">
                <circle
                    v-if="shape.type === 'circle'"
                    :cx="shape.cx" :cy="shape.cy" :r="shape.r"
                    :fill="shape.fill || 'none'"
                    :stroke-dasharray="shape.dash || undefined"
                />
                <line
                    v-else-if="shape.type === 'line'"
                    :x1="shape.x1" :y1="shape.y1" :x2="shape.x2" :y2="shape.y2"
                    :stroke-dasharray="shape.dash || undefined"
                />
                <path
                    v-else-if="shape.type === 'path'"
                    :d="shape.d"
                    :fill="shape.fill || 'none'"
                    :stroke-dasharray="shape.dash || undefined"
                />
                <polyline
                    v-else-if="shape.type === 'polyline'"
                    :points="shape.points"
                    :stroke-dasharray="shape.dash || undefined"
                />
                <polygon
                    v-else-if="shape.type === 'polygon'"
                    :points="shape.points"
                    :fill="shape.fill || 'none'"
                />
                <rect
                    v-else-if="shape.type === 'rect'"
                    :x="shape.x" :y="shape.y" :width="shape.w" :height="shape.h"
                    :rx="shape.rx || 0"
                    :fill="shape.fill || 'none'"
                    :stroke-dasharray="shape.dash || undefined"
                />
            </template>
        </g>
    </svg>
</template>

<script setup>
import { computed } from "vue"

// 文章封面的主题线条：每个现象一条「示意图形」，不承载数据，只负责气质。
// 全部用 currentColor 之外的显式颜色（color prop），方便跟随学科色。
const props = defineProps({
    variant: { type: String, default: "pendulum" },
    color: { type: String, default: "#3b82f6" },
    opacity: { type: Number, default: 0.5 },
    strokeWidth: { type: Number, default: 1.6 },
})

const viewBox = "0 0 240 200"

const MOTIFS = {
    // 单摆：悬点 + 两条摆角 + 圆弧轨迹 + 摆球
    pendulum: [
        { type: "line", x1: 120, y1: 24, x2: 120, y2: 96 },
        { type: "line", x1: 120, y1: 24, x2: 62, y2: 148 },
        { type: "line", x1: 120, y1: 24, x2: 178, y2: 148 },
        { type: "path", d: "M62 148 Q120 196 178 148", dash: "4 6" },
        { type: "circle", cx: 62, cy: 148, r: 8, fill: "currentColor" },
        { type: "circle", cx: 178, cy: 148, r: 8, fill: "currentColor" },
    ],
    // 浮力：水面 + 半沉的方块 + 向上浮力箭头
    buoyancy: [
        { type: "path", d: "M16 110 Q46 100 76 110 T136 110 T196 110 T232 110", dash: "5 5" },
        { type: "rect", x: 76, y: 84, w: 64, h: 56, rx: 4 },
        { type: "line", x1: 108, y1: 78, x2: 108, y2: 46 },
        { type: "polyline", points: "100,56 108,44 116,56" },
        { type: "line", x1: 108, y1: 150, x2: 108, y2: 180 },
        { type: "polyline", points: "100,170 108,182 116,170" },
    ],
    // 杠杆：支点三角 + 横梁 + 两侧重物
    lever: [
        { type: "polygon", points: "120,172 100,132 140,132", fill: "currentColor" },
        { type: "line", x1: 26, y1: 108, x2: 214, y2: 132 },
        { type: "rect", x: 34, y: 60, w: 26, h: 34, rx: 3 },
        { type: "rect", x: 178, y: 96, w: 26, h: 26, rx: 3 },
        { type: "line", x1: 47, y1: 94, x2: 47, y2: 106, dash: "4 4" },
    ],
    // 凸透镜：透镜 + 平行光 + 会聚到焦点
    lens: [
        { type: "path", d: "M120 26 Q96 100 120 174 Q144 100 120 26" },
        { type: "line", x1: 14, y1: 74, x2: 120, y2: 74 },
        { type: "line", x1: 14, y1: 126, x2: 120, y2: 126 },
        { type: "line", x1: 120, y1: 74, x2: 206, y2: 100 },
        { type: "line", x1: 120, y1: 126, x2: 206, y2: 100 },
        { type: "line", x1: 14, y1: 100, x2: 226, y2: 100, dash: "5 6" },
        { type: "circle", cx: 206, cy: 100, r: 4, fill: "currentColor" },
    ],
    // 平面镜：镜面 + 入射/反射光线 + 镜后虚像
    mirror: [
        { type: "line", x1: 132, y1: 24, x2: 132, y2: 176 },
        { type: "line", x1: 40, y1: 140, x2: 132, y2: 96 },
        { type: "line", x1: 132, y1: 96, x2: 214, y2: 64, dash: "4 5" },
        { type: "line", x1: 132, y1: 96, x2: 132, y2: 186, dash: "3 5" },
        { type: "rect", x: 36, y: 118, w: 22, h: 24, rx: 3 },
        { type: "rect", x: 148, y: 84, w: 22, h: 24, rx: 3, dash: "4 4" },
    ],
    // 折射：界面 + 法线 + 偏折光线
    refraction: [
        { type: "line", x1: 16, y1: 118, x2: 226, y2: 118 },
        { type: "line", x1: 120, y1: 24, x2: 120, y2: 186, dash: "5 6" },
        { type: "line", x1: 56, y1: 40, x2: 120, y2: 118 },
        { type: "line", x1: 120, y1: 118, x2: 196, y2: 176 },
        { type: "path", d: "M96 88 A34 34 0 0 1 120 74", dash: "3 4" },
        { type: "path", d: "M120 142 A38 38 0 0 1 148 156", dash: "3 4" },
    ],
    // 自由落体：斜面上的小球 + 越落越密的轨迹点
    freefall: [
        { type: "line", x1: 30, y1: 60, x2: 210, y2: 60, dash: "5 6" },
        { type: "line", x1: 120, y1: 60, x2: 120, y2: 184, dash: "3 6" },
        { type: "circle", cx: 120, cy: 78, r: 4, fill: "currentColor" },
        { type: "circle", cx: 120, cy: 104, r: 4, fill: "currentColor" },
        { type: "circle", cx: 120, cy: 146, r: 4, fill: "currentColor" },
        { type: "circle", cx: 120, cy: 178, r: 7 },
        { type: "polyline", points: "106,168 120,182 134,168" },
    ],
    // 圆周运动：圆轨道 + 半径 + 切线速度
    circular: [
        { type: "circle", cx: 120, cy: 106, r: 66, dash: "5 6" },
        { type: "circle", cx: 120, cy: 106, r: 5, fill: "currentColor" },
        { type: "line", x1: 120, y1: 106, x2: 186, y2: 106 },
        { type: "circle", cx: 186, cy: 106, r: 7, fill: "currentColor" },
        { type: "line", x1: 186, y1: 106, x2: 186, y2: 44 },
        { type: "polyline", points: "178,54 186,42 194,54" },
    ],
    // 弹簧振子：弹簧 + 质量块 + 平衡位置线
    spring: [
        { type: "line", x1: 46, y1: 26, x2: 194, y2: 26 },
        { type: "polyline", points: "120,26 120,44 104,52 136,62 104,72 136,82 104,92 136,102 120,110 120,124" },
        { type: "rect", x: 92, y: 124, w: 56, h: 40, rx: 4 },
        { type: "line", x1: 24, y1: 144, x2: 216, y2: 144, dash: "5 6" },
        { type: "line", x1: 120, y1: 176, x2: 120, y2: 194 },
    ],
    // 欧姆定律：回路 + 电阻锯齿 + 电源
    ohm: [
        { type: "rect", x: 42, y: 46, w: 156, h: 108, rx: 6 },
        { type: "polyline", points: "98,46 106,34 118,58 130,34 142,58 150,46" },
        { type: "line", x1: 42, y1: 84, x2: 42, y2: 116 },
        { type: "line", x1: 30, y1: 92, x2: 54, y2: 92 },
        { type: "line", x1: 36, y1: 108, x2: 48, y2: 108 },
        { type: "circle", cx: 120, cy: 154, r: 10 },
    ],
}

const shapes = computed(() => MOTIFS[props.variant] || MOTIFS.pendulum)
</script>

<style scoped>
.phenomenon-motif {
    display: block;
    width: 100%;
    height: 100%;
}
</style>
