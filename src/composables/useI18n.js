import { useI18n } from 'vue-i18n'

export function useLocalization() {
  const { t, locale } = useI18n()

  const setLanguage = (lang) => {
    locale.value = lang
    localStorage.setItem('language', lang)
  }

  const getCurrentLanguage = () => {
    return locale.value
  }

  const initLanguage = () => {
    const savedLang = localStorage.getItem('language')
    if (savedLang) {
      locale.value = savedLang
    }
  }

  return {
    t,
    locale,
    setLanguage,
    getCurrentLanguage,
    initLanguage
  }
} 