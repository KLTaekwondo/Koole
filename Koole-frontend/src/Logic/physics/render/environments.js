/**
 * 环境（舞台）部件
 *
 * 不同模型需要的「底」完全不一样：斜面要有地面，水下光线要有水面，
 * 透镜要有光轴，电路没有地面。所以舞台不是统一画法，而是可替换的部件。
 *
 * 约定：世界 y = 0 是「基准线」（地面 / 水面 / 光轴）所在高度，
 *      由 ViewTransform 把它映射到屏幕，缩放时不会移动。
 *
 * 每个环境提供三个可选钩子：
 *   drawBack(view)        背景层（天空、水体、色块）——在模型之前画
 *   drawFront(view, opts) 前景层（地面、水面线、刻度）——在模型之后画，可以遮住物体
 *   drawOverlay(view)     最上层的环境标注（例如「水 n = 1.33」）
 */

const SURFACE_Y = {
  // 水面默认在基准线之上 0.8 米，方便物体「沉下去」
  water: 0.8,
}

export const environmentLandscape = {
  name: "landscape",
  drawBack(view) {
    view.background(view.colors.sky)
  },
  drawFront(view) {
    // 地面：基准线以下填实，再压一条亮线
    view.fillBelow(0, view.colors.ground)
    view.horizontalLine(0, { color: view.colors.groundLine, width: 2 })
  },
}

export const environmentWater = {
  name: "water",
  surfaceY: SURFACE_Y.water,
  drawBack(view) {
    view.background(view.colors.sky)
  },
  drawFront(view, options = {}) {
    const surfaceY = options.surfaceY ?? SURFACE_Y.water
    // 水体：水面以下半透明色块，越深越沉
    const surfaceScreenY = view.screenYOf(surfaceY)
    view.ctx.save()
    view.ctx.fillStyle = view.colors.water
    view.ctx.fillRect(0, surfaceScreenY, view.cw, view.ch - surfaceScreenY)
    view.ctx.restore()
    view.horizontalLine(surfaceY, { color: view.colors.waterLine, width: 2 })
    view.horizontalLine(0, { color: view.colors.ground, width: 2, dash: [6, 6] })
  },
  drawOverlay(view, options = {}) {
    const surfaceY = options.surfaceY ?? SURFACE_Y.water
    view.text(options.label || "水 n = 1.33", [0, surfaceY], {
      color: view.colors.muted,
      size: 11,
      align: "left",
      offsetX: 12,
      offsetY: -10,
    })
  },
}

export const environmentOpticalBench = {
  name: "optical-bench",
  drawBack(view) {
    view.background(view.colors.bg)
    view.grid({ step: 1, color: view.colors.grid })
  },
  drawFront(view) {
    // 光轴：世界 y = 0
    view.horizontalLine(0, { color: view.colors.muted, width: 1, dash: [6, 6] })
  },
  drawOverlay(view) {
    view.text("光轴", [0, 0], { color: view.colors.muted, size: 10, align: "right", offsetX: -12 })
  },
}

export const environmentCircuitBoard = {
  name: "circuit-board",
  drawBack(view) {
    view.background(view.colors.bg)
    view.grid({ step: 1, color: view.colors.grid })
  },
  drawFront() {
    // 电路不需要地面，留空
  },
}

export const environmentNone = {
  name: "none",
  drawBack(view) {
    view.background(view.colors.bg)
  },
  drawFront() {},
}

export const ENVIRONMENTS = {
  landscape: environmentLandscape,
  water: environmentWater,
  "optical-bench": environmentOpticalBench,
  "circuit-board": environmentCircuitBoard,
  none: environmentNone,
}

/** 按名字取环境，找不到时退回 landscape */
export function getEnvironment(name, fallback = "landscape") {
  return ENVIRONMENTS[name] || ENVIRONMENTS[fallback]
}
