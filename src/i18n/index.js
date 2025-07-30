import { createI18n } from 'vue-i18n'
import ru from './locales/ru.js'

const messages = {
  ru
}

const i18n = createI18n({
  legacy: false, // Используем Composition API
  locale: 'ru', // Язык по умолчанию
  fallbackLocale: 'ru', // Язык для fallback
  messages
})

export default i18n 