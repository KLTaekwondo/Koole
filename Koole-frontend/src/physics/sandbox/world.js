import { MAX_SPEED, REST_THRESHOLD } from '../../constants/physics.js'
import { getGroundHalfExtent, resolveGroundCollision } from './bounds.js'
import { resolveSandboxCollisions } from './collisions.js'
import { getRawObject, isBox, isPendulum, isSameObject, isSpringMass } from './objectTypes.js'

function limitSpeed(obj) {
  const speed = Math.sqrt(obj.velocity.x ** 2 + obj.velocity.y ** 2)
  if (speed <= MAX_SPEED) return

  obj.velocity.x = (obj.velocity.x / speed) * MAX_SPEED
  obj.velocity.y = (obj.velocity.y / speed) * MAX_SPEED
}

function applySpringConstraint(obj, dt) {
  const dx = obj.anchorX - obj.pos.x
  const dy = obj.anchorY - obj.pos.y
  const distance = Math.sqrt(dx * dx + dy * dy)

  if (distance > 0.001) {
    const nx = dx / distance
    const ny = dy / distance
    const stretch = distance - obj.springRestLength
    const force = obj.springK * stretch
    obj.velocity.x += (force * nx / obj.mass) * dt
    obj.velocity.y += (force * ny / obj.mass) * dt
  }

  obj.velocity.x *= 1 - obj.springDamping * dt
  obj.velocity.y *= 1 - obj.springDamping * dt
}

function applyPendulumConstraint(obj) {
  const dx = obj.pos.x - obj.pivotX
  const dy = obj.pos.y - obj.pivotY
  const distance = Math.sqrt(dx * dx + dy * dy)
  if (distance <= 0.001) return

  const nx = dx / distance
  const ny = dy / distance
  obj.pos.x = obj.pivotX + nx * obj.stringLength
  obj.pos.y = obj.pivotY + ny * obj.stringLength

  const normalVelocity = obj.velocity.x * nx + obj.velocity.y * ny
  obj.velocity.x -= normalVelocity * nx
  obj.velocity.y -= normalVelocity * ny
}

function rememberBoxAngles(objects) {
  for (const obj of objects) {
    if (isBox(obj)) obj._preAngle = obj.angle || 0
  }
}

function dampGroundedBoxes(objects, groundY) {
  for (const obj of objects) {
    if (!isBox(obj) || obj.angle === 0) continue

    // 着地判定与地面碰撞同一口径（真角半径）
    if (obj.pos.y + getGroundHalfExtent(obj) < groundY) {
      delete obj._preAngle
      continue
    }

    if (obj._preAngle !== undefined && Math.abs(obj.angle - obj._preAngle) < 0.001) {
      const speed = Math.sqrt(obj.velocity.x ** 2 + obj.velocity.y ** 2)
      if (speed < REST_THRESHOLD) {
        obj.angle *= 0.98
        if (Math.abs(obj.angle) < 0.01) obj.angle = 0
      }
    }
    delete obj._preAngle
  }
}

export function stepSandboxWorld(objects, dt, options) {
  if (!options.isPlaying) return false

  let selectedUpdated = false

  for (const obj of objects) {
    if (options.draggedObject && isSameObject(obj, options.draggedObject)) continue
    if (obj.isStatic) continue

    if (options.gravityEnabled) obj.velocity.y += options.gravityStrength * dt
    obj.velocity.x += obj.acceleration.x * dt
    obj.velocity.y += obj.acceleration.y * dt
    obj.pos.x += obj.velocity.x * dt
    obj.pos.y += obj.velocity.y * dt

    limitSpeed(obj)
    if (isSpringMass(obj)) applySpringConstraint(obj, dt)
    if (isPendulum(obj)) applyPendulumConstraint(obj)

    // 无限画布：只做地面碰撞，x 方向自由
    resolveGroundCollision(obj, options.groundY, options.floorRestitution)

    if (!selectedUpdated && options.selectedObject && getRawObject(obj) === options.selectedObject) {
      selectedUpdated = true
    }
  }

  rememberBoxAngles(objects)
  // 有限迭代：物体碰撞分离可能重新把物体推入地面，因此每轮都重新约束地面。
  for (let iteration = 0; iteration < 3; iteration += 1) {
    const collisionCount = resolveSandboxCollisions(objects, options.draggedObject)
    for (const obj of objects) {
      if (options.draggedObject && isSameObject(obj, options.draggedObject)) continue
      if (!obj.isStatic) resolveGroundCollision(obj, options.groundY, options.floorRestitution)
    }
    if (collisionCount === 0) break
  }
  dampGroundedBoxes(objects, options.groundY)

  return selectedUpdated
}
