import { createRouter, createWebHashHistory } from "vue-router"
import HomeIndex from "../views/HomeIndex.vue"
import AboutIndex from "../views/AboutIndex.vue"
import PhysicsLab from "../views/PhysicsLab.vue"
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
        name: "演示工具",
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
]

const router = createRouter({
    history: createWebHashHistory(),
    routes,
})

export default router
