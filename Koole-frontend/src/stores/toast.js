import { ref } from "vue"

const toastState = ref([])
let nextId = 1

/**
 * 显示一个 toast 通知
 * @param {string} message - 提示内容
 * @param {'success'|'error'|'warning'|'info'} type - 类型
 * @param {number} duration - 自动关闭时间（ms），0 表示不自动关闭
 */
function showToast(message, type = "info", duration = 3000) {
    const id = nextId++
    toastState.value.push({ id, message, type })

    if (duration > 0) {
        setTimeout(() => {
            removeToast(id)
        }, duration)
    }
}

function removeToast(id) {
    toastState.value = toastState.value.filter((t) => t.id !== id)
}

function success(msg, duration) {
    showToast(msg, "success", duration)
}

function error(msg, duration) {
    showToast(msg, "error", duration)
}

function warning(msg, duration) {
    showToast(msg, "warning", duration)
}

function info(msg, duration) {
    showToast(msg, "info", duration)
}

export { toastState, showToast, removeToast, success, error, warning, info }
