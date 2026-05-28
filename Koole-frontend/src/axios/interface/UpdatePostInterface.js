import UpdatePostAPI from "../api/UpdatePostAPI.js"

export function updatePostInterface(){
    const findAll = async () =>{
        const data = await UpdatePostAPI.findAll();
        return Array.isArray(data) ? data : [];
    }

    const findById = async (id) =>{
        const data = await UpdatePostAPI.findById(id);
        return data || null;
    }

    const create = async (data) =>{
        await UpdatePostAPI.create(data);
        return true;
    }

    const update = async (id, data) =>{
        await UpdatePostAPI.update(id, data);
        return true;
    }

    const deleteById = async (id) =>{
        await UpdatePostAPI.delete(id);
        return true;
    }

    return{
        findAll,
        findById,
        create,
        update,
        deleteById,
    }
}

