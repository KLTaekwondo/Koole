// ── 统一导出 ──
// 每个模型文件已自包含物理+渲染逻辑，无需再合并

import { PHYSICS_MODELS, DRAW_SCALE, GROUND_Y, CATEGORIES } from "./physicsModels.js"

/**
 * 根据 ID 获取模型对象
 * @param {string} modelId - 模型 ID
 * @returns {Object|null}
 */
export function getModelById(modelId) {
  return PHYSICS_MODELS.find(m => m.id === modelId) || null
}

export { PHYSICS_MODELS, DRAW_SCALE, GROUND_Y, CATEGORIES }
