import { createRouter, createWebHistory } from "vue-router"
import {isLoggedIn, checkLogin , currentUser} from "../stores/user.js"
import {showToast} from "../stores/toast.js"
import HomeIndex from "../views/HomeIndex.vue"
import ArticleView from "../views/ArticleView.vue"
import AboutIndex from "../views/AboutIndex.vue"
import UpdatePostView from "../views/UpdatePostView.vue"
import ArticleEditor from "../views/ArticleEditor.vue"
import UpdatePostEditor from "../views/UpdatePostEditor.vue"
import AuthView from "../views/AuthView.vue"
import PhysicsLab from "../views/PhysicsLab.vue"
import ClassicPhysicsLayout from "../views/classic/ClassicPhysicsLayout.vue"
import ClassicModelView from "../views/classic/ClassicModelView.vue"
import ArticleDetail from "../views/ArticleDetail.vue"
import UserPage from "../views/UserPage.vue"
import TestView from "../views/TestView.vue"
import SandboxView from "../views/Sandbox.vue"

const routes = [
    {
        path: "/",
        name: "首页",
        component: HomeIndex,
    },
    {
        path:"/about",
        name: "关于本站",
        component: AboutIndex,
    },
    {
        path:"/articles",
        name: "文章列表",
        component: ArticleView,
    },
    {
        path:"/articles/create",
        name: "编写文章",
        component: ArticleEditor,
        meta: {requiresAuth: true},
    },
    {
        path:"/articles/edit/:id",
        name: "编辑文章",
        component: ArticleEditor,
        meta: {requiresAuth: true},
    },
    {
        path:"/articles/:id",
        name: "文章详情",
        component: ArticleDetail,
    },
    {
        path:"/updateposts",
        name: "更新日志列表",
        component: UpdatePostView,
    },
    {
        path:"/updateposts/create",
        name: "编写更新日志",
        component: UpdatePostEditor,
        meta: {requiresAuth: true},
    },
    {
        path:"/updateposts/edit/:id",
        name: "编辑更新日志",
        component: UpdatePostEditor,
        meta: {requiresAuth: true},
    },
    {
        path:"/auth",
        name: "登录",
        component: AuthView,
    },
    {
        path:"/physics-lab",
        name: "物理实验室",
        component: PhysicsLab,
    },
    {
        path:"/physics-lab/classic",
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
        path:"/physics-lab/sandbox",
        name: "沙箱",
        component: SandboxView,
    },
    {
        path:"/user",
        name: "个人中心",
        component: UserPage,
        meta: {requiresAuth: true},
    },
    {
        path:"/test",
        name: "测试",
        component: TestView,
    },
]

const router = createRouter({
    history: createWebHistory(),
    routes,
})

router.beforeEach(async (to, from, next) => {
    if(to.meta.requiresAuth){
        if(!currentUser.value) {
            await checkLogin()
        }

        if(!isLoggedIn.value) {
            next({name: "登录" , query: {redirect: to.fullPath}})
            showToast("请先登录", "warning")
            return
        }
    }
    next()
})

export default router
