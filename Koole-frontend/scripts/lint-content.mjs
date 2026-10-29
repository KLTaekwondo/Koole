#!/usr/bin/env node
/**
 * 内容规范校验（对应 CLAUDE.md 里的模型数据格式）
 *
 * 检查三类东西：
 *   1. 模型注册完整性 —— models/ 下的文件是否都注册进 physicsModels.js，
 *      注册表里有没有指向不存在文件的 import，id 是否唯一，必需字段是否齐全。
 *   2. knowledge 格式   —— 标题、空行、中文冒号、公式 $ 配对、参数观察行、
 *      中文文本里混入英文标点等。
 *   3. 编码             —— src 下的文本文件必须是 UTF-8 且不带 BOM。
 *
 * 用法：npm run lint:content
 * 退出码：有 error 时为 1（warning 不影响退出码）
 */
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath, pathToFileURL as pathToFileUrl } from "node:url"

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const SRC = path.join(ROOT, "src")
const MODEL_DIR = path.join(SRC, "Logic", "physics", "models")
const REGISTRY_FILE = path.join(SRC, "Logic", "physics", "physicsModels.js")
const HELPERS = new Set(["opticsAnim.js"]) // 不是模型，跳过模型字段校验

// physicsModels.js 里声明的分类，模型的 category 必须命中
const CATEGORIES = ["力学", "声学", "波", "光学", "热学", "电学", "电与磁"]

const errors = []
const warnings = []
const rel = p => path.relative(ROOT, p).replace(/\\/g, "/")
const error = (file, msg, line) => errors.push(`${rel(file)}${line ? `:${line}` : ""}  ${msg}`)
const warn = (file, msg, line) => warnings.push(`${rel(file)}${line ? `:${line}` : ""}  ${msg}`)

// ── 工具 ──

function readText(file) {
    const buf = fs.readFileSync(file)
    if (buf.length >= 3 && buf[0] === 0xef && buf[1] === 0xbb && buf[2] === 0xbf) {
        error(file, "文件带 UTF-8 BOM，请保存为不带 BOM 的 UTF-8")
    }
    let text
    try {
        text = new TextDecoder("utf-8", { fatal: true }).decode(buf)
    } catch {
        error(file, "不是合法的 UTF-8 编码（可能是 GBK / UTF-16 保存过）")
        return null
    }
    return text.replace(/^\uFEFF/, "")
}

function lineOf(text, index) {
    return text.slice(0, index).split("\n").length
}

function field(text, name) {
    const m = text.match(new RegExp(`\\n\\s*${name}:\\s*(?:"([^"]*)"|(\`)([\\s\\S]*?)\\2)`))
    return m ? (m[1] ?? m[3]) : null
}

// ── 1. 注册表 ──

function checkRegistry() {
    const text = readText(REGISTRY_FILE)
    if (!text) return { imports: new Map(), registered: [] }

    const imports = new Map() // alias -> 文件相对路径
    for (const m of text.matchAll(/^import\s+(\w+)\s+from\s+['"]\.\/models\/([^'"]+)['"]/gm)) {
        imports.set(m[1], m[2])
    }
    const arrayBody = (text.match(/PHYSICS_MODELS\s*=\s*\[([\s\S]*?)\]/) || [, ""])[1]
    const registered = [...arrayBody.matchAll(/^\s*(\w+),/gm)].map(m => m[1])

    for (const alias of imports.keys()) {
        if (!registered.includes(alias)) {
            error(REGISTRY_FILE, `import 了 ${alias} 但没有放进 PHYSICS_MODELS 数组`)
        }
    }
    for (const alias of registered) {
        if (!imports.has(alias)) {
            error(REGISTRY_FILE, `PHYSICS_MODELS 里的 ${alias} 找不到对应 import`)
        }
    }
    for (const [alias, file] of imports) {
        if (!fs.existsSync(path.join(MODEL_DIR, file))) {
            error(REGISTRY_FILE, `import ${alias} 指向的 models/${file} 不存在`)
        }
    }
    return { imports, registered }
}

// ── 2. 模型文件 ──

const REQUIRED_FIELDS = ["id", "name", "category", "level", "desc", "knowledge", "icon", "params"]
const REQUIRED_METHODS = ["createState", "step", "isFinished", "getBallPosition", "trailFields", "chartDefs"]

function checkKnowledge(text, file, id) {
    const start = text.indexOf("knowledge:")
    if (start < 0) return
    const m = text.slice(start).match(/knowledge:\s*`([\s\S]*?)`\s*,/)
    if (!m) {
        error(file, `模型 ${id} 的 knowledge 没写成模板字符串（反引号）`)
        return
    }
    const body = m[1]
    const baseLine = lineOf(text, start)
    const fails = []

    // 标题：第一行必须是 "## 模型名"
    const lines = body.split("\n")
    if (!/^## \S/.test(lines[0] || "")) fails.push("第一行应为 `## 模型名` 标题")
    const titleCount = lines.filter(l => /^## \S/.test(l)).length
    if (titleCount > 1) fails.push("出现了多个 `## ` 标题，正文里不要再用二级标题")

    // 空行：两个连续的自然段之间必须空行（列表项、引用行可以紧贴段落）
    let inFence = false
    let prevIsParagraph = false
    lines.forEach((line, i) => {
        if (/^\s*```/.test(line)) { inFence = !inFence; prevIsParagraph = false; return }
        if (inFence) return
        const t = line.trim()
        if (t === "") { prevIsParagraph = false; return }
        const isParagraph = !/^([-*+>#|]|\d+\.|\$\$)/.test(t)
        if (isParagraph && prevIsParagraph && i > 0) {
            fails.push(`第 ${baseLine + i} 行：两个自然段之间缺少空行`)
        }
        prevIsParagraph = isParagraph
    })

    // 中文冒号
    if (/其中:/.test(body)) fails.push("变量说明用了英文冒号，应写 `其中：`")
    if (body.includes("其中：") === false) fails.push("缺少 `其中：` 变量说明段")

    // 参数观察行：至少一条，且必须是 "> " 开头
    const quoteLines = lines.filter(l => l.trim().startsWith(">"))
    if (quoteLines.length === 0) fails.push("缺少 `> ` 开头的参数观察段")
    for (const q of quoteLines) {
        if (!/^> \S/.test(q.trim())) fails.push(`参数观察行格式应为 \`> 内容\`（> 后一个空格）：${q.trim().slice(0, 30)}`)
    }

    // 公式 $ 配对（跳过 $$ 后统计单 $）
    const withoutBlock = body.replace(/\$\$[\s\S]*?\$\$/g, "")
    const dollarCount = (withoutBlock.match(/\$/g) || []).length
    if (dollarCount % 2 !== 0) fails.push("行内公式 $ 符号数量为奇数，可能有未闭合的公式")
    if ((body.match(/\$\$/g) || []).length % 2 !== 0) fails.push("块级公式 $$ 数量为奇数，可能有未闭合的公式")

    // 中文文本里混入英文标点（先去掉公式内容，避免误伤数学表达式）
    const plain = body.replace(/\$[^$\n]*\$/g, "")
    const badPunct = plain.match(/[\u4e00-\u9fff][,;:](?![0-9A-Za-z])/g)
    if (badPunct) fails.push(`中文文本里混入了英文标点：${[...new Set(badPunct)].join(" ")}`)

    for (const f of fails) error(file, `模型 ${id} 的 knowledge：${f}`)
    if (body.trim().length < 120) warn(file, `模型 ${id} 的 knowledge 只有 ${body.trim().length} 字，内容偏薄`)
}

function checkExploration(text, file, id) {
    const start = text.indexOf("exploration:")
    if (start < 0) { warn(file, `模型 ${id} 没有 exploration 探索任务`); return }
    const block = text.slice(start, start + 600)
    const task = block.match(/task:\s*"([^"]*)"/)
    const hint = block.match(/hint:\s*"([^"]*)"/)
    if (!task || task[1].trim().length < 6) error(file, `模型 ${id} 的 exploration.task 缺失或过短`)
    if (!hint || hint[1].trim().length < 6) error(file, `模型 ${id} 的 exploration.hint 缺失或过短`)
    if (!/check:\s*\(/.test(block)) error(file, `模型 ${id} 的 exploration.check 不是函数`)
}

function checkParams(text, file, id) {
    const start = text.indexOf("params:")
    if (start < 0) return
    const m = text.slice(start).match(/params:\s*\[([\s\S]*?)\n\s{4}\],/)
    if (!m) { error(file, `模型 ${id} 的 params 数组格式无法解析`); return }
    const keys = new Set()
    // 参数项都写成单行对象，缩进 6 空格、必带 key；options 里的 { label, value } 不带 key，自动排除
    const objs = m[1].split("\n").filter(l => /^\s*\{\s*key:/.test(l))
    if (objs.length === 0) error(file, `模型 ${id} 的 params 为空`)
    for (const obj of objs) {
        const key = obj.match(/key:\s*"([^"]+)"/)
        if (!key) { error(file, `模型 ${id} 的 params 里有缺 key 的项`); continue }
        if (keys.has(key[1])) error(file, `模型 ${id} 的 params 有重复 key：${key[1]}`)
        keys.add(key[1])
        if (!/label:\s*"/.test(obj)) error(file, `模型 ${id} 的参数 ${key[1]} 缺 label`)
        if (!/value:/.test(obj)) error(file, `模型 ${id} 的参数 ${key[1]} 缺 value`)
        if (!/options:\s*\[/.test(obj) && (!/min:/.test(obj) || !/max:/.test(obj))) {
            error(file, `模型 ${id} 的参数 ${key[1]} 缺 min/max（非 options 类型必须给范围）`)
        }
    }
}

function checkModelFile(file, registeredIds) {
    const text = readText(file)
    if (!text) return null
    const id = field(text, "id")
    if (!id) { error(file, "缺少 id 字段"); return null }
    if (!/export default\s*\{/.test(text)) error(file, `模型 ${id} 没有用 export default 导出对象`)

    for (const f of REQUIRED_FIELDS) if (!text.includes(`${f}:`)) error(file, `模型 ${id} 缺少字段 ${f}`)
    for (const m of REQUIRED_METHODS) if (!new RegExp(`${m}:\\s*[\\w({\\[]`).test(text)) error(file, `模型 ${id} 缺少方法 ${m}`)

    const category = field(text, "category")
    if (category && !CATEGORIES.includes(category)) {
        error(file, `模型 ${id} 的 category "${category}" 不在 physicsModels.js 的 CATEGORIES 里`)
    }
    const knowledge = field(text, "knowledge")
    if (!knowledge) error(file, `模型 ${id} 缺少 knowledge`)

    checkKnowledge(text, file, id)
    checkExploration(text, file, id)
    checkParams(text, file, id)
    return id
}

// ── 3. 编码：前端仓库的文本文件统一 UTF-8、不带 BOM ──

const TEXT_EXT = new Set([".js", ".mjs", ".vue", ".css", ".json", ".svg", ".html", ".md"])
const SKIP_DIRS = new Set(["node_modules", "dist", ".git", ".vscode", ".idea"])
const SKIP_FILES = new Set(["package-lock.json"])

function walk(dir) {
    const out = []
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name)
        if (entry.isDirectory()) {
            if (!SKIP_DIRS.has(entry.name)) out.push(...walk(full))
        } else if (!SKIP_FILES.has(entry.name) && TEXT_EXT.has(path.extname(entry.name).toLowerCase())) {
            out.push(full)
        }
    }
    return out
}

function checkEncoding() {
    const files = walk(ROOT)
    for (const f of files) {
        const buf = fs.readFileSync(f)
        if (buf.length >= 3 && buf[0] === 0xef && buf[1] === 0xbb && buf[2] === 0xbf) {
            error(f, "文件带 UTF-8 BOM，请保存为不带 BOM 的 UTF-8")
        } else {
            try { new TextDecoder("utf-8", { fatal: true }).decode(buf) }
            catch { error(f, "不是合法的 UTF-8 编码（可能是 GBK / UTF-16 保存过）") }
        }
    }
    return files.length
}

// ── 4. 知识小站：现象条目与模型注册表是否对得上 ──

async function checkPhenomena(modelIds) {
    const file = path.join(SRC, "content", "phenomena.mjs")
    if (!fs.existsSync(file)) return 0

    const { PHENOMENA } = await import(pathToFileUrl(file).href)
    if (!Array.isArray(PHENOMENA)) {
        error(file, "phenomena.mjs 没有导出 PHENOMENA 数组")
        return 0
    }

    const slugSet = new Set()
    for (const item of PHENOMENA) {
        const where = path.join(SRC, "content", "phenomena.mjs")
        if (!item.id) { error(where, "有现象条目缺少 id"); continue }
        if (slugSet.has(item.id)) error(where, `现象 id 重复：${item.id}`)
        slugSet.add(item.id)

        for (const field of ["title", "hook", "era", "category", "knowledge"]) {
            if (!item[field]) error(where, `现象 ${item.id} 缺少字段 ${field}`)
        }
        const VALID_SUBJECTS = ["physics", "chemistry", "math"]
        if (!VALID_SUBJECTS.includes(item.subject)) {
            error(where, `现象 ${item.id} 的 subject 必须是 ${VALID_SUBJECTS.join(" / ")} 之一`)
        }
        if (!Array.isArray(item.tags) || item.tags.length === 0) {
            warn(where, `现象 ${item.id} 没有搜索标签（tags），主页搜索会少一条命中路径`)
        }
        // 主人公：卡片只显示姓名，详情页显示生卒年与身份
        if (!item.figure?.name) {
            warn(where, `现象 ${item.id} 没有主人公（figure.name）`)
        }
        for (const [index, coFigure] of (item.coFigures || []).entries()) {
            if (!coFigure?.name) error(where, `现象 ${item.id} 的 coFigures[${index}] 缺少 name`)
        }
        if (!Array.isArray(item.story) || item.story.length === 0) {
            error(where, `现象 ${item.id} 的 story 不能为空`)
        } else {
            for (const [index, beat] of item.story.entries()) {
                if (!beat.year || !beat.title || !beat.text) {
                    error(where, `现象 ${item.id} 的 story[${index}] 需要 year/title/text`)
                }
            }
        }
        if (!Array.isArray(item.pitfalls) || item.pitfalls.length === 0) {
            warn(where, `现象 ${item.id} 没有易错点（pitfalls）`)
        }
        if (!Array.isArray(item.sources) || item.sources.length === 0) {
            warn(where, `现象 ${item.id} 没有参考资料（sources）`)
        }

        const simulation = item.simulation
        if (!simulation?.modelId) {
            warn(where, `现象 ${item.id} 没有关联模拟，页面不会出现「去调一调」按钮`)
            continue
        }
        if (!modelIds.has(simulation.modelId)) {
            error(where, `现象 ${item.id} 指向的模型 ${simulation.modelId} 不在注册表里`)
            continue
        }
        // 预设参数必须是该模型真实存在的参数名，否则分享链接里会静默失效
        const modelText = readText(path.join(MODEL_DIR, modelIds.get(simulation.modelId))) || ""
        for (const key of Object.keys(simulation.params || {})) {
            if (!new RegExp(`key:\\s*"${key}"`).test(modelText)) {
                error(where, `现象 ${item.id} 的预设参数 ${key} 在模型 ${simulation.modelId} 里不存在`)
            }
        }
    }
    return PHENOMENA.length
}

// ── 5. 主流程 ──

async function main() {
    const { imports, registered } = checkRegistry()
    const files = fs.readdirSync(MODEL_DIR).filter(f => f.endsWith(".js") && !HELPERS.has(f))

    const ids = new Map()
    for (const f of files) {
        const id = checkModelFile(path.join(MODEL_DIR, f), registered)
        if (!id) continue
        if (ids.has(id)) error(path.join(MODEL_DIR, f), `id "${id}" 与 ${ids.get(id)} 重复`)
        ids.set(id, f)
    }

    // 每个模型文件都必须在注册表里出现（按文件名对应 import）
    const importedFiles = new Set([...imports.values()])
    for (const f of files) {
        if (!importedFiles.has(f)) error(path.join(MODEL_DIR, f), "模型文件没有被 physicsModels.js 注册")
    }

    // 首页统计里的模型数量必须与注册表一致（首页为了首屏包体只引一个数字常量）
    const statsFile = path.join(SRC, "constants", "siteStats.js")
    const statsText = readText(statsFile) || ""
    const declared = Number((statsText.match(/PHYSICS_MODEL_COUNT\s*=\s*(\d+)/) || [])[1])
    if (!Number.isFinite(declared)) {
        error(statsFile, "缺少 PHYSICS_MODEL_COUNT 常量")
    } else if (declared !== files.length) {
        error(statsFile, `PHYSICS_MODEL_COUNT = ${declared}，但注册表里有 ${files.length} 个模型`)
    }

    // ── 输出 ──
    const phenomenonCount = await checkPhenomena(ids)
    const srcCount = checkEncoding()
    const okCount = files.length
    if (warnings.length) {
        console.log(`\n⚠  ${warnings.length} 条警告：`)
        for (const w of warnings) console.log("   " + w)
    }
    if (errors.length) {
        console.log(`\n✗  ${errors.length} 个错误：`)
        for (const e of errors) console.log("   " + e)
        console.log(`\n共检查 ${okCount} 个模型、${phenomenonCount} 篇知识条目、${srcCount} 个文本文件，未通过。`)
        process.exit(1)
    }
    console.log(`\n✓ 内容校验通过：${okCount} 个物理模型、${phenomenonCount} 篇知识条目、${srcCount} 个文本文件，knowledge 格式 / 注册表 / 首页统计 / 编码均正常。`)
    if (warnings.length) console.log(`  （警告 ${warnings.length} 条，不影响结果）`)
}

main()
