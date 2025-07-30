import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { STORAGE_KEYS } from '@/constants'

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref(null)
  const token = ref(localStorage.getItem(STORAGE_KEYS.TOKEN))
  const isAuthenticated = ref(!!token.value)

  // Getters
  const userRole = computed(() => user.value?.role || null)
  const userName = computed(() => user.value?.name || 'Пользователь')

  // Actions
  const setUser = (userData) => {
    user.value = userData
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData))
  }

  const setToken = (tokenValue) => {
    token.value = tokenValue
    isAuthenticated.value = !!tokenValue
    if (tokenValue) {
      localStorage.setItem(STORAGE_KEYS.TOKEN, tokenValue)
    } else {
      localStorage.removeItem(STORAGE_KEYS.TOKEN)
    }
  }

  const login = (userData, tokenValue) => {
    setUser(userData)
    setToken(tokenValue)
  }

  const logout = () => {
    user.value = null
    setToken(null)
    localStorage.removeItem(STORAGE_KEYS.USER)
  }

  const initializeAuth = () => {
    const storedUser = localStorage.getItem(STORAGE_KEYS.USER)
    if (storedUser) {
      user.value = JSON.parse(storedUser)
    }
  }

  return {
    // State
    user,
    token,
    isAuthenticated,
    
    // Getters
    userRole,
    userName,
    
    // Actions
    setUser,
    setToken,
    login,
    logout,
    initializeAuth
  }
}) 