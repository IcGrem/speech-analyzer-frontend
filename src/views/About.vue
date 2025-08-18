<template>
  <PageWrapper title="Динамика метрик по дням">
    
    <div class="">
      <el-row :gutter="10" class="py-4">
        <el-col :span="8">
          <el-select
            v-model="selectedMetrics"
            placeholder="Метрики"
            multiple
            collapse-tags
            collapse-tags-tooltip
            @change="onMetricsChange"
            style="width: 100%;"
          >
            <el-option
              v-for="item in metricsOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
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
          <el-alert :title="error" type="error" :closable="false" show-icon>
            <template #default>
              <p class="mt-2">Попробуйте обновить данные или проверьте подключение к серверу.</p>
            </template>
          </el-alert>
        </div>
        <div v-else-if="lineData.labels?.length && lineData.datasets?.length" class="w-full h-[600px] flex justify-center items-center">
          <Line style="width: 100%; height: 100%;" :data="lineData" :options="chartOptions" />
        </div>
        <div v-else class="w-full h-[600px] flex justify-center items-center">
          <el-empty description="Нет данных для отображения графика" />
        </div>
      </el-col>
    </el-row>
  </PageWrapper>
</template>

<script setup>
import { onMounted, computed, ref, watch } from 'vue'
import { Line } from 'vue-chartjs'
import LoadingIndicator from '@/components/LoadingIndicator.vue'
import { ElMessage } from 'element-plus'

import { useOrganizationMetricsStore } from '@/store/organizationMetrics'
import { useAuthStore } from '@/store/auth'
import { storeToRefs } from 'pinia'
import { toLocalISOString } from '@/utils'

const orgMetricsStore = useOrganizationMetricsStore()
const authStore = useAuthStore()

const { metrics, loading, error } = storeToRefs(orgMetricsStore)
const { fetchOrganizationDailyMetrics } = orgMetricsStore
const { organizationId: orgIdRef, user } = storeToRefs(authStore)

const organizationId = computed(() => orgIdRef.value || user.value?.organization_id || null)

const metricsOptions = ref([
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

const selectedMetrics = ref([])
const dateRange = ref(null)

const yMax = computed(() => {
  const m = metrics.value
  if (!m || !Array.isArray(m.datasets) || m.datasets.length === 0) {
    return 3
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
  if (!Number.isFinite(maxValue)) return 3
  return maxValue
})

const yMaxRounded = computed(() => Math.ceil((yMax.value + Number.EPSILON) * 10) / 10)

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
        label: function(context) {
          return context.dataset.label + ': ' + context.parsed.y.toFixed(2)
        }
      }
    },
    legend: {
      display: true,
      position: 'bottom',
      labels: { usePointStyle: true, padding: 20, font: { size: 12 } },
      align: 'start',
      fullWidth: true,
    },
  },
  elements: {
    point: { radius: 5, hoverRadius: 6, borderWidth: 2, backgroundColor: '#fff' },
    line: { borderWidth: 3, tension: 0.2 },
  },
  scales: {
    x: { grid: { color: 'rgba(0, 0, 0, 0.1)', lineWidth: 1 }, ticks: { font: { size: 11 } } },
    y: {
      beginAtZero: false,
      max: yMaxRounded.value,
      grid: { color: 'rgba(0, 0, 0, 0.1)', lineWidth: 1 },
      ticks: { stepSize: 0.1, callback: (value) => Number(value).toFixed(1), font: { size: 18 } },
    },
  },
  interaction: { mode: 'nearest', axis: 'x', intersect: false },
}))

function toRgba(color, alpha = 0.15) {
  if (typeof color !== 'string') return `rgba(99,102,241,${alpha})`
  const hex = color.trim()
  if (hex.startsWith('#')) {
    const clean = hex.replace('#', '')
    if (clean.length === 3) {
      const r = parseInt(clean[0] + clean[0], 16)
      const g = parseInt(clean[1] + clean[1], 16)
      const b = parseInt(clean[2] + clean[2], 16)
      return `rgba(${r}, ${g}, ${b}, ${alpha})`
    }
    if (clean.length === 6 || clean.length === 8) {
      const r = parseInt(clean.slice(0, 2), 16)
      const g = parseInt(clean.slice(2, 4), 16)
      const b = parseInt(clean.slice(4, 6), 16)
      return `rgba(${r}, ${g}, ${b}, ${alpha})`
    }
  }
  return color
}

const lineData = computed(() => {
  const m = metrics.value
  if (!m || !Array.isArray(m.labels) || !Array.isArray(m.datasets)) {
    return { labels: [], datasets: [] }
  }

  const enriched = m.datasets.map((dataset) => {
    const base = dataset.backgroundColor || '#409EFF'
    return {
      ...dataset,
      borderColor: base,
      backgroundColor: toRgba(base, 0.15),
      tension: 0.2,
      fill: true,
      pointBackgroundColor: base,
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: base,
    }
  })

  return { labels: m.labels, datasets: enriched }
})

const loadOrganizationMetrics = async () => {
  try {
    if (!organizationId.value || !dateRange.value?.[0] || !dateRange.value?.[1]) {
      return
    }
    if (!selectedMetrics.value || selectedMetrics.value.length === 0) {
      selectedMetrics.value = metricsOptions.value.map(m => m.value)
    }
    const params = {
      organization_id: organizationId.value,
      metric_types: selectedMetrics.value,
      start_date: toLocalISOString(dateRange.value[0]),
      end_date: toLocalISOString(dateRange.value[1]),
    }
    await fetchOrganizationDailyMetrics(params)
  } catch (e) {
    ElMessage.error('Ошибка при загрузке метрик организации')
  }
}

const refreshData = async () => {
  await loadOrganizationMetrics()
}

const onMetricsChange = () => {
  loadOrganizationMetrics()
}

const onDateChange = () => {
  loadOrganizationMetrics()
}

const disableExceptJuly2025 = (date) => {
  if (!(date instanceof Date)) return true
  const year = date.getFullYear()
  const month = date.getMonth()
  const day = date.getDate()
  return !(year === 2025 && month === 6 && day >= 1 && day <= 31)
}

onMounted(async () => {
  try {
    // Значения по умолчанию
    selectedMetrics.value = metricsOptions.value.map(m => m.value)
    dateRange.value = [
      new Date('2025-07-26T00:00:00'),
      new Date('2025-07-31T23:59:59'),
    ]
    await loadOrganizationMetrics()
  } catch (error) {
    ElMessage.error('Ошибка инициализации данных организации')
  }
})

watch(organizationId, async (id, prev) => {
  if (!id || id === prev) return
  await loadOrganizationMetrics()
})
</script>

<style lang="scss" scoped>

</style>