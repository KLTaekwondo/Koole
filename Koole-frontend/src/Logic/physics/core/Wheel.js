import Ball from "./Ball.js"

export default class Wheel extends Ball {
    constructor(x, y, radius = 26) {
        super(x, y, radius)
        this.mass = 2
        this.restitution = 0.62
        this.friction = 0.12
        this.color = "#0f766e"
        this.rotation = 0
    }

    draw(ctx) {
        ctx.save()
        ctx.translate(this.pos.x, this.pos.y)
        ctx.rotate(this.rotation)

        ctx.beginPath()
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2)
        ctx.fillStyle = this.color
        ctx.fill()
        ctx.strokeStyle = "rgba(15,23,42,0.55)"
        ctx.lineWidth = 3
        ctx.stroke()

        ctx.strokeStyle = "rgba(255,255,255,0.72)"
        ctx.lineWidth = 2
        for (let index = 0; index < 6; index += 1) {
            const angle = (index / 6) * Math.PI * 2
            ctx.beginPath()
            ctx.moveTo(0, 0)
            ctx.lineTo(Math.cos(angle) * this.radius * 0.76, Math.sin(angle) * this.radius * 0.76)
            ctx.stroke()
        }

        ctx.beginPath()
        ctx.arc(0, 0, Math.max(4, this.radius * 0.18), 0, Math.PI * 2)
        ctx.fillStyle = "#dbeafe"
        ctx.fill()
        ctx.restore()
    }
}
