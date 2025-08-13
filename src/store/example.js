import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { ErrorHandler } from '@/utils/errorHandler'

// Пример API функции (замените на реальную)
const fetchExampleData = async () => {
  // Имитация API вызова
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        { id: 1, name: 'Пример 1' },
        { id: 2, name: 'Пример 2' }
      ])
    }, 1000)
  })
}

export const useExampleStore = defineStore('example', () => {
  // State
  const data = ref(null)
  const loading = ref(false)
  const error = ref(null)

  // Getters
  const dataList = computed(() => data.value || [])
  const hasData = computed(() => data.value && data.value.length > 0)
  const dataCount = computed(() => data.value?.length || 0)

  // Actions
  const clearError = () => {
    error.value = null
  }

  const fetchData = async () => {
    try {
      loading.value = true
      error.value = null
      data.value = await fetchExampleData()
    } catch (err) {
      error.value = err.response?.data?.message || err.message
      ErrorHandler.handleApiError(err, 'Загрузка данных')
      throw err
    } finally {
      loading.value = false
    }
  }

  const refreshData = async () => {
    return await fetchData()
  }

  const addItem = async (item) => {
    try {
      loading.value = true
      error.value = null
      
      // Здесь будет вызов API для добавления
      // const response = await addItemApi(item)
      
      // Обновляем локальные данные
      if (data.value) {
        data.value.push(item)
      }
    } catch (err) {
      error.value = err.response?.data?.message || err.message
      ErrorHandler.handleApiError(err, 'Добавление элемента')
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    // State
    data,
    loading,
    error,
    
    // Getters
    dataList,
    hasData,
    dataCount,
    
    // Actions
    clearError,
    fetchData,
    refreshData,
    addItem
  }
}) 