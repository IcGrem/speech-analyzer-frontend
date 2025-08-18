<template>
  <PageWrapper title="Общие показатели за отчетный период">
    <el-row class="pb-8" :gutter="20">
      <el-col :span="6">
        <div class="flex flex-col gap-4 justify-center h-full">
          <div class="p-4 rounded-2xl bg-white shadow-md flex items-center flex-col justify-center h-[180px]">
            <div class="text-sm text-gray-500">{{ overallTile?.title || 'Итоговая оценка' }}</div>
            <div class="text-4xl font-semibold text-gray-800" v-if="!metricsLoading && overallTile && overallTile.score !== null">{{ formatDecimal(overallTile.score) }}</div>
            <el-skeleton v-else animated :rows="1" style="width: 120px" />
          </div>
        </div>
      </el-col>
      <el-col :span="18">
        <div class="w-full h-[450px] flex justify-center items-center">
          <template v-if="!metricsLoading">
            <Line style="width: 100%;" :data="chartData" :options="chartOptions" />
          </template>
          <template v-else>
            <el-skeleton animated :rows="6" style="width: 100%" />
          </template>
        </div>
        <el-alert v-if="metricsError" class="mt-4" type="error" :closable="false" show-icon :title="metricsError" />
      </el-col>
    </el-row>

    <el-row :gutter="20">
      <template v-if="!metricsLoading">
        <el-col class="mb-4" v-for="item in bottomTiles" :key="item.key" :span="8">
          <div class="p-4 rounded-2xl bg-white shadow-md flex items-center flex-col justify-center h-[180px]">
            <div class="text-sm text-gray-500 text-center">{{ item.title }}</div>
            <div class="text-3xl font-semibold text-gray-800">{{ formatDecimal(item.score) }}</div>
          </div>
        </el-col>
      </template>
      <template v-else>
        <el-col v-for="i in 6" :key="i" :span="8" class="mb-4">
          <div class="p-4 rounded-2xl bg-white shadow-md h-[180px]">
            <el-skeleton animated :rows="2" />
          </div>
        </el-col>
      </template>
    </el-row>
  </PageWrapper>
</template>

<script setup>
import { computed, watch } from 'vue'
import { Line } from 'vue-chartjs'
import { useAuthStore } from '@/store/auth'
import { useOrganizationMetricsStore } from '@/store/organizationMetrics'
import { storeToRefs } from 'pinia'
import { METRIC_TILES_ORDER } from '@/constants'
import { formatDecimal } from '@/utils'

const authStore = useAuthStore()
const organizationMetricsStore = useOrganizationMetricsStore()

// Рефы стора
const { metrics, averageScores, loading: metricsLoading, error: metricsError } = storeToRefs(organizationMetricsStore)
const { organizationId, user } = storeToRefs(authStore)

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

// Данные для графика
const chartData = computed(() => {
  const g = metrics.value || { labels: [], datasets: [] }
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

// Источник средних значений от бэка
const averageScoresSrc = computed(() => averageScores.value || null)

// Плашка слева: итоговая оценка
const overallTile = computed(() => {
  const src = averageScoresSrc.value
  if (!src) return null
  const v = src.overall_score
  return { key: 'overall_score', title: v?.title || 'Итоговая оценка', score: v?.score ?? null }
})

// Нижние плашки согласно константе
const bottomTiles = computed(() => {
  const src = averageScoresSrc.value
  if (!src) return []
  return METRIC_TILES_ORDER
    .filter(k => src[k])
    .map(k => ({ key: k, title: src[k]?.title || k, score: src[k]?.score ?? null }))
})

// Реактивный orgId и единоразовая загрузка
const orgId = computed(() => organizationId.value || user.value?.organization_id || sessionStorage.getItem('organizationId') || null)

watch(orgId, async (id, _prev, onCleanup) => {
  if (!id) return
  let cancelled = false
  onCleanup(() => { cancelled = true })
  try {
    await organizationMetricsStore.fetchOrganizationAverageMetrics({ organization_id: id })
  } finally {
    if (cancelled) return
  }
}, { immediate: true })
</script>

<style lang="scss" scoped>

</style>