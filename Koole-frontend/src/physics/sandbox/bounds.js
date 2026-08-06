import { REST_THRESHOLD } from '../../constants/physics.js'
import { isBallLike, isBox, isPendulum, isSpringMass } from './objectTypes.js'

/**
 * 物体落地的底部半高（世界坐标）。
 * - box / triangle：优先使用真实顶点的最大 Y 投影
 * - ball-like（ball/spring/pendulum）：用 radius
 */
export function getGroundHalfExtent(obj) {
  if (isBallLike(obj)) return obj.radius || obj.reactRadius || 20
  if ((isBox(obj) || typeof obj.getVertices === 'function') && typeof obj.getVertices === 'function') {
    const vertices = obj.getVertices()
    if (vertices.length) return Math.max(...vertices.map(vertex => vertex.y - obj.pos.y))
  }
  return (obj.height || 40) / 2
}

/**
 * 无限画布地面碰撞：仅 y 底部方向，x 方向自由。
 * 命中地面时钳制位置，并按模型类型衰减速度（保持各模型原有反弹差异），
 * 再乘地面环境弹性，低速归零防抖。
 */
export function resolveGroundCollision(obj, groundY, floorRestitution) {
  const halfH = getGroundHalfExtent(obj)
  if (obj.pos.y + halfH < groundY) return

  obj.pos.y = groundY - halfH

  // 各模型反弹衰减：ball/box/triangle 完全反弹，spring 0.4，pendulum 0.2
  const damp = isSpringMass(obj) ? -0.4 : isPendulum(obj) ? -0.2 : -1
  if (obj.velocity.y > 0) {
    obj.velocity.y *= damp * floorRestitution
  }

  // 静止归零，防止贴地一帧内来回弹的抖动
  if (Math.abs(obj.velocity.y) < REST_THRESHOLD) obj.velocity.y = 0
}
