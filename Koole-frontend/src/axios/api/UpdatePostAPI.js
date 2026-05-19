import backendService from "../backendService.js"

const updatePostAPI = {
    findAll: () => backendService.get("/updatepost/findAll"),
    findById: (id) => backendService.get("/updatepost", { params: { id } }),
    create: (data) => backendService.post("/updatepost", data),
    update: (data) => backendService.put("/updatepost", data),
    delete: (id) => backendService.delete("/updatepost", { params: { id } }),
}

export default updatePostAPI;
