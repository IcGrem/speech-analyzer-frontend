import { ElNotification } from 'element-plus'

/**
 * Глобальный обработчик ошибок
 */
export class ErrorHandler {
  /**
   * Обработка ошибок API
   */
  static handleApiError(error, context = '') {
    console.error(`API Error in ${context}:`, error)
    
    let message = 'Произошла ошибка при выполнении запроса'
    
    if (error.response) {
      const status = error.response.status
      const data = error.response.data
      
      switch (status) {
        case 400:
          message = data?.message || 'Неверный запрос'
          break
        case 401:
          message = 'Необходима авторизация'
          // Можно добавить редирект на логин
          break
        case 403:
          message = 'Доступ запрещен'
          break
        case 404:
          message = 'Ресурс не найден'
          break
        case 500:
          message = 'Ошибка сервера'
          break
        default:
          message = data?.message || `Ошибка ${status}`
      }
    } else if (error.request) {
      message = 'Нет ответа от сервера'
    } else {
      message = error.message || 'Неизвестная ошибка'
    }
    
    ElNotification({
      title: 'Ошибка',
      message,
      type: 'error',
      duration: 5000
    })
  }
  
  /**
   * Обработка ошибок валидации
   */
  static handleValidationError(errors) {
    const messages = Object.values(errors).flat()
    
    ElNotification({
      title: 'Ошибки валидации',
      message: messages.join(', '),
      type: 'warning',
      duration: 4000
    })
  }
  
  /**
   * Обработка общих ошибок
   */
  static handleGeneralError(error, title = 'Ошибка') {
    console.error('General Error:', error)
    
    ElNotification({
      title,
      message: error.message || 'Произошла неизвестная ошибка',
      type: 'error',
      duration: 5000
    })
  }
} 