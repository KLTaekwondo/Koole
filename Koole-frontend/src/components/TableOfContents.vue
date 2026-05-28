<template>
    <aside class="toc-wrapper" :class="{ 'toc-visible': visible }" v-if="headings.length > 0">
        <div class="toc-inner">
            <div class="toc-header">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="8" y1="6" x2="21" y2="6"/>
                    <line x1="8" y1="12" x2="21" y2="12"/>
                    <line x1="8" y1="18" x2="21" y2="18"/>
                    <line x1="3" y1="6" x2="3.01" y2="6"/>
                    <line x1="3" y1="12" x2="3.01" y2="12"/>
                    <line x1="3" y1="18" x2="3.01" y2="18"/>
                </svg>
                <span>目录</span>
            </div>
            <nav class="toc-nav">
                <a
                    v-for="(heading, idx) in headings"
                    :key="idx"
                    :href="`#${heading.id}`"
                    class="toc-item"
                    :class="{
                        'toc-active': activeId === heading.id,
                        [`toc-level-${heading.level}`]: true,
                    }"
                    @click.prevent="scrollToHeading(heading.id)"
                >
                    {{ heading.text }}
                </a>
            </nav>
        </div>
    </aside>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick } from "vue";

const props = defineProps({
    contentSelector: {
        type: String,
        default: ".article-content",
    },
    offset: {
        type: Number,
        default: 80, // nav height (64px) + some padding
    },
});

const headings = ref([]);
const activeId = ref("");
const visible = ref(false);
let observer = null;

const generateId = (text, index) => {
    // 生成与 md-editor-v3 兼容的 ID
    return `heading-${index}-${text
        .toLowerCase()
        .replace(/[^\w\u4e00-\u9fa5]+/g, "-")
        .replace(/^-+|-+$/g, "")}`;
};

const scrollToHeading = (id) => {
    const el = document.getElementById(id);
    if (el) {
        const top = el.getBoundingClientRect().top + window.pageYOffset - props.offset;
        window.scrollTo({ top, behavior: "smooth" });
    }
};

onMounted(async () => {
    await nextTick();

    // 等待 md-editor-v3 渲染完成
    setTimeout(() => {
        const contentEl = document.querySelector(props.contentSelector);
        if (!contentEl) return;

        // 查找所有标题元素（md-editor-v3 渲染的 h1-h4）
        const headingEls = contentEl.querySelectorAll("h1, h2, h3, h4");
        if (headingEls.length === 0) return;

        const list = [];
        headingEls.forEach((el, index) => {
            const level = parseInt(el.tagName.substring(1), 10); // "H1" → 1
            let text = el.textContent || "";
            text = text.trim();

            if (!text) return;

            // 确保每个标题都有 ID
            let id = el.id;
            if (!id) {
                id = generateId(text, index);
                el.id = id;
            }

            list.push({ id, text, level });
        });

        headings.value = list;
        visible.value = true;

        // 初始化第一个为 active
        if (list.length > 0) {
            activeId.value = list[0].id;
        }

        // 创建 IntersectionObserver 监听标题可见性
        observer = new IntersectionObserver(
            (entries) => {
                for (const entry of entries) {
                    if (entry.isIntersecting) {
                        activeId.value = entry.target.id;
                    }
                }
            },
            {
                rootMargin: `-${props.offset}px 0px -60% 0px`,
                threshold: 0,
            }
        );

        // 观察所有标题元素
        list.forEach((h) => {
            const el = document.getElementById(h.id);
            if (el) observer.observe(el);
        });
    }, 500); // 给 md-editor-v3 留出渲染时间
});

onBeforeUnmount(() => {
    if (observer) {
        observer.disconnect();
    }
});
</script>

<style scoped>
.toc-wrapper {
    position: fixed;
    top: calc(var(--nav-height) + 32px);
    left: calc((100vw - 1100px) / 2 - 240px);
    width: 200px;
    max-height: calc(100vh - var(--nav-height) - 64px);
    overflow-y: auto;
    opacity: 0;
    transform: translateX(-12px);
    transition: opacity 0.3s var(--ease-out), transform 0.3s var(--ease-out);
    z-index: 50;
    pointer-events: none;
}

.toc-visible {
    opacity: 1;
    transform: translateX(0);
    pointer-events: auto;
}

.toc-inner {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 16px 0;
    box-shadow: var(--shadow);
}

.toc-header {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 0 16px 12px;
    border-bottom: 1px solid var(--border-light);
    margin-bottom: 8px;
    font-size: 13px;
    font-weight: 700;
    color: var(--text-dark);
    letter-spacing: 0.3px;
    text-transform: uppercase;
}

.toc-header svg {
    flex-shrink: 0;
    opacity: 0.6;
}

.toc-nav {
    display: flex;
    flex-direction: column;
    gap: 2px;
    padding: 0 8px;
}

.toc-item {
    display: block;
    padding: 5px 10px;
    font-size: 13px;
    line-height: 1.4;
    color: var(--text-secondary);
    text-decoration: none !important;
    border-radius: 4px;
    transition: background 0.15s, color 0.15s;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    position: relative;
}

.toc-item:hover {
    background: var(--primary-light);
    color: var(--primary);
}

.toc-item.toc-active {
    color: var(--primary);
    background: var(--primary-light);
    font-weight: 600;
}

/* 层级缩进 */
.toc-level-1 { padding-left: 10px; }
.toc-level-2 { padding-left: 20px; }
.toc-level-3 { padding-left: 30px; }
.toc-level-4 { padding-left: 40px; }

/* 滚动条样式 */
.toc-wrapper::-webkit-scrollbar {
    width: 4px;
}
.toc-wrapper::-webkit-scrollbar-thumb {
    background: transparent;
    border-radius: 2px;
}
.toc-wrapper:hover::-webkit-scrollbar-thumb {
    background: #d0d0d0;
}

/* 响应式：屏幕较小时隐藏目录 */
@media (max-width: 1400px) {
    .toc-wrapper {
        display: none;
    }
}
</style>
