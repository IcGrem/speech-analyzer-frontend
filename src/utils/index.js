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