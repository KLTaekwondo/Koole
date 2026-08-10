// 数学函数画布：采样与等值线抽取（纯逻辑，不依赖 DOM）
// 核心：隐式方程按世界坐标对齐网格采样，平移视图时复用旧网格只补边缘列/行，
// 避免每帧全屏 32k 点重算。
// 采样缓存用 WeakMap 存，避免把数据挂到响应式 fn 上触发无限重绘。

import { pickStepPx, MS_CASES } from "./constants.js"
import { evaluateEquation, evaluateWorld } from "./evaluator.js"
import { screenToWorld } from "./camera.js"

// 显式函数点列缓存 / 隐式函数网格缓存，key 是函数对象本身
const explicitCache = new WeakMap()
const gridCache = new WeakMap()

// 显式/隐式函数的表达式 + 参数版本指纹，用于判断采样缓存是否失效。
// 不含 offset：offset 已折进网格原点（局部坐标对齐），拖动函数时网格相对函数不动，
// 走增量复用而非全量重采样。
function fnKey(fn) {
    return `${fn.expression}|${fn.params ? JSON.stringify(fn.params) : ""}`
}

// ---- 显式函数：沿世界 x 均匀取点 ----

export function sampleExplicit(fn, view, width, height) {
    const [left] = screenToWorld(0, 0, view, width, height)
    const [right] = screenToWorld(width, 0, view, width, height)
    const pad = 2 / view.scale
    const stepWorld = 2 / view.scale // 屏幕约 2px 一个采样点
    // 显式函数 offset 直接进表达式求值，必须参与缓存 key；隐式函数则折进网格原点（见 sampleImplicit）
    const key = `${fnKey(fn)}|${fn.offsetX.toFixed(6)}|${fn.offsetY.toFixed(6)}|${left.toFixed(3)}|${right.toFixed(3)}`
    const cached = explicitCache.get(fn)
    if (cached && cached.key === key) return cached.points

    const points = []
    const startX = left - pad
    const endX = right + pad
    for (let wx = startX; wx <= endX; wx += stepWorld) {
        const wy = evaluateWorld(fn, wx)
        points.push([wx, wy])
    }
    explicitCache.set(fn, { key, points })
    return points
}

export function getExplicitPoints(fn) {
    return (explicitCache.get(fn) || {}).points || []
}

// ---- 隐式方程：世界对齐网格采样，增量复用 ----

/**
 * 采样隐式函数到网格。网格原点按"局部坐标"对齐（relative to fn.offset），
 * 因此拖函数（offset 变化）与平移视图（left/top 变化）统一为"局部原点平移"，
 * 都能走增量复用：旧值按行列偏移搬进新数组，只对新边缘点求值。
 */
export function sampleImplicit(fn, view, width, height, quality = "fine") {
    const stepPx = pickStepPx(view.scale, quality)
    const stepWorld = stepPx / view.scale
    const [left, top] = screenToWorld(0, 0, view, width, height)
    const [right, bottom] = screenToWorld(width, height, view, width, height)
    const originX = Math.floor((left - fn.offsetX) / stepWorld) * stepWorld
    const originY = Math.floor((top - fn.offsetY) / stepWorld) * stepWorld
    const cols = Math.ceil((right - fn.offsetX - originX) / stepWorld) + 1
    const rows = Math.ceil((top - bottom) / stepWorld) + 1
    const key = `${fnKey(fn)}|${stepWorld.toFixed(6)}`

    const old = gridCache.get(fn)
    const oldCols = old ? old.cols : 0
    const oldRows = old ? old.rows : 0
    const oldOriginX = old ? old.originX : 0
    const oldOriginY = old ? old.originY : 0

    const canReuse = old && old.key === key
    const dCol = canReuse ? Math.round((originX - oldOriginX) / stepWorld) : 0
    const dRow = canReuse ? Math.round((originY - oldOriginY) / stepWorld) : 0

    const values = new Float64Array(cols * rows)

    if (canReuse) {
        // 只补边缘：把旧网格对应位置的数值直接搬过来，仅新行列求值。
        // 局部坐标相同的旧点索引：srcRow = i - dRow，srcCol = j + dCol
        for (let i = 0; i < rows; i += 1) {
            const srcRow = i - dRow
            for (let j = 0; j < cols; j += 1) {
                const srcCol = j + dCol
                const isEdge = srcRow < 0 || srcRow >= oldRows || srcCol < 0 || srcCol >= oldCols
                if (isEdge) {
                    const wx = fn.offsetX + originX + j * stepWorld
                    const wy = fn.offsetY + originY - i * stepWorld
                    values[i * cols + j] = evaluateEquation(fn, wx, wy)
                } else {
                    values[i * cols + j] = old.values[srcRow * oldCols + srcCol]
                }
            }
        }
    } else {
        // 全量重采样
        for (let i = 0; i < rows; i += 1) {
            const wy = fn.offsetY + originY - i * stepWorld
            for (let j = 0; j < cols; j += 1) {
                const wx = fn.offsetX + originX + j * stepWorld
                values[i * cols + j] = evaluateEquation(fn, wx, wy)
            }
        }
    }

    const grid = { key, cols, rows, stepWorld, originX, originY, offsetX: fn.offsetX, offsetY: fn.offsetY, values }
    grid.segments = extractSegmentsFromGrid(grid)
    gridCache.set(fn, grid)
    return grid
}

// 从网格抽取等值线线段（世界坐标），返回扁平数组 [x0,y0,x1,y1, ...]。
// 仅采样变化时调用一次，渲染直接读缓存的 segments。
function extractSegmentsFromGrid(grid) {
    const { cols, rows, stepWorld, originX, originY, offsetX, offsetY, values } = grid
    const segments = []
    for (let i = 0; i < rows - 1; i += 1) {
        for (let j = 0; j < cols - 1; j += 1) {
            const index = i * cols + j
            const vA = values[index]            // 左上
            const vB = values[index + 1]        // 右上
            const vC = values[index + cols]     // 左下
            const vD = values[index + cols + 1] // 右下
            if (![vA, vB, vC, vD].every(Number.isFinite)) continue
            const caseIndex = (vA < 0 ? 1 : 0) | (vB < 0 ? 2 : 0) | (vC < 0 ? 4 : 0) | (vD < 0 ? 8 : 0)
            const edges = MS_CASES[caseIndex]
            const wx = offsetX + originX + j * stepWorld
            const wy = offsetY + originY - i * stepWorld
            for (let e = 0; e < edges.length; e += 2) {
                const p0 = edgeIntersection(edges[e], vA, vB, vC, vD, wx, wy, stepWorld)
                const p1 = edgeIntersection(edges[e + 1], vA, vB, vC, vD, wx, wy, stepWorld)
                segments.push(p0[0], p0[1], p1[0], p1[1])
            }
        }
    }
    return segments
}

/** 读取隐式函数当前网格的等值线线段（采样时已生成，直接复用） */
export function getSegments(fn) {
    return (gridCache.get(fn) || {}).segments || []
}

// 网格单元边上等值线与边的交点（线性插值）。边定义（世界坐标，y 向下减小）：
// E0 上边(a-b)、E1 右边(b-d)、E2 下边(c-d)、E3 左边(a-c)
function edgeIntersection(edge, vA, vB, vC, vD, wx, wy, step) {
    const ratio = (v0, v1) => {
        const denominator = v0 - v1
        if (denominator === 0) return 0.5
        return Math.max(0, Math.min(1, v0 / denominator))
    }
    if (edge === 0) return [wx + step * ratio(vA, vB), wy]
    if (edge === 1) return [wx + step, wy - step * ratio(vB, vD)]
    if (edge === 2) return [wx + step * ratio(vC, vD), wy - step]
    return [wx, wy - step * ratio(vA, vC)]
}
