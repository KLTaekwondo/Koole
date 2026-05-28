import TagAPI from "../api/TagAPI.js"

export function tagInterface(){
    const getAll = async () =>{
        const data = await TagAPI.getAll();
        return Array.isArray(data) ? data : [];
    }

    return{
        getAll,
    }
}

