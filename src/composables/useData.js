import { ref, computed } from 'vue'
import { useApi } from './useApi.js'
import { ErrorHandler } from '@/utils/errorHandler.js'

/**
 * Composable для работы с данными
 */
export function useData(apiCall, options = {}) {
  const {
    autoLoad = true,
    refreshInterval = null,
    onSuccess = null,
    onError = null
  } = options

  const data = ref(null)
  const loading = ref(false)
  const error = ref(null)
  const lastUpdated = ref(null)
  
  const { execute } = useApi()
  
  let refreshTimer = null

  // Вычисляемые свойства
  const isEmpty = computed(() => {
    if (!data.value) return true
    if (Array.isArray(data.value)) return data.value.length === 0
    return Object.keys(data.value).length === 0
  })

  const hasData = computed(() => !isEmpty.value)

  // Методы
  const load = async (params = {}) => {
    loading.value = true
    error.value = null
    
    try {
      const result = await execute(() => apiCall(params))
      data.value = result.data
      lastUpdated.value = new Date()
      
      if (onSuccess) {
        onSuccess(result.data)
      }
      
      return result.data
    } catch (err) {
      error.value = err.message || 'Ошибка загрузки данных'
      ErrorHandler.handleApiError(err, 'useData')
      
      if (onError) {
        onError(err)
      }
      
      throw err
    } finally {
      loading.value = false
    }
  }

  const refresh = () => {
    return load()
  }

  const retry = () => {
    return load()
  }

  const clear = () => {
    data.value = null
    error.value = null
    lastUpdated.value = null
  }

  // Автоматическая загрузка
  if (autoLoad) {
    load()
  }

  // Автоматическое обновление
  if (refreshInterval) {
    refreshTimer = setInterval(() => {
      if (!loading.value) {
        load()
      }
    }, refreshInterval)
  }

  // Очистка при размонтировании
  const cleanup = () => {
    if (refreshTimer) {
      clearInterval(refreshTimer)
    }
  }

  return {
    // Состояние
    data,
    loading,
    error,
    lastUpdated,
    
    // Вычисляемые свойства
    isEmpty,
    hasData,
    
    // Методы
    load,
    refresh,
    retry,
    clear,
    cleanup
  }
} 