import { toRaw } from 'vue'
import { getModel } from '../../physics/sandbox/modelRegistry.js'

export function useSandboxObjects({ objects, selectedObject, selectedTypeId, onSelectionChanged, getCanvasSize, camera, groundY }) {
  function createConfiguredObject(config) {
    const model = getModel(config.modelId)
    if (!model) return null

    const obj = model.create(config.x, config.y)
    for (const [key, value] of Object.entries(config.props || {})) {
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        Object.assign(obj[key], value)
      } else {
        obj[key] = value
      }
    }
    if ('width' in obj && 'height' in obj) {
      obj.reactRadius = Math.sqrt(obj.width ** 2 + obj.height ** 2) / 2
    }
    return obj
  }

  function loadPreset(preset) {
    const nextObjects = preset.objects.map(createConfiguredObject).filter(Boolean)
    objects.splice(0, objects.length, ...nextObjects)
    deselectAll()
  }

  function addObjectAt(x, y, modelId) {
    const model = getModel(modelId)
    if (!model) return

    objects.push(model.create(x, y))
    selectObject(objects[objects.length - 1], modelId)
  }

  function selectObject(obj, typeId) {
    selectedObject.value = toRaw(obj)
    selectedTypeId.value = typeId || ''
    onSelectionChanged?.()
  }

  function deselectAll() {
    selectedObject.value = null
    selectedTypeId.value = ''
  }

  function deleteSelected() {
    if (!selectedObject.value) return
    const index = objects.findIndex(obj => toRaw(obj) === selectedObject.value)
    if (index !== -1) objects.splice(index, 1)
    deselectAll()
  }

  function clearAll() {
    objects.splice(0, objects.length)
    deselectAll()
  }

  function resetAll() {
    // 相机复位到 (0,0,1)，物体以当前视口中心为世界锚点散布（不埋地）
    camera.x = 0
    camera.y = 0
    camera.scale = 1

    const { width, height } = getCanvasSize()
    const cx = width / 2
    const cy = Math.min(height / 2, groundY - 120)
    for (const obj of objects) {
      obj.velocity.x = 0
      obj.velocity.y = 0
      obj.pos.x = cx + (Math.random() - 0.5) * 100
      obj.pos.y = cy + Math.random() * 100
    }
  }

  return {
    addObjectAt,
    loadPreset,
    selectObject,
    deselectAll,
    deleteSelected,
    clearAll,
    resetAll,
  }
}
