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
 * Форматирование даты и времени
 */
export const formatDateTime = (date, locale = 'ru-RU') => {
  if (!date) return '-'
  const d = new Date(date)
  return d.toLocaleString(locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
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

// Cookie utilities
export const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
};

export const setCookie = (name, value, days = 7) => {
  const expires = new Date();
  expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
};

export const removeCookie = (name) => {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/`;
};

/**
 * Форматирование десятичных чисел (например, оценок)
 */
export const formatDecimal = (value, digits = 2, locale = 'ru-RU') => {
  if (value === null || value === undefined || value === '') return '-'
  const num = Number(value)
  if (Number.isNaN(num)) return '-'
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits
  }).format(num)
}

/**
 * Локальный ISO без сдвига таймзоны (YYYY-MM-DDTHH:mm:ss.sssZ)
 * Используйте, чтобы избежать смещения даты при .toISOString()
 */
export const toLocalISOString = (date) => {
  if (!(date instanceof Date)) return ''
  const tzoffset = date.getTimezoneOffset() * 60000
  return new Date(date.getTime() - tzoffset).toISOString()
} 