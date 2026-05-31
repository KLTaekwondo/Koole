import BaseObject from "./BaseObject.js"

export default class Ramp extends BaseObject {
  constructor(x, y, w, h) {
    super(x, y)
    this.mass = 9999
    this.restitution = 0.3
    this.isStatic = true
    this.color = '#27ae60'
    this.width = w || 120
    this.height = h || 60
    // 直角三角形最小包围圆半径 = 斜边长度的一半
    this.reactRadius = Math.sqrt(this.width ** 2 + this.height ** 2) / 2
  }

  /** 获取三个顶点（用于碰撞检测，与 draw 一致） */
  getVertices() {
    const hw = this.width / 2
    const hh = this.height / 2
    return [
      { x: this.pos.x - hw, y: this.pos.y + hh },  // V1: 底部左侧（直角顶点）
      { x: this.pos.x + hw, y: this.pos.y + hh },  // V2: 底部右侧
      { x: this.pos.x - hw, y: this.pos.y - hh },  // V3: 顶部左侧
    ]
  }

  /** 计算斜面角度（度） */
  getAngle() {
    return Math.atan2(this.height, this.width) * (180 / Math.PI)
  }

  /** 通过角度设置宽高（保持面积近似不变） */
  setAngle(deg) {
    const rad = deg * Math.PI / 180
    const area = this.width * this.height
    const newH = Math.sqrt(area * Math.tan(rad))
    const newW = area / newH
    this.width = Math.max(30, Math.round(newW / 5) * 5)
    this.height = Math.max(10, Math.round(newH / 2) * 2)
    this.reactRadius = Math.sqrt(this.width ** 2 + this.height ** 2) / 2
  }

  draw(ctx) {
    if (!ctx) return
    ctx.save()

    const hw = this.width / 2
    const hh = this.height / 2
    const bx = this.pos.x - hw   // 直角顶点 x
    const by = this.pos.y + hh   // 底边 y

    // === 填充直角三角形 ===
    ctx.beginPath()
    ctx.moveTo(bx, by)                         // 底部左侧（直角）
    ctx.lineTo(this.pos.x + hw, by)            // 底部右侧（底边）
    ctx.lineTo(bx, this.pos.y - hh)            // 顶部左侧（垂直边）
    ctx.closePath()

    const grad = ctx.createLinearGradient(bx, by, this.pos.x + hw, this.pos.y - hh)
    grad.addColorStop(0, '#34d976')
    grad.addColorStop(1, '#1e8449')
    ctx.fillStyle = grad
    ctx.fill()
    ctx.strokeStyle = '#166534'
    ctx.lineWidth = 2
    ctx.stroke()

    // === 斜面纹理线 ===
    ctx.save()
    ctx.clip()
    ctx.beginPath()
    const slopeAngle = Math.atan2(this.height, this.width)
    for (let offset = 10; offset < Math.sqrt(this.width ** 2 + this.height ** 2); offset += 14) {
      const t = offset / Math.sqrt(this.width ** 2 + this.height ** 2)
      const sx = bx + t * this.width
      const sy = by - t * this.height
      const perp = 5
      ctx.moveTo(sx - perp * Math.cos(slopeAngle), sy - perp * Math.sin(slopeAngle))
      ctx.lineTo(sx + perp * Math.cos(slopeAngle), sy + perp * Math.sin(slopeAngle))
    }
    ctx.strokeStyle = 'rgba(255,255,255,0.2)'
    ctx.lineWidth = 1
    ctx.stroke()
    ctx.restore()

    // === 直角标记 ===
    const markerSize = 10
    ctx.beginPath()
    ctx.moveTo(bx + markerSize, by)
    ctx.lineTo(bx + markerSize, by - markerSize)
    ctx.lineTo(bx, by - markerSize)
    ctx.strokeStyle = 'rgba(255,255,255,0.4)'
    ctx.lineWidth = 1.5
    ctx.stroke()

    // === 角度弧 + 角度值 ===
    ctx.beginPath()
    ctx.arc(bx, by, 22, -Math.PI / 2, -Math.PI / 2 + slopeAngle)
    ctx.strokeStyle = 'rgba(255,255,255,0.5)'
    ctx.lineWidth = 1.5
    ctx.stroke()

    ctx.fillStyle = 'rgba(255,255,255,0.75)'
    ctx.font = 'bold 12px sans-serif'
    ctx.textAlign = 'left'
    const labelAngle = -Math.PI / 2 + slopeAngle / 2
    ctx.fillText('θ', bx + 26 * Math.cos(labelAngle), by + 26 * Math.sin(labelAngle) + 4)

    ctx.restore()
  }
}
