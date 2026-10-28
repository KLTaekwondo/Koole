// 立体几何展示：几何体 3D 构建器（纯逻辑，不依赖 DOM）
// buildGeometry 返回 { group, vertices }，vertices 供页面用 CSS2D 渲染顶点字母标签；
// applyGeometryTheme 切换明暗主题的面/棱/顶点颜色；disposeGeometry 释放资源。

import * as THREE from "three"

// 明暗主题配色
const PALETTE = {
    light: { face: 0x9db8ec, edge: 0x3a5a8f, vertex: 0x477cdb },
    dark: { face: 0x2e4a7d, edge: 0x8fb2ea, vertex: 0x8fc8ff },
}

// 各 kind 的网格构造（世界单位；径向分段：多面体用 3/4 生成棱柱棱锥，旋转体用 32 生成光滑曲面）
const GEOMETRIES = {
    cube: () => new THREE.BoxGeometry(1.6, 1.6, 1.6),
    box: () => new THREE.BoxGeometry(2.3, 1.5, 1.0),
    prism3: () => new THREE.CylinderGeometry(1, 1, 2.1, 3),
    pyramid3: () => new THREE.ConeGeometry(1.15, 2.0, 3),
    pyramid4: () => new THREE.ConeGeometry(1.25, 2.2, 4),
    cylinder: () => new THREE.CylinderGeometry(1, 1, 2.1, 32),
    cone: () => new THREE.ConeGeometry(1.25, 2.2, 32),
    sphere: () => new THREE.SphereGeometry(1.5, 32, 24),
    frustum: () => new THREE.CylinderGeometry(0.85, 1.6, 2.1, 32), // 圆台：上小下大，母线倾斜
    pyramidFrustum: () => new THREE.CylinderGeometry(0.85, 1.6, 2.1, 4), // 正四棱台：4 段圆柱即棱台
}

export function buildGeometry(kind, isDark = false) {
    // 圆锥特殊：侧面可展开成扇形（教学要点：侧面积 = 扇形），走专属构建器，返回 unfold 供展开动画
    if (kind === "cone") return buildUnfoldableCone(isDark)

    const group = new THREE.Group()
    const palette = PALETTE[isDark ? "dark" : "light"]
    const geometry = GEOMETRIES[kind]?.()

    // 顶点字母数据：A、B、C… 从棱线端点提取（供 CSS2D 渲染跟随标签）
    let vertices = []
    let unfold = null

    if (geometry) {
        // 半透明面：从背面也能看到内部棱线，是空间感的关键
        const faceMat = new THREE.MeshStandardMaterial({
            color: palette.face,
            transparent: true,
            opacity: 0.34,
            side: THREE.DoubleSide,
            depthWrite: false,
            roughness: 0.55,
            metalness: 0.05,
        })
        const mesh = new THREE.Mesh(geometry, faceMat)
        mesh.userData.geometryTag = "face"
        group.add(mesh)

        // 多面体：EdgesGeometry 提取硬边 + 顶点球 + 顶点字母
        // 旋转体（球/圆柱）：光滑曲面，无棱无顶点，不提取边，只保留轮廓线
        const isSmooth = kind === "sphere" || kind === "cylinder" || kind === "frustum"
        if (!isSmooth) {
            const edgeGeom = new THREE.EdgesGeometry(geometry)
            const edgeMat = new THREE.LineBasicMaterial({ color: palette.edge, transparent: true, opacity: 0.95 })
            const edgeLines = new THREE.LineSegments(edgeGeom, edgeMat)
            edgeLines.userData.geometryTag = "edge"
            group.add(edgeLines)

            // 顶点小球 + 顶点字母：从棱线端点提取，避免把底面中心等非棱点当顶点
            const vertexMat = new THREE.MeshBasicMaterial({ color: palette.vertex })
            const points = extractVertices(edgeGeom)
            for (const point of points) {
                const ball = new THREE.Mesh(new THREE.SphereGeometry(0.05, 12, 10), vertexMat)
                ball.position.copy(point)
                ball.userData.geometryTag = "vertex"
                group.add(ball)
            }
            vertices = points.map((pos, index) => ({ pos, label: String.fromCharCode(65 + index) }))
        } else if (kind === "sphere") {
            // 球的三条正交大圆：帮助看出"从任何方向看都是圆"
            group.add(buildGreatCircles(1.5, palette.edge))
        }

        // 旋转体母线：帮助看出"绕轴旋转"的结构（圆锥母线在 buildUnfoldableCone 内管理）
        if (kind === "cylinder") addCylinderGeneratrices(group, palette.edge)
        else if (kind === "frustum") addCylinderGeneratrices(group, palette.edge, 0.85, 1.6, 1.05) // 圆台母线为上小下大的斜线
    }

    return { group, vertices, unfold }
}

// 从几何体顶点提取并去重；按 y 降序、同层按角度升序排列，字母分布更自然
function extractVertices(geometry) {
    const position = geometry.getAttribute("position")
    const points = []
    for (let i = 0; i < position.count; i++) {
        points.push(new THREE.Vector3(position.getX(i), position.getY(i), position.getZ(i)))
    }
    const EPS = 1e-3
    const unique = []
    for (const point of points) {
        if (!unique.some(existing => Math.abs(existing.x - point.x) < EPS && Math.abs(existing.y - point.y) < EPS && Math.abs(existing.z - point.z) < EPS)) {
            unique.push(point)
        }
    }
    unique.sort((a, b) => {
        if (Math.abs(a.y - b.y) > EPS) return b.y - a.y
        return Math.atan2(a.z, a.x) - Math.atan2(b.z, b.x)
    })
    return unique
}

// 母线：顶圆与底圆对应角度连线，3 根；默认圆柱（上下同半径、竖直母线），
// 圆台传上小下大的半径，母线变为倾斜的斜线（正好就是圆台母线 l）
function addCylinderGeneratrices(group, color, rTop = 1, rBottom = 1, halfH = 1.05) {
    const material = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.7 })
    for (const angle of [0, (2 * Math.PI) / 3, (4 * Math.PI) / 3]) {
        const tx = Math.cos(angle) * rTop
        const tz = Math.sin(angle) * rTop
        const bx = Math.cos(angle) * rBottom
        const bz = Math.sin(angle) * rBottom
        const line = new THREE.Line(
            new THREE.BufferGeometry().setFromPoints([
                new THREE.Vector3(tx, halfH, tz),
                new THREE.Vector3(bx, -halfH, bz),
            ]),
            material,
        )
        line.userData.geometryTag = "guide"
        group.add(line)
    }
}

// 圆锥母线：顶点到底圆对应角度连线，4 根（母线 l 是教学要点）
function addConeGeneratrices(group, radius, height, color) {
    const material = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.7 })
    for (const angle of [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2]) {
        const x = Math.cos(angle) * radius
        const z = Math.sin(angle) * radius
        const line = new THREE.Line(
            new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, height / 2, 0), new THREE.Vector3(x, -height / 2, z)]),
            material,
        )
        line.userData.geometryTag = "guide"
        group.add(line)
    }
}

// 可展开圆锥：侧面/底面用手搓三角形网格（每个三角形独立顶点，便于展开动画逐点更新）
// 展开原理：扇形圆心角由弧长守恒决定（扇形弧长 l·θ = 底面周长 2πr），即 θ = 2πr/l
function buildUnfoldableCone(isDark) {
    const palette = PALETTE[isDark ? "dark" : "light"]
    const R = 1.25 // 底面半径
    const H = 2.2 // 锥高
    const SEG = 32 // 径向分段
    const tip = new THREE.Vector3(0, H / 2, 0) // 锥尖
    const l = Math.sqrt(R * R + H * H) // 母线长
    const thetaFlat = (2 * Math.PI * R) / l // 扇形圆心角（弧度）

    const faceMat = new THREE.MeshStandardMaterial({
        color: palette.face,
        transparent: true,
        opacity: 0.34,
        side: THREE.DoubleSide,
        depthWrite: false,
        roughness: 0.55,
        metalness: 0.05,
    })

    // 侧面：SEG 个三角形（tip, p_i, p_{i+1}），顶点不共享
    const sideGeo = new THREE.BufferGeometry()
    const sidePos = new Float32Array(SEG * 9)
    sideGeo.setAttribute("position", new THREE.BufferAttribute(sidePos, 3))
    // 底面：SEG 个三角形（center, p_i, p_{i+1}），顶点不共享
    const bottomGeo = new THREE.BufferGeometry()
    const bottomPos = new Float32Array(SEG * 9)
    bottomGeo.setAttribute("position", new THREE.BufferAttribute(bottomPos, 3))

    const group = new THREE.Group()
    for (const geo of [sideGeo, bottomGeo]) {
        const mesh = new THREE.Mesh(geo, faceMat)
        mesh.userData.geometryTag = "face"
        group.add(mesh)
    }

    // 母线：闭合时的辅助线；展开成扇形后母线即扇形半径，展开时隐藏
    const guideLines = new THREE.Group()
    addConeGeneratrices(guideLines, R, H, palette.edge)
    group.add(guideLines)

    // 展开轮廓线：扇形外弧 + 两条半径（一条闭合折线）+ 底面圆环，随展开渐显，让展开图形状清晰
    const outlineMat = new THREE.LineBasicMaterial({ color: palette.edge, transparent: true, opacity: 0 })
    const fanGeo = new THREE.BufferGeometry()
    fanGeo.setAttribute("position", new THREE.BufferAttribute(new Float32Array((SEG + 2) * 3), 3))
    const fanLine = new THREE.Line(fanGeo, outlineMat)
    fanLine.userData.geometryTag = "guide"
    const circleGeo = new THREE.BufferGeometry()
    circleGeo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(SEG * 3), 3))
    const circleLine = new THREE.LineLoop(circleGeo, outlineMat)
    circleLine.userData.geometryTag = "guide"
    group.add(fanLine, circleLine)

    // 母线标注线：从锥尖伸到外弧中点，醒目金色，让"母线 = 扇形半径"一眼可见
    // 用细长 Box（WebGL 的 linewidth 恒为 1px 无法加粗），随展开渐显
    const genBarMat = new THREE.MeshBasicMaterial({ color: 0xe8bd6a, transparent: true, opacity: 0 })
    const genBar = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), genBarMat)
    genBar.userData.geometryTag = "guide"
    group.add(genBar)

    // 每个底面顶点的闭合位置 + 展开方向（扇形以锥尖为圆心、母线 l 为半径，在竖直 yz 平面摊开）
    // 先建完整数组，再填充三角形——避免在数组未建完时引用下一个点
    const closePts = []
    const flatDirs = []
    for (let i = 0; i < SEG; i++) {
        const a = (i / SEG) * Math.PI * 2
        closePts.push(new THREE.Vector3(R * Math.cos(a), -H / 2, R * Math.sin(a)))
        // 弧长守恒：底面角度 a 对应扇形角度 a·(R/l)，整体居中使扇形关于 -y（向下）对称
        // 向下张开让展开图贴近视口中部，避免向上张得太高导致相机拉远变小
        const beta = a * (R / l) - thetaFlat / 2
        flatDirs.push(new THREE.Vector3(0, -Math.cos(beta), -Math.sin(beta)))
    }
    for (let i = 0; i < SEG; i++) {
        const j = (i + 1) % SEG
        const b = i * 9
        const p = closePts[i]
        const q = closePts[j]
        // 侧面 (tip, p_i, p_{i+1})
        sidePos[b + 0] = tip.x; sidePos[b + 1] = tip.y; sidePos[b + 2] = tip.z
        sidePos[b + 3] = p.x; sidePos[b + 4] = p.y; sidePos[b + 5] = p.z
        sidePos[b + 6] = q.x; sidePos[b + 7] = q.y; sidePos[b + 8] = q.z
        // 底面 (center, p_i, p_{i+1})
        bottomPos[b + 0] = 0; bottomPos[b + 1] = -H / 2; bottomPos[b + 2] = 0
        bottomPos[b + 3] = p.x; bottomPos[b + 4] = p.y; bottomPos[b + 5] = p.z
        bottomPos[b + 6] = q.x; bottomPos[b + 7] = q.y; bottomPos[b + 8] = q.z
    }
    sideGeo.computeVertexNormals()
    bottomGeo.computeVertexNormals()

    const unfold = {
        tip, l, SEG,
        closePts, flatDirs,
        sideGeo, bottomGeo,
        guideLines,
        fanLine, circleLine, outlineMat,
        genBar, genBarMat,
        // 展开标注锚点：母线（对称半径中点）与外弧中点，由 setConeUnfold 每帧更新
        anchors: {
            genMid: new THREE.Vector3(),
            arcMid: new THREE.Vector3(),
        },
        bottomCenter: {
            close: new THREE.Vector3(0, -H / 2, 0),
            // 展开后底面圆与扇形同平面（竖直 yz 平面）、水平摊在扇形开口下方
            flat: new THREE.Vector3(0, tip.y - l - R - 0.6, 0),
        },
    }

    return { group, vertices: [], unfold }
}

// 更新圆锥展开程度 t（0=闭合锥体，1=完全展开成扇形 + 底面圆）
export function setConeUnfold(unfold, t) {
    const { tip, l, SEG, closePts, flatDirs, sideGeo, bottomGeo, guideLines, fanLine, circleLine, outlineMat, genBar, genBarMat, anchors, bottomCenter } = unfold

    // 底面圆周顶点：从闭合方向插值到扇形方向并归一化，保持距锥尖恒为母线长（纸面不变形）
    const pts = []
    for (let i = 0; i < SEG; i++) {
        const dir = new THREE.Vector3().copy(closePts[i]).sub(tip).normalize().lerp(flatDirs[i], t).normalize()
        pts.push(new THREE.Vector3().copy(tip).addScaledVector(dir, l))
    }
    // 底面圆心：从锥底位置平移到扇形下方
    const center = new THREE.Vector3().lerpVectors(bottomCenter.close, bottomCenter.flat, t)

    const sidePos = sideGeo.attributes.position.array
    const bottomPos = bottomGeo.attributes.position.array
    for (let i = 0; i < SEG; i++) {
        const j = (i + 1) % SEG
        const b = i * 9
        // 侧面：锥尖固定，更新两个底面顶点
        sidePos[b + 3] = pts[i].x; sidePos[b + 4] = pts[i].y; sidePos[b + 5] = pts[i].z
        sidePos[b + 6] = pts[j].x; sidePos[b + 7] = pts[j].y; sidePos[b + 8] = pts[j].z
        // 底面：中心 + 竖直圆周（yz 平面，与扇形同平面，圆周偏移 = closePts 的 x→y、z→z）
        bottomPos[b + 0] = center.x; bottomPos[b + 1] = center.y; bottomPos[b + 2] = center.z
        bottomPos[b + 3] = center.x; bottomPos[b + 4] = center.y + closePts[i].x; bottomPos[b + 5] = center.z + closePts[i].z
        bottomPos[b + 6] = center.x; bottomPos[b + 7] = center.y + closePts[j].x; bottomPos[b + 8] = center.z + closePts[j].z
    }
    sideGeo.attributes.position.needsUpdate = true
    bottomGeo.attributes.position.needsUpdate = true
    sideGeo.computeVertexNormals()
    bottomGeo.computeVertexNormals()

    // 扇形轮廓线：tip → 外弧各点 → 回到 tip（一条闭合折线 = 两条半径 + 外弧）
    const fanPos = fanLine.geometry.attributes.position.array
    fanPos[0] = tip.x; fanPos[1] = tip.y; fanPos[2] = tip.z
    for (let i = 0; i < SEG; i++) {
        fanPos[(i + 1) * 3 + 0] = pts[i].x
        fanPos[(i + 1) * 3 + 1] = pts[i].y
        fanPos[(i + 1) * 3 + 2] = pts[i].z
    }
    fanPos[(SEG + 1) * 3 + 0] = tip.x; fanPos[(SEG + 1) * 3 + 1] = tip.y; fanPos[(SEG + 1) * 3 + 2] = tip.z
    fanLine.geometry.attributes.position.needsUpdate = true
    // 底面圆环：与底面网格同一圆周
    const circlePos = circleLine.geometry.attributes.position.array
    for (let i = 0; i < SEG; i++) {
        circlePos[i * 3 + 0] = center.x
        circlePos[i * 3 + 1] = center.y + closePts[i].x
        circlePos[i * 3 + 2] = center.z + closePts[i].z
    }
    circleLine.geometry.attributes.position.needsUpdate = true

    // 展开标注锚点：母线取扇形对称半径中点，弧长取外弧中点外侧（说明"半径=母线、弧长=底面周长"）
    const midP = pts[SEG >> 1]
    // 母线标注线：锥尖 → 外弧中点，渐显（金色细棒）
    const dir = midP.clone().sub(tip).normalize()
    const genLen = tip.distanceTo(midP)
    genBar.visible = t > 0.15
    if (genBar.visible) {
        genBar.position.copy(tip).lerp(midP, 0.5)
        genBar.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir)
        genBar.scale.set(0.05, genLen, 0.05)
        genBarMat.opacity = Math.min(1, (t - 0.15) / 0.25)
    }
    anchors.genMid.copy(tip).lerp(midP, 0.62) // 母线标签浮在线外侧，避开线体
    anchors.arcMid.copy(tip).lerp(midP, 1.16)

    // 轮廓线随展开渐显，母线在完全展开后隐藏
    outlineMat.opacity = t
    guideLines.visible = t < 0.01
}

// 球的三条正交大圆：帮助看出"从任何方向看都是圆"
function buildGreatCircles(radius, color) {
    const group = new THREE.Group()
    const material = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.75 })
    const segments = 96
    for (const axis of ["y", "x", "z"]) {
        const points = []
        for (let i = 0; i <= segments; i++) {
            const angle = (i / segments) * Math.PI * 2
            if (axis === "y") points.push(new THREE.Vector3(Math.cos(angle) * radius, 0, Math.sin(angle) * radius))
            else if (axis === "x") points.push(new THREE.Vector3(0, Math.cos(angle) * radius, Math.sin(angle) * radius))
            else points.push(new THREE.Vector3(Math.cos(angle) * radius, Math.sin(angle) * radius, 0))
        }
        const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), material)
        line.userData.geometryTag = "guide"
        group.add(line)
    }
    return group
}

// 明暗主题切换：按 geometryTag 更新面/棱/顶点颜色
export function applyGeometryTheme(group, isDark) {
    const palette = PALETTE[isDark ? "dark" : "light"]
    group.traverse(child => {
        const tag = child.userData?.geometryTag
        if (!tag || !child.material) return
        if (tag === "face") child.material.color.setHex(palette.face)
        else if (tag === "edge" || tag === "guide") child.material.color.setHex(palette.edge)
        else if (tag === "vertex") child.material.color.setHex(palette.vertex)
    })
}

// 释放几何体与材质
export function disposeGeometry(group) {
    group.traverse(child => {
        child.geometry?.dispose()
        if (Array.isArray(child.material)) child.material.forEach(material => material.dispose())
        else child.material?.dispose()
    })
}
