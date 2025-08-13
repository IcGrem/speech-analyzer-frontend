import { ref, computed } from 'vue'
import { ErrorHandler } from '@/utils/errorHandler'

/**
 * Базовый класс для создания единообразных хранилищ
 * 
 * Рекомендации по использованию в компонентах:
 * 
 * ✅ Правильно:
 * const store = useYourStore()
 * const { loading, error, dataList } = storeToRefs(store) // State и Getters
 * const { fetchData, clearError } = store // Actions
 * 
 * ❌ Неправильно:
 * const { loading, error } = store // Потеряется реактивность!
 * const { fetchData } = storeToRefs(store) // Actions не нужны в storeToRefs
 */
export class BaseStore {
  constructor() {
    this.loading = ref(false)
    this.error = ref(null)
  }

  /**
   * Очистка ошибки
   */
  clearError() {
    this.error.value = null
  }

  /**
   * Базовый метод для выполнения асинхронных операций с обработкой ошибок
   */
  async executeAsync(operation, context = 'Операция') {
    try {
      this.loading.value = true
      this.error.value = null
      
      const result = await operation()
      return result
    } catch (err) {
      this.error.value = err.response?.data?.message || err.message
      ErrorHandler.handleApiError(err, context)
      throw err
    } finally {
      this.loading.value = false
    }
  }

  /**
   * Создание геттера для проверки наличия данных
   */
  createHasDataGetter(dataRef) {
    return computed(() => {
      if (Array.isArray(dataRef.value)) {
        return dataRef.value.length > 0
      }
      return !!dataRef.value
    })
  }

  /**
   * Создание геттера для безопасного доступа к данным
   */
  createSafeDataGetter(dataRef, defaultValue = []) {
    return computed(() => dataRef.value || defaultValue)
  }

  /**
   * Создание геттера для подсчета элементов
   */
  createCountGetter(dataRef) {
    return computed(() => {
      if (Array.isArray(dataRef.value)) {
        return dataRef.value.length
      }
      return dataRef.value ? 1 : 0
    })
  }
}

/**
 * Хелпер для создания единообразного хранилища
 * 
 * Пример использования в компоненте:
 * 
 * ```vue
 * <script setup>
 * import { useYourStore } from '@/store/yourStore'
 * import { storeToRefs } from 'pinia'
 * 
 * const store = useYourStore()
 * const { loading, error, dataList, hasData } = storeToRefs(store)
 * const { fetchData, clearError } = store
 * </script>
 * ```
 */
export function createBaseStore(storeName, initialState = {}) {
  return {
    // Базовое состояние
    loading: ref(false),
    error: ref(null),
    
    // Дополнительное состояние
    ...initialState,
    
    // Базовые методы
    clearError() {
      this.error.value = null
    },
    
    async executeAsync(operation, context = 'Операция') {
      try {
        this.loading.value = true
        this.error.value = null
        
        const result = await operation()
        return result
      } catch (err) {
        this.error.value = err.response?.data?.message || err.message
        ErrorHandler.handleApiError(err, context)
        throw err
      } finally {
        this.loading.value = false
      }
    }
  }
}

/**
 * Утилита для создания стандартных геттеров
 */
export function createStandardGetters(dataRef, options = {}) {
  const { 
    listName = 'dataList',
    hasName = 'hasData', 
    countName = 'dataCount',
    defaultValue = []
  } = options

  return {
    [listName]: computed(() => dataRef.value || defaultValue),
    [hasName]: computed(() => {
      if (Array.isArray(dataRef.value)) {
        return dataRef.value.length > 0
      }
      return !!dataRef.value
    }),
    [countName]: computed(() => {
      if (Array.isArray(dataRef.value)) {
        return dataRef.value.length
      }
      return dataRef.value ? 1 : 0
    })
  }
} 