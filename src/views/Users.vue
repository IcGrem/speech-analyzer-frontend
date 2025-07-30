<template>
  <div class="p-8">
    <h2 class="text-2xl font-bold mb-6">Пользователи</h2>
    
    <DataLoader
      :loading="loading"
      :error="error"
      :data="users"
      loading-text="Загрузка пользователей..."
      empty-text="Пользователи не найдены"
      @retry="loadUsers"
      @refresh="loadUsers"
    >
      <template #default="{ data }">
        <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <el-card
            v-for="user in data"
            :key="user.id"
            class="user-card"
            shadow="hover"
          >
            <div class="flex items-center space-x-4">
              <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <span class="text-blue-600 font-semibold text-lg">
                  {{ user.name.charAt(0).toUpperCase() }}
                </span>
              </div>
              <div class="flex-1">
                <h3 class="font-semibold text-gray-900">{{ user.name }}</h3>
                <p class="text-sm text-gray-500">{{ user.email }}</p>
                <p class="text-xs text-gray-400">{{ user.role }}</p>
              </div>
              <el-tag :type="user.status === 'active' ? 'success' : 'warning'" size="small">
                {{ user.status === 'active' ? 'Активен' : 'Неактивен' }}
              </el-tag>
            </div>
          </el-card>
        </div>
        <p>user</p>
      </template>
    </DataLoader>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import DataLoader from '@/components/DataLoader.vue'
import { useData } from '@/composables/useData.js'

// Моковые данные для демонстрации
const mockUsers = [
  { id: 1, name: 'Иван Петров', email: 'ivan@example.com', role: 'Администратор', status: 'active' },
  { id: 2, name: 'Мария Сидорова', email: 'maria@example.com', role: 'Менеджер', status: 'active' },
  { id: 3, name: 'Алексей Козлов', email: 'alex@example.com', role: 'Пользователь', status: 'inactive' },
  { id: 4, name: 'Елена Волкова', email: 'elena@example.com', role: 'Менеджер', status: 'active' },
  { id: 5, name: 'Дмитрий Соколов', email: 'dmitry@example.com', role: 'Пользователь', status: 'active' },
  { id: 6, name: 'Анна Морозова', email: 'anna@example.com', role: 'Администратор', status: 'inactive' }
]

// Функция для загрузки пользователей (в будущем заменится на API)
const loadUsersApi = async () => {
  // Имитируем задержку сети
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  // Имитируем ошибку (раскомментируйте для тестирования)
  // throw new Error('Ошибка загрузки пользователей')
  
  return { data: mockUsers }
}

const { data: users, loading, error, load: loadUsers } = useData(loadUsersApi, {
  autoLoad: true,
  onSuccess: (data) => {
    console.log('Пользователи загружены:', data)
  },
  onError: (error) => {
    console.error('Ошибка загрузки пользователей:', error)
  }
})
</script>

<style scoped>
.user-card {
  transition: transform 0.2s ease-in-out;
}

.user-card:hover {
  transform: translateY(-2px);
}
</style> 