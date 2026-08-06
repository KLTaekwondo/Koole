// ================================================================
// 碰撞检测与力学响应工具函数
// 所有函数为纯数学计算，不依赖 Vue 或 DOM
// ================================================================

const EPSILON = 0.0001

function getInverseMass(obj) {
  if (obj.isStatic || !Number.isFinite(obj.mass) || obj.mass <= 0) return 0
  return 1 / obj.mass
}

/** 法线从 a 指向 b：a 沿 -n、b 沿 +n 分离 */
function separatePair(a, b, nx, ny, penetration) {
  if (!(penetration > 0)) return false
  const invA = getInverseMass(a)
  const invB = getInverseMass(b)
  const invSum = invA + invB
  if (invSum <= 0) return false

  const moveA = penetration * invA / invSum
  const moveB = penetration * invB / invSum
  if (invA > 0) {
    a.pos.x -= nx * moveA
    a.pos.y -= ny * moveA
  }
  if (invB > 0) {
    b.pos.x += nx * moveB
    b.pos.y += ny * moveB
  }
  return true
}

/** 法线从 a 指向 b：仅在二者沿法线接近时施加冲量 */
function applyPairImpulse(a, b, nx, ny) {
  const invA = getInverseMass(a)
  const invB = getInverseMass(b)
  const invSum = invA + invB
  if (invSum <= 0) return

  const relVn = (a.velocity.x - b.velocity.x) * nx + (a.velocity.y - b.velocity.y) * ny
  if (relVn <= 0) return

  const restitution = Math.min(a.restitution, b.restitution)
  const impulse = (1 + restitution) * relVn / invSum
  if (invA > 0) {
    a.velocity.x -= impulse * invA * nx
    a.velocity.y -= impulse * invA * ny
  }
  if (invB > 0) {
    b.velocity.x += impulse * invB * nx
    b.velocity.y += impulse * invB * ny
  }
}

/** 法线从 obstacle 指向 body */
function resolveBodyObstacle(body, obstacle, nx, ny, penetration) {
  const separated = separatePair(obstacle, body, nx, ny, penetration)
  applyPairImpulse(obstacle, body, nx, ny)
  return separated
}

/** 球 vs 球 */
export function collideBallBall(a, b) {
  const dx = b.pos.x - a.pos.x
  const dy = b.pos.y - a.pos.y
  const dist = Math.sqrt(dx * dx + dy * dy)
  const minDist = a.radius + b.radius
  if (dist >= minDist) return false

  const nx = dist > EPSILON ? dx / dist : 1
  const ny = dist > EPSILON ? dy / dist : 0
  const separated = separatePair(a, b, nx, ny, minDist - dist)
  applyPairImpulse(a, b, nx, ny)
  return separated
}

/** 球 vs 方块（支持旋转方块） */
export function collideBallBox(ball, box) {
  const hw = box.width / 2
  const hh = box.height / 2
  const dx = ball.pos.x - box.pos.x
  const dy = ball.pos.y - box.pos.y
  const cos = Math.cos(-(box.angle || 0))
  const sin = Math.sin(-(box.angle || 0))
  const lx = dx * cos - dy * sin
  const ly = dx * sin + dy * cos
  const inside = Math.abs(lx) <= hw && Math.abs(ly) <= hh

  let lnx
  let lny
  let penetration
  if (inside) {
    const distances = [
      { distance: lx + hw, x: -1, y: 0 },
      { distance: hw - lx, x: 1, y: 0 },
      { distance: ly + hh, x: 0, y: -1 },
      { distance: hh - ly, x: 0, y: 1 },
    ]
    const nearest = distances.reduce((best, item) => item.distance < best.distance ? item : best)
    lnx = nearest.x
    lny = nearest.y
    penetration = ball.radius + Math.max(0, nearest.distance)
  } else {
    const clx = Math.max(-hw, Math.min(lx, hw))
    const cly = Math.max(-hh, Math.min(ly, hh))
    const dlx = lx - clx
    const dly = ly - cly
    const dist = Math.sqrt(dlx * dlx + dly * dly)
    if (dist >= ball.radius || dist <= EPSILON) return false
    lnx = dlx / dist
    lny = dly / dist
    penetration = ball.radius - dist
  }

  const worldCos = Math.cos(box.angle || 0)
  const worldSin = Math.sin(box.angle || 0)
  const nx = lnx * worldCos - lny * worldSin
  const ny = lnx * worldSin + lny * worldCos
  return resolveBodyObstacle(ball, box, nx, ny, penetration)
}

/** 方块 vs 方块（未旋转 AABB 快速路径） */
export function collideBoxBox(a, b) {
  const dx = b.pos.x - a.pos.x
  const dy = b.pos.y - a.pos.y
  const overlapX = a.width / 2 + b.width / 2 - Math.abs(dx)
  const overlapY = a.height / 2 + b.height / 2 - Math.abs(dy)
  if (overlapX <= 0 || overlapY <= 0) return false

  const useX = overlapX < overlapY
  const nx = useX ? (dx >= 0 ? 1 : -1) : 0
  const ny = useX ? 0 : (dy >= 0 ? 1 : -1)
  const separated = separatePair(a, b, nx, ny, useX ? overlapX : overlapY)
  applyPairImpulse(a, b, nx, ny)
  return separated
}

export function getCollisionRadius(obj) {
  if (obj.reactRadius) return obj.reactRadius
  const r = obj.radius || 0
  const w = obj.width || r * 2 || 40
  const h = obj.height || r * 2 || 40
  return Math.max(w, h) / 2
}

/** 包围圆近似碰撞（不规则形状兜底） */
export function collideBoundingCircle(a, b) {
  const rA = getCollisionRadius(a)
  const rB = getCollisionRadius(b)
  const dx = b.pos.x - a.pos.x
  const dy = b.pos.y - a.pos.y
  const dist = Math.sqrt(dx * dx + dy * dy)
  const minDist = rA + rB
  if (dist >= minDist) return false

  const nx = dist > EPSILON ? dx / dist : 1
  const ny = dist > EPSILON ? dy / dist : 0
  const separated = separatePair(a, b, nx, ny, minDist - dist)
  applyPairImpulse(a, b, nx, ny)
  return separated
}

function closestOnSegment(px, py, ax, ay, bx, by) {
  const ex = bx - ax
  const ey = by - ay
  const lenSq = ex * ex + ey * ey
  if (lenSq < EPSILON) return { x: ax, y: ay }
  const t = Math.max(0, Math.min(1, ((px - ax) * ex + (py - ay) * ey) / lenSq))
  return { x: ax + t * ex, y: ay + t * ey }
}

function pointInTriangle(x, y, verts) {
  const signs = verts.map((v, i) => {
    const next = verts[(i + 1) % verts.length]
    return (x - v.x) * (next.y - v.y) - (y - v.y) * (next.x - v.x)
  })
  return signs.every(sign => sign >= -EPSILON) || signs.every(sign => sign <= EPSILON)
}

/** 最近边从三角形内部指向外部的单位法向 */
function getTriangleEdgeOutwardNormal(verts, edgeIndex) {
  const a = verts[edgeIndex]
  const b = verts[(edgeIndex + 1) % verts.length]
  const center = getPolyCenter(verts)
  const ex = b.x - a.x
  const ey = b.y - a.y
  const len = Math.sqrt(ex * ex + ey * ey)
  if (len <= EPSILON) return { x: 0, y: -1 }

  let nx = -ey / len
  let ny = ex / len
  const midX = (a.x + b.x) / 2
  const midY = (a.y + b.y) / 2
  if ((center.x - midX) * nx + (center.y - midY) * ny > 0) {
    nx = -nx
    ny = -ny
  }
  return { x: nx, y: ny }
}

/** 球 vs 任意三角形 */
export function collideBallTriangle(ball, tri, verts) {
  const cx = ball.pos.x
  const cy = ball.pos.y
  const inside = pointInTriangle(cx, cy, verts)
  let bestIndex = 0
  let bestPoint = null
  let bestDistSq = Infinity

  for (let i = 0; i < 3; i++) {
    const a = verts[i]
    const b = verts[(i + 1) % 3]
    const point = closestOnSegment(cx, cy, a.x, a.y, b.x, b.y)
    const dx = cx - point.x
    const dy = cy - point.y
    const distSq = dx * dx + dy * dy
    if (distSq < bestDistSq) {
      bestIndex = i
      bestPoint = point
      bestDistSq = distSq
    }
  }

  const dist = Math.sqrt(bestDistSq)
  if (!inside && dist >= ball.radius) return false

  let nx
  let ny
  if (inside) {
    const outward = getTriangleEdgeOutwardNormal(verts, bestIndex)
    nx = outward.x
    ny = outward.y
  } else if (dist > EPSILON) {
    nx = (cx - bestPoint.x) / dist
    ny = (cy - bestPoint.y) / dist
  } else {
    const outward = getTriangleEdgeOutwardNormal(verts, bestIndex)
    nx = outward.x
    ny = outward.y
  }

  const penetration = inside ? ball.radius + dist : ball.radius - dist
  return resolveBodyObstacle(ball, tri, nx, ny, penetration)
}

// ================================================================
// SAT（分离轴定理）工具函数
// ================================================================

function projectPolygon(verts, axis) {
  let min = Infinity
  let max = -Infinity
  for (const vertex of verts) {
    const projection = vertex.x * axis.x + vertex.y * axis.y
    min = Math.min(min, projection)
    max = Math.max(max, projection)
  }
  return { min, max }
}

function getPolyCenter(verts) {
  let x = 0
  let y = 0
  for (const vertex of verts) {
    x += vertex.x
    y += vertex.y
  }
  return { x: x / verts.length, y: y / verts.length }
}

function getPolygonAxes(verts) {
  const axes = []
  for (let i = 0; i < verts.length; i++) {
    const a = verts[i]
    const b = verts[(i + 1) % verts.length]
    const ex = b.x - a.x
    const ey = b.y - a.y
    const len = Math.sqrt(ex * ex + ey * ey)
    if (len <= EPSILON) continue
    axes.push({ x: -ey / len, y: ex / len })
  }
  return axes
}

function findSatCollision(aVerts, bVerts) {
  const axes = [...getPolygonAxes(aVerts), ...getPolygonAxes(bVerts)]
  const aCenter = getPolyCenter(aVerts)
  const bCenter = getPolyCenter(bVerts)
  let minOverlap = Infinity
  let bestAxis = null

  for (const axis of axes) {
    const aProjection = projectPolygon(aVerts, axis)
    const bProjection = projectPolygon(bVerts, axis)
    const overlap = Math.min(aProjection.max, bProjection.max) - Math.max(aProjection.min, bProjection.min)
    if (overlap <= EPSILON) return null
    if (overlap < minOverlap) {
      minOverlap = overlap
      const direction = (bCenter.x - aCenter.x) * axis.x + (bCenter.y - aCenter.y) * axis.y
      bestAxis = direction >= 0 ? axis : { x: -axis.x, y: -axis.y }
    }
  }

  return bestAxis ? { nx: bestAxis.x, ny: bestAxis.y, penetration: minOverlap } : null
}

/** 方块 vs 方块（OBB SAT） */
export function collideObbBox(a, b) {
  const collision = findSatCollision(a.getVertices(), b.getVertices())
  if (!collision) return false
  const separated = separatePair(a, b, collision.nx, collision.ny, collision.penetration)
  applyPairImpulse(a, b, collision.nx, collision.ny)
  return separated
}

/** 方块（支持旋转）vs 三角形 */
export function collideBoxTriangle(box, tri, triVerts) {
  let collision = findSatCollision(box.getVertices(), triVerts)
  if (!collision) return false

  // 仅在方块位于斜面上方时做轻量角度吸附；吸附后必须完整重算 SAT。
  if (!box.isStatic && tri.isStatic && typeof box.angle === 'number' && collision.ny > 0.2) {
    const nextAngle = Math.atan2(-collision.nx, collision.ny)
    if (Math.abs(nextAngle) <= Math.PI / 2) {
      box.angle = nextAngle
      collision = findSatCollision(box.getVertices(), triVerts)
      if (!collision) return false
    }
  }

  const separated = separatePair(box, tri, collision.nx, collision.ny, collision.penetration)
  applyPairImpulse(box, tri, collision.nx, collision.ny)

  if (!box.isStatic) {
    const tx = -collision.ny
    const ty = collision.nx
    const triVx = tri.isStatic ? 0 : tri.velocity.x
    const triVy = tri.isStatic ? 0 : tri.velocity.y
    const relVt = (box.velocity.x - triVx) * tx + (box.velocity.y - triVy) * ty
    box.velocity.x -= relVt * tx * 0.25
    box.velocity.y -= relVt * ty * 0.25
  }
  return separated
}

/** 三角形 vs 三角形 */
export function collideTriTriangle(a, b, aVerts, bVerts) {
  const collision = findSatCollision(aVerts, bVerts)
  if (!collision) return false
  const separated = separatePair(a, b, collision.nx, collision.ny, collision.penetration)
  applyPairImpulse(a, b, collision.nx, collision.ny)
  return separated
}
