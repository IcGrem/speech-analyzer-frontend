<template>
  <div class="p-6">
    <PageTitle title="Профиль пользователя" />
    
    <!-- Информация о пользователе -->
    <div v-if="authStore.isAuthenticated" class="mb-6">
      <el-card class="mb-4">
        <template #header>
          <div class="flex items-center gap-3">
            <el-avatar :size="48" :src="authStore.user?.avatar">
              {{ authStore.userName.charAt(0).toUpperCase() }}
            </el-avatar>
            <div>
              <h3 class="text-lg font-semibold">Добро пожаловать!</h3>
              <p class="text-gray-600">Вы авторизованы в системе</p>
            </div>
          </div>
        </template>
        
        <div class="space-y-3">
          <div class="flex justify-between">
            <span class="text-gray-600">Имя пользователя:</span>
            <span class="font-medium">{{ authStore.userName }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600">Роль:</span>
            <el-tag :type="authStore.isAdmin ? 'danger' : 'primary'" size="small">
              {{ authStore.userRole }}
            </el-tag>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600">Статус:</span>
            <el-tag type="success" size="small">Авторизован</el-tag>
          </div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from '@/store/auth'
import { DataAnalysis, User, Setting } from '@element-plus/icons-vue'
import PageTitle from '@/components/PageTitle.vue'

const authStore = useAuthStore()
</script>

<style scoped>
.el-card {
  transition: transform 0.2s, box-shadow 0.2s;
}

.el-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}
</style> 