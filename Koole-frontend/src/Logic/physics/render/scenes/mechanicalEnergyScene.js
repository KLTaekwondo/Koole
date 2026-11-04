/**
 * 机械能守恒：斜面 + 球 + 动能/势能读数
 */
import { MechanicsModel } from "../ModelBase.js"
import { GROUND_Y } from "../geometry.js"

const BALL_RADIUS = 0.4

export class MechanicalEnergyScene extends MechanicsModel {
  drawWorld(view, state, params) {
    const rad = (params.angle * Math.PI) / 180
    const length = params.height / Math.sin(rad)
    const end = [length * Math.cos(rad), 0]
    view.polyline([[0, params.height], end, [0, 0]], {
      color: "rgba(52,152,219,0.55)",
      width: 3,
      fill: "rgba(52,152,219,0.06)",
    })
    // 高度参考线
    view.dashed([-1.5, params.height], [end[0] + 0.5, params.height], { color: view.colors.soft, width: 1 })
    // 球
    const ball = [
      state.dist * Math.cos(rad),
      Math.max(BALL_RADIUS, params.height - state.dist * Math.sin(rad) + BALL_RADIUS),
    ]
    view.circle(ball, BALL_RADIUS, {
      fill: view.colors.body,
      stroke: "rgba(0,0,0,0.25)",
      width: 1.5,
    })
  }

  drawOverlay(view, state, params) {
    const rad = (params.angle * Math.PI) / 180
    const h = Math.max(0, params.height - state.dist * Math.sin(rad))
    const Ek = 0.5 * params.mass * state.v * state.v
    const Ep = params.mass * params.gravity * h
    const ball = [
      state.dist * Math.cos(rad),
      Math.max(BALL_RADIUS, params.height - state.dist * Math.sin(rad) + BALL_RADIUS),
    ]
    view.badge(`Ek ${Ek.toFixed(1)} J`, ball, { offsetY: -22 })
    view.text(`Ep ${Ep.toFixed(1)} J · 总 ${(Ek + Ep).toFixed(1)} J`, ball, {
      color: view.colors.muted, size: 10, offsetY: -40,
    })
    if (state.v > 0.05) {
      const len = Math.min(1.6, state.v * 0.15)
      view.arrow(ball, [ball[0] + Math.cos(rad) * len, ball[1] - Math.sin(rad) * len], {
        color: "#e67e22", width: 2.2, head: 8,
      })
    }
  }
}

export const mechanicalEnergyScene = new MechanicalEnergyScene()
