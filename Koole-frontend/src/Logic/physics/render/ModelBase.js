/**
 * ModelBase —— 模型绘制骨架（模板方法）
 *
 * 固定骨架、开放钩子：子类只写「世界几何」和「标注」，
 * 背景 / 地面 / 网格 / 水体这些舞台交给环境部件，一次调用完成。
 *
 * 用法：
 *   class Pendulum extends MechanicsModel {
 *     drawWorld(view, state, params) { ... }
 *     drawOverlay(view, state, params) { ... }
 *   }
 *   export default new Pendulum()
 *
 * 注意：物理层（params / createState / step / getBallPosition）仍由模型自己提供，
 * 这里只管绘制，避免把物理和渲染耦在一起。
 */

import { getEnvironment } from "./environments.js"

export class ModelBase {
  /** 环境名，可选：landscape | water | optical-bench | circuit-board | none */
  static environment = "landscape"

  constructor({ environment, environmentOptions = {} } = {}) {
    this.environment = environment || this.constructor.environment
    this.environmentOptions = environmentOptions
  }

  /** 取环境部件（可在子类覆盖，做完全自定义的舞台） */
  resolveEnvironment() {
    return getEnvironment(this.environment)
  }

  /**
   * 绘制骨架：不要覆盖，改成实现下面两个钩子
   * @param {Object} view ViewKit 实例
   * @param {Object} state 模拟状态
   * @param {Object} params 参数
   */
  drawScene(view, state, params) {
    const env = this.resolveEnvironment()
    const options = this.environmentOptions

    this.lastParams = params
    env.drawBack?.(view, options)
    this.drawWorld(view, state, params)
    env.drawFront?.(view, options)
    this.drawTrail(view, state, params)
    this.drawOverlay(view, state, params)
    env.drawOverlay?.(view, options)
  }

  /**
   * 轨迹层：默认把 state.trail 按「越新越亮」画出来。
   * 场景把物体画在和记录点不同的位置时（比如传送带把滑块抬高），
   * 子类设置 trailOffset 做补偿，轨迹才不会和物体错位。
   */
  drawTrail(view, state) {
    const points = state?.trail
    if (!points || points.length < 2) return
    const offset = typeof this.trailOffset === "function"
      ? this.trailOffset(state, this.lastParams || {})
      : (this.trailOffset || [0, 0])
    const shifted = points.map(p => [p.x + offset[0], p.y + offset[1]])
    view.trail(shifted, { color: this.trailColor || "#e74c3c", width: 2.4 })
  }

  /** 世界层：物体、光线、导线……子类实现 */
  drawWorld() {}

  /** 标注层：文字、数值、箭头……子类实现（在环境前景之上，永远可读） */
  drawOverlay() {}
}

/** 力学：默认地面 + 网格 */
export class MechanicsModel extends ModelBase {
  static environment = "landscape"

  constructor(options = {}) {
    super({ environment: options.environment || "landscape", ...options })
  }

  /** 力学模型的常用组合：一个球体（世界半径） */
  drawBody(view, at, radiusWorld = 0.3, color = view.colors?.body) {
    view.circle(at, radiusWorld, { fill: color, stroke: "rgba(0,0,0,0.18)", width: 1 })
  }
}

/** 光学：默认光轴 + 刻度，没有地面 */
export class OpticsModel extends ModelBase {
  static environment = "optical-bench"

  constructor(options = {}) {
    super({ environment: options.environment || "optical-bench", ...options })
  }
}

/** 电学：默认电路板背景，没有地面 */
export class CircuitModel extends ModelBase {
  static environment = "circuit-board"

  constructor(options = {}) {
    super({ environment: options.environment || "circuit-board", ...options })
  }
}
