// ================================================================
// 模型注册表 — 添加新模型在这里注册即可
// ================================================================

import Ball from '../physics/core/Ball.js'
import Box from '../physics/core/Box.js'
import Triangle from '../physics/core/Triangle.js'
import SpringMass from '../physics/core/SpringMass.js'
import Pendulum from '../physics/core/Pendulum.js'
import Ramp from '../physics/core/Ramp.js'
import ballIcon from '../assets/icons/model-ball.svg?raw'
import boxIcon from '../assets/icons/model-box.svg?raw'
import triangleIcon from '../assets/icons/model-triangle.svg?raw'
import springIcon from '../assets/icons/model-spring.svg?raw'
import pendulumIcon from '../assets/icons/model-pendulum.svg?raw'
import rampIcon from '../assets/icons/model-ramp.svg?raw'

const MODEL_TYPES = [
  {
    id: 'ball',
    name: '球',
    icon: '⚪',
    iconSvg: ballIcon,
    description: '圆形物体，支持弹性碰撞',
    defaultColor: '#3498db',
    create(x, y) {
      const obj = new Ball(x, y, 20)
      obj.color = this.defaultColor
      obj.setAcceleration(0, 0)
      return obj
    },
    drawGhost(ctx, x, y, alpha = 0.5) {
      ctx.save()
      ctx.globalAlpha = alpha
      ctx.beginPath()
      ctx.arc(x, y, 20, 0, Math.PI * 2)
      ctx.fillStyle = this.defaultColor
      ctx.fill()
      ctx.strokeStyle = '#2980b9'
      ctx.lineWidth = 2
      ctx.setLineDash([4, 4])
      ctx.stroke()
      ctx.setLineDash([])
      ctx.restore()
    },
    hitTest(obj, mx, my) {
      const dx = mx - obj.pos.x
      const dy = my - obj.pos.y
      return Math.sqrt(dx * dx + dy * dy) <= obj.radius
    },
    drawHighlight(ctx, obj) {
      ctx.save()
      ctx.beginPath()
      ctx.arc(obj.pos.x, obj.pos.y, obj.radius + 4, 0, Math.PI * 2)
      ctx.strokeStyle = '#f39c12'
      ctx.lineWidth = 2.5
      ctx.setLineDash([5, 3])
      ctx.stroke()
      ctx.setLineDash([])
      ctx.restore()
    },
    clampToBounds(obj, cw, ch) {
      const r = obj.radius
      let hit = false
      if (obj.pos.y + r > ch) { obj.pos.y = ch - r; obj.velocity.y = -obj.velocity.y; hit = true }
      if (obj.pos.y - r < 0) { obj.pos.y = r; obj.velocity.y = -obj.velocity.y; hit = true }
      if (obj.pos.x + r > cw) { obj.pos.x = cw - r; obj.velocity.x = -obj.velocity.x; hit = true }
      if (obj.pos.x - r < 0) { obj.pos.x = r; obj.velocity.x = -obj.velocity.x; hit = true }
      return hit
    },
  },
  {
    id: 'box',
    name: '方块',
    icon: '◼',
    iconSvg: boxIcon,
    description: '矩形物体，可调节宽高',
    defaultColor: '#e74c3c',
    create(x, y) {
      const obj = new Box(x, y, 40, 40)
      obj.color = this.defaultColor
      obj.setAcceleration(0, 0)
      return obj
    },
    drawGhost(ctx, x, y, alpha = 0.5) {
      ctx.save()
      ctx.globalAlpha = alpha
      const w = 40, h = 40
      ctx.beginPath()
      ctx.rect(x - w / 2, y - h / 2, w, h)
      ctx.fillStyle = this.defaultColor
      ctx.fill()
      ctx.strokeStyle = '#c0392b'
      ctx.lineWidth = 2
      ctx.setLineDash([4, 4])
      ctx.stroke()
      ctx.setLineDash([])
      ctx.restore()
    },
    hitTest(obj, mx, my) {
      const dx = mx - obj.pos.x, dy = my - obj.pos.y
      if (obj.angle) {
        const cos = Math.cos(-obj.angle), sin = Math.sin(-obj.angle)
        const lx = dx * cos - dy * sin, ly = dx * sin + dy * cos
        return Math.abs(lx) <= obj.width / 2 && Math.abs(ly) <= obj.height / 2
      }
      return Math.abs(dx) <= obj.width / 2 && Math.abs(dy) <= obj.height / 2
    },
    drawHighlight(ctx, obj) {
      ctx.save()
      ctx.translate(obj.pos.x, obj.pos.y)
      if (obj.angle) ctx.rotate(obj.angle)
      const hw = obj.width / 2 + 4
      const hh = obj.height / 2 + 4
      ctx.beginPath()
      ctx.rect(-hw, -hh, hw * 2, hh * 2)
      ctx.strokeStyle = '#f39c12'
      ctx.lineWidth = 2.5
      ctx.setLineDash([5, 3])
      ctx.stroke()
      ctx.setLineDash([])
      ctx.restore()
    },
    clampToBounds(obj, cw, ch) {
      const r = obj.reactRadius || Math.max(obj.width, obj.height) / 2
      let hit = false
      if (obj.pos.y + r > ch) { obj.pos.y = ch - r; obj.velocity.y = -obj.velocity.y; hit = true }
      if (obj.pos.y - r < 0) { obj.pos.y = r; obj.velocity.y = -obj.velocity.y; hit = true }
      if (obj.pos.x + r > cw) { obj.pos.x = cw - r; obj.velocity.x = -obj.velocity.x; hit = true }
      if (obj.pos.x - r < 0) { obj.pos.x = r; obj.velocity.x = -obj.velocity.x; hit = true }
      return hit
    },
  },
  // ── 3. 三角形 / 楔形 ──
  {
    id: 'triangle',
    name: '三角形',
    icon: '△',
    iconSvg: triangleIcon,
    description: '楔形物体，可用作斜坡、障碍物',
    defaultColor: '#2ecc71',
    create(x, y) {
      const obj = new Triangle(x, y, 44, 44)
      obj.color = this.defaultColor
      obj.setAcceleration(0, 0)
      return obj
    },
    drawGhost(ctx, x, y, alpha = 0.5) {
      ctx.save()
      ctx.globalAlpha = alpha
      ctx.beginPath()
      ctx.moveTo(x, y - 22)
      ctx.lineTo(x - 22, y + 22)
      ctx.lineTo(x + 22, y + 22)
      ctx.closePath()
      ctx.fillStyle = this.defaultColor
      ctx.fill()
      ctx.strokeStyle = '#27ae60'
      ctx.lineWidth = 2
      ctx.setLineDash([4, 4])
      ctx.stroke()
      ctx.setLineDash([])
      ctx.restore()
    },
    hitTest(obj, mx, my) {
      const vertices = obj.getVertices()
      const signs = vertices.map((vertex, index) => {
        const next = vertices[(index + 1) % vertices.length]
        return (mx - vertex.x) * (next.y - vertex.y) - (my - vertex.y) * (next.x - vertex.x)
      })
      return signs.every(sign => sign >= -0.0001) || signs.every(sign => sign <= 0.0001)
    },
    drawHighlight(ctx, obj) {
      ctx.save()
      const hw = obj.width / 2 + 4
      const hh = obj.height / 2 + 4
      ctx.beginPath()
      ctx.moveTo(obj.pos.x, obj.pos.y - hh)
      ctx.lineTo(obj.pos.x - hw, obj.pos.y + hh)
      ctx.lineTo(obj.pos.x + hw, obj.pos.y + hh)
      ctx.closePath()
      ctx.strokeStyle = '#f39c12'
      ctx.lineWidth = 2.5
      ctx.setLineDash([5, 3])
      ctx.stroke()
      ctx.setLineDash([])
      ctx.restore()
    },
    clampToBounds(obj, cw, ch) {
      const hw = obj.width / 2
      const hh = obj.height / 2
      let hit = false
      if (obj.pos.y + hh > ch) { obj.pos.y = ch - hh; obj.velocity.y = -obj.velocity.y; hit = true }
      if (obj.pos.y - hh < 0) { obj.pos.y = hh; obj.velocity.y = -obj.velocity.y; hit = true }
      if (obj.pos.x + hw > cw) { obj.pos.x = cw - hw; obj.velocity.x = -obj.velocity.x; hit = true }
      if (obj.pos.x - hw < 0) { obj.pos.x = hw; obj.velocity.x = -obj.velocity.x; hit = true }
      return hit
    },
  },
  // ── 4. 弹簧球（弹簧振子） ──
  {
    id: 'spring',
    name: '弹簧球',
    icon: '🔄',
    iconSvg: springIcon,
    description: '弹簧振子，在弹力和重力作用下做往复运动',
    defaultColor: '#e67e22',
    create(x, y) {
      const obj = new SpringMass(x, y)
      obj.color = this.defaultColor
      return obj
    },
    drawGhost(ctx, x, y, alpha = 0.5) {
      ctx.save()
      ctx.globalAlpha = alpha
      ctx.beginPath()
      ctx.arc(x, y, 15, 0, Math.PI * 2)
      ctx.fillStyle = '#e67e22'
      ctx.fill()
      ctx.strokeStyle = '#d35400'
      ctx.lineWidth = 2
      ctx.setLineDash([4, 4])
      ctx.stroke()
      ctx.setLineDash([])
      ctx.restore()
    },
    hitTest(obj, mx, my) {
      const dx = mx - obj.pos.x
      const dy = my - obj.pos.y
      return Math.sqrt(dx * dx + dy * dy) <= obj.radius + 2
    },
    drawHighlight(ctx, obj) {
      ctx.save()
      ctx.beginPath()
      ctx.arc(obj.pos.x, obj.pos.y, obj.radius + 4, 0, Math.PI * 2)
      ctx.strokeStyle = '#f39c12'
      ctx.lineWidth = 2.5
      ctx.setLineDash([5, 3])
      ctx.stroke()
      ctx.setLineDash([])
      ctx.restore()
    },
    clampToBounds(obj, cw, ch) {
      const r = obj.radius
      let hit = false
      if (obj.pos.y + r > ch) { obj.pos.y = ch - r; obj.velocity.y *= -0.4; hit = true }
      if (obj.pos.y - r < 0) { obj.pos.y = r; obj.velocity.y *= -0.4; hit = true }
      if (obj.pos.x + r > cw) { obj.pos.x = cw - r; obj.velocity.x *= -0.4; hit = true }
      if (obj.pos.x - r < 0) { obj.pos.x = r; obj.velocity.x *= -0.4; hit = true }
      return hit
    },
  },
  // ── 5. 单摆 ──
  {
    id: 'pendulum',
    name: '单摆',
    icon: '⏱',
    iconSvg: pendulumIcon,
    description: '单摆，在重力作用下沿圆弧往复摆动',
    defaultColor: '#9b59b6',
    create(x, y) {
      const obj = new Pendulum(x, y)
      obj.color = this.defaultColor
      return obj
    },
    drawGhost(ctx, x, y, alpha = 0.5) {
      ctx.save()
      ctx.globalAlpha = alpha
      ctx.beginPath()
      ctx.arc(x, y, 16, 0, Math.PI * 2)
      ctx.fillStyle = '#9b59b6'
      ctx.fill()
      ctx.strokeStyle = '#7c3aed'
      ctx.lineWidth = 2
      ctx.setLineDash([4, 4])
      ctx.stroke()
      ctx.setLineDash([])
      ctx.restore()
    },
    hitTest(obj, mx, my) {
      const dx = mx - obj.pos.x
      const dy = my - obj.pos.y
      return Math.sqrt(dx * dx + dy * dy) <= obj.radius + 2
    },
    drawHighlight(ctx, obj) {
      ctx.save()
      ctx.beginPath()
      ctx.arc(obj.pos.x, obj.pos.y, obj.radius + 4, 0, Math.PI * 2)
      ctx.strokeStyle = '#f39c12'
      ctx.lineWidth = 2.5
      ctx.setLineDash([5, 3])
      ctx.stroke()
      ctx.setLineDash([])
      ctx.restore()
    },
    clampToBounds(obj, cw, ch) {
      const r = obj.radius
      let hit = false
      if (obj.pos.y + r > ch) { obj.pos.y = ch - r; obj.velocity.y *= -0.2; hit = true }
      if (obj.pos.y - r < 0) { obj.pos.y = r; obj.velocity.y *= -0.2; hit = true }
      if (obj.pos.x + r > cw) { obj.pos.x = cw - r; obj.velocity.x *= -0.2; hit = true }
      if (obj.pos.x - r < 0) { obj.pos.x = r; obj.velocity.x *= -0.2; hit = true }
      return hit
    },
  },
  // ── 6. 斜面（直角三角形，角度可调） ──
  {
    id: 'ramp',
    name: '斜面',
    icon: '◢',
    iconSvg: rampIcon,
    description: '直角三角形斜面，角度可调，固定不可移动',
    defaultColor: '#27ae60',
    create(x, y) {
      const obj = new Ramp(x, y)
      obj.color = '#27ae60'
      return obj
    },
    drawGhost(ctx, x, y, alpha = 0.5) {
      ctx.save()
      ctx.globalAlpha = alpha
      const w = 120, h = 60
      ctx.beginPath()
      ctx.moveTo(x - w / 2, y + h / 2)
      ctx.lineTo(x + w / 2, y + h / 2)
      ctx.lineTo(x - w / 2, y - h / 2)
      ctx.closePath()
      ctx.fillStyle = '#27ae60'
      ctx.fill()
      ctx.strokeStyle = '#1e8449'
      ctx.lineWidth = 2
      ctx.setLineDash([4, 4])
      ctx.stroke()
      ctx.setLineDash([])
      ctx.restore()
    },
    hitTest(obj, mx, my) {
      const hw = obj.width / 2
      const hh = obj.height / 2
      const px = mx, py = my
      const x1 = obj.pos.x - hw, y1 = obj.pos.y + hh
      const x2 = obj.pos.x + hw, y2 = obj.pos.y + hh
      const x3 = obj.pos.x - hw, y3 = obj.pos.y - hh
      const d1 = (px - x1) * (y2 - y1) - (py - y1) * (x2 - x1)
      const d2 = (px - x2) * (y3 - y2) - (py - y2) * (x3 - x2)
      const d3 = (px - x3) * (y1 - y3) - (py - y3) * (x1 - x3)
      return (d1 >= 0 && d2 >= 0 && d3 >= 0) || (d1 <= 0 && d2 <= 0 && d3 <= 0)
    },
    drawHighlight(ctx, obj) {
      ctx.save()
      const hw = obj.width / 2 + 4
      const hh = obj.height / 2 + 4
      ctx.beginPath()
      ctx.moveTo(obj.pos.x - hw, obj.pos.y + hh)
      ctx.lineTo(obj.pos.x + hw, obj.pos.y + hh)
      ctx.lineTo(obj.pos.x - hw, obj.pos.y - hh)
      ctx.closePath()
      ctx.strokeStyle = '#f39c12'
      ctx.lineWidth = 2.5
      ctx.setLineDash([5, 3])
      ctx.stroke()
      ctx.setLineDash([])
      ctx.restore()
    },
    clampToBounds(obj, cw, ch) {
      const hw = obj.width / 2
      const hh = obj.height / 2
      let hit = false
      if (obj.pos.y + hh > ch) { obj.pos.y = ch - hh; obj.velocity.y = -obj.velocity.y; hit = true }
      if (obj.pos.y - hh < 0) { obj.pos.y = hh; obj.velocity.y = -obj.velocity.y; hit = true }
      if (obj.pos.x + hw > cw) { obj.pos.x = cw - hw; obj.velocity.x = -obj.velocity.x; hit = true }
      if (obj.pos.x - hw < 0) { obj.pos.x = hw; obj.velocity.x = -obj.velocity.x; hit = true }
      return hit
    },
  },
]

export default MODEL_TYPES
