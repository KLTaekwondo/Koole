// ── 组合导出 ──
// 把 UI 元数据、物理逻辑、渲染逻辑组装成完整的模型对象
// 对外接口和原来一样，ClassicModelView 等页面不需要改结构

import { PHYSICS_MODELS, DRAW_SCALE, GROUND_Y } from "./physicsModels.js"
import { MODEL_PHYSICS } from "./modelPhysics.js"
import { MODEL_RENDERERS } from "./modelRenderers.js"

/**
 * 获取完整的模型对象（UI + 物理 + 渲染合并）
 * @param {string} modelId - 模型 ID
 * @returns {Object|null} 合并后的完整模型对象
 */
export function getModelById(modelId) {
  const meta = PHYSICS_MODELS.find(m => m.id === modelId)
  if (!meta) return null
  const physics = MODEL_PHYSICS[modelId]
  const renderer = MODEL_RENDERERS[modelId]
  return {
    ...meta,
    ...physics,
    ...(renderer || {}),
  }
}

/**
 * 获取所有模型的完整对象
 * @returns {Object[]} 完整模型列表
 */
export function getAllModels() {
  return PHYSICS_MODELS.map(m => getModelById(m.id))
}

export { PHYSICS_MODELS, DRAW_SCALE, GROUND_Y, MODEL_PHYSICS, MODEL_RENDERERS }
