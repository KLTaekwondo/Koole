<template>
  <div class="sandbox-page">
    <!-- 全屏无限画布 -->
    <div class="canvas-container" ref="canvasContainerRef">
        <canvas ref="canvasRef" @mousedown="onCanvasMouseDown" @click="onCanvasClick" @contextmenu.prevent="onCanvasContextMenu"></canvas>

        <!-- 即时操作（左上角悬浮小胶囊） -->
        <div class="quick-toolbar">
          <button class="tool-back-btn" @click="goBackLab" title="返回实验室">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
          </button>
          <span class="toolbar-divider"></span>
          <button class="tool-btn" @click="togglePlay" :title="isPlaying ? '暂停' : '播放'">
            <span v-if="isPlaying">⏸</span>
            <span v-else>▶</span>
          </button>
          <button class="tool-btn" @click="stepOnce" :disabled="isPlaying" title="暂停时单步推进 1/60 秒">▸|</button>
          <button v-if="activePreset" class="tool-btn" @click="restorePreset" title="恢复实验初始状态">↺</button>
          <button class="tool-btn" @click="resetAll" title="重置物体位置">⟳</button>
          <button class="tool-btn" @click="clearAll" title="清空所有物体">✕</button>
          <span class="toolbar-divider"></span>
          <button class="tool-btn" @click="resetView" title="复位视图">⌂</button>
          <button v-if="selectedObject" class="tool-btn" @click="focusSelected" title="居中选中物体">◎</button>
        </div>

        <!-- 状态栏（左上角工具栏下方） -->
        <div class="sandbox-status">
          {{ objects.length }} 个物体 · {{ Math.round(camera.scale * 100) }}%
          <span v-if="paletteActiveModel" class="placement-hint">· 点击画布放置{{ getModelName(paletteActiveModel) }}</span>
        </div>

        <!-- 放置预览 -->
        <div
          v-if="paletteActiveModel && !paletteDrag.active"
          class="placement-overlay"
        >
          <span>点击画布放置「{{ getModelName(paletteActiveModel) }}」，按 Esc 取消</span>
        </div>

        <!-- 浮动属性面板（悬浮在画布上方，不影响画布布局） -->
        <div v-if="selectedObject" class="float-panel">
          <!-- 隐藏依赖：panelRefreshTick 变化时触发面板重渲染，实时显示 raw 物体最新值；元素不重建，输入焦点不丢失 -->
          <span style="display:none">{{ panelRefreshTick }}</span>
          <div class="float-panel-header">
            <span class="float-panel-title">属性 · {{ getModelName(selectedTypeId) }}</span>
            <button class="close-btn" @click="deselectAll" title="关闭">✕</button>
          </div>
          <div class="float-panel-body">
            <div class="prop-section live-data-section">
              <div class="prop-section-title">实时数据</div>
              <div class="live-data-grid">
                <span>时间</span><b>{{ elapsedTime.toFixed(2) }} s</b>
                <span>位置</span><b>({{ round(selectedObject.pos.x) }}, {{ round(selectedObject.pos.y) }}) px</b>
                <span>速度</span><b>({{ round(selectedObject.velocity.x) }}, {{ round(selectedObject.velocity.y) }}) px/s</b>
                <span>速率</span><b>{{ round(getSelectedSpeed()) }} px/s</b>
              </div>
            </div>
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

        <!-- 底部胶囊工具栏（大分类入口） -->
        <div class="capsule-toolbar">
          <button class="tool-chip tab-chip" :class="{ active: activeToolPanel === 'experiments' }" @click="togglePanel('experiments')">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 3h6"/><path d="M10 3v6l-5 9a2 2 0 0 0 1.8 3h10.4a2 2 0 0 0 1.8-3l-5-9V3"/><line x1="8" y1="15" x2="16" y2="15"/></svg>
            实验
          </button>
          <button class="tool-chip tab-chip" :class="{ active: activeToolPanel === 'model' }" @click="togglePanel('model')">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
            模型
          </button>
          <button class="tool-chip tab-chip" :class="{ active: activeToolPanel === 'settings' }" @click="togglePanel('settings')">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/></svg>
            设置
          </button>
        </div>

        <!-- 实验预设面板 -->
        <div v-if="activeToolPanel === 'experiments'" class="tool-panel experiment-panel">
          <button
            v-for="preset in SANDBOX_PRESETS"
            :key="preset.id"
            class="preset-item"
            :class="{ active: activePreset?.id === preset.id }"
            :title="preset.description"
            @click="requestLoadPreset(preset)"
          >
            <b>{{ preset.name }}</b>
            <span>{{ preset.description }}</span>
          </button>
        </div>

        <!-- 模型选择面板（点"模型"展开） -->
        <div v-if="activeToolPanel === 'model'" class="tool-panel model-panel">
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

        <!-- 设置面板（点"设置"展开） -->
        <div v-if="activeToolPanel === 'settings'" class="tool-panel settings-panel">
          <div class="settings-row">
            <button class="tool-chip" :class="{ active: gravityEnabled }" @click="gravityEnabled = !gravityEnabled">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></svg>
              重力
            </button>
            <span class="gravity-slider-wrap" title="重力加速度 (px/s²)">
              <input type="range" v-model.number="gravityStrength" min="0" max="2000" step="50" class="gravity-slider" />
              <span class="gravity-val">{{ gravityStrength }}</span>
            </span>
          </div>
          <div class="settings-row">
            <button class="tool-chip" :class="{ active: showGrid }" @click="showGrid = !showGrid">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/></svg>
              网格
            </button>
            <label class="tool-select-wrap">
              <span>地面弹性</span>
              <select v-model.number="floorRestitution">
                <option :value="1.0">完全弹性</option>
                <option :value="0.0">完全非弹性</option>
              </select>
            </label>
          </div>
          <div class="settings-row">
            <button class="tool-chip" :class="{ active: showLegend }" @click="showLegend = !showLegend">属性说明</button>
            <label class="tool-select-wrap">
              <span>播放速度</span>
              <select v-model.number="timeScale">
                <option :value="0.5">0.5x</option>
                <option :value="1">1x</option>
                <option :value="2">2x</option>
              </select>
            </label>
          </div>
        </div>
      </div>

    <ConfirmDialog ref="confirmDialogRef" />

    <!-- 调色板拖拽幽灵 -->
    <div
      v-if="paletteDrag.active"
      class="drag-ghost"
      :style="{ left: paletteDrag.x + 'px', top: paletteDrag.y + 'px' }"
    >
      <span v-html="paletteDrag.icon"></span>
      <span>{{ paletteDrag.name }}</span>
    </div>

    <!-- 属性说明卡（浮层，胶囊 "?" 按钮切换显示） -->
  <div class="prop-legend" v-if="showLegend">
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
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import ConfirmDialog from '../components/ConfirmDialog.vue'
import { theme } from '../stores/theme.js'
import { GRAVITY, DEFAULT_FLOOR_RESTITUTION, GROUND_Y } from '../constants/physics.js'
import { MODEL_TYPES, getModelName } from '../physics/sandbox/modelRegistry.js'
import { stepSandboxWorld } from '../physics/sandbox/world.js'
import { drawSandbox } from '../physics/sandbox/renderer.js'
import { useSandboxObjects } from '../composables/sandbox/useSandboxObjects.js'
import { useSandboxProperties } from '../composables/sandbox/useSandboxProperties.js'
import { useSandboxPaletteDrag } from '../composables/sandbox/useSandboxPaletteDrag.js'
import { useSandboxCanvasInteraction } from '../composables/sandbox/useSandboxCanvasInteraction.js'
import { useSandboxLoop } from '../composables/sandbox/useSandboxLoop.js'
import { SANDBOX_PRESETS } from '../physics/sandbox/presets.js'

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
const panelRefreshTick = ref(0)          // 属性面板刷新信号（模板读取它建立依赖，见 float-panel）
const activePreset = ref(null)            // 当前加载的标准实验配置
const timeScale = ref(1)                  // 播放时间倍率
const elapsedTime = ref(0)                // 当前实验运行时间（秒）
const confirmDialogRef = ref(null)

// 无限画布视口相机（左上角世界坐标 + 缩放）
const camera = reactive({ x: 0, y: 0, scale: 1 })

// 地面弹性（无限画布地面线，竖直方向）
const floorRestitution = ref(DEFAULT_FLOOR_RESTITUTION)

// 调色板拖拽状态
const paletteDrag = reactive({ active: false, x: 0, y: 0, modelId: '', icon: '', name: '' })

// Canvas 拖拽状态 / 纯点击标记 / 拖拽类型记录：已移入 useSandboxCanvasInteraction

// DOM refs
const canvasRef = ref(null)
const canvasContainerRef = ref(null)

// 属性说明浮层（右下角，胶囊 "?" 按钮切换）
const showLegend = ref(true)

// 底部胶囊大分类面板（'' 收起 / 'model' / 'settings'）
const activeToolPanel = ref('')
function togglePanel(name) {
  activeToolPanel.value = activeToolPanel.value === name ? '' : name
}

// Canvas 尺寸
let canvasW = 800
let canvasH = 600

// ============================================================
// 组合式函数：对象管理 / 属性更新
// ============================================================
const { addObjectAt, loadPreset, selectObject, deselectAll, deleteSelected, clearAll, resetAll } = useSandboxObjects({
  objects,
  selectedObject,
  selectedTypeId,
  onSelectionChanged: () => { panelRefreshTick.value++ },
  getCanvasSize: () => ({ width: canvasW, height: canvasH }),
  camera,
  groundY: GROUND_Y,
})

const { updateProp, getRampAngle, setRampAngle, updateRampDim, round } = useSandboxProperties({
  selectedObject,
  onUpdated: () => { panelRefreshTick.value++ },
})

const { onPaletteMouseDown, cleanupPaletteDrag } = useSandboxPaletteDrag({
  paletteActiveModel,
  paletteDrag,
  camera,
  canvasRef,
  getCanvasSize: () => ({ width: canvasW, height: canvasH }),
  onDrop: addObjectAt,
})

const {
  onCanvasMouseDown,
  onCanvasClick,
  onCanvasContextMenu,
  onCanvasMouseMove,
  onCanvasWheel,
  canvasDrag,
  getPreviewMouse,
  cleanupCanvasInteraction,
} = useSandboxCanvasInteraction({
  objects,
  paletteActiveModel,
  camera,
  canvasRef,
  onAddObject: addObjectAt,
  onSelect: selectObject,
  onDeselect: deselectAll,
  onDelete: deleteSelected,
})

// 首次 resize 时自适应相机：让地面贴视口底部可见（一次性）
let initialCameraSet = false

const { resetTimestamp, start: startLoop, cleanup: cleanupLoop } = useSandboxLoop({
  canvasRef,
  canvasContainerRef,
  onFrame: (dt) => { updatePhysics(dt); draw() },
  onResize: (width, height) => {
    canvasW = width
    canvasH = height
    if (!initialCameraSet) {
      initialCameraSet = true
      camera.y = Math.max(0, height - GROUND_Y - 48)
    }
  },
})

// ============================================================
// 交互与状态管理：已抽离到 useSandboxObjects / useSandboxProperties /
// useSandboxPaletteDrag / useSandboxCanvasInteraction / useSandboxLoop
// ============================================================

function goBackLab() {
  router.push('/physics-lab')
}

// ============================================================
// 视图控制（无限画布）
// ============================================================
function resetView() {
  camera.x = 0
  camera.y = 0
  camera.scale = 1
}

function focusSelected() {
  const obj = selectedObject.value
  if (!obj) return
  camera.x = obj.pos.x - canvasW / 2 / camera.scale
  camera.y = obj.pos.y - canvasH / 2 / camera.scale
}

function applyPreset(preset) {
  loadPreset(preset)
  activePreset.value = preset
  gravityEnabled.value = preset.environment.gravityEnabled
  gravityStrength.value = preset.environment.gravityStrength
  floorRestitution.value = preset.environment.floorRestitution
  elapsedTime.value = 0
  isPlaying.value = false
  camera.scale = preset.camera.scale
  camera.x = preset.camera.centerX - canvasW / 2 / camera.scale
  camera.y = preset.camera.centerY - canvasH / 2 / camera.scale
  panelRefreshTick.value++
}

async function requestLoadPreset(preset) {
  if (objects.length) {
    const confirmed = await confirmDialogRef.value?.show(
      `加载「${preset.name}」会清空当前场景中的 ${objects.length} 个物体。`,
      '替换当前场景',
      '加载实验',
    )
    if (!confirmed) return
  }
  applyPreset(preset)
  activeToolPanel.value = ''
}

function restorePreset() {
  if (activePreset.value) applyPreset(activePreset.value)
}

function getSelectedSpeed() {
  const velocity = selectedObject.value?.velocity
  if (!velocity) return 0
  return Math.sqrt(velocity.x ** 2 + velocity.y ** 2)
}

// ============================================================
// 播放控制
// ============================================================
function togglePlay() {
  isPlaying.value = !isPlaying.value
  // 恢复播放时重置时间戳，避免 dt 跳变（时间戳由 useSandboxLoop 管理）
  if (isPlaying.value) {
    resetTimestamp()
  }
}

// ============================================================
// 物理更新
// ============================================================
// 物理更新（含选中物体面板刷新限频）
let lastPanelUpdate = 0

let stepRequested = false

function stepOnce() {
  if (isPlaying.value) return
  stepRequested = true
  updatePhysics(1 / 60)
  elapsedTime.value += 1 / 60
  draw()
  panelRefreshTick.value++
}

function updatePhysics(dt) {
  const isSingleStep = stepRequested
  const physicsDt = isSingleStep ? 1 / 60 : dt * timeScale.value
  const selectedUpdated = stepSandboxWorld(objects, physicsDt, {
    isPlaying: isPlaying.value || isSingleStep,
    gravityEnabled: gravityEnabled.value,
    gravityStrength: gravityStrength.value,
    groundY: GROUND_Y,
    floorRestitution: floorRestitution.value,
    draggedObject: canvasDrag.active ? canvasDrag.object : null,
    selectedObject: selectedObject.value,
  })
  stepRequested = false
  if (isPlaying.value) elapsedTime.value += physicsDt

  if (selectedUpdated) {
    const now = performance.now()
    if (now - lastPanelUpdate > 200) {
      lastPanelUpdate = now
      panelRefreshTick.value++
    }
  }
  return selectedUpdated
}

// ============================================================
// Canvas 渲染
// ============================================================
function draw() {
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  drawSandbox(ctx, canvas, {
    width: canvasW,
    height: canvasH,
    camera,
    theme: theme.value,
    objects,
    selectedObject: selectedObject.value,
    selectedTypeId: selectedTypeId.value,
    showGrid: showGrid.value,
    paletteDrag,
    paletteActiveModel: paletteActiveModel.value,
    previewMouse: getPreviewMouse(),
  })
}

// ============================================================
// 生命周期
// ============================================================
onMounted(() => {
  // 启动动画循环（内部完成尺寸初始化与 resize 监听）
  startLoop()

  // 添加预览用的 mousemove
  const container = canvasContainerRef.value
  if (container) {
    container.addEventListener('mousemove', onCanvasMouseMove)
  }

  // 滚轮缩放绑定在 canvas 元素上（不劫持属性面板等 float 面板的滚动），passive:false 以便 preventDefault
  const canvas = canvasRef.value
  if (canvas) {
    canvas.addEventListener('wheel', onCanvasWheel, { passive: false })
  }
})

onUnmounted(() => {
  // 清理动画循环 / resize 监听，以及拖拽期间注册的 document 监听
  cleanupLoop()
  cleanupPaletteDrag()
  cleanupCanvasInteraction()

  const container = canvasContainerRef.value
  if (container) {
    container.removeEventListener('mousemove', onCanvasMouseMove)
  }

  const canvas = canvasRef.value
  if (canvas) {
    canvas.removeEventListener('wheel', onCanvasWheel)
  }
})
</script>

<style scoped>
/* ========== 全屏无限画布 ========== */
.sandbox-page {
  width: 100%;
  /* 高度 = 视口 - 导航栏(var)；
     负 margin 抵消 main-content 的上下 padding(32px×2)，让画布从导航栏下贴满到视口底部 */
  height: calc(100vh - var(--nav-height));
  margin: -32px 0;
  position: relative;
  overflow: hidden;
  background: #f0f2f5;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* ========== 模型选择面板 ========== */
.model-panel .model-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 6px 8px;
  border-radius: 10px;
  cursor: grab;
  transition: all 0.15s;
  user-select: none;
  border: 2px solid transparent;
  min-width: 48px;
}

.model-panel .model-item:hover {
  background: #f0f7ff;
  border-color: #d0e4f7;
}

.model-panel .model-item.active {
  background: #eaf4ff;
  border-color: #3498db;
}

.model-panel .model-icon {
  font-size: 22px;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
}

.model-panel .model-name {
  font-size: 10px;
  font-weight: 600;
  color: #2c3e50;
  white-space: nowrap;
}

/* ========== 底部胶囊工具栏（大分类入口） ========== */
.capsule-toolbar {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  bottom: 40px;
  z-index: 20;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  background: rgba(255, 255, 255, 0.85);
  border: 1px solid rgba(255, 255, 255, 0.7);
  border-radius: 999px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.16), 0 2px 8px rgba(0, 0, 0, 0.06);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  user-select: none;
}

/* 大分类 tab */
.tab-chip {
  padding: 7px 18px;
  font-size: 13px;
}

/* 展开面板（模型 / 设置，胶囊上方弹出） */
.tool-panel {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  bottom: 100px;
  z-index: 19;
  padding: 12px;
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid rgba(255, 255, 255, 0.7);
  border-radius: 18px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.16), 0 2px 8px rgba(0, 0, 0, 0.06);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  animation: legend-in 0.18s;
}

.model-panel {
  display: flex;
  gap: 6px;
}

.experiment-panel {
  display: grid;
  grid-template-columns: repeat(2, minmax(180px, 240px));
  gap: 8px;
}

.preset-item {
  display: grid;
  gap: 3px;
  padding: 10px 12px;
  border: 1px solid #dce2e8;
  border-radius: 8px;
  background: #fff;
  color: #2c3e50;
  text-align: left;
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s;
}

.preset-item:hover,
.preset-item.active {
  border-color: #3498db;
  background: #f0f7ff;
}

.preset-item b { font-size: 13px; }
.preset-item span { color: #7f8c8d; font-size: 11px; line-height: 1.45; }

.settings-panel {
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 280px;
}

.settings-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* ========== 即时操作（左上角悬浮小胶囊） ========== */
.quick-toolbar {
  position: absolute;
  top: 12px;
  left: 12px;
  z-index: 20;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 10px;
  background: rgba(255, 255, 255, 0.85);
  border: 1px solid rgba(255, 255, 255, 0.7);
  border-radius: 999px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12), 0 1px 4px rgba(0, 0, 0, 0.04);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.quick-toolbar .tool-btn {
  border-radius: 50%;
  background: #fff;
}

.quick-toolbar .toolbar-divider {
  height: 24px;
}

/* 状态栏（左上角工具栏下方） */
.sandbox-status {
  position: absolute;
  top: 66px;
  left: 16px;
  z-index: 19;
  padding: 4px 12px;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 12px;
  font-size: 12px;
  color: #95a5a6;
  white-space: nowrap;
  backdrop-filter: blur(6px);
  pointer-events: none;
}

.tool-back-btn {
  width: 32px;
  height: 32px;
  border: 1px solid #dee2e6;
  border-radius: 50%;
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

.tool-btn:disabled {
  cursor: not-allowed;
  opacity: 0.4;
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
  background: #fff url("../assets/icons/select-arrow.svg") no-repeat right 10px center;
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

.placement-hint {
  color: #e67e22;
  font-weight: 600;
}

.canvas-container {
  position: absolute;
  inset: 0;
  overflow: hidden; /* ⚠ 保护属性：不要删除，画布交互依赖 */
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
  bottom: 180px; /* 展开面板上方 */
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

.live-data-section { background: #f8fbff; }

.live-data-grid {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 5px 10px;
  padding: 0 16px 10px;
  font-size: 11px;
}

.live-data-grid span { color: #7f8c8d; }
.live-data-grid b { color: #2c3e50; font-family: var(--mono, monospace); font-weight: 600; text-align: right; }

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

/* ========== 属性说明卡（右下角浮层，胶囊 "?" 切换） ========== */
.prop-legend {
  position: fixed;
  right: 16px;
  bottom: 112px;
  z-index: 15;
  width: 380px;
  max-height: calc(100vh - 140px);
  overflow-y: auto;
  padding: 16px 20px;
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid rgba(192, 57, 43, 0.25);
  border-radius: 16px;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  animation: legend-in 0.2s;
}

@keyframes legend-in {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
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
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
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

/* ========== 深色模式适配 ========== */
:root[data-theme="dark"] .sandbox-page {
  background: var(--bg);
}

:root[data-theme="dark"] .canvas-container canvas {
  background: #14181f;
}

/* 悬浮胶囊 / 面板 / 状态 */
:root[data-theme="dark"] .capsule-toolbar,
:root[data-theme="dark"] .quick-toolbar,
:root[data-theme="dark"] .tool-panel,
:root[data-theme="dark"] .sandbox-status {
  background: rgba(28, 32, 40, 0.88);
  border-color: rgba(255, 255, 255, 0.08);
}

:root[data-theme="dark"] .toolbar-divider {
  background: #3a3f47;
}

:root[data-theme="dark"] .tool-btn,
:root[data-theme="dark"] .tool-back-btn {
  background: #262b33;
  border-color: #3a3f47;
  color: #d8dde3;
}

:root[data-theme="dark"] .tool-chip {
  background: #262b33;
  border-color: #3a3f47;
  color: #aab2bd;
}

:root[data-theme="dark"] .tool-select-wrap select {
  background-color: #262b33;
  color: #e0e0e0;
}

:root[data-theme="dark"] .tool-select-wrap span {
  color: #aab2bd;
}

:root[data-theme="dark"] .model-panel .model-name {
  color: #e0e0e0;
}

:root[data-theme="dark"] .model-panel .model-item:hover {
  background: rgba(52, 152, 219, 0.15);
  border-color: rgba(52, 152, 219, 0.35);
}

:root[data-theme="dark"] .model-panel .model-item.active {
  background: rgba(52, 152, 219, 0.22);
  border-color: #3498db;
}

:root[data-theme="dark"] .preset-item {
  background: #262b33;
  border-color: #3a414c;
  color: #e8e8e8;
}

:root[data-theme="dark"] .preset-item:hover,
:root[data-theme="dark"] .preset-item.active {
  background: rgba(52, 152, 219, 0.18);
  border-color: #3498db;
}

:root[data-theme="dark"] .preset-item span { color: #a0a8b4; }

:root[data-theme="dark"] .sandbox-status {
  color: #8a93a0;
}

/* 浮动属性面板 */
:root[data-theme="dark"] .float-panel {
  background: #1e232b;
  border-color: #333a44;
}

:root[data-theme="dark"] .float-panel-header {
  background: linear-gradient(135deg, #22272f 0%, #1e232b 100%);
}

:root[data-theme="dark"] .float-panel-title {
  color: #e8e8e8;
}

:root[data-theme="dark"] .prop-section {
  border-bottom-color: #2a2f37;
}

:root[data-theme="dark"] .live-data-section { background: #202832; }
:root[data-theme="dark"] .live-data-grid span { color: #8f9aa8; }
:root[data-theme="dark"] .live-data-grid b { color: #d8dde3; }

:root[data-theme="dark"] .prop-row label {
  color: #a0a8b4;
}

:root[data-theme="dark"] .prop-row input[type="number"] {
  background: #262b33;
  border-color: #3a3f47;
  color: #d8dde3;
}

:root[data-theme="dark"] .prop-row input[type="number"]:focus {
  background: #2a3038;
}

:root[data-theme="dark"] .range-val {
  color: #a0a0a0;
}

:root[data-theme="dark"] .delete-btn {
  background: #262b33;
}

/* 属性说明卡 */
:root[data-theme="dark"] .prop-legend {
  background: rgba(28, 32, 40, 0.92);
}

:root[data-theme="dark"] .legend-header,
:root[data-theme="dark"] .legend-tag {
  color: #e8e8e8;
}

:root[data-theme="dark"] .legend-desc {
  color: #b0b8c2;
}

/* 拖拽幽灵文字 */
:root[data-theme="dark"] .drag-ghost {
  color: #e0e0e0;
}
</style>
