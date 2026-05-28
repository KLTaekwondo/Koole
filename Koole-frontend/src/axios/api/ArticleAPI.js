import backendService from "../backendService.js"

const articleAPI = {
    findAll: () => backendService.get( "/article/getallSummary"),
    findById: (id) => backendService.get( `/article/getDetail/${id}`),
    getTagSummary: (tagId) => backendService.get( `/article/getTagSummary/${tagId}`),
    create: (data) => backendService.post( `/article/create`, data),
    update: (id, data) => backendService.put( `/article/update/${id}`, data),
    deleteById: (id) => backendService.delete( `/article/delete/${id}`),
}

export default articleAPI;
