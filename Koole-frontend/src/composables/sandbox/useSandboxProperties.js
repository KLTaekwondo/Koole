import { isPendulum } from '../../physics/sandbox/objectTypes.js'

function syncPendulumLength(obj, length) {
  const dx = obj.pos.x - obj.pivotX
  const dy = obj.pos.y - obj.pivotY
  const distance = Math.sqrt(dx * dx + dy * dy)
  if (distance <= 0.001) return

  obj.pos.x = obj.pivotX + (dx / distance) * length
  obj.pos.y = obj.pivotY + (dy / distance) * length
}

export function useSandboxProperties({ selectedObject, onUpdated }) {
  function updateProp(path, value) {
    if (!selectedObject.value) return

    const parts = path.split('.')
    let target = selectedObject.value
    for (let i = 0; i < parts.length - 1; i++) target = target[parts[i]]

    const property = parts[parts.length - 1]
    target[property] = value

    if ((property === 'width' || property === 'height') && target.reactRadius !== undefined) {
      target.reactRadius = Math.sqrt(target.width ** 2 + target.height ** 2) / 2
    }
    if (property === 'radius' && target.reactRadius !== undefined) {
      target.reactRadius = value
    }
    if (property === 'stringLength' && isPendulum(target)) {
      syncPendulumLength(target, value)
    }

    onUpdated?.()
  }

  function getRampAngle(obj) {
    return obj?.getAngle ? Math.round(obj.getAngle()) : 0
  }

  function setRampAngle(obj, angle) {
    obj?.setAngle?.(angle)
    onUpdated?.()
  }

  function updateRampDim(obj, dimension, value) {
    if (!obj) return
    obj[dimension] = value
    obj.reactRadius = Math.sqrt(obj.width ** 2 + obj.height ** 2) / 2
    onUpdated?.()
  }

  function round(value) {
    return Math.round(value * 100) / 100
  }

  return { updateProp, getRampAngle, setRampAngle, updateRampDim, round }
}
