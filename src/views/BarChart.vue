<template>
  <PageWrapper title="Динамика метрики по сотрудникам">
    <div class="">
      <el-row :gutter="10" class="py-4">
        <el-col :span="6">
          <el-select v-model="metric" placeholder="Метрики" @change="onMetricChange">
            <el-option
            v-for="item in metrics"
            :key="item.value"
            :label="item.label"
            :value="item.value"
            />
          </el-select>
        </el-col>
        <el-col :span="6">
          <el-select
            v-model="employee"
            placeholder="Выберите сотрудника"
            @change="changeEmployee"
            :loading="employeesLoading"
            :disabled="employeesError"
          >
            <el-option
              v-for="item in employees"
              :key="item.id"
              :label="getEmployeeDisplayName(item)"
              :value="item.id"
            />
          </el-select>
        </el-col>
        <el-col :span="8">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            :disabled-date="disableExceptJuly2025"
            range-separator="-"
            start-placeholder="Дата начала"
            end-placeholder="Дата окончания"
            @change="onDateChange"
            style="width: 100%;"
          />
        </el-col>
        <el-col :span="4">
          <el-button 
            type="primary" 
            :loading="loading" 
            @click="refreshData"
            icon="Refresh"
            class="w-full"
          >
            Обновить
          </el-button>
        </el-col>
      </el-row>
    </div>
    <el-row class="pb-8" :gutter="20">
      <el-col :span="24">
        <div v-if="loading" class="w-full h-[600px] flex justify-center items-center">
          <LoadingIndicator />
        </div>
        <div v-else-if="metricsError || employeesError" class="w-full h-[600px] flex justify-center items-center">
          <el-alert
            :title="metricsError || employeesError"
            type="error"
            :closable="false"
            show-icon
          >
            <template #default>
              <p class="mt-2">Попробуйте обновить данные или проверьте подключение к серверу.</p>
            </template>
          </el-alert>
        </div>
        <!-- Chart -->
        <div v-if="!loading && !metricsLoading && lineData.labels?.length && lineData.datasets?.length" class="w-full h-[600px] flex justify-center items-center">
          <Line 
            style="width: 100%; height: 100%;" 
            :data="lineData" 
            :options="chartOptions"
          />
        </div>
        <div v-else-if="metricsLoading" class="w-full h-[600px] flex justify-center items-center">
          <LoadingIndicator />
        </div>
        <div v-else class="w-full h-[600px] flex justify-center items-center">
          <el-empty description="Нет данных для отображения графика" />
        </div>
      </el-col>
    </el-row>
  </PageWrapper>
</template>

<script setup>
import { onMounted, computed, ref } from 'vue'
import { Line } from 'vue-chartjs'
import { Chart, registerables } from 'chart.js'
import annotationPlugin from 'chartjs-plugin-annotation'
import { useDialogsStore } from '@/store/dialogs'
import { storeToRefs } from 'pinia'
import LoadingIndicator from '@/components/LoadingIndicator.vue'
import { ElMessage } from 'element-plus'
import { useEmployeeStore } from '@/store/employees'
import { useAuthStore } from '@/store/auth'
import { useRouter } from 'vue-router'

Chart.register(...registerables, annotationPlugin)

// Stores
const employeeStore = useEmployeeStore()
const authStore = useAuthStore()
const dialogsStore = useDialogsStore()
const router = useRouter()

// Store refs
const { error: employeesError, loading: employeesLoading, employees: employeesRef } = storeToRefs(employeeStore)
const { organizationId: orgIdRef, user: userRef } = storeToRefs(authStore)
const { loading, employeeMetrics, metricsLoading, metricsError } = storeToRefs(dialogsStore)

// Local state
const employee = ref(null)
const employees = ref([])
const metric = ref('')
const dateRange = ref('')

// Static options
const metrics = ref([
  { value: 'overall_score', label: 'Итоговая оценка' },
  { value: 'greeting_farewell_score', label: 'Приветствие и прощание' },
  { value: 'completeness_score', label: 'Полнота ответа' },
  { value: 'tone_score', label: 'Тон общения' },
  { value: 'openness_helpfulness_score', label: 'Открытость и готовность помочь' },
  { value: 'listening_score', label: 'Умение слушать' },
  { value: 'empathy_score', label: 'Эмпатия' },
  { value: 'speech_quality_score', label: 'Грамотная речь' },
  { value: 'response_time_score', label: 'Время ответа' },
])

// Derived values
const organizationId = computed(() => {
  const authOrgId = orgIdRef?.value
  if (authOrgId) return authOrgId
  if (employees.value && employees.value.length > 0) return employees.value[0].organization_id || null
  const authUser = userRef?.value
  if (authUser && authUser.organization_id) return authUser.organization_id
  const fromSession = sessionStorage.getItem('organizationId')
  if (fromSession) return fromSession
  return null
})

// Y axis dynamic bounds
const yMax = computed(() => {
  const m = employeeMetrics.value
  if (!m || !Array.isArray(m.datasets) || m.datasets.length === 0) return 5
  let maxValue = Number.NEGATIVE_INFINITY
  for (const dataset of m.datasets) {
    if (!Array.isArray(dataset.data)) continue
    for (const raw of dataset.data) {
      const num = typeof raw === 'number' ? raw : parseFloat(raw)
      if (!Number.isNaN(num) && num > maxValue) maxValue = num
    }
  }
  return Number.isFinite(maxValue) ? maxValue : 5
})
const yMaxRounded = computed(() => Math.ceil((yMax.value + Number.EPSILON) * 10) / 10)

// Chart options
const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    datalabels: { display: false },
    tooltip: {
      mode: 'index',
      intersect: false,
      backgroundColor: '#fff',
      titleColor: '#2e2e2e',
      bodyColor: '#2e2e2e',
      borderColor: '#402de6',
      borderWidth: 2,
      cornerRadius: 4,
      padding: 12,
      callbacks: {
        label: (context) => `${context.dataset.label}: ${context.parsed.y.toFixed(2)}`,
        afterLabel: () => 'Кликните для анализа диалогов'
      }
    },
    legend: {
      display: false,
      position: 'bottom',
      labels: { usePointStyle: true, padding: 20, font: { size: 12 } },
      align: 'start',
      fullWidth: true
    },
    annotation: {
      annotations: {
        line1: {
          type: 'line',
          yMin: 2.1,
          yMax: 2.1,
          borderColor: 'red',
          borderWidth: 2,
          label: {
            content: 'Целевое значение: 2',
            enabled: true,
            position: 'end'
          }
        }
      }
    }
  },
  elements: {
    point: { 
      radius: 4, 
      hoverRadius: 6, 
      borderWidth: 2, 
      backgroundColor: '#fff',
      display: 'auto',
      hoverBackgroundColor: '#409EFF',
      cursor: 'pointer'
    },
    line: { 
      borderWidth: 2, 
      tension: 0.1,
      spanGaps: false
    }
  },
  scales: {
    x: {
      type: 'category',
      grid: { color: 'rgba(0, 0, 0, 0.1)', lineWidth: 1 },
      ticks: { 
        font: { size: 11 },
        maxRotation: 45,
        minRotation: 0
      }
    },
    y: {
      beginAtZero: false,
      max: yMaxRounded.value,
      grid: { color: 'rgba(0, 0, 0, 0.1)', lineWidth: 1 },
      ticks: { 
        stepSize: 0.1, 
        callback: (v) => Number(v).toFixed(1), 
        font: { size: 11 } 
      }
    }
  },
  interaction: { mode: 'nearest', axis: 'x', intersect: false },
  onClick: (event, elements) => {
    if (elements.length > 0) {
      const element = elements[0]
      const datasetIndex = element.datasetIndex
      const dataIndex = element.index
      
      // Получаем данные о сотруднике из dataset
      const dataset = lineData.value.datasets[datasetIndex]
      
      // Пытаемся получить ID сотрудника из различных источников
      let employeeId = dataset.employeeId || dataset.employee_id || dataset.id
      
      // Если ID не найден, используем label как fallback
      if (!employeeId) {
        employeeId = dataset.label
      }
      
      
      // Получаем дату из конкретной точки на диаграмме
      const originalMetrics = employeeMetrics.value
      // Находим соответствующий индекс в оригинальных данных
      const filteredLabel = lineData.value.labels[dataIndex]
      const originalIndex = originalMetrics && originalMetrics.labels ? 
        originalMetrics.labels.findIndex(label => label === filteredLabel) : dataIndex
      const originalDate = originalMetrics && originalMetrics.labels && originalIndex >= 0 
        ? originalMetrics.labels[originalIndex] 
        : filteredLabel
      const date = originalDate
      
      console.log('Clicked data:', { 
        employeeId, 
        date, 
        dataset, 
        originalDate, 
        dataIndex,
        filteredLabel,
        originalIndex,
        originalMetricsLabels: originalMetrics?.labels
      })
      
      // Переходим на страницу анализа диалогов
      navigateToDialogAnalysis(employeeId, date)
    }
  }
}))

// Transform API payload to chart data
const lineData = computed(() => {
  const metrics = employeeMetrics.value
  if (!metrics || !Array.isArray(metrics.labels) || !Array.isArray(metrics.datasets)) {
    return { labels: [], datasets: [] }
  }

  // Добавьте в начало функции lineData для отладки
  console.log('Employee metrics data:', metrics)

  const parseLabelDate = (label) => {
    if (!label || typeof label !== 'string') return null
    
    // Для формата "DD-MM-YYYY"
    const hyphenMatch = label.match(/^([0-3]?\d)-([0-1]?\d)-(\d{4})$/)
    if (hyphenMatch) {
      const day = parseInt(hyphenMatch[1], 10)
      const month = parseInt(hyphenMatch[2], 10) - 1 // Месяцы в JS начинаются с 0
      const year = parseInt(hyphenMatch[3], 10)
      const d = new Date(year, month, day)
      return Number.isNaN(d.getTime()) ? null : d
    }
    
    // Для других форматов
    const isoDate = new Date(label)
    if (!Number.isNaN(isoDate.getTime())) return isoDate
    
    const dotMatch = label.match(/^([0-3]?\d)[.](0?\d|1[0-2])[.](\d{4})$/)
    if (dotMatch) {
      const d = new Date(Number(dotMatch[3]), Number(dotMatch[2]) - 1, Number(dotMatch[1]))
      return Number.isNaN(d.getTime()) ? null : d
    }
    
    const slashMatch = label.match(/^([0-3]?\d)[\/](0?\d|1[0-2])[\/](\d{4})$/)
    if (slashMatch) {
      const d = new Date(Number(slashMatch[3]), Number(slashMatch[2]) - 1, Number(slashMatch[1]))
      return Number.isNaN(d.getTime()) ? null : d
    }
    
    return null
  }

  let indicesToKeep = metrics.labels.map((_, idx) => idx)
  if (Array.isArray(dateRange.value) && dateRange.value[0] && dateRange.value[1]) {
    const start = new Date(dateRange.value[0])
    const end = new Date(dateRange.value[1])
    
    const dateMapping = metrics.labels.map((label, idx) => ({ idx, label, date: parseLabelDate(label) }))
    
    indicesToKeep = dateMapping
      .filter(({ date }) => date && date >= start && date <= end)
      .map(({ idx }) => idx)
  }

  const filteredLabels = indicesToKeep.map(i => metrics.labels[i]) || []

  const enrichedDatasets = metrics.datasets.map(dataset => ({
    ...dataset,
    data: Array.isArray(dataset.data) ? indicesToKeep.map(i => dataset.data[i]) : dataset.data,
    employeeId: dataset.employeeId || dataset.label, // Добавляем ID сотрудника
    borderColor: dataset.backgroundColor || '#409EFF',
    backgroundColor: 'transparent',
    tension: 0.1,
    fill: false,
    spanGaps: false,
    pointBackgroundColor: dataset.backgroundColor || '#409EFF',
    pointBorderColor: '#fff',
    pointHoverBackgroundColor: '#fff',
    pointHoverBorderColor: dataset.backgroundColor || '#409EFF',
    pointRadius: 4,
    pointHoverRadius: 6,
    pointBorderWidth: 2
  }))

  return { labels: filteredLabels, datasets: enrichedDatasets }
})

// Actions
const { fetchDialogs, fetchEmployeeMetrics } = dialogsStore

const loadEmployeeMetrics = async () => {
  try {
    if (!organizationId.value || !metric.value || !dateRange.value?.[0] || !dateRange.value?.[1]) return

    const params = {
      organization_id: organizationId.value,
      metric_type: metric.value,
      start_date: dateRange.value[0].toISOString(),
      end_date: dateRange.value[1].toISOString()
    }
    if (employee.value) {
      params.employee_ids = [employee.value] // Обертываем в массив для API
    }
    await fetchEmployeeMetrics(params)
  } catch (error) {
    ElMessage.error('Ошибка при загрузке метрик сотрудников')
  }
}

const refreshData = async () => {
  try {
    await fetchDialogs()
    await loadEmployeeMetrics()
  } catch (error) {
    ElMessage.error('Ошибка при загрузке данных')
  }
}

const changeEmployee = (employeeId) => {
  employee.value = employeeId
  loadEmployeeMetrics()
}

const onMetricChange = () => loadEmployeeMetrics()
const onDateChange = () => loadEmployeeMetrics()

// UI helpers
const disableExceptJuly2025 = (date) => {
  if (!(date instanceof Date)) return true
  const year = date.getFullYear()
  const month = date.getMonth() // 0 = Jan, 6 = Jul
  const day = date.getDate()
  return !(year === 2025 && month === 6 && day >= 1 && day <= 31)
}

const getEmployeeDisplayName = (employee) => {
  if (!employee) return 'Неизвестный сотрудник'
  const firstName = employee.first_name || employee.name || employee.firstName || ''
  const lastName = employee.last_name || employee.surname || employee.lastName || ''
  if (firstName && lastName) return `${firstName} ${lastName}`
  if (firstName) return firstName
  if (lastName) return lastName
  if (employee.name) return employee.name
  return employee.id ? `Сотрудник ${employee.id.slice(0, 8)}` : 'Неизвестный сотрудник'
}

const selectAllEmployees = () => {
  employee.value = null
  loadEmployeeMetrics()
}

// Функция навигации на страницу анализа диалогов
const navigateToDialogAnalysis = (employeeId, date) => {
  // Проверяем, что у нас есть валидные данные
  if (!employeeId || !date) {
    ElMessage.warning('Не удалось определить данные для перехода')
    return
  }
  
  // Если employeeId это имя, а не ID, пытаемся найти ID по имени
  let actualEmployeeId = employeeId
  
  // Проверяем, является ли employeeId именем (содержит пробелы или кириллицу)
  if (typeof employeeId === 'string' && (employeeId.includes(' ') || /[а-яё]/i.test(employeeId))) {
    // Ищем сотрудника по имени в списке сотрудников
    const foundEmployee = employees.value.find(emp => {
      const displayName = getEmployeeDisplayName(emp)
      return displayName === employeeId
    })
    
    if (foundEmployee) {
      actualEmployeeId = foundEmployee.id
    } else {
      ElMessage.warning(`Не удалось найти ID сотрудника: ${employeeId}`)
      return
    }
  }
  
  console.log("Raw date from chart:", date)
  console.log("Date type:", typeof date)
  console.log("Formatted date:", formatDateForAPI(date))
  const formattedDate = formatDateForAPI(date)
  if (!formattedDate) {
    ElMessage.warning('Не удалось обработать дату')
    return
  }
  
  // Формируем параметры для фильтрации
  const queryParams = {
    employee_ids: actualEmployeeId,
    start_date: formattedDate,
    end_date: addOneDay(formattedDate) // Добавляем 1 день к конечной дате
  }
  
  console.log("Navigating with params:", queryParams)
  
  // Переходим на страницу анализа диалогов
  router.push({
    path: '/pie',
    query: queryParams
  })
}

// Форматирование даты для API
const formatDateForAPI = (dateString) => {
  if (!dateString) return null
  
  console.log("formatDateForAPI input:", dateString)
  
  // Используем ту же логику парсинга, что и в parseLabelDate
  const parseLabelDate = (label) => {
    if (!label || typeof label !== 'string') return null
    
    console.log("parseLabelDate input:", label)
    
    // Для формата "DD-MM-YYYY"
    const hyphenMatch = label.match(/^([0-3]?\d)-([0-1]?\d)-(\d{4})$/)
    if (hyphenMatch) {
      const day = parseInt(hyphenMatch[1], 10)
      const month = parseInt(hyphenMatch[2], 10) - 1 // Месяцы в JS начинаются с 0
      const year = parseInt(hyphenMatch[3], 10)
      console.log("Parsed values:", { day, month, year })
      const d = new Date(year, month, day)
      console.log("Created date:", d)
      return Number.isNaN(d.getTime()) ? null : d
    }
    
    // Для других форматов
    const isoDate = new Date(label)
    if (!Number.isNaN(isoDate.getTime())) return isoDate
    
    const dotMatch = label.match(/^([0-3]?\d)[.](0?\d|1[0-2])[.](\d{4})$/)
    if (dotMatch) {
      const d = new Date(Number(dotMatch[3]), Number(dotMatch[2]) - 1, Number(dotMatch[1]))
      return Number.isNaN(d.getTime()) ? null : d
    }
    
    const slashMatch = label.match(/^([0-3]?\d)[\/](0?\d|1[0-2])[\/](\d{4})$/)
    if (slashMatch) {
      const d = new Date(Number(slashMatch[3]), Number(slashMatch[2]) - 1, Number(slashMatch[1]))
      return Number.isNaN(d.getTime()) ? null : d
    }
    
    return null
  }
  
  const parsedDate = parseLabelDate(dateString)
  if (!parsedDate) return null
  
  // Используем локальную дату вместо UTC
  const year = parsedDate.getFullYear()
  const month = String(parsedDate.getMonth() + 1).padStart(2, '0')
  const day = String(parsedDate.getDate()).padStart(2, '0')
  const result = `${year}-${month}-${day}`
  
  console.log("formatDateForAPI result:", result)
  return result
}

// Функция для добавления одного дня к дате
const addOneDay = (dateString) => {
  if (!dateString) return null
  
  const date = new Date(dateString)
  date.setDate(date.getDate() + 1)
  return date.toISOString().split('T')[0]
}

// Lifecycle
onMounted(async () => {
  try {
    await employeeStore.fetchEmployees()
    const raw = employeesRef?.value
    const normalizedEmployees = Array.isArray(raw) ? raw : (raw?.data || [])
    employees.value = normalizedEmployees

    // Устанавливаем первого сотрудника по умолчанию
    if (employees.value.length > 0) {
      employee.value = employees.value[0].id
    }

    metric.value = metrics.value[0].value
    dateRange.value = [
      new Date('2025-07-01T00:00:00'),
      new Date('2025-07-31T23:59:59')
    ]
    await loadEmployeeMetrics()
  } catch (error) {
    console.error('Ошибка при загрузке сотрудников:', error)
  }
})
</script>

<style lang="scss" scoped>

</style>
