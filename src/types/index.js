/**
 * @typedef {Object} User
 * @property {number} id - ID пользователя
 * @property {string} name - Имя пользователя
 * @property {string} email - Email пользователя
 * @property {string} role - Роль пользователя
 * @property {string} [avatar] - Аватар пользователя
 */

/**
 * @typedef {Object} Order
 * @property {number} id - ID заказа
 * @property {string} status - Статус заказа
 * @property {number} total - Общая сумма
 * @property {string} createdAt - Дата создания
 * @property {User} customer - Клиент
 * @property {Array<OrderItem>} items - Позиции заказа
 */

/**
 * @typedef {Object} OrderItem
 * @property {number} id - ID позиции
 * @property {string} name - Название блюда
 * @property {number} quantity - Количество
 * @property {number} price - Цена за единицу
 */

/**
 * @typedef {Object} MenuItem
 * @property {number} id - ID блюда
 * @property {string} name - Название блюда
 * @property {string} description - Описание
 * @property {number} price - Цена
 * @property {string} category - Категория
 * @property {string} [image] - Изображение
 */

/**
 * @typedef {Object} ApiResponse
 * @property {boolean} success - Успешность запроса
 * @property {any} data - Данные ответа
 * @property {string} [message] - Сообщение
 * @property {string} [error] - Ошибка
 */ 