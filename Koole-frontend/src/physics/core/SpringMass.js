import BaseObject from "./BaseObject.js"

export default class SpringMass extends BaseObject {
  constructor(x, y) {
    super(x, y)
    this.mass = 2
    this.restitution = 0.5
    this.color = '#e67e22'
    this.radius = 15
    this.reactRadius = 15

    // 弹簧参数（锚点相对放置点上方，无限画布下任意位置放置均可见横梁）
    this.anchorX = x
    this.anchorY = y - 120
    const dy = y - this.anchorY
    this.springK = 65
    this.springRestLength = Math.max(80, dy)
    this.springDamping = 2
  }

  draw(ctx) {
    if (!ctx) return

    // 绘制天花板横梁
    ctx.save()
    ctx.fillStyle = '#5a6a7a'
    ctx.fillRect(this.anchorX - 16, this.anchorY - 3, 32, 6)
    ctx.fillStyle = '#7f8c8d'
    ctx.fillRect(this.anchorX - 22, this.anchorY - 2, 44, 4)

    // 绘制锚点（小三角）
    ctx.beginPath()
    ctx.moveTo(this.anchorX, this.anchorY)
    ctx.lineTo(this.anchorX - 4, this.anchorY + 6)
    ctx.lineTo(this.anchorX + 4, this.anchorY + 6)
    ctx.closePath()
    ctx.fillStyle = '#555'
    ctx.fill()

    // 绘制弹簧（折线）
    const ax = this.anchorX
    const ay = this.anchorY + 6
    const bx = this.pos.x
    const by = this.pos.y - this.radius

    const dx = bx - ax
    const dy = by - ay
    const dist = Math.sqrt(dx * dx + dy * dy)
    if (dist > 1) {
      const nx = dx / dist
      const ny = dy / dist
      const coils = 10
      const amplitude = 5

      ctx.beginPath()
      ctx.moveTo(ax, ay)
      for (let i = 0; i <= coils; i++) {
        const t = i / coils
        const px = ax + dx * t
        const py = ay + dy * t
        const perpX = -ny
        const perpY = nx
        const taper = 1 - 0.25 * Math.sin(Math.PI * t)
        const amp = (i === 0 || i === coils) ? 0 : amplitude * taper
        ctx.lineTo(px + perpX * amp, py + perpY * amp)
      }
      ctx.strokeStyle = '#888'
      ctx.lineWidth = 2
      ctx.stroke()
    }

    ctx.restore()

    // 绘制球体
    ctx.save()
    const grad = ctx.createRadialGradient(
      this.pos.x - 4, this.pos.y - 4, 2,
      this.pos.x, this.pos.y, this.radius
    )
    grad.addColorStop(0, '#f5a623')
    grad.addColorStop(1, this.color)
    ctx.beginPath()
    ctx.arc(this.pos.x, this.pos.y, this.radius, 0, Math.PI * 2)
    ctx.fillStyle = grad
    ctx.fill()
    ctx.strokeStyle = '#d35400'
    ctx.lineWidth = 1.5
    ctx.stroke()
    ctx.restore()
  }
}
