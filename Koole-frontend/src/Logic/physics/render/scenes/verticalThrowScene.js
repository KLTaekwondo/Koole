/**
 * 竖直上抛：球 + 速度箭头（向上/向下切换）+ 最高点参考线
 */

import { MechanicsModel } from "../ModelBase.js"
import { GROUND_Y } from "../geometry.js"

const BALL_RADIUS = GROUND_Y
const ARROW_MAX = 2.2

export class VerticalThrowScene extends MechanicsModel {
  drawWorld(view, state, params) {
    // 最高点参考线（按参数估算）
    const peak = GROUND_Y + (params.initialVelocity * params.initialVelocity) / (2 * params.gravity)
    view.dashed([-2.5, peak], [2.5, peak], { color: view.colors.soft, width: 1 })
    view.circle([0, state.y], BALL_RADIUS, {
      fill: view.colors.body,
      stroke: "rgba(0,0,0,0.2)",
      width: 1,
    })
  }

  drawOverlay(view, state, params) {
    if (Math.abs(state.vy) > 0.2) {
      const length = Math.min(ARROW_MAX, Math.abs(state.vy) * 0.1)
      const tipY = state.vy > 0 ? state.y + length : state.y - length
      view.arrow([0, state.y], [0, tipY], { color: "#e74c3c", width: 2.5, head: 9 })
      view.text(`${Math.abs(state.vy).toFixed(1)} m/s`, [0, state.y], {
        color: "#e74c3c",
        size: 11,
        align: "left",
        offsetX: 14,
        weight: 600,
      })
    }
    view.text(`h = ${Math.max(0, state.y - GROUND_Y).toFixed(1)} m`, [0, state.y], {
      color: view.colors.muted,
      size: 10,
      align: "left",
      offsetX: 14,
      offsetY: 16,
    })
  }
}

export const verticalThrowScene = new VerticalThrowScene()
