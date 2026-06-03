import { createRouter, createWebHistory } from "vue-router"
import HomeIndex from "../views/HomeIndex.vue"
import ArticleView from "../views/ArticleView.vue"
import AboutIndex from "../views/AboutIndex.vue"
import UpdatePostView from "../views/UpdatePostView.vue"
import PhysicsLab from "../views/PhysicsLab.vue"
import ClassicPhysicsLayout from "../views/classic/ClassicPhysicsLayout.vue"
import ClassicModelView from "../views/classic/ClassicModelView.vue"
import ArticleDetail from "../views/ArticleDetail.vue"
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
        path: "/articles",
        name: "学习笔记",
        component: ArticleView,
    },
    {
        path: "/articles/:id",
        name: "笔记详情",
        component: ArticleDetail,
    },
    {
        path: "/updateposts",
        name: "更新记录",
        component: UpdatePostView,
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
    history: createWebHistory(),
    routes,
})

export default router
