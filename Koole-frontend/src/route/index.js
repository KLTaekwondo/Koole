import { createRouter, createWebHistory } from "vue-router"
import HomeView from "../views/HomeView.vue"
import ArticleList from "../views/ArticleList.vue"
import ArticleEditor from "../views/editor/ArticleEditor.vue"
import ArticleDetail from "../views/detail/ArticleDetail.vue"
import UpdatePostList from "../views/UpdatePostList.vue"
import UpdatePostEditor from "../views/editor/UpdatePostEditor.vue"
import UpdatePostDetail from "../views/detail/UpdatePostDetail.vue"

const routes = [
    {
        path: "/",
        name: "Home",
        component: HomeView,
    },
    {
        path: "/article",
        name: "ArticleList",
        component: ArticleList,
    },
    {
        path: "/article/create",
        name: "ArticleCreate",
        component: ArticleEditor,
    },
    {
        path: "/article/:id",
        name: "ArticleDetail",
        component: ArticleDetail,
    },
    {
        path: "/updatepost",
        name: "UpdatePostList",
        component: UpdatePostList,
    },
    {
        path: "/updatepost/create",
        name: "UpdatePostCreate",
        component: UpdatePostEditor,
    },
    {
        path: "/updatepost/:id",
        name: "UpdatePostDetail",
        component: UpdatePostDetail,
    },
]

const router = createRouter({
    history: createWebHistory(),
    routes,
})

export default router
