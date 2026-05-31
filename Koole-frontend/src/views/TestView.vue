<template>
    <div>
        <canvas ref="canvasRef" width="800" height="500" style="border:1px solid #ccc"></canvas>
        <div>
            <label>初速度 (m/s): <input type="range" min="0" max="50" step="1" v-model="velocity" /></label>
            <span>{{ velocity }} m/s</span>
        </div>
        <div>
            <label>高度 (m): <input type="range" min="5" max="50" step="1" v-model="height" /></label>
            <span>{{ height }} m</span>
        </div>
        <div>
            <label>重力 (m/s²): <input type="range" min="1" max="20" step="0.5" v-model="gravity" /></label>
            <span>{{ gravity }} m/s²</span>
        </div>
        <button @click="reset">重置</button>
    </div>
</template>

<script setup>
import {ref, onMounted, onBeforeUnmount, computed} from "vue"

const canvasRef = ref(null)
let ctx = null
let animationId = null

const vx = ref(0)// 水平方向速度
const vy = ref(0)//竖直方向速度
const x = ref(0)// 水平坐标
const y = ref(0)// 垂直坐标

const velocity = ref(10)// 初速度
const height = ref(25)// 高度
const gravity = ref(9.8)// 重力

let trail = []// 轨迹
let lastTime = 0;
let running = true;

// 重置
function reset(){
    if (animationId) cancelAnimationFrame(animationId)
    animationId = null
    vy.value = 0
    vx.value = velocity.value
    y.value = height.value
    x.value = 0
    trail = []
    running = true
    lastTime = 0;
    draw()
    animationId = requestAnimationFrame(animate)
}

//计算速度
function step(dt){
    //垂直 重力加速度
    vy.value += gravity.value * dt
    //垂直位置变化
    y.value -= vy.value * dt
    //水平位置变化
    x.value += vx.value * dt

    if(y.value <= 0){
        //立即停止
        y.value = 0
        vy.value = 0
        vx.value = 0
        running = false
    }
    // 记录轨迹
    trail.push({x:x.value, y:y.value})
    if(trail.length > 1000) trail.shift()
}


//绘制
function draw(){
    //如果没有上下文，直接返回
    if(!ctx) return;
    // 赋值，决定画布大小
    const W = 800
    const H = 500
    // 清空画布
    ctx.clearRect(0, 0, W, H)

    // 绘制地面
    const groundY = 60
    ctx.fillStyle = 'whitesmoke'
    ctx.fillRect(0, H - groundY, W, groundY)

    if(trail.length > 1) {
        // 绘制轨迹
        ctx.beginPath()
        ctx.strokeStyle = 'red'
        ctx.lineWidth = 2

        for (let i = 0; i < trail.length; i++) {
            const px = 100 + trail[i].x * 10
            const py = H - groundY - trail[i].y * 10
            if(i === 0) {
                ctx.moveTo(px, py)
            } else {
                ctx.lineTo(px, py)
            }
        }
        ctx.stroke()
    }

    const ballX = 100 + x.value * 10
    const ballY = H - groundY - y.value * 10
    ctx.beginPath()
    ctx.arc(ballX, ballY, 12, 0, Math.PI * 2)
    ctx.fillStyle = 'red'
    ctx.fill()

    // 显示数据
    ctx.fillStyle = "#333"
    ctx.font = "14px sans-serif"
    ctx.fillText(`水平位移: ${x.value.toFixed(1)} m`, 16, 30)
    ctx.fillText(`竖直位移: ${(height.value - y.value).toFixed(1)} m`, 16, 50)
}




function animate(now) {
    if(!running) return;
    if(!lastTime) lastTime = now
    let dt = Math.min((now - lastTime) / 1000, 0.033)
    lastTime = now
    step(dt)
    draw()
    animationId = requestAnimationFrame(animate)
}

onMounted(() => {
    ctx = canvasRef.value.getContext("2d")
    reset()
})

onBeforeUnmount(() => {
    if (animationId) cancelAnimationFrame(animationId)
})
</script>

<style scoped>

</style>