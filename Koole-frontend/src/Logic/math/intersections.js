// 数学函数画布：函数交叉求交（纯逻辑，无 DOM 依赖）
// 只支持 显式×显式 与 隐式×显式；隐式×隐式使用价值低，明确不做。

import { screenToWorld } from "./camera.js"
import { compileEquation, evaluateWorld, evaluateEquation } from "./evaluator.js"

/**
 * 求两条函数在可视范围内的交点。
 * 返回世界坐标交点数组 [{x, y}, ...]。
 */
export function findIntersections(fnA, fnB, view, width, height) {
    const aImplicit = compileEquation(fnA).left !== "y"
    const bImplicit = compileEquation(fnB).left !== "y"
    if (aImplicit && bImplicit) return []
    if (aImplicit) return implicitVsExplicit(fnA, fnB, view, width, height)
    if (bImplicit) return implicitVsExplicit(fnB, fnA, view, width, height)
    return explicitVsExplicit(fnA, fnB, view, width, height)
}

// 显式 × 显式：沿 x 扫描两函数差值，符号变化处线性插值求根
function explicitVsExplicit(fnA, fnB, view, width, height) {
    const [left] = screenToWorld(0, 0, view, width, height)
    const [right] = screenToWorld(width, 0, view, width, height)
    const steps = 300
    const results = []
    let prevX = left
    let prevDiff = evaluateWorld(fnA, prevX) - evaluateWorld(fnB, prevX)
    for (let index = 1; index <= steps; index += 1) {
        const x = left + (right - left) * (index / steps)
        const diff = evaluateWorld(fnA, x) - evaluateWorld(fnB, x)
        if (Number.isFinite(prevDiff) && Number.isFinite(diff) && prevDiff * diff <= 0) {
            const ratio = Math.abs(prevDiff) / (Math.abs(prevDiff) + Math.abs(diff) || 1)
            const rootX = prevX + (x - prevX) * ratio
            const rootY = evaluateWorld(fnA, rootX)
            results.push({ x: rootX, y: rootY })
        }
        prevX = x
        prevDiff = diff
    }
    return dedupe(results)
}

// 隐式 × 显式：把显式代入隐式方程 h(x) = f_隐式(x, y_显式(x))，
// 沿 x 找 h 的符号变化点并插值求根——与显式×显式同款稳健算法，
// 交点不依赖采样格点恰好命中，平移视图不丢点。
function implicitVsExplicit(implicitFn, explicitFn, view, width, height) {
    const [left] = screenToWorld(0, 0, view, width, height)
    const [right] = screenToWorld(width, 0, view, width, height)
    const steps = 300
    const results = []
    let prevX = left
    let prevH = implicitMinusExplicit(implicitFn, explicitFn, prevX)
    for (let index = 1; index <= steps; index += 1) {
        const x = left + (right - left) * (index / steps)
        const h = implicitMinusExplicit(implicitFn, explicitFn, x)
        if (Number.isFinite(prevH) && Number.isFinite(h) && prevH * h <= 0) {
            const ratio = Math.abs(prevH) / (Math.abs(prevH) + Math.abs(h) || 1)
            const rootX = prevX + (x - prevX) * ratio
            const rootY = evaluateWorld(explicitFn, rootX)
            results.push({ x: rootX, y: rootY })
        }
        prevX = x
        prevH = h
    }
    return dedupe(results)
}

// 显式函数值代入隐式方程后的剩余量：交点为 0，两侧异号
function implicitMinusExplicit(implicitFn, explicitFn, x) {
    const explicitY = evaluateWorld(explicitFn, x)
    if (!Number.isFinite(explicitY)) return NaN
    return evaluateEquation(implicitFn, x, explicitY)
}

// 按间距去重：相邻交点小于 0.3 世界单位时合并
function dedupe(points) {
    const results = []
    for (const point of points) {
        const duplicated = results.some(existing => Math.hypot(existing.x - point.x, existing.y - point.y) < 0.3)
        if (!duplicated) results.push(point)
    }
    return results
}
