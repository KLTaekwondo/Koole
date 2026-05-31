import BaseObject from "./BaseObject.js"

// 三角形/楔形类 — 适合做斜坡、障碍物等
export default class Triangle extends BaseObject {
    constructor(x, y, width, height) {
        super(x, y)
        this.width = width
        this.height = height
        this.reactRadius = Math.max(width, height) / 2
    }

    draw(ctx) {
        ctx.save()
        ctx.beginPath()
        // 顶点朝上的等腰三角形
        ctx.moveTo(this.pos.x, this.pos.y - this.height / 2)
        ctx.lineTo(this.pos.x - this.width / 2, this.pos.y + this.height / 2)
        ctx.lineTo(this.pos.x + this.width / 2, this.pos.y + this.height / 2)
        ctx.closePath()
        ctx.fillStyle = this.color
        ctx.fill()
        ctx.strokeStyle = 'rgba(0,0,0,0.25)'
        ctx.lineWidth = 1.5
        ctx.stroke()
        ctx.restore()
    }

    // 获取三个顶点（用于碰撞等）
    getVertices() {
        return [
            { x: this.pos.x, y: this.pos.y - this.height / 2 },
            { x: this.pos.x - this.width / 2, y: this.pos.y + this.height / 2 },
            { x: this.pos.x + this.width / 2, y: this.pos.y + this.height / 2 },
        ]
    }
}
