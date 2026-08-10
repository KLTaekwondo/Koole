// 数学函数画布：常量与步长策略

// 表达式中的字母：这些是变量 / 常数 / 函数名，不作为可调参数
export const RESERVED_NAMES = new Set(["x", "y", "pi", "e", "sin", "cos", "tan", "sqrt", "abs", "log", "ln", "exp"])

// 表达式求值白名单：只允许这些数学函数进入编译后的表达式
export const mathFunctions = {
    sin: Math.sin,
    cos: Math.cos,
    tan: Math.tan,
    sqrt: Math.sqrt,
    abs: Math.abs,
    log: Math.log10,
    ln: Math.log,
    exp: Math.exp,
}

// 隐式方程等值线：marching squares 的 16 种 case 索引
// （bit0=a 左上, bit1=b 右上, bit2=c 左下, bit3=d 右下），
// 值是需要连接的边编号、两两一组：E0 上边、E1 右边、E2 下边、E3 左边
export const MS_CASES = [
    [], [3, 0], [0, 1], [3, 1], [3, 2], [0, 2], [0, 2], [1, 2],
    [1, 2], [0, 2], [0, 2], [3, 2], [1, 3], [0, 1], [0, 3], [],
]

// 采样步长（屏幕像素）：
// 精细模式约 5px，随缩放微调；草稿模式放大一倍，交互拖动时用。
// 拖动函数走增量复用（offset 折进网格原点），不再全量重采样，故可保持较细。
export function pickStepPx(scale, quality = "fine") {
    const base = 5 + (58 - scale) / 100
    if (quality === "draft") return Math.max(10, Math.min(32, base * 2))
    return Math.max(5, Math.min(10, base))
}
