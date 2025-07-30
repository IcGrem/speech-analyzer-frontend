// Общие утилиты для проекта

/**
 * Форматирование даты
 */
export const formatDate = (date, format = 'DD.MM.YYYY') => {
  if (!date) return ''
  const d = new Date(date)
  return d.toLocaleDateString('ru-RU')
}

/**
 * Форматирование валюты
 */
export const formatCurrency = (amount, currency = 'RUB') => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: currency
  }).format(amount)
}

/**
 * Валидация email
 */
export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}

/**
 * Debounce функция
 */
export const debounce = (func, wait) => {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

/**
 * Генерация уникального ID
 */
export const generateId = () => {
  return Math.random().toString(36).substr(2, 9)
} 