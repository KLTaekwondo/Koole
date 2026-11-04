/**
 * 实验数据系统的测试脚本
 *
 *   node scripts/test-data.mjs
 *
 * 覆盖：采样频率、三种结算、抽稀、事件、snapshot、内存存储的上限与增删改。
 */

import { createExperimentSampler, decimatePoints, SAMPLE_INTERVAL, MAX_POINTS } from "../src/Logic/physics/data/sampler.mjs"
import { runs, addRun, removeRun, renameRun, clearModelRuns, MAX_PER_MODEL } from "../src/stores/experiments.js"

let passed = 0
let failed = 0

function check(name, condition, detail = "") {
    if (condition) {
        passed++
        console.log(`  ✓ ${name}`)
    } else {
        failed++
        console.log(`  ✗ ${name}${detail ? " → " + detail : ""}`)
    }
}

// ── 1. 用真实单摆方程生成 12 秒数据 ──
const spec = {
    kind: "series",
    settle: "window",
    windowSeconds: 10,
    series: [{ key: "theta", label: "摆角", unit: "°", sample: s => (s.theta * 180) / Math.PI }],
    metrics: [{ key: "period", label: "理论周期", unit: "s", compute: (s, p) => 2 * Math.PI * Math.sqrt(p.length / p.gravity) }],
    events: [{ key: "crossing", label: "过最低点", detect: (s, prev) => prev.omega * s.omega < 0 }],
}

const params = { length: 2, gravity: 9.8 }
const state = { theta: 0.5, omega: 0 }
const omega0 = Math.sqrt(params.gravity / params.length)
const dt = 1 / 60
let simTime = 0
const sampler = createExperimentSampler(spec, { modelId: "pendulum", modelName: "单摆" })
const records = []

for (let step = 0; step < 12 * 60; step++) {
    simTime += dt
    state.theta = 0.5 * Math.cos(omega0 * simTime)
    state.omega = -0.5 * omega0 * Math.sin(omega0 * simTime)
    sampler.tick({ state, params, simTime })
    const trigger = sampler.shouldSettle({ simTime, isFinished: false })
    if (trigger) {
        const record = sampler.settle({ state, params, simTime, trigger })
        if (record) records.push(record)
    }
}

console.log("\n[1] series + window 结算")
check("12 秒内结算 1 条（10 秒窗口）", records.length === 1, `实际 ${records.length} 条`)
const first = records[0]
check("记录形态为 series", first?.kind === "series")
check("触发来源为 window", first?.trigger === "window")
check("时长约 10 秒", Math.abs((first?.duration ?? 0) - 10) < 0.2, `实际 ${first?.duration}`)
check(
    "采样接近 20Hz（200 个点 ±5%）",
    Math.abs((first?.series[0]?.points.length ?? 0) - 200) <= 10,
    `实际 ${first?.series[0]?.points.length} 点`
)
check("指标算出了理论周期", Math.abs((first?.metrics[0]?.value ?? 0) - 2.8385) < 0.01, `实际 ${first?.metrics[0]?.value}`)
check("事件被记录（过最低点）", (first?.events?.length ?? 0) >= 5, `实际 ${first?.events?.length} 个`)

// ── 2. finish / timeout / snapshot ──
console.log("\n[2] 结算条件")
const finishSampler = createExperimentSampler({ kind: "series", settle: "finish", series: spec.series }, { modelId: "free-fall" })
check("finish 模式：未结束不结算", finishSampler.shouldSettle({ simTime: 3, isFinished: false }) === null)
check("finish 模式：结束即结算", finishSampler.shouldSettle({ simTime: 3, isFinished: true }) === "finish")
check("finish 模式：超过 60 秒兜底", finishSampler.shouldSettle({ simTime: 61, isFinished: false }) === "timeout")

const snapshotSampler = createExperimentSampler(
    { kind: "snapshot", metrics: [{ key: "theta2", label: "折射角", unit: "°", compute: () => 22.1 }] },
    { modelId: "refraction" }
)
const snapshot = snapshotSampler.snapshot({ state: {}, params: { incidentAngle: 30 }, simTime: 0 })
check("snapshot 能产出记录", Boolean(snapshot))
check("snapshot 只有指标、没有序列", snapshot?.metrics?.length === 1 && snapshot?.series?.length === 0)
check("snapshot 不参与自动结算", snapshotSampler.shouldSettle({ simTime: 99, isFinished: true }) === null)

// ── 3. 抽稀 ──
console.log("\n[3] 抽稀")
const many = Array.from({ length: 1500 }, (_, i) => [i * SAMPLE_INTERVAL, i])
const reduced = decimatePoints(many)
check("超过上限会被抽稀", reduced.length <= MAX_POINTS, `实际 ${reduced.length}`)
check("保留首尾点", reduced[0][0] === 0 && reduced.at(-1)[1] === 1499)

// ── 4. 内存存储 ──
console.log("\n[4] 内存存储")
clearModelRuns("pendulum")
runs.value = []
const makeRun = i => ({
    id: `t_${i}`,
    modelId: "pendulum",
    modelName: "单摆",
    createdAt: 1000 + i,
    params: { length: i },
    metrics: [],
    series: [],
    events: [],
    duration: 10,
    kind: "series",
    trigger: "window",
})
for (let i = 0; i < MAX_PER_MODEL + 3; i++) addRun(makeRun(i))
const mine = runs.value.filter(r => r.modelId === "pendulum")
check(`超过 ${MAX_PER_MODEL} 条会淘汰最旧`, mine.length === MAX_PER_MODEL, `实际 ${mine.length}`)
check("最旧的那条已不在", !mine.some(r => r.id === "t_0"))
check("自动编号为「模拟 N」", mine[0].label.startsWith("模拟 "))

const target = mine[0]
renameRun(target.id, "第一组参数")
check("可以改名", runs.value.find(r => r.id === target.id)?.label === "第一组参数")
removeRun(target.id)
check("可以删除", !runs.value.some(r => r.id === target.id))

clearModelRuns("pendulum")
check("可以按模型清空", runs.value.filter(r => r.modelId === "pendulum").length === 0)

// ── 汇总 ──
console.log(`\n结果：${passed} 通过 / ${failed} 失败`)
process.exit(failed === 0 ? 0 : 1)
