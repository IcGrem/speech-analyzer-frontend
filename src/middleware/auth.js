/**
 * Middleware для проверки авторизации
 * @param {Object} to - Целевой маршрут
 * @param {Object} from - Исходный маршрут
 * @param {Function} next - Функция для продолжения навигации
 */
import { STORAGE_KEYS } from '@/constants'

export function authMiddleware(to, from, next) {
  // Получаем токен из localStorage
  const token = localStorage.getItem(STORAGE_KEYS.TOKEN)
  
  // Проверяем, требует ли страница авторизации
  if (to.meta.requiresAuth) {
    // Если токена нет - перенаправляем на логин
    if (!token) {
      console.log('🔒 Доступ запрещен! Перенаправляем на логин...')
      next('/login')
      return
    }
    
    console.log('✅ Пользователь авторизован, пропускаем...')
  }
  
  // Если страница только для гостей (не авторизованных)
  if (to.meta.guestOnly && token) {
    console.log('🚫 Авторизованные пользователи не могут сюда!')
    next('/')
    return
  }
  
  // Все проверки пройдены, продолжаем навигацию
  next()
} 