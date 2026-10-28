// 数学关卡数据：函数调参达标玩法
// 每关一条函数曲线，拖动参数滑块让图像满足目标，点"检查"判定星级并解锁下一关。

// 一维达标判定：误差在容差内即成功，按误差反比给 1~3 星
function nearTarget(actual, target, tolerance, message) {
    const difference = Math.abs(actual - target)
    const success = difference <= tolerance
    const ratio = Math.max(0, 1 - difference / Math.max(tolerance * 3, 0.0001))
    return {
        success,
        score: success ? Math.max(1, Math.min(3, Math.ceil(ratio * 3))) : 0,
        actual,
        target,
        difference,
        message: success ? message.success : message.failure,
    }
}

const chapters = [
    { id: "quadratic", title: "二次函数", description: "从顶点、开口到过定点，理解二次函数三个参数各管什么。" },
    { id: "periodic", title: "正弦与指数", description: "用振幅、相位和增长速度，把波形和指数曲线调到想要的位置。" },
]

export const MATH_LEVELS = [
    {
        id: "parabola-vertex",
        chapterId: "quadratic",
        order: 1,
        title: "按下顶点",
        difficulty: 1,
        expression: "(x - h)^2 + k",
        description: "调节 h、k，把抛物线顶点移到指定位置。",
        objective: "让抛物线的顶点落在 (0, -3)",
        hint: "顶点 (h, k) 就是抛物线的尖。先把 h 对准 0，再把 k 对准 -3。",
        view: { x: 0, y: -1, scale: 46 },
        params: [
            { key: "h", label: "水平平移 h", min: -4, max: 4, step: 0.1, value: 2 },
            { key: "k", label: "竖直平移 k", min: -6, max: 2, step: 0.1, value: 1 },
        ],
        target: { label: "顶点", value: "(0, -3)", unit: "", tolerance: 0.15 },
        targetMark: { type: "point", x: 0, y: -3 },
        evaluate: (params) => {
            const h = params.h
            const k = params.k
            // 顶点 (h, k)，x 与 y 两个方向都要对准
            const difference = Math.max(Math.abs(h - 0), Math.abs(k - (-3)))
            const success = difference <= 0.15
            const ratio = Math.max(0, 1 - difference / (0.15 * 3))
            return {
                success,
                score: success ? Math.max(1, Math.min(3, Math.ceil(ratio * 3))) : 0,
                actual: `(${h.toFixed(1)}, ${k.toFixed(1)})`,
                target: "(0, -3)",
                difference,
                message: success
                    ? `顶点落在 (${h.toFixed(1)}, ${k.toFixed(1)})，正好压在目标点上。`
                    : `顶点目前在 (${h.toFixed(1)}, ${k.toFixed(1)})，离 (0, -3) 还有距离，继续调 h 和 k。`,
            }
        },
        explanation: "二次函数 y = (x - h)² + k 的顶点在 (h, k)：h 控制左右平移，k 控制上下平移，抛物线本身的形状不变。",
    },
    {
        id: "parabola-height",
        chapterId: "quadratic",
        order: 2,
        title: "定个高度",
        difficulty: 1,
        expression: "a * (x - 1)^2 + k",
        description: "同时调开口和顶点高度，让曲线在 x=2 处到达目标值。",
        objective: "让曲线在 x = 2 处的高度达到 5",
        hint: "在 x=2 处：y = a·(2-1)² + k = a + k。想让它等于 5，a + k 就得是 5。",
        view: { x: 1.5, y: 2, scale: 44 },
        params: [
            { key: "a", label: "开口 a", min: 0.1, max: 8, step: 0.1, value: 1 },
            { key: "k", label: "顶点高度 k", min: -4, max: 6, step: 0.1, value: 0 },
        ],
        target: { label: "x=2 处高度", value: 5, unit: "", tolerance: 0.15 },
        targetMark: { type: "point", x: 2, y: 5 },
        evaluate: (params) => nearTarget(params.a + params.k, 5, 0.15, {
            success: `x=2 处的高度是 ${(params.a + params.k).toFixed(2)}，目标达成。`,
            failure: `x=2 处目前是 ${(params.a + params.k).toFixed(2)}，再调 a 或 k 让总和逼近 5。`,
        }),
        explanation: "顶点式 y = a(x - 1)² + k 里，a 决定开口：a 越大开口越瘦、两侧升得越陡，k 是顶点高度。在 x=2 处恰好是 y = a + k。",
    },
    {
        id: "parabola-through",
        chapterId: "quadratic",
        order: 3,
        title: "穿过这个点",
        difficulty: 2,
        expression: "a * (x - b)^2 + c",
        description: "三个参数联动，让抛物线恰好穿过一个定点。",
        objective: "让抛物线恰好穿过点 (3, 4)",
        hint: "把顶点 b 先挪近 x=3，再调 a 和 c，让曲线在 x=3 处的高度正好是 4。",
        view: { x: 2, y: 1.5, scale: 42 },
        params: [
            { key: "a", label: "开口 a", min: 0.1, max: 4, step: 0.1, value: 0.5 },
            { key: "b", label: "顶点 x 坐标 b", min: -4, max: 4, step: 0.1, value: 0 },
            { key: "c", label: "顶点 y 坐标 c", min: -5, max: 5, step: 0.1, value: 0 },
        ],
        target: { label: "x=3 处高度", value: 4, unit: "", tolerance: 0.2 },
        targetMark: { type: "point", x: 3, y: 4 },
        evaluate: (params) => {
            const y = params.a * (3 - params.b) ** 2 + params.c
            return nearTarget(y, 4, 0.2, {
                success: `曲线在 x=3 处的高度是 ${y.toFixed(2)}，正好穿过 (3, 4)。`,
                failure: `x=3 处目前是 ${y.toFixed(2)}，继续调整三个参数。`,
            })
        },
        explanation: "抛物线过定点，就是让它在给定 x 处取到目标 y。a 管开口、b 管左右、c 管上下，三个参数互相牵制，通常先把顶点对准目标附近再微调。",
    },
    {
        id: "sine-peak",
        chapterId: "periodic",
        order: 4,
        title: "浪尖够高",
        difficulty: 2,
        expression: "a * sin(x) + c",
        description: "调振幅和竖直偏移，把正弦波的最高点抬到目标值。",
        objective: "让正弦波的最高点达到 4",
        hint: "最高点 = a + c。先把 a 调到 3 左右，再微调 c，让总和等于 4。",
        view: { x: 0, y: 1.2, scale: 48 },
        params: [
            { key: "a", label: "振幅 a", min: 0.1, max: 6, step: 0.1, value: 1 },
            { key: "c", label: "竖直偏移 c", min: -3, max: 5, step: 0.1, value: 0 },
        ],
        target: { label: "最高点", value: 4, unit: "", tolerance: 0.15 },
        targetMark: { type: "line", y: 4 },
        evaluate: (params) => nearTarget(params.a + params.c, 4, 0.15, {
            success: `最高点是 ${(params.a + params.c).toFixed(2)}，浪尖顶到了目标线。`,
            failure: `最高点目前是 ${(params.a + params.c).toFixed(2)}，再调 a 或 c。`,
        }),
        explanation: "正弦函数 a·sin(x) + c 的最高点等于 a + c：a 决定波有多高（振幅），c 把整条波整体抬高或压低，波形周期不变。",
    },
    {
        id: "sine-phase",
        chapterId: "periodic",
        order: 5,
        title: "登上波峰",
        difficulty: 3,
        expression: "a * sin(x + b)",
        description: "调振幅和相位，让曲线在指定位置到达目标值。",
        objective: "让曲线在 x = π/4 处的高度达到 3",
        hint: "在 x=π/4（约 0.79）处取值。先调 a 抬高，再用 b 左右平移，让波峰对准 π/4。",
        view: { x: 1, y: 1.5, scale: 48 },
        params: [
            { key: "a", label: "振幅 a", min: 0.1, max: 6, step: 0.1, value: 1 },
            { key: "b", label: "相位 b（弧度）", min: -3.14, max: 3.14, step: 0.1, value: 0 },
        ],
        target: { label: "x=π/4 处高度", value: 3, unit: "", tolerance: 0.15 },
        targetMark: { type: "point", x: Math.PI / 4, y: 3 },
        evaluate: (params) => {
            const y = params.a * Math.sin(Math.PI / 4 + params.b)
            return nearTarget(y, 3, 0.15, {
                success: `x=π/4 处的高度是 ${y.toFixed(2)}，正好在目标上。`,
                failure: `x=π/4 处目前是 ${y.toFixed(2)}，继续调 a 或 b。`,
            })
        },
        explanation: "y = a·sin(x + b) 里，b 让整条波水平平移，叫相位。改变 b，波峰跟着左右移动；配合振幅 a，就能让曲线在指定 x 处取到想要的高度。",
    },
    {
        id: "exp-surge",
        chapterId: "periodic",
        order: 6,
        title: "指数蹿高",
        difficulty: 3,
        expression: "a * exp(b * x)",
        description: "调起始值和增长速度，让指数曲线在指定位置蹿到目标值。",
        objective: "让曲线在 x = 2 处的高度达到 8",
        hint: "x=2 处 y = a·e^(2b)。b 从 0.5 起步，e 的 1 次方约 2.72，再配 a 让乘积到 8。",
        view: { x: 1, y: 3, scale: 36 },
        params: [
            { key: "a", label: "起始值 a", min: 0.1, max: 6, step: 0.1, value: 1 },
            { key: "b", label: "增长速度 b", min: 0.1, max: 1.5, step: 0.05, value: 0.5 },
        ],
        target: { label: "x=2 处高度", value: 8, unit: "", tolerance: 0.25 },
        targetMark: { type: "point", x: 2, y: 8 },
        evaluate: (params) => {
            const y = params.a * Math.exp(params.b * 2)
            return nearTarget(y, 8, 0.25, {
                success: `x=2 处的高度是 ${y.toFixed(2)}，指数曲线蹿到了目标点。`,
                failure: `x=2 处目前是 ${y.toFixed(2)}，继续调 a 或 b。`,
            })
        },
        explanation: "指数函数 y = a·e^(bx) 中，a 是 x=0 时的起始值，b 是增长速度：b 越大，同样的 x 对应的高度涨得越快，曲线越陡。",
    },
]

export const MATH_LEVEL_CHAPTERS = chapters.map(chapter => ({
    ...chapter,
    levels: MATH_LEVELS.filter(level => level.chapterId === chapter.id).sort((a, b) => a.order - b.order),
}))

export function getMathLevel(levelId) {
    return MATH_LEVELS.find(level => level.id === levelId) || null
}
