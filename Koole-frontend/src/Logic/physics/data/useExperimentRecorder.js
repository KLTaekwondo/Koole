/**
 * 实验记录器（组合式）
 *
 * 把采样器接到模拟循环上：
 *   - 每一步 tick：按 20Hz 采样
 *   - 结算：可终止模型等 isFinished，不可终止模型等时间窗口
 *   - 手动：随时 recordNow()
 *
 * 只依赖 state / params / simTime，和渲染层完全解耦。
 */

import { computed, ref, watch } from "vue"
import { createExperimentSampler } from "./sampler.mjs"
import { addRun } from "../../../stores/experiments.js"

export function useExperimentRecorder(modelRef, simState) {
  const autoRecord = ref(true)
  const lastRecord = ref(null)
  const stats = ref({ duration: 0, points: 0, segments: 0 })
  const recordedCount = ref(0)

  let sampler = null
  let lastStatsAt = 0

  const hasDataSpec = computed(() => Boolean(modelRef.value?.dataSpec))

  const createFor = (model) => {
    if (!model?.dataSpec) {
      sampler = null
      return
    }
    sampler = createExperimentSampler(model.dataSpec, { modelId: model.id, modelName: model.name })
    stats.value = { duration: 0, points: 0, segments: 0 }
    recordedCount.value = 0
  }

  watch(() => modelRef.value?.id, () => createFor(modelRef.value), { immediate: true })

  const syncStats = () => {
    if (!sampler) return
    const buffered = sampler.buffered()
    stats.value = {
      duration: Number(buffered.duration.toFixed(1)),
      points: buffered.points,
      segments: buffered.autoSegments,
    }
  }

  const save = (record) => {
    if (!record) return null
    const saved = addRun(record)
    lastRecord.value = saved
    recordedCount.value += 1
    syncStats()
    return saved
  }

  /** 每个模拟步调用；返回结算出来的记录（如果有） */
  const tick = (isFinished = false) => {
    if (!sampler || !simState.state) return null

    const { state, params, simTime } = simState
    sampler.tick({ state, params, simTime })

    // 统计信息限频更新，避免每帧都触发 Vue 渲染
    if (simTime - lastStatsAt >= 0.2) {
      lastStatsAt = simTime
      syncStats()
    }

    if (!autoRecord.value) return null
    const trigger = sampler.shouldSettle({ simTime, isFinished })
    if (!trigger) return null
    return save(sampler.settle({ state, params, simTime, trigger }))
  }

  /** 模拟自然结束时调用 */
  const onFinished = () => {
    if (!sampler || !autoRecord.value) return null
    if (sampler.settleMode !== "finish") return null
    return save(sampler.settle({
      state: simState.state,
      params: simState.params,
      simTime: simState.simTime,
      trigger: "finish",
    }))
  }

  /** 手动记录（series 记当前片段，snapshot 记当前参数下的结果） */
  const recordNow = () => {
    if (!sampler || !simState.state) return null
    return save(sampler.settle({
      state: simState.state,
      params: simState.params,
      simTime: simState.simTime,
      trigger: "manual",
    }))
  }

  /** 参数变化后重置采样缓冲（snapshot 模型用） */
  const resetBuffer = () => {
    sampler?.reset(simState.simTime)
    syncStats()
  }

  return {
    autoRecord,
    lastRecord,
    stats,
    recordedCount,
    hasDataSpec,
    settleMode: computed(() => sampler?.settleMode || null),
    kind: computed(() => sampler?.kind || null),
    tick,
    onFinished,
    recordNow,
    resetBuffer,
  }
}
