/**
 * 力的合成：两个分力 + 平行四边形 + 合力
 */
import { MechanicsModel } from "../ModelBase.js"

export class ForceCompositionScene extends MechanicsModel {
  drawWorld(view, state, params) {
    const rad = (params.angle * Math.PI) / 180
    const scale = 0.25
    const f1 = params.F1 * scale
    const f2 = params.F2 * scale
    const origin = [0, 1]
    // 分力
    view.arrow(origin, [f1, 1], { color: "#3498db", width: 2.4, head: 9 })
    view.arrow(origin, [f2 * Math.cos(rad), 1 + f2 * Math.sin(rad)], { color: "#e67e22", width: 2.4, head: 9 })
    // 平行四边形辅助线
    const r = [f1 + f2 * Math.cos(rad), 1 + f2 * Math.sin(rad)]
    view.dashed([f1, 1], r, { color: view.colors.soft, width: 1 })
    view.dashed([f2 * Math.cos(rad), 1 + f2 * Math.sin(rad)], r, { color: view.colors.soft, width: 1 })
    // 合力
    view.arrow(origin, r, { color: "#27ae60", width: 2.6, head: 10 })
    // 夹角弧
    view.arcAngle(origin, 0.9, 0, rad, { color: "rgba(0,0,0,0.2)", width: 1.2 })
  }

  drawOverlay(view, state, params) {
    const rad = (params.angle * Math.PI) / 180
    const fr = Math.sqrt(params.F1 ** 2 + params.F2 ** 2 + 2 * params.F1 * params.F2 * Math.cos(rad))
    const scale = 0.25
    const r = [params.F1 * scale + params.F2 * scale * Math.cos(rad), 1 + params.F2 * scale * Math.sin(rad)]
    view.text(`F₁ = ${params.F1} N`, [params.F1 * scale, 1], { color: "#3498db", size: 10, offsetY: -12 })
    view.text(`F₂ = ${params.F2} N`, [params.F2 * scale * Math.cos(rad), 1 + params.F2 * scale * Math.sin(rad)], {
      color: "#e67e22", size: 10, offsetX: 16,
    })
    view.text(`合力 ${fr.toFixed(1)} N`, [r[0], r[1]], { color: "#27ae60", size: 11, offsetX: 18, weight: 600 })
    view.text(`θ = ${params.angle}°`, [0, 1], { color: view.colors.muted, size: 10, offsetX: 32, offsetY: 12 })
  }
}

export const forceCompositionScene = new ForceCompositionScene()
