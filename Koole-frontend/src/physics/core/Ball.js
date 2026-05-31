import BaseObject from "./BaseObject.js"

// 球类
export default class Ball extends BaseObject {
    constructor(x,y , radius) {
        super(x,y)
        this.radius = radius
        this.reactRadius = radius
    }

    draw(ctx){
        ctx.beginPath()
        ctx.arc(this.pos.x, this.pos.y, this.radius, 0, 2 * Math.PI)
        ctx.fillStyle = this.color
        ctx.fill()
    }
}