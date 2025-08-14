<template>
  <PageWrapper title="Динамика метрик по диалогам">
    <div class="max-w-full mx-auto h-[500px]">
      <Bar :data="barData" :options="chartOptions" />
    </div>
  </PageWrapper>
</template>

<script setup>

import { Bar } from 'vue-chartjs'
import { Chart, registerables } from 'chart.js'
Chart.register(...registerables)

// Метрики для оси X
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
const labels = metrics.map(m => m.label)
const metricCount = labels.length

const users = [
  'Иван Иванов',
  'Пётр Петров',
  'Анна Смирнова',
  'Ольга Кузнецова',
  'Сергей Соколов',
  'Мария Морозова',
]

// ОПАКНЫЕ цвета (без прозрачности)
const userColors = [
  { bg: 'rgba(99,102,241,1)', border: '#ffffff' },
  { bg: 'rgba(248,113,113,1)', border: '#ffffff' },
  { bg: 'rgba(34,197,94,1)', border: '#ffffff' },
  { bg: 'rgba(251,191,36,1)', border: '#ffffff' },
  { bg: 'rgba(6,182,212,1)', border: '#ffffff' },
  { bg: 'rgba(168,85,247,1)', border: '#ffffff' },
]

const randomFloat = (min, max, decimals = 1) => {
  const val = Math.random() * (max - min) + min
  const factor = Math.pow(10, decimals)
  return Math.round(val * factor) / factor
}

// Каждая серия (пользователь) содержит значения по всем метрикам
const datasets = users.map((name, idx) => ({
  label: name,
  data: Array.from({ length: metricCount }, () => randomFloat(0, 5, 1)),
  backgroundColor: userColors[idx % userColors.length].bg,
  borderColor: userColors[idx % userColors.length].border,
  borderWidth: 2,
  borderSkipped: false,
  borderRadius: 2,
  stack: 'total',
}))

// Динамический максимум по сумме сегментов для каждой метрики
const stackedMax = (() => {
  const sums = Array(labels.length).fill(0)
  for (const ds of datasets) {
    ds.data.forEach((v, i) => {
      const num = typeof v === 'number' ? v : parseFloat(v)
      if (!Number.isNaN(num)) sums[i] += num
    })
  }
  const max = Math.max(...sums)
  return Math.ceil((max + Number.EPSILON) * 10) / 10
})()

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
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
      suggestedMax: stackedMax,
      ticks: { stepSize: 0.5 },
    },
  },
  interaction: { mode: 'nearest', intersect: true },
  datasets: {
    bar: {
      barPercentage: 0.8,
      categoryPercentage: 0.6,
    }
  }
}

const barData = {
  labels,
  datasets,
}
</script>

<style lang="scss" scoped>

</style>