// 数学函数画布：视图相机与坐标变换（纯函数，不依赖 DOM）

import { reactive } from "vue"

// 视图状态：相机中心在世界坐标 (x, y)，scale 是"每世界单位 = 多少屏幕像素"
export function createView() {
    return reactive({ x: 0, y: 0, scale: 58 })
}

export function worldToScreen(x, y, view, width, height) {
    return [width / 2 + (x - view.x) * view.scale, height / 2 - (y - view.y) * view.scale]
}

export function screenToWorld(x, y, view, width, height) {
    return [(x - width / 2) / view.scale + view.x, (height / 2 - y) / view.scale + view.y]
}
