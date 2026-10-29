<template>
    <div class="more-page">
        <header class="more-header">
            <router-link to="/" class="back-link">← 回到首页</router-link>
            <small class="eyebrow">SUBJECTS / 学科规划</small>
            <h1>其他学科</h1>
            <p class="lede">
                目前站点的重心放在<b>物理、数学、化学</b>三个学科上。下面这些学科暂时没有排进计划，页面仍然保留，方便你查看它们原本的设想。
            </p>
        </header>

        <section v-if="planned.length" class="subject-group">
            <header class="group-heading">
                <div>
                    <small>PLANNED</small>
                    <h2>计划中</h2>
                </div>
                <p>这两个学科和交互可视化的契合度很高，排在化学之后。</p>
            </header>
            <div class="subject-grid">
                <router-link v-for="subject in planned" :key="subject.id" :to="subject.path" class="subject-item" :style="{ '--subject': subject.color }">
                    <span class="item-status">COMING SOON</span>
                    <div class="item-icon" v-html="icons[subject.id]"></div>
                    <h3>{{ subject.name }}</h3>
                    <p>{{ subject.description }}</p>
                    <span class="item-vision">{{ subject.vision }}</span>
                </router-link>
            </div>
        </section>

        <section v-if="archived.length" class="subject-group">
            <header class="group-heading">
                <div>
                    <small>PAUSED</small>
                    <h2>暂不纳入规划</h2>
                </div>
                <p>这些学科以阅读和记忆为主，做成交互模拟的收益有限，先把页面留着。</p>
            </header>
            <div class="subject-grid">
                <router-link v-for="subject in archived" :key="subject.id" :to="subject.path" class="subject-item is-archived" :style="{ '--subject': subject.color }">
                    <span class="item-status">PAUSED</span>
                    <div class="item-icon" v-html="icons[subject.id]"></div>
                    <h3>{{ subject.name }}</h3>
                    <p>{{ subject.description }}</p>
                    <span class="item-vision">{{ subject.vision }}</span>
                </router-link>
            </div>
        </section>

        <footer class="more-footer">
            <p>学科状态由 <code>constants/subjects.js</code> 里的 <code>visibility</code> 字段决定；想恢复某个学科，改这一个字段即可。</p>
        </footer>
    </div>
</template>

<script setup>
import { ARCHIVED_SUBJECTS, PLANNED_SUBJECTS } from "../constants/subjects.js"
import { HOME_SUBJECT_ICONS } from "../constants/homeSubjects.js"

const planned = PLANNED_SUBJECTS
const archived = ARCHIVED_SUBJECTS
const icons = HOME_SUBJECT_ICONS
</script>

<style scoped>
.more-page {
    width: min(1120px, calc(100% - 48px));
    margin: 0 auto;
    padding-bottom: 72px;
    color: var(--text);
}

.more-header {
    display: grid;
    gap: 10px;
    padding: 40px 0 32px;
}

.back-link {
    color: var(--text-secondary);
    font-size: 12px;
    font-weight: 700;
    text-decoration: none;
}

.back-link:hover {
    color: var(--primary);
}

.eyebrow,
.group-heading small {
    color: var(--primary);
    font-family: var(--mono);
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.12em;
}

.more-header h1 {
    margin: 0;
    font-size: clamp(30px, 4vw, 44px);
    line-height: 1.15;
}

.lede {
    max-width: 680px;
    margin: 0;
    color: var(--text-secondary);
    font-size: 14px;
    line-height: 1.9;
}

.lede b {
    color: var(--text);
}

.subject-group + .subject-group {
    margin-top: 48px;
}

.group-heading {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 24px;
    margin-bottom: 20px;
    padding-bottom: 12px;
    border-bottom: 1px solid var(--border);
}

.group-heading h2 {
    margin: 6px 0 0;
    font-size: 22px;
}

.group-heading p {
    max-width: 420px;
    margin: 0;
    color: var(--text-secondary);
    font-size: 12px;
    line-height: 1.8;
}

.subject-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
    gap: 14px;
}

.subject-item {
    position: relative;
    display: grid;
    gap: 6px;
    padding: 22px;
    border: 1px dashed color-mix(in srgb, var(--subject) 40%, var(--border));
    border-radius: var(--radius-lg);
    background: color-mix(in srgb, var(--subject) 5%, var(--bg-card));
    color: var(--text);
    text-decoration: none;
    transition: var(--transition);
}

.subject-item:hover {
    border-color: var(--subject);
    transform: translateY(-2px);
    box-shadow: var(--shadow-hover);
}

.subject-item.is-archived {
    opacity: 0.86;
}

.item-status {
    color: var(--subject);
    font-family: var(--mono);
    font-size: 9px;
    font-weight: 800;
    letter-spacing: 0.1em;
}

.item-icon {
    color: var(--subject);
}

.item-icon :deep(svg) {
    width: 30px;
    height: 30px;
}

.subject-item h3 {
    margin: 2px 0 0;
    font-size: 19px;
}

.subject-item p {
    margin: 0;
    color: var(--text-secondary);
    font-size: 13px;
    line-height: 1.8;
}

.item-vision {
    margin-top: 8px;
    color: var(--text-muted);
    font-family: var(--mono);
    font-size: 10px;
}

.more-footer {
    margin-top: 56px;
    padding-top: 20px;
    border-top: 1px solid var(--border);
}

.more-footer p {
    margin: 0;
    color: var(--text-muted);
    font-size: 11px;
    line-height: 1.8;
}

.more-footer code {
    padding: 1px 5px;
    border-radius: 4px;
    background: var(--border-light);
    font-family: var(--mono);
    font-size: 10px;
}

@media (max-width: 640px) {
    .more-page {
        width: calc(100% - 28px);
    }

    .group-heading {
        flex-direction: column;
        align-items: flex-start;
        gap: 8px;
    }

    .subject-grid {
        grid-template-columns: 1fr;
    }
}
</style>
