/**
 * 光的折射（几何图）：界面 + 法线 + 入射/折射光线 + 角度弧
 *
 * 这类模型没有运动，画面本身就是结论；记录走 snapshot（参数 → 结果）。
 * 图按画面居中排版：先由 worldYAt 把「屏幕中线」换算成世界 y。
 */
import { MechanicsModel } from "../ModelBase.js"

export class RefractionScene extends MechanicsModel {
  static environment = "none"
  drawWorld(view, state, params) {
    const theta1 = (params.incidentAngle * Math.PI) / 180
    const n1 = params.n1
    const n2 = params.n2
    const sinT2 = (n1 / n2) * Math.sin(theta1)
    const totalReflection = sinT2 > 1
    const theta2 = totalReflection ? null : Math.asin(Math.max(-1, Math.min(1, sinT2)))

    // 界面放在画面中线
    const interfaceY = view.worldYAt(view.ch * 0.52)
    const span = view.cw / view.unit() * 0.5
    const rayLen = Math.min(6, view.ch / view.unit() * 0.42)

    // 界面 + 法线
    view.horizontalLine(interfaceY, { color: view.colors.text, width: 2 })
    const hitX = 0
    view.dashed([hitX, interfaceY - rayLen * 0.75], [hitX, interfaceY + rayLen * 0.75], {
      color: view.colors.soft, width: 1.2,
    })

    // 入射光线（左上 → 入射点）
    view.line([hitX - rayLen * Math.sin(theta1), interfaceY + rayLen * Math.cos(theta1)], [hitX, interfaceY], {
      color: "#e74c3c", width: 2.2,
    })
    // 折射光线（或全反射）
    if (totalReflection) {
      view.line([hitX, interfaceY], [hitX + rayLen * Math.sin(theta1), interfaceY + rayLen * Math.cos(theta1)], {
        color: "#e74c3c", width: 2.2, dash: [6, 4],
      })
      view.text("全反射", [hitX + 1.6, interfaceY + 1.2], { color: "#e74c3c", size: 12, weight: 700 })
    } else {
      view.line([hitX, interfaceY], [hitX + rayLen * Math.sin(theta2), interfaceY - rayLen * Math.cos(theta2)], {
        color: "#3498db", width: 2.2,
      })
    }

    // 角度弧
    view.arcAngle([hitX, interfaceY], 1.5, -Math.PI / 2, -Math.PI / 2 + theta1, { color: "rgba(231,76,60,0.5)", width: 1.2 })
    if (!totalReflection && theta2 !== null) {
      view.arcAngle([hitX, interfaceY], 1.5, Math.PI / 2 - theta2, Math.PI / 2, { color: "rgba(52,152,219,0.5)", width: 1.2 })
    }

    // 介质标注
    view.text(`n₁ = ${n1.toFixed(2)}`, [-span * 0.62, interfaceY + 1.1], { color: view.colors.muted, size: 11 })
    view.text(`n₂ = ${n2.toFixed(2)}`, [-span * 0.62, interfaceY - 1.1], { color: view.colors.muted, size: 11 })
  }

  drawOverlay(view, state, params) {
    const theta1 = params.incidentAngle
    const sinT2 = (params.n1 / params.n2) * Math.sin((theta1 * Math.PI) / 180)
    const totalReflection = sinT2 > 1
    const theta2 = totalReflection ? null : (Math.asin(sinT2) * 180) / Math.PI
    view.badge(totalReflection ? "无折射光" : `折射角 ${theta2.toFixed(1)}°`, [0, 0], { offsetY: -34 })
  }
}

export const refractionScene = new RefractionScene()
