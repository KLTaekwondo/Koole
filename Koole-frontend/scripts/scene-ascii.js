/**
 * 场景 ASCII 预览（开发用）
 *
 * 把场景渲染到 canvas，再降采样成字符画输出。
 * 这样即使无法查看图片，也能从字符分布看出形状、位置、遮挡关系。
 *
 *   /scripts/scene-ascii.html?scene=conveyor-belt&cols=96&rows=34
 */

import { createView } from "/src/Logic/physics/render/ViewKit.js"
import { PHYSICS_MODELS } from "/src/Logic/physics/physicsModels.js"

const query = new URLSearchParams(location.search)
const sceneId = query.get("scene") || "conveyor-belt"
const COLS = Number(query.get("cols")) || 96
const ROWS = Number(query.get("rows")) || 34
const STEPS = Number(query.get("steps")) || 90

const W = 960
const H = 600
const UNIT = Number(query.get("unit")) || 34
const GROUND_OFFSET = 40

const canvas = document.getElementById("stage")
const ctx = canvas.getContext("2d")
const out = []

const viewTransform = {
  worldToScreen: (wx, wy) => ({ x: W / 2 + wx * UNIT, y: H - GROUND_OFFSET - wy * UNIT }),
  pixelPerUnit: () => UNIT,
  offsetX: { value: 0 },
  offsetY: { value: 0 },
}

const model = PHYSICS_MODELS.find(m => m.id === sceneId)
if (!model) {
  document.getElementById("out").textContent = `找不到模型：${sceneId}`
} else {
  const params = Object.fromEntries((model.params || []).map(p => [p.key, p.value]))
  let state = {}
  try {
    state = model.createState ? model.createState(params) : {}
  } catch (e) { out.push("state 失败: " + e.message) }

  for (let i = 0; i < STEPS; i++) {
    try { model.step(state, params, 1 / 60) } catch { break }
    const tp = model.getTrailPosition ? model.getTrailPosition(state, params) : null
    if (tp && Array.isArray(state.trail)) state.trail.push({ ...tp })
  }

  // 精确复刻引擎相机：centerCameraOnBall 把目标放在视口 67% 高度处
  const unit = UNIT
  let focusX = 0
  let focusY = 3
  try {
    const target = (model.getCameraTarget || model.getBallPosition)?.(state, params)
    if (target) { focusX = target.x; focusY = target.y }
  } catch {}

  const offsetX = -focusX * unit
  const offsetY = focusY * unit + 40 - H * 0.67
  viewTransform.worldToScreen = (wx, wy) => ({
    x: W / 2 + wx * unit + offsetX,
    y: H - 40 - wy * unit + offsetY,
  })
  viewTransform.pixelPerUnit = () => unit
  // ViewKit 的 anchorY()/grid() 读的是这两个 ref，必须同步
  viewTransform.offsetX.value = offsetX
  viewTransform.offsetY.value = offsetY

  const view = createView({ ctx, cw: W, ch: H, viewTransform, theme: "light" })
  try {
    model.drawScene(view, state, params)
  } catch (e) { out.push("绘制失败: " + e.message) }

  // ── 降采样成字符画 ──
  const cw = Math.floor(W / COLS)
  const ch = Math.floor(H / ROWS)
  const rows = []
  for (let r = 0; r < ROWS; r++) {
    let line = ""
    for (let c = 0; c < COLS; c++) {
      const d = ctx.getImageData(c * cw, r * ch, cw, ch).data
      let sr = 0, sg = 0, sb = 0, n = 0
      for (let i = 0; i < d.length; i += 4) {
        sr += d[i]; sg += d[i + 1]; sb += d[i + 2]; n++
      }
      const R = sr / n, G = sg / n, B = sb / n
      line += classify(R, G, B)
    }
    rows.push(line)
  }

  out.push(`场景: ${model.name} (${sceneId})  尺寸 ${W}x${H}  单位 ${UNIT}px/m  地面屏高 ${H - GROUND_OFFSET}`)
  out.push(`图例: 空=天空/背景  ▓=地面  ═=带面/横线  │=竖线  ●=球/圆  ■=方块  ╱╲=斜线  ?=其他`)
  out.push("+" + "-".repeat(COLS) + "+")
  rows.forEach((line, i) => {
    const worldY = ((H - 40 + offsetY - (i + 0.5) * ch) / unit).toFixed(1)
    out.push("|" + line + "| y=" + worldY)
  })
  out.push("+" + "-".repeat(COLS) + "+")
}

function classify(r, g, b) {
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const lum = 0.299 * r + 0.587 * g + 0.114 * b
  const sat = max === 0 ? 0 : (max - min) / max

  // 天空/背景（浅蓝或白）
  if (lum > 226 && sat < 0.25) return " "
  // 地面（深蓝灰 #2c3e50 系）
  if (lum < 110 && b > r && b - r > 8) return "▓"
  // 红色物体（球/滑块）
  if (r > 150 && r - g > 60 && r - b > 60) return "●"
  // 橙色
  if (r > 180 && g > 90 && g < 180 && b < 110) return "◎"
  // 蓝色系（带面、水、箭头）
  if (b > 150 && b - r > 20) return "≈"
  // 灰色（金属、滚筒、带面）
  if (sat < 0.16) {
    if (lum < 150) return "│"
    return "═"
  }
  return "?"
}

document.getElementById("out").textContent = out.join("\n")
