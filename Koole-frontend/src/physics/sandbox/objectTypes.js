import { toRaw } from 'vue'

const TYPE_IDS = {
  Ball: 'ball',
  Box: 'box',
  Triangle: 'triangle',
  SpringMass: 'spring',
  Pendulum: 'pendulum',
  Ramp: 'ramp',
}

export function getRawObject(obj) {
  return obj ? toRaw(obj) : null
}

export function isSameObject(a, b) {
  return getRawObject(a) === getRawObject(b)
}

export function getObjectTypeId(obj) {
  const name = getRawObject(obj)?.constructor?.name || ''
  return TYPE_IDS[name] || ''
}

export function isBallLike(obj) {
  const typeId = getObjectTypeId(obj)
  return typeId === 'ball' || typeId === 'spring' || typeId === 'pendulum'
}

export function isBox(obj) {
  return getObjectTypeId(obj) === 'box'
}

export function isTriangleLike(obj) {
  const typeId = getObjectTypeId(obj)
  return typeId === 'triangle' || typeId === 'ramp'
}

export function isSpringMass(obj) {
  return getObjectTypeId(obj) === 'spring'
}

export function isPendulum(obj) {
  return getObjectTypeId(obj) === 'pendulum'
}
