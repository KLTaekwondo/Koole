import backendService from "../backendService.js"

const articleAPI = {
    findAll: () => backendService.get( "/article/findAll"),
    findById: (id) => backendService.get( `/article/findById/${id}`),
    create: (data) => backendService.post( `/article/create`, data),
    update: (data) => backendService.put( `/article/update`, data),
    deleteById: (id) => backendService.delete( `/article/delete/${id}`),
}

export default articleAPI;
