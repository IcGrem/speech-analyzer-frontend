import { ref, watch } from 'vue'

/**
 * Composable для работы с localStorage
 */
export function useLocalStorage(key, defaultValue = null, options = {}) {
  const { parseAsJson = true } = options
  
  const storedValue = localStorage.getItem(key)
  let value
  
  if (storedValue) {
    if (parseAsJson) {
      try {
        value = JSON.parse(storedValue)
      } catch (error) {
        console.warn(`Failed to parse localStorage value for key "${key}":`, error)
        value = defaultValue
      }
    } else {
      value = storedValue
    }
  } else {
    value = defaultValue
  }
  
  const reactiveValue = ref(value)

  // Синхронизация с localStorage
  watch(reactiveValue, (newValue) => {
    if (newValue === null || newValue === undefined) {
      localStorage.removeItem(key)
    } else {
      const valueToStore = parseAsJson ? JSON.stringify(newValue) : newValue
      localStorage.setItem(key, valueToStore)
    }
  }, { deep: true })

  return reactiveValue
} 