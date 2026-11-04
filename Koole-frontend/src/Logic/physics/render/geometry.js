/**
 * 绘制用的几何约定（叶子模块，不 import 任何模型）
 *
 * 之前场景文件直接 import GROUND_Y from physicsModels.js，
 * 而 physicsModels 又 import 各模型、模型 import 场景，形成循环依赖，
 * 模块初始化时会撞上 TDZ（Cannot access 'GROUND_Y' before initialization），
 * 直接导致路由启动失败。所以把这些约定单独放一个没有依赖的文件里。
 */

/** 世界 y = 0 到「球心贴地」的高度（米），对应画布底部 40px 留白 */
export const GROUND_Y = 0.4

/** 一世界单位对应多少像素（引擎里和 ViewTransform.zoom 一起用） */
export const BASE_UNIT = 30
