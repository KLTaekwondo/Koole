// ================================================================
// 沙盒物理引擎常量
// ================================================================

/** 重力加速度 (px/s²) */
export const GRAVITY = 980

/** 速度上限 (px/s)，防止高速穿透 */
export const MAX_SPEED = 2000

/** 静止判定阈值 (px/s)，法向速度低于此值时视为静止 */
export const REST_THRESHOLD = 25

/** 默认地面弹性（竖直方向，无限画布的地面线） */
export const DEFAULT_FLOOR_RESTITUTION = 0.0

/** 网格大小 (px，世界坐标) */
export const GRID_SIZE = 40

/** 地面线世界坐标 y（物体落到此处停住/反弹） */
export const GROUND_Y = 600

/** 相机最小缩放（0.2x） */
export const MIN_CAMERA_SCALE = 0.2

/** 相机最大缩放（4x） */
export const MAX_CAMERA_SCALE = 4

/** 网格最小屏幕间距 (px)，缩小时动态增大世界间距 */
export const MIN_GRID_PX = 16
