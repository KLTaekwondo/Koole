import ArticleAPI from "../api/ArticleAPI.js"

export function articleInterface(){
    const findAll = async () =>{
        const data = await ArticleAPI.findAll();
        return Array.isArray(data) ? data : [];
    }

    const findById = async (id) =>{
        const data = await ArticleAPI.findById(id);
        return data || {};
    }

    const getTagSummary = async (tagId) =>{
        const data = await ArticleAPI.getTagSummary(tagId);
        return Array.isArray(data) ? data : [];
    }

    const create = async (data) =>{
        console.log(data)
        await ArticleAPI.create(data);
        return true;
    }

    const update = async (id, data) =>{
        await ArticleAPI.update(id, data);
        return true;
    }

    const deleteById = async (id) =>{
        await ArticleAPI.deleteById(id);
        return true;
    }

    return{
        findAll,
        findById,
        getTagSummary,
        create,
        update,
        deleteById,
    }
}