import MODEL_TYPES from '../../constants/modelTypes.js'
import { getObjectTypeId } from './objectTypes.js'

const modelTypeMap = Object.fromEntries(MODEL_TYPES.map(model => [model.id, model]))

export { MODEL_TYPES }

export function getModel(id) {
  return modelTypeMap[id]
}

export function getModelName(id) {
  return getModel(id)?.name || id
}

export function getModelByObject(obj) {
  return getModel(getObjectTypeId(obj)) || null
}
