<template>
    <section class="launch-section">
        <div class="launch-card">
            <div class="launch-grid">
                <div class="launch-copy">
                    <span class="launch-badge"><i></i>LIVE · 已上线</span>
                    <h2 class="launch-title">函数<em>无限画布</em></h2>
                    <p class="launch-desc">
                        把函数画在无边界坐标系里：拖动参数看曲线实时变化，
                        两图求交、动点几何，都能自由摆弄。
                    </p>
                    <div class="launch-chips">
                        <span class="launch-chip">函数绘制</span>
                        <span class="launch-chip">LIVE 读数</span>
                        <span class="launch-chip">交叉求交</span>
                        <span class="launch-chip">几何工具</span>
                        <span class="launch-chip">场景保存</span>
                    </div>
                </div>
                <div class="launch-side">
                    <svg class="launch-wave" viewBox="0 0 220 90" aria-hidden="true">
                        <path
                            d="M0,45 C 22,45 30,15 55,15 C 80,15 88,60 110,60 C 132,60 150,20 165,20 C 182,20 196,40 220,40"
                            fill="none" stroke="rgba(140,180,255,0.55)" stroke-width="2"
                        />
                        <circle cx="165" cy="20" r="5" fill="#8fc8ff" />
                    </svg>
                    <router-link to="/math-lab/function-lab" class="launch-cta">
                        进入函数画布 <span>→</span>
                    </router-link>
                    <span class="launch-note">无需登录 · 即开即用 · 自动保存</span>
                </div>
            </div>
        </div>
    </section>
</template>

<script setup>
// 数学首页的独立主入口：函数无限画布。深色卡片 + 坐标系网格纹理，
// 与下方 SubjectModules 的规划模块区分开——这是唯一已上线可玩的模块。
</script>

<style scoped>
.launch-section {
    width: 100vw;
    margin-left: calc(50% - 50vw);
    padding: 80px max(24px, calc((100vw - 1180px) / 2)) 100px;
    animation: launch-in 0.8s ease-out both;
    animation-delay: 0.08s;
}

.launch-card {
    position: relative;
    overflow: hidden;
    border-radius: 20px;
    border: 1px solid color-mix(in srgb, #6f9be8 34%, transparent);
    background:
        radial-gradient(120% 140% at 12% 0%, #183158 0%, #0d1c31 52%, #0a1626 100%);
    box-shadow: 0 28px 70px rgba(9, 24, 51, 0.32);
}

/* 坐标系网格纹理，呼应函数画布主题；右侧光晕衰减 */
.launch-card::before {
    content: "";
    position: absolute;
    inset: 0;
    background-image:
        linear-gradient(rgba(130, 170, 235, 0.07) 1px, transparent 1px),
        linear-gradient(90deg, rgba(130, 170, 235, 0.07) 1px, transparent 1px);
    background-size: 46px 46px;
    -webkit-mask-image: radial-gradient(ellipse at 68% 42%, black 0%, transparent 72%);
    mask-image: radial-gradient(ellipse at 68% 42%, black 0%, transparent 72%);
    pointer-events: none;
}

/* 右上柔光 */
.launch-card::after {
    content: "";
    position: absolute;
    right: -8%;
    top: -46%;
    width: 520px;
    height: 520px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(71, 124, 219, 0.42) 0%, transparent 68%);
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
    border: 1px solid rgba(140, 183, 255, 0.4);
    background: rgba(71, 124, 219, 0.16);
    color: #a9c6fb;
    font-family: var(--mono);
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 0.14em;
}

.launch-badge i {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #4fe3a2;
    box-shadow: 0 0 0 3px rgba(79, 227, 162, 0.2);
}

.launch-title {
    margin: 20px 0 12px;
    color: #f4f7ff;
    font-size: clamp(30px, 3.6vw, 42px);
    font-weight: 850;
    line-height: 1.12;
    letter-spacing: 0;
}

.launch-title em {
    font-style: normal;
    background: linear-gradient(92deg, #8fc8ff 10%, #5f8fd6 90%);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
}

.launch-desc {
    max-width: 540px;
    color: rgba(208, 221, 244, 0.84);
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
    border: 1px solid rgba(160, 190, 240, 0.22);
    background: rgba(255, 255, 255, 0.06);
    color: rgba(216, 229, 250, 0.92);
    font-size: 11px;
}

.launch-side {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 18px;
    text-align: center;
}

.launch-wave {
    width: 100%;
    max-width: 220px;
    height: auto;
}

.launch-cta {
    display: inline-flex;
    align-items: center;
    gap: 14px;
    padding: 17px 30px;
    border-radius: 11px;
    background: #ffffff;
    color: #0c1a2e;
    font-size: 15px;
    font-weight: 800;
    text-decoration: none;
    box-shadow: 0 14px 38px rgba(0, 0, 0, 0.36);
    transition: transform 0.2s, box-shadow 0.25s;
    white-space: nowrap;
}

.launch-cta span {
    transition: transform 0.2s;
}

.launch-cta:hover {
    transform: translateY(-2px);
    box-shadow: 0 20px 48px rgba(0, 0, 0, 0.42);
}

.launch-cta:hover span {
    transform: translateX(4px);
}

.launch-note {
    color: rgba(190, 206, 235, 0.6);
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

    .launch-wave {
        display: none;
    }
}

@media (max-width: 680px) {
    .launch-section {
        padding: 56px 16px 64px;
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
