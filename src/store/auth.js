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
  const organizationId = ref(null)
  const accessToken = ref(sessionStorage.getItem('accessToken') || null)

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
        
        // Сохраняем organizationId и токен, если пришли
        organizationId.value = response.data.organization_id || userData.organization_id || null
        accessToken.value = response.data.access_token || null
        
        // Сохраняем в sessionStorage
        sessionStorage.setItem('isAuthenticated', 'true')
        sessionStorage.setItem('userRole', userData.role || '')
        if (organizationId.value) sessionStorage.setItem('organizationId', String(organizationId.value))
        if (accessToken.value) sessionStorage.setItem('accessToken', String(accessToken.value))
        
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
      organizationId.value = null
      accessToken.value = null
      sessionStorage.removeItem('isAuthenticated')
      sessionStorage.removeItem('userRole')
      sessionStorage.removeItem('organizationId')
      sessionStorage.removeItem('accessToken')
      loading.value = false
    }
  }

  const checkAuthentication = async () => {
    try {
      loading.value = true
      error.value = null
      
      // Проверяем, есть ли токен перед запросом
      const token = sessionStorage.getItem('accessToken')
      if (!token) {
        isAuthenticated.value = false
        sessionStorage.removeItem('isAuthenticated')
        sessionStorage.removeItem('organizationId')
        return false
      }
      
      const response = await checkAuth()
      if (response.status === 200) {
        isAuthenticated.value = true
        const userObj = response.data.user || response.data
        setUser(userObj)
        // Сохраняем organizationId из ответа
        organizationId.value = response.data.organization_id || userObj.organization_id || organizationId.value || sessionStorage.getItem('organizationId') || null
        if (organizationId.value) sessionStorage.setItem('organizationId', String(organizationId.value))
        sessionStorage.setItem('isAuthenticated', 'true')
        return true
      }
    } catch (err) {
      isAuthenticated.value = false
      sessionStorage.removeItem('isAuthenticated')
      sessionStorage.removeItem('organizationId')
      sessionStorage.removeItem('accessToken')
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
        const orgFromSession = sessionStorage.getItem('organizationId')
        if (orgFromSession) organizationId.value = orgFromSession
        const tokenFromSession = sessionStorage.getItem('accessToken')
        if (tokenFromSession) accessToken.value = tokenFromSession
        
        // Проверяем авторизацию только если есть токен или флаг авторизации
        await checkAuthentication()
      } else {
        // Если нет флага авторизации, просто помечаем как готовое
        isAuthenticated.value = false
      }
    } catch (err) {
      console.error('Ошибка инициализации аутентификации:', err)
      // В случае ошибки сбрасываем состояние авторизации
      isAuthenticated.value = false
      sessionStorage.removeItem('isAuthenticated')
      sessionStorage.removeItem('organizationId')
      sessionStorage.removeItem('accessToken')
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
    organizationId,
    accessToken,
    
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