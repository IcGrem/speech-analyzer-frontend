// Центральный экспорт всех API модулей
export { default as authAPI } from './auth.js'
export { default as apiClient } from './api.js'

// Экспорт API методов для диалогов
export { getDialogsByDictionaries } from './dialogs.js'

// Можно добавить дополнительные API модули
// export { default as usersAPI } from './users.js'
// export { default as ordersAPI } from './orders.js'
// export { default as menuAPI } from './menu.js' 