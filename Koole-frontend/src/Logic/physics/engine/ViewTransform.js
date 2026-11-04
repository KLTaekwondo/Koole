/**
 * 视图变换管理
 * 把 canvas 尺寸、相机偏移统一管理
 * worldToScreen 变成纯计算，不再直接读 canvas
 */

import { ref } from "vue"
import { DRAW_SCALE } from "../physicsModels.js"

export function createViewTransform() {
  // 画布逻辑尺寸（不含 DPR）
  const viewWidth = ref(800)
  const viewHeight = ref(600)

  // 相机偏移
  const offsetX = ref(0)
  const offsetY = ref(0)

  // 画面缩放（1 = 原始比例），由渲染器在绘制时统一套一层 canvas 变换
  const MIN_ZOOM = 0.6
  const MAX_ZOOM = 2.6
  const zoom = ref(1)

  const setZoom = (next) => {
    const clamped = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, Number(next) || 1))
    // 保留两位，避免连续滚轮攒出 0.30000000000000004 这种值
    zoom.value = Math.round(clamped * 100) / 100
  }

  const zoomBy = (factor) => setZoom(zoom.value * factor)

  const resetZoom = () => setZoom(1)

  /**
   * 更新画布尺寸（canvas resize 时调用）
   */
  const updateViewSize = (w, h) => {
    viewWidth.value = w
    viewHeight.value = h
  }

  /**
   * 世界坐标转屏幕坐标（纯计算）
   * 缩放作用在「每米多少像素」上，所以地面（世界 y = 0）的位置不受缩放影响，
   * 只有物体离地面的高度会随缩放拉开——这也是地面在缩小后不会消失的原因。
   */
  const worldToScreen = (wx, wy) => {
    const unit = DRAW_SCALE * zoom.value
    return {
      x: viewWidth.value / 2 + wx * unit + offsetX.value,
      y: viewHeight.value - 40 - wy * unit + offsetY.value,
    }
  }

  /** 当前「一世界单位 = 多少像素」 */
  const pixelPerUnit = () => DRAW_SCALE * zoom.value

  return {
    viewWidth,
    viewHeight,
    offsetX,
    offsetY,
    zoom,
    MIN_ZOOM,
    MAX_ZOOM,
    setZoom,
    zoomBy,
    resetZoom,
    updateViewSize,
    worldToScreen,
    pixelPerUnit,
  }
}
