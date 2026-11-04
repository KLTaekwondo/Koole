/**
 * 平抛：球 + 速度分量（Vx / Vy）+ 高度与水平距离
 */
import { MechanicsModel } from "../ModelBase.js"
import { GROUND_Y } from "../geometry.js"

const BALL_RADIUS = 0.32

export class ProjectileScene extends MechanicsModel {
  drawWorld(view, state, params) {
    // 起点高度参考线
    view.dashed([-1, params.height + GROUND_Y], [Math.max(6, state.x + 3), params.height + GROUND_Y], {
      color: view.colors.soft,
      width: 1,
    })
    view.circle([state.x, state.y], BALL_RADIUS, {
      fill: view.colors.body,
      stroke: "rgba(0,0,0,0.2)",
      width: 1,
    })
  }

  drawOverlay(view, state, params) {
    const at = [state.x, state.y]
    const speed = Math.hypot(state.vx, state.vy)
    if (speed > 0.2) {
      // 水平分量
      const vxLen = Math.min(2, Math.abs(state.vx) * 0.08)
      view.arrow(at, [at[0] + Math.sign(state.vx) * vxLen, at[1]], { color: "#3498db", width: 2, head: 7 })
      // 竖直分量（向下为正）
      const vyLen = Math.min(2, Math.abs(state.vy) * 0.08)
      view.arrow(at, [at[0], at[1] - vyLen], { color: "#2ecc71", width: 2, head: 7 })
    }
    view.text(`h = ${Math.max(0, state.y - GROUND_Y).toFixed(1)} m`, at, {
      color: view.colors.muted, size: 10, align: "left", offsetX: 12, offsetY: 14,
    })
    view.badge(`x = ${state.x.toFixed(1)} m`, at, { offsetY: -20 })
  }
}

export const projectileScene = new ProjectileScene()
