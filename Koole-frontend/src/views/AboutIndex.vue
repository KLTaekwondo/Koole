<template>
    <div class="about-container">
        <div class="about-card">
            <div class="about-avatar">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
            </div>
            <h1>关于本站</h1>
            <p class="about-desc">
                Koole 是个人学习笔记站点，记录学习过程中的思考和收获。学点东西，酷了！
            </p>
            <div class="about-meta">
                <div class="meta-item">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                    <span>持续更新中</span>
                </div>
                <div class="meta-item">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                    <span>用心创作</span>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
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