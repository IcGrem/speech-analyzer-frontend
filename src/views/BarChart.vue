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
        <div v-else-if="error" class="w-full h-[600px] flex justify-center items-center">
          <el-alert
            :title="error"
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
Chart.register(...registerables)

const employeeStore = useEmployeeStore()

const employee = ref(null)
const employees = ref([])
const metric = ref('')

const organizationId = computed(() => {
  if (employees.value && employees.value.length > 0) {
    return employees.value[0].organization_id || null
  }
  return null
})
const metrics = ref([
  {
    value: 'greeting_farewell_score',
    label: 'Приветствие и прощание'
  },
  {
    value: 'completeness_score',
    label: 'Полнота ответа'
  },
  {
    value: 'tone_score',
    label: 'Тон общения'
  },
  {
    value: 'openness_helpfulness_score',
    label: 'Открытость и готовность помочь'
  },
  {
    value: 'listening_score',
    label: 'Умение слушать'
  },
  {
    value: 'empathy_score',
    label: 'Эмпатия'
  },
  {
    value: 'speech_quality_score',
    label: 'Грамотная речь'
  },
  {
    value: 'response_time_score',
    label: 'Время ответа'
  },
  {
    value: 'overall_score',
    label: 'Итоговая оценка'
  }
])


const dialogsStore = useDialogsStore()
const { loading, error, employeeMetrics, metricsLoading } = storeToRefs(dialogsStore)
const { fetchDialogs, fetchEmployeeMetrics } = dialogsStore

const dateRange = ref('')

// Динамический максимум по данным
const yMax = computed(() => {
  const m = employeeMetrics.value
  if (!m || !Array.isArray(m.datasets) || m.datasets.length === 0) {
    return 5
  }
  let maxValue = Number.NEGATIVE_INFINITY
  for (const dataset of m.datasets) {
    if (!Array.isArray(dataset.data)) continue
    for (const raw of dataset.data) {
      const num = typeof raw === 'number' ? raw : parseFloat(raw)
      if (!Number.isNaN(num)) {
        if (num > maxValue) maxValue = num
      }
    }
  }
  if (!Number.isFinite(maxValue)) return 5
  return maxValue
})

// Шаг 0.1 — округляем верхнюю границу вверх до ближайшего шага 0.1
const yMaxRounded = computed(() => Math.ceil((yMax.value + Number.EPSILON) * 10) / 10)

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    datalabels: {
      display: false,
    },
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
        label: function(context) {
          return context.dataset.label + ': ' + context.parsed.y.toFixed(2)
        }
      }
    },
    legend: {
      display: true,
      position: 'bottom',
      labels: {
        usePointStyle: true,
        padding: 20,
        font: {
          size: 12
        }
      },
      align: 'start',
      fullWidth: true
    }
  },
  elements: {
    point: {
      radius: 5,
      hoverRadius: 6,
      borderWidth: 2,
      backgroundColor: '#fff'
    },
    line: {
      borderWidth: 3,
      tension: 1
    }
  },
  scales: {
    x: {
      grid: {
        color: 'rgba(0, 0, 0, 0.1)',
        lineWidth: 1
      },
      ticks: {
        font: {
          size: 11
        }
      }
    },
    y: {
      beginAtZero: false,
      max: yMaxRounded.value,
      grid: {
        color: 'rgba(0, 0, 0, 0.1)',
        lineWidth: 1
      },
      ticks: {
        stepSize: 0.1,
        callback: (value) => Number(value).toFixed(1),
        font: {
          size: 11
        }
      }
    },
  },
  interaction: {
    mode: 'nearest',
    axis: 'x',
    intersect: false
  }
}))

// Computed property to transform employee metrics data for the chart
const lineData = computed(() => {
  const metrics = employeeMetrics.value
  if (!metrics || !Array.isArray(metrics.labels) || !Array.isArray(metrics.datasets)) {
    return { labels: [], datasets: [] }
  }

  const enrichedDatasets = metrics.datasets.map(dataset => ({
    ...dataset,
    borderColor: dataset.backgroundColor || '#409EFF',
    backgroundColor: 'transparent',
    tension: 0.2,
    fill: false,
    pointBackgroundColor: dataset.backgroundColor || '#409EFF',
    pointBorderColor: '#fff',
    pointHoverBackgroundColor: '#fff',
    pointHoverBorderColor: dataset.backgroundColor || '#409EFF'
  }))

  return {
    labels: metrics.labels,
    datasets: enrichedDatasets
  }
})

const refreshData = async () => {
  try {
    await fetchDialogs()
    await loadEmployeeMetrics()
  } catch (error) {
    ElMessage.error('Ошибка при загрузке данных')
  }
}

// Функция для загрузки метрик сотрудников
const loadEmployeeMetrics = async () => {
  try {
    // Проверяем минимально необходимые параметры
    if (!organizationId.value || !metric.value || !dateRange.value?.[0] || !dateRange.value?.[1]) {
      // Недостаточно данных для загрузки метрик — пропускаем
    
      return
    }
    
    const params = {
      organization_id: organizationId.value,
      metric_type: metric.value,
      start_date: dateRange.value[0].toISOString(),
      end_date: dateRange.value[1].toISOString()
    }
    
    // Добавляем employee_ids только если конкретные сотрудники выбраны
    if (employee.value && Array.isArray(employee.value) && employee.value.length > 0) {
      params.employee_ids = employee.value
    }
    // Если employee.value is null, то не добавляем employee_ids - загружаем всех
    
  
    
    await fetchEmployeeMetrics(params)
    
  } catch (error) {
    ElMessage.error('Ошибка при загрузке метрик сотрудников')
  }
}

// Обработчик изменения сотрудника
const changeEmployee = (employeeIds) => {

  
  // Если выбрано "all" (все сотрудники), устанавливаем null
  if (employeeIds === 'all' || employeeIds === null) {
    employee.value = null
  } else {
    // Фильтруем null значения из массива
    const filteredIds = Array.isArray(employeeIds) ? employeeIds.filter(id => id !== null && id !== undefined) : employeeIds
    employee.value = filteredIds.length > 0 ? filteredIds : null
    
    // Если после фильтрации массив пустой, устанавливаем null
    if (Array.isArray(employee.value) && employee.value.length === 0) {
      employee.value = null
    }
  }
  

  
  // Сразу загружаем метрики (с выбранными сотрудниками или без них)
  loadEmployeeMetrics()
}

// Обработчик изменения метрики
const onMetricChange = () => {
  loadEmployeeMetrics()
}

// Обработчик изменения дат
const onDateChange = () => {
  loadEmployeeMetrics()
}

// Разрешаем выбирать только даты с 1 по 31 июля 2025 года
const disableExceptJuly2025 = (date) => {
  if (!(date instanceof Date)) return true
  const year = date.getFullYear()
  const month = date.getMonth() // 0 = Jan, 6 = Jul
  const day = date.getDate()
  return !(year === 2025 && month === 6 && day >= 1 && day <= 31)
}

// Функция для безопасного формирования имени сотрудника
const getEmployeeDisplayName = (employee) => {
  if (!employee) return 'Неизвестный сотрудник'
  
  const firstName = employee.first_name || employee.name || employee.firstName || ''
  const lastName = employee.last_name || employee.surname || employee.lastName || ''
  
  if (firstName && lastName) {
    return `${firstName} ${lastName}`
  }
  
  if (firstName) {
    return firstName
  }
  
  if (lastName) {
    return lastName
  }
  
  if (employee.name) {
    return employee.name
  }
  
  return employee.id ? `Сотрудник ${employee.id.slice(0, 8)}` : 'Неизвестный сотрудник'
}

const selectAllEmployees = () => {
  employee.value = null
  loadEmployeeMetrics()
}

onMounted(async () => {
  try {
    await employeeStore.fetchEmployees()
    if (employeeStore.employees && employeeStore.employees.data) {
      employees.value = employeeStore.employees.data
      metric.value = metrics.value[0].value
      dateRange.value = [
        new Date('2025-07-26T00:00:00'),
        new Date('2025-07-31T23:59:59')
      ]
      await loadEmployeeMetrics()
    }
  } catch (error) {
    console.error('Ошибка при загрузке сотрудников:', error)
  }
})
</script>

<style lang="scss" scoped>

</style>