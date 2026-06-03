/**
 * 纯物理步进引擎
 * 只负责：初始化状态、单步计算、结束检测
 * 不碰 rAF，不碰渲染
 */

import { GROUND_Y } from "../../constants/physicsModels.js"

export function createPhysicsEngine(modelRef, simState) {
  /**
   * 初始化物理状态
   */
  const initState = () => {
    const model = modelRef.value
    if (!model) return
    simState.state = model.createState(simState.params)
    simState.simTime = 0
  }

  /**
   * 单步物理计算
   * @param {number} dt - 时间步长（秒）
   */
  const step = (dt) => {
    const model = modelRef.value
    if (!simState.state || !model) return
    model.step(simState.state, simState.params, dt)
    // 模拟已结束就不再记录轨迹
    if (model.isFinished(simState.state, simState.params)) return
    // 记录轨迹
    const trailPos = model.getTrailPosition(simState.state, simState.params)
    if (trailPos) {
      const MAX_TRAIL = 5000
      const point = { ...trailPos }
      // 模型自定义扩展字段（如速度、时间等）
      if (model.trailFields) {
        Object.assign(point, model.trailFields(simState.state, simState.params, simState.simTime))
      }
      simState.state.trail.push(point)
      if (simState.state.trail.length > MAX_TRAIL) {
        simState.state.trail.splice(0, simState.state.trail.length - MAX_TRAIL)
      }
    }
  }

  /**
   * 检查模拟是否结束
   */
  const isFinished = () => {
    const model = modelRef.value
    if (!model || !simState.state) return false
    return model.isFinished(simState.state, simState.params)
  }

  return {
    initState,
    step,
    isFinished,
  }
}
