<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50">
    <div class="text-center">
      <div class="text-6xl font-bold text-gray-300 mb-4">404</div>
      <h1 class="text-2xl font-semibold text-gray-700 mb-4">Страница не найдена</h1>
      <p class="text-gray-500 mb-8">Запрашиваемая страница не существует или была перемещена</p>
      <el-button type="primary" @click="goHome" size="large">
        Вернуться на главную
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const goHome = () => {
  router.push('/')
}
</script> 