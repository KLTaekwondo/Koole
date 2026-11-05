/**
 * 传送带：架在地面上的机器（带面 + 滚筒 + 支腿 + 电机 + 带纹）
 */
import { MechanicsModel } from "../ModelBase.js"

const BELT_THICKNESS = 0.28
const BELT_LIFT = 1.2
const BLOCK_H = 0.7
const BLOCK_W = 0.7
const DRUM_R = 0.26
const TREAD_STEP = 0.45

export class ConveyorBeltScene extends MechanicsModel {
  static environment = "landscape"

  constructor(options = {}) {
    super(options)
    // 滑块被抬到带面上，轨迹同步抬高
    this.trailOffset = [0, BELT_LIFT]
  }

  drawWorld(view, state, params) {
    const left = -1
    const right = params.beltLength + 1

    // 支腿（先画，压在带子下面）
    view.line([left, BELT_LIFT - BELT_THICKNESS], [left, 0], { color: "#78909c", width: 2.5 })
    view.line([right, BELT_LIFT - BELT_THICKNESS], [right, 0], { color: "#78909c", width: 2.5 })
    view.line([left + 0.6, BELT_LIFT - BELT_THICKNESS], [left + 0.6, 0], { color: "#90a4ae", width: 1.6 })

    // 带面
    view.polyline([
      [left, BELT_LIFT], [right, BELT_LIFT],
      [right, BELT_LIFT - BELT_THICKNESS], [left, BELT_LIFT - BELT_THICKNESS],
    ], { color: "#546e7a", width: 2, fill: "#cfd8dc" })

    // 带纹：短竖线，看起来像在「走」
    for (let x = left + 0.2; x < right; x += TREAD_STEP) {
      view.line([x, BELT_LIFT - 0.03], [x, BELT_LIFT - BELT_THICKNESS + 0.03], {
        color: "rgba(84,110,122,0.45)", width: 1.4,
      })
    }

    // 两端滚筒
    view.circle([left, BELT_LIFT - BELT_THICKNESS / 2], DRUM_R, {
      stroke: "#455a64", width: 2, fill: "#b0bec5",
    })
    view.point([left, BELT_LIFT - BELT_THICKNESS / 2], { r: 2.5, color: "#455a64" })
    view.circle([right, BELT_LIFT - BELT_THICKNESS / 2], DRUM_R, {
      stroke: "#455a64", width: 2, fill: "#b0bec5",
    })
    view.point([right, BELT_LIFT - BELT_THICKNESS / 2], { r: 2.5, color: "#455a64" })

    // 电机：右侧一个小方块 + 底座
    view.polyline([
      [right - 0.55, BELT_LIFT - BELT_THICKNESS - 0.35], [right + 0.15, BELT_LIFT - BELT_THICKNESS - 0.35],
      [right + 0.15, BELT_LIFT - BELT_THICKNESS], [right - 0.55, BELT_LIFT - BELT_THICKNESS],
    ], { color: "rgba(0,0,0,0.18)", width: 1.2, fill: "#90a4ae" })

    // 滑块：坐在带面上
    const x = state.x
    view.polyline([
      [x - BLOCK_W / 2, BELT_LIFT], [x + BLOCK_W / 2, BELT_LIFT],
      [x + BLOCK_W / 2, BELT_LIFT + BLOCK_H], [x - BLOCK_W / 2, BELT_LIFT + BLOCK_H],
    ], { color: "rgba(0,0,0,0.2)", width: 1.5, fill: view.colors.body })
  }

  drawOverlay(view, state, params) {
    const dir = Math.sign(params.beltSpeed) || 1
    const span = Math.min(2.5, Math.abs(params.beltSpeed) * 0.5)
    const midX = params.beltLength / 2
    // 带速箭头（带面上方，避开滑块）
    const arrowY = BELT_LIFT + 0.35
    view.arrow([midX - dir * span * 0.5, arrowY], [midX + dir * span * 0.5, arrowY], {
      color: "#546e7a", width: 2, head: 8,
    })
    view.text(`带速 ${params.beltSpeed.toFixed(1)} m/s`, [midX, arrowY], {
      color: view.colors.muted, size: 10, offsetY: 14,
    })
    view.badge(`滑块 ${state.v.toFixed(2)} m/s`, [state.x, BELT_LIFT + BLOCK_H], { offsetY: -16 })
  }
}

export const conveyorBeltScene = new ConveyorBeltScene()
