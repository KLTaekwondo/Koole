/**
 * 弹簧振子：天花板 + 弹簧 + 质量块 + 平衡位置
 */
import { MechanicsModel } from "../ModelBase.js"

const CEILING_Y = 4
const MASS_W = 0.8
const MASS_H = 0.6
const EQUILIBRIUM = 3

export class SpringMassScene extends MechanicsModel {
  static environment = "none"
  drawWorld(view, state, params) {
    const x = state.x || 0
    const massY = EQUILIBRIUM - x
    // 天花板
    view.line([-1.6, CEILING_Y], [1.6, CEILING_Y], { color: view.colors.ground, width: 3 })
    // 弹簧：折线
    const coils = 8
    const top = CEILING_Y
    const bottom = massY + MASS_H / 2
    const points = [[0, top]]
    for (let i = 1; i < coils * 2; i++) {
      const t = i / (coils * 2)
      const y = top - (top - bottom) * t
      points.push([(i % 2 === 0 ? 1 : -1) * 0.35, y])
    }
    points.push([0, bottom])
    view.polyline(points, { color: "#78909c", width: 1.8 })
    // 质量块
    view.polyline([
      [-MASS_W / 2, massY - MASS_H / 2], [MASS_W / 2, massY - MASS_H / 2],
      [MASS_W / 2, massY + MASS_H / 2], [-MASS_W / 2, massY + MASS_H / 2],
    ], { color: "rgba(0,0,0,0.2)", width: 1.5, fill: view.colors.body })
    // 平衡位置虚线
    view.dashed([-1.6, EQUILIBRIUM], [1.6, EQUILIBRIUM], { color: view.colors.soft, width: 1 })
  }

  drawOverlay(view, state, params) {
    const x = state.x || 0
    const period = 2 * Math.PI * Math.sqrt(params.mass / params.k)
    view.badge(`${x.toFixed(2)} m`, [0, EQUILIBRIUM - x], { offsetX: 46 })
    view.text(`T = ${period.toFixed(2)} s`, [-1.4, EQUILIBRIUM], {
      color: view.colors.muted, size: 10, align: "left", offsetY: 14,
    })
  }
}

export const springMassScene = new SpringMassScene()
