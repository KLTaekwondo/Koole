/**
 * ViewKit —— 模型绘制用的「场景 API」
 *
 * 设计目标：
 *   1. 一次调用就能把舞台画完（背景 / 网格 / 地面），模型不用管；
 *   2. 尺寸分两种：世界单位（随缩放变化）和像素（标注、线宽，永远清晰）；
 *   3. 环境（地面 / 水面 / 光轴）由外部传入，模型不硬编码舞台。
 *
 * 坐标约定：世界 y = 0 就是「地面 / 水面 / 光轴」所在的线，
 *          具体落在屏幕哪个 y 由 ViewTransform 决定（缩放时不动）。
 */

const THEME_LIGHT = {
  bg: "#f8f9fa",
  grid: "#e8e8e8",
  ground: "#2c3e50",
  groundLine: "#34495e",
  text: "#2c3e50",
  muted: "#7f8c8d",
  sky: "#eaf2fb",
  water: "#cfe6f7",
  waterLine: "#4aa3df",
  accent: "#3b82f6",
  body: "#e74c3c",
  rope: "#999999",
  soft: "rgba(0,0,0,0.12)",
}

const THEME_DARK = {
  bg: "#2a2a2a",
  grid: "#444444",
  ground: "#444444",
  groundLine: "#555555",
  text: "#e0e0e0",
  muted: "#9aa0a6",
  sky: "#26313d",
  water: "#23405c",
  waterLine: "#5aa9e6",
  accent: "#60a5fa",
  body: "#ff6b6b",
  rope: "#bbbbbb",
  soft: "rgba(255,255,255,0.14)",
}

export function palette(theme) {
  return theme === "dark" ? THEME_DARK : THEME_LIGHT
}

/**
 * @param {Object} options
 * @param {CanvasRenderingContext2D} options.ctx
 * @param {number} options.cw 画布逻辑宽
 * @param {number} options.ch 画布逻辑高
 * @param {Object} options.viewTransform 提供 worldToScreen / pixelPerUnit / offsetX / offsetY
 * @param {string} options.theme "light" | "dark"
 */
export function createView({ ctx, cw, ch, viewTransform, theme }) {
  const paletteColors = palette(theme)
  const { worldToScreen, pixelPerUnit, offsetX, offsetY } = viewTransform

  /** 世界坐标 → 屏幕坐标 */
  const toScreen = (x, y) => worldToScreen(x, y)
  /** 一世界单位对应多少像素 */
  const unit = () => pixelPerUnit()
  /** 标注尺寸：不随缩放变化的像素值 */
  const px = (n) => n
  /** 世界长度 → 像素长度（用于箭头长度等） */
  const len = (meters) => meters * unit()
  /** 世界 y = 0 对应的屏幕 y */
  const anchorY = () => ch - 40 + offsetY.value

  /** 世界 y 对应的屏幕 y（不含偏移计算，便于画分界线） */
  const screenYOf = (worldY) => anchorY() - worldY * unit()
  /** 屏幕 y → 世界 y（光学图按画面居中排版时用） */
  const worldYAt = (screenY) => (anchorY() - screenY) / unit()

  const view = {
    ctx,
    cw,
    ch,
    colors: paletteColors,
    theme,
    unit,
    px,
    len,
    toScreen,
    screenYOf,
    worldYAt,
    anchorY,

    // ── 背景与舞台 ──────────────────────────────
    /** 铺底色 */
    background(color = paletteColors.bg) {
      ctx.fillStyle = color
      ctx.fillRect(0, 0, cw, ch)
    },

    /** 世界坐标网格：step 单位为米 */
    grid({ step = 1, color = paletteColors.grid, width = 0.5 } = {}) {
      const u = unit()
      const x0 = (-cw / 2 - offsetX.value) / u
      const x1 = (cw / 2 - offsetX.value) / u
      const yBase = anchorY()
      const yTop = (yBase - 0) / u
      ctx.save()
      ctx.strokeStyle = color
      ctx.lineWidth = width
      for (let wx = Math.floor(x0); wx <= Math.ceil(x1); wx += step) {
        const sx = cw / 2 + wx * u + offsetX.value
        ctx.beginPath()
        ctx.moveTo(sx, 0)
        ctx.lineTo(sx, ch)
        ctx.stroke()
      }
      for (let wy = 0; wy <= Math.ceil(yTop); wy += step) {
        const sy = yBase - wy * u
        ctx.beginPath()
        ctx.moveTo(0, sy)
        ctx.lineTo(cw, sy)
        ctx.stroke()
      }
      ctx.restore()
    },

    /** 世界 y 以下填充色块（水面以下、地面以下） */
    fillBelow(worldY, color) {
      const sy = screenYOf(worldY)
      ctx.fillStyle = color
      ctx.fillRect(0, sy, cw, ch - sy)
    },

    /** 横线：画在世界坐标某高度上 */
    horizontalLine(worldY, { color = paletteColors.groundLine, width = 2, dash = null } = {}) {
      const sy = screenYOf(worldY)
      ctx.save()
      ctx.strokeStyle = color
      ctx.lineWidth = width
      if (dash) ctx.setLineDash(dash)
      ctx.beginPath()
      ctx.moveTo(0, sy)
      ctx.lineTo(cw, sy)
      ctx.stroke()
      ctx.restore()
    },

    // ── 图元 ──────────────────────────────
    /** 线段（世界坐标端点） */
    line(from, to, { color = paletteColors.text, width = 1.5, dash = null, alpha = 1 } = {}) {
      const a = toScreen(from[0], from[1])
      const b = toScreen(to[0], to[1])
      ctx.save()
      ctx.globalAlpha = alpha
      ctx.strokeStyle = color
      ctx.lineWidth = width
      ctx.lineCap = "round"
      if (dash) ctx.setLineDash(dash)
      ctx.beginPath()
      ctx.moveTo(a.x, a.y)
      ctx.lineTo(b.x, b.y)
      ctx.stroke()
      ctx.restore()
    },

    /** 圆：半径按世界单位，随缩放真实变化 */
    circle(at, radiusWorld, { fill = null, stroke = null, width = 1.5, dash = null } = {}) {
      const p = toScreen(at[0], at[1])
      ctx.save()
      ctx.beginPath()
      ctx.arc(p.x, p.y, Math.max(0.5, radiusWorld * unit()), 0, Math.PI * 2)
      if (fill) {
        ctx.fillStyle = fill
        ctx.fill()
      }
      if (stroke) {
        ctx.strokeStyle = stroke
        ctx.lineWidth = width
        if (dash) ctx.setLineDash(dash)
        ctx.stroke()
      }
      ctx.restore()
    },

    /** 点：半径固定像素（用于关节、端点标记） */
    point(at, { r = 4, color = paletteColors.text } = {}) {
      const p = toScreen(at[0], at[1])
      ctx.save()
      ctx.beginPath()
      ctx.arc(p.x, p.y, r, 0, Math.PI * 2)
      ctx.fillStyle = color
      ctx.fill()
      ctx.restore()
    },

    /**
     * 箭头：起点终点为世界坐标，箭头头部固定像素大小
     * @param {Array<number>} from
     * @param {Array<number>} to
     */
    arrow(from, to, { color = paletteColors.accent, width = 2, head = 8, dash = null } = {}) {
      const a = toScreen(from[0], from[1])
      const b = toScreen(to[0], to[1])
      const dx = b.x - a.x
      const dy = b.y - a.y
      const dist = Math.hypot(dx, dy)
      if (dist < 0.5) return
      const angle = Math.atan2(dy, dx)
      ctx.save()
      ctx.strokeStyle = color
      ctx.fillStyle = color
      ctx.lineWidth = width
      ctx.lineCap = "round"
      if (dash) ctx.setLineDash(dash)
      ctx.beginPath()
      ctx.moveTo(a.x, a.y)
      ctx.lineTo(b.x - Math.cos(angle) * head * 0.6, b.y - Math.sin(angle) * head * 0.6)
      ctx.stroke()
      ctx.setLineDash([])
      ctx.beginPath()
      ctx.moveTo(b.x, b.y)
      ctx.lineTo(b.x - head * Math.cos(angle - 0.4), b.y - head * Math.sin(angle - 0.4))
      ctx.lineTo(b.x - head * Math.cos(angle + 0.4), b.y - head * Math.sin(angle + 0.4))
      ctx.closePath()
      ctx.fill()
      ctx.restore()
    },

    /** 角度弧：圆心与半径用世界单位，便于贴合实际几何 */
    arcAngle(center, radiusWorld, fromAngle, toAngle, { color = paletteColors.soft, width = 1.2, dash = null } = {}) {
      const c = toScreen(center[0], center[1])
      ctx.save()
      ctx.strokeStyle = color
      ctx.lineWidth = width
      if (dash) ctx.setLineDash(dash)
      ctx.beginPath()
      ctx.arc(c.x, c.y, Math.max(1, radiusWorld * unit()), fromAngle, toAngle)
      ctx.stroke()
      ctx.restore()
    },

    /** 虚线：世界坐标端点 */
    dashed(from, to, options = {}) {
      view.line(from, to, { ...options, dash: options.dash || [4, 4] })
    },

    /** 文本：锚点用世界坐标，字号固定像素 */
    text(content, at, { color = paletteColors.text, size = 12, align = "center", baseline = "middle", weight = 500, offsetX: ox = 0, offsetY: oy = 0 } = {}) {
      const p = toScreen(at[0], at[1])
      ctx.save()
      ctx.fillStyle = color
      ctx.font = `${weight} ${size}px system-ui, -apple-system, "Segoe UI", sans-serif`
      ctx.textAlign = align
      ctx.textBaseline = baseline
      ctx.fillText(content, p.x + ox, p.y + oy)
      ctx.restore()
    },

    /** 数值气泡：标注数值用，字号固定像素 */
    badge(content, at, { bg = "rgba(255,255,255,0.92)", color = paletteColors.text, size = 11, offsetX: ox = 0, offsetY: oy = -18 } = {}) {
      const p = toScreen(at[0], at[1])
      ctx.save()
      ctx.font = `600 ${size}px system-ui, -apple-system, "Segoe UI", sans-serif`
      const w = ctx.measureText(content).width + 12
      const h = size + 10
      const x = p.x + ox - w / 2
      const y = p.y + oy - h / 2
      ctx.fillStyle = bg
      ctx.beginPath()
      if (ctx.roundRect) ctx.roundRect(x, y, w, h, 6)
      else ctx.rect(x, y, w, h)
      ctx.fill()
      ctx.fillStyle = color
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.fillText(content, x + w / 2, y + h / 2)
      ctx.restore()
    },

    /** 轨迹：分段渐隐，越新越亮（最多画最近 900 点） */
    trail(points, { color = "#e74c3c", width = 2.4, maxPoints = 900 } = {}) {
      if (!points || points.length < 2) return
      const visible = points.length > maxPoints ? points.slice(-maxPoints) : points
      const buckets = 8
      const size = Math.ceil(visible.length / buckets)
      ctx.save()
      ctx.strokeStyle = color
      ctx.lineWidth = width
      ctx.lineJoin = "round"
      ctx.lineCap = "round"
      for (let b = 0; b < buckets; b++) {
        const start = b * size
        const end = Math.min(visible.length, start + size + 1)
        if (end - start < 2) continue
        ctx.beginPath()
        for (let i = start; i < end; i++) {
          const p = toScreen(visible[i][0], visible[i][1])
          if (i === start) ctx.moveTo(p.x, p.y)
          else ctx.lineTo(p.x, p.y)
        }
        ctx.globalAlpha = 0.05 + 0.5 * ((b + 1) / buckets)
        ctx.stroke()
      }
      ctx.restore()
    },

    /** 折线（世界坐标点数组） */
    polyline(points, { color = paletteColors.text, width = 1.5, dash = null, fill = null } = {}) {
      if (points.length < 2) return
      ctx.save()
      ctx.beginPath()
      points.forEach(([wx, wy], i) => {
        const p = toScreen(wx, wy)
        if (i === 0) ctx.moveTo(p.x, p.y)
        else ctx.lineTo(p.x, p.y)
      })
      if (fill) {
        ctx.closePath()
        ctx.fillStyle = fill
        ctx.fill()
      }
      if (color) {
        ctx.strokeStyle = color
        ctx.lineWidth = width
        if (dash) ctx.setLineDash(dash)
        ctx.stroke()
      }
      ctx.restore()
    },
  }

  return view
}
