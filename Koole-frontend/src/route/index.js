import { createRouter, createWebHistory } from "vue-router"
import HomeIndex from "../views/HomeIndex.vue"
import ArticleView from "../views/ArticleView.vue"
import AboutIndex from "../views/AboutIndex.vue"
import UpdatePostView from "../views/UpdatePostView.vue"
import ArticleEditor from "../views/ArticleEditor.vue"
import UpdatePostEditor from "../views/UpdatePostEditor.vue"
import AuthView from "../views/AuthView.vue"
import PhysicsLab from "../views/PhysicsLab.vue"
import ArticleDetail from "../views/ArticleDetail.vue"
import UserPage from "../views/UserPage.vue"
import TestView from "../views/TestView.vue"

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
    },
    {
        path:"/articles/edit/:id",
        name: "编辑文章",
        component: ArticleEditor,
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
    },
    {
        path:"/updateposts/edit/:id",
        name: "编辑更新日志",
        component: UpdatePostEditor,
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
        path:"/user",
        name: "个人中心",
        component: UserPage,
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

export default router
