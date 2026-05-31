
import { ref, onBeforeUnmount } from "vue"

/**
 * 物理引擎模块
 * 负责物理状态管理、步进计算、动画循环控制
 * @param {Ref} modelRef - 当前模型引用
 * @param {Function} getParams - 获取参数函数
 * @param {Function} onStep - 每步回调（用于渲染）
 * @param {Function} onFinished - 模拟完成回调（用于录制轨迹）
 * @returns {Object} 物理引擎状态和控制方法
 */
export function createPhysicsEngine(modelRef, getParams, onStep, onFinished) {
  const running = ref(false)
  let animationId = null
  let simTime = 0
  let state = null
  let lastTime = 0

  /**
   * 初始化物理状态
   */
  const initState = () => {
    const model = modelRef.value
    if (!model) return
    const p = getParams()
    state = model.createState(p)
  }

  /**
   * 获取当前状态（供其他模块使用）
   */
  const getState = () => state

  /**
   * 获取当前模拟时间
   */
  const getSimTime = () => simTime

  /**
   * 物理步进
   * @param {number} dt - 时间步长（秒）
   */
  const step = (dt) => {
    const model = modelRef.value
    if (!state || !model) return
    const p = getParams()
    model.step(state, p, dt)
    // 记录轨迹到 state.trail
    const trailPos = model.getTrailPosition(state, p)
    if (trailPos) {
      const MAX_TRAIL = 5000
      state.trail.push({ ...trailPos })
      if (state.trail.length > MAX_TRAIL) state.trail.splice(0, state.trail.length - MAX_TRAIL)
    }
  }

  /**
   * 动画循环
   * @param {number} timestamp - requestAnimationFrame 时间戳
   */
  const loop = (timestamp) => {
    if (!running.value) return
    if (!lastTime) lastTime = timestamp
    const dt = Math.min((timestamp - lastTime) / 1000, 0.05)
    lastTime = timestamp
    simTime += dt
    step(dt)

    const model = modelRef.value
    // 到达终点状态时自动停止并录制
    if (model && model.isFinished(state, getParams())) {
      running.value = false
      animationId = null
      if (onFinished) onFinished(state, getParams(), simTime)
      return
    }

    if (onStep) onStep()
    animationId = requestAnimationFrame(loop)
  }

  /**
   * 切换模拟运行/暂停状态
   */
  const toggleSimulation = () => {
    const model = modelRef.value
    if (!model) return
    if (running.value) {
      running.value = false
      if (animationId) cancelAnimationFrame(animationId)
    } else {
      const p = getParams()
      if (model.isFinished(state, p)) {
        simTime = 0
        initState()
      }
      lastTime = 0
      running.value = true
      animationId = requestAnimationFrame(loop)
    }
  }

  /**
   * 重置模拟到初始状态
   */
  const resetSimulation = () => {
    running.value = false
    if (animationId) cancelAnimationFrame(animationId)
    simTime = 0
    initState()
  }

  onBeforeUnmount(() => {
    if (animationId) cancelAnimationFrame(animationId)
  })

  return {
    running,
    getState,
    getSimTime,
    initState,
    step,
    toggleSimulation,
    resetSimulation,
  }
}
