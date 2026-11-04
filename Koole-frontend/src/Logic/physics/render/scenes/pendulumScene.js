/**
 * 单摆的新绘制实现（试点）
 *
 * 对比旧的 drawExtra：
 *   - 舞台（地面、网格）不再自己画，由 landscape 环境一次调用完成
 *   - 球半径用世界单位，缩放时真实变大（旧实现写死 30px）
 *   - 文字走 view.text，字号固定像素，缩放不变形
 */

import { MechanicsModel } from "../ModelBase.js"
import { GROUND_Y } from "../../physicsModels.js"

const BALL_RADIUS = 0.3      // 世界单位：半径 0.3 米
const PIVOT_HEIGHT = 0       // 悬点高度由参数 length 决定
const ARC_RADIUS = 1.2       // 角度弧半径（世界单位）

export class PendulumScene extends MechanicsModel {
  /** 球心位置（与旧实现保持一致，确保首帧不跳） */
  static ballPosition(state, params) {
    const L = params.length
    const theta = state.theta
    return [
      L * Math.sin(theta),
      PIVOT_HEIGHT + L - L * Math.cos(theta) + GROUND_Y,
    ]
  }

  drawWorld(view, state, params) {
    const L = params.length
    const pivot = [0, PIVOT_HEIGHT + L]
    const ball = PendulumScene.ballPosition(state, params)

    // 悬点
    view.point(pivot, { r: 5, color: view.colors.muted })
    // 摆线
    view.line(pivot, ball, { color: view.colors.rope, width: 2 })
    // 竖直参考虚线
    view.dashed(pivot, [pivot[0], Math.min(ball[1], pivot[1])], { color: view.colors.soft, width: 1 })
    // 角度弧
    const start = -Math.PI / 2
    const end = -Math.PI / 2 + Math.max(-Math.PI / 2, Math.min(Math.PI / 2, state.theta))
    view.arcAngle(pivot, ARC_RADIUS, state.theta > 0 ? start : end, state.theta > 0 ? end : start, {
      color: view.colors.soft,
      width: 1.2,
    })
    // 摆球
    view.circle(ball, BALL_RADIUS, { fill: view.colors.body, stroke: "rgba(0,0,0,0.2)", width: 1 })
  }

  drawOverlay(view, state, params) {
    const ball = PendulumScene.ballPosition(state, params)
    // 速度箭头：长度按世界单位换算（旧实现写死 70px 上限）
    const speed = Math.abs(state.omega) * params.length
    if (speed > 0.05) {
      const dir = state.omega > 0 ? 1 : -1
      const worldLen = Math.min(2, speed * 0.35)
      const dx = Math.cos(state.theta) * dir * worldLen
      const dy = Math.sin(state.theta) * dir * worldLen
      view.arrow(ball, [ball[0] + dx, ball[1] + dy], {
        color: "#e67e22",
        width: 2.5,
        head: 9,
      })
    }
    // 角度标注
    view.badge(`${(state.theta * 180 / Math.PI).toFixed(1)}°`, [0, params.length + GROUND_Y + 0.6], {
      size: 11,
    })
  }
}

export const pendulumScene = new PendulumScene()
