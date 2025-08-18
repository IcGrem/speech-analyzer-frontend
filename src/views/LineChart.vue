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


const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  indexAxis: 'x',
  plugins: {
    legend: { display: true, position: 'bottom', labels: { filter: (legendItem, data) => {
        const label = legendItem.text
        const firstIdx = data.datasets.findIndex(d => d.label === label)
        return legendItem.datasetIndex === firstIdx
      } } },
    title: { display: true, text: '' },
    tooltip: {
      enabled: true,
      mode: 'nearest',
      intersect: true,
      callbacks: {
        label: (ctx) => {
          const rawArr = ctx.dataset && Array.isArray(ctx.dataset.rawData) ? ctx.dataset.rawData : null
          const raw = rawArr ? rawArr[ctx.dataIndex] : ctx.raw
          const num = Number(raw)
          const txt = Number.isFinite(num) ? num.toFixed(1) : raw
          return `${ctx.dataset.label}: ${txt}`
        },
      }
    }
  },
  scales: {
    x: { stacked: true },
    y: {
      stacked: true,
      beginAtZero: true,
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
      borderWidth: 2,
      borderColor: '#ffffff',
    }
  }
}))


const barData = computed(() => {
  const src = employeeAverageMetrics.value || { labels: [], datasets: [] }
  const labels = Array.isArray(src.labels) ? src.labels : []
  let datasets = Array.isArray(src.datasets) ? src.datasets : []

  if (selectedEmployees.value && selectedEmployees.value.length > 0) {
    datasets = datasets.filter(ds => ds.label && selectedEmployees.value.includes(ds.label))
  }

  const sums = labels.map((_, idx) => datasets.reduce((acc, ds) => acc + (Number(ds.data?.[idx]) || 0), 0))

  datasets = datasets.map(ds => {
    const rawData = Array.isArray(ds.data) ? ds.data : labels.map(() => 0)
    const normalized = rawData.map((v, idx) => {
      const num = Number(v) || 0
      const sum = sums[idx] || 1
      return sum > 0 ? (num / sum) * 100 : 0
    })
    return {
      ...ds,
      data: normalized,
      rawData,
      backgroundColor: ds.backgroundColor || '#6366F1',
      borderColor: ds.borderColor || '#ffffff',
      borderWidth: 2,
    }
  })

  return { labels, datasets }
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