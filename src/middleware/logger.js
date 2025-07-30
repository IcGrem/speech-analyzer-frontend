/**
 * Middleware для логирования навигации
 * @param {Object} to - Целевой маршрут
 * @param {Object} from - Исходный маршрут
 * @param {Function} next - Функция для продолжения навигации
 */
export function loggerMiddleware(to, from, next) {
  const timestamp = new Date().toLocaleTimeString()
  
  console.log(`📊 [${timestamp}] Навигация: ${from.path} → ${to.path}`)
  
  // Можно отправить аналитику
  if (window.gtag) {
    window.gtag('config', 'GA_MEASUREMENT_ID', {
      page_path: to.path
    })
  }
  
  // Всегда продолжаем навигацию
  next()
} 