/**
 * 视图变换管理
 * 把 canvas 尺寸、相机偏移统一管理
 * worldToScreen 变成纯计算，不再直接读 canvas
 */

import { ref } from "vue"
import { DRAW_SCALE } from "../../constants/physicsModels.js"

export function createViewTransform() {
  // 画布逻辑尺寸（不含 DPR）
  const viewWidth = ref(800)
  const viewHeight = ref(600)

  // 相机偏移
  const offsetX = ref(0)
  const offsetY = ref(0)

  /**
   * 更新画布尺寸（canvas resize 时调用）
   */
  const updateViewSize = (w, h) => {
    viewWidth.value = w
    viewHeight.value = h
  }

  /**
   * 世界坐标转屏幕坐标（纯计算）
   */
  const worldToScreen = (wx, wy) => {
    return {
      x: viewWidth.value / 2 + wx * DRAW_SCALE + offsetX.value,
      y: viewHeight.value - 40 - wy * DRAW_SCALE + offsetY.value,
    }
  }

  return {
    viewWidth,
    viewHeight,
    offsetX,
    offsetY,
    updateViewSize,
    worldToScreen,
  }
}
