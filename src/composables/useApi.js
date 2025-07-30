import { ref } from 'vue'
import apiClient from '@/api/api.js'

/**
 * Composable для работы с API
 */
export function useApi() {
  const loading = ref(false)
  const error = ref(null)
  const data = ref(null)

  const execute = async (apiCall) => {
    loading.value = true
    error.value = null
    
    try {
      const result = await apiCall()
      data.value = result.data
      return result
    } catch (err) {
      error.value = err.response?.data?.message || err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const reset = () => {
    loading.value = false
    error.value = null
    data.value = null
  }

  return {
    loading,
    error,
    data,
    execute,
    reset
  }
} 