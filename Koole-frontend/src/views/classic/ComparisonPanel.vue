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
        <!-- 模型自定义图表组 -->
        <div class="charts-grid" v-if="chartDefs.length > 0">
          <div
            v-for="(def, ci) in chartDefs"
            :key="ci"
            class="chart-container"
            :ref="el => setChartRef(el, ci)"
          ></div>
        </div>
        <!-- 无 chartDefs 时的回退 -->
        <div v-else class="chart-container" ref="fallbackChartRef"></div>

        <!-- 事件标记 -->
        <div class="events-bar" v-if="selectedTrail && selectedTrail.events && selectedTrail.events.length > 0">
          <div class="event-tag" v-for="(ev, i) in selectedTrail.events" :key="i">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            <span>{{ ev.label }} · {{ ev.time.toFixed(2) }}s</span>
          </div>
        </div>

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
const chartRefs = ref({})
const fallbackChartRef = ref(null)
const chartInstances = ref({})

function setChartRef(el, index) {
  if (el) {
    chartRefs.value[index] = el
  } else {
    delete chartRefs.value[index]
  }
}

const selectedTrail = computed(() => {
  return props.trails[selectedIndex.value] || null
})

// 从选中轨迹获取 chartDefs
const chartDefs = computed(() => {
  const trail = selectedTrail.value
  if (!trail || !trail.chartDefs) return []
  return trail.chartDefs
})

// 确保 selectedIndex 在范围内
watch(() => props.trails.length, (len) => {
  if (selectedIndex.value >= len) {
    selectedIndex.value = Math.max(0, len - 1)
  }
})

// 初始化/销毁图表
async function initCharts() {
  const echarts = await import("echarts")

  // 销毁旧实例
  Object.values(chartInstances.value).forEach(c => c?.dispose())
  chartInstances.value = {}

  const defs = chartDefs.value
  if (defs.length === 0) {
    // 回退：单个 x-y 图
    if (fallbackChartRef.value) {
      chartInstances.value[0] = echarts.init(fallbackChartRef.value)
    }
    return
  }

  defs.forEach((_, i) => {
    const el = chartRefs.value[i]
    if (el) {
      chartInstances.value[i] = echarts.init(el)
    }
  })
}

function getThemeColors() {
  const isDark = document.documentElement.getAttribute("data-theme") === "dark"
  return {
    text: isDark ? "#aaa" : "#999",
    title: isDark ? "#ccc" : "#666",
    grid: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
    bg: isDark ? "#242424" : "#fff",
  }
}

function updateCharts() {
  const defs = chartDefs.value
  const visibleTrails = props.trails.filter(t => t.visible)
  const tc = getThemeColors()

  if (defs.length === 0) {
    // 回退模式
    const inst = chartInstances.value[0]
    if (!inst) return
    if (visibleTrails.length === 0) { inst.clear(); return }
    const series = visibleTrails.map(trail => ({
      name: trail.label,
      type: "line",
      data: trail.trail.map(p => [p.x, p.y]),
      lineStyle: { width: 2, color: trail.color },
      itemStyle: { color: trail.color },
      symbol: "none",
    }))
    inst.setOption({
      backgroundColor: tc.bg,
      grid: { top: 30, right: 20, bottom: 30, left: 50 },
      tooltip: { trigger: "axis" },
      legend: { top: 4, right: 10, textStyle: { fontSize: 11, color: tc.text } },
      xAxis: { type: "value", name: "x (m)", nameTextStyle: { fontSize: 11, color: tc.text }, axisLabel: { fontSize: 10, color: tc.text }, splitLine: { lineStyle: { color: tc.grid } } },
      yAxis: { type: "value", name: "y (m)", nameTextStyle: { fontSize: 11, color: tc.text }, axisLabel: { fontSize: 10, color: tc.text }, splitLine: { lineStyle: { color: tc.grid } } },
      series,
    }, true)
    return
  }

  // 模型自定义图表
  defs.forEach((def, ci) => {
    const inst = chartInstances.value[ci]
    if (!inst) return
    if (visibleTrails.length === 0) { inst.clear(); return }

    const series = []
    visibleTrails.forEach(trail => {
      const seriesDefs = def.getData(trail.trail, trail.params || {})
      seriesDefs.forEach(sd => {
        series.push({
          name: `${trail.label} · ${sd.name}`,
          type: "line",
          data: sd.data,
          lineStyle: {
            width: 2,
            color: sd.color || trail.color,
            type: sd.lineStyle === "dashed" ? "dashed" : "solid",
          },
          itemStyle: { color: sd.color || trail.color },
          symbol: "none",
        })
      })
    })

    inst.setOption({
      backgroundColor: tc.bg,
      title: { text: def.title, left: "center", top: 4, textStyle: { fontSize: 13, fontWeight: 600, color: tc.title } },
      grid: { top: 35, right: 16, bottom: 30, left: 50 },
      tooltip: { trigger: "axis" },
      legend: { top: 4, right: 10, textStyle: { fontSize: 10, color: tc.text } },
      xAxis: {
        type: "value",
        name: def.xLabel,
        nameTextStyle: { fontSize: 11, color: tc.text },
        axisLabel: { fontSize: 10, color: tc.text },
        splitLine: { lineStyle: { color: tc.grid } },
      },
      yAxis: {
        type: "value",
        name: def.yLabel,
        nameTextStyle: { fontSize: 11, color: tc.text },
        axisLabel: { fontSize: 10, color: tc.text },
        splitLine: { lineStyle: { color: tc.grid } },
      },
      series,
    }, true)
  })
}

// 监听变化
watch([() => props.trails, chartDefs], async () => {
  await nextTick()
  await initCharts()
  updateCharts()
}, { deep: true })

watch(selectedIndex, async () => {
  await nextTick()
  await initCharts()
  updateCharts()
})

onMounted(async () => {
  await nextTick()
  await initCharts()
  updateCharts()

  // ResizeObserver
  const observer = new ResizeObserver(() => {
    Object.values(chartInstances.value).forEach(c => c?.resize())
  })
  Object.values(chartRefs.value).forEach(el => el && observer.observe(el))
  if (fallbackChartRef.value) observer.observe(fallbackChartRef.value)

  // 监听主题变化
  const themeObserver = new MutationObserver(() => {
    updateCharts()
  })
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] })

  onBeforeUnmount(() => {
    observer.disconnect()
    themeObserver.disconnect()
    Object.values(chartInstances.value).forEach(c => c?.dispose())
  })
})
</script>

<style scoped>
.comparison-panel {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  overflow: hidden;
  flex-shrink: 0;
  height: auto;
  scrollbar-width: none;
  overflow-y: auto;
}

.comparison-panel::-webkit-scrollbar {
  display: none;
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
  max-height: 420px;
}

/* ── 图表网格 ── */
.charts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 0;
  border-bottom: 1px solid var(--border);
}

.charts-grid .chart-container {
  min-height: 200px;
  border-right: 1px solid var(--border);
}

.charts-grid .chart-container:last-child {
  border-right: none;
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

/* ── 事件标记 ── */
.events-bar {
  display: flex;
  gap: 8px;
  padding: 8px 14px;
  border-bottom: 1px solid var(--border);
  flex-wrap: wrap;
}

.event-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 10px;
  background: rgba(46, 204, 113, 0.1);
  border: 1px solid rgba(46, 204, 113, 0.3);
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  color: #2ecc71;
}

.event-tag svg {
  flex-shrink: 0;
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
  .charts-grid {
    grid-template-columns: 1fr;
  }
  .charts-grid .chart-container {
    border-right: none;
    border-bottom: 1px solid var(--border);
  }
  .record-list {
    width: 100%;
    border-right: none;
    border-bottom: 1px solid var(--border);
    max-height: 120px;
  }
}
</style>
