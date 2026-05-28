import { ref, computed } from "vue"
import {userInterface} from "../axios/interface/UserInterface.js"

const STORAGE_KEY = "koole_user"

// 从 localStorage 恢复
const saved = localStorage.getItem(STORAGE_KEY)
const currentUser = ref(saved ? JSON.parse(saved) : null)

const isLoggedIn = computed(() => currentUser.value !== null)
const isAdmin = computed(() => currentUser.value?.role === "ADMIN")

function setUser(user) {
    currentUser.value = user
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
}

async function checkLogin() {
    try {
        const user = await userInterface().getCurrent()
        if (user && user.id) {
            setUser(user)
        } else {
            clearUser()
        }
    } catch {
        clearUser()
    }
}

function clearUser() {
    currentUser.value = null
    localStorage.removeItem(STORAGE_KEY)
}

async function logout() {
    try {
        await userInterface().logout()
    } catch {
        // ignore
    } finally {
        clearUser()
    }
}

export { currentUser, isLoggedIn, isAdmin, setUser, checkLogin, logout }
