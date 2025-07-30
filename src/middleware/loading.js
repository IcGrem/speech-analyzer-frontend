/**
 * Middleware для управления состоянием загрузки
 * @param {Object} to - Целевой маршрут
 * @param {Object} from - Исходный маршрут
 * @param {Function} next - Функция для продолжения навигации
 */
export function loadingMiddleware(to, from, next) {
  // Показываем индикатор загрузки только если это не первая загрузка
  if (from.name) {
    const loadingElement = document.getElementById('loading')
    if (loadingElement) {
      loadingElement.style.display = 'flex'
      loadingElement.style.opacity = '0'
      
      // Плавное появление
      requestAnimationFrame(() => {
        loadingElement.style.transition = 'opacity 0.2s ease-in-out'
        loadingElement.style.opacity = '1'
      })
    }
    
    // Минимальное время показа индикатора для плавности
    setTimeout(() => {
      if (loadingElement) {
        loadingElement.style.opacity = '0'
        setTimeout(() => {
          loadingElement.style.display = 'none'
          loadingElement.style.transition = ''
        }, 200)
      }
      
      // Продолжаем навигацию
      next()
    }, 150) // Минимальное время показа
  } else {
    // Если это первая загрузка, просто продолжаем без индикатора
    next()
  }
} 