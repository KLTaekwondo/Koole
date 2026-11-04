/**
 * 斜面滑块：斜面多边形 + 滑块 + 速度箭头 + 角度标注
 */

import { MechanicsModel } from "../ModelBase.js"
import { GROUND_Y } from "../geometry.js"

const BALL_RADIUS = 0.35

export class InclineScene extends MechanicsModel {
  drawWorld(view, state, params) {
    const theta = (params.angle * Math.PI) / 180
    const rampEnd = [state.rampLen * Math.cos(theta), 0]
    // 斜面本体
    view.polyline(
      [[0, params.rampHeight], rampEnd, [0, 0]],
      { color: "rgba(52,152,219,0.5)", width: 2, fill: "rgba(52,152,219,0.08)" },
    )
    // 滑块位置：沿斜面下滑 dist
    const ball = [
      state.dist * Math.cos(theta),
      params.rampHeight - state.dist * Math.sin(theta) + BALL_RADIUS,
    ]
    view.circle(ball, BALL_RADIUS, {
      fill: view.colors.body,
      stroke: "rgba(0,0,0,0.2)",
      width: 1,
    })
  }

  drawOverlay(view, state, params) {
    const theta = (params.angle * Math.PI) / 180
    // 角度标注
    view.text(`θ = ${params.angle}°`, [0, 0], {
      color: view.colors.muted,
      size: 11,
      align: "left",
      offsetX: 26,
      offsetY: -10,
    })
    // 速度箭头（沿斜面向下）
    if (state.vel > 0.2) {
      const ball = [
        state.dist * Math.cos(theta),
        params.rampHeight - state.dist * Math.sin(theta) + BALL_RADIUS,
      ]
      const length = Math.min(2, state.vel * 0.12)
      view.arrow(ball, [ball[0] + Math.cos(theta) * length, ball[1] - Math.sin(theta) * length], {
        color: "#e74c3c",
        width: 2.5,
        head: 9,
      })
      view.text(`${state.vel.toFixed(1)} m/s`, ball, {
        color: "#e74c3c",
        size: 11,
        align: "left",
        offsetX: 12,
        offsetY: -12,
        weight: 600,
      })
    }
    // 已滑距离
    view.text(`${state.dist.toFixed(1)} / ${state.rampLen.toFixed(1)} m`, [0, params.rampHeight], {
      color: view.colors.muted,
      size: 10,
      align: "left",
      offsetX: 10,
      offsetY: 14,
    })
  }
}

export const inclineScene = new InclineScene()
