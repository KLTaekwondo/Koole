<template>
  <div class="sandbox-layout">
    <!-- 左侧：模型面板 -->
    <div class="panel panel-left">
      <div class="panel-header">
        <h3>模型库</h3>
      </div>
      <div class="model-list">
        <div
          v-for="mt in MODEL_TYPES"
          :key="mt.id"
          class="model-item"
          :class="{ active: paletteActiveModel === mt.id }"
          @mousedown.prevent="onPaletteMouseDown($event, mt.id)"
          :title="mt.description"
        >
          <span class="model-icon" v-html="mt.iconSvg || mt.icon"></span>
          <span class="model-name">{{ mt.name }}</span>
        </div>
      </div>
      <div class="panel-divider"></div>
      <div class="model-hint">
        <p>点击模型 → 点击画布放置</p>
        <p>或拖拽模型到画布</p>
      </div>
    </div>

    <!-- 中间：画布区域 -->
    <div class="canvas-wrapper" ref="canvasWrapperRef">
      <!-- 工具栏 -->
      <div class="canvas-toolbar">
        <button class="tool-back-btn" @click="goBackLab" title="返回实验室">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
        </button>
        <div class="tool-title-area">
          <span class="tool-title">沙盒模式</span>
          <span class="tool-subtitle">自由搭建物理实验</span>
        </div>
        <span class="toolbar-divider"></span>
        <button class="tool-btn" @click="togglePlay" :title="isPlaying ? '暂停' : '播放'">
          <span v-if="isPlaying">⏸</span>
          <span v-else>▶</span>
        </button>
        <button class="tool-btn" @click="resetAll" title="重置物体位置">⟳</button>
        <button class="tool-btn" @click="clearAll" title="清空所有物体">✕</button>
        <!-- 环境设置组 -->
        <div class="tool-group">
          <span class="tool-group-label">环境</span>
          <button
            class="tool-chip"
            :class="{ active: gravityEnabled }"
            @click="gravityEnabled = !gravityEnabled"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></svg>
            重力
          </button>
          <span class="gravity-slider-wrap" title="重力加速度">
            <input
              type="range"
              v-model.number="gravityStrength"
              min="0" max="2000" step="50"
              class="gravity-slider"
            />
            <span class="gravity-val">{{ gravityStrength }}</span>
            <span class="gravity-unit">px/s²</span>
          </span>
          <button
            class="tool-chip"
            :class="{ active: showGrid }"
            @click="showGrid = !showGrid"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/></svg>
            网格
          </button>
        </div>

        <!-- 边界弹性选择 -->
        <div class="tool-group">
          <span class="tool-group-label">边界</span>
          <label class="tool-select-wrap">
            <span>墙</span>
            <select v-model.number="wallRestitution">
              <option :value="1.0">完全弹性形变</option>
              <option :value="0.0">完全非弹性形变</option>
            </select>
          </label>
          <label class="tool-select-wrap">
            <span>地</span>
            <select v-model.number="floorRestitution">
              <option :value="1.0">完全弹性形变</option>
              <option :value="0.0">完全非弹性形变</option>
            </select>
          </label>
        </div>
        <span class="tool-status">
          {{ objects.length }} 个物体
          <span v-if="paletteActiveModel" class="placement-hint">
            · 点击画布放置{{ getModelName(paletteActiveModel) }}
          </span>
        </span>
      </div>

      <!-- Canvas -->
      <div class="canvas-container" ref="canvasContainerRef">
        <canvas ref="canvasRef" @mousedown="onCanvasMouseDown" @click="onCanvasClick" @contextmenu.prevent="onCanvasContextMenu"></canvas>
        <!-- 放置预览 -->
        <div
          v-if="paletteActiveModel && !paletteDrag.active"
          class="placement-overlay"
        >
          <span>点击画布放置「{{ getModelName(paletteActiveModel) }}」，按 Esc 取消</span>
        </div>

        <!-- 浮动属性面板（悬浮在画布上方，不影响画布布局） -->
        <div v-if="selectedObject" class="float-panel">
          <div class="float-panel-header">
            <span class="float-panel-title">属性 · {{ getModelName(selectedTypeId) }}</span>
            <button class="close-btn" @click="deselectAll" title="关闭">✕</button>
          </div>
          <div class="float-panel-body">
            <div class="prop-section">
              <div class="prop-section-title">位置</div>
              <div class="prop-row">
                <label title="物体在画布中的 X 坐标">X (px)</label>
                <input type="number" :value="round(selectedObject.pos.x)" @input="e => updateProp('pos.x', +e.target.value)" step="1" />
              </div>
              <div class="prop-row">
                <label title="物体在画布中的 Y 坐标">Y (px)</label>
                <input type="number" :value="round(selectedObject.pos.y)" @input="e => updateProp('pos.y', +e.target.value)" step="1" />
              </div>
            </div>
            <div class="prop-section">
              <div class="prop-section-title">速度</div>
              <div class="prop-row">
                <label title="水平方向速度，正值向右">Vx (px/s)</label>
                <input type="range" :value="selectedObject.velocity.x" @input="e => updateProp('velocity.x', +e.target.value)" min="-500" max="500" step="10" />
                <input type="number" class="range-number" :value="round(selectedObject.velocity.x)" @input="e => updateProp('velocity.x', +e.target.value)" step="10" />
              </div>
              <div class="prop-row">
                <label title="竖直方向速度，正值向下">Vy (px/s)</label>
                <input type="range" :value="selectedObject.velocity.y" @input="e => updateProp('velocity.y', +e.target.value)" min="-500" max="500" step="10" />
                <input type="number" class="range-number" :value="round(selectedObject.velocity.y)" @input="e => updateProp('velocity.y', +e.target.value)" step="10" />
              </div>
            </div>
            <div class="prop-section">
              <div class="prop-section-title">物理属性</div>
              <div class="prop-row">
                <label title="物体的质量，影响碰撞和弹力效果">质量</label>
                <input type="range" :value="selectedObject.mass" @input="e => updateProp('mass', +e.target.value)" min="0.1" max="20" step="0.1" />
                <input type="number" class="range-number" :value="round(selectedObject.mass)" @input="e => updateProp('mass', +e.target.value)" step="0.1" min="0.1" />
              </div>
              <div class="prop-row">
                <label title="恢复系数（0~1），0=完全非弹性，1=完全弹性">弹性</label>
                <input type="range" :value="selectedObject.restitution" @input="e => updateProp('restitution', +e.target.value)" min="0" max="1" step="0.05" />
                <span class="range-val">{{ round(selectedObject.restitution) }}</span>
              </div>
              <div class="prop-row prop-toggle">
                <label title="静态物体不受重力影响，位置固定不动">静态</label>
                <input type="checkbox" :checked="selectedObject.isStatic" @change="e => updateProp('isStatic', e.target.checked)" />
              </div>
            </div>
            <div class="prop-section">
              <div class="prop-section-title">外观</div>
              <div class="prop-row">
                <label title="物体的填充颜色">颜色</label>
                <input type="color" :value="selectedObject.color" @input="e => updateProp('color', e.target.value)" />
                <span class="color-val">{{ selectedObject.color }}</span>
              </div>
              <template v-if="selectedTypeId === 'ball'">
                <div class="prop-row">
                  <label title="球的半径">半径 (px)</label>
                  <input type="range" :value="selectedObject.radius" @input="e => updateProp('radius', +e.target.value)" min="5" max="60" step="1" />
                  <input type="number" class="range-number" :value="round(selectedObject.radius)" @input="e => updateProp('radius', +e.target.value)" step="1" min="5" />
                </div>
              </template>
              <template v-if="selectedTypeId === 'box'">
                <div class="prop-row">
                  <label title="方块的旋转角度，范围 -90° ~ 90°">角度 (°)</label>
                  <input type="range" :value="round((selectedObject.angle || 0) * 180 / Math.PI)" @input="e => updateProp('angle', +e.target.value * Math.PI / 180)" min="-90" max="90" step="1" />
                  <span class="range-val">{{ round((selectedObject.angle || 0) * 180 / Math.PI) }}°</span>
                </div>
                <div class="prop-row">
                  <label title="方块的宽度">宽度 (px)</label>
                  <input type="range" :value="selectedObject.width" @input="e => updateProp('width', +e.target.value)" min="10" max="200" step="2" />
                  <input type="number" class="range-number" :value="round(selectedObject.width)" @input="e => updateProp('width', +e.target.value)" step="2" min="10" />
                </div>
                <div class="prop-row">
                  <label title="方块的高度">高度 (px)</label>
                  <input type="range" :value="selectedObject.height" @input="e => updateProp('height', +e.target.value)" min="10" max="200" step="2" />
                  <input type="number" class="range-number" :value="round(selectedObject.height)" @input="e => updateProp('height', +e.target.value)" step="2" min="10" />
                </div>
              </template>
              <!-- 三角形特有 -->
              <template v-if="selectedTypeId === 'triangle'">
                <div class="prop-row">
                  <label title="三角形底边宽度">底宽 (px)</label>
                  <input type="range" :value="selectedObject.width" @input="e => updateProp('width', +e.target.value)" min="10" max="200" step="2" />
                  <input type="number" class="range-number" :value="round(selectedObject.width)" @input="e => updateProp('width', +e.target.value)" step="2" min="10" />
                </div>
                <div class="prop-row">
                  <label title="三角形的高度">高度 (px)</label>
                  <input type="range" :value="selectedObject.height" @input="e => updateProp('height', +e.target.value)" min="10" max="200" step="2" />
                  <input type="number" class="range-number" :value="round(selectedObject.height)" @input="e => updateProp('height', +e.target.value)" step="2" min="10" />
                </div>
              </template>
              <!-- 斜面特有（角度可调） -->
              <template v-if="selectedTypeId === 'ramp'">
                <div class="prop-row">
                  <label title="斜面倾斜角度，范围 5° ~ 75°">角度 (°)</label>
                  <input type="range" :value="getRampAngle(selectedObject)" @input="e => setRampAngle(selectedObject, +e.target.value)" min="5" max="75" step="1" />
                  <span class="range-val">{{ getRampAngle(selectedObject) }}°</span>
                </div>
                <div class="prop-row">
                  <label title="斜面底边宽度">底宽 (px)</label>
                  <input type="range" :value="selectedObject.width" @input="e => updateRampDim(selectedObject, 'width', +e.target.value)" min="30" max="300" step="5" />
                  <input type="number" class="range-number" :value="round(selectedObject.width)" @input="e => updateRampDim(selectedObject, 'width', +e.target.value)" step="5" min="30" />
                </div>
                <div class="prop-row">
                  <label title="斜面的高度">高度 (px)</label>
                  <input type="range" :value="selectedObject.height" @input="e => updateRampDim(selectedObject, 'height', +e.target.value)" min="10" max="250" step="2" />
                  <input type="number" class="range-number" :value="round(selectedObject.height)" @input="e => updateRampDim(selectedObject, 'height', +e.target.value)" step="2" min="10" />
                </div>
              </template>
              <!-- 弹簧球特有 -->
              <template v-if="selectedTypeId === 'spring'">
                <div class="prop-row">
                  <label title="弹簧劲度系数，越大弹簧越硬">劲度 k</label>
                  <input type="range" :value="selectedObject.springK" @input="e => updateProp('springK', +e.target.value)" min="5" max="200" step="1" />
                  <input type="number" class="range-number" :value="round(selectedObject.springK)" @input="e => updateProp('springK', +e.target.value)" step="1" min="5" />
                </div>
                <div class="prop-row">
                  <label title="弹簧阻尼系数，越大振动衰减越快">阻尼</label>
                  <input type="range" :value="selectedObject.springDamping" @input="e => updateProp('springDamping', +e.target.value)" min="0" max="10" step="0.1" />
                  <span class="range-val">{{ selectedObject.springDamping.toFixed(1) }}</span>
                </div>
                <div class="prop-row">
                  <label title="弹簧的自然长度">原长 (px)</label>
                  <input type="range" :value="selectedObject.springRestLength" @input="e => updateProp('springRestLength', +e.target.value)" min="30" max="400" step="5" />
                  <input type="number" class="range-number" :value="round(selectedObject.springRestLength)" @input="e => updateProp('springRestLength', +e.target.value)" step="5" min="30" />
                </div>
              </template>
              <!-- 单摆特有 -->
              <template v-if="selectedTypeId === 'pendulum'">
                <div class="prop-row">
                  <label title="摆线长度，越长摆动周期越大">摆长 (px)</label>
                  <input type="range" :value="round(selectedObject.stringLength)" @input="e => updateProp('stringLength', +e.target.value)" min="40" max="500" step="5" />
                  <input type="number" class="range-number" :value="round(selectedObject.stringLength)" @input="e => updateProp('stringLength', +e.target.value)" step="5" min="40" />
                </div>
              </template>
            </div>
            <button class="delete-btn" @click="deleteSelected">删除物体</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 调色板拖拽幽灵 -->
    <div
      v-if="paletteDrag.active"
      class="drag-ghost"
      :style="{ left: paletteDrag.x + 'px', top: paletteDrag.y + 'px' }"
    >
      <span v-html="paletteDrag.icon"></span>
      <span>{{ paletteDrag.name }}</span>
    </div>
  </div>

  <!-- 属性说明卡 -->
  <div class="prop-legend">
    <div class="legend-header">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
      属性说明
    </div>
    <div class="legend-grid">
      <div class="legend-item"><span class="legend-tag">X (px) / Y (px)</span><span class="legend-desc">物体在画布中的坐标位置</span></div>
      <div class="legend-item"><span class="legend-tag">Vx (px/s) / Vy (px/s)</span><span class="legend-desc">水平 / 竖直方向速度，正值向右 / 向下</span></div>
      <div class="legend-item"><span class="legend-tag">质量</span><span class="legend-desc">物体的质量，影响碰撞和弹力效果</span></div>
      <div class="legend-item"><span class="legend-tag">弹性</span><span class="legend-desc">恢复系数 0~1，0=完全非弹性，1=完全弹性</span></div>
      <div class="legend-item"><span class="legend-tag">静态</span><span class="legend-desc">静态物体不受重力影响，位置固定不动</span></div>
      <div class="legend-item"><span class="legend-tag">角度 (°)</span><span class="legend-desc">物体的旋转角度，范围 -90° ~ 90°</span></div>
      <div class="legend-item"><span class="legend-tag">半径 / 宽 / 高 (px)</span><span class="legend-desc">物体的几何尺寸</span></div>
      <div class="legend-item"><span class="legend-tag">劲度 k</span><span class="legend-desc">弹簧劲度系数，越大弹簧越「硬」</span></div>
      <div class="legend-item"><span class="legend-tag">阻尼</span><span class="legend-desc">弹簧阻尼系数，越大振动衰减越快</span></div>
      <div class="legend-item"><span class="legend-tag">原长 (px)</span><span class="legend-desc">弹簧的自然长度</span></div>
      <div class="legend-item"><span class="legend-tag">摆长 (px)</span><span class="legend-desc">摆线长度，越长摆动周期越大</span></div>
      <div class="legend-item"><span class="legend-tag">重力 (px/s²)</span><span class="legend-desc">重力加速度，默认 980 ≈ 9.8×100</span></div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, toRaw } from 'vue'
import { useRouter } from 'vue-router'
import Ball from '../physics/core/Ball.js'
import Box from '../physics/core/Box.js'
import Triangle from '../physics/core/Triangle.js'
import SpringMass from '../physics/core/SpringMass.js'
import Pendulum from '../physics/core/Pendulum.js'
import Ramp from '../physics/core/Ramp.js'
import { GRAVITY, MAX_SPEED, REST_THRESHOLD } from '../constants/physics.js'
import MODEL_TYPES from '../constants/modelTypes.js'
import {
  collideBallBall,
  collideBallBox,
  collideBoxBox,
  collideBoundingCircle,
  collideBallTriangle,
  collideBoxTriangle,
  collideTriTriangle,
} from '../physics/collision.js'

const router = useRouter()

// ============================================================
// 状态
// ============================================================
const objects = reactive([])
const selectedObject = ref(null)        // 当前选中的物体引用
const selectedTypeId = ref('')          // 选中物体的类型 ID
const isPlaying = ref(true)
const gravityEnabled = ref(true)
const gravityStrength = ref(GRAVITY)    // 可调重力强度 (px/s²)
const showGrid = ref(true)
const paletteActiveModel = ref('')      // 当前选中的待放置模型
const version = ref(0)                  // 强制触发重渲染用

// 全局环境弹性（容器边界碰撞）
const wallRestitution = ref(1.0)        // 墙壁弹性（水平方向）
const floorRestitution = ref(0.0)       // 地板弹性（竖直方向）

// 调色板拖拽状态
const paletteDrag = reactive({ active: false, x: 0, y: 0, modelId: '', icon: '', name: '' })

// Canvas 拖拽状态
const canvasDrag = reactive({
  active: false,
  object: null,
  offsetX: 0,
  offsetY: 0,
  mouseStartX: 0,
  mouseStartY: 0,
})

// 标记本次鼠标操作是否是"纯点击"（而非拖拽），click 事件里判断
let clickOnly = true

// mousedown 时记录被拖拽物体的类型，mouseup 时选中用
let dragStartTypeId = ''

// DOM refs
const canvasRef = ref(null)
const canvasContainerRef = ref(null)
const canvasWrapperRef = ref(null)

// Canvas 尺寸
let canvasW = 800
let canvasH = 600

// 动画
let animationId = null
let lastTimestamp = 0

// 重力常数 (像素/秒²) — 见 constants/physics.js

// 模型类型查找
const modelTypeMap = {}
for (const mt of MODEL_TYPES) {
  modelTypeMap[mt.id] = mt
}

function getModel(id) {
  return modelTypeMap[id]
}

function getModelName(id) {
  return getModel(id)?.name || id
}

// ============================================================
// 调色板交互
// ============================================================
function onPaletteMouseDown(e, modelId) {
  const model = getModel(modelId)
  if (!model) return

  // 点击已激活的模型 → 取消放置模式，不触发拖拽
  if (paletteActiveModel.value === modelId) {
    paletteActiveModel.value = ''
    return
  }

  paletteActiveModel.value = modelId

  // 开始拖拽
  paletteDrag.active = true
  paletteDrag.x = e.clientX
  paletteDrag.y = e.clientY
  paletteDrag.modelId = modelId
  paletteDrag.icon = model.icon
  paletteDrag.name = model.name

  document.addEventListener('mousemove', onDocumentMouseMove)
  document.addEventListener('mouseup', onDocumentMouseUp)
  document.addEventListener('keydown', onDocumentKeyDown)
}

function onDocumentMouseMove(e) {
  // —— 调色板拖拽跟随 ——
  if (paletteDrag.active) {
    paletteDrag.x = e.clientX
    paletteDrag.y = e.clientY
  }
  // —— Canvas 物体拖拽跟随 ——
  if (canvasDrag.active && canvasDrag.object) {
    // 移动超过 5px 就标记为拖拽而非点击
    const dx = e.clientX - canvasDrag.mouseStartX
    const dy = e.clientY - canvasDrag.mouseStartY
    if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
      clickOnly = false
    }
    const rect = canvasRef.value?.getBoundingClientRect()
    if (rect) {
      let newX = e.clientX - rect.left + canvasDrag.offsetX
      let newY = e.clientY - rect.top + canvasDrag.offsetY
      // 边界约束，防止物体拖出画布
      const obj = canvasDrag.object
      if (obj instanceof Ball || obj instanceof SpringMass || obj instanceof Pendulum) {
        newX = Math.max(obj.radius, Math.min(canvasW - obj.radius, newX))
        newY = Math.max(obj.radius, Math.min(canvasH - obj.radius, newY))
      } else {
        const hw = (obj.width || 40) / 2
        const hh = (obj.height || 40) / 2
        newX = Math.max(hw, Math.min(canvasW - hw, newX))
        newY = Math.max(hh, Math.min(canvasH - hh, newY))
      }
      canvasDrag.object.pos.x = newX
      canvasDrag.object.pos.y = newY
    }
  }
}

function onDocumentMouseUp(e) {
  // —— 调色板拖拽结束 ——
  if (paletteDrag.active) {
    const canvasRect = canvasRef.value?.getBoundingClientRect()
    if (canvasRect) {
      const cx = e.clientX - canvasRect.left
      const cy = e.clientY - canvasRect.top
      if (cx >= 0 && cx <= canvasW && cy >= 0 && cy <= canvasH) {
        addObjectAt(cx, cy, paletteDrag.modelId)
      }
    }
    paletteDrag.active = false
    paletteActiveModel.value = ''
    cleanupDragListeners()
    return
  }

  // —— Canvas 物体拖拽结束 ——
  if (canvasDrag.active) {
    const obj = canvasDrag.object
    const typeId = dragStartTypeId
    canvasDrag.active = false
    canvasDrag.object = null
    dragStartTypeId = ''
    // 拖拽完成后选中该物体（此时才展开属性面板，避免拖拽期间画布偏移）
    if (obj && typeId) {
      selectObject(obj, typeId)
    }
    cleanupDragListeners()
  }
}

function onDocumentKeyDown(e) {
  if (e.key === 'Escape') {
    if (paletteDrag.active) {
      paletteDrag.active = false
      paletteActiveModel.value = ''
    }
    if (canvasDrag.active) {
      canvasDrag.active = false
      canvasDrag.object = null
    }
    paletteActiveModel.value = ''
    dragStartTypeId = ''
    cleanupDragListeners()
  }
}

function cleanupDragListeners() {
  document.removeEventListener('mousemove', onDocumentMouseMove)
  document.removeEventListener('mouseup', onDocumentMouseUp)
  document.removeEventListener('keydown', onDocumentKeyDown)
}

// ============================================================
// Canvas 交互
// ============================================================
function onCanvasMouseDown(e) {
  clickOnly = true

  const rect = canvasRef.value?.getBoundingClientRect()
  if (!rect) return
  const mx = e.clientX - rect.left
  const my = e.clientY - rect.top

  // 放置模式：点击画布直接放置
  if (paletteActiveModel.value) {
    addObjectAt(mx, my, paletteActiveModel.value)
    paletteActiveModel.value = ''
    return
  }

  // 查找物体，准备拖拽
  for (let i = objects.length - 1; i >= 0; i--) {
    const obj = objects[i]
    const typeModel = getModelByObject(obj)
    if (typeModel && typeModel.hitTest(obj, mx, my)) {
      // ⚠ 拖拽期间不 selectObject，防止属性面板展开导致画布偏移
      dragStartTypeId = typeModel.id

      canvasDrag.active = true
      canvasDrag.object = obj
      canvasDrag.offsetX = obj.pos.x - mx
      canvasDrag.offsetY = obj.pos.y - my
      canvasDrag.mouseStartX = e.clientX
      canvasDrag.mouseStartY = e.clientY

      // 抓取时速度归零
      obj.velocity.x = 0
      obj.velocity.y = 0

      document.addEventListener('mousemove', onDocumentMouseMove)
      document.addEventListener('mouseup', onDocumentMouseUp)
      document.addEventListener('keydown', onDocumentKeyDown)
      return
    }
  }
}

function onCanvasClick(e) {
  // 如果是拖拽操作，不处理点击事件
  if (!clickOnly) return

  const rect = canvasRef.value?.getBoundingClientRect()
  if (!rect) return
  const mx = e.clientX - rect.left
  const my = e.clientY - rect.top

  // 放置模式（mousedown 时如果放置了物体，这里忽略）
  if (paletteActiveModel.value) return

  // 命中检测
  for (let i = objects.length - 1; i >= 0; i--) {
    const obj = objects[i]
    const typeModel = getModelByObject(obj)
    if (typeModel && typeModel.hitTest(obj, mx, my)) {
      selectObject(obj, typeModel.id)
      return
    }
  }

  // 点击空白取消选中
  deselectAll()
}

function onCanvasContextMenu(e) {
  e.preventDefault()
  // 右键删除：检查是否点击到物体
  const rect = canvasRef.value?.getBoundingClientRect()
  if (!rect) return
  const mx = e.clientX - rect.left
  const my = e.clientY - rect.top

  for (let i = objects.length - 1; i >= 0; i--) {
    const obj = objects[i]
    const typeModel = getModelByObject(obj)
    if (typeModel && typeModel.hitTest(obj, mx, my)) {
      selectObject(obj, typeModel.id)
      deleteSelected()
      return
    }
  }
}

// ============================================================
// 物体管理
// ============================================================
function getModelByObject(obj) {
  if (obj instanceof Ball) return getModel('ball')
  if (obj instanceof Box) return getModel('box')
  if (obj instanceof Triangle) return getModel('triangle')
  if (obj instanceof SpringMass) return getModel('spring')
  if (obj instanceof Pendulum) return getModel('pendulum')
  if (obj instanceof Ramp) return getModel('ramp')
  return null
}

function addObjectAt(x, y, modelId) {
  const model = getModel(modelId)
  if (!model) return
  const obj = model.create(x, y)
  objects.push(obj)
  // 获取响应式代理后存储原始对象，避免 Vue 深度追踪物理更新（面板通过 version 限频刷新）
  selectObject(toRaw(objects[objects.length - 1]), modelId)
}

function selectObject(obj, typeId) {
  selectedObject.value = toRaw(obj)
  selectedTypeId.value = typeId || ''
  version.value++
}

function deselectAll() {
  selectedObject.value = null
  selectedTypeId.value = ''
}

function deleteSelected() {
  if (!selectedObject.value) return
  const idx = objects.indexOf(selectedObject.value)
  if (idx !== -1) {
    objects.splice(idx, 1)
  }
  deselectAll()
}

function clearAll() {
  objects.splice(0, objects.length)
  deselectAll()
}

function resetAll() {
  for (const obj of objects) {
    obj.velocity.x = 0
    obj.velocity.y = 0
    obj.pos.x = canvasW / 2 + (Math.random() - 0.5) * 100
    obj.pos.y = 50 + Math.random() * 100
  }
}

// ============================================================
// 属性更新
// ============================================================
function updateProp(path, value) {
  if (!selectedObject.value) return
  const parts = path.split('.')
  let target = selectedObject.value
  for (let i = 0; i < parts.length - 1; i++) {
    target = target[parts[i]]
  }
  target[parts[parts.length - 1]] = value

  // 自动更新 Box 的有效半径（宽高变化时）
  if ((parts[parts.length - 1] === 'width' || parts[parts.length - 1] === 'height') && target.reactRadius !== undefined) {
    target.reactRadius = Math.max(target.width, target.height) / 2
  }

  // 单摆摆长变化时立即调整位置
  if (parts[parts.length - 1] === 'stringLength' && target instanceof Pendulum) {
    const dx = target.pos.x - target.pivotX
    const dy = target.pos.y - target.pivotY
    const dist = Math.sqrt(dx * dx + dy * dy)
    if (dist > 0.001) {
      const nx = dx / dist, ny = dy / dist
      target.pos.x = target.pivotX + nx * value
      target.pos.y = target.pivotY + ny * value
    }
  }

  version.value++
}

function round(v) {
  return Math.round(v * 100) / 100
}

// ── 斜面角度辅助 ──
function getRampAngle(obj) {
  if (!obj || !obj.width || !obj.height) return 0
  return Math.round(Math.atan2(obj.height, obj.width) * 180 / Math.PI)
}

function setRampAngle(obj, deg) {
  const rad = deg * Math.PI / 180
  const area = obj.width * obj.height
  const newH = Math.sqrt(area * Math.tan(rad))
  const newW = area / newH
  obj.width = Math.max(30, Math.round(newW / 5) * 5)
  obj.height = Math.max(10, Math.round(newH / 2) * 2)
  obj.reactRadius = Math.sqrt(obj.width ** 2 + obj.height ** 2) / 2
  version.value++
}

function updateRampDim(obj, dim, val) {
  obj[dim] = val
  obj.reactRadius = Math.sqrt(obj.width ** 2 + obj.height ** 2) / 2
  version.value++
}

function goBackLab() {
  router.push('/physics-lab')
}

// ============================================================
// 播放控制
// ============================================================
function togglePlay() {
  isPlaying.value = !isPlaying.value
  // 恢复播放时重置时间戳，避免 dt 跳变
  if (isPlaying.value) {
    lastTimestamp = performance.now()
  }
}

// ============================================================
// 物理更新
// ============================================================
// 物理更新（含选中物体面板刷新限频）
let lastPanelUpdate = 0

function updatePhysics(dt) {
  if (!isPlaying.value) return

  const selected = selectedObject.value
  let selectedUpdated = false

  for (const obj of objects) {
    // 拖拽中的物体不应用物理
    if (canvasDrag.active && canvasDrag.object === obj) continue

    // 静态物体不更新
    if (obj.isStatic) continue

    // 应用重力
    if (gravityEnabled.value) {
      obj.velocity.y += gravityStrength.value * dt
    }

    // 应用加速度
    const ax = obj.acceleration.x
    const ay = obj.acceleration.y
    obj.velocity.x += ax * dt
    obj.velocity.y += ay * dt

    // 更新位置
    obj.pos.x += obj.velocity.x * dt
    obj.pos.y += obj.velocity.y * dt

    // 速度上限（防止穿透）
    const maxSpeed = MAX_SPEED
    const spd = Math.sqrt(obj.velocity.x ** 2 + obj.velocity.y ** 2)
    if (spd > maxSpeed) {
      obj.velocity.x = (obj.velocity.x / spd) * maxSpeed
      obj.velocity.y = (obj.velocity.y / spd) * maxSpeed
    }

    // — 弹簧球：弹力 + 阻尼 —
    if (obj instanceof SpringMass) {
      const dx = obj.anchorX - obj.pos.x
      const dy = obj.anchorY - obj.pos.y
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist > 0.001) {
        const nx = dx / dist
        const ny = dy / dist
        const stretch = dist - obj.springRestLength
        const fx = obj.springK * stretch * nx
        const fy = obj.springK * stretch * ny
        obj.velocity.x += (fx / obj.mass) * dt
        obj.velocity.y += (fy / obj.mass) * dt
      }
      // 阻尼
      obj.velocity.x *= (1 - obj.springDamping * dt)
      obj.velocity.y *= (1 - obj.springDamping * dt)
    }

    // — 单摆：绳长约束 —
    if (obj instanceof Pendulum) {
      const dx = obj.pos.x - obj.pivotX
      const dy = obj.pos.y - obj.pivotY
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist > 0.001) {
        const nx = dx / dist
        const ny = dy / dist
        // 约束位置到固定绳长
        obj.pos.x = obj.pivotX + nx * obj.stringLength
        obj.pos.y = obj.pivotY + ny * obj.stringLength
        // 移除径向速度分量，保留切向
        const vn = obj.velocity.x * nx + obj.velocity.y * ny
        obj.velocity.x -= vn * nx
        obj.velocity.y -= vn * ny
      }
    }

    // 边界碰撞（只反转方向，不缩放弹性）
    const typeModel = getModelByObject(obj)
    if (typeModel && typeModel.clampToBounds) {
      typeModel.clampToBounds(obj, canvasW, canvasH)
    }

    // 应用全局边界弹性（环境属性，非物体属性）
    const halfW = obj.radius || (obj.width || 40) / 2
    const halfH = obj.radius || (obj.height || 40) / 2
    if (obj.pos.x - halfW <= 0.5 || obj.pos.x + halfW >= canvasW - 0.5) {
      obj.velocity.x *= wallRestitution.value
    }
    if (obj.pos.y - halfH <= 0.5 || obj.pos.y + halfH >= canvasH - 0.5) {
      obj.velocity.y *= floorRestitution.value
    }

    // 静止检测：贴在边界上且速度极小时归零，防止一帧内来回弹的抖动
    if (obj instanceof Ball) {
      if (obj.pos.y + obj.radius >= canvasH - 0.5 && Math.abs(obj.velocity.y) < REST_THRESHOLD) obj.velocity.y = 0
      if (obj.pos.y - obj.radius <= 0.5 && Math.abs(obj.velocity.y) < REST_THRESHOLD) obj.velocity.y = 0
      if (obj.pos.x + obj.radius >= canvasW - 0.5 && Math.abs(obj.velocity.x) < REST_THRESHOLD) obj.velocity.x = 0
      if (obj.pos.x - obj.radius <= 0.5 && Math.abs(obj.velocity.x) < REST_THRESHOLD) obj.velocity.x = 0
    } else {
      const hw = (obj.width || 40) / 2
      const hh = (obj.height || 40) / 2
      if (obj.pos.y + hh >= canvasH - 0.5 && Math.abs(obj.velocity.y) < REST_THRESHOLD) obj.velocity.y = 0
      if (obj.pos.y - hh <= 0.5 && Math.abs(obj.velocity.y) < REST_THRESHOLD) obj.velocity.y = 0
      if (obj.pos.x + hw >= canvasW - 0.5 && Math.abs(obj.velocity.x) < REST_THRESHOLD) obj.velocity.x = 0
      if (obj.pos.x - hw <= 0.5 && Math.abs(obj.velocity.x) < REST_THRESHOLD) obj.velocity.x = 0
    }

    if (!selectedUpdated && selected && toRaw(obj) === selected) {
      selectedUpdated = true
    }
  }

  // 物体间碰撞检测与响应
  // 先记录碰撞前角度，用于判断碰撞是否修改了角度
  for (const obj of objects) {
    if (toRaw(obj)?.constructor?.name === 'Box') {
      obj._preAngle = obj.angle || 0
    }
  }
  resolveCollisions()

  // ★ 角度阻尼：只有未发生碰撞吸附的 Frame 才缓慢归零
  //    记录碰撞前角度 → 碰撞后若角度没变 → 没有吸附发生 → 缓慢归零
  for (const obj of objects) {
    if (toRaw(obj)?.constructor?.name !== 'Box') continue
    if (obj.angle === 0) continue
    // 只在盒子触及地面边界时阻尼（滑下斜面到平地后自然回正）
    const r = obj.reactRadius || Math.max(obj.width, obj.height) / 2
    const onGround = obj.pos.y + r >= canvasH - 1
    if (!onGround) { delete obj._preAngle; continue }
    // 如果角度在碰撞时被吸附改了，跳过阻尼
    if (obj._preAngle !== undefined && Math.abs(obj.angle - obj._preAngle) < 0.001) {
      const spd = Math.sqrt(obj.velocity.x ** 2 + obj.velocity.y ** 2)
      if (spd < REST_THRESHOLD) {
        obj.angle *= 0.98
        if (Math.abs(obj.angle) < 0.01) obj.angle = 0
      }
    }
    delete obj._preAngle
  }

  // 限频刷新属性面板 (~5次/秒)，避免 slider 高频跳动
  if (selectedUpdated) {
    const now = performance.now()
    if (now - lastPanelUpdate > 200) {
      lastPanelUpdate = now
      version.value++
    }
  }
}

// ============================================================
// 物体碰撞检测与力学响应
// ============================================================
function resolveCollisions() {
  for (let i = 0; i < objects.length; i++) {
    for (let j = i + 1; j < objects.length; j++) {
      const a = objects[i]
      const b = objects[j]

      if (a.isStatic && b.isStatic) continue
      if ((canvasDrag.active && (canvasDrag.object === a || canvasDrag.object === b))) continue

      // 用 constructor.name 检测类型（避免 Vue reactive Proxy 干扰 instanceof）
      const ta = toRaw(a)?.constructor?.name || ''
      const tb = toRaw(b)?.constructor?.name || ''
      const aBall = ta === 'Ball' || ta === 'SpringMass' || ta === 'Pendulum'
      const bBall = tb === 'Ball' || tb === 'SpringMass' || tb === 'Pendulum'
      const aBox = ta === 'Box', bBox = tb === 'Box'
      const aTri = ta === 'Triangle' || ta === 'Ramp'
      const bTri = tb === 'Triangle' || tb === 'Ramp'

      // — 球 vs 球 —
      if (aBall && bBall) {
        collideBallBall(a, b)
      // — 球 vs 方块 —
      } else if (aBall && bBox) {
        collideBallBox(a, b)
      } else if (aBox && bBall) {
        collideBallBox(b, a)
      // — 方块 vs 方块 —
      } else if (aBox && bBox) {
        // 任一方块有旋转 → 使用包围圆近似（SAT Box-Box 暂未实现）
        if (toRaw(a).angle || toRaw(b).angle) {
          collideBoundingCircle(a, b)
        } else {
          collideBoxBox(a, b)
        }
      // — 球 vs 任意三角形（斜面/等腰） —
      } else if (aBall && bTri) {
        const verts = b.getVertices ? b.getVertices() : getTriVerts(b)
        collideBallTriangle(a, b, verts)
      } else if (aTri && bBall) {
        const verts = a.getVertices ? a.getVertices() : getTriVerts(a)
        collideBallTriangle(b, a, verts)
      // — 包围圆近似（兜底：不规则形状互碰、球 vs 不规则等） —
      } else if (aTri && bTri) {
        // 三角形 vs 三角形（SAT）
        const va = a.getVertices ? a.getVertices() : getTriVerts(a)
        const vb = b.getVertices ? b.getVertices() : getTriVerts(b)
        collideTriTriangle(a, b, va, vb)
      } else if (aBox && bTri) {
        // 方块 vs 三角形（SAT）
        const verts = b.getVertices ? b.getVertices() : getTriVerts(b)
        collideBoxTriangle(a, b, verts)
      } else if (aTri && bBox) {
        // 三角形 vs 方块（SAT）
        const verts = a.getVertices ? a.getVertices() : getTriVerts(a)
        collideBoxTriangle(b, a, verts)
      } else {
        collideBoundingCircle(a, b)
      }
    }
  }
}

/** Triangle.js 已有 getVertices()，此为兜底 */
function getTriVerts(obj) {
  const hw = (obj.width || 40) / 2
  const hh = (obj.height || 40) / 2
  return [
    { x: obj.pos.x, y: obj.pos.y - hh },
    { x: obj.pos.x - hw, y: obj.pos.y + hh },
    { x: obj.pos.x + hw, y: obj.pos.y + hh },
  ]
}

// 碰撞函数已提取到 ../physics/collision.js

// ============================================================
// 渲染
// ============================================================
function draw() {
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')

  // 清空
  ctx.clearRect(0, 0, canvasW, canvasH)

  // 网格
  if (showGrid.value) {
    drawGrid(ctx)
  }

  // 绘制所有物体
  for (const obj of objects) {
    // 选中高亮（selectedObject 存的是 raw object，需要 toRaw 比较）
    if (selectedObject.value && toRaw(obj) === selectedObject.value) {
      const typeModel = getModelByObject(obj)
      if (typeModel && typeModel.drawHighlight) {
        typeModel.drawHighlight(ctx, obj)
      }
    }
    obj.draw(ctx)
  }

  // 选中物体的标签
  if (selectedObject.value) {
    const obj = selectedObject.value
    ctx.save()
    ctx.fillStyle = '#2c3e50'
    ctx.font = '12px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(`● ${getModelName(selectedTypeId.value)}`, obj.pos.x, obj.pos.y - 30)
    ctx.restore()
  }

  // 调色板拖拽预览（在 canvas 上）
  if (paletteDrag.active) {
    const canvasRect = canvas.getBoundingClientRect()
    const cx = paletteDrag.x - canvasRect.left
    const cy = paletteDrag.y - canvasRect.top
    if (cx >= 0 && cx <= canvasW && cy >= 0 && cy <= canvasH) {
      const model = getModel(paletteDrag.modelId)
      if (model && model.drawGhost) {
        model.drawGhost(ctx, cx, cy, 0.5)
      }
    }
  }

  // 放置模式跟随鼠标
  // 注意：paletteActiveModel 时，鼠标在 canvas 上移动显示预览
  // 这个由 mousemove 在 draw 中检查处理
}

function drawGrid(ctx) {
  ctx.save()
  const gridSize = 40
  ctx.strokeStyle = 'rgba(0,0,0,0.06)'
  ctx.lineWidth = 1

  for (let x = 0; x <= canvasW; x += gridSize) {
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x, canvasH)
    ctx.stroke()
  }
  for (let y = 0; y <= canvasH; y += gridSize) {
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(canvasW, y)
    ctx.stroke()
  }

  // 画布中心十字
  ctx.strokeStyle = 'rgba(0,0,0,0.12)'
  ctx.lineWidth = 1
  ctx.setLineDash([4, 6])
  ctx.beginPath()
  ctx.moveTo(canvasW / 2, 0)
  ctx.lineTo(canvasW / 2, canvasH)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(0, canvasH / 2)
  ctx.lineTo(canvasW, canvasH / 2)
  ctx.stroke()
  ctx.setLineDash([])
  ctx.restore()
}

// ============================================================
// Canvas 鼠标在放置模式下的预览（通过绘制循环实现）
// ============================================================
let previewMouseX = -100
let previewMouseY = -100

function onCanvasMouseMove(e) {
  const rect = canvasRef.value?.getBoundingClientRect()
  if (!rect) return
  previewMouseX = e.clientX - rect.left
  previewMouseY = e.clientY - rect.top
}

// 在动画循环中额外绘制放置预览
function drawPlacementPreview(ctx) {
  if (!paletteActiveModel.value || paletteDrag.active) return

  // 只在 canvas 范围内显示
  if (previewMouseX < 0 || previewMouseX > canvasW || previewMouseY < 0 || previewMouseY > canvasH) return

  const model = getModel(paletteActiveModel.value)
  if (model && model.drawGhost) {
    model.drawGhost(ctx, previewMouseX, previewMouseY, 0.35)
    ctx.save()
    ctx.fillStyle = 'rgba(0,0,0,0.4)'
    ctx.font = '11px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('点击放置', previewMouseX, previewMouseY - 30)
    ctx.restore()
  }
}

// ============================================================
// 动画循环
// ============================================================
function animate(now) {
  const dt = Math.min(0.033, (now - lastTimestamp) / 1000)
  if (dt > 0) {
    updatePhysics(dt)
    draw()

    // 额外绘制放置预览
    if (paletteActiveModel.value) {
      const ctx = canvasRef.value?.getContext('2d')
      if (ctx) drawPlacementPreview(ctx)
    }
  }
  lastTimestamp = now
  animationId = requestAnimationFrame(animate)
}

// ============================================================
// Canvas 尺寸自适应
// ============================================================
function resizeCanvas() {
  const canvas = canvasRef.value
  const container = canvasContainerRef.value
  if (!canvas || !container) return

  const rect = container.getBoundingClientRect()
  canvasW = Math.floor(rect.width)
  canvasH = Math.floor(rect.height)
  canvas.width = canvasW
  canvas.height = canvasH
}

// ============================================================
// 生命周期
// ============================================================
onMounted(() => {
  resizeCanvas()
  window.addEventListener('resize', resizeCanvas)

  // 添加预览用的 mousemove
  const container = canvasContainerRef.value
  if (container) {
    container.addEventListener('mousemove', onCanvasMouseMove)
  }

  lastTimestamp = performance.now()
  animationId = requestAnimationFrame(animate)
})

onUnmounted(() => {
  if (animationId) {
    cancelAnimationFrame(animationId)
  }
  window.removeEventListener('resize', resizeCanvas)
  document.removeEventListener('mousemove', onDocumentMouseMove)
  document.removeEventListener('mouseup', onDocumentMouseUp)
  document.removeEventListener('keydown', onDocumentKeyDown)

  const container = canvasContainerRef.value
  if (container) {
    container.removeEventListener('mousemove', onCanvasMouseMove)
  }
})
</script>

<style scoped>
/* ========== 布局 ========== */
.sandbox-layout {
  display: flex;
  height: calc(100vh - 60px);
  overflow: hidden;
  background: #f0f2f5;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  border-radius: 12px;
  border: 1px solid #dce0e5;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  margin: 0 4px;
}

/* ========== 面板通用 ========== */
.panel {
  display: flex;
  flex-direction: column;
  background: #fff;
  border-right: 1px solid #e9ecef;
  transition: width 0.2s;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px 10px;
  border-bottom: 1px solid #e9ecef;
}

.panel-header h3 {
  margin: 0;
  font-size: 14px;
  font-weight: 700;
  color: #2c3e50;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.panel-divider {
  height: 1px;
  background: #e9ecef;
  margin: 0 12px;
}

/* ========== 调色板（左） ========== */
.panel-left {
  width: 130px;
  flex-shrink: 0;
  border-radius: 0;
}

.model-list {
  padding: 8px;
  flex: 1;
  overflow-y: auto;
}

.model-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 12px 8px;
  margin-bottom: 4px;
  border-radius: 8px;
  cursor: grab;
  transition: all 0.15s;
  user-select: none;
  border: 2px solid transparent;
}

.model-item:hover {
  background: #f0f7ff;
  border-color: #d0e4f7;
}

.model-item.active {
  background: #eaf4ff;
  border-color: #3498db;
}

.model-icon {
  font-size: 28px;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
}

.model-name {
  font-size: 12px;
  font-weight: 600;
  color: #2c3e50;
}

.model-hint {
  padding: 12px;
  font-size: 11px;
  color: #95a5a6;
  text-align: center;
  line-height: 1.5;
}

.model-hint p {
  margin: 0;
}

/* ========== 画布区域 ========== */
.canvas-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: #ffffff;
  border-radius: 8px;
  margin: 8px 8px 8px 0;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
}

.canvas-toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: #fff;
  border-bottom: 1px solid #e9ecef;
  flex-shrink: 0;
  flex-wrap: wrap;
}

.tool-back-btn {
  width: 32px;
  height: 32px;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  background: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
  color: #5a6a7a;
  flex-shrink: 0;
}

.tool-back-btn:hover {
  background: #f0f7ff;
  border-color: #3498db;
  color: #3498db;
}

.tool-title-area {
  display: flex;
  flex-direction: column;
  gap: 1px;
  margin-right: 4px;
  flex-shrink: 0;
}

.tool-title {
  font-size: 14px;
  font-weight: 700;
  color: #1a1a2e;
  line-height: 1.2;
}

.tool-subtitle {
  font-size: 11px;
  color: #95a5a6;
  line-height: 1.2;
}

.toolbar-divider {
  width: 1px;
  height: 28px;
  background: #e9ecef;
  flex-shrink: 0;
}

.tool-btn {
  width: 34px;
  height: 34px;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  background: #fff;
  cursor: pointer;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
}

.tool-btn:hover {
  background: #f0f7ff;
  border-color: #3498db;
}

/* ── 工具分组 ── */
.tool-group {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0 8px;
  border-right: 1px solid #e9ecef;
}
.tool-group:last-of-type {
  border-right: none;
}

.tool-group-label {
  font-size: 10px;
  font-weight: 700;
  color: #adb5bd;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-right: 2px;
}

/* ── 标签式按钮（重力/网格） ── */
.tool-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 5px 12px;
  border: 1.5px solid #dee2e6;
  border-radius: 20px;
  background: #fff;
  color: #6c757d;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
  user-select: none;
  white-space: nowrap;
}

.tool-chip:hover {
  border-color: #3498db;
  color: #3498db;
  background: #f0f7ff;
}

.tool-chip.active {
  border-color: #3498db;
  color: #fff;
  background: #3498db;
  box-shadow: 0 2px 8px rgba(52, 152, 219, 0.3);
}

.tool-chip.active:hover {
  background: #2980b9;
  border-color: #2980b9;
}

.tool-chip svg {
  flex-shrink: 0;
}

/* ── 选择框（墙/地） ── */
.tool-select-wrap {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #555;
  white-space: nowrap;
}

.tool-select-wrap span {
  font-weight: 600;
  min-width: 16px;
  color: #495057;
}

.tool-select-wrap select {
  padding: 4px 24px 4px 10px;
  border: 1.5px solid #dee2e6;
  border-radius: 8px;
  background: #fff url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%236c757d'/%3E%3C/svg%3E") no-repeat right 10px center;
  background-size: 10px 6px;
  color: #2c3e50;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  outline: none;
  transition: all 0.15s;
  -webkit-appearance: none;
  appearance: none;
  min-width: 118px;
}

.tool-select-wrap select:hover {
  border-color: #3498db;
}

.tool-select-wrap select:focus {
  border-color: #3498db;
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.15);
}

/* ── 重力强度滑条 ── */
.gravity-slider-wrap {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.gravity-slider {
  width: 60px;
  height: 4px;
  cursor: pointer;
  accent-color: #3498db;
}

.gravity-val {
  font-size: 11px;
  font-weight: 700;
  color: #3498db;
  font-family: var(--mono, monospace);
  min-width: 30px;
  text-align: right;
}

.gravity-unit {
  font-size: 10px;
  color: #95a5a6;
  font-weight: 600;
}

.tool-status {
  margin-left: auto;
  font-size: 12px;
  color: #95a5a6;
  white-space: nowrap;
}

.placement-hint {
  color: #e67e22;
  font-weight: 600;
}

.canvas-container {
  flex: 1;
  position: relative;
  overflow: hidden;
}

.canvas-container canvas {
  display: block;
  width: 100%;
  height: 100%;
  background: #fafbfc;
  cursor: crosshair;
}

.placement-overlay {
  position: absolute;
  bottom: 16px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.75);
  color: #fff;
  padding: 8px 20px;
  border-radius: 20px;
  font-size: 13px;
  pointer-events: none;
  white-space: nowrap;
  animation: fade-in 0.3s;
}

@keyframes fade-in {
  from { opacity: 0; transform: translateX(-50%) translateY(8px); }
  to { opacity: 1; transform: translateX(-50%) translateY(0); }
}

/* ========== 浮动属性面板（悬浮在画布上方） ========== */
.float-panel {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 310px;
  max-height: calc(100% - 24px);
  background: #ffffff;
  border: 1px solid #d0d4d8;
  border-radius: 12px;
  box-shadow: 0 12px 42px rgba(0, 0, 0, 0.25), 0 2px 8px rgba(0, 0, 0, 0.08);
  z-index: 10;
  overflow: hidden;

  display: flex;
  flex-direction: column;
  animation: panel-in 0.2s ease-out;
  backdrop-filter: blur(2px);
}

@keyframes panel-in {
  from { opacity: 0; transform: translateY(-8px) scale(0.97); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

.float-panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px 12px;
  border-bottom: 1px solid #e8eaed;
  cursor: default;
  background: linear-gradient(135deg, #fafbfc 0%, #ffffff 100%);
  position: relative;
}

.float-panel-header::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: var(--primary-gradient, linear-gradient(135deg, #c0392b, #e74c3c));
  border-radius: 3px 3px 0 0;
}

.float-panel-title {
  font-size: 14px;
  font-weight: 700;
  color: #1a1a2e;
  letter-spacing: 0.3px;
}

.float-panel-body {
  overflow-y: auto;
  max-height: calc(100vh - 200px);
  padding: 2px 0 6px;
}

.float-panel-body::-webkit-scrollbar {
  width: 5px;
}

.float-panel-body::-webkit-scrollbar-thumb {
  background: #d0d4d8;
  border-radius: 10px;
}

.close-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 18px;
  color: #95a5a6;
  padding: 4px 8px;
  border-radius: 6px;
  line-height: 1;
  transition: all 0.15s;
}

.close-btn:hover {
  background: #fef0f0;
  color: #e74c3c;
}

.prop-section {
  padding: 12px 16px;
  border-bottom: 1px solid #f0f2f4;
}

.prop-section:last-of-type {
  border-bottom: none;
}

.prop-section-title {
  font-size: 11px;
  font-weight: 700;
  color: #8e96a3;
  text-transform: uppercase;
  letter-spacing: 0.6px;
  margin-bottom: 10px;
}

.prop-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.prop-row label {
  width: 46px;
  font-size: 12px;
  font-weight: 600;
  color: #4a5568;
  flex-shrink: 0;
}

.prop-row input[type="number"] {
  flex: 1;
  padding: 5px 8px;
  border: 1px solid #e2e6ea;
  border-radius: 6px;
  font-size: 12px;
  outline: none;
  transition: border-color 0.15s, box-shadow 0.15s;
  background: #fafbfc;
}

.prop-row input[type="number"]:focus {
  border-color: #3498db;
  box-shadow: 0 0 0 2.5px rgba(52, 152, 219, 0.15);
  background: #fff;
}

/* 与拖动条并排的窄数字输入 */
.prop-row input[type="number"].range-number {
  flex: none;
  width: 62px;
  text-align: center;
}

.prop-row input[type="range"] {
  flex: 1;
  height: 4px;
  cursor: pointer;
}

.range-val {
  font-size: 11px;
  color: #777;
  min-width: 28px;
  text-align: right;
}

.prop-toggle {
  gap: 0;
}

.prop-toggle label {
  width: auto;
  margin-right: auto;
}

.prop-toggle input[type="checkbox"] {
  margin: 0;
}

.prop-row input[type="color"] {
  width: 30px;
  height: 26px;
  padding: 1px;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  cursor: pointer;
}

.color-val {
  font-size: 11px;
  color: #777;
  font-family: monospace;
}

.delete-btn {
  display: block;
  width: calc(100% - 32px);
  margin: 16px;
  padding: 10px;
  border: 1.5px solid #e74c3c;
  border-radius: 8px;
  background: #fff;
  color: #e74c3c;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s;
  letter-spacing: 0.3px;
}

.delete-btn:hover {
  background: #e74c3c;
  color: #fff;
  box-shadow: 0 4px 14px rgba(231, 76, 60, 0.35);
}

.no-selection {
  padding: 40px 20px;
  text-align: center;
  color: #95a5a6;
  font-size: 13px;
}

.no-selection p {
  margin: 0;
}

/* ========== 拖拽幽灵 ========== */
.drag-ghost {
  position: fixed;
  pointer-events: none;
  z-index: 9999;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  font-size: 12px;
  font-weight: 600;
  color: #2c3e50;
  opacity: 0.85;
}

.drag-ghost span:first-child {
  font-size: 32px;
}

/* ========== 属性说明卡 ========== */
.prop-legend {
  max-width: 1000px;
  margin: 20px auto 32px;
  padding: 20px 28px;
  background: rgba(255, 255, 255, 0.55);
  border: 1px solid rgba(192, 57, 43, 0.25);
  border-radius: 12px;
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
}

.legend-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 700;
  color: #000;
  margin-bottom: 14px;
  padding-bottom: 10px;
  border-bottom: 1px solid rgba(192, 57, 43, 0.2);
}

.legend-header svg {
  color: #c0392b;
}

.legend-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 8px 24px;
}

.legend-item {
  display: flex;
  flex-direction: column;
  gap: 1px;
  padding: 6px 10px;
  border-radius: 6px;
  transition: background 0.15s;
}

.legend-item:hover {
  background: rgba(192, 57, 43, 0.06);
}

.legend-tag {
  font-size: 12px;
  font-weight: 700;
  color: #000;
  font-family: var(--mono, ui-monospace, monospace);
}

.legend-desc {
  font-size: 11px;
  color: #333;
  line-height: 1.4;
}
</style>
