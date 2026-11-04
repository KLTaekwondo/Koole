/**
 * 匀速直线运动：路面 + 刻度 + 小车
 * 旧实现画在屏幕像素上；这里改成世界单位，缩放时路面刻度和车一起变。
 */

import { MechanicsModel } from "../ModelBase.js"

const CAR_HALF_W = 0.75
const CAR_HEIGHT = 0.65

export class UniformMotionScene extends MechanicsModel {
  drawWorld(view, state, params) {
    const maxX = Math.max(params.speed * params.duration, 20)
    // 路面
    view.line([-1.5, 0], [maxX + 2, 0], { color: view.colors.muted, width: 3 })
    // 每 2 米一个刻度
    for (let m = 0; m <= maxX; m += 2) {
      view.line([m, 0], [m, 0.14], { color: view.colors.soft, width: 1 })
    }
    // 小车
    const [cx, cy] = [state.x, state.y]
    view.polyline([
      [cx - CAR_HALF_W, cy],
      [cx + CAR_HALF_W, cy],
      [cx + CAR_HALF_W, cy + CAR_HEIGHT],
      [cx - CAR_HALF_W, cy + CAR_HEIGHT],
    ], { color: "#3498db", width: 2, fill: "rgba(52,152,219,0.85)" })
    // 轮子
    view.point([cx - 0.42, cy], { r: 4, color: "#2c3e50" })
    view.point([cx + 0.42, cy], { r: 4, color: "#2c3e50" })
  }

  drawOverlay(view, state, params) {
    const maxX = Math.max(params.speed * params.duration, 20)
    // 刻度文字（每 4 米标一次，避免过密）
    for (let m = 0; m <= maxX; m += 4) {
      view.text(`${m}m`, [m, 0], { color: view.colors.muted, size: 10, offsetY: 14 })
    }
    // 速度与时间
    view.badge(`${params.speed.toFixed(1)} m/s`, [state.x, state.y + CAR_HEIGHT], { offsetY: -16 })
    view.text(`t = ${state._t.toFixed(1)} s`, [state.x, state.y + CAR_HEIGHT], {
      color: view.colors.muted,
      size: 10,
      offsetY: -34,
    })
  }
}

export const uniformMotionScene = new UniformMotionScene()
