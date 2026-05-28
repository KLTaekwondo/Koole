import backendService from "../backendService.js"

const userAPI = {
    login: (data) => backendService.post("/user/login", data),
    logout: () => backendService.post("/user/logout"),
    getCurrent: () => backendService.get("/user/current"),
    registerByPhone: (data) => backendService.post("/user/registerByPhone", data),
    registerByEmail: (data) => backendService.post("/user/registerByEmail", data),
    updatePassword: (data) => backendService.put("/user/updatePassword", data),
}

export default userAPI
