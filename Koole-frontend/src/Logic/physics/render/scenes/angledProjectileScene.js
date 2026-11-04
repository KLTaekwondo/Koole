/**
 * 斜抛：发射角弧 + 球 + 速度分量
 */
import { MechanicsModel } from "../ModelBase.js"
import { GROUND_Y } from "../geometry.js"

const BALL_RADIUS = 0.32
const ARC_RADIUS = 1.4

export class AngledProjectileScene extends MechanicsModel {
  drawWorld(view, state, params) {
    const theta = (params.angle * Math.PI) / 180
    // 发射角弧（以起点为圆心，从水平到初速度方向）
    view.arcAngle([0, GROUND_Y], ARC_RADIUS, 0, theta, { color: view.colors.soft, width: 1.2 })
    view.dashed([0, GROUND_Y], [ARC_RADIUS * 1.15, GROUND_Y], { color: view.colors.soft, width: 1 })
    view.circle([state.x, state.y], BALL_RADIUS, {
      fill: view.colors.body,
      stroke: "rgba(0,0,0,0.2)",
      width: 1,
    })
  }

  drawOverlay(view, state, params) {
    const at = [state.x, state.y]
    if (Math.hypot(state.vx, state.vy) > 0.2 && state.y > GROUND_Y + 0.05) {
      const vxLen = Math.min(2, Math.abs(state.vx) * 0.1)
      const vyLen = Math.min(2, Math.abs(state.vy) * 0.1)
      view.arrow(at, [at[0] + Math.sign(state.vx) * vxLen, at[1]], { color: "#3498db", width: 2, head: 7 })
      if (state.vy > 0) {
        view.arrow(at, [at[0], at[1] + vyLen], { color: "#2ecc71", width: 2, head: 7 })
      } else {
        view.arrow(at, [at[0], at[1] - vyLen], { color: "#2ecc71", width: 2, head: 7 })
      }
    }
    // 角度标注
    view.text(`θ = ${params.angle}°`, [0, GROUND_Y], {
      color: view.colors.muted, size: 11, align: "left", offsetX: 24, offsetY: -6,
    })
    view.badge(`x = ${state.x.toFixed(1)} m`, at, { offsetY: -20 })
  }
}

export const angledProjectileScene = new AngledProjectileScene()
