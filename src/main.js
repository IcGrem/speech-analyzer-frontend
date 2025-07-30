import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ru from 'element-plus/dist/locale/ru.mjs'
import './assets/styles/tailwind/index.css'
import App from './App.vue'
import ElementPlus from 'element-plus'
import '@/assets/styles/element-plus-custom.scss'
import axios from './api/api'
import router from './router'
import i18n from './i18n'
const pinia = createPinia()
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import VueWordCloud from 'vuewordcloud';


const app = createApp(App)
app.component('VueWordCloud', VueWordCloud)
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}
app.use(ElementPlus, { locale: ru })
app.use(router)
app.use(pinia)
app.use(i18n)
app.config.globalProperties.$axios = axios

// Инициализация языка
const savedLang = localStorage.getItem('language')
if (savedLang) {
  i18n.global.locale.value = savedLang
} else {
  // Устанавливаем русский как язык по умолчанию
  localStorage.setItem('language', 'ru')
}

app.mount('#app')
