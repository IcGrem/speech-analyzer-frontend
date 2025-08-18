// Константы приложения

// API endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh'
  },
  USERS: {
    LIST: '/users',
    CREATE: '/users',
    UPDATE: '/users/:id',
    DELETE: '/users/:id'
  },
  ORDERS: {
    LIST: '/orders',
    CREATE: '/orders',
    UPDATE: '/orders/:id',
    DELETE: '/orders/:id'
  }
}

// Статусы заказов
export const ORDER_STATUSES = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PREPARING: 'preparing',
  READY: 'ready',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled'
}

// Роли пользователей
export const USER_ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  WAITER: 'waiter',
  CHEF: 'chef'
}

// Локальное хранилище ключи
export const STORAGE_KEYS = {
  TOKEN: 'auth_token',
  USER: 'user_data',
  SIDEBAR_COLLAPSED: 'sidebar_collapsed',
  THEME: 'app_theme'
}

// Настройки приложения
export const APP_CONFIG = {
  NAME: 'Restaurant Management System',
  VERSION: '1.0.0',
  DEFAULT_LOCALE: 'ru-RU',
  DATE_FORMAT: 'DD.MM.YYYY',
  CURRENCY: 'RUB'
}

// Порядок отображения 6 нижних плашек на главной
export const METRIC_TILES_ORDER = [
  'greeting_farewell_score',
  'completeness_score',
  'tone_score',
  'openness_helpfulness_score',
  'listening_score',
  'empathy_score'
] 