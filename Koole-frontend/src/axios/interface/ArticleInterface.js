import ActicleAPI from "../api/ArticleAPI.js"

function articleInterface(){
    const findAll = async () =>{
        const response = await ActicleAPI.findAll();
        return Array.isArray(response.data) ? response.data : [];
    }

    const findById = async (id) =>{
        const response = await ActicleAPI.findById(id);
        return !response.data ? response.data : [];
    }

    const create = async (data) =>{
        const response = await ActicleAPI.create(data);
        return !!response;
    }

    const update = async (data) =>{
        const response = await ActicleAPI.update(data);
        return !!response;
    }

    const deleteById = async (id) =>{
        const response = await ActicleAPI.deleteById(id);
        return !!response;
    }

    return{
        findAll,
        findById,
        create,
        update,
        deleteById,
    }
}

export default articleInterface;