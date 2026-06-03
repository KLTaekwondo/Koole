// ── 模型物理逻辑 ──
// 纯计算，不碰任何 Canvas/DOM

const GROUND_Y = 0.4

export const MODEL_PHYSICS = {
  "free-fall": {
    createState: (p) => ({ y: p.height + GROUND_Y, vy: 0, trail: [], _t: 0 }),
    step: (s, p, dt) => {
      s.vy += p.gravity * dt
      s.y -= s.vy * dt
      s._t += dt
      if (s.y <= GROUND_Y && s.vy >= 0) { s.y = GROUND_Y; s.vy = 0 }
    },
    isFinished: (s) => s.y <= GROUND_Y && s.vy <= 0,
    getBallPosition: (s) => ({ x: 0, y: s.y }),
    getTrailPosition: (s) => ({ x: 0, y: s.y }),
    trailFields: (s) => ({ t: s._t, vy: s.vy, y: s.y }),
    chartDefs: [
      { title: "y-t 图", xLabel: "t (s)", yLabel: "y (m)", getData: (trail) => [{ name: "高度", data: trail.map(p => [p.t, p.y]) }] },
      { title: "v-t 图", xLabel: "t (s)", yLabel: "v (m/s)", getData: (trail) => [{ name: "速度", data: trail.map(p => [p.t, p.vy]) }] },
    ],
    getInfoLines: (s, p, t) => [
      `下落高度: ${(p.height + GROUND_Y - s.y).toFixed(1)} m`,
      `速度: ${s.vy.toFixed(1)} m/s`,
      `时间: ${t.toFixed(2)} s`,
      `重力: ${p.gravity} m/s²`,
    ],
  },

  "projectile": {
    createState: (p) => ({ x: 0, y: p.height + GROUND_Y, vx: p.vx, vy: 0, trail: [], _t: 0 }),
    step: (s, p, dt) => {
      s.vy += p.gravity * dt
      s.x += s.vx * dt
      s.y -= s.vy * dt
      s._t += dt
      if (s.y <= GROUND_Y && s.vy >= 0) { s.y = GROUND_Y; s.vy = 0 }
    },
    isFinished: (s) => s.y <= GROUND_Y,
    getBallPosition: (s) => ({ x: s.x, y: s.y }),
    getTrailPosition: (s) => ({ x: s.x, y: s.y }),
    trailFields: (s) => ({ t: s._t, y: s.y }),
    chartDefs: [
      { title: "轨迹图", xLabel: "x (m)", yLabel: "y (m)", getData: (trail) => [{ name: "轨迹", data: trail.map(p => [p.x, p.y]) }] },
      { title: "x-t 图", xLabel: "t (s)", yLabel: "x (m)", getData: (trail) => [{ name: "水平位移", data: trail.map(p => [p.t, p.x]) }] },
      { title: "y-t 图", xLabel: "t (s)", yLabel: "y (m)", getData: (trail) => [{ name: "高度", data: trail.map(p => [p.t, p.y]) }] },
    ],
    getInfoLines: (s, p, t) => [
      `水平位移: ${s.x.toFixed(1)} m`,
      `下落高度: ${(p.height + GROUND_Y - s.y).toFixed(1)} m`,
      `水平速度: ${s.vx.toFixed(1)} m/s`,
      `竖直速度: ${s.vy.toFixed(1)} m/s`,
      `时间: ${t.toFixed(2)} s`,
    ],
  },

  "vertical-throw": {
    createState: (p) => ({ y: GROUND_Y, vy: p.initialVelocity, trail: [], _t: 0 }),
    step: (s, p, dt) => {
      s.vy -= p.gravity * dt
      s.y += s.vy * dt
      s._t += dt
      if (s.y <= GROUND_Y && s.vy <= 0) { s.y = GROUND_Y; s.vy = 0 }
    },
    isFinished: (s) => s.y <= GROUND_Y && s.vy <= 0,
    getBallPosition: (s) => ({ x: 0, y: s.y }),
    getTrailPosition: (s) => ({ x: 0, y: s.y }),
    trailFields: (s) => ({ t: s._t, vy: s.vy, y: s.y }),
    chartDefs: [
      { title: "y-t 图", xLabel: "t (s)", yLabel: "y (m)", getData: (trail) => [{ name: "高度", data: trail.map(p => [p.t, p.y]) }] },
      { title: "v-t 图", xLabel: "t (s)", yLabel: "v (m/s)", getData: (trail) => [{ name: "速度", data: trail.map(p => [p.t, p.vy]) }] },
    ],
    getInfoLines: (s, p, t) => [
      `高度: ${s.y.toFixed(1)} m`,
      `速度: ${s.vy.toFixed(1)} m/s`,
      `时间: ${t.toFixed(2)} s`,
      `最大高度: ${(p.initialVelocity * p.initialVelocity / (2 * p.gravity)).toFixed(1)} m`,
    ],
  },

  "circular": {
    createState: (p) => ({ angle: 0, trail: [], _t: 0, _lapCount: 0 }),
    step: (s, p, dt) => {
      s.angle += p.omega * dt
      s._t += dt
    },
    isFinished: (s) => s._t >= (4 * Math.PI) / Math.abs(s.omega || 1),
    getBallPosition: (s, p) => ({
      x: p.radius * Math.cos(s.angle),
      y: p.radius * Math.sin(s.angle) + p.radius,
    }),
    getTrailPosition: (s, p) => ({
      x: p.radius * Math.cos(s.angle),
      y: p.radius * Math.sin(s.angle) + p.radius,
    }),
    trailFields: (s, p) => {
      const v = p.omega * p.radius
      const vx = -v * Math.sin(s.angle)
      const vy = v * Math.cos(s.angle)
      return { t: s._t, vx, vy, angle: s.angle }
    },
    chartDefs: [
      {
        title: "vx-t 图（水平速度分量）",
        xLabel: "t (s)",
        yLabel: "vx (m/s)",
        getData: (trail) => [{ name: "vx", data: trail.map(p => [p.t, p.vx]) }],
      },
      {
        title: "vy-t 图（竖直速度分量）",
        xLabel: "t (s)",
        yLabel: "vy (m/s)",
        getData: (trail) => [{ name: "vy", data: trail.map(p => [p.t, p.vy]) }],
      },
    ],
    getInfoLines: (s, p, t) => {
      const v = p.omega * p.radius
      const ac = v * v / p.radius
      const vx = -v * Math.sin(s.angle)
      const vy = v * Math.cos(s.angle)
      return [
        `轨道半径: ${p.radius} m`,
        `线速度: ${v.toFixed(2)} m/s`,
        `vx: ${vx.toFixed(2)} m/s`,
        `vy: ${vy.toFixed(2)} m/s`,
        `向心加速度: ${ac.toFixed(2)} m/s²`,
        `周期: ${(2 * Math.PI / p.omega).toFixed(2)} s`,
      ]
    },
  },

  "incline": {
    createState: (p) => {
      const theta = p.angle * Math.PI / 180
      const rampLen = p.rampHeight / Math.sin(theta)
      return { dist: 0, vel: 0, rampLen, trail: [], _t: 0 }
    },
    step: (s, p, dt) => {
      const theta = p.angle * Math.PI / 180
      s.vel += p.gravity * Math.sin(theta) * dt
      s.dist += s.vel * dt
      s._t += dt
      if (s.dist >= s.rampLen) { s.dist = s.rampLen; s.vel = 0 }
    },
    isFinished: (s) => s.dist >= s.rampLen,
    getBallPosition: (s, p) => {
      const theta = p.angle * Math.PI / 180
      return { x: s.dist * Math.cos(theta), y: p.rampHeight - s.dist * Math.sin(theta) }
    },
    getTrailPosition: (s, p) => {
      const theta = p.angle * Math.PI / 180
      return { x: s.dist * Math.cos(theta), y: p.rampHeight - s.dist * Math.sin(theta) }
    },
    trailFields: (s) => ({ t: s._t, vel: s.vel, dist: s.dist }),
    chartDefs: [
      { title: "v-t 图", xLabel: "t (s)", yLabel: "v (m/s)", getData: (trail) => [{ name: "速度", data: trail.map(p => [p.t, p.vel]) }] },
      { title: "s-t 图", xLabel: "t (s)", yLabel: "s (m)", getData: (trail) => [{ name: "距离", data: trail.map(p => [p.t, p.dist]) }] },
    ],
    getInfoLines: (s, p, t) => [
      `下滑距离: ${s.dist.toFixed(1)} m`,
      `速度: ${s.vel.toFixed(2)} m/s`,
      `加速度: ${(p.gravity * Math.sin(p.angle * Math.PI / 180)).toFixed(2)} m/s²`,
      `时间: ${t.toFixed(2)} s`,
    ],
  },

  "pendulum": {
    createState: (p) => ({ theta: p.initAngle * Math.PI / 180, omega: 0, trail: [], _t: 0 }),
    step: (s, p, dt) => {
      const alpha = -(p.gravity / p.length) * s.theta
      s.omega += alpha * dt
      s.theta += s.omega * dt
      s._t += dt
    },
    isFinished: () => false,
    getBallPosition: (s, p) => ({
      x: p.length * Math.sin(s.theta),
      y: p.length - p.length * Math.cos(s.theta) + GROUND_Y,
    }),
    getTrailPosition: (s, p) => ({
      x: p.length * Math.sin(s.theta),
      y: p.length - p.length * Math.cos(s.theta) + GROUND_Y,
    }),
    trailFields: (s) => ({ t: s._t, theta: s.theta * 180 / Math.PI, omega: s.omega }),
    chartDefs: [
      { title: "θ-t 图", xLabel: "t (s)", yLabel: "θ (°)", getData: (trail) => [{ name: "摆角", data: trail.map(p => [p.t, p.theta]) }] },
      { title: "ω-t 图", xLabel: "t (s)", yLabel: "ω (rad/s)", getData: (trail) => [{ name: "角速度", data: trail.map(p => [p.t, p.omega]) }] },
    ],
    getInfoLines: (s, p, t) => [
      `摆角: ${(s.theta * 180 / Math.PI).toFixed(1)}°`,
      `角速度: ${s.omega.toFixed(2)} rad/s`,
      `周期: ${(2 * Math.PI * Math.sqrt(p.length / p.gravity)).toFixed(2)} s`,
      `摆长: ${p.length} m`,
    ],
  },

  "angled-projectile": {
    createState: (p) => {
      const theta = p.angle * Math.PI / 180
      return { x: 0, y: GROUND_Y, vx: p.initialVelocity * Math.cos(theta), vy: p.initialVelocity * Math.sin(theta), trail: [], _t: 0 }
    },
    step: (s, p, dt) => {
      s.vy -= p.gravity * dt
      s.x += s.vx * dt
      s.y += s.vy * dt
      s._t += dt
      if (s.y <= GROUND_Y && s.vy <= 0) { s.y = GROUND_Y; s.vy = 0 }
    },
    isFinished: (s) => s.y <= GROUND_Y && s.vy <= 0,
    getBallPosition: (s) => ({ x: s.x, y: s.y }),
    getTrailPosition: (s) => ({ x: s.x, y: s.y }),
    trailFields: (s) => ({ t: s._t, y: s.y }),
    chartDefs: [
      { title: "轨迹图", xLabel: "x (m)", yLabel: "y (m)", getData: (trail) => [{ name: "轨迹", data: trail.map(p => [p.x, p.y]) }] },
      { title: "y-t 图", xLabel: "t (s)", yLabel: "y (m)", getData: (trail) => [{ name: "高度", data: trail.map(p => [p.t, p.y]) }] },
    ],
    getInfoLines: (s, p, t) => {
      const theta = p.angle * Math.PI / 180
      const v0 = p.initialVelocity, g = p.gravity
      const speed = Math.sqrt(s.vx * s.vx + s.vy * s.vy)
      return [
        `水平位移: ${s.x.toFixed(1)} m`,
        `高度: ${Math.max(s.y, 0).toFixed(1)} m`,
        `速度: ${speed.toFixed(1)} m/s`,
        `最大高度: ${((v0 * Math.sin(theta)) ** 2 / (2 * g)).toFixed(1)} m`,
        `射程: ${(v0 * v0 * Math.sin(2 * theta) / g).toFixed(1)} m`,
        `时间: ${t.toFixed(2)} / ${(2 * v0 * Math.sin(theta) / g).toFixed(2)} s`,
      ]
    },
  },

  "boat-river": {
    createState: (p) => ({ x: 0, y: 0, riverWidth: p.riverWidth, trail: [], _t: 0 }),
    step: (s, p, dt) => {
      if (s.y >= s.riverWidth) return
      const theta = p.headingAngle * Math.PI / 180
      s.x += (p.boatSpeed * Math.sin(theta) + p.currentSpeed) * dt
      s.y += p.boatSpeed * Math.cos(theta) * dt
      s._t += dt
      if (s.y >= s.riverWidth) s.y = s.riverWidth
    },
    isFinished: (s) => s.y >= s.riverWidth,
    getBallPosition: (s) => ({ x: s.x, y: s.y }),
    getTrailPosition: (s) => ({ x: s.x, y: s.y }),
    trailFields: (s) => ({ t: s._t }),
    chartDefs: [
      { title: "轨迹图", xLabel: "x (m)", yLabel: "y (m)", getData: (trail) => [{ name: "轨迹", data: trail.map(p => [p.x, p.y]) }] },
    ],
    getInfoLines: (s, p, t) => {
      const theta = p.headingAngle * Math.PI / 180
      const vx = p.boatSpeed * Math.sin(theta) + p.currentSpeed
      const vy = p.boatSpeed * Math.cos(theta)
      const remainingTime = vy > 0.01 ? (p.riverWidth - s.y) / vy : Infinity
      let minAngleInfo = ""
      if (p.boatSpeed > p.currentSpeed) {
        minAngleInfo = `最小偏移角: ${(-Math.asin(p.currentSpeed / p.boatSpeed) * 180 / Math.PI).toFixed(1)}°`
      }
      return [
        `渡河进度: ${Math.min(s.y / p.riverWidth * 100, 100).toFixed(0)}%`,
        `下游偏移: ${s.x.toFixed(1)} m`,
        `过河速度: ${vy.toFixed(2)} m/s`,
        `合速度: ${Math.sqrt(vx * vx + vy * vy).toFixed(2)} m/s`,
        `${vy > 0.01 ? "预计剩余: " + remainingTime.toFixed(2) + " s" : "无法到达对岸"}`,
        minAngleInfo,
      ].filter(Boolean)
    },
  },

  "spring-mass": {
    createState: (p) => ({ x: p.initX, vx: 0, trail: [], _t: 0 }),
    step: (s, p, dt) => {
      const a = -(p.k / p.mass) * s.x
      s.vx += a * dt
      s.x += s.vx * dt
      s._t += dt
    },
    isFinished: (s, p) => {
      const T = 2 * Math.PI * Math.sqrt(p.mass / p.k)
      return s._t >= 3 * T
    },
    getBallPosition: (s) => ({ x: s.x, y: GROUND_Y }),
    getTrailPosition: (s) => ({ x: s.x, y: GROUND_Y }),
    trailFields: (s, p) => ({
      t: s._t, vx: s.vx, x: s.x,
      Ek: 0.5 * p.mass * s.vx * s.vx,
      Ep: 0.5 * p.k * s.x * s.x,
    }),
    chartDefs: [
      { title: "x-t 图（位移）", xLabel: "t (s)", yLabel: "x (m)", getData: (trail) => [{ name: "位移", data: trail.map(p => [p.t, p.x]) }] },
      { title: "v-t 图（速度）", xLabel: "t (s)", yLabel: "v (m/s)", getData: (trail) => [{ name: "速度", data: trail.map(p => [p.t, p.vx]) }] },
      { title: "Ep-t 图（弹性势能）", xLabel: "t (s)", yLabel: "Ep (J)", getData: (trail) => [{ name: "势能", data: trail.map(p => [p.t, p.Ep]) }] },
    ],
    getInfoLines: (s, p, t) => {
      const ke = 0.5 * p.mass * s.vx * s.vx
      const pe = 0.5 * p.k * s.x * s.x
      const period = 2 * Math.PI * Math.sqrt(p.mass / p.k)
      return [
        `位移: ${s.x.toFixed(2)} m`,
        `速度: ${s.vx.toFixed(2)} m/s`,
        `加速度: ${(-(p.k / p.mass) * s.x).toFixed(2)} m/s²`,
        `动能: ${ke.toFixed(2)} J | 势能: ${pe.toFixed(2)} J`,
        `机械能: ${(ke + pe).toFixed(2)} J`,
        `周期: ${period.toFixed(2)} s`,
        `剩余: ${Math.max(0, 3 * period - t).toFixed(2)} s`,
      ]
    },
  },

  "friction-slide": {
    createState: (p) => ({ x: 0, vx: p.v0, trail: [], _t: 0 }),
    step: (s, p, dt) => {
      const a = p.mu * p.gravity
      s.vx -= a * dt
      s._t += dt
      if (s.vx <= 0) { s.vx = 0; return }
      s.x += s.vx * dt
    },
    isFinished: (s) => s.vx <= 0,
    getBallPosition: (s) => ({ x: s.x, y: GROUND_Y }),
    getTrailPosition: (s) => ({ x: s.x, y: GROUND_Y }),
    trailFields: (s) => ({ t: s._t, vx: s.vx, x: s.x }),
    chartDefs: [
      { title: "v-t 图", xLabel: "t (s)", yLabel: "v (m/s)", getData: (trail) => [{ name: "速度", data: trail.map(p => [p.t, p.vx]) }] },
      { title: "x-t 图", xLabel: "t (s)", yLabel: "x (m)", getData: (trail) => [{ name: "位移", data: trail.map(p => [p.t, p.x]) }] },
    ],
    getInfoLines: (s, p, t) => {
      const a = p.mu * p.gravity
      return [
        `位移: ${s.x.toFixed(2)} m`,
        `速度: ${s.vx.toFixed(2)} m/s`,
        `减速度: ${a.toFixed(2)} m/s²`,
        `μ = ${p.mu},  g = ${p.gravity} m/s²`,
        `理论停止距离: ${(p.v0 * p.v0 / (2 * a)).toFixed(2)} m`,
        `预计剩余: ${s.vx > 0 ? (s.vx / a).toFixed(2) : 0} s`,
      ]
    },
  },

  "drag-fall": {
    createState: (p) => ({ y: p.height + GROUND_Y, vy: 0, trail: [], _t: 0 }),
    step: (s, p, dt) => {
      const a = p.gravity - (p.dragCoeff / p.mass) * s.vy
      s.vy += a * dt
      s.y -= s.vy * dt
      s._t += dt
      if (s.y <= GROUND_Y && s.vy >= 0) { s.y = GROUND_Y; s.vy = 0 }
    },
    isFinished: (s) => s.y <= GROUND_Y && s.vy <= 0,
    getBallPosition: (s) => ({ x: 0, y: s.y }),
    getTrailPosition: (s) => ({ x: 0, y: s.y }),
    trailFields: (s) => ({ t: s._t, vy: s.vy, y: s.y }),
    chartDefs: [
      { title: "y-t 图", xLabel: "t (s)", yLabel: "y (m)", getData: (trail) => [{ name: "高度", data: trail.map(p => [p.t, p.y]) }] },
      { title: "v-t 图", xLabel: "t (s)", yLabel: "v (m/s)", getData: (trail) => [{ name: "速度", data: trail.map(p => [p.t, p.vy]) }] },
    ],
    getInfoLines: (s, p, t) => {
      const vt = p.mass * p.gravity / p.dragCoeff
      return [
        `下落高度: ${(p.height + GROUND_Y - s.y).toFixed(1)} m`,
        `速度: ${s.vy.toFixed(2)} m/s`,
        `时间: ${t.toFixed(2)} s`,
        `收尾速度: ${vt.toFixed(2)} m/s`,
        `已接近收尾: ${s.vy > 0 ? (s.vy / vt * 100).toFixed(0) : 0}%`,
      ]
    },
  },

  "bounce-deformation": {
    createState: (p) => ({ y: p.height + GROUND_Y, vy: 0, trail: [], bounceCount: 0, deform: 0, _t: 0 }),
    step: (s, p, dt) => {
      s.vy += p.gravity * dt
      s.y -= s.vy * dt
      s.deform *= 0.85
      s._t += dt
      if (s.y <= GROUND_Y && s.vy >= 0) {
        if (p.restitution > 0 && s.vy > 0.3) {
          s.deform = Math.min(s.vy * 0.8, 12)
          s.vy = -s.vy * p.restitution
          s.y = GROUND_Y
          s.bounceCount++
        } else {
          s.y = GROUND_Y
          s.vy = 0
        }
      }
    },
    isFinished: (s) => s.y <= GROUND_Y && Math.abs(s.vy) <= 0.3,
    getBallPosition: (s) => ({ x: 0, y: s.y }),
    getTrailPosition: (s) => ({ x: 0, y: s.y }),
    trailFields: (s) => ({ t: s._t, vy: s.vy, y: s.y }),
    chartDefs: [
      { title: "y-t 图", xLabel: "t (s)", yLabel: "y (m)", getData: (trail) => [{ name: "高度", data: trail.map(p => [p.t, p.y]) }] },
      { title: "v-t 图", xLabel: "t (s)", yLabel: "v (m/s)", getData: (trail) => [{ name: "速度", data: trail.map(p => [p.t, p.vy]) }] },
    ],
    getInfoLines: (s, p, t) => {
      const mode = p.restitution === 1 ? '完全弹性' : p.restitution === 0 ? '完全非弹性' : '非弹性'
      return [
        `高度: ${(s.y - GROUND_Y).toFixed(2)} m`,
        `速度: ${s.vy.toFixed(2)} m/s`,
        `弹跳次数: ${s.bounceCount}`,
        `恢复系数: e = ${p.restitution.toFixed(2)}  (${mode})`,
        `变形: ${s.deform > 0.1 ? s.deform.toFixed(1) : '0'}`,
      ]
    },
  },

  "ball-collision": {
    createState: (p) => ({
      x1: -8, v1: p.v1, x2: 8, v2: p.v2,
      collided: false, trail: [], trail2: [], collisionTime: 999,
      _t: 0, _preV1: null, _preV2: null, _postV1: null, _postV2: null, _postTime: 0,
    }),
    step: (s, p, dt) => {
      const MIN_DIST = 1
      s.x1 += s.v1 * dt
      s.x2 += s.v2 * dt
      if (!s.collided && s.x2 - s.x1 < MIN_DIST && s.v1 > s.v2) {
        s.collided = true
        s.collisionTime = 0
        // 记录碰撞前速度
        s._preV1 = s.v1
        s._preV2 = s.v2
        const overlap = MIN_DIST - (s.x2 - s.x1)
        s.x1 -= overlap / 2
        s.x2 += overlap / 2
        if (p.restitution === 1) {
          const v1 = s.v1, v2 = s.v2
          s.v1 = ((p.m1 - p.m2) * v1 + 2 * p.m2 * v2) / (p.m1 + p.m2)
          s.v2 = ((p.m2 - p.m1) * v2 + 2 * p.m1 * v1) / (p.m1 + p.m2)
        } else {
          const v = (p.m1 * s.v1 + p.m2 * s.v2) / (p.m1 + p.m2)
          s.v1 = v; s.v2 = v
        }
        // 记录碰撞后速度
        s._postV1 = s.v1
        s._postV2 = s.v2
      }
      if (s.collided) {
        s.collisionTime += dt
        s._postTime += dt
      }
      s._t += dt
      if (!s.trail2) s.trail2 = []
      s.trail2.push({ x: s.x2, y: GROUND_Y })
      if (s.trail2.length > 5000) s.trail2.splice(0, s.trail2.length - 5000)
    },
    isFinished: (s) => s.collided && s._postTime >= 1.0,
    getBallPosition: (s) => ({ x: (s.x1 + s.x2) / 2, y: GROUND_Y }),
    getTrailPosition: (s) => ({ x: s.x1, y: GROUND_Y }),
    trailFields: (s) => ({ t: s._t, v1: s.v1, v2: s.v2 }),
    chartDefs: [
      {
        title: "v-t 图",
        xLabel: "t (s)",
        yLabel: "v (m/s)",
        getData: (trail) => [
          { name: "球1", data: trail.map(p => [p.t, p.v1]), color: "#0288D1" },
          { name: "球2", data: trail.map(p => [p.t, p.v2]), color: "#F57C00" },
        ],
      },
    ],
    getInfoLines: (s, p, t) => {
      const KE1 = 0.5 * p.m1 * s.v1 * s.v1
      const KE2 = 0.5 * p.m2 * s.v2 * s.v2
      const lines = [
        `球1: m=${p.m1.toFixed(1)}kg  v=${s.v1.toFixed(2)}m/s  KE=${KE1.toFixed(2)}J`,
        `球2: m=${p.m2.toFixed(1)}kg  v=${s.v2.toFixed(2)}m/s  KE=${KE2.toFixed(2)}J`,
        `总动量: ${(p.m1 * s.v1 + p.m2 * s.v2).toFixed(2)} kg·m/s`,
        `总动能: ${(KE1 + KE2).toFixed(2)} J`,
        `状态: ${s.collided ? '已碰撞' : '未碰撞'} 类型: ${p.restitution === 1 ? '完全弹性' : '完全非弹性'}`,
      ]
      // 碰撞后显示详细对比数据
      if (s.collided && s._preV1 !== null) {
        const preP = p.m1 * s._preV1 + p.m2 * s._preV2
        const postP = p.m1 * s._postV1 + p.m2 * s._postV2
        const preKE = 0.5 * p.m1 * s._preV1 ** 2 + 0.5 * p.m2 * s._preV2 ** 2
        const postKE = 0.5 * p.m1 * s._postV1 ** 2 + 0.5 * p.m2 * s._postV2 ** 2
        lines.push('─── 碰撞分析 ───')
        lines.push(`碰撞前动量: ${preP.toFixed(2)} kg·m/s`)
        lines.push(`碰撞后动量: ${postP.toFixed(2)} kg·m/s`)
        lines.push(`动量变化: ${Math.abs(postP - preP).toFixed(4)} kg·m/s`)
        lines.push(`碰撞前动能: ${preKE.toFixed(2)} J`)
        lines.push(`碰撞后动能: ${postKE.toFixed(2)} J`)
        lines.push(`动能损失: ${(preKE - postKE).toFixed(2)} J (${preKE > 0 ? ((1 - postKE / preKE) * 100).toFixed(1) : 0}%)`)
      }
      return lines
    },
  },

  "connected-bodies": {
    createState: (p) => ({ d: 0, v: 0, trail: [], _t: 0 }),
    step: (s, p, dt) => {
      const TABLE_W = 8, m1_hw = 0.45, m1_hh = 0.3, m2_r = 0.38
      const PULLEY_CENTER_Y = 5 + m1_hh
      const maxDist = Math.min(TABLE_W - m1_hw * 2, PULLEY_CENTER_Y - m2_r - GROUND_Y)
      const a = (p.m2 * p.gravity - p.mu * p.m1 * p.gravity) / (p.m1 + p.m2)
      s._t += dt
      if (a <= 0) {
        if (s.v > 0) { s.v += a * dt; if (s.v < 0) s.v = 0; s.d += s.v * dt }
        return
      }
      s.v += a * dt
      if (s.v < 0) s.v = 0
      s.d += s.v * dt
      if (s.d >= maxDist) { s.d = maxDist; s.v = 0 }
    },
    isFinished: (s) => {
      const TABLE_W = 8, m1_hw = 0.45, m1_hh = 0.3, m2_r = 0.38
      const maxDist = Math.min(TABLE_W - m1_hw * 2, 5 + m1_hh - m2_r - GROUND_Y)
      return s.d >= maxDist
    },
    getBallPosition: (s) => {
      const TABLE_W = 8, m1_hw = 0.45, m1_hh = 0.3, m2_r = 0.38
      const PULLEY_CENTER_Y = 5 + m1_hh
      const m1_x = Math.max(-TABLE_W + m1_hw, Math.min(-TABLE_W + m1_hw + s.d, -m1_hw))
      const m2_y = Math.max(PULLEY_CENTER_Y - m2_r - s.d, GROUND_Y)
      return { x: m1_x / 2, y: (PULLEY_CENTER_Y + m2_y) / 2 }
    },
    getTrailPosition: (s) => {
      const m2_y = Math.max(5 + 0.3 - 0.38 - s.d, GROUND_Y)
      return { x: 0, y: m2_y }
    },
    trailFields: (s) => ({ t: s._t, v: s.v, d: s.d }),
    chartDefs: [
      { title: "v-t 图", xLabel: "t (s)", yLabel: "v (m/s)", getData: (trail) => [{ name: "速度", data: trail.map(p => [p.t, p.v]) }] },
      { title: "d-t 图", xLabel: "t (s)", yLabel: "d (m)", getData: (trail) => [{ name: "位移", data: trail.map(p => [p.t, p.d]) }] },
    ],
    getInfoLines: (s, p, t) => {
      const TABLE_W = 8, m1_hw = 0.45, m1_hh = 0.3, m2_r = 0.38
      const PULLEY_CENTER_Y = 5 + m1_hh
      const m1_max = TABLE_W - m1_hw * 2
      const m2_max = PULLEY_CENTER_Y - m2_r - GROUND_Y
      const maxDist = Math.min(m1_max, m2_max)
      const a = (p.m2 * p.gravity - p.mu * p.m1 * p.gravity) / (p.m1 + p.m2)
      const av = a > 0 ? a : 0
      const T = av > 0 ? p.m1 * (av + p.mu * p.gravity) : p.m1 * p.gravity
      return [
        `加速度: ${av.toFixed(2)} m/s²`,
        `速度: ${s.v.toFixed(2)} m/s`,
        `移动距离: ${s.d.toFixed(1)} / ${maxDist.toFixed(1)} m`,
        `绳中拉力: ${T.toFixed(2)} N`,
        `m₁=${p.m1}kg  m₂=${p.m2}kg  μ=${p.mu.toFixed(2)}`,
        `时间: ${t.toFixed(2)} s`,
        ...(a <= 0 ? ['⚠ m₂ 太轻，无法拉动 m₁'] : []),
        ...(s.d >= m1_max && s.d < m2_max ? ['⚡ m₁ 已到滑轮处'] : []),
        ...(s.d >= m2_max ? ['⚡ m₂ 已落地'] : []),
      ]
    },
  },

  "conveyor-belt": {
    createState: (p) => ({ x: 0, v: p.v0, trail: [], _t: 0, _synced: false, events: [] }),
    step: (s, p, dt) => {
      const dv = p.beltSpeed - s.v
      if (Math.abs(dv) > 0.05) {
        const a = Math.sign(dv) * p.mu * p.gravity
        s.v = Math.abs(a * dt) > Math.abs(dv) ? p.beltSpeed : s.v + a * dt
      }
      s._t += dt
      // 共速事件检测
      if (!s._synced && Math.abs(p.beltSpeed - s.v) < 0.05) {
        s._synced = true
        s.events.push({ type: "sync", time: s._t, label: "共速" })
      }
      s.x += s.v * dt
      if (s.x >= p.beltLength) s.x = p.beltLength
      if (s.x < 0) s.x = 0
    },
    isFinished: (s, p) => s.x >= p.beltLength,
    getBallPosition: (s) => ({ x: s.x, y: GROUND_Y }),
    getTrailPosition: (s) => ({ x: s.x, y: GROUND_Y }),
    trailFields: (s) => ({ t: s._t, v: s.v }),
    chartDefs: [
      {
        title: "v-t 图",
        xLabel: "t (s)",
        yLabel: "v (m/s)",
        getData: (trail, params) => [
          { name: "物块速度", data: trail.map(p => [p.t, p.v]) },
          { name: "传送带速度", data: trail.map(p => [p.t, params.beltSpeed]), lineStyle: "dashed" },
        ],
      },
    ],
    getInfoLines: (s, p, t) => {
      const dv = p.beltSpeed - s.v
      const isSynced = Math.abs(dv) < 0.05
      return [
        `物块速度: ${s.v.toFixed(2)} m/s`,
        `传送带速度: ${p.beltSpeed.toFixed(1)} m/s`,
        `相对速度: ${isSynced ? 0 : dv.toFixed(2)} m/s`,
        `位移: ${s.x.toFixed(1)} / ${p.beltLength} m`,
        `加速度: ${(isSynced ? 0 : Math.sign(dv) * p.mu * p.gravity).toFixed(2)} m/s²`,
        `μ = ${p.mu.toFixed(2)}`,
        `状态: ${isSynced ? '匀速 ✓' : (dv > 0 ? '加速中 🔄' : '减速中 🔄')}`,
        `时间: ${t.toFixed(2)} s`,
      ]
    },
  },

  "block-board": {
    createState: (p) => ({
      xb: 0.5, vb: p.v0, xB: 0, vB: 0,
      trail: [], trailB: [], _t: 0, _synced: false, events: [],
    }),
    step: (s, p, dt) => {
      const relV = s.vb - s.vB
      if (Math.abs(relV) > 0.01) {
        s.vb += -Math.sign(relV) * p.mu * p.gravity * dt
        s.vB += Math.sign(relV) * p.mu * p.m * p.gravity / p.M * dt
      } else {
        const vcm = (p.m * s.vb + p.M * s.vB) / (p.m + p.M)
        s.vb = vcm; s.vB = vcm
      }
      s._t += dt
      // 共速事件检测
      if (!s._synced && Math.abs(s.vb - s.vB) < 0.01) {
        s._synced = true
        s.events.push({ type: "sync", time: s._t, label: "共速" })
      }
      s.xb += s.vb * dt
      s.xB += s.vB * dt
      if (s.xb - s.xB >= p.boardLength) {
        s.xb = s.xB + p.boardLength
        if (s.vb > s.vB) s.vb = s.vB
      }
      if (s.trailB) {
        s.trailB.push({ x: s.xB, y: GROUND_Y + 0.15 })
        if (s.trailB.length > 5000) s.trailB.splice(0, s.trailB.length - 5000)
      }
    },
    isFinished: (s, p) => {
      return (s.xb - s.xB) >= p.boardLength || (Math.abs(s.vb - s.vB) < 0.01 && (s.xb - s.xB) < p.boardLength)
    },
    getBallPosition: (s, p) => ({ x: (s.xb + s.xB + p.boardLength) / 2, y: GROUND_Y }),
    getTrailPosition: (s) => ({ x: s.xb - 0.5, y: GROUND_Y + 0.4 }),
    trailFields: (s) => ({ t: s._t, vb: s.vb, vB: s.vB }),
    chartDefs: [
      {
        title: "v-t 图",
        xLabel: "t (s)",
        yLabel: "v (m/s)",
        getData: (trail) => [
          { name: "滑块", data: trail.map(p => [p.t, p.vb]) },
          { name: "木板", data: trail.map(p => [p.t, p.vB]) },
        ],
      },
    ],
    getInfoLines: (s, p, t) => {
      const relV = s.vb - s.vB
      const relDisp = s.xb - s.xB
      const isDone = Math.abs(relV) < 0.01
      const a_block = relV > 0 ? -p.mu * p.gravity : p.mu * p.gravity
      return [
        `滑块速度: ${s.vb.toFixed(2)} m/s`,
        `木板速度: ${s.vB.toFixed(2)} m/s`,
        `相对速度: ${relV.toFixed(2)} m/s`,
        `相对位移: ${relDisp.toFixed(2)} / ${p.boardLength} m`,
        `滑块加速度: ${isDone ? 0 : a_block.toFixed(2)} m/s²`,
        `m=${p.m}kg  M=${p.M}kg  μ=${p.mu.toFixed(2)}`,
        `状态: ${isDone ? '已共速 ✓' : (relDisp >= p.boardLength ? '滑块滑落 ⚡' : '相对滑动中 🔄')}`,
        ...(isDone ? [`共速速度: ${((p.m * p.v0) / (p.m + p.M)).toFixed(2)} m/s`] : []),
        `时间: ${t.toFixed(2)} s`,
      ]
    },
  },

  // ── 杠杆 ──
  "lever": {
    createState: (p) => ({
      angle: 0, omega: 0, _t: 0,
      trail: [],
    }),
    step: (s, p, dt) => {
      // 力矩 = 力 × 力臂 × 方向（向下为正，产生顺时针力矩）
      const tau1 = p.F1 * p.d1 * (p.dir1 || 1)  // 左侧力矩（正=顺时针）
      const tau2 = p.F2 * p.d2 * (p.dir2 || 1)  // 右侧力矩（正=顺时针）
      const tau = tau2 - tau1  // 右侧顺时针 - 左侧逆时针
      const I = 2.0  // 等效转动惯量
      const alpha = tau / I - 0.8 * s.omega  // 阻尼
      s.omega += alpha * dt
      s.angle += s.omega * dt
      s._t += dt
      // 触地限制：杠杆末端不能低于地面
      const pivotY = 1.2
      const halfLen = 5
      const maxAngle = Math.asin((pivotY - GROUND_Y) / halfLen) // ≈0.16 rad ≈ 9.2°
      if (s.angle > maxAngle) { s.angle = maxAngle; s.omega = 0 }
      if (s.angle < -maxAngle) { s.angle = -maxAngle; s.omega = 0 }
    },
    isFinished: () => false,
    getBallPosition: () => ({ x: 0, y: 1.2 }),
    getTrailPosition: () => null,
    trailFields: (s) => ({ t: s._t, angle: s.angle * 180 / Math.PI }),
    chartDefs: [
      { title: "θ-t 图", xLabel: "t (s)", yLabel: "θ (°)", getData: (trail) => [{ name: "摆角", data: trail.map(p => [p.t, p.angle]) }] },
    ],
    getInfoLines: (s, p, t) => {
      const tau1 = p.F1 * p.d1 * (p.dir1 || 1)
      const tau2 = p.F2 * p.d2 * (p.dir2 || 1)
      const diff = tau2 - tau1
      const balanced = Math.abs(diff) < 0.1
      return [
        `左侧力矩: ${tau1.toFixed(1)} N·m`,
        `右侧力矩: ${tau2.toFixed(1)} N·m`,
        `力矩差: ${diff.toFixed(1)} N·m`,
        `状态: ${balanced ? '平衡 ✓' : (diff > 0 ? '右侧下沉 ↘' : '左侧下沉 ↙')}`,
        `杠杆角度: ${(s.angle * 180 / Math.PI).toFixed(1)}°`,
        `时间: ${t.toFixed(2)} s`,
      ]
    },
  },

  // ── 定滑轮 ──
  "pulley": {
    createState: (p) => {
      const H = p.pulleyH || 5
      const y0 = Math.min(p.initHeight || 2, H - 0.5)  // 初始高度不超过滑轮
      const effortY0 = H - 2.5  // 手在滑轮下方 2.5m，绳子长一点
      const ropeLen = (H - y0) + (H - effortY0)
      return { y: y0, effortY: effortY0, ropeLen, vy: 0, _t: 0, trail: [] }
    },
    step: (s, p, dt) => {
      const weight = p.mass * p.gravity
      const netF = p.pullForce - weight
      const a = netF / p.mass
      s.vy += a * dt
      s.y += s.vy * dt
      s._t += dt
      const H = p.pulleyH || 5
      const maxY = H - 0.5
      const minY = 0.5
      if (s.y > maxY) { s.y = maxY; if (s.vy > 0) s.vy = 0 }
      if (s.y < minY) { s.y = minY; if (s.vy < 0) s.vy = 0 }
      // 绳长守恒（手不能超过滑轮，不能低于地面）
      s.effortY = 2 * H - s.ropeLen - s.y
      if (s.effortY > H) s.effortY = H
      if (s.effortY < 0.3) s.effortY = 0.3
    },
    isFinished: () => false,
    getBallPosition: (s) => ({ x: -0.6, y: s.y }),
    getTrailPosition: () => null,
    trailFields: (s) => ({ t: s._t, y: s.y, vy: s.vy }),
    chartDefs: [
      { title: "y-t 图", xLabel: "t (s)", yLabel: "y (m)", getData: (trail) => [{ name: "高度", data: trail.map(p => [p.t, p.y]) }] },
      { title: "v-t 图", xLabel: "t (s)", yLabel: "v (m/s)", getData: (trail) => [{ name: "速度", data: trail.map(p => [p.t, p.vy]) }] },
    ],
    getInfoLines: (s, p, t) => {
      const weight = p.mass * p.gravity
      const netF = p.pullForce - weight
      const a = netF / p.mass
      return [
        `物体高度: ${s.y.toFixed(2)} m`,
        `速度: ${s.vy.toFixed(2)} m/s`,
        `重力: ${weight.toFixed(1)} N`,
        `拉力: ${p.pullForce.toFixed(1)} N`,
        `合力: ${netF.toFixed(1)} N`,
        `加速度: ${a.toFixed(2)} m/s²`,
        `状态: ${Math.abs(netF) < 0.05 ? '平衡 ✓' : (netF > 0 ? '上升 ↑' : '下降 ↓')}`,
        `时间: ${t.toFixed(2)} s`,
      ]
    },
  },

  // ── 动滑轮 ──
  // 布局：天花板锚点（左）→ 绳子下到动滑轮（绕过底部）→ 绳子上到手
  // 动滑轮：手向上拉 → 重物向上（同向运动），手移动距离 = 2×重物移动距离
  // 受力：2段绳子承担物重，F合 = 2F拉 - mg
  "movable-pulley": {
    createState: (p) => {
      const H = p.ceilingH || 5
      const y0 = Math.min(p.initHeight || 2, H - 1.5)
      const PULLEY_OFFSET = 1.0  // 同 step 中的偏移
      // 手初始在滑轮轮子上方一点
      const effortY0 = Math.min(y0 + PULLEY_OFFSET + 0.3, H - 0.5)
      return { y: y0, _y0: y0, _effortY0: effortY0, effortY: effortY0, vy: 0, _t: 0, trail: [] }
    },
    step: (s, p, dt) => {
      const weight = p.mass * p.gravity
      const netF = 2 * p.pullForce - weight
      const a = netF / p.mass
      s.vy += a * dt
      s.y += s.vy * dt
      s._t += dt
      const H = p.ceilingH || 5
      const PULLEY_OFFSET = 1.0
      // 唯一物理约束：动滑轮不能碰到天花板，重物不能陷入地面
      const maxY = H - PULLEY_OFFSET - 0.3
      const minY = 0.5
      if (s.y > maxY) { s.y = maxY; if (s.vy > 0) s.vy = 0 }
      if (s.y < minY) { s.y = minY; if (s.vy < 0) s.vy = 0 }
      // 绳长守恒：重物位置确定后再算手位置（保证手与重物同向，手位移 = 2×重物位移）
      s.effortY = s._effortY0 + 2 * (s.y - s._y0)
    },
    isFinished: () => false,
    getBallPosition: (s) => ({ x: 0, y: s.y }),
    getTrailPosition: () => null,
    trailFields: (s) => ({ t: s._t, y: s.y, vy: s.vy, effortY: s.effortY }),
    chartDefs: [
      { title: "y-t 图", xLabel: "t (s)", yLabel: "y (m)", getData: (trail) => [
        { name: "重物高度", data: trail.map(p => [p.t, p.y]) },
      ]},
      { title: "v-t 图", xLabel: "t (s)", yLabel: "v (m/s)", getData: (trail) => [
        { name: "重物速度", data: trail.map(p => [p.t, p.vy]) },
      ]},
      { title: "手位置-t 图", xLabel: "t (s)", yLabel: "手高度 (m)", getData: (trail) => [
        { name: "手高度", data: trail.map(p => [p.t, p.effortY]) },
      ]},
    ],
    getInfoLines: (s, p, t) => {
      const weight = p.mass * p.gravity
      const H = p.ceilingH || 5
      const PULLEY_OFFSET = 1.0
      const maxY = H - PULLEY_OFFSET - 0.3
      const netF = 2 * p.pullForce - weight
      const a = netF / p.mass
      return [
        `重物高度: ${s.y.toFixed(2)} / ${maxY.toFixed(2)} m`,
        `手高度: ${s.effortY.toFixed(2)} m`,
        `速度: ${s.vy.toFixed(2)} m/s`,
        `重力: ${weight.toFixed(1)} N`,
        `拉力: ${p.pullForce.toFixed(1)} N × 2 = ${(2 * p.pullForce).toFixed(1)} N`,
        `合力: ${netF.toFixed(1)} N`,
        `加速度: ${a.toFixed(2)} m/s²`,
        `状态: ${Math.abs(netF) < 0.05 ? '平衡 ✓' : (netF > 0 ? '上升 ↑' : '下降 ↓')}`,
        `时间: ${t.toFixed(2)} s`,
      ]
    },
  },

  // ── 滑轮组 (定+动, n=2) ──
  // 绳子从天花板锚点 → 下到动滑轮底部 → 上到定滑轮顶部 → 下到手
  // 手向下拉，物体上升；手移动距离 = 2×物体移动距离
  "pulley-system": {
    createState: (p) => {
      const H = p.ceilingH || 5
      const SLACK = 1.0          // 手侧绳长余量（m），防手一拉就碰地
      const PULLEY_OFFSET = 1.2  // 重物中心 → 动滑轮中心距离（m）
      const PULLEY_RADIUS = 0.47 // 滑轮半径 ~ 14px/30
      const ROPE_END_OFFSET = 0.5 // 手侧绳端在定滑轮中心下方 0.5m 处，缩短手侧绳长
      const maxY = H - PULLEY_OFFSET - PULLEY_RADIUS - 0.1  // 动滑轮触顶前停
      const y0 = Math.min(p.initHeight || 2, maxY)
      // 手初始位置（含绳长余量 + 绳端偏移）
      const effortY0 = H + SLACK - 2 * y0 + ROPE_END_OFFSET
      return { y: y0, effortY: Math.max(effortY0, 0.3), vy: 0, _t: 0, trail: [] }
    },
    step: (s, p, dt) => {
      const weight = p.mass * p.gravity
      const netF = 2 * p.pullForce - weight
      const a = netF / p.mass
      s.vy += a * dt
      s.y += s.vy * dt
      s._t += dt
      const H = p.ceilingH || 5
      const SLACK = 1.0
      const PULLEY_OFFSET = 1.2
      const PULLEY_RADIUS = 0.47
      const ROPE_END_OFFSET = 0.5
      // 动滑轮触顶停止：重物最高 = 天花板 - 滑轮偏移 - 滑轮半径 - 间隙
      const maxY = H - PULLEY_OFFSET - PULLEY_RADIUS - 0.1
      const minY = 0.5
      if (s.y > maxY) { s.y = maxY; if (s.vy > 0) s.vy = 0 }
      if (s.y < minY) { s.y = minY; if (s.vy < 0) s.vy = 0 }
      // 绳长守恒（含 slack + 绳端偏移）：手与重物反向运动，Δ手 = -2 × Δ重物
      s.effortY = H + SLACK - 2 * s.y + ROPE_END_OFFSET
      if (s.effortY > H) s.effortY = H
      if (s.effortY < 0.3) s.effortY = 0.3
    },
    isFinished: () => false,
    getBallPosition: (s) => ({ x: 0, y: s.y }),
    getTrailPosition: () => null,
    trailFields: (s) => ({ t: s._t, y: s.y, vy: s.vy, effortY: s.effortY }),
    chartDefs: [
      { title: "y-t 图", xLabel: "t (s)", yLabel: "y (m)", getData: (trail) => [
        { name: "重物高度", data: trail.map(p => [p.t, p.y]) },
      ]},
      { title: "v-t 图", xLabel: "t (s)", yLabel: "v (m/s)", getData: (trail) => [
        { name: "重物速度", data: trail.map(p => [p.t, p.vy]) },
      ]},
      { title: "手位置-t 图", xLabel: "t (s)", yLabel: "手高度 (m)", getData: (trail) => [
        { name: "手高度", data: trail.map(p => [p.t, p.effortY]) },
      ]},
    ],
    getInfoLines: (s, p, t) => {
      const weight = p.mass * p.gravity
      const netF = 2 * p.pullForce - weight
      const a = netF / p.mass
      const H = p.ceilingH || 5
      const PULLEY_OFFSET = 1.2
      const PULLEY_RADIUS = 0.47
      const pulleyTop = s.y + PULLEY_OFFSET + PULLEY_RADIUS
      const atCeiling = pulleyTop >= H - 0.15
      const atFloor = s.effortY <= 0.35
      return [
        `重物高度: ${s.y.toFixed(2)} m`,
        `动滑轮高度: ${(s.y + PULLEY_OFFSET).toFixed(2)} m`,
        `手高度: ${s.effortY.toFixed(2)} m`,
        `速度: ${s.vy.toFixed(2)} m/s`,
        `重力: ${weight.toFixed(1)} N`,
        `拉力: ${p.pullForce.toFixed(1)} N × 2 = ${(2 * p.pullForce).toFixed(1)} N`,
        `合力: ${netF.toFixed(1)} N`,
        `加速度: ${a.toFixed(2)} m/s²`,
        `状态: ${atCeiling ? '■ 动滑轮触顶' : atFloor ? '■ 手已到底' : (Math.abs(netF) < 0.05 ? '平衡 ✓' : (netF > 0 ? '上升 ↑' : '下降 ↓'))}`,
        `时间: ${t.toFixed(2)} s`,
      ]
    },
  },

  // ── 浮力 ──
  "buoyancy": {
    createState: (p) => {
      const side = Math.cbrt(p.volume)
      return { y: p.liquidH + side + 0.5, vy: 0, side, trail: [], _t: 0 }
    },
    step: (s, p, dt) => {
      const side = s.side
      const top = s.y + side
      const bottom = s.y
      // 浸没高度
      let hSub = 0
      if (bottom < p.liquidH) {
        hSub = Math.min(top, p.liquidH) - Math.max(bottom, 0)
        hSub = Math.max(0, hSub)
      }
      const Vsub = hSub * side * side  // 浸没面积 = side²，浸没体积 = hSub × side²
      const Fb = p.rhoLiquid * p.gravity * Vsub
      const G = p.rhoObj * p.gravity * p.volume
      let a = (G - Fb) / (p.rhoObj * p.volume)
      if (hSub > 0) a -= s.vy * 5 // 液体阻尼（仅浸没时生效）
      s.vy += a * dt
      s.y -= s.vy * dt // 向下为正方向
      // 液面限制
      if (s.y < 0) { s.y = 0; if (s.vy > 0) s.vy = 0 }
      if (s.y > p.liquidH + side + 1) { s.y = p.liquidH + side + 1; s.vy = 0 }
      s._t += dt
    },
    isFinished: (s, p) => {
      // 沉底
      if (s.y <= 0.01 && Math.abs(s.vy) < 0.01) return true
      // 平衡（漂浮/悬浮）
      const side = s.side
      const hSub = Math.max(0, Math.min(s.y + side, p.liquidH) - Math.max(s.y, 0))
      const Vsub = hSub * side * side
      const Fb = p.rhoLiquid * p.gravity * Vsub
      const G = p.rhoObj * p.gravity * p.volume
      return Math.abs(s.vy) < 0.01 && Math.abs(G - Fb) < 0.1
    },
    getBallPosition: (s) => ({ x: 0, y: s.y + s.side / 2 }),
    getTrailPosition: (s) => ({ x: 0, y: s.y }),
    trailFields: (s, p) => {
      const side = s.side
      const hSub = Math.max(0, Math.min(s.y + side, p.liquidH) - Math.max(s.y, 0))
      const Vsub = hSub * side * side
      const Fb = p.rhoLiquid * p.gravity * Vsub
      const G = p.rhoObj * p.gravity * p.volume
      return { t: s._t, y: s.y, Fb, G, hSub }
    },
    chartDefs: [
      { title: "y-t 图（位置）", xLabel: "t (s)", yLabel: "y (m)", getData: (trail) => [{ name: "位置", data: trail.map(p => [p.t, p.y]) }] },
      { title: "F-t 图（力）", xLabel: "t (s)", yLabel: "F (N)", getData: (trail) => [
        { name: "浮力", data: trail.map(p => [p.t, p.Fb]) },
        { name: "重力", data: trail.map(p => [p.t, p.G]), lineStyle: "dashed" },
      ]},
    ],
    getInfoLines: (s, p, t) => {
      const side = s.side
      const hSub = Math.max(0, Math.min(s.y + side, p.liquidH) - Math.max(s.y, 0))
      const Vsub = hSub * side * side
      const Fb = p.rhoLiquid * p.gravity * Vsub
      const G = p.rhoObj * p.gravity * p.volume
      const ratio = p.rhoObj / p.rhoLiquid
      let status = ''
      if (ratio < 1) status = `漂浮（浸没 ${(ratio * 100).toFixed(0)}%）`
      else if (Math.abs(ratio - 1) < 0.001) status = '悬浮'
      else status = '下沉'
      return [
        `浮力: ${Fb.toFixed(1)} N`,
        `重力: ${G.toFixed(1)} N`,
        `合力: ${(Fb - G).toFixed(1)} N`,
        `浸没深度: ${hSub.toFixed(2)} m`,
        `V排: ${Vsub.toFixed(3)} m³ / V物: ${p.volume.toFixed(3)} m³`,
        `ρ物/ρ液: ${p.rhoObj}/${p.rhoLiquid} = ${ratio.toFixed(2)}`,
        `状态: ${status}`,
        `时间: ${t.toFixed(2)} s`,
      ]
    },
  },

  // ── 力的合成（平行四边形法则）──
  "force-composition": {
    createState: (p) => {
      const rad = p.angle * Math.PI / 180
      const Fr = Math.sqrt(p.F1 ** 2 + p.F2 ** 2 + 2 * p.F1 * p.F2 * Math.cos(rad))
      const FrV = Math.sqrt(Math.max(0, Fr ** 2 - p.F1 ** 2))
      return { _t: 0, Fr, FrV, trail: [] }
    },
    step: (s, p, dt) => {
      const rad = p.angle * Math.PI / 180
      s.Fr = Math.sqrt(p.F1 ** 2 + p.F2 ** 2 + 2 * p.F1 * p.F2 * Math.cos(rad))
      s.FrV = Math.sqrt(Math.max(0, s.Fr ** 2 - p.F1 ** 2))
      s._t += dt
    },
    isFinished: () => false,
    getBallPosition: () => ({ x: 0, y: 0 }),
    getTrailPosition: () => null,
    trailFields: (s) => ({ t: s._t, Fr: s.Fr, FrV: s.FrV }),
    chartDefs: [
      {
        title: "合力随夹角变化",
        xLabel: "夹角 θ (°)",
        yLabel: "合力 F (N)",
        getData: (trail) => [{ name: "合力 F", data: trail.map(p => [p.t, p.Fr]) }],
      },
    ],
    getInfoLines: (s, p, t) => {
      const rad = p.angle * Math.PI / 180
      const Fr = Math.sqrt(p.F1 ** 2 + p.F2 ** 2 + 2 * p.F1 * p.F2 * Math.cos(rad))
      const FrV = Math.sqrt(Math.max(0, Fr ** 2 - p.F1 ** 2))
      return [
        `F₁ = ${p.F1.toFixed(1)} N`,
        `F₂ = ${p.F2.toFixed(1)} N`,
        `夹角: ${p.angle}°`,
        `合力: ${Fr.toFixed(2)} N`,
        `F合竖直分量: ${FrV.toFixed(2)} N`,
        `合力范围: ${Math.abs(p.F1 - p.F2).toFixed(1)} ~ ${(p.F1 + p.F2).toFixed(1)} N`,
        `时间: ${t.toFixed(2)} s`,
      ]
    },
  },

  // ── 波的叠加 ──
  "string-wave": {
    createState: (p) => {
      const N = 500, L = 25
      return { N, L, _t: 0, trail: [], _snap: null }
    },
    step: (s, p, dt) => {
      s._t += dt
      const L = s.L, A = p.amplitude
      const wl = L / p.waveCount
      const k = 2 * Math.PI / wl
      const omega = k * p.waveSpeed
      const phiL = p.phaseL * Math.PI / 180
      const phiR = p.phaseR * Math.PI / 180
      const t = s._t
      // 波形快照（只保留最新一帧，100 点让曲线平滑）
      const nSamples = 100
      const yL = [], yR = [], yS = []
      for (let i = 0; i <= nSamples; i++) {
        const x = i * L / nSamples
        yL.push(A * Math.sin(k * x - omega * t + phiL))
        yR.push(A * Math.sin(k * x + omega * t + phiR))
        yS.push(yL[i] + yR[i])
      }
      s._snap = { yL, yR, yS }
      // trail 每 0.2s 存一次（约 50 点 / 10s，echarts 流畅不卡）
      if (s.trail.length === 0 || t - s.trail[s.trail.length - 1].t >= 0.2) {
        s.trail.push({ t, yL: [...yL], yR: [...yR], yS: [...yS] })
      } else {
        s.trail[s.trail.length - 1].t = t
      }
    },
    isFinished: (s) => s._t >= 10,
    getBallPosition: () => ({ x: 12.5, y: 6 }),
    getTrailPosition: () => null,
    trailFields: (s) => ({ t: s._t }),
    chartDefs: [
      {
        title: "波形对比",
        xLabel: "x (m)",
        yLabel: "y (m)",
        getData: (trail) => {
          if (!trail || trail.length === 0) return []
          const last = trail[trail.length - 1]
          const L = 25, n = last.yL.length
          const xVals = Array.from({ length: n }, (_, i) => +(i * L / (n - 1)).toFixed(1))
          return [
            { name: "左波", data: xVals.map((x, i) => [x, last.yL[i]]), color: "#e74c3c" },
            { name: "右波", data: xVals.map((x, i) => [x, last.yR[i]]), color: "#3498db" },
            { name: "叠加", data: xVals.map((x, i) => [x, last.yS[i]]), color: "#2ecc71", lineStyle: "dashed" },
          ]
        },
      },
    ],
    getInfoLines: (s, p, t) => {
      const L = 25
      const wavelength = L / p.waveCount
      const frequency = p.waveSpeed / wavelength
      // 当前时刻各波中心点位移
      const cx = L / 2
      const k = 2 * Math.PI / wavelength
      const omega = k * p.waveSpeed
      const phiL = p.phaseL * Math.PI / 180
      const phiR = p.phaseR * Math.PI / 180
      const yL = p.amplitude * Math.sin(k * cx - omega * t + phiL)
      const yR = p.amplitude * Math.sin(k * cx + omega * t + phiR)
      const yS = yL + yR
      return [
        `波长: λ = ${wavelength.toFixed(1)} m  频率: f = ${frequency.toFixed(2)} Hz`,
        `波速: v = ${p.waveSpeed} m/s  振幅: A = ${p.amplitude.toFixed(1)} m`,
        `左波相位: ${p.phaseL}°  右波相位: ${p.phaseR}°`,
        `中点左波: ${yL.toFixed(2)} m  右波: ${yR.toFixed(2)} m`,
        `中点叠加: ${yS.toFixed(2)} m`,
        `叠加最大: ${(2 * p.amplitude).toFixed(1)} m（同相）`,
        `时间: ${t.toFixed(2)} s`,
      ]
    },
  },

  // ── 凸透镜成像 ──
  "convex-lens": {
    createState: (p) => {
      // 根据物距计算像距
      const f = p.focalLength
      const u = p.objectDist
      let v = null
      let isVirtual = false
      if (Math.abs(u - f) < 0.01) {
        v = Infinity
      } else {
        v = (f * u) / (u - f)
        isVirtual = v < 0
      }
      return { _t: 0, trail: [], v, isVirtual }
    },
    step: (s, p, dt) => {
      s._t += dt
      // 实时计算像距
      const f = p.focalLength
      const u = p.objectDist
      if (Math.abs(u - f) < 0.01) {
        s.v = Infinity
        s.isVirtual = false
      } else {
        s.v = (f * u) / (u - f)
        s.isVirtual = s.v < 0
      }
    },
    isFinished: () => false,
    getBallPosition: () => null,
    getTrailPosition: () => null,
    trailFields: () => null,
    chartDefs: [],
    getInfoLines: (s, p) => {
      const f = p.focalLength
      const u = p.objectDist
      const h = p.objectHeight
      if (Math.abs(u - f) < 0.01) {
        return [
          `焦距: f = ${f} cm`,
          `物距: u = ${u} cm (= f，不成像)`,
          `物高: ${h} cm`,
          `⚠ 物体在焦点上，折射光线平行`,
        ]
      }
      const v = s.v
      const isVirtual = s.isVirtual
      const absV = Math.abs(v)
      const magnification = absV / u
      const imageH = h * magnification
      // 判断像的性质
      let desc = ""
      if (isVirtual) {
        desc = "正立、放大、虚像（同侧）"
      } else if (u > 2 * f) {
        desc = "倒立、缩小、实像（异侧）"
      } else if (Math.abs(u - 2 * f) < 0.01) {
        desc = "倒立、等大、实像（异侧）"
      } else {
        desc = "倒立、放大、实像（异侧）"
      }
      return [
        `焦距: f = ${f} cm`,
        `物距: u = ${u} cm`,
        `像距: ${isVirtual ? "" : "v = "}${isVirtual ? "|v| = " : ""}${absV.toFixed(1)} cm`,
        `物高: ${h} cm  像高: ${imageH.toFixed(1)} cm`,
        `放大率: ${magnification.toFixed(2)}×`,
        `${desc}`,
      ]
    },
  },

  // ── 凹透镜成像 ──
  "concave-lens": {
    createState: (p) => ({ _t: 0, trail: [] }),
    step: (s, p, dt) => { s._t += dt },
    isFinished: () => false,
    getBallPosition: () => null,
    getTrailPosition: () => null,
    trailFields: () => null,
    chartDefs: [],
    getInfoLines: (s, p) => {
      const f = -p.focalLength // 凹透镜焦距为负
      const u = p.objectDist
      const h = p.objectHeight
      const v = (f * u) / (u - f)
      const absV = Math.abs(v)
      const magnification = absV / u
      const imageH = h * magnification
      return [
        `焦距: f = ${f} cm（凹透镜）`,
        `物距: u = ${u} cm`,
        `像距: |v| = ${absV.toFixed(1)} cm（同侧）`,
        `物高: ${h} cm  像高: ${imageH.toFixed(1)} cm`,
        `放大率: ${magnification.toFixed(2)}×`,
        `正立、缩小、虚像`,
      ]
    },
  },

  // ── 声波测距（回声）──
  "echo-ranging": {
    createState: (p) => ({
      waveX: 0,
      carX: 0,
      dir: 1,
      reflected: false,
      waveDone: false,
      totalTime: 0,
      waveTrail: [],  // 波的轨迹
      trail: [],
      _t: 0,
    }),
    step: (s, p, dt) => {
      if (s.waveDone) return
      s.waveX += s.dir * p.soundSpeed * dt
      s.carX += p.v0 * dt
      s._t += dt
      // 记录波的轨迹
      s.waveTrail.push({ x: s.waveX, y: 0 })
      if (s.waveTrail.length > 5000) s.waveTrail.splice(0, s.waveTrail.length - 5000)
      // 碰到墙，反射
      if (s.dir === 1 && s.waveX >= p.wallDist) {
        s.waveX = p.wallDist
        s.dir = -1
        s.reflected = true
      }
      // 回到小车（波追上移动的小车），结束
      if (s.dir === -1 && s.waveX <= s.carX) {
        s.waveX = s.carX
        s.waveDone = true
        s.totalTime = s._t
      }
    },
    isFinished: (s) => s.waveDone,
    getBallPosition: (s) => ({ x: s.waveX, y: 0 }),
    getTrailPosition: (s) => ({ x: s.waveX, y: 0 }),
    trailFields: (s) => ({ t: s._t, x: s.waveX, carX: s.carX }),
    chartDefs: [
      {
        title: "位置-时间图",
        xLabel: "t (s)",
        yLabel: "x (m)",
        getData: (trail, params) => [
          { name: "声波", data: trail.map(p => [p.t, p.x]) },
          { name: "小车", data: trail.map(p => [p.t, p.carX]) },
          { name: "墙壁", data: trail.map(p => [p.t, params.wallDist]), lineStyle: "dashed" },
        ],
      },
    ],
    getInfoLines: (s, p, t) => {
      const tTotal = s.totalTime > 0 ? s.totalTime : t
      const d = tTotal * p.soundSpeed / 2
      return [
        `测距结果: d = v×t/2 = ${d.toFixed(1)} m`,
        `墙壁距离: ${p.wallDist} m`,
        `声速: ${p.soundSpeed} m/s`,
        `车速: ${p.v0} m/s`,
        `波位置: ${s.waveX.toFixed(1)} m`,
        `车位置: ${s.carX.toFixed(1)} m`,
        `方向: ${s.dir === 1 ? '→ 去程' : '← 回程'}`,
        `时间: ${t.toFixed(3)} s`,
        `状态: ${s.waveDone ? '✓ 回声已收到' : (s.reflected ? '回程中...' : '去程中...')}`,
      ]
    },
  },

}
