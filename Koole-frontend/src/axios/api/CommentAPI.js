import backendService from "../backendService.js"

const commentAPI = {
    getAllByArticleId: (articleId) => backendService.get(`/comment/getAll/${articleId}`),
    create: (articleId, data) => backendService.post(`/comment/create/${articleId}`, data),
    deleteById: (commentId) => backendService.delete(`/comment/delete/${commentId}`),
}

export default commentAPI
