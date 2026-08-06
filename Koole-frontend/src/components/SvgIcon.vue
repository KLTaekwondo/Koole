<template>
    <span
        class="svg-icon"
        :style="{ '--icon-url': `url(${ICONS[name]})`, width: `${size}px`, height: `${size}px` }"
        aria-hidden="true"
    ></span>
</template>

<script setup>
import { ICONS } from "../constants/icons.js"

defineProps({
    name: { type: String, required: true },
    size: { type: [Number, String], default: 16 },
})
</script>

<style scoped>
.svg-icon {
    display: inline-block;
    flex-shrink: 0;
    background-color: currentColor;
    -webkit-mask: var(--icon-url) center / contain no-repeat;
    mask: var(--icon-url) center / contain no-repeat;
}
</style>
