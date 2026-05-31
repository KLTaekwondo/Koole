import { ref, watch } from "vue"

const THEME_KEY = "koole_theme"

// 从 localStorage 读取，或默认跟随系统
const getInitialTheme = () => {
  const saved = localStorage.getItem(THEME_KEY)
  if (saved) return saved
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
}

export const theme = ref(getInitialTheme())

// 切换主题
export const toggleTheme = () => {
  theme.value = theme.value === "light" ? "dark" : "light"
}

// 监听变化，保存到 localStorage 并应用到 DOM
watch(theme, (val) => {
  localStorage.setItem(THEME_KEY, val)
  document.documentElement.setAttribute("data-theme", val)
}, { immediate: true })
