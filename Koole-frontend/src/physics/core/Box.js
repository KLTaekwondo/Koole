import BaseObject from "./BaseObject.js"

// 方块/矩形类 — 支持旋转
export default class Box extends BaseObject {
    constructor(x, y, width, height) {
        super(x, y)
        this.width = width
        this.height = height
        this.angle = 0              // 旋转角度（弧度）
        this.reactRadius = Math.sqrt(width ** 2 + height ** 2) / 2
    }

    /** 获取旋转后的 4 个顶点（用于 SAT 碰撞检测）
     *  使用顺时针旋转（与 Canvas ctx.rotate 一致） */
    getVertices() {
        const hw = this.width / 2, hh = this.height / 2
        const cos = Math.cos(this.angle), sin = Math.sin(this.angle)
        const cx = this.pos.x, cy = this.pos.y
        return [
            { x: cx - hw*cos + hh*sin, y: cy - hw*sin - hh*cos },   // TL
            { x: cx + hw*cos + hh*sin, y: cy + hw*sin - hh*cos },   // TR
            { x: cx + hw*cos - hh*sin, y: cy + hw*sin + hh*cos },   // BR
            { x: cx - hw*cos - hh*sin, y: cy - hw*sin + hh*cos },   // BL
        ]
    }

    draw(ctx) {
        ctx.save()
        ctx.translate(this.pos.x, this.pos.y)
        if (this.angle) ctx.rotate(this.angle)
        ctx.beginPath()
        ctx.rect(-this.width / 2, -this.height / 2, this.width, this.height)
        ctx.fillStyle = this.color
        ctx.fill()
        ctx.strokeStyle = 'rgba(0,0,0,0.25)'
        ctx.lineWidth = 1.5
        ctx.stroke()
        ctx.restore()
    }
}
