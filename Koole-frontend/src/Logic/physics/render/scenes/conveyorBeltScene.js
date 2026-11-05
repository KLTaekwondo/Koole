/**
 * 传送带：一台落地的机器
 *
 * 坐标系说明（关键）：
 *   物理层里物块 y = GROUND_Y(0.4)，getTrailPosition 也返回这个 y。
 *   视觉上把带面抬到 BELT_LIFT，所以轨迹必须补偿 (BELT_LIFT - GROUND_Y)，
 *   否则轨迹会落在和滑块不同的高度上。
 *
 * 造型约束：
 *   支撑结构用「填充块」而不是细线 —— 几像素的线在 20m 长的带子旁几乎看不见，
 *   画面就会显得整台机器悬空。
 */
import { MechanicsModel } from "../ModelBase.js"
import { GROUND_Y } from "../geometry.js"

const BELT_LIFT = 1.2         // 带面离地高度
const BELT_THICKNESS = 0.26   // 带体厚度
const DRUM_R = 0.26
const BLOCK_W = 0.7
const BLOCK_H = 0.7
const BASE_H = 0.22           // 底座高度
const LEG_W = 0.22            // 支腿宽度

export class ConveyorBeltScene extends MechanicsModel {
  static environment = "landscape"

  constructor(options = {}) {
    super(options)
    // 物理 y = GROUND_Y，视觉底部在 BELT_LIFT，差值就是要补偿的量
    this.trailOffset = [0, BELT_LIFT - GROUND_Y]
  }

  drawWorld(view, state, params) {
    const left = -1.5
    const right = params.beltLength + 1.5
    const beltBottom = BELT_LIFT - BELT_THICKNESS

    // ── 底座：贴地整条（让机器"站在"地面上）──
    view.rect([left, 0], right - left, BASE_H, {
      fill: "#8d9aa5", stroke: "#5d6a75", width: 1,
    })

    // ── 支腿：填充块，等距分布 ──
    const legTop = beltBottom
    const legBottom = BASE_H
    const legCount = Math.max(3, Math.min(9, Math.round(params.beltLength / 3)))
    for (let i = 0; i < legCount; i++) {
      const t = i / (legCount - 1)
      const lx = left + 0.6 + t * (right - left - 1.2)
      view.rect([lx - LEG_W / 2, legBottom], LEG_W, legTop - legBottom, {
        fill: "#90a4ae", stroke: "#607d8b", width: 1,
      })
    }

    // ── 横梁：支腿之间的斜撑，强化"结构感" ──
    view.line([left + 0.6, legBottom + 0.06], [right - 0.6, legTop - 0.06], {
      color: "rgba(96,125,139,0.35)", width: 1.2,
    })

    // ── 带体 ──
    view.rect([left, beltBottom], right - left, BELT_THICKNESS, {
      fill: "#cfd8dc", stroke: "#546e7a", width: 1.5,
    })

    // 带纹
    for (let x = left + 0.3; x < right - 0.2; x += 0.46) {
      view.line([x, beltBottom + 0.05], [x, BELT_LIFT - 0.05], {
        color: "rgba(84,110,122,0.5)", width: 1.1,
      })
    }

    // ── 两端滚筒 ──
    for (const dx of [left, right]) {
      view.circle([dx, beltBottom + BELT_THICKNESS / 2], DRUM_R, {
        fill: "#b0bec5", stroke: "#455a64", width: 1.5,
      })
    }

    // ── 滑块：坐在带面上 ──
    view.rect([state.x - BLOCK_W / 2, BELT_LIFT], BLOCK_W, BLOCK_H, {
      fill: view.colors.body, stroke: "rgba(0,0,0,0.22)", width: 1.5,
    })
    view.line([state.x - 0.22, BELT_LIFT + 0.22], [state.x + 0.22, BELT_LIFT + 0.22], {
      color: "rgba(255,255,255,0.4)", width: 1.2,
    })
    view.line([state.x - 0.22, BELT_LIFT + 0.45], [state.x + 0.22, BELT_LIFT + 0.45], {
      color: "rgba(255,255,255,0.4)", width: 1.2,
    })
  }

  drawOverlay(view, state, params) {
    const dir = Math.sign(params.beltSpeed) || 1
    const span = Math.min(3, Math.abs(params.beltSpeed) * 0.45)
    const midX = state.x
    const arrowY = BELT_LIFT + BLOCK_H + 0.55

    // 带速箭头：跟着滑块走，避免在 20m 长的带子上跑出画面
    view.text(`带速 ${params.beltSpeed.toFixed(1)} m/s`, [midX, arrowY], {
      color: "#546e7a", size: 10, offsetY: -12,
    })
    view.arrow([midX - dir * span * 0.5, arrowY], [midX + dir * span * 0.5, arrowY], {
      color: "#546e7a", width: 2, head: 8,
    })
    view.badge(`滑块 ${state.v.toFixed(2)} m/s`, [state.x, BELT_LIFT + BLOCK_H], { offsetY: -3 })
  }
}

export const conveyorBeltScene = new ConveyorBeltScene()
