import Box from "./Box.js"

export default class Platform extends Box {
    constructor(x, y, width = 150, height = 18) {
        super(x, y, width, height)
        this.mass = 9999
        this.restitution = 0.35
        this.isStatic = true
        this.color = "#64748b"
    }

    draw(ctx) {
        ctx.save()
        ctx.translate(this.pos.x, this.pos.y)
        if (this.angle) ctx.rotate(this.angle)

        ctx.fillStyle = this.color
        ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height)

        ctx.strokeStyle = "rgba(255,255,255,0.38)"
        ctx.lineWidth = 1.5
        const stripeStep = 20
        for (let x = -this.width / 2 + stripeStep; x < this.width / 2; x += stripeStep) {
            ctx.beginPath()
            ctx.moveTo(x, -this.height / 2 + 3)
            ctx.lineTo(x, this.height / 2 - 3)
            ctx.stroke()
        }

        ctx.strokeStyle = "rgba(15,23,42,0.38)"
        ctx.strokeRect(-this.width / 2, -this.height / 2, this.width, this.height)
        ctx.restore()
    }
}
