<template>
  <PageWrapper title="Динамика метрик по диалогам">
    <div class="max-w-full mx-auto h-[500px]"><Bar :data="barData" :options="chartOptions" /></div>
  </PageWrapper>
</template>

<script setup>

import { Bar } from 'vue-chartjs'
import { Chart, registerables } from 'chart.js'
Chart.register(...registerables)

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: true,
      position: 'right',
    },
    title: {
      display: true,
      text: '',
    },
  }, }

const barData = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  datasets: [
    { label: 'Продажи', data: [40, 20, 12, 39, 10], backgroundColor: '#6366f1' },
    { label: 'Покупки', data: [10, 30, 15, 22, 18], backgroundColor: '#f87171' },
    { label: 'Прибыль', data: [20, 10, 5, 15, 8], backgroundColor: '#fbbf24' }
  ]
}
</script>

<style lang="scss" scoped>

</style>