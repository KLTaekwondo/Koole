<template>
    <teleport to="body">
        <div class="toast-container">
            <transition-group name="toast-slide">
                <div
                    v-for="toast in toasts"
                    :key="toast.id"
                    class="toast-item"
                    :class="toast.type"
                >
                    <div class="toast-icon">
                        <!-- success -->
                        <svg v-if="toast.type === 'success'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                        <!-- error -->
                        <svg v-else-if="toast.type === 'error'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
                        <!-- warning -->
                        <svg v-else-if="toast.type === 'warning'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                        <!-- info / default -->
                        <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                    </div>
                    <span class="toast-msg">{{ toast.message }}</span>
                    <button class="toast-close" @click="remove(toast.id)">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    </button>
                </div>
            </transition-group>
        </div>
    </teleport>
</template>

<script setup>
import { computed } from "vue"
import { toastState, removeToast } from "../stores/toast.js"

const toasts = computed(() => toastState.value)

const remove = (id) => {
    removeToast(id)
}
</script>

<style scoped>
.toast-container {
    position: fixed;
    top: calc(var(--nav-height) + 12px);
    right: 16px;
    z-index: 9999;
    display: flex;
    flex-direction: column;
    gap: 8px;
    pointer-events: none;
}

.toast-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 14px 16px;
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-hover);
    min-width: 300px;
    max-width: 420px;
    pointer-events: auto;
    position: relative;
    overflow: hidden;
}

.toast-item::before {
    content: "";
    position: absolute;
    left: 0;
    top: 0;
    width: 3px;
    height: 100%;
}

.toast-icon {
    flex-shrink: 0;
    display: flex;
    align-items: center;
}

.toast-msg {
    flex: 1;
    font-size: 14px;
    font-weight: 500;
    line-height: 1.4;
}

.toast-close {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    border: none;
    border-radius: 50%;
    background: transparent;
    cursor: pointer;
    opacity: 0.5;
    transition: var(--transition);
    padding: 0;
    color: inherit;
}

.toast-close:hover {
    opacity: 1;
    background: rgba(0, 0, 0, 0.08);
}

/* ── Types ── */
.toast-item.success {
    background: #ebfaf0;
    color: #1a7d36;
    border: 1px solid #b8e6c8;
}

.toast-item.success::before {
    background: #27ae60;
}

.toast-item.success .toast-icon {
    color: #27ae60;
}

.toast-item.error {
    background: #fef2f0;
    color: #b3402e;
    border: 1px solid #f5c6bb;
}

.toast-item.error::before {
    background: var(--primary);
}

.toast-item.error .toast-icon {
    color: var(--primary);
}

.toast-item.warning {
    background: #fef9e7;
    color: #8a6d1b;
    border: 1px solid #f9e79f;
}

.toast-item.warning::before {
    background: #f1c40f;
}

.toast-item.warning .toast-icon {
    color: #f39c12;
}

.toast-item.info {
    background: #eaf2f8;
    color: #1a5276;
    border: 1px solid #aed6f1;
}

.toast-item.info::before {
    background: #3498db;
}

.toast-item.info .toast-icon {
    color: #3498db;
}

/* ── Animation ── */
.toast-slide-enter-active {
    animation: toastIn 0.35s var(--ease-out);
}

.toast-slide-leave-active {
    animation: toastOut 0.25s ease-in;
}

@keyframes toastIn {
    from {
        opacity: 0;
        transform: translateX(60px) scale(0.92);
    }
    to {
        opacity: 1;
        transform: translateX(0) scale(1);
    }
}

@keyframes toastOut {
    from {
        opacity: 1;
        transform: translateX(0) scale(1);
    }
    to {
        opacity: 0;
        transform: translateX(60px) scale(0.92);
    }
}
</style>
