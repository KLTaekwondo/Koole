import backendService from "../backendService.js"

const updatePostAPI = {
    findAll: () => backendService.get("/updatepost/getAll"),
    findById: (id) => backendService.get(`/updatepost/getById/${id}`),
    create: (data) => backendService.post("/updatepost/create", data),
    update: (id, data) => backendService.put(`/updatepost/update/${id}`, data),
    delete: (id) => backendService.delete(`/updatepost/delete/${id}`),
}

export default updatePostAPI;
