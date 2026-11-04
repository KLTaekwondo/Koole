/**
 * 自由落体：新绘制实现
 *
 * 旧的 drawExtra 只画一个速度箭头，球是渲染器通用球体画的；
 * 迁到 ViewKit 后：球、起始高度虚线、速度箭头、数值气泡都在模型里表达，
 * 球半径用世界单位（0.4 m），缩放时真实变大。
 */

import { MechanicsModel } from "../ModelBase.js"
import { GROUND_Y } from "../geometry.js"

const BALL_RADIUS = GROUND_Y      // 0.4 m：和旧的 12px 通用球体视觉一致
const ARROW_MAX = 2.2             // 速度箭头最长 2.2 m

export class FreeFallScene extends MechanicsModel {
  drawWorld(view, state, params) {
    // 起始高度参考线
    view.dashed([-2.5, params.height + GROUND_Y], [2.5, params.height + GROUND_Y], {
      color: view.colors.soft,
      width: 1,
    })
    // 下落中的球
    const at = [0, state.y]
    view.circle(at, BALL_RADIUS, {
      fill: view.colors.body,
      stroke: "rgba(0,0,0,0.2)",
      width: 1,
    })
    // 落地后压一条短线，表示停在垫子上
    if (state.y <= GROUND_Y + 0.001 && state.vy <= 0.001) {
      view.line([-0.6, GROUND_Y], [0.6, GROUND_Y], { color: view.colors.muted, width: 2 })
    }
  }

  drawOverlay(view, state, params) {
    // 速度箭头：长度按世界单位换算，方向朝下
    if (state.vy > 0.2) {
      const length = Math.min(ARROW_MAX, state.vy * 0.08)
      view.arrow([0, state.y], [0, state.y - length], {
        color: "#e74c3c",
        width: 2.5,
        head: 9,
      })
      view.text(`${state.vy.toFixed(1)} m/s`, [0, state.y], {
        color: "#e74c3c",
        size: 11,
        align: "left",
        offsetX: 14,
        offsetY: -length * 20,
        weight: 600,
      })
    }
    // 离地高度
    view.text(`${Math.max(0, state.y - GROUND_Y).toFixed(1)} m`, [0, state.y], {
      color: view.colors.muted,
      size: 10,
      align: "left",
      offsetX: 14,
      offsetY: 14,
    })
  }
}

export const freeFallScene = new FreeFallScene()
