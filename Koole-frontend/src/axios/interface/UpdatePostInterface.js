import UpdatePostAPI from "../api/UpdatePostAPI.js"

function updatePostInterface(){
    const findAll = async () =>{
        const response = await UpdatePostAPI.findAll();
        return Array.isArray(response.data) ? response.data : [];
    }

    const findById = async (id) =>{
        const response = await UpdatePostAPI.findById(id);
        return response.data || null;
    }

    const create = async (data) =>{
        const response = await UpdatePostAPI.create(data);
        return !!response;
    }

    const update = async (data) =>{
        const response = await UpdatePostAPI.update(data);
        return !!response;
    }

    const deleteById = async (id) =>{
        const response = await UpdatePostAPI.delete(id);
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

export default updatePostInterface;
