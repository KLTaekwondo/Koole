// 学习进度：探索记录 + 最近浏览。
// 只存「谁知道什么」这类轻量元数据（模型 id、时间），不存参数和轨迹；
// 关卡进度仍由 Logic/{physics,math}/levelProgress.js 各自持久化。
import { computed, reactive } from "vue"

const STORAGE_KEY = "koole_learning_v1"
const RECENT_LIMIT = 8

function makeDefaultState() {
    return {
        version: 1,
        explored: {}, // modelId -> { at: ISO 时间 }
        recent: [],   // 最近浏览的 modelId，新的在前
    }
}

function readState() {
    const defaults = makeDefaultState()
    try {
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null")
        if (!saved || typeof saved !== "object") return defaults
        if (saved.explored && typeof saved.explored === "object") {
            for (const [id, entry] of Object.entries(saved.explored)) {
                if (typeof id !== "string" || !entry || typeof entry !== "object") continue
                defaults.explored[id] = { at: typeof entry.at === "string" ? entry.at : null }
            }
        }
        if (Array.isArray(saved.recent)) {
            defaults.recent = saved.recent.filter(id => typeof id === "string").slice(0, RECENT_LIMIT)
        }
    } catch {
        return defaults
    }
    return defaults
}

const state = reactive(readState())

function persist() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
        // localStorage 不可用时只保留本次会话
    }
}

export function useLearning() {
    const exploredCount = computed(() => Object.keys(state.explored).length)
    const recentIds = computed(() => state.recent)

    function isExplored(id) {
        return Boolean(id && state.explored[id])
    }

    function exploredAt(id) {
        return state.explored[id]?.at || null
    }

    /** 探索任务完成时调用；重复完成不覆盖第一次的时间 */
    function markExplored(id) {
        if (!id || state.explored[id]) return
        state.explored[id] = { at: new Date().toISOString() }
        persist()
    }

    /** 打开模型时调用，记录「最近浏览」 */
    function markVisited(id) {
        if (!id) return
        state.recent = [id, ...state.recent.filter(item => item !== id)].slice(0, RECENT_LIMIT)
        persist()
    }

    /** 清空探索记录与最近浏览（关卡进度不动） */
    function resetLearning() {
        Object.keys(state.explored).forEach(id => delete state.explored[id])
        state.recent = []
        persist()
    }

    return { state, exploredCount, recentIds, isExplored, exploredAt, markExplored, markVisited, resetLearning }
}
