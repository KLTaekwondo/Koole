import backendService from "../backendService.js"

const tagAPI = {
    getAll: () => backendService.get("/tag/getAll"),
}

export default tagAPI
