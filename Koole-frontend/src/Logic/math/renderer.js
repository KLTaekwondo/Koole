// 数学函数画布：纯渲染（读 scene 绘制，不采样不求值）
// 显式函数点列与隐式函数线段由 sampler 维护缓存，这里只读取。
// scene = { theme, view, width, height, dpr, functions, activeId, probeModeX, probeX, probeY }

import { worldToScreen, screenToWorld } from "./camera.js"
import { evaluateWorld, hasParams, compileEquation, probeValues, probeXValues } from "./evaluator.js"
import { getExplicitPoints, getSegments } from "./sampler.js"

export function drawMathScene(ctx, canvas, scene) {
    const { view, width, height, dpr } = scene
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, width, height)

    drawBackground(ctx, scene)
    drawGrid(ctx, scene)
    drawAxes(ctx, scene)
    for (const fn of scene.functions) drawFunction(ctx, fn, scene)
    for (const fn of scene.functions) drawFunctionHandles(ctx, fn, scene)
    drawValueMarker(ctx, scene)
    drawIntersections(ctx, scene)
    drawGeometry(ctx, scene)
}

function drawBackground(ctx, { width, height, theme }) {
    const isDark = theme === "dark"
    const gradient = ctx.createRadialGradient(width * 0.72, height * 0.26, 0, width * 0.72, height * 0.26, Math.max(width, height) * 0.8)
    gradient.addColorStop(0, isDark ? "#1f2f4d" : "#edf4ff")
    gradient.addColorStop(0.45, isDark ? "#121820" : "#f8fbff")
    gradient.addColorStop(1, isDark ? "#0f1319" : "#f5f6f8")
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, width, height)
}

function drawGrid(ctx, { view, width, height, theme }) {
    const [left, top] = screenToWorld(0, 0, view, width, height)
    const [right, bottom] = screenToWorld(width, height, view, width, height)
    const step = niceStep(view.scale)
    const axis = worldToScreen(0, 0, view, width, height)
    ctx.lineWidth = 1
    ctx.strokeStyle = theme === "dark" ? "rgba(150, 174, 214, 0.13)" : "rgba(92, 117, 150, 0.16)"
    ctx.fillStyle = theme === "dark" ? "rgba(185, 199, 225, 0.62)" : "rgba(80, 100, 130, 0.68)"
    ctx.font = "11px var(--mono, monospace)"
    ctx.textAlign = "center"
    for (let x = Math.floor(left / step) * step; x <= right; x += step) {
        const [sx] = worldToScreen(x, 0, view, width, height)
        ctx.beginPath()
        ctx.moveTo(sx, 0)
        ctx.lineTo(sx, height)
        ctx.stroke()
        if (Math.abs(x) > step / 8) ctx.fillText(formatTick(x), sx, clamp(axis[1] + 16, 16, height - 8))
    }
    ctx.textAlign = "right"
    for (let y = Math.floor(bottom / step) * step; y <= top; y += step) {
        const [, sy] = worldToScreen(0, y, view, width, height)
        ctx.beginPath()
        ctx.moveTo(0, sy)
        ctx.lineTo(width, sy)
        ctx.stroke()
        if (Math.abs(y) > step / 8) ctx.fillText(formatTick(y), clamp(axis[0] - 8, 32, width - 8), sy + 4)
    }
}

function drawAxes(ctx, { view, width, height, theme }) {
    const [axisX, axisY] = worldToScreen(0, 0, view, width, height)
    ctx.strokeStyle = theme === "dark" ? "rgba(220, 228, 246, 0.5)" : "rgba(55, 72, 96, 0.56)"
    ctx.lineWidth = 1.8
    ctx.beginPath()
    ctx.moveTo(0, axisY)
    ctx.lineTo(width, axisY)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(axisX, 0)
    ctx.lineTo(axisX, height)
    ctx.stroke()
    ctx.fillStyle = theme === "dark" ? "rgba(220, 228, 246, 0.78)" : "rgba(55, 72, 96, 0.78)"
    ctx.font = "700 11px var(--mono, monospace)"
    ctx.fillText("x", width - 18, axisY - 10)
    ctx.fillText("y", axisX + 12, 18)
}

function drawFunction(ctx, fn, { view, width, height, activeId }) {
    ctx.save()
    ctx.strokeStyle = fn.color
    ctx.lineWidth = activeId === fn.id ? 4 : 2.4
    ctx.shadowColor = fn.color
    ctx.shadowBlur = activeId === fn.id ? 16 : 6
    ctx.lineJoin = "round"
    const { left } = compileEquation(fn)
    if (left !== "y") {
        drawImplicitFunction(ctx, fn, { view, width, height, activeId })
        ctx.restore()
        return
    }
    const points = getExplicitPoints(fn)
    ctx.beginPath()
    let started = false
    for (const [worldX, worldY] of points) {
        if (!Number.isFinite(worldY) || Math.abs(worldY) > 10000) {
            started = false
            continue
        }
        const [sx, sy] = worldToScreen(worldX, worldY, view, width, height)
        if (!started) {
            ctx.moveTo(sx, sy)
            started = true
        } else {
            ctx.lineTo(sx, sy)
        }
    }
    ctx.stroke()
    ctx.restore()
}

function drawImplicitFunction(ctx, fn, { view, width, height, activeId }) {
    const segments = getSegments(fn)
    ctx.beginPath()
    ctx.lineWidth = fn.id === activeId ? 2.6 : 2
    ctx.shadowBlur = 0
    for (let i = 0; i < segments.length; i += 4) {
        const [x0, y0] = worldToScreen(segments[i], segments[i + 1], view, width, height)
        const [x1, y1] = worldToScreen(segments[i + 2], segments[i + 3], view, width, height)
        ctx.moveTo(x0, y0)
        ctx.lineTo(x1, y1)
    }
    ctx.stroke()
}

export function getObjectPoint(fn) {
    if (fn.kind === "parabola" && hasParams(fn, ["a", "b", "c"])) return { x: fn.offsetX + Number(fn.params.b || 0), y: fn.offsetY + Number(fn.params.c || 0) }
    if (fn.kind === "sine" && hasParams(fn, ["a", "b", "c"])) return { x: fn.offsetX, y: fn.offsetY + Number(fn.params.c || 0) }
    return { x: fn.offsetX, y: fn.offsetY }
}

// 每个函数的中心拖动锚点（圆的圆心、抛物线的顶点位置）。选中放大、未选中淡化。
function drawFunctionHandles(ctx, fn, { view, width, height, activeId, theme }) {
    const selected = activeId === fn.id
    const center = getObjectPoint(fn)
    drawHandle(ctx, center.x, center.y, selected ? 9 : 5.5, selected ? 1 : 0.45, fn.color, { view, width, height, theme })
}

function drawHandle(ctx, x, y, radius, alpha, color, { view, width, height, theme }) {
    const [sx, sy] = worldToScreen(x, y, view, width, height)
    ctx.save()
    ctx.globalAlpha = alpha
    ctx.fillStyle = color
    ctx.strokeStyle = theme === "dark" ? "#151b24" : "#ffffff"
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.arc(sx, sy, radius, 0, Math.PI * 2)
    ctx.fill()
    ctx.stroke()
    ctx.restore()
}

// ---- 刻度工具 ----

export function niceStep(scale) {
    const target = 90 / scale
    const power = 10 ** Math.floor(Math.log10(target))
    const normalized = target / power
    return (normalized < 2 ? 1 : normalized < 5 ? 2 : 5) * power
}

// 吸附粒度：比网格刻度更细（目标屏幕约 15px 对应一个吸附步），
// 放大后（scale 大）吸附步更小，能精细对准切点等位置。
export function snapStep(scale) {
    const target = 15 / scale
    const power = 10 ** Math.floor(Math.log10(target))
    const normalized = target / power
    return (normalized < 2 ? 1 : normalized < 5 ? 2 : 5) * power
}

function formatTick(value) {
    return Number(value.toFixed(4)).toString()
}

function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value))
}

// 输入数值的交叉点标注：x→y 模式画竖虚线 + y 交点圆点；y→x 模式画横虚线 + x 交点圆点。
// 让用户看到"查的这个值对应曲线上的哪些点"。
function drawValueMarker(ctx, scene) {
    const { view, width, height, theme, functions, activeId, probeModeX, probeX, probeY } = scene
    const active = functions.find(fn => fn.id === activeId)
    if (!active) return

    const isX = probeModeX !== false
    const fixed = isX ? probeX : probeY
    if (!Number.isFinite(fixed)) return

    const values = isX ? probeValues(active, fixed) : probeXValues(active, fixed)
    if (!values.length) return

    const color = active.color
    const [lineSX] = isX ? worldToScreen(fixed, 0, view, width, height) : [null]
    const [, lineSY] = isX ? [null] : worldToScreen(0, fixed, view, width, height)

    ctx.save()
    ctx.strokeStyle = `${color}88`
    ctx.lineWidth = 1.2
    ctx.setLineDash([5, 6])
    ctx.beginPath()
    if (isX) {
        ctx.moveTo(lineSX, 0)
        ctx.lineTo(lineSX, height)
    } else {
        ctx.moveTo(0, lineSY)
        ctx.lineTo(width, lineSY)
    }
    ctx.stroke()
    ctx.setLineDash([])

    for (const value of values) {
        const [px, py] = isX ? worldToScreen(fixed, value, view, width, height) : worldToScreen(value, fixed, view, width, height)
        ctx.fillStyle = color
        ctx.strokeStyle = theme === "dark" ? "#151b24" : "#ffffff"
        ctx.lineWidth = 2.5
        ctx.beginPath()
        ctx.arc(px, py, 6, 0, Math.PI * 2)
        ctx.fill()
        ctx.stroke()
    }
    ctx.restore()
}

// 函数交叉交点标注：金色圆点，悬停交点显示坐标气泡。
const INTERSECT_COLOR = "#f6c94a"
const HOVER_RADIUS = 10

function drawIntersections(ctx, scene) {
    const { view, width, height, theme, intersections, hoverScreen } = scene
    if (!intersections || !intersections.length) return

    ctx.save()
    let hovered = null
    let hoveredScreen = null
    let hoveredDist = Infinity
    for (const point of intersections) {
        const [sx, sy] = worldToScreen(point.x, point.y, view, width, height)
        if (hoverScreen) {
            const d = Math.hypot(sx - hoverScreen[0], sy - hoverScreen[1])
            if (d < HOVER_RADIUS && d < hoveredDist) {
                hovered = point
                hoveredScreen = [sx, sy]
                hoveredDist = d
            }
        }
        ctx.fillStyle = INTERSECT_COLOR
        ctx.strokeStyle = theme === "dark" ? "#151b24" : "#ffffff"
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.arc(sx, sy, 5, 0, Math.PI * 2)
        ctx.fill()
        ctx.stroke()
    }

    if (hovered && hoveredScreen) {
        const [bx, by] = hoveredScreen
        const label = `(${formatTick(hovered.x)}, ${formatTick(hovered.y)})`
        ctx.font = "700 12px var(--mono, monospace)"
        const tw = ctx.measureText(label).width
        const bw = tw + 12
        const bh = 24
        let px = bx - bw / 2
        let py = by - bh - 12
        px = clamp(px, 4, width - bw - 4)
        py = clamp(py, 4, height - bh - 4)
        ctx.fillStyle = theme === "dark" ? "rgba(21, 27, 36, 0.92)" : "rgba(255, 255, 255, 0.94)"
        ctx.strokeStyle = INTERSECT_COLOR
        ctx.lineWidth = 1.2
        ctx.beginPath()
        ctx.roundRect(px, py, bw, bh, 6)
        ctx.fill()
        ctx.stroke()
        ctx.fillStyle = theme === "dark" ? "#f6f8fc" : "#16202f"
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"
        ctx.fillText(label, px + bw / 2, py + bh / 2)
    }
    ctx.restore()
}

// 几何工具渲染：用户放的点 + 连线，青色系；连线起点高亮。
const GEO_COLOR = "#4cc9f0"

function drawGeometry(ctx, scene) {
    const { view, width, height, theme, geoPoints, geoSegments, lineStartId } = scene
    if ((!geoPoints || !geoPoints.length) && (!geoSegments || !geoSegments.length)) return

    const pointById = {}
    for (const point of geoPoints || []) pointById[point.id] = point

    ctx.save()
    // 线段
    if (geoSegments && geoSegments.length) {
        ctx.strokeStyle = GEO_COLOR
        ctx.lineWidth = 2
        ctx.lineJoin = "round"
        ctx.lineCap = "round"
        ctx.beginPath()
        for (const segment of geoSegments) {
            const a = pointById[segment.from]
            const b = pointById[segment.to]
            if (!a || !b) continue
            const [ax, ay] = worldToScreen(a.x, a.y, view, width, height)
            const [bx, by] = worldToScreen(b.x, b.y, view, width, height)
            ctx.moveTo(ax, ay)
            ctx.lineTo(bx, by)
        }
        ctx.stroke()
    }

    // 点
    for (const point of geoPoints || []) {
        const isStart = point.id === lineStartId
        const [sx, sy] = worldToScreen(point.x, point.y, view, width, height)
        ctx.fillStyle = GEO_COLOR
        ctx.strokeStyle = theme === "dark" ? "#151b24" : "#ffffff"
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.arc(sx, sy, isStart ? 7 : 5, 0, Math.PI * 2)
        ctx.fill()
        ctx.stroke()
        // 点标签（右上角小字）
        if (point.label) {
            ctx.fillStyle = theme === "dark" ? "#9be3ff" : "#0a7ea8"
            ctx.font = "700 13px var(--mono, monospace)"
            ctx.textAlign = "left"
            ctx.textBaseline = "bottom"
            ctx.fillText(point.label, sx + 8, sy - 8)
        }
        if (isStart) {
            // 连线起点：外圈空心强调
            ctx.globalAlpha = 0.5
            ctx.strokeStyle = GEO_COLOR
            ctx.lineWidth = 2
            ctx.beginPath()
            ctx.arc(sx, sy, 11, 0, Math.PI * 2)
            ctx.stroke()
            ctx.globalAlpha = 1
        }
    }
    ctx.restore()
}
