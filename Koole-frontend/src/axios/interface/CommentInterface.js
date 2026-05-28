import CommentAPI from "../api/CommentAPI.js"

export function commentInterface(){
    const getAllByArticleId = async (articleId) =>{
        const data = await CommentAPI.getAllByArticleId(articleId);
        return Array.isArray(data) ? data : [];
    }

    const create = async (articleId, data) =>{
        await CommentAPI.create(articleId, data);
        return true;
    }

    const deleteById = async (commentId) =>{
        await CommentAPI.deleteById(commentId);
        return true;
    }

    return{
        getAllByArticleId,
        create,
        deleteById,
    }
}