<template>
  <PageWrapper title="Динамика метрик по диалогам">
    <div class="px-2 py-4">
      <el-row :gutter="12">
        <el-col :span="10">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            :disabled-date="disableExceptJul2025"
            range-separator="-"
            start-placeholder="Дата начала"
            end-placeholder="Дата окончания"
            unlink-panels
            clearable
            @change="onDateChange"
            style="width: 100%;"
          />
        </el-col>
        <el-col :span="10">
          <el-select
            v-model="selectedEmployees"
            placeholder="Все сотрудники"
            multiple
            collapse-tags
            collapse-tags-tooltip
            filterable
            style="width: 100%;"
          >
            <el-option
              v-for="name in employeeNames"
              :key="name"
              :label="name"
              :value="name"
            />
          </el-select>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" class="w-full" @click="refreshData">Обновить</el-button>
        </el-col>
      </el-row>
    </div>
    <div class="max-w-full mx-auto h-[500px]">
      <div v-if="employeeAverageLoading" class="w-full h-[500px] flex justify-center items-center">
        <LoadingIndicator />
      </div>
      <div v-else-if="employeeAverageError" class="w-full h-[500px] flex justify-center items-center">
        <el-alert :title="employeeAverageError" type="error" :closable="false" show-icon />
      </div>
      <div v-else-if="barData.labels?.length && barData.datasets?.length" class="w-full h-[500px]">
        <Bar :data="barData" :options="chartOptions" />
      </div>
      <div v-else class="w-full h-[500px] flex justify-center items-center">
        <el-empty description="Нет данных для отображения графика" />
      </div>
    </div>
  </PageWrapper>
</template>

<script setup>

import { onMounted, computed, ref, watch } from 'vue'
import { Bar } from 'vue-chartjs'
import { Chart, registerables } from 'chart.js'
import { useDialogsStore } from '@/store/dialogs'
import { useEmployeeStore } from '@/store/employees'
import { useAuthStore } from '@/store/auth'
import { storeToRefs } from 'pinia'
import LoadingIndicator from '@/components/LoadingIndicator.vue'
Chart.register(...registerables)

// Метрики для запроса (обязательный параметр metric_types)
const metrics = [
  { value: 'greeting_farewell_score', label: 'Приветствие и прощание' },
  { value: 'completeness_score', label: 'Полнота ответа' },
  { value: 'tone_score', label: 'Тон общения' },
  { value: 'openness_helpfulness_score', label: 'Открытость и готовность помочь' },
  { value: 'listening_score', label: 'Умение слушать' },
  { value: 'empathy_score', label: 'Эмпатия' },
  { value: 'speech_quality_score', label: 'Грамотная речь' },
  { value: 'response_time_score', label: 'Время ответа' },
  { value: 'overall_score', label: 'Итоговая оценка' },
]

const dialogsStore = useDialogsStore()
const employeeStore = useEmployeeStore()
const authStore = useAuthStore()
const { employeeAverageMetrics, employeeAverageLoading, employeeAverageError } = storeToRefs(dialogsStore)
const { organizationId: authOrganizationId, user: authUser } = storeToRefs(authStore)

// Дату по умолчанию не отправляем: начальное значение null
const dateRange = ref(null)
const selectedEmployees = ref([])

// Организация: берём из auth, иначе из сотрудников, иначе из sessionStorage
const organizationId = computed(() => {
  if (authOrganizationId?.value) return authOrganizationId.value
  const raw = employeeStore.employees
  const employeesArr = Array.isArray(raw) ? raw : (raw?.data || [])
  if (Array.isArray(employeesArr) && employeesArr.length > 0) return employeesArr[0]?.organization_id || null
  const fromSession = sessionStorage.getItem('organizationId')
  return fromSession || authUser?.value?.organization_id || null
})

const refreshData = async () => {
  if (!organizationId.value) return
  const params = {
    organization_id: organizationId.value,
    metric_types: metrics.map(m => m.value),
  }
  if (Array.isArray(dateRange.value) && dateRange.value[0] && dateRange.value[1]) {
    params.start_date = dateRange.value[0].toISOString()
    params.end_date = dateRange.value[1].toISOString()
  }
  await dialogsStore.fetchEmployeeAverageMetrics(params)
}

const fetchData = async () => {
  if (!employeeStore.employees) {
    await employeeStore.fetchEmployees()
  }
  await refreshData()
}

// Доступные имена сотрудников из набора данных
const employeeNames = computed(() => {
  const m = employeeAverageMetrics.value
  if (!m || !Array.isArray(m.datasets)) return []
  return m.datasets.map(d => d.label).filter(Boolean)
})

// Динамический максимум суммы сегментов на категорию (для стека)
const stackedMax = computed(() => {
  const m = (employeeAverageMetrics && employeeAverageMetrics.value) ? employeeAverageMetrics.value : { labels: [], datasets: [] }
  if (!m || !Array.isArray(m.labels) || !Array.isArray(m.datasets) || m.datasets.length === 0) return 5
  const sums = Array(m.labels.length).fill(0)
  for (const ds of m.datasets) {
    if (!Array.isArray(ds.data)) continue
    // Фильтруем по выбранным сотрудникам (если выбраны)
    if (selectedEmployees.value && selectedEmployees.value.length > 0 && ds.label && !selectedEmployees.value.includes(ds.label)) {
      continue
    }
    ds.data.forEach((v, i) => {
      const num = typeof v === 'number' ? v : parseFloat(v)
      if (!Number.isNaN(num)) sums[i] += num
    })
  }
  const max = Math.max(...sums)
  return Math.ceil((max + Number.EPSILON) * 10) / 10
})

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  indexAxis: 'x',
  plugins: {
    legend: { display: true, position: 'bottom' },
    title: { display: true, text: '' },
    tooltip: {
      enabled: true,
      mode: 'nearest',
      intersect: true,
      callbacks: {
        label: (ctx) => `${ctx.dataset.label}: ${Number(ctx.parsed.y).toFixed(1)}`,
      }
    }
  },
  scales: {
    x: { stacked: true },
    y: {
      stacked: true,
      beginAtZero: true,
      suggestedMax: stackedMax.value,
      ticks: { display: false },
      grid: { drawTicks: false }
    },
  },
  interaction: { mode: 'nearest', intersect: true },
  datasets: {
    bar: {
      barPercentage: 0.8,
      categoryPercentage: 0.9,
      borderSkipped: false,
      borderRadius: 2,
    }
  }
}))

const barData = computed(() => {
  const m = (employeeAverageMetrics && employeeAverageMetrics.value) ? employeeAverageMetrics.value : { labels: [], datasets: [] }
  if (!m || !Array.isArray(m.labels) || !Array.isArray(m.datasets)) {
    return { labels: [], datasets: [] }
  }

  const filteredDatasets = m.datasets.filter(ds => {
    if (!selectedEmployees.value || selectedEmployees.value.length === 0) return true
    return ds.label && selectedEmployees.value.includes(ds.label)
  }).map(ds => ({
    ...ds,
    backgroundColor: ds.backgroundColor || '#409EFF',
    borderColor: ds.borderColor || ds.backgroundColor || '#409EFF',
    borderWidth: 0,
  }))

  return {
    labels: m.labels,
    datasets: filteredDatasets
  }
})

// Ограничение выбора дат: только 01.07.2025 — 31.07.2025
const disableExceptJul2025 = (date) => {
  if (!(date instanceof Date)) return true
  const y = date.getFullYear()
  const m = date.getMonth() // 0..11; 6 = July
  const d = date.getDate()
  return !(y === 2025 && m === 6 && d >= 1 && d <= 31)
}

const onDateChange = () => {
  // Динамическое обновление по дате (если дата очищена — запрос без дат)
  refreshData()
}

// Рефреш при изменении auth organization
watch(() => authOrganizationId?.value, () => refreshData())

onMounted(fetchData)
</script>

<style lang="scss" scoped>

</style>