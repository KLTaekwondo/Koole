/**
 * 连接体：桌面 + 滑轮 + 桌面滑块 + 悬挂重物
 */
import { MechanicsModel } from "../ModelBase.js"
import { GROUND_Y } from "../geometry.js"

const TABLE_H = 5
const TABLE_W = 8
const M1_HW = 0.45
const M1_HH = 0.3
const M2_R = 0.38
const PULLEY_X = 1.0

export class ConnectedBodiesScene extends MechanicsModel {
  drawWorld(view, state, params) {
    const d = state.d
    const m1X = Math.max(-TABLE_W + M1_HW, Math.min(-TABLE_W + M1_HW + d, -M1_HW))
    const pulleyY = TABLE_H + M1_HH
    const m2Y = Math.max(pulleyY - M2_R - d, GROUND_Y)

    // 桌面
    view.polyline([[-TABLE_W, TABLE_H], [0, TABLE_H], [0, 0]], { color: "#8d6e63", width: 3 })
    view.line([-TABLE_W, TABLE_H], [0, TABLE_H], { color: "#a1887f", width: 4 })
    // 滑轮
    view.circle([PULLEY_X, pulleyY], 0.28, { stroke: "#607d8b", width: 2 })
    view.point([PULLEY_X, pulleyY], { r: 3, color: "#607d8b" })
    // 绳子：桌面段 + 竖直段
    view.line([m1X, TABLE_H + M1_HH], [PULLEY_X, pulleyY], { color: "#78909c", width: 1.6 })
    view.line([PULLEY_X, pulleyY], [PULLEY_X, m2Y + M2_R], { color: "#78909c", width: 1.6 })
    // 桌面滑块
    view.polyline([
      [m1X - M1_HW, TABLE_H], [m1X + M1_HW, TABLE_H],
      [m1X + M1_HW, TABLE_H + M1_HH * 2], [m1X - M1_HW, TABLE_H + M1_HH * 2],
    ], { color: "rgba(0,0,0,0.2)", width: 1.5, fill: "#42a5f5" })
    // 悬挂重物
    view.circle([PULLEY_X, m2Y], M2_R, { fill: "#ef6c00", stroke: "rgba(0,0,0,0.2)", width: 1.5 })
  }

  drawOverlay(view, state, params) {
    view.badge(`${state.v.toFixed(2)} m/s`, [PULLEY_X, TABLE_H + 0.9], { offsetY: -14 })
    view.text(`位移 ${state.d.toFixed(2)} m`, [-TABLE_W + 1, TABLE_H + 0.55], {
      color: view.colors.muted, size: 10, align: "left",
    })
  }
}

export const connectedBodiesScene = new ConnectedBodiesScene()
