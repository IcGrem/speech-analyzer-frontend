import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getDialogs, getEmployeeMetrics, getEmployeeAverageMetrics } from '@/api/dialogs'
import { ErrorHandler } from '@/utils/errorHandler'

export const useDialogsStore = defineStore('dialogs', () => {
  // State
  const dialogs = ref(null)
  const loading = ref(false)
  const error = ref(null)
  
  // State для пагинации
  const pagination = ref({
    currentPage: 1,
    pageSize: 10,
    total: 0
  })
  
  // State для фильтров
  const filters = ref({
    start_date: null,
    end_date: null,
    employee_ids: [],
    sort_by: 'recording_start_date',
    sort_order: 'desc'
  })
  
  // State для метрик сотрудников
  const employeeMetrics = ref(null)
  const metricsLoading = ref(false)
  const metricsError = ref(null)

  // Новое: средние метрики сотрудников (для столбчатого графика)
  const employeeAverageMetrics = ref({ labels: [], datasets: [] })
  const employeeAverageLoading = ref(false)
  const employeeAverageError = ref(null)

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

  const updateFilters = (newFilters) => {
    filters.value = { ...filters.value, ...newFilters }
    // Сбрасываем на первую страницу при изменении фильтров
    pagination.value.currentPage = 1
  }

  const updatePagination = (newPagination) => {
    pagination.value = { ...pagination.value, ...newPagination }
  }

  const fetchDialogs = async (params = {}) => {
    try {
      loading.value = true
      error.value = null
      
      // Объединяем параметры из состояния с переданными параметрами
      const requestParams = {
        page: pagination.value.currentPage,
        size: pagination.value.pageSize,
        sort_by: filters.value.sort_by,
        sort_order: filters.value.sort_order,
        start_date: filters.value.start_date,
        end_date: filters.value.end_date,
        employee_ids: filters.value.employee_ids,
        ...params
      }
      
      console.log('Store: fetchDialogs called with params:', requestParams)
      
      const response = await getDialogs(requestParams)
      
      console.log('Store: API response received:', response)
      
      if (response && response.data) {
        // Обрабатываем реальную структуру ответа API
        const apiData = response.data
        
        console.log('Store: API data:', apiData)
        
        if (apiData.data && Array.isArray(apiData.data)) {
          dialogs.value = apiData.data
          pagination.value.total = apiData.total_count || 0
          pagination.value.pageSize = apiData.size || 10
          console.log('Store: dialogs updated, length:', dialogs.value.length)
        } else if (Array.isArray(apiData)) {
          dialogs.value = apiData
          pagination.value.total = apiData.length
          console.log('Store: dialogs updated (direct array), length:', dialogs.value.length)
        } else {
          dialogs.value = []
          pagination.value.total = 0
          console.log('Store: dialogs set to empty array')
        }
      } else {
        dialogs.value = []
        pagination.value.total = 0
        console.log('Store: no response data, dialogs set to empty')
      }
    } catch (err) {
      error.value = err.response?.data?.message || err.message
      console.error('Store: Error in fetchDialogs:', err)
      ErrorHandler.handleApiError(err, 'Загрузка диалогов')
      // При ошибке устанавливаем пустой массив
      dialogs.value = []
      pagination.value.total = 0
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
        const payload = response.data
        // Поддерживаем оба формата ответов: прямой объект графика или вложенный в data
        if (payload && payload.labels && payload.datasets) {
          employeeMetrics.value = payload
        } else if (payload && payload.data && payload.data.labels && payload.data.datasets) {
          employeeMetrics.value = payload.data
        } else {
          employeeMetrics.value = { labels: [], datasets: [] }
        }
      } else {
        employeeMetrics.value = { labels: [], datasets: [] }
      }
    } catch (err) {
      metricsError.value = err.response?.data?.message || err.message
      ErrorHandler.handleApiError(err, 'Загрузка метрик сотрудников')
      employeeMetrics.value = { labels: [], datasets: [] }
      throw err
    } finally {
      metricsLoading.value = false
    }
  }

  // Новое: загрузка средних метрик сотрудников
  const fetchEmployeeAverageMetrics = async (params) => {
    try {
      employeeAverageLoading.value = true
      employeeAverageError.value = null

      const response = await getEmployeeAverageMetrics(params)
      if (response && response.data) {
        // Ожидаем ответ в формате Chart.js: { labels, datasets }
        employeeAverageMetrics.value = response.data
      } else {
        employeeAverageMetrics.value = { labels: [], datasets: [] }
      }
    } catch (err) {
      employeeAverageError.value = err.response?.data?.message || err.message
      ErrorHandler.handleApiError(err, 'Загрузка средних метрик сотрудников', { notify: false })
      employeeAverageMetrics.value = { labels: [], datasets: [] }
      throw err
    } finally {
      employeeAverageLoading.value = false
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
    
    // State для пагинации
    pagination,
    
    // State для фильтров
    filters,
    
    // State для метрик сотрудников
    employeeMetrics,
    metricsLoading,
    metricsError,
    
    // Новое: средние метрики сотрудников
    employeeAverageMetrics,
    employeeAverageLoading,
    employeeAverageError,
    
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
    updateFilters,
    updatePagination,
    fetchDialogs,
    refreshDialogs,
    fetchEmployeeMetrics,
    fetchEmployeeAverageMetrics,
    initializeWithSampleData,
    initializeWithSampleEmployeeMetrics
  }
})
