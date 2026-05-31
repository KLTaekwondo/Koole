<template>
    <div class="home-index-container">
        <div class="hero-section">
            <div class="hero-bg">
                <div class="hero-blob hero-blob-1"></div>
                <div class="hero-blob hero-blob-2"></div>
                <div class="hero-blob hero-blob-3"></div>
                <div class="hero-grid"></div>
            </div>
            <div class="hero-badge">Learning Made Fun</div>
            <h1 class="hero-title">学点东西，<span class="hero-highlight">酷了</span>!</h1>
            <p class="hero-desc">物理、编程、数学……用互动的方式，理解那些曾经死心的知识点。</p>
            <div class="hero-buttons">
                <button class="hero-button primary" @click="goArticle">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
                    开始浏览
                </button>
                <button class="hero-button secondary" @click="goAbout">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                    关于本站
                </button>
            </div>
        </div>

        <div class="features-section">
            <div class="feature-card">
                <div class="feature-icon" style="background: #fef3e2; color: #e67e22;">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                </div>
                <h3>持续更新</h3>
                <p>不断添加新的知识点和互动内容</p>
            </div>
            <div class="feature-card">
                <div class="feature-icon" style="background: #e8f8f5; color: #27ae60;">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
                </div>
                <h3>深入浅出</h3>
                <p>复杂的知识，简单的表达</p>
            </div>
            <div class="feature-card">
                <div class="feature-icon" style="background: #ebf0ff; color: #3498db;">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 17 10 11 14 15 20 9"/><polyline points="14 9 20 9 20 15"/></svg>
                </div>
                <h3>学无止境</h3>
                <p>保持好奇，每天进步一点点</p>
            </div>
        </div>
    </div>
</template>

<script setup>
import { useRouter } from "vue-router"
const router = useRouter()

const goArticle = () => {
    router.push({ name: "文章列表" })
}

const goAbout = () => {
    router.push({name: "关于本站"})
}
</script>

<style scoped>
.home-index-container {
    max-width: var(--content-width);
    margin: 0 auto;
    padding: 0 24px;
}

/* ── Hero ── */
.hero-section {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 100px 0 70px;
    text-align: center;
    border-radius: var(--radius-xl);
    overflow: hidden;
}

/* Hero background */
.hero-bg {
    position: absolute;
    inset: -80px -80px 0;
    z-index: 0;
    pointer-events: none;
    overflow: hidden;
    background: #fff;
}

.hero-blob {
    position: absolute;
    border-radius: 50%;
    filter: blur(100px);
    opacity: 0.45;
    will-change: transform;
}

.hero-blob-1 {
    width: 700px;
    height: 700px;
    background: radial-gradient(circle, #c0392b, #e74c3c 50%, transparent);
    top: -300px;
    right: -250px;
    animation: heroFloat 8s ease-in-out infinite;
}

.hero-blob-2 {
    width: 600px;
    height: 600px;
    background: radial-gradient(circle, #e74c3c, #f39c12 50%, transparent);
    bottom: -250px;
    left: -250px;
    animation: heroFloat 10s ease-in-out infinite reverse;
}

.hero-blob-3 {
    width: 350px;
    height: 350px;
    background: radial-gradient(circle, #f5b7a0, #fadbd8 50%, transparent);
    top: 20px;
    left: 38%;
    animation: heroFloat 12s ease-in-out infinite 2s;
}

.hero-grid {
    position: absolute;
    inset: 0;
    background-image:
        radial-gradient(circle at 1px 1px, rgba(192, 57, 43, 0.15) 1.5px, transparent 0);
    background-size: 36px 36px;
    mask-image: radial-gradient(ellipse at center, black 20%, transparent 70%);
    -webkit-mask-image: radial-gradient(ellipse at center, black 20%, transparent 70%);
}

/* Edge warm overlay - center stays white */
.hero-bg::after {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(ellipse at 50% 50%, transparent 35%, rgba(192, 57, 43, 0.07) 70%, rgba(231, 76, 60, 0.12) 100%);
    pointer-events: none;
}

@keyframes heroFloat {
    0%, 100% {
        transform: translate(0, 0) scale(1);
    }
    33% {
        transform: translate(30px, -30px) scale(1.05);
    }
    66% {
        transform: translate(-20px, 20px) scale(0.95);
    }
}

.hero-badge {
    position: relative;
    z-index: 1;
    display: inline-block;
    padding: 6px 16px;
    border-radius: 20px;
    background: var(--primary-light);
    color: var(--primary);
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 1px;
    text-transform: uppercase;
    margin-bottom: 24px;
}

.hero-title {
    position: relative;
    z-index: 1;
    font-size: 48px;
    font-weight: 800;
    color: black;
    margin-bottom: 16px;
    line-height: 1.2;
    letter-spacing: -1px;
}

.hero-highlight {
    background: var(--primary-gradient);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

.hero-desc {
    position: relative;
    z-index: 1;
    font-size: 18px;
    color: var(--text-secondary);
    margin-bottom: 36px;
    max-width: 480px;
    line-height: 1.7;
}

.hero-buttons {
    position: relative;
    z-index: 1;
    display: flex;
    gap: 16px;
    align-items: center;
}

.hero-button {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 14px 28px;
    border-radius: var(--radius-lg);
    font-size: 15px;
    font-weight: 700;
    border: none;
    cursor: pointer;
    transition: var(--transition);
}

.hero-button.primary {
    background: var(--primary-gradient);
    color: #fff;
    box-shadow: 0 4px 14px rgba(192, 57, 43, 0.35);
}

.hero-button.primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(192, 57, 43, 0.45);
}

.hero-button.secondary {
    background: var(--bg-card);
    color: var(--text);
    border: 1px solid var(--border);
}

.hero-button.secondary:hover {
    background: var(--bg);
    border-color: var(--primary);
    color: var(--primary);
    transform: translateY(-2px);
}

/* ── Features ── */
.features-section {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 24px;
    padding: 40px 0 80px;
}

.feature-card {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    padding: 32px 24px;
    text-align: center;
    transition: var(--transition);
    box-shadow: var(--shadow);
}

:root[data-theme="dark"] .feature-card {
    background: #000000;
}

.feature-card:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-hover);
}

.feature-icon {
    width: 52px;
    height: 52px;
    border-radius: 14px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 16px;
}

.feature-card h3 {
    font-size: 17px;
    font-weight: 700;
    color: var(--text-dark);
    margin-bottom: 8px;
}

.feature-card p {
    font-size: 14px;
    color: var(--text-secondary);
    line-height: 1.6;
}

/* ── Responsive ── */
@media (max-width: 640px) {
    .hero-title {
        font-size: 32px;
    }

    .hero-desc {
        font-size: 16px;
    }

    .hero-buttons {
        flex-direction: column;
        width: 100%;
    }

    .hero-button {
        width: 100%;
        justify-content: center;
    }

    .features-section {
        grid-template-columns: 1fr;
        gap: 16px;
    }
}
</style>
