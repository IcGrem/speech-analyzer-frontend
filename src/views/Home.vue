<template>
  <PageWrapper title="Общие показатели за отчетный период">
    <el-row class="pb-8" :gutter="20">
      <el-col :span="6">
        <div class="flex flex-col gap-4 justify-center h-full">
          <div class="p-4 rounded-2xl bg-white shadow-md flex items-center flex-col justify-center h-[180px]">
            <div class="text-sm text-gray-500">Итоговая оценка</div>
            <div class="text-4xl font-semibold text-gray-800" v-if="overallScore !== null">{{ overallScore }}</div>
            <el-skeleton v-else animated :rows="1" style="width: 120px" />
          </div>
        </div>
      </el-col>
      <el-col :span="18">
        <div class="w-full h-[450px] flex justify-center items-center">
          <Line style="width: 100%;" :data="chartData" :options="chartOptions" />
        </div>
      </el-col>
    </el-row>
    <el-row :gutter="20">
      <el-col class="mb-4" v-for="item in otherScores" :key="item.title" :span="6">
        <div class="p-4 rounded-2xl bg-white shadow-md flex items-center flex-col justify-center h-[180px]">
          <div class="text-sm text-gray-500 text-center">{{ item.title }}</div>
          <div class="text-3xl font-semibold text-gray-800">{{ item.score }}</div>
        </div>
      </el-col>
    </el-row>
  </PageWrapper>
</template>

<script setup>
import { onMounted, computed } from 'vue'
import { Line } from 'vue-chartjs'
import { Chart, registerables } from 'chart.js'
Chart.register(...registerables)
import { useAuthStore } from '@/store/auth'
import { useOrganizationStore } from '@/store/organization'
import { useEmployeeStore } from '@/store/employees'
import { useOrganizationMetricsStore } from '@/store/organizationMetrics'

const authStore = useAuthStore()
const organizationStore = useOrganizationStore()
const employeeStore = useEmployeeStore()
const organizationMetricsStore = useOrganizationMetricsStore()

const chartOptions = {
  responsive: true,
  plugins: {
    legend: {
      display: false,
      position: 'bottom',
    },
    title: {
      display: false,
      text: '',
    },
  },
  scales: {
    y: {
      beginAtZero: false,
    },
  },
}

// Трансформируем данные из стора под формат Line chart
const chartData = computed(() => {
  const g = organizationMetricsStore.metrics || { labels: [], datasets: [] }
  const datasets = Array.isArray(g.datasets)
    ? g.datasets.map(ds => ({
        ...ds,
        borderColor: ds.borderColor || ds.backgroundColor || '#6366f1',
        backgroundColor: ds.backgroundColor || 'rgba(99,102,241,0.2)',
        tension: 0.3,
        fill: false,
      }))
    : []
  return { labels: g.labels || [], datasets }
})

// Плашки
const averageScoresArray = computed(() => {
  const src = organizationMetricsStore.averageScores || null
  if (!src) return []
  // Преобразуем объект в массив { title, score, key }
  return Object.entries(src).map(([key, val]) => ({ key, title: val?.title || key, score: val?.score ?? null }))
})

const overallScore = computed(() => {
  const found = averageScoresArray.value.find(i => i.key === 'overall_score')
  return found?.score ?? null
})

const otherScores = computed(() => averageScoresArray.value.filter(i => i.key !== 'overall_score'))

function getFirstOrganizationId() {
  const orgs = organizationStore.organizations
  const list = Array.isArray(orgs?.data) ? orgs.data : Array.isArray(orgs) ? orgs : []
  const first = list && list.length > 0 ? list[0] : null
  if (!first) return null
  return first.id || first.uuid || first.organization_id || first._id || null
}

// Дефолтный диапазон: последние 7 дней июля 2025 (25.07.2025 - 31.07.2025)
const DEFAULT_START = '2025-07-25'
const DEFAULT_END = '2025-07-31'

onMounted(async () => {
  await authStore.checkAuthentication()
  await organizationStore.fetchOrganizations()
  await employeeStore.fetchEmployees()

  const orgId = getFirstOrganizationId()
  if (orgId) {
    await organizationMetricsStore.fetchOrganizationAverageMetrics({ 
      organization_id: orgId,
      start_date: DEFAULT_START,
      end_date: DEFAULT_END,
    })
  }
})
</script>

<style lang="scss" scoped>

</style>