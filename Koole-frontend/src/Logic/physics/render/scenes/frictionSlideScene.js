/**
 * 摩擦滑动：地面纹理 + 方块 + 速度读数
 */
import { MechanicsModel } from "../ModelBase.js"

const BLOCK_W = 0.9
const BLOCK_H = 0.6

export class FrictionSlideScene extends MechanicsModel {
  drawWorld(view, state, params) {
    // 地面摩擦纹理（每 2.5 m 一道斜线）
    for (let wx = 0; wx < 30; wx += 2.5) {
      view.line([wx, 0], [wx + 0.14, 0.18], { color: view.colors.soft, width: 0.8 })
    }
    // 方块
    const x = state.x
    view.polyline([
      [x - BLOCK_W / 2, 0],
      [x + BLOCK_W / 2, 0],
      [x + BLOCK_W / 2, BLOCK_H],
      [x - BLOCK_W / 2, BLOCK_H],
    ], { color: "rgba(0,0,0,0.2)", width: 1.5, fill: view.colors.body })
  }

  drawOverlay(view, state, params) {
    view.text(`μ = ${params.mu}`, [0, 0], {
      color: view.colors.muted, size: 11, align: "left", offsetX: 6, offsetY: -10,
    })
    view.badge(`${state.vx.toFixed(1)} m/s`, [state.x, BLOCK_H], { offsetY: -18 })
    view.text(`x = ${state.x.toFixed(1)} m`, [state.x, BLOCK_H], {
      color: view.colors.muted, size: 10, offsetY: -36,
    })
  }
}

export const frictionSlideScene = new FrictionSlideScene()
