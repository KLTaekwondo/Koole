import { createRouter, createWebHashHistory } from "vue-router"
import HomeIndex from "../views/HomeIndex.vue"
import AboutIndex from "../views/AboutIndex.vue"
import PhysicsLab from "../views/physics/PhysicsLab.vue"
import PhysicsLevels from "../views/physics/levels/PhysicsLevels.vue"
import PhysicsLevelView from "../views/physics/levels/PhysicsLevelView.vue"
import BiologyLab from "../views/biology/BiologyLab.vue"
import ChemistryLab from "../views/chemistry/ChemistryLab.vue"
import PeriodicTable from "../views/chemistry/Elements/PeriodicTable.vue"
import ElementDetail from "../views/chemistry/Elements/ElementDetail.vue"
import ChineseLab from "../views/chinese/ChineseLab.vue"
import MathLab from "../views/math/MathLab.vue"
import FunctionLab from "../views/math/function/FunctionLab.vue"
import MathLevels from "../views/math/levels/MathLevels.vue"
import MathLevelView from "../views/math/levels/MathLevelView.vue"
import GeometryLab from "../views/math/geometry/GeometryLab.vue"
import GaltonLab from "../views/math/probability/GaltonLab.vue"
import EnglishLab from "../views/english/EnglishLab.vue"
import PoliticsLab from "../views/politics/PoliticsLab.vue"
import HistoryLab from "../views/history/HistoryLab.vue"
import GeographyLab from "../views/geography/GeographyLab.vue"
import ClassicPhysicsLayout from "../views/physics/classic/ClassicPhysicsLayout.vue"
import ClassicModelView from "../views/physics/classic/ClassicModelView.vue"
import SandboxView from "../views/physics/sandbox/Sandbox.vue"

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
        path: "/physics-lab",
        name: "物理小工具",
        component: PhysicsLab,
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
