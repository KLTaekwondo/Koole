/**
 * 场景预览（开发用）：把指定场景渲染成一张大图，供截图查看。
 * 访问：/scripts/scene-preview.html?scene=conveyor-belt
 */

import { createView } from "/src/Logic/physics/render/ViewKit.js"
import { PHYSICS_MODELS } from "/src/Logic/physics/physicsModels.js"

const W = 900
const H = 560
const UNIT = 34
const GROUND_OFFSET = 40

const scene = new URLSearchParams(location.search).get("scene") || "conveyor-belt"
const canvas = document.getElementById("stage")
const label = document.getElementById("label")
const ctx = canvas.getContext("2d")

const viewTransform = {
  worldToScreen: (wx, wy) => ({ x: W / 2 + wx * UNIT, y: H - GROUND_OFFSET - wy * UNIT }),
  pixelPerUnit: () => UNIT,
  offsetX: { value: 0 },
  offsetY: { value: 0 },
}

const model = PHYSICS_MODELS.find(m => m.id === scene)
if (!model) {
  label.textContent = `找不到模型：${scene}`
} else {
  label.textContent = `${model.name}（${scene}）`
  const params = Object.fromEntries((model.params || []).map(p => [p.key, p.value]))
  let state = {}
  try {
    state = model.createState ? model.createState(params) : {}
  } catch (error) {
    label.textContent += ` · state 失败: ${error.message}`
  }
  // 取景中心：优先用模型声明的，否则用球的起始位置
  let focusX = 0
  let focusY = 3
  try {
    const target = (model.getCameraTarget || model.getBallPosition)?.(state, params)
    if (target) { focusX = target.x; focusY = target.y }
  } catch {}

  // 模拟跑 1.5 秒，让轨迹/位置有内容
  if (typeof model.step === "function") {
    for (let i = 0; i < 90; i++) {
      try { model.step(state, params, 1 / 60) } catch { break }
      const tp = model.getTrailPosition ? model.getTrailPosition(state, params) : null
      if (tp && Array.isArray(state.trail)) state.trail.push({ ...tp })
    }
  }

  viewTransform.worldToScreen = (wx, wy) => ({
    x: W / 2 + (wx - focusX) * UNIT,
    y: H - GROUND_OFFSET - (wy - focusY) * UNIT,
  })
  const view = createView({ ctx, cw: W, ch: H, viewTransform, theme: "light" })
  try {
    model.drawScene(view, state, params)
  } catch (error) {
    label.textContent += ` · 绘制失败: ${error.message}`
  }
}
