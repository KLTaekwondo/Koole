import { GRID_SIZE, GROUND_Y, MIN_GRID_PX } from '../../constants/physics.js'
import { getModel, getModelByObject, getModelName } from './modelRegistry.js'
import { getRawObject } from './objectTypes.js'

/** 屏幕坐标 → 世界坐标 */
function screenToWorld(sx, sy, camera) {
  return { x: sx / camera.scale + camera.x, y: sy / camera.scale + camera.y }
}

/** 网格世界间距：屏幕间距不低于 MIN_GRID_PX，缩小时间距翻倍 */
function computeGridSpacing(scale) {
  let spacing = GRID_SIZE
  while (spacing * scale < MIN_GRID_PX) spacing *= 2
  return spacing
}

/** 网格：只画可见区，世界格点对齐（平移不漂移），线宽随缩放补偿 */
function drawGrid(ctx, scene) {
  const { camera } = scene
  const isDark = scene.theme === 'dark'
  const spacing = computeGridSpacing(camera.scale)
  const left = camera.x
  const right = camera.x + scene.width / camera.scale
  const top = camera.y
  const bottom = camera.y + scene.height / camera.scale

  ctx.save()
  ctx.strokeStyle = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)'
  ctx.lineWidth = 1 / camera.scale
  for (let x = Math.floor(left / spacing) * spacing; x <= right; x += spacing) {
    ctx.beginPath()
    ctx.moveTo(x, top)
    ctx.lineTo(x, bottom)
    ctx.stroke()
  }
  for (let y = Math.floor(top / spacing) * spacing; y <= bottom; y += spacing) {
    ctx.beginPath()
    ctx.moveTo(left, y)
    ctx.lineTo(right, y)
    ctx.stroke()
  }
  ctx.restore()
}

/** 地面线：世界坐标 GROUND_Y 处的实线 + 土壤填充带 + 标签 */
function drawGround(ctx, scene) {
  const { camera } = scene
  const isDark = scene.theme === 'dark'
  const worldWidth = scene.width / camera.scale
  const worldHeight = scene.height / camera.scale

  ctx.save()
  ctx.strokeStyle = isDark ? 'rgba(196, 143, 88, 0.7)' : 'rgba(101, 67, 33, 0.65)'
  ctx.lineWidth = 3 / camera.scale
  ctx.beginPath()
  ctx.moveTo(camera.x, GROUND_Y)
  ctx.lineTo(camera.x + worldWidth, GROUND_Y)
  ctx.stroke()

  // 地面以下土壤填充
  const fillTop = Math.max(GROUND_Y, camera.y)
  ctx.fillStyle = isDark ? 'rgba(196, 143, 88, 0.12)' : 'rgba(101, 67, 33, 0.08)'
  ctx.fillRect(camera.x, fillTop, worldWidth, camera.y + worldHeight - fillTop)

  ctx.fillStyle = isDark ? 'rgba(210, 160, 110, 0.9)' : 'rgba(101, 67, 33, 0.75)'
  ctx.font = `${12 / camera.scale}px sans-serif`
  ctx.textAlign = 'left'
  ctx.fillText('地面', camera.x + 8 / camera.scale, GROUND_Y - 6 / camera.scale)
  ctx.restore()
}

/** 世界原点微弱十字标记（替换原视口中心线，作为无限画布的锚点） */
function drawOrigin(ctx, camera, isDark) {
  const size = 6 / camera.scale
  ctx.save()
  ctx.strokeStyle = isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.15)'
  ctx.lineWidth = 1 / camera.scale
  ctx.beginPath()
  ctx.moveTo(-size, 0)
  ctx.lineTo(size, 0)
  ctx.moveTo(0, -size)
  ctx.lineTo(0, size)
  ctx.stroke()
  ctx.restore()
}

/** 调色板拖拽幽灵（paletteDrag 为屏幕坐标，转世界绘制） */
function drawPaletteGhost(ctx, canvas, scene) {
  if (!scene.paletteDrag.active) return

  const rect = canvas.getBoundingClientRect()
  const sx = scene.paletteDrag.x - rect.left
  const sy = scene.paletteDrag.y - rect.top
  if (sx < 0 || sx > scene.width || sy < 0 || sy > scene.height) return

  const { x, y } = screenToWorld(sx, sy, scene.camera)
  getModel(scene.paletteDrag.modelId)?.drawGhost?.(ctx, x, y, 0.5)
}

/** 放置预览（previewMouse 为屏幕坐标，转世界绘制） */
function drawPlacementPreview(ctx, scene) {
  if (!scene.paletteActiveModel || scene.paletteDrag.active) return

  const { x: sx, y: sy } = scene.previewMouse
  if (sx < 0 || sx > scene.width || sy < 0 || sy > scene.height) return

  const model = getModel(scene.paletteActiveModel)
  if (!model?.drawGhost) return

  const { x, y } = screenToWorld(sx, sy, scene.camera)
  model.drawGhost(ctx, x, y, 0.35)
  ctx.save()
  ctx.fillStyle = scene.theme === 'dark' ? 'rgba(255,255,255,0.75)' : 'rgba(0,0,0,0.4)'
  ctx.font = `${11 / scene.camera.scale}px sans-serif`
  ctx.textAlign = 'center'
  ctx.fillText('点击放置', x, y - 30 / scene.camera.scale)
  ctx.restore()
}

/** 选中标签：屏幕空间绘制（固定字号，避免随缩放不可读） */
function drawSelectedLabel(ctx, scene) {
  if (!scene.selectedObject) return

  const obj = scene.selectedObject
  const { camera } = scene
  const sx = (obj.pos.x - camera.x) * camera.scale
  const sy = (obj.pos.y - camera.y) * camera.scale

  ctx.fillStyle = scene.theme === 'dark' ? '#e0e0e0' : '#2c3e50'
  ctx.font = '12px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText(`● ${getModelName(scene.selectedTypeId)}`, sx, sy - 30)
}

/**
 * 无限画布渲染：相机变换（世界 → 屏幕）后绘制网格/地面/物体，
 * 选中标签在 restore 后以屏幕空间绘制。
 * scene.camera = { x, y, scale }（视口左上角世界坐标 + 缩放）
 */
export function drawSandbox(ctx, canvas, scene) {
  const { camera } = scene
  const isDark = scene.theme === 'dark'
  ctx.clearRect(0, 0, scene.width, scene.height)

  ctx.save()
  ctx.translate(-camera.x * camera.scale, -camera.y * camera.scale)
  ctx.scale(camera.scale, camera.scale)

  if (scene.showGrid) drawGrid(ctx, scene)
  drawGround(ctx, scene)
  drawOrigin(ctx, camera, isDark)

  for (const obj of scene.objects) {
    if (scene.selectedObject && getRawObject(obj) === scene.selectedObject) {
      getModelByObject(obj)?.drawHighlight?.(ctx, obj)
    }
    obj.draw(ctx)
  }

  drawPaletteGhost(ctx, canvas, scene)
  drawPlacementPreview(ctx, scene)
  ctx.restore()

  drawSelectedLabel(ctx, scene)
}
