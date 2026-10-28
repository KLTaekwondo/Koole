import { computed, reactive } from "vue"
import { MATH_LEVELS } from "../../Levels/math/mathLevels.js"

const STORAGE_KEY = "koole_math_level_progress_v1"

function makeDefaultProgress() {
    return Object.fromEntries(MATH_LEVELS.map((level, index) => [level.id, {
        unlocked: index === 0,
        completed: false,
        bestScore: 0,
        bestDifference: null,
        attempts: 0,
        completedAt: null,
    }]))
}

function readProgress() {
    const defaults = makeDefaultProgress()
    try {
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null")
        if (!saved || typeof saved !== "object") return defaults
        MATH_LEVELS.forEach((level, index) => {
            if (saved[level.id] && typeof saved[level.id] === "object") {
                defaults[level.id] = { ...defaults[level.id], ...saved[level.id] }
            }
            if (index === 0) defaults[level.id].unlocked = true
        })
    } catch {
        return defaults
    }
    return defaults
}

const progress = reactive(readProgress())

function persist() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
    } catch {
        // localStorage 不可用时仍保留本次会话进度。
    }
}

function unlockNext(levelId) {
    const index = MATH_LEVELS.findIndex(level => level.id === levelId)
    const next = MATH_LEVELS[index + 1]
    if (next && progress[next.id]) progress[next.id].unlocked = true
}

export function useMathLevelProgress() {
    const completedCount = computed(() => MATH_LEVELS.filter(level => progress[level.id].completed).length)
    const firstIncomplete = computed(() => MATH_LEVELS.find(level => !progress[level.id].completed && progress[level.id].unlocked) || MATH_LEVELS[0])

    function getProgress(levelId) {
        return progress[levelId]
    }

    function isUnlocked(levelId) {
        return Boolean(progress[levelId]?.unlocked)
    }

    function recordAttempt(levelId) {
        if (progress[levelId]) progress[levelId].attempts += 1
        persist()
    }

    function completeLevel(levelId, result) {
        const entry = progress[levelId]
        if (!entry || !result?.success) return
        entry.completed = true
        entry.unlocked = true
        entry.bestScore = Math.max(entry.bestScore, result.score || 0)
        entry.bestDifference = entry.bestDifference === null
            ? result.difference
            : Math.min(entry.bestDifference, result.difference)
        entry.completedAt = new Date().toISOString()
        unlockNext(levelId)
        persist()
    }

    function resetProgress() {
        const defaults = makeDefaultProgress()
        Object.keys(progress).forEach(levelId => delete progress[levelId])
        Object.assign(progress, defaults)
        persist()
    }

    return { progress, completedCount, firstIncomplete, getProgress, isUnlocked, recordAttempt, completeLevel, resetProgress }
}
