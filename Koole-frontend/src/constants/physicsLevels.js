import { PHYSICS_MODELS } from "./physicsModels.js"

const modelMap = new Map(PHYSICS_MODELS.map(model => [model.id, model]))

const chapters = [
    { id: "motion-basics", title: "运动的规律", description: "从时间、位移和速度开始，建立描述运动的方法。" },
    { id: "gravity-motion", title: "重力与抛体", description: "让物体在重力作用下运动，观察公式如何落到轨迹上。" },
    { id: "periodic-motion", title: "周期性运动", description: "通过单摆和弹簧，理解重复运动中的周期关系。" },
]

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

export const PHYSICS_LEVELS = [
    {
        id: "uniform-distance",
        chapterId: "motion-basics",
        order: 1,
        title: "跑出指定路程",
        difficulty: 1,
        modelId: "uniform-motion",
        description: "调节速度，让小车在规定时间内走完目标路程。",
        objective: "8 秒内前进 24 米",
        hint: "先想一想：速度、时间和路程之间是什么关系？",
        allowedParams: ["speed", "duration"],
        initialParams: { speed: 4, duration: 8 },
        target: { label: "最终路程", value: 24, unit: "m", tolerance: 0.3 },
        evaluate: (result, context) => nearTarget(result.x, 24, 0.3, {
            success: `小车在 ${context.time.toFixed(2)} 秒内走了 ${result.x.toFixed(2)} 米。`,
            failure: `小车走了 ${result.x.toFixed(2)} 米，再调整速度试试。`,
        }),
        explanation: "匀速直线运动中，路程等于速度乘以时间。时间固定时，速度越大，经过的路程越长。",
    },
    {
        id: "free-fall-time",
        chapterId: "gravity-motion",
        order: 2,
        title: "准确落地",
        difficulty: 1,
        modelId: "free-fall",
        description: "调节初始高度，让小球恰好在目标时间落地。",
        objective: "让小球约 2.00 秒后落地",
        hint: "自由落体时间由高度和重力加速度共同决定。",
        allowedParams: ["height", "gravity"],
        initialParams: { height: 19.6, gravity: 9.8 },
        target: { label: "落地时间", value: 2, unit: "s", tolerance: 0.05 },
        evaluate: (result, context) => nearTarget(context.time, 2, 0.05, {
            success: `小球在 ${context.time.toFixed(2)} 秒时落地，目标达成。`,
            failure: `实际落地时间是 ${context.time.toFixed(2)} 秒，继续调整高度或重力。`,
        }),
        explanation: "自由落体满足 h = 1/2 gt²。高度增加，落地时间会变长；重力加速度增加，落地时间会变短。",
    },
    {
        id: "vertical-height",
        chapterId: "gravity-motion",
        order: 3,
        title: "投到指定高度",
        difficulty: 2,
        modelId: "vertical-throw",
        description: "调节初速度，让小球到达目标最高高度。",
        objective: "让小球最高点达到约 11.5 米",
        hint: "最高点的速度为零，最大高度与初速度的平方有关。",
        allowedParams: ["initialVelocity", "gravity"],
        initialParams: { initialVelocity: 15, gravity: 9.8 },
        target: { label: "最大高度", value: 11.5, unit: "m", tolerance: 0.15 },
        evaluate: (result) => nearTarget(result.maxHeight, 11.5, 0.15, {
            success: `最高点达到 ${result.maxHeight.toFixed(2)} 米。`,
            failure: `最高点是 ${result.maxHeight.toFixed(2)} 米，继续调整初速度。`,
        }),
        explanation: "竖直上抛的最大高度 H = v₀²/(2g)。在重力相同的情况下，初速度越大，最高点越高。",
    },
    {
        id: "projectile-range",
        chapterId: "gravity-motion",
        order: 4,
        title: "越过目标线",
        difficulty: 2,
        modelId: "projectile",
        description: "调整高度和水平速度，让小球落地时到达目标距离。",
        objective: "让小球水平射程达到约 10 米",
        hint: "先用飞行时间，再计算水平方向的位移。",
        allowedParams: ["height", "vx", "gravity"],
        initialParams: { height: 15, vx: 5, gravity: 9.8 },
        target: { label: "水平射程", value: 10, unit: "m", tolerance: 0.2 },
        evaluate: (result) => nearTarget(result.x, 10, 0.2, {
            success: `小球落地位置为 ${result.x.toFixed(2)} 米。`,
            failure: `小球落在 ${result.x.toFixed(2)} 米处，再调整高度或水平速度。`,
        }),
        explanation: "平抛运动的水平位移 x = v₀t，竖直方向的下落时间决定了水平方向能走多远。",
    },
    {
        id: "pendulum-period",
        chapterId: "periodic-motion",
        order: 5,
        title: "调出目标周期",
        difficulty: 2,
        modelId: "pendulum",
        description: "调节摆长，让单摆的周期接近目标值。",
        objective: "让单摆周期约为 4.50 秒",
        hint: "周期只和摆长、重力加速度有关，质量和振幅不是关键。",
        allowedParams: ["length", "gravity"],
        initialParams: { length: 5, gravity: 9.8 },
        target: { label: "摆动周期", value: 4.5, unit: "s", tolerance: 0.06 },
        evaluate: (result) => nearTarget(result.period, 4.5, 0.06, {
            success: `单摆周期为 ${result.period.toFixed(2)} 秒。`,
            failure: `当前周期是 ${result.period.toFixed(2)} 秒，再调整摆长。`,
        }),
        explanation: "单摆周期 T = 2π√(L/g)。摆长越长，摆动越慢，周期越大。",
    },
    {
        id: "spring-period",
        chapterId: "periodic-motion",
        order: 6,
        title: "控制振动节奏",
        difficulty: 3,
        modelId: "spring-mass",
        description: "调节质量和劲度系数，让弹簧振子达到目标周期。",
        objective: "让振动周期约为 2.00 秒",
        hint: "质量越大振动越慢，劲度系数越大振动越快。",
        allowedParams: ["mass", "k", "initX"],
        initialParams: { mass: 1, k: 10, initX: 2 },
        target: { label: "振动周期", value: 2, unit: "s", tolerance: 0.04 },
        evaluate: (result) => nearTarget(result.period, 2, 0.04, {
            success: `振动周期为 ${result.period.toFixed(2)} 秒。`,
            failure: `当前周期是 ${result.period.toFixed(2)} 秒，再调整质量或劲度系数。`,
        }),
        explanation: "弹簧振子周期 T = 2π√(m/k)。质量增大，周期变长；劲度系数增大，周期变短。",
    },
]

export const PHYSICS_LEVEL_CHAPTERS = chapters.map(chapter => ({
    ...chapter,
    levels: PHYSICS_LEVELS.filter(level => level.chapterId === chapter.id).sort((a, b) => a.order - b.order),
}))

export function getPhysicsLevel(levelId) {
    return PHYSICS_LEVELS.find(level => level.id === levelId) || null
}

export function getPhysicsLevelModel(level) {
    return level ? modelMap.get(level.modelId) || null : null
}
