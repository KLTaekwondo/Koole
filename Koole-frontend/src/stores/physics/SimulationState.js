// ── 模拟统一状态层 ──
// 把散落在各模块的 params / state / trail / recordedTrails 统一管理
// 所有模块通过 simState 读写，不再互相传闭包

import { ref, reactive, toRef } from "vue"

export function createSimulationState() {
  const simState = reactive({
    modelId: null,
    params: {},
    state: null,
    trail: [],
    simTime: 0,
    running: false,
  })

  const running = toRef(simState, 'running')
  const recordedTrails = ref([])

  // ── 参数工具 ──
  function setParamsFromModel(model) {
    if (!model) { simState.params = {}; return }
    const obj = {}
    model.params.forEach(p => { obj[p.key] = p.value })
    simState.params = obj
  }

  function displayParamValue(param) {
    if (param.options) {
      const opt = param.options.find(o => o.value === param.value)
      return opt ? opt.label : param.value
    }
    const v = param.value
    return Number.isInteger(v) ? v : v.toFixed(1)
  }

  // ── 轨迹录制 ──
  const TRAIL_COLORS = [
    "#3498db", "#e74c3c", "#2ecc71", "#f39c12",
    "#9b59b6", "#1abc9c", "#e67e22", "#34495e",
  ]
  const MAX_RECORDS = 10
  let simCounter = 0

  function makeParamLabel(params) {
    return Object.entries(params)
      .filter(([key]) => !["gravity"].includes(key))
      .slice(0, 2)
      .map(([key, value]) => `${key}=${Number.isInteger(value) ? value : value.toFixed(1)}`)
      .join(", ")
  }

  function extractResultData(model, state, params, simTime) {
    if (!model || !state) return {}
    const lines = model.getInfoLines(state, params, simTime)
    const result = {}
    for (const line of lines) {
      const colonIdx = line.indexOf(":")
      if (colonIdx > 0) {
        result[line.substring(0, colonIdx).trim()] = line.substring(colonIdx + 1).trim()
      }
    }
    return result
  }

  function recordCurrentTrail(model, simTime) {
    if (!simState.state || !model) return
    simCounter++
    const trailData = {
      simNumber: simCounter,
      modelId: model.id,
      params: { ...simState.params },
      label: `模拟${simCounter}`,
      paramLabel: makeParamValue(simState.params),
      trail: [...(simState.state.trail || [])],
      visible: true,
      color: TRAIL_COLORS[(simCounter - 1) % TRAIL_COLORS.length],
      resultData: extractResultData(model, simState.state, simState.params, simTime),
    }
    // 模型自定义图表定义
    if (model.chartDefs) trailData.chartDefs = model.chartDefs
    // 事件记录
    if (simState.state.events) trailData.events = [...simState.state.events]
    if (simState.state.trail2) trailData.trail2 = [...simState.state.trail2]
    if (simState.state.trailB) trailData.trailB = [...simState.state.trailB]
    recordedTrails.value.push(trailData)
    if (recordedTrails.value.length > MAX_RECORDS) {
      recordedTrails.value.splice(0, recordedTrails.value.length - MAX_RECORDS)
    }
  }

  function clearRecords() {
    recordedTrails.value = []
  }

  function removeRecord(index) {
    recordedTrails.value.splice(index, 1)
  }

  function toggleTrailVisibility(index) {
    if (recordedTrails.value[index]) {
      recordedTrails.value[index].visible = !recordedTrails.value[index].visible
    }
  }

  function resetCounter() {
    simCounter = 0
  }

  return {
    simState,
    running,
    recordedTrails,
    setParamsFromModel,
    displayParamValue,
    recordCurrentTrail,
    clearRecords,
    removeRecord,
    toggleTrailVisibility,
    resetCounter,
    extractResultData,
    makeParamLabel,
  }
}

// makeParamLabel 的别名，内部用
function makeParamValue(params) {
  return Object.entries(params)
    .filter(([key]) => !["gravity"].includes(key))
    .slice(0, 2)
    .map(([key, value]) => `${key}=${Number.isInteger(value) ? value : value.toFixed(1)}`)
    .join(", ")
}
