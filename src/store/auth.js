import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { login as loginApi, checkAuth, logout as logoutApi } from '@/api/auth'
import { ErrorHandler } from '@/utils/errorHandler'

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref(null)
  const isAuthenticated = ref(sessionStorage.getItem('isAuthenticated') === 'true')
  const loading = ref(false)
  const error = ref(null)

  // Getters
  const userRole = computed(() => user.value?.role || null)
  const userName = computed(() => {
    if (!user.value) return 'Пользователь'
    
    // Формируем полное имя из first_name и last_name
    const firstName = user.value.first_name || ''
    const lastName = user.value.last_name || ''
    
    if (firstName && lastName) {
      return `${firstName} ${lastName}`
    } else if (firstName) {
      return firstName
    } else if (lastName) {
      return lastName
    } else if (user.value.username) {
      return user.value.username
    }
    
    return 'Пользователь'
  })
  const isAdmin = computed(() => userRole.value === 'admin')
  const isUser = computed(() => userRole.value === 'user')

  // Actions
  const setUser = (userData) => {
    user.value = userData
  }

  const clearError = () => {
    error.value = null
  }

  const login = async (params) => {
    try {
      loading.value = true
      error.value = null
      
      const response = await loginApi({
        username: params.username,
        password: params.password
      })
      
      if (response.status === 200) {
        // Устанавливаем пользователя из ответа
        const userData = response.data.user || response.data
        
        setUser(userData)
        isAuthenticated.value = true
        
        // Сохраняем в sessionStorage
        sessionStorage.setItem('isAuthenticated', 'true')
        sessionStorage.setItem('userRole', userData.role || '')
        
        return { success: true, data: response.data }
      }
    } catch (err) {
      isAuthenticated.value = false
      error.value = err.response?.data?.detail || 'Ошибка авторизации'
      ErrorHandler.handleApiError(err, 'Авторизация')
      throw err
    } finally {
      loading.value = false
    }
  }

  const logout = async () => {
    try {
      loading.value = true
      error.value = null
      
      await logoutApi()
    } catch (err) {
      // Ошибка при логауте не критична
      // silently ignore or report to monitoring
    } finally {
      // Очищаем локальное состояние в любом случае
      user.value = null
      isAuthenticated.value = false
      sessionStorage.removeItem('isAuthenticated')
      sessionStorage.removeItem('userRole')
      loading.value = false
    }
  }

  const checkAuthentication = async () => {
    try {
      loading.value = true
      error.value = null
      
      const response = await checkAuth()
      if (response.status === 200) {
        isAuthenticated.value = true
        setUser(response.data)
        sessionStorage.setItem('isAuthenticated', 'true')
        return true
      }
    } catch (err) {
      isAuthenticated.value = false
      sessionStorage.removeItem('isAuthenticated')
      return false
    } finally {
      loading.value = false
    }
  }

  const ready = ref(false)

  const initializeAuth = async () => {
    try {
      // Если уже был флаг в сессии, пометим как аутентифицированного до проверки
      if (sessionStorage.getItem('isAuthenticated') === 'true') {
        isAuthenticated.value = true
      }
      await checkAuthentication()
    } catch (err) {
      console.error('Ошибка инициализации аутентификации:', err)
    } finally {
      ready.value = true
    }
  }

  return {
    // State
    user,
    isAuthenticated,
    loading,
    error,
    ready,
    
    // Getters
    userRole,
    userName,
    isAdmin,
    isUser,
    
    // Actions
    setUser,
    clearError,
    login,
    logout,
    checkAuthentication,
    initializeAuth
  }
}) 