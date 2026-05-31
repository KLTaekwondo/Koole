import axios from "axios";
import { showToast } from "../stores/toast.js";

axios.defaults.withCredentials = true;

const backendService = axios.create({
    baseURL: "http://localhost:8080/api",
    timeout: 10000,
    headers: {
        "Content-Type": "application/json"
    }
});

backendService.interceptors.request.use(
    (config) => config,
    (error) => Promise.reject(error)
)

backendService.interceptors.response.use(
    (response) => {
        const res = response.data
        // 后端 Result 结构: { code, msg, data }
        if (res.code === 200) {
            // msg === "success" → 不弹 toast，直接返回 data
            if (res.msg === "success") {
                return res.data
            }
            // msg 有内容（如 "注册成功"）→ 弹 info toast
            if (res.msg) {
                showToast(res.msg, "success", 3000)
            }
            return res.data
        }

        // code !== 200 → 弹 error toast
        if (res.msg) {
            showToast(res.msg, "error", 4000)
        }
        return Promise.reject(new Error(res.msg || "请求失败"))
    },
    (error) => {
        // HTTP 错误（401、500 等）
        const status = error.response?.status
        const msg = error.response?.data?.msg || error.message

        if(status === 400) {
            showToast(msg || "请求参数错误", "error", 4000)
        }

        if (status === 401) {
            showToast(msg || "未登录或登录过期", "warning", 3000)
        }

        if (status === 403) {
            showToast(msg || "您没有权限访问该页面", "warning", 3000)
        }

        if (status === 404) {
            showToast(msg || "资源不存在", "warning", 3000)
        }

        if(status === 409){
            showToast(msg || "资源冲突", "error", 4000)
        }

        if (status === 500) {
            showToast("网络错误", "error", 4000)
        }


        return Promise.reject(error)
    }
)

export default backendService;
