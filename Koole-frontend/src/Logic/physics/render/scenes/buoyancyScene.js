/**
 * 浮力：水槽 + 液体 + 方块 + 浮力/重力箭头
 */
import { MechanicsModel } from "../ModelBase.js"

export class BuoyancyScene extends MechanicsModel {
  drawWorld(view, state, params) {
    const half = 2.2
    const side = state.side || Math.cbrt(params.volume)
    // 水槽
    view.polyline([[-half, 0], [half, 0], [half, params.liquidH], [-half, params.liquidH]], {
      color: "#607d8b", width: 2,
    })
    // 液体
    view.polyline([[-half, 0], [half, 0], [half, params.liquidH], [-half, params.liquidH]], {
      color: "rgba(74,163,223,0.5)", width: 1, fill: "rgba(74,163,223,0.18)",
    })
    // 液面线
    view.horizontalLine(params.liquidH, { color: "#4aa3df", width: 2 })
    // 方块
    const y = state.y
    view.polyline([
      [-side / 2, y - side / 2], [side / 2, y - side / 2],
      [side / 2, y + side / 2], [-side / 2, y + side / 2],
    ], { color: "rgba(0,0,0,0.25)", width: 1.5, fill: view.colors.body })
  }

  drawOverlay(view, state, params) {
    const side = state.side || Math.cbrt(params.volume)
    const submerged = Math.max(0, Math.min(side, state.y + side / 2 - 0))
    const buoyancy = params.rhoLiquid * params.gravity * submerged * side * side
    const weight = params.rhoObj * params.volume * params.gravity
    const at = [0, state.y]
    view.arrow(at, [at[0], at[1] + 1.2], { color: "#27ae60", width: 2.2, head: 8 })
    view.text(`浮力 ${buoyancy.toFixed(1)} N`, at, { color: "#27ae60", size: 10, align: "left", offsetX: 12, offsetY: -18 })
    view.arrow(at, [at[0], at[1] - 1.2], { color: "#e74c3c", width: 2.2, head: 8 })
    view.text(`重力 ${weight.toFixed(1)} N`, at, { color: "#e74c3c", size: 10, align: "left", offsetX: 12, offsetY: 26 })
  }
}

export const buoyancyScene = new BuoyancyScene()
