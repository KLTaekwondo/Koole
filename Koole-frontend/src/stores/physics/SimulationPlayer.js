/**
 * 模拟播放控制器
 * 只负责：rAF 循环、暂停/恢复、时间管理
 * 不碰物理计算
 */

import { onBeforeUnmount } from "vue"

export function createSimulationPlayer(engine, simState, onStep, onFinished) {
  let animationId = null
  let lastTime = 0

  /**
   * rAF 动画循环
   */
  const loop = (timestamp) => {
    if (!simState.running) return
    if (!lastTime) lastTime = timestamp
    const dt = Math.min((timestamp - lastTime) / 1000, 0.05)
    lastTime = timestamp
    simState.simTime += dt
    engine.step(dt)

    if (engine.isFinished()) {
      simState.running = false
      animationId = null
      if (onFinished) onFinished()
      return
    }

    if (onStep) onStep()
    animationId = requestAnimationFrame(loop)
  }

  /**
   * 开始/暂停
   */
  const toggleSimulation = () => {
    const model = engine
    if (!model) return
    if (simState.running) {
      simState.running = false
      if (animationId) cancelAnimationFrame(animationId)
    } else {
      if (engine.isFinished()) {
        engine.initState()
      }
      lastTime = 0
      simState.running = true
      animationId = requestAnimationFrame(loop)
    }
  }

  /**
   * 停止并重置
   */
  const stop = () => {
    simState.running = false
    if (animationId) cancelAnimationFrame(animationId)
  }

  /**
   * 单步执行（调试用）
   */
  const stepOnce = (dt = 1 / 60) => {
    engine.step(dt)
    simState.simTime += dt
    if (onStep) onStep()
  }

  onBeforeUnmount(() => {
    if (animationId) cancelAnimationFrame(animationId)
  })

  return {
    toggleSimulation,
    stop,
    stepOnce,
  }
}
