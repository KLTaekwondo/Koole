/**
 * 带空气阻力的下落：球 + 阻力气流 + 收尾速度提示
 */
import { MechanicsModel } from "../ModelBase.js"
import { GROUND_Y } from "../geometry.js"

const BALL_RADIUS = 0.4

export class DragFallScene extends MechanicsModel {
  drawWorld(view, state, params) {
    view.circle([0, state.y], BALL_RADIUS, { fill: view.colors.body, stroke: "rgba(0,0,0,0.2)", width: 1 })
    // 阻力气流：球下方的三条小弧
    if (state.vy > 0.5) {
      const terminal = (params.mass * params.gravity) / params.dragCoeff
      const intensity = Math.min(state.vy / terminal, 1)
      for (let i = -1; i <= 1; i++) {
        const x = i * 0.5
        view.polyline([
          [x - 0.25, state.y - 0.7],
          [x, state.y - 0.95],
          [x + 0.25, state.y - 0.7],
        ], { color: `rgba(52,152,219,${0.15 + intensity * 0.35})`, width: 1.4 })
      }
    }
  }

  drawOverlay(view, state, params) {
    const terminal = (params.mass * params.gravity) / params.dragCoeff
    view.badge(`${state.vy.toFixed(1)} m/s`, [0, state.y], { offsetX: 40, offsetY: -6 })
    view.text(`收尾速度 ≈ ${terminal.toFixed(1)} m/s`, [0, state.y], {
      color: view.colors.muted, size: 10, align: "left", offsetX: 40, offsetY: 12,
    })
  }
}

export const dragFallScene = new DragFallScene()
