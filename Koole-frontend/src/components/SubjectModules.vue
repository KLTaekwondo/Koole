<template>
    <section class="modules-section" :style="{ '--subject': accent }">
        <header class="section-heading">
            <div>
                <small>{{ kicker }}</small>
                <h2>{{ title }}</h2>
            </div>
            <p>{{ description }}</p>
        </header>
        <div class="module-grid">
            <article class="module-item" v-for="(item, index) in items" :key="item.name">
                <small class="module-number">{{ String(index + 1).padStart(2, "0") }}</small>
                <h3>{{ item.name }}</h3>
                <p>{{ item.desc }}</p>
                <span class="module-status">IN DEVELOPMENT</span>
            </article>
        </div>
    </section>
</template>

<script setup>
defineProps({
    kicker: { type: String, default: "" },
    title: { type: String, default: "" },
    description: { type: String, default: "" },
    items: { type: Array, default: () => [] },
    accent: { type: String, default: "#477cdb" },
})
</script>

<style scoped>
.modules-section {
    width: 100vw;
    margin-left: calc(50% - 50vw);
    padding: 104px max(24px, calc((100vw - 1180px) / 2)) 112px;
    animation: module-in 0.8s ease-out both;
    animation-delay: 0.15s;
}

.section-heading {
    display: grid;
    grid-template-columns: minmax(0, 1.3fr) minmax(260px, 0.7fr);
    align-items: end;
    gap: 50px;
    margin-bottom: 44px;
}

.section-heading small {
    font-family: var(--mono);
    letter-spacing: 0.12em;
    color: var(--subject);
    font-size: 10px;
    font-weight: 700;
}

.section-heading h2 {
    margin-top: 14px;
    color: var(--text);
    font-size: clamp(34px, 4vw, 49px);
    line-height: 1.18;
}

.section-heading > p {
    color: var(--text-secondary);
    font-size: 13px;
    line-height: 1.8;
}

.module-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    border-top: 1px solid color-mix(in srgb, var(--border) 82%, transparent);
    border-bottom: 1px solid color-mix(in srgb, var(--border) 82%, transparent);
}

.module-item {
    position: relative;
    min-height: 280px;
    padding: 28px 30px 30px;
    border-right: 1px solid color-mix(in srgb, var(--border) 82%, transparent);
    transition: background 0.3s;
}

.module-item:last-child {
    border-right: 0;
}

.module-item:hover {
    background: color-mix(in srgb, var(--subject) 6%, transparent);
}

.module-number,
.module-status {
    color: var(--text-secondary);
    font-family: var(--mono);
    font-size: 9px;
    letter-spacing: 0.1em;
}

.module-item h3 {
    margin: 42px 0 12px;
    color: var(--text);
    font-size: 21px;
    transition: color 0.3s;
}

.module-item:hover h3 {
    color: var(--subject);
}

.module-item p {
    max-width: 260px;
    color: var(--text-secondary);
    font-size: 13px;
    line-height: 1.85;
}

.module-status {
    position: absolute;
    right: 30px;
    bottom: 30px;
    color: var(--subject);
    font-size: 8px;
}

@keyframes module-in {
    from { opacity: 0; transform: translateY(34px); }
    to { opacity: 1; transform: translateY(0); }
}

@media (max-width: 680px) {
    .modules-section { padding: 78px 16px 84px; }
    .section-heading { grid-template-columns: 1fr; gap: 18px; }
    .module-grid { grid-template-columns: 1fr; }
    .module-item { min-height: 230px; border-right: 0; border-bottom: 1px solid color-mix(in srgb, var(--border) 82%, transparent); }
    .module-item:last-child { border-bottom: 0; }
}

@media (prefers-reduced-motion: reduce) {
    .modules-section { animation: none; }
}
</style>
