import UserAPI from "../api/UserAPI.js"

export function userInterface(){
    const login = async (data) =>{
        const user = await UserAPI.login(data);
        return user || null;
    }

    const logout = async () =>{
        await UserAPI.logout();
        return true;
    }

    const getCurrent = async () =>{
        const user = await UserAPI.getCurrent();
        return user || null;
    }

    const registerByPhone = async (data) =>{
        await UserAPI.registerByPhone(data);
        return true;
    }

    const registerByEmail = async (data) =>{
        await UserAPI.registerByEmail(data);
        return true;
    }

    const updatePassword = async (data) =>{
        await UserAPI.updatePassword(data);
        return true;
    }

    return{
        login,
        logout,
        getCurrent,
        registerByPhone,
        registerByEmail,
        updatePassword,
    }
}

