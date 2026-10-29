import { createRouter, createWebHashHistory } from "vue-router"

// 首页保持同步加载（首屏直接出），其余页面一律路由级懒加载，
// 让每个实验室 / 列表页单独成包：首屏只下载首页需要的代码。
import HomeIndex from "../views/HomeIndex.vue"

const AboutIndex = () => import("../views/AboutIndex.vue")
const ProgressIndex = () => import("../views/ProgressIndex.vue")
const MoreSubjects = () => import("../views/MoreSubjects.vue")
const KnowledgeDetail = () => import("../views/knowledge/KnowledgeDetail.vue")
const PhysicsLab = () => import("../views/physics/PhysicsLab.vue")
const PhysicsLevels = () => import("../views/physics/levels/PhysicsLevels.vue")
const PhysicsLevelView = () => import("../views/physics/levels/PhysicsLevelView.vue")
const BiologyLab = () => import("../views/biology/BiologyLab.vue")
const ChemistryLab = () => import("../views/chemistry/ChemistryLab.vue")
const PeriodicTable = () => import("../views/chemistry/Elements/PeriodicTable.vue")
const ElementDetail = () => import("../views/chemistry/Elements/ElementDetail.vue")
const ChineseLab = () => import("../views/chinese/ChineseLab.vue")
const MathLab = () => import("../views/math/MathLab.vue")
const FunctionLab = () => import("../views/math/function/FunctionLab.vue")
const MathLevels = () => import("../views/math/levels/MathLevels.vue")
const MathLevelView = () => import("../views/math/levels/MathLevelView.vue")
const GeometryLab = () => import("../views/math/geometry/GeometryLab.vue")
const GaltonLab = () => import("../views/math/probability/GaltonLab.vue")
const EnglishLab = () => import("../views/english/EnglishLab.vue")
const PoliticsLab = () => import("../views/politics/PoliticsLab.vue")
const HistoryLab = () => import("../views/history/HistoryLab.vue")
const GeographyLab = () => import("../views/geography/GeographyLab.vue")
const ClassicPhysicsLayout = () => import("../views/physics/classic/ClassicPhysicsLayout.vue")
const ClassicModelView = () => import("../views/physics/classic/ClassicModelView.vue")
const SandboxView = () => import("../views/physics/sandbox/Sandbox.vue")

const routes = [
    {
        path: "/",
        name: "首页",
        component: HomeIndex,
    },
    {
        path: "/about",
        name: "关于本站",
        component: AboutIndex,
    },
    {
        path: "/progress",
        name: "学习进度",
        component: ProgressIndex,
    },
    {
        path: "/subjects",
        name: "其他学科",
        component: MoreSubjects,
    },
    {
        path: "/knowledge",
        // 知识小站已并入物理主页：保留旧链接的跳转，避免已分享的地址失效
        redirect: "/physics-lab",
    },
    {
        path: "/knowledge/:id",
        redirect: to => `/physics-lab/phenomena/${to.params.id}`,
    },
    {
        path: "/physics-lab",
        name: "物理小工具",
        component: PhysicsLab,
    },
    {
        path: "/physics-lab/phenomena/:id",
        name: "现象详情",
        component: KnowledgeDetail,
    },
    {
        path: "/physics-lab/levels",
        name: "物理关卡",
        component: PhysicsLevels,
    },
    {
        path: "/physics-lab/levels/:levelId",
        name: "物理关卡实验",
        component: PhysicsLevelView,
    },
    {
        path: "/physics-lab/classic",
        component: ClassicPhysicsLayout,
        meta: { transition: "fade" },
        children: [
            {
                path: ":modelId",
                name: "经典模型",
                component: ClassicModelView,
            },
        ],
    },
    {
        path: "/physics-lab/sandbox",
        name: "沙箱",
        component: SandboxView,
        meta: { transition: "fade" },
    },
    {
        path: "/bio-lab",
        name: "生物模型",
        component: BiologyLab,
    },
    {
        path: "/chem-lab/periodic-table",
        name: "元素周期表",
        component: PeriodicTable,
        meta: { transition: "fade" },
    },
    {
        path: "/chem-lab/periodic-table/:symbol",
        name: "元素详情",
        component: ElementDetail,
    },
    {
        path: "/chem-lab",
        name: "化学模型",
        component: ChemistryLab,
    },
    {
        path: "/chinese-lab",
        name: "语文实验室",
        component: ChineseLab,
    },
    {
        path: "/math-lab",
        name: "数学实验室",
        component: MathLab,
    },
    {
        path: "/math-lab/function-lab",
        name: "函数实验室",
        component: FunctionLab,
    },
    {
        path: "/math-lab/levels",
        name: "函数关卡",
        component: MathLevels,
    },
    {
        path: "/math-lab/levels/:levelId",
        name: "函数关卡实验",
        component: MathLevelView,
    },
    {
        path: "/math-lab/geometry-lab",
        name: "立体几何实验室",
        component: GeometryLab,
        meta: { transition: "fade" },
    },
    {
        path: "/math-lab/probability-lab",
        name: "概率钉板实验室",
        component: GaltonLab,
    },
    {
        path: "/english-lab",
        name: "英语实验室",
        component: EnglishLab,
    },
    {
        path: "/politics-lab",
        name: "政治实验室",
        component: PoliticsLab,
    },
    {
        path: "/history-lab",
        name: "历史实验室",
        component: HistoryLab,
    },
    {
        path: "/geography-lab",
        name: "地理实验室",
        component: GeographyLab,
    },
]

const router = createRouter({
    history: createWebHashHistory(),
    routes,
})

export default router
