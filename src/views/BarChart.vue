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
            placeholder="Все сотрудники"
            @change="changeEmployee"
            multiple
            collapse-tags
            collapse-tags-tooltip
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
import { useDialogsStore } from '@/store/dialogs'
import { storeToRefs } from 'pinia'
import LoadingIndicator from '@/components/LoadingIndicator.vue'
import { ElMessage } from 'element-plus'
import { useEmployeeStore } from '@/store/employees'
import { useAuthStore } from '@/store/auth'

Chart.register(...registerables)

// Stores
const employeeStore = useEmployeeStore()
const authStore = useAuthStore()
const dialogsStore = useDialogsStore()

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
        label: (context) => `${context.dataset.label}: ${context.parsed.y.toFixed(2)}`
      }
    },
    legend: {
      display: true,
      position: 'bottom',
      labels: { usePointStyle: true, padding: 20, font: { size: 12 } },
      align: 'start',
      fullWidth: true
    }
  },
  elements: {
    point: { radius: 5, hoverRadius: 6, borderWidth: 2, backgroundColor: '#fff' },
    line: { borderWidth: 3, tension: 1 }
  },
  scales: {
    x: {
      grid: { color: 'rgba(0, 0, 0, 0.1)', lineWidth: 1 },
      ticks: { font: { size: 11 } }
    },
    y: {
      beginAtZero: false,
      max: yMaxRounded.value,
      grid: { color: 'rgba(0, 0, 0, 0.1)', lineWidth: 1 },
      ticks: { stepSize: 0.1, callback: (v) => Number(v).toFixed(1), font: { size: 11 } }
    }
  },
  interaction: { mode: 'nearest', axis: 'x', intersect: false }
}))

// Transform API payload to chart data
const lineData = computed(() => {
  const metrics = employeeMetrics.value
  if (!metrics || !Array.isArray(metrics.labels) || !Array.isArray(metrics.datasets)) {
    return { labels: [], datasets: [] }
  }

  const parseLabelDate = (label) => {
    if (!label || typeof label !== 'string') return null
    const isoDate = new Date(label)
    if (!Number.isNaN(isoDate.getTime())) return isoDate
    const dotMatch = label.match(/^([0-3]?\d)[.](0?\d|1[0-2])[.](\d{4})$/)
    if (dotMatch) {
      const d = new Date(Number(dotMatch[3]), Number(dotMatch[2]) - 1, Number(dotMatch[1]))
      return Number.isNaN(d.getTime()) ? null : d
    }
    const hyphenMatch = label.match(/^([0-3]?\d)-(0?\d|1[0-2])-(\d{4})$/)
    if (hyphenMatch) {
      const d = new Date(Number(hyphenMatch[3]), Number(hyphenMatch[2]) - 1, Number(hyphenMatch[1]))
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
    indicesToKeep = metrics.labels
      .map((label, idx) => ({ idx, date: parseLabelDate(label) }))
      .filter(({ date }) => date && date >= start && date <= end)
      .map(({ idx }) => idx)
  }

  const filteredLabels = indicesToKeep.map(i => metrics.labels[i]) || []

  const enrichedDatasets = metrics.datasets.map(dataset => ({
    ...dataset,
    data: Array.isArray(dataset.data) ? indicesToKeep.map(i => dataset.data[i]) : dataset.data,
    borderColor: dataset.backgroundColor || '#409EFF',
    backgroundColor: 'transparent',
    tension: 0.2,
    fill: false,
    pointBackgroundColor: dataset.backgroundColor || '#409EFF',
    pointBorderColor: '#fff',
    pointHoverBackgroundColor: '#fff',
    pointHoverBorderColor: dataset.backgroundColor || '#409EFF'
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
    if (employee.value && Array.isArray(employee.value) && employee.value.length > 0) {
      params.employee_ids = employee.value
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

const changeEmployee = (employeeIds) => {
  if (employeeIds === 'all' || employeeIds === null) {
    employee.value = null
  } else {
    const filteredIds = Array.isArray(employeeIds) ? employeeIds.filter(id => id !== null && id !== undefined) : employeeIds
    employee.value = filteredIds.length > 0 ? filteredIds : null
    if (Array.isArray(employee.value) && employee.value.length === 0) employee.value = null
  }
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

// Lifecycle
onMounted(async () => {
  try {
    await employeeStore.fetchEmployees()
    const raw = employeesRef?.value
    const normalizedEmployees = Array.isArray(raw) ? raw : (raw?.data || [])
    employees.value = normalizedEmployees

    metric.value = metrics.value[0].value
    dateRange.value = [
      new Date('2025-07-26T00:00:00'),
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