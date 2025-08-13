import axios from 'axios'
import { ErrorHandler } from '@/utils/errorHandler.js'

const BaseURL = import.meta.env.VITE_API_BASE_URL || '/';

const instance = axios.create({
  baseURL: BaseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  // Включаем передачу кук в запросах
  withCredentials: true
})

// Интерцептор запроса
instance.interceptors.request.use(
  config => {
    // HttpOnly куки автоматически отправляются браузером
    // Не нужно добавлять токен вручную
    return config
  },
  error => {
    ErrorHandler.handleGeneralError(error, 'Ошибка запроса')
    return Promise.reject(error)
  }
)

// Интерцептор ответа
instance.interceptors.response.use(
  response => response,
  error => {
    // Глобальная обработка ошибок API
    ErrorHandler.handleApiError(error, 'API Request')
    return Promise.reject(error)
  }
)

export default instance