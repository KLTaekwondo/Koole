/**
 * 反弹形变：球 + 每次反弹的峰值参考线 + 形变量
 */
import { MechanicsModel } from "../ModelBase.js"
import { GROUND_Y } from "../geometry.js"

const BALL_RADIUS = 0.4

export class BounceDeformationScene extends MechanicsModel {
  drawWorld(view, state, params) {
    // 形变：压扁时画一条更宽的横线表示接触面
    const squash = Math.max(0, Math.min(0.35, state.deform || 0))
    view.circle([0, state.y], BALL_RADIUS * (1 - squash * 0.35), {
      fill: view.colors.body,
      stroke: "rgba(0,0,0,0.2)",
      width: 1,
    })
    if (squash > 0.02) {
      view.line([-BALL_RADIUS * 1.1, state.y - BALL_RADIUS * (1 - squash)], [BALL_RADIUS * 1.1, state.y - BALL_RADIUS * (1 - squash)], {
        color: view.colors.body, width: 2,
      })
    }
  }

  drawOverlay(view, state, params) {
    // 每次反弹的理论峰值
    if (state.bounceCount > 0) {
      for (let i = 1; i <= Math.min(state.bounceCount, 5); i++) {
        const h = params.height * Math.pow(params.restitution, 2 * i)
        if (h < 0.5) break
        view.dashed([-2.2, GROUND_Y + h], [-1.2, GROUND_Y + h], { color: view.colors.soft, width: 0.8 })
        view.text(`#${i} ${h.toFixed(1)}m`, [-1.2, GROUND_Y + h], {
          color: view.colors.muted, size: 9, align: "left", offsetX: 6,
        })
      }
    }
    view.text(`反弹 ${state.bounceCount} 次`, [0, state.y], {
      color: view.colors.muted, size: 10, offsetX: 30, offsetY: -6,
    })
  }
}

export const bounceDeformationScene = new BounceDeformationScene()
