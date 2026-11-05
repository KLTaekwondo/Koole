/**
 * 圆周运动：圆轨道 + 小球 + 半径 + 切线速度
 */
import { MechanicsModel } from "../ModelBase.js"

const R_BALL = 0.35

export class CircularScene extends MechanicsModel {
  static environment = "none"
  drawWorld(view, state, params) {
    const r = params.radius
    const a = state.angle || 0
    // 轨道
    view.circle([0, r], r, { stroke: view.colors.soft, width: 1.5 })
    // 圆心
    view.point([0, r], { r: 3, color: view.colors.muted })
    // 半径线
    view.line([0, r], [Math.cos(a) * r, r + Math.sin(a) * r], { color: view.colors.soft, width: 1 })
    // 小球
    view.circle([Math.cos(a) * r, r + Math.sin(a) * r], R_BALL, {
      fill: view.colors.body, stroke: "rgba(0,0,0,0.2)", width: 1,
    })
  }

  drawOverlay(view, state, params) {
    const r = params.radius
    const a = state.angle || 0
    const ball = [Math.cos(a) * r, r + Math.sin(a) * r]
    // 切线速度
    const v = params.omega * r
    const vLen = Math.min(3, v * 0.25)
    view.arrow(ball, [ball[0] - Math.sin(a) * vLen, ball[1] + Math.cos(a) * vLen], {
      color: "#3498db", width: 2.2, head: 8,
    })
    view.text(`v = ${v.toFixed(1)} m/s`, ball, {
      color: "#3498db", size: 10, align: "left", offsetX: 14, offsetY: -12,
    })
    view.text(`T = ${((2 * Math.PI) / params.omega).toFixed(2)} s`, [0, 0], {
      color: view.colors.muted, size: 10,
    })
  }
}

export const circularScene = new CircularScene()
