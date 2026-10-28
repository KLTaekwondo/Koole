#!/usr/bin/env node
/**
 * 桌面端开发启动脚本：先拉起 vite dev server，等端口就绪后再启动 electron。
 *
 * 为什么不用 `vite ... & electron .`：Windows cmd 里 `&` 是「顺序执行」，
 * vite 不会退出，electron 永远轮不到启动；而且没有清理逻辑，关掉窗口后 vite 还挂着。
 * 这里用脚本编排：vite 就绪 → electron；electron 退出 → 连同 vite 一起收掉。
 *
 * 用法：npm run electron:dev
 * 可覆盖：KOOLE_DEV_HOST / KOOLE_DEV_PORT
 */
import { spawn } from "node:child_process"
import { createRequire } from "node:module"
import net from "node:net"
import path from "node:path"
import process from "node:process"

const HOST = process.env.KOOLE_DEV_HOST || "127.0.0.1"
const PORT = Number(process.env.KOOLE_DEV_PORT || 5173)
const IS_WIN = process.platform === "win32"
const require = createRequire(import.meta.url)

let vite = null
let electron = null
let stopping = false

/** 轮询端口，直到 dev server 可以连接 */
function waitForPort(host, port, timeoutMs = 60_000) {
    const deadline = Date.now() + timeoutMs
    return new Promise((resolve, reject) => {
        const probe = () => {
            const socket = net.connect({ host, port })
            socket.once("connect", () => { socket.destroy(); resolve() })
            socket.once("error", () => {
                socket.destroy()
                if (Date.now() > deadline) reject(new Error(`vite dev server 在 ${timeoutMs} ms 内没有就绪（${host}:${port}）`))
                else setTimeout(probe, 250)
            })
        }
        probe()
    })
}

/** vite 启动命令：优先直接用 node 跑 vite 的 bin，这样子进程能被准确 kill 掉 */
function resolveViteCommand() {
    try {
        const pkg = require.resolve("vite/package.json")
        const bin = path.join(path.dirname(pkg), "bin", "vite.js")
        return { command: process.execPath, args: [bin, "--host", HOST, "--port", String(PORT), "--strictPort"], shell: false }
    } catch {
        return { command: IS_WIN ? "npx.cmd" : "npx", args: ["vite", "--host", HOST, "--port", String(PORT), "--strictPort"], shell: IS_WIN }
    }
}

/** 解析 electron 可执行文件；装在本地 node_modules 时直接用，否则退到 npx */
function resolveElectronCommand() {
    try {
        const bin = require("electron")
        if (typeof bin === "string" && bin.includes("electron")) {
            return { command: bin, args: ["."], shell: false }
        }
    } catch {
        // electron 没装好，走 npx 兜底（会给出更直观的报错）
    }
    return { command: IS_WIN ? "npx.cmd" : "npx", args: ["electron", "."], shell: IS_WIN }
}

/** 结束子进程；Windows 上走 npx 时子进程还有孙子进程，用 taskkill /T 连整棵树一起收 */
function killTree(child) {
    if (!child || child.killed) return
    if (IS_WIN) {
        spawn("taskkill", ["/pid", String(child.pid), "/T", "/F"], { stdio: "ignore" })
    } else {
        child.kill()
    }
}

function shutdown(code = 0) {
    if (stopping) return
    stopping = true
    killTree(electron)
    killTree(vite)
    process.exit(code)
}

process.on("SIGINT", () => shutdown(0))
process.on("SIGTERM", () => shutdown(0))

const viteCmd = resolveViteCommand()
vite = spawn(viteCmd.command, viteCmd.args, {
    stdio: "inherit",
    shell: viteCmd.shell,
})
vite.on("exit", code => {
    if (stopping) return
    console.error(`[electron:dev] vite 提前退出（code ${code}），端口可能被占用`)
    shutdown(code || 1)
})

try {
    await waitForPort(HOST, PORT)
} catch (error) {
    console.error(`[electron:dev] ${error.message}`)
    shutdown(1)
}

console.log("\n[electron:dev] vite 就绪，启动 electron ...\n")
const { command, args, shell } = resolveElectronCommand()
electron = spawn(command, args, { stdio: "inherit", shell })
electron.on("error", error => {
    console.error(`[electron:dev] electron 启动失败：${error.message}`)
    console.error("[electron:dev] 如果提示没装好，先执行 npm install（electron 需要下载二进制）")
    shutdown(1)
})
electron.on("exit", code => {
    if (stopping) return
    if (code) {
        console.error(`[electron:dev] electron 退出（code ${code}）`)
        if (code === 1) console.error("[electron:dev] 如果是首次运行，先执行 npm install 让 electron 下载好二进制")
    }
    shutdown(code || 0)
})
