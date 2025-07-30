<template>
  <PageWrapper title="Динамика метрики по сотрудникам по дням">
    <el-row class="pb-8" :gutter="20">
      <el-col :span="24">
        <div class="w-full h-[600px] flex justify-center items-center">
          <Line style="width: 100%;" :data="lineData" :options="chartOptions" />
        </div>
      </el-col>
    </el-row>
  </PageWrapper>
</template>

<script setup>
import { Line } from 'vue-chartjs'
import { Chart, registerables } from 'chart.js'
Chart.register(...registerables)

const chartOptions = {
  responsive: true,
  maintainAspectRatio: true,
  plugins: {
    datalabels: {
      display: true,
    },
    tooltip: {
      mode: 'index',
      intersect: false,
    },
    legend: {
      display: true,
      position: 'bottom',
      labels: {
        usePointStyle: true,
      },
      align: 'start',
      fullWidth: true
    },
    title: {
      display: true,
      text: '',
    },
  },
  elements: {
    bar: {
      borderWidth: 10,
      borderRadius: 10
    },
  },
  scales: {
    y: {
      beginAtZero: true,
    },
  },

}


const lineData = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
  datasets: [
    { label: 'Продажи', data: [40, 20, 12, 39, 10], borderColor: '#6366f1', backgroundColor: 'rgba(99,102,241,0.2)', fill: true },
    { label: 'Покупки', data: [10, 30, 15, 22, 18], borderColor: '#f87171', backgroundColor: 'rgba(248,113,113,0.2)', fill: true },
    { label: 'Прибыль', data: [20, 10, 5, 15, 8], borderColor: '#fbbf24', backgroundColor: 'rgba(251,191,36,0.2)', fill: true }
  ]
}
</script>

<style lang="scss" scoped>

</style>