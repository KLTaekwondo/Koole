/**
 * 木板滑块：地面上的木板 + 木板上的滑块
 */
import { MechanicsModel } from "../ModelBase.js"

const BOARD_H = 0.5
const BLOCK_H = 0.6
const BLOCK_W = 1.0

export class BlockBoardScene extends MechanicsModel {
  drawWorld(view, state, params) {
    // 木板
    view.polyline([
      [state.xB, 0], [state.xB + params.boardLength, 0],
      [state.xB + params.boardLength, BOARD_H], [state.xB, BOARD_H],
    ], { color: "rgba(0,0,0,0.2)", width: 1.5, fill: "#6c7a89" })
    // 滑块
    const bx = state.xb
    view.polyline([
      [bx - BLOCK_W / 2, BOARD_H], [bx + BLOCK_W / 2, BOARD_H],
      [bx + BLOCK_W / 2, BOARD_H + BLOCK_H], [bx - BLOCK_W / 2, BOARD_H + BLOCK_H],
    ], { color: "rgba(0,0,0,0.2)", width: 1.5, fill: view.colors.body })
  }

  drawOverlay(view, state, params) {
    view.badge(`滑块 ${state.vb.toFixed(2)} m/s`, [state.xb, BOARD_H + BLOCK_H], { offsetY: -16 })
    view.text(`木板 ${state.vB.toFixed(2)} m/s`, [state.xB + params.boardLength / 2, 0], {
      color: view.colors.muted, size: 10, offsetY: 16,
    })
    view.text(`相对位移 ${Math.abs(state.xb - state.xB).toFixed(2)} m`, [state.xB, BOARD_H], {
      color: view.colors.muted, size: 10, offsetY: -12,
    })
  }
}

export const blockBoardScene = new BlockBoardScene()
