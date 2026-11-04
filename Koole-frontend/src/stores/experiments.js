/**
 * 实验记录存储（纯内存）
 *
 * 不落盘：记录只活在这一次要用的会话里，刷新或关标签页就清空。
 * 这样做的好处是没有配额、没有版本迁移、没有多标签页互相覆盖；
 * 需要长期保留时，用「导出」存成文件即可（后续在面板里加）。
 */

import { computed, ref } from "vue"

export const MAX_PER_MODEL = 20

/** 记录颜色：在创建时定死，之后排序、删除都不会让老记录换色 */
export const COLOR_PALETTE = ["#3b82f6", "#e67e22", "#10b981", "#8b5cf6", "#ef4444", "#14b8a6"]

/** 全会话共享一份记录；按 modelId 分组，切换模型不会丢 */
export const runs = ref([])

/** 某个模型的记录（新的在前） */
export function runsOf(modelId) {
  return computed(() => runs.value.filter(run => run.modelId === modelId).slice().reverse())
}

export function addRun(run) {
  if (!run) return null
  const sameModel = runs.value.filter(item => item.modelId === run.modelId)

  // 同模型超限：先去掉最旧的那条
  if (sameModel.length >= MAX_PER_MODEL) {
    const oldest = sameModel.reduce((a, b) => (a.createdAt <= b.createdAt ? a : b))
    runs.value = runs.value.filter(item => item.id !== oldest.id)
  }

  const seq = sameModel.length + 1
  const record = { ...run, label: run.label || `模拟 ${seq}` }
  runs.value = [...runs.value, record]
  return record
}

export function removeRun(id) {
  runs.value = runs.value.filter(run => run.id !== id)
}

export function renameRun(id, label) {
  runs.value = runs.value.map(run => (
    run.id === id ? { ...run, label: String(label || "").slice(0, 24) } : run
  ))
}

export function clearModelRuns(modelId) {
  runs.value = runs.value.filter(run => run.modelId !== modelId)
}

export function clearAllRuns() {
  runs.value = []
}
