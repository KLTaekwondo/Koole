<template>
    <div class="lab-entry-page">
        <div class="entry-header">
            <h1>物理实验室</h1>
            <p>探索经典物理模型，理解运动规律</p>
        </div>
        <div class="entry-cards">
            <router-link to="/physics-lab/classic" class="entry-card">
                <div class="card-icon">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="10"/>
                        <path d="M12 6v6l4 2"/>
                        <line x1="4.93" y1="4.93" x2="9.17" y2="9.17"/>
                        <line x1="14.83" y1="14.83" x2="19.07" y2="19.07"/>
                        <line x1="4.93" y1="19.07" x2="9.17" y2="14.83"/>
                        <line x1="14.83" y1="9.17" x2="19.07" y2="4.93"/>
                    </svg>
                </div>
                <div class="card-body">
                    <h2>经典模型</h2>
                    <p>涵盖初中、高中力学核心模型，支持参数调节、实时模拟与数据对比。</p>
                    <ul class="model-preview-list">
                        <li>初中力学 · 6 个模型</li>
                        <li>高中力学 · 10 个模型</li>
                    </ul>
                </div>
                <div class="card-action">
                    <span class="enter-btn">进入</span>
                </div>
            </router-link>

            <router-link to="/physics-lab/sandbox" class="entry-card">
                <div class="card-icon">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2"/>
                        <line x1="12" y1="8" x2="12" y2="16"/>
                        <line x1="8" y1="12" x2="16" y2="12"/>
                    </svg>
                </div>
                <div class="card-body">
                    <h2>沙盒模式</h2>
                    <p>自由搭建实验场景，拖拽添加物体、调节物理属性，探索任意物理现象。</p>
                    <ul class="model-preview-list">
                        <li>自由添加模型</li>
                        <li>拖拽放置</li>
                        <li>属性实时编辑</li>
                        <li>重力开关</li>
                    </ul>
                </div>
                <div class="card-action">
                    <span class="enter-btn">进入</span>
                </div>
            </router-link>
        </div>
    </div>
</template>

<style scoped>
.lab-entry-page {
    max-width: 800px;
    margin: 0 auto;
    padding: 60px 20px 40px;
}

.entry-header {
    text-align: center;
    margin-bottom: 48px;
}

.entry-header h1 {
    font-size: 28px;
    font-weight: 800;
    color: var(--text-dark);
    margin: 0 0 8px;
}

.entry-header p {
    font-size: 15px;
    color: var(--text-muted);
    margin: 0;
}

.entry-cards {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.entry-card {
    display: flex;
    align-items: flex-start;
    gap: 20px;
    padding: 24px;
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    text-decoration: none;
    color: inherit;
    transition: var(--transition);
    position: relative;
}

.entry-card:hover {
    border-color: var(--primary);
    box-shadow: 0 4px 20px rgba(52, 152, 219, 0.1);
    transform: translateY(-1px);
}

.entry-card.disabled {
    opacity: 0.6;
    cursor: default;
}

.entry-card.disabled:hover {
    border-color: var(--border);
    box-shadow: none;
    transform: none;
}

.card-icon {
    flex-shrink: 0;
    width: 56px;
    height: 56px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--primary-light);
    border-radius: var(--radius);
    color: var(--primary);
}

.card-body {
    flex: 1;
    min-width: 0;
}

.card-body h2 {
    font-size: 18px;
    font-weight: 700;
    color: var(--text-dark);
    margin: 0 0 6px;
}

.card-body p {
    font-size: 13px;
    color: var(--text-secondary);
    margin: 0 0 12px;
    line-height: 1.6;
}

.model-preview-list {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    list-style: none;
    padding: 0;
    margin: 0;
}

.model-preview-list li {
    font-size: 11px;
    padding: 3px 10px;
    background: var(--primary-light);
    color: var(--primary);
    border-radius: 12px;
    font-weight: 600;
}

.card-action {
    flex-shrink: 0;
    align-self: center;
}

.enter-btn {
    display: inline-block;
    padding: 8px 24px;
    background: var(--primary-gradient);
    color: #fff;
    border-radius: var(--radius);
    font-size: 14px;
    font-weight: 700;
    transition: var(--transition);
}

.entry-card:hover .enter-btn {
    box-shadow: 0 4px 12px rgba(52, 152, 219, 0.3);
    transform: scale(1.02);
}

.disabled-badge {
    display: inline-block;
    padding: 8px 20px;
    background: var(--border);
    color: var(--text-muted);
    border-radius: var(--radius);
    font-size: 13px;
    font-weight: 600;
}

@media (max-width: 600px) {
    .lab-entry-page { padding: 40px 16px; }
    .entry-card { flex-direction: column; align-items: stretch; }
    .card-action { align-self: flex-end; }
}
</style>
