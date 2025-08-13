import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getDialogs, getEmployeeMetrics } from '@/api/dialogs'
import { ErrorHandler } from '@/utils/errorHandler'

export const useDialogsStore = defineStore('dialogs', () => {
  // State
  const dialogs = ref(null)
  const loading = ref(false)
  const error = ref(null)
  
  // State для метрик сотрудников
  const employeeMetrics = ref(null)
  const metricsLoading = ref(false)
  const metricsError = ref(null)

  // Getters
  const dialogsList = computed(() => dialogs.value || [])
  const hasDialogs = computed(() => dialogs.value && dialogs.value.length > 0)
  const dialogsCount = computed(() => dialogs.value?.length || 0)
  
  // Getters для метрик сотрудников
  const metricsList = computed(() => employeeMetrics.value || [])
  const hasMetrics = computed(() => employeeMetrics.value && employeeMetrics.value.length > 0)
  const metricsCount = computed(() => employeeMetrics.value?.length || 0)

  // Actions
  const clearError = () => {
    error.value = null
  }

  const fetchDialogs = async () => {
    try {
      loading.value = true
      error.value = null
      const response = await getDialogs()
      
      // Убеждаемся, что dialogs.value всегда массив
      if (response && response.data) {
        dialogs.value = Array.isArray(response.data) ? response.data : [response.data]
      } else {
        dialogs.value = []
      }
    } catch (err) {
      error.value = err.response?.data?.message || err.message
      ErrorHandler.handleApiError(err, 'Загрузка диалогов')
      // При ошибке устанавливаем пустой массив
      dialogs.value = []
      throw err
    } finally {
      loading.value = false
    }
  }

  const refreshDialogs = async () => {
    return await fetchDialogs()
  }
  
  // Функция для загрузки метрик сотрудников
  const fetchEmployeeMetrics = async (params) => {
    try {
      metricsLoading.value = true
      metricsError.value = null
      
      const response = await getEmployeeMetrics(params)
      
      if (response && response.data) {
        employeeMetrics.value = response.data
      } else {
        employeeMetrics.value = []
      }
    } catch (err) {
      metricsError.value = err.response?.data?.message || err.message
      ErrorHandler.handleApiError(err, 'Загрузка метрик сотрудников')
      employeeMetrics.value = []
      throw err
    } finally {
      metricsLoading.value = false
    }
  }

  // Initialize with sample data
  const initializeWithSampleData = () => {
    dialogs.value = [
      {
        "id": 1,
        "employee_name": "Иванов Иван",
        "date": "2024-01-15",
        "dialog_id": "D001",
        "metrics_score": 8.5,
        "top_words": ["продажа", "скидка", "качество", "гарантия", "доставка"],
        "dictionary_match": true
      },
      {
        "id": 2,
        "employee_name": "Иванов Иван",
        "date": "2024-01-16",
        "dialog_id": "D002",
        "metrics_score": 7.8,
        "top_words": ["консультация", "ассортимент", "цена", "акция", "сервис"],
        "dictionary_match": false
      },
      {
        "id": 3,
        "employee_name": "Иванов Иван",
        "date": "2024-01-17",
        "dialog_id": "D003",
        "metrics_score": 9.2,
        "top_words": ["рекомендация", "отзыв", "опыт", "решение", "поддержка"],
        "dictionary_match": true
      },
      {
        "id": 4,
        "employee_name": "Петрова Анна",
        "date": "2024-01-15",
        "dialog_id": "D004",
        "metrics_score": 6.5,
        "top_words": ["вопрос", "информация", "помощь", "уточнение", "контакт"],
        "dictionary_match": false
      },
      {
        "id": 5,
        "employee_name": "Петрова Анна",
        "date": "2024-01-16",
        "dialog_id": "D005",
        "metrics_score": 8.9,
        "top_words": ["преимущество", "сравнение", "выбор", "индивидуальный", "персональный"],
        "dictionary_match": true
      },
      {
        "id": 6,
        "employee_name": "Петрова Анна",
        "date": "2024-01-17",
        "dialog_id": "D006",
        "metrics_score": 7.3,
        "top_words": ["обучение", "поддержка", "консультация", "помощь", "сервис"],
        "dictionary_match": false
      },
      {
        "id": 7,
        "employee_name": "Сидоров Алексей",
        "date": "2024-01-15",
        "dialog_id": "D007",
        "metrics_score": 9.1,
        "top_words": ["рекомендация", "отзыв", "опыт", "решение", "поддержка"],
        "dictionary_match": true
      },
      {
        "id": 8,
        "employee_name": "Сидоров Алексей",
        "date": "2024-01-16",
        "dialog_id": "D008",
        "metrics_score": 8.7,
        "top_words": ["качество", "гарантия", "надежность", "доверие", "репутация"],
        "dictionary_match": true
      },
      {
        "id": 9,
        "employee_name": "Сидоров Алексей",
        "date": "2024-01-17",
        "dialog_id": "D009",
        "metrics_score": 9.5,
        "top_words": ["инновация", "технология", "современность", "эффективность", "результат"],
        "dictionary_match": true
      },
      {
        "id": 10,
        "employee_name": "Козлова Мария",
        "date": "2024-01-15",
        "dialog_id": "D010",
        "metrics_score": 6.8,
        "top_words": ["вопрос", "информация", "помощь", "уточнение", "контакт"],
        "dictionary_match": false
      },
      {
        "id": 11,
        "employee_name": "Козлова Мария",
        "date": "2024-01-16",
        "dialog_id": "D011",
        "metrics_score": 7.2,
        "top_words": ["обучение", "поддержка", "консультация", "помощь", "сервис"],
        "dictionary_match": false
      },
      {
        "id": 12,
        "employee_name": "Козлова Мария",
        "date": "2024-01-17",
        "dialog_id": "D012",
        "metrics_score": 8.1,
        "top_words": ["качество", "гарантия", "надежность", "доверие", "репутация"],
        "dictionary_match": true
      },
      {
        "id": 13,
        "employee_name": "Морозов Дмитрий",
        "date": "2024-01-15",
        "dialog_id": "D013",
        "metrics_score": 8.9,
        "top_words": ["преимущество", "сравнение", "выбор", "индивидуальный", "персональный"],
        "dictionary_match": true
      },
      {
        "id": 14,
        "employee_name": "Морозов Дмитрий",
        "date": "2024-01-16",
        "dialog_id": "D014",
        "metrics_score": 9.3,
        "top_words": ["инновация", "технология", "современность", "эффективность", "результат"],
        "dictionary_match": true
      },
      {
        "id": 15,
        "employee_name": "Морозов Дмитрий",
        "date": "2024-01-17",
        "dialog_id": "D015",
        "metrics_score": 8.6,
        "top_words": ["рекомендация", "отзыв", "опыт", "решение", "поддержка"],
        "dictionary_match": true
      }
    ]
  }

  // Initialize with sample employee metrics data
  const initializeWithSampleEmployeeMetrics = () => {
    // Генерируем тестовые данные метрик в формате Chart.js
    const labels = []
    const startDate = new Date('2025-07-01')
    for (let i = 0; i < 24; i++) {
      const date = new Date(startDate)
      date.setDate(startDate.getDate() + i)
      labels.push(date.toLocaleDateString('ru-RU'))
    }

    const datasets = []
    const employeeNames = ['Иванов Иван', 'Петрова Анна', 'Сидоров Алексей', 'Козлова Мария', 'Морозов Дмитрий']
    const colors = ['#409EFF', '#67C23A', '#E6A23C', '#F56C6C', '#909399']

    employeeNames.forEach((name, index) => {
      const data = []
      for (let i = 0; i < 24; i++) {
        // Генерируем случайные значения от 3 до 5
        const score = Math.random() * 2 + 3
        data.push(parseFloat(score.toFixed(1)))
      }

      datasets.push({
        label: name,
        data: data,
        borderColor: colors[index],
        backgroundColor: colors[index] + '20',
        tension: 0.1,
        fill: false
      })
    })

    employeeMetrics.value = {
      labels: labels,
      datasets: datasets
    }
  }

  return { 
    // State
    dialogs, 
    loading,
    error,
    
    // State для метрик сотрудников
    employeeMetrics,
    metricsLoading,
    metricsError,
    
    // Getters
    dialogsList,
    hasDialogs,
    dialogsCount,
    
    // Getters для метрик сотрудников
    metricsList,
    hasMetrics,
    metricsCount,
    
    // Actions
    clearError,
    fetchDialogs,
    refreshDialogs,
    fetchEmployeeMetrics,
    initializeWithSampleData,
    initializeWithSampleEmployeeMetrics
  }
})
