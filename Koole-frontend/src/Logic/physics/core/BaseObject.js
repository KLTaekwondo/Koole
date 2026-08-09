export default class BaseObject {
    constructor(x,y){
        this.pos = {x,y}// 位置
        this.velocity = {x:0,y:0}// 速度
        this.force = {x:0,y:0}// 合力
        this.acceleration = {x:0,y:0}// 加速度
        this.mass = 1.0// 质量
        this.reactRadius = 5.0 //碰撞半径
        this.restitution = 0.0// 弹性系数（通用，物体间碰撞）
        this.color = "red"// 颜色
        this.friction = 0.00// 摩擦系数
        this.isStatic = false// 是否静态
    }

    // 作用力，外部分解再传入，基类只提供加力方法
    applyForce(fx,fy) {
        this.force.x += fx
        this.force.y += fy
    }

    // 设置初始速度
    setVelocity(x,y) {
        this.velocity.x = x
        this.velocity.y = y
    }

    // 设置初始加速度
    setAcceleration(ax,ay) {
        this.acceleration.x = ax
        this.acceleration.y = ay
    }



    // 计算速度和位置
    update(dt) {
        if(this.isStatic) return
        // 处理加速度
        const totalAx = this.force.x / this.mass + this.acceleration.x
        const totalAy = this.force.y / this.mass + this.acceleration.y

        // 处理速度
        this.velocity.x += totalAx * dt
        this.velocity.y += totalAy * dt


        // 处理位置
        this.pos.x += this.velocity.x * dt
        this.pos.y += this.velocity.y * dt

        // 处理合力
        this.force.x = 0
        this.force.y = 0
    }
}