/**
 * Middleware для проверки авторизации
 * @param {Object} to - Целевой маршрут
 * @param {Object} from - Исходный маршрут
 * @param {Function} next - Функция для продолжения навигации
 */
export function authMiddleware(to, from, next) {
  // Получаем статус авторизации из sessionStorage
  // HttpOnly куки недоступны для JavaScript
  const isAuthenticated = sessionStorage.getItem('isAuthenticated') === 'true'
  
  // Проверяем, требует ли страница авторизации
  if (to.meta.requiresAuth) {
    // Если не авторизован - перенаправляем на логин
    if (!isAuthenticated) {
      next('/login')
      return
    }
  }
  
  // Если страница только для гостей (не авторизованных)
  if (to.meta.guestOnly && isAuthenticated) {
    next('/')
    return
  }
  
  // Все проверки пройдены, продолжаем навигацию
  next()
} 