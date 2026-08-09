import BaseObject from "./BaseObject.js"

export default class WindField extends BaseObject {
    constructor(x, y, width = 190, height = 110) {
        super(x, y)
        this.width = width
        this.height = height
        this.strength = 260
        this.direction = 0
        this.mass = 9999
        this.isStatic = true
        this.color = "#38bdf8"
        this.reactRadius = Math.sqrt(width ** 2 + height ** 2) / 2
    }

    contains(obj) {
        const radius = obj.reactRadius || obj.radius || 0
        return Math.abs(obj.pos.x - this.pos.x) <= this.width / 2 + radius
            && Math.abs(obj.pos.y - this.pos.y) <= this.height / 2 + radius
    }

    draw(ctx) {
        const angle = this.direction * Math.PI / 180
        const arrowLength = 22
        const spacing = 42

        ctx.save()
        ctx.fillStyle = `${this.color}18`
        ctx.strokeStyle = `${this.color}aa`
        ctx.lineWidth = 1.5
        ctx.setLineDash([7, 5])
        ctx.fillRect(this.pos.x - this.width / 2, this.pos.y - this.height / 2, this.width, this.height)
        ctx.strokeRect(this.pos.x - this.width / 2, this.pos.y - this.height / 2, this.width, this.height)
        ctx.setLineDash([])

        ctx.strokeStyle = this.color
        ctx.fillStyle = this.color
        for (let y = this.pos.y - this.height / 2 + 22; y < this.pos.y + this.height / 2; y += spacing) {
            for (let x = this.pos.x - this.width / 2 + 24; x < this.pos.x + this.width / 2; x += spacing) {
                const dx = Math.cos(angle) * arrowLength
                const dy = Math.sin(angle) * arrowLength
                ctx.beginPath()
                ctx.moveTo(x - dx / 2, y - dy / 2)
                ctx.lineTo(x + dx / 2, y + dy / 2)
                ctx.stroke()

                ctx.save()
                ctx.translate(x + dx / 2, y + dy / 2)
                ctx.rotate(angle)
                ctx.beginPath()
                ctx.moveTo(0, 0)
                ctx.lineTo(-6, -4)
                ctx.lineTo(-6, 4)
                ctx.closePath()
                ctx.fill()
                ctx.restore()
            }
        }
        ctx.restore()
    }
}
