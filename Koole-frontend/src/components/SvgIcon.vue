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
    /* mask 用长属性分开写，避免简写与 CSS 变量组合时解析失效 */
    -webkit-mask-image: var(--icon-url);
    -webkit-mask-position: center;
    -webkit-mask-size: contain;
    -webkit-mask-repeat: no-repeat;
    mask-image: var(--icon-url);
    mask-position: center;
    mask-size: contain;
    mask-repeat: no-repeat;
}
</style>
