// 数学函数画布：表达式解析、编译缓存与求值（无 DOM 依赖）

import { mathFunctions, RESERVED_NAMES } from "./constants.js"

const expressionCache = new Map()

// 表达式 → 可执行字符串的预处理缓存：正则归一化与幂/函数名替换对同一表达式结果恒定，
// 每次求值重复跑 9 个正则纯属浪费，缓存后只查一次 Map。
const prepareCache = new Map()
function prepareExpression(expression) {
    let prepared = prepareCache.get(expression)
    if (prepared === undefined) {
        const normalized = normalizeExpression(expression)
        prepared = normalized
            .replace(/\^/g, "**")
            .replace(/\b(sin|cos|tan|sqrt|abs|log|ln|exp)\b/g, "mathFunctions.$1")
            .replace(/\bpi\b/g, "Math.PI")
            .replace(/\be\b/g, "Math.E")
        prepareCache.set(expression, prepared)
    }
    return prepared
}

// 把用户书写的表达式归一化：下标、π、隐式乘号等转成 JS 可读形式
export function normalizeExpression(expression) {
    return String(expression || "")
        .replace(/[²]/g, "^2")
        .replace(/[³]/g, "^3")
        .replace(/\b([xy])([23])\b/g, "$1^$2")
        .replace(/π/g, "pi")
        .replace(/\b(\d+(?:\.\d+)?)x\b/g, "$1*x")
        .replace(/\)(?=[a-zA-Z0-9])/g, ")*")
        .replace(/(\d|x|y|pi)\(/g, "$1*(")
}

// 按 = 拆分左右表达式；没有 = 时默认左边是 y（显式函数）
export function splitEquation(expression) {
    const normalized = normalizeExpression(expression).replace(/\s+/g, "")
    const separator = normalized.indexOf("=")
    if (separator < 0) return { left: "y", right: normalized }
    return { left: normalized.slice(0, separator), right: normalized.slice(separator + 1) }
}

// 求一个表达式在当前作用域下的值：编译结果按 "规范化式子 + 变量名" 缓存
export function evaluateExpression(expression, scope) {
    const prepared = prepareExpression(expression)
    try {
        const names = Object.keys(scope)
        const cacheKey = `${prepared}|${names.join(",")}`
        let evaluator = expressionCache.get(cacheKey)
        if (!evaluator) {
            evaluator = Function("mathFunctions", ...names, `return ${prepared}`)
            expressionCache.set(cacheKey, evaluator)
        }
        return evaluator(mathFunctions, ...names.map(name => scope[name]))
    } catch {
        return NaN
    }
}

// 解析函数表达式，编译左右两侧，结果挂到 fn._compiled 复用，避免每次求值都 split
export function compileEquation(fn) {
    if (!fn._compiled || fn._compiled.key !== fn.expression) {
        const equation = splitEquation(fn.expression)
        fn._compiled = { left: equation.left, right: equation.right, key: fn.expression }
    }
    return fn._compiled
}

// 隐式方程：在 (x, y) 处求 f(x,y) = 左 - 右，正负表示在曲线哪一侧
export function evaluateEquation(fn, x, y) {
    const { left, right } = compileEquation(fn)
    const scope = { x: x - fn.offsetX, y: y - fn.offsetY, ...fn.params }
    const leftValue = evaluateExpression(left, scope)
    const rightValue = evaluateExpression(right, scope)
    return Number.isFinite(leftValue) && Number.isFinite(rightValue) ? leftValue - rightValue : NaN
}

// 世界坐标下的函数值：显式直接算 y，隐式对给定 x 沿 y 扫描求根
export function evaluateWorld(fn, worldX) {
    const { left } = compileEquation(fn)
    if (left !== "y") return solveImplicitY(fn, worldX)
    return evaluateExpression(compileEquation(fn).right, { x: worldX - fn.offsetX, ...fn.params }) + fn.offsetY
}

// 隐式方程：固定 x，沿 y 从 -12 到 12 均匀扫描，收集符号变化点（线性插值求根）
export function solveImplicitYs(fn, worldX) {
    const values = []
    let previousY = -12
    let previousValue = evaluateEquation(fn, worldX, previousY)
    for (let index = 1; index <= 144; index += 1) {
        const currentY = -12 + index * (24 / 144)
        const currentValue = evaluateEquation(fn, worldX, currentY)
        if (Number.isFinite(previousValue) && Number.isFinite(currentValue) && previousValue * currentValue <= 0) {
            const ratio = Math.abs(previousValue) / (Math.abs(previousValue) + Math.abs(currentValue) || 1)
            const root = previousY + (currentY - previousY) * ratio
            if (!values.some(value => Math.abs(value - root) < 0.12)) values.push(root)
        }
        previousY = currentY
        previousValue = currentValue
    }
    return values
}

export function solveImplicitY(fn, worldX) {
    return solveImplicitYs(fn, worldX)[0] ?? NaN
}

// 隐式方程：固定 y，沿 x 从 -12 到 12 均匀扫描，收集符号变化点（线性插值求根）。
// 与 solveImplicitYs 对称，用于"给定 y 反查 x 交点"。
export function solveImplicitXs(fn, worldY) {
    const values = []
    let previousX = -12
    let previousValue = evaluateEquation(fn, previousX, worldY)
    for (let index = 1; index <= 144; index += 1) {
        const currentX = -12 + index * (24 / 144)
        const currentValue = evaluateEquation(fn, currentX, worldY)
        if (Number.isFinite(previousValue) && Number.isFinite(currentValue) && previousValue * currentValue <= 0) {
            const ratio = Math.abs(previousValue) / (Math.abs(previousValue) + Math.abs(currentValue) || 1)
            const root = previousX + (currentX - previousX) * ratio
            if (!values.some(value => Math.abs(value - root) < 0.12)) values.push(root)
        }
        previousX = currentX
        previousValue = currentValue
    }
    return values
}

// 给定世界 x，返回该函数对应的所有 y（显式单值、隐式多交点）。
// 用于 LIVE 读数与探针绘制，保证隐式方程的每个交点都能显示。
export function probeValues(fn, worldX) {
    const { left } = compileEquation(fn)
    if (left !== "y") return solveImplicitYs(fn, worldX)
    const y = evaluateWorld(fn, worldX)
    return Number.isFinite(y) ? [y] : []
}

// 给定世界 y，反查该函数对应的所有 x（显式需数值求根，隐式多交点）。
// 与 probeValues 对称，供 LIVE 卡"按 y 查 x"使用。
export function probeXValues(fn, worldY) {
    const { left } = compileEquation(fn)
    if (left !== "y") return solveImplicitXs(fn, worldY)
    // 显式函数 y=f(x) 已知 y 求 x：沿 x 扫描 (f(x) - y) 的符号变化求根
    const f = x => evaluateExpression(compileEquation(fn).right, { x: x - fn.offsetX, ...fn.params }) + fn.offsetY - worldY
    const roots = []
    let previousX = -12
    let previousValue = f(previousX)
    for (let index = 1; index <= 144; index += 1) {
        const currentX = -12 + index * (24 / 144)
        const currentValue = f(currentX)
        if (Number.isFinite(previousValue) && Number.isFinite(currentValue) && previousValue * currentValue <= 0) {
            const ratio = Math.abs(previousValue) / (Math.abs(previousValue) + Math.abs(currentValue) || 1)
            const root = previousX + (currentX - previousX) * ratio
            if (!roots.some(value => Math.abs(value - root) < 0.12)) roots.push(root)
        }
        previousX = currentX
        previousValue = currentValue
    }
    return roots
}

// ---- 动态参数提取 ----

// 从表达式提取可调参数：按出现顺序去重，排除保留名
export function extractParameters(expression) {
    const normalized = normalizeExpression(expression).replace(/\s+/g, "")
    const matches = normalized.match(/[a-zA-Z]+/g) || []
    const result = []
    for (const match of matches) {
        if (!RESERVED_NAMES.has(match) && !result.includes(match)) result.push(match)
    }
    return result
}

// 表达式变化时同步参数表：保留仍存在的旧值，新参数默认 1；同时失效编译缓存
export function updateParamKeys(fn) {
    const keys = extractParameters(fn.expression)
    const params = {}
    for (const key of keys) params[key] = key in fn.params ? fn.params[key] : 1
    fn.params = params
    fn.paramKeys = keys
    fn._compiled = null
}

export function hasParams(fn, keys) {
    return keys.every(key => key in fn.params)
}

// 滑块范围跟随参数当前值扩展
export function paramRange(value) {
    return [Math.min(0, value) - 5, Math.max(0, value) + 5]
}

export function formatValue(value) {
    return Number.isFinite(value) ? Number(value.toFixed(3)).toString() : "未定义"
}
