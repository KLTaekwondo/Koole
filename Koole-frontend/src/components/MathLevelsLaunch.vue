<template>
    <section class="launch-section">
        <div class="launch-card">
            <div class="launch-grid">
                <div class="launch-copy">
                    <span class="launch-badge"><i></i>LIVE · 已上线</span>
                    <h2 class="launch-title">函数<em>关卡挑战</em></h2>
                    <p class="launch-desc">
                        调节参数、观察曲线，让函数图像满足目标条件。每完成一关，
                        就解锁下一段函数关系，一次一次逼近目标。
                    </p>
                    <div class="launch-chips">
                        <span class="launch-chip">二次函数</span>
                        <span class="launch-chip">正弦相位</span>
                        <span class="launch-chip">指数增长</span>
                        <span class="launch-chip">目标判定</span>
                        <span class="launch-chip">章节解锁</span>
                    </div>
                </div>
                <div class="launch-side">
                    <!-- 关卡装饰：抛物线 + 目标点，呼应"让曲线落到目标"的玩法 -->
                    <svg class="launch-level" viewBox="0 0 220 150" aria-hidden="true">
                        <g class="level-grid">
                            <line x1="30" y1="20" x2="30" y2="128" />
                            <line x1="30" y1="128" x2="190" y2="128" />
                        </g>
                        <path class="level-curve" d="M40,92 C 80,40 140,40 180,92" />
                        <circle class="level-target" cx="140" cy="46" r="7" />
                        <circle class="level-dot" cx="140" cy="46" r="2.6" />
                    </svg>
                    <router-link to="/math-lab/levels" class="launch-cta">
                        进入关卡列表 <span>→</span>
                    </router-link>
                    <span class="launch-note">无需登录 · 即开即用 · 进度自动保存</span>
                </div>
            </div>
        </div>
    </section>
</template>

<script setup>
// 数学首页的独立主入口：函数关卡挑战（与函数画布 / 立体几何入口对称）。
// 配色随主题反转：浅色 = 浅蓝卡片 + 蓝色 CTA；深色 = 半透明玻璃卡片 + 白色 CTA。
</script>

<style scoped>
.launch-section {
    width: 100vw;
    margin-left: calc(50% - 50vw);
    padding: 0 max(24px, calc((100vw - 1180px) / 2)) 100px;
    animation: launch-in 0.8s ease-out both;
    animation-delay: 0.11s;
}

/* ---------- 卡片（浅色默认） ---------- */
.launch-card {
    position: relative;
    overflow: hidden;
    border-radius: 20px;
    border: 1px solid var(--border);
    background:
        radial-gradient(120% 140% at 12% 0%, #ffffff 0%, #fafbfc 48%, #eef0f4 100%);
    box-shadow: 0 24px 64px rgba(20, 28, 34, 0.1);
}

.launch-card::before {
    content: "";
    position: absolute;
    inset: 0;
    background-image:
        linear-gradient(rgba(20, 28, 34, 0.06) 1px, transparent 1px),
        linear-gradient(90deg, rgba(20, 28, 34, 0.06) 1px, transparent 1px);
    background-size: 46px 46px;
    -webkit-mask-image: radial-gradient(ellipse at 68% 42%, black 0%, transparent 72%);
    mask-image: radial-gradient(ellipse at 68% 42%, black 0%, transparent 72%);
    pointer-events: none;
}

.launch-card::after {
    content: "";
    position: absolute;
    right: -8%;
    top: -46%;
    width: 520px;
    height: 520px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(20, 28, 34, 0.08) 0%, transparent 68%);
    filter: blur(26px);
    pointer-events: none;
}

.launch-grid {
    position: relative;
    z-index: 1;
    display: grid;
    grid-template-columns: minmax(0, 1.45fr) minmax(220px, 0.55fr);
    align-items: center;
    gap: 40px;
    padding: 44px 48px;
}

.launch-badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 5px 11px;
    border-radius: 999px;
    border: 1px solid rgba(77, 127, 220, 0.38);
    background: rgba(77, 127, 220, 0.1);
    color: #3a67b8;
    font-family: var(--mono);
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 0.14em;
}

.launch-badge i {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #2bb673;
    box-shadow: 0 0 0 3px rgba(43, 182, 115, 0.18);
}

.launch-title {
    margin: 20px 0 12px;
    color: #16243d;
    font-size: clamp(30px, 3.6vw, 42px);
    font-weight: 850;
    line-height: 1.12;
    letter-spacing: 0;
}

.launch-title em {
    font-style: normal;
    background: linear-gradient(92deg, #4d7fdc 10%, #6aa0ee 90%);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
}

.launch-desc {
    max-width: 540px;
    color: rgba(36, 56, 92, 0.78);
    font-size: 14px;
    line-height: 1.85;
}

.launch-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 22px;
}

.launch-chip {
    padding: 4px 11px;
    border-radius: 6px;
    border: 1px solid rgba(77, 127, 220, 0.22);
    background: rgba(77, 127, 220, 0.06);
    color: #3c5378;
    font-size: 11px;
}

.launch-side {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 18px;
    text-align: center;
}

/* 关卡装饰：坐标轴 + 抛物线 + 目标点 */
.launch-level {
    width: 100%;
    max-width: 200px;
    height: auto;
}

.launch-level .level-grid line {
    stroke: rgba(71, 124, 219, 0.32);
    stroke-width: 1.6;
}

.launch-level .level-curve {
    fill: none;
    stroke: rgba(71, 124, 219, 0.75);
    stroke-width: 2.6;
    stroke-linecap: round;
}

.launch-level .level-target {
    fill: none;
    stroke: #e8963c;
    stroke-width: 1.8;
}

.launch-level .level-dot {
    fill: #e8963c;
}

.launch-cta {
    display: inline-flex;
    align-items: center;
    gap: 14px;
    padding: 17px 30px;
    border-radius: 11px;
    background: #477cdb;
    color: #ffffff;
    font-size: 15px;
    font-weight: 800;
    text-decoration: none;
    box-shadow: 0 14px 34px rgba(71, 124, 219, 0.35);
    transition: transform 0.2s, box-shadow 0.25s, background 0.2s;
    white-space: nowrap;
}

.launch-cta span {
    transition: transform 0.2s;
}

.launch-cta:hover {
    background: color-mix(in srgb, #477cdb 88%, #000);
    transform: translateY(-2px);
    box-shadow: 0 20px 44px rgba(71, 124, 219, 0.42);
}

.launch-cta:hover span {
    transform: translateX(4px);
}

.launch-note {
    color: rgba(60, 80, 115, 0.55);
    font-family: var(--mono);
    font-size: 9px;
    letter-spacing: 0.08em;
}

@keyframes launch-in {
    from {
        opacity: 0;
        transform: translateY(30px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

/* ---------- 深色主题 ---------- */
:root[data-theme="dark"] .launch-card {
    border-color: rgba(148, 185, 255, 0.16);
    background: rgba(20, 30, 54, 0.78);
    backdrop-filter: blur(18px);
    -webkit-backdrop-filter: blur(18px);
    box-shadow:
        0 30px 80px rgba(0, 0, 0, 0.5),
        0 0 46px rgba(71, 124, 219, 0.18);
}

:root[data-theme="dark"] .launch-card::after {
    background: radial-gradient(circle, rgba(71, 124, 219, 0.5) 0%, transparent 68%);
}

:root[data-theme="dark"] .launch-badge {
    border-color: rgba(140, 183, 255, 0.4);
    background: rgba(71, 124, 219, 0.16);
    color: #a9c6fb;
}

:root[data-theme="dark"] .launch-title {
    color: #f4f7ff;
}

:root[data-theme="dark"] .launch-title em {
    background: linear-gradient(92deg, #8fc8ff 10%, #5f8fd6 90%);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
}

:root[data-theme="dark"] .launch-desc {
    color: rgba(208, 221, 244, 0.84);
}

:root[data-theme="dark"] .launch-chip {
    border-color: rgba(160, 190, 240, 0.22);
    background: rgba(255, 255, 255, 0.06);
    color: rgba(216, 229, 250, 0.92);
}

:root[data-theme="dark"] .launch-level .level-grid line {
    stroke: rgba(160, 190, 255, 0.45);
}

:root[data-theme="dark"] .launch-level .level-curve {
    stroke: rgba(143, 200, 255, 0.85);
}

:root[data-theme="dark"] .launch-level .level-target {
    stroke: #f0a44f;
}

:root[data-theme="dark"] .launch-level .level-dot {
    fill: #f0a44f;
}

:root[data-theme="dark"] .launch-cta {
    background: #ffffff;
    color: #0c1a2e;
    box-shadow: 0 14px 38px rgba(0, 0, 0, 0.36);
}

:root[data-theme="dark"] .launch-cta:hover {
    background: #f3f7ff;
    box-shadow: 0 20px 48px rgba(0, 0, 0, 0.42);
}

:root[data-theme="dark"] .launch-note {
    color: rgba(190, 206, 235, 0.6);
}

@media (max-width: 900px) {
    .launch-grid {
        grid-template-columns: 1fr;
        gap: 30px;
        padding: 36px 32px;
    }

    .launch-side {
        align-items: flex-start;
        text-align: left;
    }

    .launch-level {
        display: none;
    }
}

@media (max-width: 680px) {
    .launch-section {
        padding: 0 16px 64px;
    }

    .launch-grid {
        padding: 32px 24px;
    }

    .launch-cta {
        width: 100%;
        justify-content: center;
    }
}

@media (prefers-reduced-motion: reduce) {
    .launch-section {
        animation: none;
    }
}
</style>
