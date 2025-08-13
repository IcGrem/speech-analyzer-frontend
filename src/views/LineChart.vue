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

const daysCount = 7
const labels = Array.from({ length: daysCount }, (_, i) => {
  const d = new Date()
  d.setDate(d.getDate() - (daysCount - 1 - i))
  return d.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' })
})

const users = [
  'Иван Иванов',
  'Пётр Петров',
  'Анна Смирнова',
  'Ольга Кузнецова',
  'Сергей Соколов',
  'Мария Морозова',
]

const userColors = [
  { bg: 'rgba(99,102,241,01)', border: 'rgba(99,102,241,1)' },
  { bg: 'rgba(248,113,113,0.5)', border: 'rgba(248,113,113,1)' },
  { bg: 'rgba(34,197,94,0.5)', border: 'rgba(34,197,94,1)' },
  { bg: 'rgba(251,191,36,0.5)', border: 'rgba(251,191,36,1)' },
  { bg: 'rgba(6,182,212,0.5)', border: 'rgba(6,182,212,1)' },
  { bg: 'rgba(168,85,247,0.5)', border: 'rgba(168,85,247,1)' },
]

const randomFloat = (min, max, decimals = 1) => {
  const val = Math.random() * (max - min) + min
  const factor = Math.pow(10, decimals)
  return Math.round(val * factor) / factor
}

const datasets = users.map((name, idx) => ({
  label: name,
  data: Array.from({ length: daysCount }, () => randomFloat(0, 5, 1)),
  backgroundColor: userColors[idx % userColors.length].bg,
  borderColor: userColors[idx % userColors.length].border,
  borderWidth: 1,
  borderRadius: 4,
}))

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: true, position: 'bottom' },
    title: { display: true, text: '' },
  },
  scales: {
    x: { stacked: true },
    y: {
      stacked: false,
      min: 0,
      max: 5,
      ticks: { stepSize: 0.5 },
    },
  },
}

const barData = {
  labels,
  datasets,
}
</script>

<style lang="scss" scoped>

</style>