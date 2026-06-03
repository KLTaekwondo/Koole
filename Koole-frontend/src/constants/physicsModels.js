// ── 模型汇总 ──
// 每个模型文件自包含 UI 数据 + 物理逻辑 + 渲染逻辑
// 此文件负责汇总和导出

import freeFall from './models/free-fall.js'
import projectile from './models/projectile.js'
import dragFall from './models/drag-fall.js'
import bounceDeformation from './models/bounce-deformation.js'
import verticalThrow from './models/vertical-throw.js'
import circular from './models/circular.js'
import incline from './models/incline.js'
import pendulum from './models/pendulum.js'
import angledProjectile from './models/angled-projectile.js'
import boatRiver from './models/boat-river.js'
import springMass from './models/spring-mass.js'
import frictionSlide from './models/friction-slide.js'
import ballCollision from './models/ball-collision.js'
import connectedBodies from './models/connected-bodies.js'
import conveyorBelt from './models/conveyor-belt.js'
import blockBoard from './models/block-board.js'
import lever from './models/lever.js'
import pulley from './models/pulley.js'
import movablePulley from './models/movable-pulley.js'
import pulleySystem from './models/pulley-system.js'
import buoyancy from './models/buoyancy.js'
import forceComposition from './models/force-composition.js'
import stringWave from './models/string-wave.js'
import convexLens from './models/convex-lens.js'
import concaveLens from './models/concave-lens.js'
import echoRanging from './models/echo-ranging.js'
import refraction from './models/refraction.js'
import waterRefraction from './models/water-refraction.js'
import underwaterLight from './models/underwater-light.js'
import seriesCircuit from './models/series-circuit.js'
import parallelCircuit from './models/parallel-circuit.js'

export const DRAW_SCALE = 30 // 像素/米
export const GROUND_Y = 0.4 // 球心贴地高度（球半径/DRAW_SCALE）

export const PHYSICS_MODELS = [
  freeFall,
  projectile,
  verticalThrow,
  circular,
  incline,
  pendulum,
  angledProjectile,
  boatRiver,
  springMass,
  frictionSlide,
  dragFall,
  bounceDeformation,
  ballCollision,
  connectedBodies,
  conveyorBelt,
  blockBoard,
  lever,
  pulley,
  movablePulley,
  pulleySystem,
  buoyancy,
  forceComposition,
  stringWave,
  convexLens,
  concaveLens,
  refraction,
  waterRefraction,
  underwaterLight,
  seriesCircuit,
  parallelCircuit,
  echoRanging,
]

export const LEVELS = []
export const CATEGORIES = ["力学", "声学", "波", "光学", "电学"]
