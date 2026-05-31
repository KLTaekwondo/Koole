<template>
  <div class="comparison-panel" v-if="trails.length > 0">
    <!-- 标题栏 -->
    <div class="panel-header" @click="expanded = !expanded">
      <div class="header-left">
        <svg class="toggle-icon" :class="{ rotated: expanded }" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
        <span class="header-title">对比记录</span>
        <span class="record-count">{{ trails.length }}</span>
      </div>
      <button class="clear-btn" @click.stop="$emit('clearAll')" title="清空全部">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
      </button>
    </div>

    <!-- 展开内容 -->
    <div class="panel-body" v-show="expanded">
      <!-- 记录列表（标题下方） -->
      <div class="record-list">
        <div
          v-for="(trail, index) in trails"
          :key="index"
          class="record-item"
          :class="{ selected: selectedIndex === index }"
          @click="selectedIndex = index"
        >
          <div class="record-left">
            <input
              type="checkbox"
              :checked="trail.visible"
              @click.stop="$emit('toggleVisibility', index)"
              class="vis-checkbox"
            />
            <span class="color-dot" :style="{ background: trail.color }"></span>
            <span class="record-label">{{ trail.label }}</span>
          </div>
          <div class="record-right">
            <span class="param-hint" :title="trail.paramLabel">{{ trail.paramLabel }}</span>
            <button class="delete-btn" @click.stop="$emit('removeRecord', index)" title="删除">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
        </div>
      </div>

      <!-- 图表 + 数据 -->
      <div class="detail-area">
        <!-- ECharts 轨迹对比图 -->
        <div class="chart-container" ref="chartRef"></div>

        <!-- 关键数据卡片 -->
        <div class="data-cards" v-if="selectedTrail">
          <div class="cards-title">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
            <span>{{ selectedTrail.label }} · 关键数据</span>
          </div>
          <div class="cards-grid">
            <div
              v-for="(value, key) in selectedTrail.resultData"
              :key="key"
              class="data-card"
            >
              <div class="card-label">{{ key }}</div>
              <div class="card-value">{{ value }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from "vue"

const props = defineProps({
  trails: { type: Array, default: () => [] },
})

const emit = defineEmits(["clearAll", "removeRecord", "toggleVisibility"])

const expanded = ref(true)
const selectedIndex = ref(0)
const chartRef = ref(null)
let chartInstance = null

const selectedTrail = computed(() => {
  return props.trails[selectedIndex.value] || null
})

// 确保 selectedIndex 在范围内
watch(() => props.trails.length, (len) => {
  if (selectedIndex.value >= len) {
    selectedIndex.value = Math.max(0, len - 1)
  }
})

// ECharts 初始化
onMounted(async () => {
  await nextTick()
  if (chartRef.value) {
    const echarts = await import("echarts")
    chartInstance = echarts.init(chartRef.value)
    updateChart()

    // 监听容器大小变化
    const resizeObserver = new ResizeObserver(() => {
      chartInstance?.resize()
    })
    resizeObserver.observe(chartRef.value)

    onBeforeUnmount(() => {
      resizeObserver.disconnect()
      chartInstance?.dispose()
      chartInstance = null
    })
  }
})

// 更新图表
function updateChart() {
  if (!chartInstance) return
  const visibleTrails = props.trails.filter(t => t.visible)
  if (visibleTrails.length === 0) {
    chartInstance.clear()
    return
  }

  const series = visibleTrails.map(trail => ({
    name: trail.label,
    type: "line",
    data: trail.trail.map(p => [p.x, p.y]),
    lineStyle: { width: 2, color: trail.color },
    itemStyle: { color: trail.color },
    symbol: "none",
    smooth: false,
  }))

  chartInstance.setOption({
    grid: { top: 30, right: 20, bottom: 30, left: 50 },
    tooltip: {
      trigger: "axis",
      formatter: (params) => {
        if (!params.length) return ""
        let html = `<b>${params[0].seriesName}</b><br/>`
        html += `x: ${params[0].value[0].toFixed(2)} m<br/>`
        html += `y: ${params[0].value[1].toFixed(2)} m`
        return html
      },
    },
    legend: {
      top: 4,
      right: 10,
      textStyle: { fontSize: 11, color: "#999" },
    },
    xAxis: {
      type: "value",
      name: "x (m)",
      nameTextStyle: { fontSize: 11, color: "#999" },
      axisLabel: { fontSize: 10, color: "#999" },
      splitLine: { lineStyle: { color: "rgba(0,0,0,0.06)" } },
    },
    yAxis: {
      type: "value",
      name: "y (m)",
      nameTextStyle: { fontSize: 11, color: "#999" },
      axisLabel: { fontSize: 10, color: "#999" },
      splitLine: { lineStyle: { color: "rgba(0,0,0,0.06)" } },
    },
    series,
  }, true)
}

// 监听 trails 变化更新图表
watch(() => props.trails, () => {
  nextTick(() => updateChart())
}, { deep: true })
</script>

<style scoped>
.comparison-panel {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  overflow: hidden;
  flex-shrink: 0;
  max-height: 50vh;
  overflow-y: auto;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  cursor: pointer;
  user-select: none;
  border-bottom: 1px solid var(--border);
}

.panel-header:hover {
  background: var(--bg-card-hover);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.toggle-icon {
  transition: transform 0.2s;
  color: var(--text-muted);
}

.toggle-icon.rotated {
  transform: rotate(90deg);
}

.header-title {
  font-size: 13px;
  font-weight: 700;
  color: var(--text);
}

.record-count {
  font-size: 11px;
  font-weight: 700;
  color: var(--primary);
  background: var(--primary-light);
  padding: 1px 7px;
  border-radius: 10px;
}

.clear-btn {
  display: flex;
  align-items: center;
  padding: 4px;
  border: none;
  border-radius: var(--radius);
  background: transparent;
  color: var(--text-muted);
  cursor: pointer;
  transition: var(--transition);
}

.clear-btn:hover {
  background: rgba(231, 76, 60, 0.1);
  color: #e74c3c;
}

/* ── 记录列表（标题下方）── */
.record-list {
  display: flex;
  gap: 4px;
  padding: 8px 10px;
  border-bottom: 1px solid var(--border);
  overflow-x: auto;
  flex-shrink: 0;
}

/* ── 详情区域 ── */
.detail-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 240px;
  max-height: 360px;
}

.record-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  border-radius: var(--radius);
  cursor: pointer;
  transition: var(--transition);
  border: 1px solid var(--border);
  background: var(--bg-card);
  white-space: nowrap;
  flex-shrink: 0;
}

.record-item:hover {
  border-color: var(--primary);
  background: var(--primary-light);
}

.record-item.selected {
  border-color: var(--primary);
  background: var(--primary);
  color: white;
}

.record-item.selected .record-label {
  color: white;
}

.record-item.selected .param-hint {
  color: rgba(255, 255, 255, 0.8);
}

.record-left {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.vis-checkbox {
  width: 14px;
  height: 14px;
  cursor: pointer;
  accent-color: var(--primary);
}

.color-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}

.record-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--text);
  white-space: nowrap;
}

.record-right {
  display: flex;
  align-items: center;
  gap: 6px;
}

.param-hint {
  font-size: 11px;
  color: var(--text-muted);
  max-width: 80px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.delete-btn {
  display: flex;
  align-items: center;
  padding: 2px;
  border: none;
  border-radius: var(--radius);
  background: transparent;
  color: var(--text-muted);
  cursor: pointer;
  opacity: 0;
  transition: var(--transition);
}

.record-item:hover .delete-btn {
  opacity: 1;
}

.delete-btn:hover {
  background: rgba(231, 76, 60, 0.1);
  color: #e74c3c;
}


.chart-container {
  flex: 1;
  min-height: 200px;
}

/* ── 数据卡片 ── */
.data-cards {
  border-top: 1px solid var(--border);
  padding: 12px 14px;
}

.cards-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 700;
  color: var(--primary);
  margin-bottom: 10px;
}

.cards-title svg {
  flex-shrink: 0;
  opacity: 0.7;
}

.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 8px;
}

.data-card {
  background: var(--bg-card-hover);
  border: 1px solid var(--border);
  border-left: 3px solid var(--primary);
  border-radius: var(--radius);
  padding: 10px 12px;
  transition: var(--transition);
}

.data-card:hover {
  border-color: var(--primary);
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.1);
}

.card-label {
  font-size: 11px;
  font-weight: 600;
  color: var(--text-muted);
  margin-bottom: 4px;
}

.card-value {
  font-size: 14px;
  font-weight: 700;
  color: var(--text);
  font-variant-numeric: tabular-nums;
  font-family: var(--mono);
}

/* ── 响应式 ── */
@media (max-width: 640px) {
  .comparison-content {
    flex-direction: column;
  }
  .record-list {
    width: 100%;
    border-right: none;
    border-bottom: 1px solid var(--border);
    max-height: 120px;
  }
}
</style>
