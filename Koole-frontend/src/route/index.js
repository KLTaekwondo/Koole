import { createRouter, createWebHashHistory } from "vue-router"
import HomeIndex from "../views/HomeIndex.vue"
import AboutIndex from "../views/AboutIndex.vue"
import PhysicsLab from "../views/PhysicsLab.vue"
import BiologyLab from "../views/BiologyLab.vue"
import ChemistryLab from "../views/ChemistryLab.vue"
import ChineseLab from "../views/ChineseLab.vue"
import MathLab from "../views/MathLab.vue"
import EnglishLab from "../views/EnglishLab.vue"
import PoliticsLab from "../views/PoliticsLab.vue"
import HistoryLab from "../views/HistoryLab.vue"
import GeographyLab from "../views/GeographyLab.vue"
import ClassicPhysicsLayout from "../views/classic/ClassicPhysicsLayout.vue"
import ClassicModelView from "../views/classic/ClassicModelView.vue"
import SandboxView from "../views/Sandbox.vue"

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
        path: "/physics-lab/classic",
        component: ClassicPhysicsLayout,
        redirect: "/physics-lab/classic/free-fall",
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
