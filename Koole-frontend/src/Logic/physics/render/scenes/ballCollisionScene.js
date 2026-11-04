/**
 * 两球碰撞：两个球 + 各自速度箭头 + 碰撞提示
 */
import { MechanicsModel } from "../ModelBase.js"
import { GROUND_Y } from "../geometry.js"

const R1 = 0.5
const R2 = 0.42

export class BallCollisionScene extends MechanicsModel {
  drawWorld(view, state, params) {
    // 球心抬到半径高度，球刚好贴地
    view.circle([state.x1, R1], R1, { fill: "#29b6f6", stroke: "rgba(0,0,0,0.2)", width: 1.5 })
    view.circle([state.x2, R2], R2, { fill: "#ef6c00", stroke: "rgba(0,0,0,0.2)", width: 1.5 })
  }

  drawOverlay(view, state, params) {
    const arrowFor = (x, v, color) => {
      if (Math.abs(v) < 0.05) return
      const len = Math.min(2.2, Math.abs(v) * 0.18)
      view.arrow([x, R1 * 2 + 0.25], [x + Math.sign(v) * len, R1 * 2 + 0.25], {
        color, width: 2.5, head: 8,
      })
      view.text(`${Math.abs(v).toFixed(1)}`, [x + Math.sign(v) * len * 0.5, R1 * 2 + 0.25], {
        color, size: 10, offsetY: -14, weight: 600,
      })
    }
    arrowFor(state.x1, state.v1, "#3498db")
    arrowFor(state.x2, state.v2, "#e67e22")
    if (state.collided) {
      view.text("碰撞", [0, GROUND_Y + 1.6], { color: "#e74c3c", size: 11, weight: 700 })
    }
  }
}

export const ballCollisionScene = new BallCollisionScene()
