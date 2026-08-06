<template>
    <div class="about-container">
        <div class="about-card">
            <div class="about-avatar">
                <SvgIcon name="book" :size="40" />
            </div>
            <h1>关于本站</h1>
            <p class="about-desc">
                Koole 是一个把物理现象做成小模型的网站。能调参数，能看变化，也能顺手把原理讲明白。
            </p>
            <div class="about-meta">
                <div class="meta-item">
                    <SvgIcon name="time" :size="18" />
                    <span>持续更新中</span>
                </div>
                <div class="meta-item">
                    <SvgIcon name="heart" :size="18" />
                    <span>用心创作</span>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import SvgIcon from "../components/SvgIcon.vue"
</script>

<style scoped>
.about-container {
    max-width: var(--content-width);
    margin: 0 auto;
    padding: 0 24px;
    display: flex;
    justify-content: center;
    padding-top: 40px;
}

.about-card {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius-xl);
    padding: 48px 40px;
    text-align: center;
    max-width: 480px;
    width: 100%;
    box-shadow: var(--shadow);
}

.about-avatar {
    width: 64px;
    height: 64px;
    border-radius: 16px;
    background: var(--primary-light);
    color: var(--primary);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 20px;
}

.about-card h1 {
    font-size: 26px;
    font-weight: 800;
    color: var(--text-dark);
    margin-bottom: 16px;
}

.about-desc {
    font-size: 15px;
    color: var(--text-secondary);
    line-height: 1.8;
    margin-bottom: 28px;
}

.about-meta {
    display: flex;
    justify-content: center;
    gap: 24px;
}

.meta-item {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    color: var(--text-muted);
}

.meta-item svg {
    opacity: 0.6;
}
</style>