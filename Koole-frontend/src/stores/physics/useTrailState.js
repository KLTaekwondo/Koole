import { ref } from "vue"

/**
 * 共享的对比记录状态
 * ClassicModelView 写入，ClassicPhysicsLayout 读取并渲染 ComparisonPanel
 */
const recordedTrails = ref([])

export function useTrailState() {
  const clearRecords = () => {
    recordedTrails.value = []
  }

  const removeRecord = (index) => {
    recordedTrails.value.splice(index, 1)
  }

  const toggleTrailVisibility = (index) => {
    if (recordedTrails.value[index]) {
      recordedTrails.value[index].visible = !recordedTrails.value[index].visible
    }
  }

  return {
    recordedTrails,
    clearRecords,
    removeRecord,
    toggleTrailVisibility,
  }
}
