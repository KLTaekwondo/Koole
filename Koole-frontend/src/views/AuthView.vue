<template>
    <div class="auth-page">
        <div class="auth-card">
            <!-- 品牌面板（z-index 覆盖层，左右滑动） -->
            <div class="brand-panel" :class="mode">
                <div class="brand-content">
                    <div class="brand-icon">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
                    </div>
                    <h1 class="brand-title">Koole</h1>
                    <p class="brand-slogan">学点东西，酷了！</p>
                    <p class="brand-desc">用互动的方式，理解那些曾经死心的知识点。</p>
                </div>
            </div>

            <!-- 登录表单（固定在右侧 50%） -->
            <div class="form-panel login-form">
                <div class="form-inner">
                    <h2 class="form-title">欢迎回来</h2>
                    <p class="form-subtitle">登录你的账号，继续你的学习之旅</p>
                    <form @submit.prevent="handleLogin" class="auth-form">
                        <div class="form-group">
                            <label for="login-account">账号</label>
                            <input
                                id="login-account"
                                v-model="loginForm.account"
                                type="text"
                                placeholder="用户名 / 邮箱 / 手机号"
                                required
                            />
                        </div>
                        <div class="form-group">
                            <label for="login-password">密码</label>
                            <input
                                id="login-password"
                                v-model="loginForm.password"
                                type="password"
                                placeholder="输入密码"
                                required
                            />
                        </div>
                        <button type="submit" class="submit-btn" :disabled="logging">
                            {{ logging ? '登录中…' : '登录' }}
                        </button>
                    </form>
                    <p class="switch-text">
                        还没有账号？
                        <button class="switch-btn" @click="switchTo('register')">立即注册</button>
                    </p>
                </div>
            </div>

            <!-- 注册表单（固定在左侧 50%） -->
            <div class="form-panel register-form">
                <div class="form-inner">
                    <h2 class="form-title">创建账号</h2>
                    <p class="form-subtitle">加入 Koole，开始你的学习之旅</p>
                    <form @submit.prevent="handleRegister" class="auth-form">
                        <div class="reg-method-toggle">
                            <button
                                type="button"
                                class="method-btn"
                                :class="{ active: registerMethod === 'email' }"
                                @click="registerMethod = 'email'"
                            >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                                邮箱注册
                            </button>
                            <button
                                type="button"
                                class="method-btn"
                                :class="{ active: registerMethod === 'phone' }"
                                @click="registerMethod = 'phone'"
                            >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                                手机注册
                            </button>
                        </div>

                        <transition name="field-fade" mode="out-in">
                            <div class="form-group" key="email-field" v-if="registerMethod === 'email'">
                                <label for="reg-email">邮箱</label>
                                <input
                                    id="reg-email"
                                    v-model="registerForm.email"
                                    type="email"
                                    placeholder="your@email.com"
                                />
                            </div>
                            <div class="form-group" key="phone-field" v-else>
                                <label for="reg-phone">手机号</label>
                                <input
                                    id="reg-phone"
                                    v-model="registerForm.phone"
                                    type="tel"
                                    placeholder="手机号码"
                                />
                            </div>
                        </transition>

                        <div class="form-group">
                            <label for="reg-password">密码</label>
                            <input
                                id="reg-password"
                                v-model="registerForm.password"
                                type="password"
                                placeholder="设置密码"
                                required
                            />
                        </div>
                        <button type="submit" class="submit-btn" :disabled="registering">
                            {{ registering ? '注册中…' : '注册' }}
                        </button>
                    </form>
                    <p class="switch-text">
                        已有账号？
                        <button class="switch-btn" @click="switchTo('login')">立即登录</button>
                    </p>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from "vue"
import { useRouter } from "vue-router"
import {userInterface} from "../axios/interface/UserInterface.js"
import { showToast } from "../stores/toast.js"
import { setUser } from "../stores/user.js"

const router = useRouter()

const mode = ref("login")
const registerMethod = ref("email")

const logging = ref(false)
const registering = ref(false)

const loginForm = ref({
    account: "",
    password: "",
})

const registerForm = ref({
    email: "",
    phone: "",
    password: "",
})

const switchTo = (target) => {
    mode.value = target
}

const handleLogin = async () => {
    logging.value = true
    try {
        const user = await userInterface().login({
            account: loginForm.value.account,
            password: loginForm.value.password,
        })
        setUser(user)
        await router.push("/")
        showToast("登录成功",  "success")
    } catch (e) {
        // 登录失败由全局拦截器处理
    } finally {
        logging.value = false
    }
}

const handleRegister = async () => {
    registering.value = true
    try {
        if (registerMethod.value === "email" && registerForm.value.email) {
            await userInterface().registerByEmail({
                email: registerForm.value.email,
                password: registerForm.value.password,
            })
        } else if (registerMethod.value === "phone" && registerForm.value.phone) {
            await userInterface().registerByPhone({
                phone: registerForm.value.phone,
                password: registerForm.value.password,
            })
        } else {
            toastWarning(registerMethod.value === "email" ? "请填写邮箱" : "请填写手机号")
            return
        }
        switchTo("login")
        registerForm.value = { email: "", phone: "", password: "" }
    } catch (e) {
        // 注册失败由全局拦截器处理
    } finally {
        registering.value = false
    }
}
</script>

<style scoped>
.auth-page {
    min-height: calc(100vh - var(--nav-height) - 64px);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
    background: var(--bg);
}

/* ── Card ── */
.auth-card {
    position: relative;
    width: 100%;
    max-width: 880px;
    min-height: 520px;
    border-radius: var(--radius-xl);
    overflow: hidden;
    box-shadow: var(--shadow-lg);
    background: var(--bg-card);
    animation: cardIn 0.4s var(--ease-out);
}

@keyframes cardIn {
    from {
        opacity: 0;
        transform: translateY(20px) scale(0.97);
    }
    to {
        opacity: 1;
        transform: translateY(0) scale(1);
    }
}

/* ── Brand Panel ── */
.brand-panel {
    position: absolute;
    top: 0;
    width: 50%;
    height: 100%;
    z-index: 2;
    background: var(--primary-gradient);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 48px;
    overflow: hidden;
    transition: left 0.5s cubic-bezier(0.22, 1, 0.36, 1);
}

.brand-panel.login {
    left: 0;
}

.brand-panel.register {
    left: 50%;
}

.brand-panel::before {
    content: "";
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle at 30% 50%, rgba(255,255,255,0.08) 0%, transparent 60%);
    pointer-events: none;
}

.brand-content {
    position: relative;
    z-index: 1;
    text-align: center;
    color: #fff;
}

.brand-icon {
    width: 72px;
    height: 72px;
    border-radius: 20px;
    background: rgba(255, 255, 255, 0.15);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 24px;
    backdrop-filter: blur(4px);
}

.brand-title {
    font-size: 36px;
    font-weight: 800;
    letter-spacing: -1px;
    margin-bottom: 8px;
}

.brand-slogan {
    font-size: 20px;
    font-weight: 600;
    margin-bottom: 12px;
    opacity: 0.95;
}

.brand-desc {
    font-size: 14px;
    line-height: 1.7;
    opacity: 0.75;
    max-width: 260px;
    margin: 0 auto;
}

/* ── Form Panels (each exactly 50%) ── */
.form-panel {
    position: absolute;
    top: 0;
    width: 50%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 48px;
}

.login-form {
    left: 50%;
}

.register-form {
    left: 0;
}

.form-inner {
    width: 100%;
    max-width: 340px;
}

.form-title {
    font-size: 24px;
    font-weight: 800;
    color: var(--text-dark);
    margin-bottom: 6px;
}

.form-subtitle {
    font-size: 14px;
    color: var(--text-muted);
    margin-bottom: 28px;
}

/* ── Form Fields ── */
.auth-form {
    display: flex;
    flex-direction: column;
    gap: 18px;
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.form-group label {
    font-size: 13px;
    font-weight: 600;
    color: var(--text-secondary);
}

.form-group input {
    padding: 12px 14px;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    font-size: 14px;
    color: var(--text);
    background: var(--bg);
    outline: none;
    transition: var(--transition);
}

.form-group input::placeholder {
    color: var(--text-muted);
}

.form-group input:focus {
    border-color: var(--primary);
    box-shadow: 0 0 0 3px var(--primary-light);
    background: var(--bg-card);
}

/* ── Register Method Toggle ── */
.reg-method-toggle {
    display: flex;
    gap: 8px;
}

.method-btn {
    flex: 1;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 10px 12px;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    background: var(--bg);
    color: var(--text-secondary);
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: var(--transition);
}

.method-btn:hover {
    border-color: var(--text-muted);
    color: var(--text);
}

.method-btn.active {
    background: var(--primary-light);
    border-color: var(--primary);
    color: var(--primary);
}

/* ── Field Fade Animation ── */
.field-fade-enter-active {
    animation: fieldIn 0.25s var(--ease-out) both;
}

.field-fade-leave-active {
    animation: fieldOut 0.15s ease-in both;
}

@keyframes fieldIn {
    from { opacity: 0; transform: translateY(-8px); }
    to   { opacity: 1; transform: translateY(0); }
}

@keyframes fieldOut {
    from { opacity: 1; transform: translateY(0); }
    to   { opacity: 0; transform: translateY(8px); }
}

/* ── Submit ── */
.submit-btn {
    width: 100%;
    padding: 12px;
    border: none;
    border-radius: var(--radius);
    background: var(--primary-gradient);
    color: #fff;
    font-size: 15px;
    font-weight: 700;
    cursor: pointer;
    transition: var(--transition);
    box-shadow: 0 4px 12px rgba(192, 57, 43, 0.3);
    margin-top: 4px;
}

.submit-btn:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 6px 20px rgba(192, 57, 43, 0.4);
}

.submit-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

/* ── Switch ── */
.switch-text {
    margin-top: 24px;
    text-align: center;
    font-size: 14px;
    color: var(--text-secondary);
}

.switch-btn {
    background: none;
    border: none;
    color: var(--primary);
    font-weight: 700;
    font-size: 14px;
    cursor: pointer;
    padding: 0;
    text-decoration: none;
}

.switch-btn:hover {
    text-decoration: underline;
}

/* ── Responsive ── */
@media (max-width: 720px) {
    .auth-card {
        max-width: 420px;
        min-height: auto;
        display: flex;
        flex-direction: column;
    }

    .brand-panel {
        position: relative;
        width: 100%;
        height: auto;
        min-height: 160px;
        padding: 28px 24px;
        left: auto !important;
        transition: none;
    }

    .form-panel {
        position: relative;
        width: 100%;
        height: auto;
        padding: 32px 24px;
        left: auto !important;
    }

    .brand-title {
        font-size: 28px;
    }

    .brand-icon {
        width: 56px;
        height: 56px;
        margin-bottom: 16px;
    }
}

@media (max-width: 420px) {
    .auth-page {
        padding: 12px;
    }

    .form-panel {
        padding: 24px 20px;
    }
}
</style>
