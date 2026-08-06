import {
  collideBallBall,
  collideBallBox,
  collideBoxBox,
  collideObbBox,
  collideBoundingCircle,
  collideBallTriangle,
  collideBoxTriangle,
  collideTriTriangle,
} from '../collision.js'
import { getRawObject, isBallLike, isBox, isSameObject, isTriangleLike } from './objectTypes.js'

function getTriangleVertices(obj) {
  if (obj.getVertices) return obj.getVertices()

  const halfW = (obj.width || 40) / 2
  const halfH = (obj.height || 40) / 2
  return [
    { x: obj.pos.x, y: obj.pos.y - halfH },
    { x: obj.pos.x - halfW, y: obj.pos.y + halfH },
    { x: obj.pos.x + halfW, y: obj.pos.y + halfH },
  ]
}

export function resolveSandboxCollisions(objects, draggedObject = null) {
  let collisionCount = 0

  for (let i = 0; i < objects.length; i++) {
    for (let j = i + 1; j < objects.length; j++) {
      const a = objects[i]
      const b = objects[j]

      if (a.isStatic && b.isStatic) continue
      if (draggedObject && (isSameObject(a, draggedObject) || isSameObject(b, draggedObject))) continue

      let collided = false
      if (isBallLike(a) && isBallLike(b)) {
        collided = collideBallBall(a, b)
      } else if (isBallLike(a) && isBox(b)) {
        collided = collideBallBox(a, b)
      } else if (isBox(a) && isBallLike(b)) {
        collided = collideBallBox(b, a)
      } else if (isBox(a) && isBox(b)) {
        const aAngle = getRawObject(a).angle || 0
        const bAngle = getRawObject(b).angle || 0
        collided = Math.abs(aAngle) > 0.0001 || Math.abs(bAngle) > 0.0001
          ? collideObbBox(a, b)
          : collideBoxBox(a, b)
      } else if (isBallLike(a) && isTriangleLike(b)) {
        collided = collideBallTriangle(a, b, getTriangleVertices(b))
      } else if (isTriangleLike(a) && isBallLike(b)) {
        collided = collideBallTriangle(b, a, getTriangleVertices(a))
      } else if (isTriangleLike(a) && isTriangleLike(b)) {
        collided = collideTriTriangle(a, b, getTriangleVertices(a), getTriangleVertices(b))
      } else if (isBox(a) && isTriangleLike(b)) {
        collided = collideBoxTriangle(a, b, getTriangleVertices(b))
      } else if (isTriangleLike(a) && isBox(b)) {
        collided = collideBoxTriangle(b, a, getTriangleVertices(a))
      } else {
        collided = collideBoundingCircle(a, b)
      }

      if (collided) collisionCount += 1
    }
  }

  return collisionCount
}
