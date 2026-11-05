/**
 * 杠杆：支点 + 横梁（按力矩倾斜）+ 两侧重物
 */
import { MechanicsModel } from "../ModelBase.js"

const BEAM_LEN = 6
const PIVOT_Y = 2

export class LeverScene extends MechanicsModel {
  drawWorld(view, state, params) {
    const tilt = state.angle || 0
    const cx = 0
    const cy = PIVOT_Y
    const half = BEAM_LEN / 2
    const leftEnd = [cx - half * Math.cos(tilt), cy + half * Math.sin(tilt)]
    const rightEnd = [cx + half * Math.cos(tilt), cy - half * Math.sin(tilt)]
    // 支点
    view.polyline([[cx - 0.45, cy - 0.7], [cx + 0.45, cy - 0.7], [cx, cy]], {
      color: view.colors.ground, width: 2, fill: "rgba(44,62,80,0.25)",
    })
    // 横梁
    view.line(leftEnd, rightEnd, { color: "#8d6e63", width: 5 })
    // 两侧重物
    const d1 = Math.min(params.d1, half)
    const d2 = Math.min(params.d2, half)
    const p1 = [cx - d1 * Math.cos(tilt), cy + d1 * Math.sin(tilt)]
    const p2 = [cx + d2 * Math.cos(tilt), cy - d2 * Math.sin(tilt)]
    view.polyline([[p1[0] - 0.3, p1[1] - 0.6], [p1[0] + 0.3, p1[1] - 0.6], [p1[0] + 0.3, p1[1]], [p1[0] - 0.3, p1[1]]], {
      color: "rgba(0,0,0,0.2)", width: 1.2, fill: "#3498db",
    })
    view.polyline([[p2[0] - 0.3, p2[1] - 0.6], [p2[0] + 0.3, p2[1] - 0.6], [p2[0] + 0.3, p2[1]], [p2[0] - 0.3, p2[1]]], {
      color: "rgba(0,0,0,0.2)", width: 1.2, fill: "#e67e22",
    })
    // 力臂标注
    view.text(`L₁ ${params.d1} m`, [cx - d1 / 2, cy + 0.35], { color: "#3498db", size: 10 })
    view.text(`L₂ ${params.d2} m`, [cx + d2 / 2, cy - 0.5], { color: "#e67e22", size: 10 })
  }

  drawOverlay(view, state, params) {
    const tau1 = params.F1 * params.d1 * (params.dir1 || 1)
    const tau2 = params.F2 * params.d2 * (params.dir2 || 1)
    const balanced = Math.abs(tau1 - tau2) < 0.001
    view.badge(balanced ? "力矩平衡" : tau1 > tau2 ? "左侧下沉" : "右侧下沉", [0, PIVOT_Y + 1.6], {
      offsetY: -8,
    })
    view.text(`F₁·L₁ = ${tau1.toFixed(1)} N·m`, [-2.2, PIVOT_Y + 1.0], { color: "#3498db", size: 10 })
    view.text(`F₂·L₂ = ${tau2.toFixed(1)} N·m`, [2.2, PIVOT_Y + 1.0], { color: "#e67e22", size: 10 })
  }
}

export const leverScene = new LeverScene()
