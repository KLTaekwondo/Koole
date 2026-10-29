// md-editor-v3 默认从 unpkg CDN 动态加载 KaTeX（katex.min.js / katex.min.css），
// 网络不通或者 CDN 慢的时候，文章里的 $...$ 公式会先显示成原始文本，甚至一直不渲染。
// 这里改成使用本地安装的 katex 实例 + 本地样式，公式随组件包一起加载，离线也能显示。
import { config } from "md-editor-v3"
import katex from "katex"
import "katex/dist/katex.min.css"

config({
    editorExtensions: {
        katex: { instance: katex },
    },
    // 公式太密时不要压得太小，正文里的行内公式保持可读
    katexConfig: options => ({
        ...options,
        throwOnError: false,
        strict: false,
    }),
})
