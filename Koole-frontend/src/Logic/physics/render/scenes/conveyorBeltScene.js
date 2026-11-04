/**
 * 传送带：传送带本体 + 带速箭头 + 滑块
 */
import { MechanicsModel } from "../ModelBase.js"

const BELT_THICKNESS = 0.3
const BLOCK_H = 0.7
const BLOCK_W = 0.7

export class ConveyorBeltScene extends MechanicsModel {
  drawWorld(view, state, params) {
    const left = -1
    const right = params.beltLength + 1
    // 传送带带面（基准线以下，画在道具层里，不会被地面盖住）
    view.polyline([[left, 0], [right, 0], [right, -BELT_THICKNESS], [left, -BELT_THICKNESS]], {
      color: "#90a4ae", width: 2, fill: "#cfd8dc",
    })
    // 两端滚筒
    view.circle([left, -BELT_THICKNESS / 2], 0.2, { stroke: "#607d8b", width: 2, fill: "#b0bec5" })
    view.circle([right, -BELT_THICKNESS / 2], 0.2, { stroke: "#607d8b", width: 2, fill: "#b0bec5" })
    // 支腿
    view.line([left, -BELT_THICKNESS], [left, -BELT_THICKNESS - 0.5], { color: "#78909c", width: 2 })
    view.line([right, -BELT_THICKNESS], [right, -BELT_THICKNESS - 0.5], { color: "#78909c", width: 2 })
    // 滑块
    const x = state.x
    view.polyline([
      [x - BLOCK_W / 2, 0], [x + BLOCK_W / 2, 0],
      [x + BLOCK_W / 2, BLOCK_H], [x - BLOCK_W / 2, BLOCK_H],
    ], { color: "rgba(0,0,0,0.2)", width: 1.5, fill: view.colors.body })
  }

  drawOverlay(view, state, params) {
    // 带速箭头
    const dir = Math.sign(params.beltSpeed) || 1
    const span = Math.min(2.5, Math.abs(params.beltSpeed) * 0.5)
    const midX = params.beltLength / 2
    view.arrow([midX - dir * span * 0.5, -BELT_THICKNESS - 0.35], [midX + dir * span * 0.5, -BELT_THICKNESS - 0.35], {
      color: "#546e7a", width: 2, head: 8,
    })
    view.text(`带速 ${params.beltSpeed.toFixed(1)} m/s`, [midX, -BELT_THICKNESS - 0.35], {
      color: view.colors.muted, size: 10, offsetY: 16,
    })
    view.badge(`${state.v.toFixed(2)} m/s`, [state.x, BLOCK_H], { offsetY: -16 })
  }
}

export const conveyorBeltScene = new ConveyorBeltScene()
