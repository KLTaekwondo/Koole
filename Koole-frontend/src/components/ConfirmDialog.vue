<template>
    <Teleport to="body">
        <transition name="confirm">
            <div v-if="visible" class="confirm-overlay" @click.self="handleCancel">
                <div class="confirm-dialog">
                    <div class="confirm-icon">
                        <SvgIcon name="alert-circle" :size="28" />
                    </div>
                    <h3 class="confirm-title">{{ title }}</h3>
                    <p class="confirm-message">{{ message }}</p>
                    <div class="confirm-actions">
                        <button class="confirm-cancel-btn" @click="handleCancel">取消</button>
                        <button class="confirm-ok-btn" @click="handleConfirm">{{ confirmText }}</button>
                    </div>
                </div>
            </div>
        </transition>
    </Teleport>
</template>

<script setup>
import { ref } from "vue"
import SvgIcon from "./SvgIcon.vue"

const visible = ref(false)
const title = ref("确认操作")
const message = ref("")
const confirmText = ref("确定")
let resolvePromise = null

const show = (msg, ttl, okText = "确定") => {
    title.value = ttl || "确认操作"
    message.value = msg
    confirmText.value = okText
    visible.value = true
    return new Promise((resolve) => {
        resolvePromise = resolve
    })
}

const handleConfirm = () => {
    visible.value = false
    resolvePromise?.(true)
    resolvePromise = null
}

const handleCancel = () => {
    visible.value = false
    resolvePromise?.(false)
    resolvePromise = null
}

defineExpose({ show })
</script>

<style scoped>
.confirm-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.4);
    backdrop-filter: blur(4px);
    -webkit-backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
}

.confirm-dialog {
    background: var(--bg-card);
    border-radius: var(--radius-lg);
    padding: 32px;
    width: 380px;
    max-width: 90vw;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
    text-align: center;
}

.confirm-icon {
    margin-bottom: 16px;
}

.confirm-title {
    font-size: 18px;
    font-weight: 700;
    color: var(--text-dark);
    margin: 0 0 8px;
}

.confirm-message {
    font-size: 14px;
    color: var(--text-secondary);
    line-height: 1.6;
    margin: 0 0 28px;
}

.confirm-actions {
    display: flex;
    gap: 12px;
    justify-content: center;
}

.confirm-cancel-btn {
    padding: 10px 24px;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    background: var(--bg-card);
    color: var(--text-secondary);
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: var(--transition);
    flex: 1;
}

.confirm-cancel-btn:hover {
    border-color: var(--text-muted);
    color: var(--text);
}

.confirm-ok-btn {
    padding: 10px 24px;
    border: none;
    border-radius: var(--radius);
    background: #e74c3c;
    color: #fff;
    font-size: 14px;
    font-weight: 700;
    cursor: pointer;
    transition: var(--transition);
    flex: 1;
    box-shadow: 0 4px 12px rgba(231, 76, 60, 0.3);
}

.confirm-ok-btn:hover {
    background: #c0392b;
    transform: translateY(-1px);
    box-shadow: 0 6px 16px rgba(231, 76, 60, 0.4);
}

/* Transition */
.confirm-enter-active,
.confirm-leave-active {
    transition: opacity 0.25s ease;
}

.confirm-enter-active .confirm-dialog,
.confirm-leave-active .confirm-dialog {
    transition: transform 0.25s ease;
}

.confirm-enter-from,
.confirm-leave-to {
    opacity: 0;
}

.confirm-enter-from .confirm-dialog {
    transform: scale(0.9);
}

.confirm-leave-to .confirm-dialog {
    transform: scale(0.9);
}
</style>
