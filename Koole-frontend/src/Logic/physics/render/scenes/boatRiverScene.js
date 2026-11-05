/**
 * 小船过河：河水带 + 两岸 + 船 + 速度合成
 *
 * 河流横跨画面，所以不用 landscape 的「一条地面」，改用 none 环境自己画舞台。
 */
import { MechanicsModel } from "../ModelBase.js"

const BOAT_W = 0.9
const BOAT_H = 0.4

export class BoatRiverScene extends MechanicsModel {
  static environment = "none"
  drawWorld(view, state, params) {
    const width = params.riverWidth
    // 河水
    view.polyline([[0, 0], [state.x + 8, 0], [state.x + 8, width], [0, width]], {
      color: "#4aa3df", width: 2, fill: "rgba(52,152,219,0.10)",
    })
    // 两岸
    view.line([-4, 0], [state.x + 8, 0], { color: view.colors.ground, width: 3 })
    view.line([-4, width], [state.x + 8, width], { color: view.colors.ground, width: 3 })
    // 水流方向箭头（每 0.25 河宽一道）
    for (const ratio of [0.2, 0.4, 0.6, 0.8]) {
      const y = width * ratio
      for (let i = 0; i < 3; i++) {
        const x = state.x - 2 + i * 2.6
        view.arrow([x, y], [x + 0.5, y], { color: "rgba(74,163,223,0.55)", width: 1.2, head: 5 })
      }
    }
    // 船
    view.polyline([
      [state.x - BOAT_W / 2, state.y - BOAT_H / 2],
      [state.x + BOAT_W / 2, state.y - BOAT_H / 2],
      [state.x + BOAT_W / 2, state.y + BOAT_H / 2],
      [state.x - BOAT_W / 2, state.y + BOAT_H / 2],
    ], { color: "rgba(0,0,0,0.2)", width: 1.5, fill: "#e74c3c" })
  }

  drawOverlay(view, state, params) {
    const rad = (params.headingAngle * Math.PI) / 180
    const boatSpeed = params.boatSpeed
    const current = params.currentSpeed
    // 船头方向（相对水）
    const vx = boatSpeed * Math.sin(rad)
    const vy = boatSpeed * Math.cos(rad)
    view.arrow([state.x, state.y], [state.x + vx * 0.35, state.y + vy * 0.35], {
      color: "#e74c3c", width: 2, head: 8,
    })
    // 水流
    view.arrow([state.x, state.y], [state.x + current * 0.35, state.y], {
      color: "#3498db", width: 2, head: 8,
    })
    // 合速度
    view.arrow([state.x, state.y], [state.x + (vx + current) * 0.35, state.y + vy * 0.35], {
      color: "#27ae60", width: 2, head: 8, dash: [4, 3],
    })
    view.text(`过河 ${(state.y).toFixed(1)} / ${params.riverWidth} m`, [state.x, state.y], {
      color: view.colors.muted, size: 10, offsetY: 22,
    })
    view.text(`t = ${state._t.toFixed(1)} s`, [state.x, state.y], {
      color: view.colors.muted, size: 10, offsetY: -22,
    })
  }
}

export const boatRiverScene = new BoatRiverScene()
