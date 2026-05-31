// ================================================================
// 沙盒物理引擎常量
// ================================================================

/** 重力加速度 (px/s²) */
export const GRAVITY = 980

/** 速度上限 (px/s)，防止高速穿透 */
export const MAX_SPEED = 2000

/** 静止判定阈值 (px/s)，法向速度低于此值时视为静止 */
export const REST_THRESHOLD = 25

/** 默认墙壁弹性（水平方向） */
export const DEFAULT_WALL_RESTITUTION = 1.0

/** 默认地板弹性（竖直方向） */
export const DEFAULT_FLOOR_RESTITUTION = 0.0

/** 网格大小 (px) */
export const GRID_SIZE = 40
