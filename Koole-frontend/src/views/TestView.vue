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
import { ref ,onMounted,onBeforeUnmount } from "vue"

const canvasRef = ref(null)
let ctx = null
let animationId = null

const velocity = ref(15)
const height = ref(20)
const gravity = ref(9.8)

let x = 0
let y = 0
let vx = 0
let vy = 0

let trail = []

function reset() {
    x = 0
    y = 0
    vx = velocity.value
    vy = 0
    trail = []
}

function step(dt){
    
}
</script>

<style scoped>

</style>