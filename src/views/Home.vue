<template>
  <PageWrapper title="Общие показатели за день">
    <el-row class="pb-8" :gutter="20">
      <el-col :span="6">
        <div class="flex flex-col gap-4 justify-center h-full">
          <div class="p-4 rounded-2xl bg-white shadow-md flex items-center flex-col justify-center h-[180px]"></div>
        </div>
      </el-col>
      <el-col :span="18">
        <div class="w-full h-[300px] flex justify-center items-center">
          <Line style="width: 100%;" :data="lineData" :options="chartOptions" />
        </div>
      </el-col>
    </el-row>
    <el-row :gutter="20">
      <el-col class="mb-4" v-for="i in 8" :span="6">
        <div class="p-4 rounded-2xl bg-white shadow-md flex items-center flex-col justify-center h-[180px]"></div>
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
  plugins: {
    legend: {
      display: true,
      position: 'right',
    },
    title: {
      display: true,
      text: 'Динамика показателей',
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