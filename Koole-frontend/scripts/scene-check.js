/**
 * 场景自检（开发用，不参与构建）
 *
 * 目的：模型绘制改完后我无法直接「看」画布，这里把场景渲染到 canvas，
 * 再按世界坐标取样像素 + 逐个模型跑一遍，把结果写成文本。
 *
 * 打开方式（vite dev 运行中）：
 *   http://127.0.0.1:5173/scripts/scene-check.html
 */

import { createView, palette } from "/src/Logic/physics/render/ViewKit.js"
import { conveyorBeltScene } from "/src/Logic/physics/render/scenes/conveyorBeltScene.js"
import { pendulumScene } from "/src/Logic/physics/render/scenes/pendulumScene.js"
import { boatRiverScene } from "/src/Logic/physics/render/scenes/boatRiverScene.js"
import { inclineScene } from "/src/Logic/physics/render/scenes/inclineScene.js"
import { PHYSICS_MODELS } from "/src/Logic/physics/physicsModels.js"

const W = 800
const H = 600
const UNIT = 30
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

const colors = palette("light")
const hexToRgb = (hex) => {
  const h = hex.replace("#", "")
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]
}
const dist = (a, b) => Math.round(Math.sqrt((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2))

function sampleAt(worldX, worldY) {
  const p = viewTransform.worldToScreen(worldX, worldY)
  if (p.x < 0 || p.x >= W || p.y < 0 || p.y >= H) return null
  const d = ctx.getImageData(Math.round(p.x), Math.round(p.y), 1, 1).data
  return [d[0], d[1], d[2]]
}

function renderScene(scene, state, params) {
  ctx.setTransform(1, 0, 0, 1, 0, 0)
  ctx.clearRect(0, 0, W, H)
  const view = createView({ ctx, cw: W, ch: H, viewTransform, theme: "light" })
  try {
    scene.drawScene(view, state, params)
    return { ok: true }
  } catch (error) {
    return { ok: false, error: String((error && error.message) || error) }
  }
}

function probe(label, worldX, worldY, expectedHex, tolerance = 40) {
  const rgb = sampleAt(worldX, worldY)
  if (!rgb) {
    out.push(`  ${label.padEnd(28)} 超出画布`)
    return false
  }
  const pass = expectedHex ? dist(rgb, hexToRgb(expectedHex)) <= tolerance : null
  out.push(`  ${label.padEnd(28)} rgb(${rgb.join(",")})  期望≈${expectedHex || "-"}  ${pass === null ? "" : pass ? "✓" : `✗ 差${dist(rgb, hexToRgb(expectedHex))}`}`)
  return pass
}

// ── 一、逐模型冒烟：用默认参数跑一遍，抓异常 ──
out.push("【全部模型渲染冒烟】")
let failed = 0
for (const model of PHYSICS_MODELS) {
  if (typeof model.drawScene !== "function") continue
  const params = Object.fromEntries((model.params || []).map(p => [p.key, p.value]))
  let state = {}
  try {
    state = model.createState ? model.createState(params) : {}
  } catch (error) {
    out.push(`  ${model.id.padEnd(24)} state 创建失败: ${(error && error.message) || error}`)
    failed++
    continue
  }
  const r = renderScene(model, state, params)
  if (!r.ok) {
    out.push(`  ${model.id.padEnd(24)} ✗ ${r.error}`)
    failed++
  }
}
out.push(`  结果：${failed === 0 ? "全部通过" : failed + " 个模型渲染失败"}`)

// ── 二、关键位置像素检查 ──
out.push("\n【传送带】")
{
  const params = { beltLength: 10, beltSpeed: 2, v0: 0, mu: 0.3, gravity: 9.8 }
  const state = { x: 3, v: 1, trail: [], _t: 1 }
  out.push(`  渲染: ${renderScene(conveyorBeltScene, state, params).ok ? "✓" : "✗"}`)
  probe("地面以下（y=-0.3）", 0, -0.3, colors.ground, 30)
  probe("带面（y=1.15）", 0, 1.15, "#cfd8dc", 60)
  probe("滑块（y=1.4）", 3, 1.4, colors.body, 70)
  probe("地面上方空白（y=2.6）", -3, 2.6, colors.sky, 80)
}

out.push("\n【单摆：轨迹与球对齐】")
{
  const params = { length: 5, gravity: 9.8, initAngle: 30 }
  const theta = 0.3
  const ball = [params.length * Math.sin(theta), params.length - params.length * Math.cos(theta) + 0.4]
  const state = {
    theta,
    omega: 1,
    trail: Array.from({ length: 40 }, (_, i) => {
      const t = theta * (i / 39)
      return { x: params.length * Math.sin(t), y: params.length - params.length * Math.cos(t) + 0.4 }
    }),
  }
  out.push(`  渲染: ${renderScene(pendulumScene, state, params).ok ? "✓" : "✗"}`)
  probe("摆球中心", ball[0], ball[1], colors.body, 70)
  probe("轨迹最后一点", ball[0], ball[1], "#e74c3c", 140)
}

out.push("\n【小船过河：水面与岸】")
{
  const params = { riverWidth: 6, boatSpeed: 3, currentSpeed: 1, headingAngle: 60 }
  const state = { x: 1, y: 2, _t: 1, trail: [] }
  out.push(`  渲染: ${renderScene(boatRiverScene, state, params).ok ? "✓" : "✗"}`)
  probe("河面中间", 4, 3, "#a9d0ef", 60)
  probe("岸边（y=6）", 0, 6, colors.ground, 60)
}

out.push("\n【斜面：球贴面】")
{
  const params = { angle: 30, rampHeight: 4, gravity: 9.8, mu: 0.1 }
  const state = { dist: 2, vel: 1, rampLen: 8, trail: [], _t: 1 }
  out.push(`  渲染: ${renderScene(inclineScene, state, params).ok ? "✓" : "✗"}`)
  const rad = (params.angle * Math.PI) / 180
  probe("球心", 2 * Math.cos(rad) - 0.35 * Math.sin(rad), 4 - 2 * Math.sin(rad) + 0.35 * Math.cos(rad), colors.body, 70)
}

document.getElementById("out").textContent = out.join("\n")
