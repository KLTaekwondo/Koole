/**
 * 二力平衡：木块 + 左右拉力 + 合力
 */
import { MechanicsModel } from "../ModelBase.js"

const BLOCK_W = 1.2
const BLOCK_H = 0.9

export class TwoForceBalanceScene extends MechanicsModel {
  drawWorld(view, state, params) {
    const x = state.x || 0
    view.polyline([
      [x - BLOCK_W / 2, 0], [x + BLOCK_W / 2, 0],
      [x + BLOCK_W / 2, BLOCK_H], [x - BLOCK_W / 2, BLOCK_H],
    ], { color: "rgba(0,0,0,0.2)", width: 1.5, fill: view.colors.body })
  }

  drawOverlay(view, state, params) {
    const x = state.x || 0
    const y = BLOCK_H / 2
    // 左拉力
    view.arrow([x - BLOCK_W / 2, y], [x - BLOCK_W / 2 - Math.min(2, params.leftForce * 0.12), y], {
      color: "#3498db", width: 2.4, head: 9,
    })
    view.text(`F左 ${params.leftForce} N`, [x - BLOCK_W / 2 - 0.6, y + 0.25], { color: "#3498db", size: 10 })
    // 右拉力
    view.arrow([x + BLOCK_W / 2, y], [x + BLOCK_W / 2 + Math.min(2, params.rightForce * 0.12), y], {
      color: "#e67e22", width: 2.4, head: 9,
    })
    view.text(`F右 ${params.rightForce} N`, [x + BLOCK_W / 2 + 0.6, y + 0.25], { color: "#e67e22", size: 10 })
    // 合力状态
    const net = params.rightForce - params.leftForce
    const balanced = Math.abs(net) < 0.001
    view.badge(balanced ? "合力为 0 · 静止或匀速" : `合力 ${net.toFixed(1)} N`, [x, BLOCK_H + 0.5], { offsetY: -10 })
  }
}

export const twoForceBalanceScene = new TwoForceBalanceScene()
