import { ref, watch } from 'vue'
import { useLocalStorage } from './useLocalStorage.js'

/**
 * Composable для управления темой
 */
export function useTheme() {
  const theme = useLocalStorage('theme', 'light', { parseAsJson: false })
  const isDark = ref(theme.value === 'dark')

  // Применяем тему к документу
  const applyTheme = (newTheme) => {
    const html = document.documentElement
    
    if (newTheme === 'dark') {
      html.classList.add('dark')
      html.setAttribute('data-theme', 'dark')
    } else {
      html.classList.remove('dark')
      html.setAttribute('data-theme', 'light')
    }
  }

  // Переключаем тему
  const toggleTheme = () => {
    const newTheme = isDark.value ? 'light' : 'dark'
    theme.value = newTheme
    isDark.value = !isDark.value
    applyTheme(newTheme)
  }

  // Устанавливаем тему
  const setTheme = (newTheme) => {
    theme.value = newTheme
    isDark.value = newTheme === 'dark'
    applyTheme(newTheme)
  }

  // Применяем тему при инициализации
  applyTheme(theme.value)

  // Следим за изменениями темы
  watch(theme, (newTheme) => {
    applyTheme(newTheme)
  })

  return {
    theme,
    isDark,
    toggleTheme,
    setTheme
  }
} 