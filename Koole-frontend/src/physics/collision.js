// ================================================================
// 碰撞检测与力学响应工具函数
// 所有函数为纯数学计算，不依赖 Vue 或 DOM
// ================================================================

/**
 * 球 vs 球
 */
export function collideBallBall(a, b) {
  const dx = b.pos.x - a.pos.x
  const dy = b.pos.y - a.pos.y
  const dist = Math.sqrt(dx * dx + dy * dy)
  const minDist = a.radius + b.radius
  if (dist >= minDist || dist < 0.001) return

  const nx = dx / dist
  const ny = dy / dist
  const overlap = minDist - dist
  const totalM = (a.isStatic ? 0 : a.mass) + (b.isStatic ? 0 : b.mass)
  if (totalM === 0) return

  // 分离
  if (!a.isStatic) {
    a.pos.x -= nx * overlap * (b.isStatic ? 1 : b.mass / totalM)
    a.pos.y -= ny * overlap * (b.isStatic ? 1 : b.mass / totalM)
  }
  if (!b.isStatic) {
    b.pos.x += nx * overlap * (a.isStatic ? 1 : a.mass / totalM)
    b.pos.y += ny * overlap * (a.isStatic ? 1 : a.mass / totalM)
  }

  // 冲量
  const dvx = a.velocity.x - b.velocity.x
  const dvy = a.velocity.y - b.velocity.y
  const relVn = dvx * nx + dvy * ny
  if (relVn > 0) return

  const restitution = Math.min(a.restitution, b.restitution)
  const impulse = -(1 + restitution) * relVn / totalM

  if (!a.isStatic) {
    a.velocity.x += impulse * (b.isStatic ? a.mass : b.mass) * nx
    a.velocity.y += impulse * (b.isStatic ? a.mass : b.mass) * ny
  }
  if (!b.isStatic) {
    b.velocity.x -= impulse * (a.isStatic ? b.mass : a.mass) * nx
    b.velocity.y -= impulse * (a.isStatic ? b.mass : a.mass) * ny
  }
}

/**
 * 球 vs 方块（支持旋转方块）
 */
export function collideBallBox(ball, box) {
  const hw = box.width / 2, hh = box.height / 2

  // 将球心变换到方块局部坐标系（处理旋转方块）
  let lx, ly
  if (box.angle) {
    const dx = ball.pos.x - box.pos.x, dy = ball.pos.y - box.pos.y
    const cos = Math.cos(-box.angle), sin = Math.sin(-box.angle)
    lx = dx * cos - dy * sin
    ly = dx * sin + dy * cos
  } else {
    lx = ball.pos.x - box.pos.x
    ly = ball.pos.y - box.pos.y
  }

  // 在局部坐标系中找离球心最近的点
  const clx = Math.max(-hw, Math.min(lx, hw))
  const cly = Math.max(-hh, Math.min(ly, hh))

  const dlx = lx - clx, dly = ly - cly
  const dist = Math.sqrt(dlx * dlx + dly * dly)
  if (dist >= ball.radius) return

  // 在局部坐标系中计算法线
  let lnx, lny, overlap
  if (dist < 0.001) {
    // 球心在方块内部 — 找最近边推出
    const dLeft = lx + hw
    const dRight = hw - lx
    const dTop = ly + hh
    const dBottom = hh - ly
    const minX = Math.min(dLeft, dRight)
    const minY = Math.min(dTop, dBottom)
    if (Math.min(minX, minY) <= 0) return
    if (ball.radius <= Math.min(minX, minY)) return
    if (minX < minY) {
      lnx = dLeft < dRight ? -1 : 1; lny = 0; overlap = ball.radius - minX
    } else {
      lnx = 0; lny = dTop < dBottom ? -1 : 1; overlap = ball.radius - minY
    }
  } else {
    lnx = dlx / dist; lny = dly / dist; overlap = ball.radius - dist
  }

  // 将法线变换回世界坐标系
  let nx, ny
  if (box.angle) {
    const cos = Math.cos(box.angle), sin = Math.sin(box.angle)
    nx = lnx * cos - lny * sin
    ny = lnx * sin + lny * cos
  } else {
    nx = lnx; ny = lny
  }
  const totalM = (ball.isStatic ? 0 : ball.mass) + (box.isStatic ? 0 : box.mass)
  if (totalM === 0) return

  if (!ball.isStatic) {
    ball.pos.x += nx * overlap * (box.isStatic ? 1 : box.mass / totalM)
    ball.pos.y += ny * overlap * (box.isStatic ? 1 : box.mass / totalM)
  }
  if (!box.isStatic) {
    box.pos.x -= nx * overlap * (ball.isStatic ? 1 : ball.mass / totalM)
    box.pos.y -= ny * overlap * (ball.isStatic ? 1 : ball.mass / totalM)
  }

  const dvx = ball.velocity.x - box.velocity.x
  const dvy = ball.velocity.y - box.velocity.y
  const relVn = dvx * nx + dvy * ny
  if (relVn > 0) return

  const restitution = Math.min(ball.restitution, box.restitution)
  const impulse = -(1 + restitution) * relVn / totalM

  if (!ball.isStatic) {
    ball.velocity.x += impulse * (box.isStatic ? ball.mass : box.mass) * nx
    ball.velocity.y += impulse * (box.isStatic ? ball.mass : box.mass) * ny
  }
  if (!box.isStatic) {
    box.velocity.x -= impulse * (ball.isStatic ? box.mass : ball.mass) * nx
    box.velocity.y -= impulse * (ball.isStatic ? box.mass : ball.mass) * ny
  }
}

/**
 * 方块 vs 方块 (AABB)
 */
export function collideBoxBox(a, b) {
  const aHW = a.width / 2, aHH = a.height / 2
  const bHW = b.width / 2, bHH = b.height / 2

  const dx = b.pos.x - a.pos.x
  const dy = b.pos.y - a.pos.y
  const overlapX = aHW + bHW - Math.abs(dx)
  const overlapY = aHH + bHH - Math.abs(dy)
  if (overlapX <= 0 || overlapY <= 0) return

  let nx, ny, overlap
  if (overlapX < overlapY) {
    overlap = overlapX
    nx = dx > 0 ? 1 : -1
    ny = 0
  } else {
    overlap = overlapY
    nx = 0
    ny = dy > 0 ? 1 : -1
  }

  const totalM = (a.isStatic ? 0 : a.mass) + (b.isStatic ? 0 : b.mass)
  if (totalM === 0) return

  if (!a.isStatic) {
    a.pos.x -= nx * overlap * (b.isStatic ? 1 : b.mass / totalM)
    a.pos.y -= ny * overlap * (b.isStatic ? 1 : b.mass / totalM)
  }
  if (!b.isStatic) {
    b.pos.x += nx * overlap * (a.isStatic ? 1 : a.mass / totalM)
    b.pos.y += ny * overlap * (a.isStatic ? 1 : a.mass / totalM)
  }

  const dvx = a.velocity.x - b.velocity.x
  const dvy = a.velocity.y - b.velocity.y
  const relVn = dvx * nx + dvy * ny
  if (relVn > 0) return

  const restitution = Math.min(a.restitution, b.restitution)
  const impulse = -(1 + restitution) * relVn / totalM

  if (!a.isStatic) {
    a.velocity.x += impulse * (b.isStatic ? a.mass : b.mass) * nx
    a.velocity.y += impulse * (b.isStatic ? a.mass : b.mass) * ny
  }
  if (!b.isStatic) {
    b.velocity.x -= impulse * (a.isStatic ? b.mass : a.mass) * nx
    b.velocity.y -= impulse * (a.isStatic ? b.mass : a.mass) * ny
  }
}

/**
 * 获取物体的有效碰撞包围圆半径
 */
export function getCollisionRadius(obj) {
  if (obj.reactRadius) return obj.reactRadius
  const r = obj.radius || 0
  const w = obj.width || r * 2 || 40
  const h = obj.height || r * 2 || 40
  return Math.max(w, h) / 2
}

/**
 * 包围圆近似碰撞（不规则形状兜底）
 */
export function collideBoundingCircle(a, b) {
  const rA = getCollisionRadius(a)
  const rB = getCollisionRadius(b)

  const dx = b.pos.x - a.pos.x
  const dy = b.pos.y - a.pos.y
  const dist = Math.sqrt(dx * dx + dy * dy)
  const minDist = rA + rB
  if (dist >= minDist || dist < 0.001) return

  const nx = dx / dist
  const ny = dy / dist
  const overlap = minDist - dist
  const totalM = (a.isStatic ? 0 : a.mass) + (b.isStatic ? 0 : b.mass)
  if (totalM === 0) return

  if (!a.isStatic) {
    a.pos.x -= nx * overlap * (b.isStatic ? 1 : b.mass / totalM)
    a.pos.y -= ny * overlap * (b.isStatic ? 1 : b.mass / totalM)
  }
  if (!b.isStatic) {
    b.pos.x += nx * overlap * (a.isStatic ? 1 : a.mass / totalM)
    b.pos.y += ny * overlap * (a.isStatic ? 1 : a.mass / totalM)
  }

  const dvx = a.velocity.x - b.velocity.x
  const dvy = a.velocity.y - b.velocity.y
  const relVn = dvx * nx + dvy * ny
  if (relVn > 0) return

  const restitution = Math.min(a.restitution, b.restitution)
  const impulse = -(1 + restitution) * relVn / totalM

  if (!a.isStatic) {
    a.velocity.x += impulse * (b.isStatic ? a.mass : b.mass) * nx
    a.velocity.y += impulse * (b.isStatic ? a.mass : b.mass) * ny
  }
  if (!b.isStatic) {
    b.velocity.x -= impulse * (a.isStatic ? b.mass : a.mass) * nx
    b.velocity.y -= impulse * (a.isStatic ? b.mass : a.mass) * ny
  }
}

/**
 * 球 vs 任意三角形（通用）
 *
 * @param {Object} ball  - 球体 (pos, velocity, radius, mass, isStatic, restitution)
 * @param {Object} tri   - 三角形物体 (pos, velocity, mass, isStatic, restitution)
 * @param {Array} verts  - 三个绝对顶点坐标 [{x, y}, {x, y}, {x, y}]
 */
export function collideBallTriangle(ball, tri, verts) {
  const [v1, v2, v3] = verts
  const cx = ball.pos.x, cy = ball.pos.y, r = ball.radius

  // ---- 步骤1：找三角形周长上离球心最近的点 ----
  // 用向量投影计算每条边上的最近点（支持任意方向边）
  const cp = [
    closestOnSegment(cx, cy, v1.x, v1.y, v2.x, v2.y),
    closestOnSegment(cx, cy, v2.x, v2.y, v3.x, v3.y),
    closestOnSegment(cx, cy, v3.x, v3.y, v1.x, v1.y),
  ]

  // 取最近者
  let best = 0, bestDistSq = Infinity
  for (let i = 0; i < 3; i++) {
    const ddx = cx - cp[i].x, ddy = cy - cp[i].y
    const dSq = ddx * ddx + ddy * ddy
    if (dSq < bestDistSq) { bestDistSq = dSq; best = i }
  }
  const { x: cpx, y: cpy } = cp[best]
  const dist = Math.sqrt(bestDistSq)
  if (dist >= r) return

  // ---- 步骤2：判断球心在三角形内部还是外部 ----
  const s1 = (cx - v1.x) * (v2.y - v1.y) - (cy - v1.y) * (v2.x - v1.x)
  const s2 = (cx - v2.x) * (v3.y - v2.y) - (cy - v2.y) * (v3.x - v2.x)
  const s3 = (cx - v3.x) * (v1.y - v3.y) - (cy - v3.y) * (v1.x - v3.x)
  const inside = (s1 >= 0 && s2 >= 0 && s3 >= 0) || (s1 <= 0 && s2 <= 0 && s3 <= 0)

  // ---- 步骤3：计算法线 ----
  let nx, ny
  if (dist < 0.0001) {
    if (inside) { nx = 0; ny = -1 }
    else return
  } else {
    nx = (cx - cpx) / dist
    ny = (cy - cpy) / dist
    if (inside) { nx = -nx; ny = -ny }
  }

  // ---- 步骤4：分离 ----
  const overlap = r - dist
  const totalM = (ball.isStatic ? 0 : ball.mass) + (tri.isStatic ? 0 : tri.mass)
  if (totalM === 0) return

  if (!ball.isStatic) {
    ball.pos.x += nx * overlap * (tri.isStatic ? 1 : tri.mass / totalM)
    ball.pos.y += ny * overlap * (tri.isStatic ? 1 : tri.mass / totalM)
  }
  if (!tri.isStatic) {
    tri.pos.x -= nx * overlap * (ball.isStatic ? 1 : ball.mass / totalM)
    tri.pos.y -= ny * overlap * (ball.isStatic ? 1 : ball.mass / totalM)
  }

  // ---- 步骤5：冲量 ----
  const dvx = ball.velocity.x - tri.velocity.x
  const dvy = ball.velocity.y - tri.velocity.y
  const relVn = dvx * nx + dvy * ny
  if (relVn > 0) return

  const restitution = Math.min(ball.restitution, tri.restitution)
  const impulse = -(1 + restitution) * relVn / totalM

  if (!ball.isStatic) {
    const effMass = tri.isStatic ? ball.mass : tri.mass
    ball.velocity.x += impulse * effMass * nx
    ball.velocity.y += impulse * effMass * ny
  }
  if (!tri.isStatic) {
    const effMass = ball.isStatic ? tri.mass : ball.mass
    tri.velocity.x -= impulse * effMass * nx
    tri.velocity.y -= impulse * effMass * ny
  }
}

// ================================================================
// SAT (分离轴定理) 工具函数 — 用于凸多边形碰撞
// ================================================================

/** 将多边形投影到轴上，返回区间 [min, max] */
function projectPolygon(verts, axis) {
  let min = Infinity, max = -Infinity
  for (const v of verts) {
    const d = v.x * axis.x + v.y * axis.y
    if (d < min) min = d
    if (d > max) max = d
  }
  return { min, max }
}

/** 将 AABB 方块投影到轴上（优化版，直接计算范围） */
function projectBox(box, axis) {
  const hw = box.width / 2
  const hh = box.height / 2
  const center = box.pos.x * axis.x + box.pos.y * axis.y
  const extent = hw * Math.abs(axis.x) + hh * Math.abs(axis.y)
  return { min: center - extent, max: center + extent }
}

/** 计算两个投影区间的重叠量（正数 = 有重叠） */
function getOverlap(p1, p2) {
  return Math.min(p1.max - p2.min, p2.max - p1.min)
}

/** 获取多边形几何中心（顶点平均） */
function getPolyCenter(verts) {
  let cx = 0, cy = 0
  for (const v of verts) { cx += v.x; cy += v.y }
  return { x: cx / verts.length, y: cy / verts.length }
}

/**
 * 方块 (支持旋转) vs 三角形（SAT 分离轴定理）
 *
 * @param {Object} box      - 方块物体 (pos, width, height, velocity, mass, isStatic, restitution, angle)
 * @param {Object} tri      - 三角形物体 (pos, velocity, mass, isStatic, restitution)
 * @param {Array}  triVerts - 三个绝对顶点坐标 [{x,y}, {x,y}, {x,y}]
 */
export function collideBoxTriangle(box, tri, triVerts) {
  // 获取方块顶点（支持旋转方块）
  let boxVerts
  if (typeof box.getVertices === 'function') {
    boxVerts = box.getVertices()
  } else {
    const hw = box.width / 2, hh = box.height / 2
    const cx = box.pos.x, cy = box.pos.y
    boxVerts = [
      { x: cx - hw, y: cy - hh },
      { x: cx + hw, y: cy - hh },
      { x: cx + hw, y: cy + hh },
      { x: cx - hw, y: cy + hh },
    ]
  }

  // 收集 SAT 检测轴
  // 方块的两条边法线（必须使用实际边法线，旋转后 ≠ (1,0)/(0,1)）
  const bCos = Math.cos(box.angle || 0), bSin = Math.sin(box.angle || 0)
  const axes = [
    { x: bSin, y: bCos },      // 方块 x 方向边的法线
    { x: -bCos, y: bSin },     // 方块 y 方向边的法线
  ]
  // 三角形三条边的法线
  for (let i = 0; i < 3; i++) {
    const v1 = triVerts[i]
    const v2 = triVerts[(i + 1) % 3]
    const ex = v2.x - v1.x, ey = v2.y - v1.y
    const len = Math.sqrt(ex * ex + ey * ey)
    if (len < 0.0001) continue
    axes.push({ x: -ey / len, y: ex / len })
  }

  // SAT：在所有轴上投影，找最小重叠量（MTV）
  let minOverlap = Infinity
  let bestAxis = null
  let bestSign = 1

  for (const axis of axes) {
    const boxP = projectPolygon(boxVerts, axis)
    const triP = projectPolygon(triVerts, axis)
    const overlap = getOverlap(boxP, triP)
    if (overlap <= 0) return

    if (overlap < minOverlap) {
      minOverlap = overlap
      bestAxis = axis
      const boxCP = box.pos.x * axis.x + box.pos.y * axis.y
      const triCenter = getPolyCenter(triVerts)
      const triCP = triCenter.x * axis.x + triCenter.y * axis.y
      bestSign = triCP >= boxCP ? 1 : -1
    }
  }

  if (!bestAxis) return

  // === 碰撞响应 ===
  const nx = bestAxis.x * bestSign  // 法线从方块指向三角形
  const ny = bestAxis.y * bestSign

  // ★ 吸附角度 — 只在法线来自三角形边且有显著垂直分量时生效
  //   axes[0,1] = 方块边法线, axes[2,3,4] = 三角形边法线
  //   ny > 0: 碰撞法线指向下（方块在三角形上方）→ 需要吸附
  //   ny ≈ 0: 墙壁法线 → 不吸附
  //   |ny| 很大（≈1）：水平面 → 吸附到 0°（自然被角度阻尼处理）
  if (!box.isStatic && typeof box.angle === 'number') {
    const axisIdx = axes.indexOf(bestAxis)
    const isTriEdge = axisIdx >= 2
    // 法线有明显垂直分量(|ny|>0.2)且来自三角形边，说明是在斜面上
    if (isTriEdge && Math.abs(ny) > 0.2) {
      let a = Math.atan2(-nx, ny)
      while (a > Math.PI / 2) a -= Math.PI
      while (a < -Math.PI / 2) a += Math.PI
      box.angle = a
      // 吸附后方块形状变了，重新获取顶点和重叠量
      if (typeof box.getVertices === 'function') {
        boxVerts = box.getVertices()
      }
      // 在 MTV 轴上用新顶点重新计算重叠
      const newBoxP = projectPolygon(boxVerts, bestAxis)
      const newTriP = projectPolygon(triVerts, bestAxis)
      const newOv = getOverlap(newBoxP, newTriP)
      if (newOv > 0) minOverlap = newOv
    }
  }

  const overlap = Math.max(minOverlap, 0.01)
  const totalM = (box.isStatic ? 0 : box.mass) + (tri.isStatic ? 0 : tri.mass)
  if (totalM === 0) return

  // 分离（用吸附后的重叠量）
  if (!box.isStatic) {
    box.pos.x -= nx * overlap * (tri.isStatic ? 1 : tri.mass / totalM)
    box.pos.y -= ny * overlap * (tri.isStatic ? 1 : tri.mass / totalM)
  }
  if (!tri.isStatic) {
    tri.pos.x += nx * overlap * (box.isStatic ? 1 : box.mass / totalM)
    tri.pos.y += ny * overlap * (box.isStatic ? 1 : box.mass / totalM)
  }

  // 冲量
  const dvx = box.velocity.x - tri.velocity.x
  const dvy = box.velocity.y - tri.velocity.y
  const relVn = dvx * nx + dvy * ny
  if (relVn > 0) return

  const restitution = Math.min(box.restitution, tri.restitution)
  const impulse = -(1 + restitution) * relVn / totalM

  if (!box.isStatic) {
    const effMass = tri.isStatic ? box.mass : tri.mass
    box.velocity.x += impulse * effMass * nx
    box.velocity.y += impulse * effMass * ny
  }
  if (!tri.isStatic) {
    const effMass = box.isStatic ? tri.mass : box.mass
    tri.velocity.x -= impulse * effMass * nx
    tri.velocity.y -= impulse * effMass * ny
  }

  // ★ 摩擦力：在切向方向施加阻尼，防止无摩擦滑动导致的 vy 无限叠加
  //   切向方向 = 法线的垂直方向
  if (!box.isStatic) {
    const FRICTION = 0.25
    const tx = -ny, ty = nx
    const relVt = box.velocity.x * tx + box.velocity.y * ty
    if (Math.abs(relVt) > 1) {
      box.velocity.x -= relVt * tx * FRICTION
      box.velocity.y -= relVt * ty * FRICTION
    }
  }

  // ★ 静止接触检测：相对法线速度极小 → 归零，防止微弹跳
  if (!box.isStatic) {
    const finalRelVn = (box.velocity.x - (tri.isStatic ? 0 : tri.velocity.x)) * nx
                      + (box.velocity.y - (tri.isStatic ? 0 : tri.velocity.y)) * ny
    if (finalRelVn > 0 && finalRelVn < 30) {
      box.velocity.x -= finalRelVn * nx
      box.velocity.y -= finalRelVn * ny
    }
  }
}

/**
 * 三角形 vs 三角形（SAT 分离轴定理）
 *
 * @param {Object} a      - 三角形物体 A
 * @param {Object} b      - 三角形物体 B
 * @param {Array}  aVerts - 三角形 A 的三个绝对顶点
 * @param {Array}  bVerts - 三角形 B 的三个绝对顶点
 */
export function collideTriTriangle(a, b, aVerts, bVerts) {
  // 收集两个三角形的边法线作为检测轴
  const axes = []
  const addEdges = (verts) => {
    for (let i = 0; i < 3; i++) {
      const v1 = verts[i], v2 = verts[(i + 1) % 3]
      const ex = v2.x - v1.x, ey = v2.y - v1.y
      const len = Math.sqrt(ex * ex + ey * ey)
      if (len < 0.0001) continue
      axes.push({ x: -ey / len, y: ex / len })
    }
  }
  addEdges(aVerts)
  addEdges(bVerts)

  // SAT：找 MTV
  let minOverlap = Infinity
  let bestAxis = null
  let bestSign = 1

  for (const axis of axes) {
    const aP = projectPolygon(aVerts, axis)
    const bP = projectPolygon(bVerts, axis)
    const overlap = getOverlap(aP, bP)
    if (overlap <= 0) return

    if (overlap < minOverlap) {
      minOverlap = overlap
      bestAxis = axis
      const aC = getPolyCenter(aVerts)
      const bC = getPolyCenter(bVerts)
      const aCp = aC.x * axis.x + aC.y * axis.y
      const bCp = bC.x * axis.x + bC.y * axis.y
      bestSign = bCp >= aCp ? 1 : -1
    }
  }

  if (!bestAxis) return

  // === 碰撞响应（同 collideBoxBox 约定：法线从 a 指向 b）===
  const nx = bestAxis.x * bestSign
  const ny = bestAxis.y * bestSign
  const overlap = Math.max(minOverlap, 0.01)
  const totalM = (a.isStatic ? 0 : a.mass) + (b.isStatic ? 0 : b.mass)
  if (totalM === 0) return

  if (!a.isStatic) {
    a.pos.x -= nx * overlap * (b.isStatic ? 1 : b.mass / totalM)
    a.pos.y -= ny * overlap * (b.isStatic ? 1 : b.mass / totalM)
  }
  if (!b.isStatic) {
    b.pos.x += nx * overlap * (a.isStatic ? 1 : a.mass / totalM)
    b.pos.y += ny * overlap * (a.isStatic ? 1 : a.mass / totalM)
  }

  const dvx = a.velocity.x - b.velocity.x
  const dvy = a.velocity.y - b.velocity.y
  const relVn = dvx * nx + dvy * ny
  if (relVn > 0) return

  const restitution = Math.min(a.restitution, b.restitution)
  const impulse = -(1 + restitution) * relVn / totalM

  if (!a.isStatic) {
    const effMass = b.isStatic ? a.mass : b.mass
    a.velocity.x += impulse * effMass * nx
    a.velocity.y += impulse * effMass * ny
  }
  if (!b.isStatic) {
    const effMass = a.isStatic ? b.mass : a.mass
    b.velocity.x -= impulse * effMass * nx
    b.velocity.y -= impulse * effMass * ny
  }
}

// ---- 工具 ----

/** 线段上离点 (px,py) 最近的点（向量投影法） */
function closestOnSegment(px, py, ax, ay, bx, by) {
  const ex = bx - ax, ey = by - ay
  const lenSq = ex * ex + ey * ey
  if (lenSq < 0.0001) return { x: ax, y: ay }
  let t = ((px - ax) * ex + (py - ay) * ey) / lenSq
  t = Math.max(0, Math.min(1, t))
  return { x: ax + t * ex, y: ay + t * ey }
}
