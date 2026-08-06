import BaseObject from "./BaseObject.js"

export default class Pendulum extends BaseObject {
  constructor(x, y) {
    super(x, y)
    this.mass = 2
    this.restitution = 0.5
    this.color = '#9b59b6'
    this.radius = 16
    this.reactRadius = 16

    // 单摆参数（支点相对放置点上方，无限画布下任意位置放置均可见横梁）
    this.pivotX = x
    this.pivotY = y - 120
    this.stringLength = Math.sqrt(
      (x - this.pivotX) ** 2 + (y - this.pivotY) ** 2
    )
  }

  draw(ctx) {
    if (!ctx) return

    // 绘制天花板横梁
    ctx.save()
    ctx.fillStyle = '#5a6a7a'
    ctx.fillRect(this.pivotX - 20, this.pivotY - 3, 40, 6)
    ctx.fillStyle = '#7f8c8d'
    ctx.fillRect(this.pivotX - 28, this.pivotY - 2, 56, 4)

    // 绘制固定轴
    ctx.beginPath()
    ctx.arc(this.pivotX, this.pivotY, 4, 0, Math.PI * 2)
    ctx.fillStyle = '#555'
    ctx.fill()
    ctx.strokeStyle = '#444'
    ctx.lineWidth = 1
    ctx.stroke()

    // 绘制绳子
    ctx.beginPath()
    ctx.moveTo(this.pivotX, this.pivotY + 4)
    ctx.lineTo(this.pos.x, this.pos.y - this.radius)
    ctx.strokeStyle = '#8a7a6a'
    ctx.lineWidth = 1.5
    ctx.setLineDash([4, 3])
    ctx.stroke()
    ctx.setLineDash([])

    ctx.restore()

    // 绘制摆锤
    ctx.save()
    const grad = ctx.createRadialGradient(
      this.pos.x - 4, this.pos.y - 4, 2,
      this.pos.x, this.pos.y, this.radius
    )
    grad.addColorStop(0, '#c084fc')
    grad.addColorStop(1, this.color)
    ctx.beginPath()
    ctx.arc(this.pos.x, this.pos.y, this.radius, 0, Math.PI * 2)
    ctx.fillStyle = grad
    ctx.fill()
    ctx.strokeStyle = '#7c3aed'
    ctx.lineWidth = 1.5
    ctx.stroke()

    // 重心标记点
    ctx.beginPath()
    ctx.arc(this.pos.x, this.pos.y, 3, 0, Math.PI * 2)
    ctx.fillStyle = 'rgba(255,255,255,0.4)'
    ctx.fill()

    ctx.restore()
  }
}
