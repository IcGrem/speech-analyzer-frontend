<template>
  <el-header class="shadow-md bg-white border-b border-gray-200">
    <div class="flex items-center justify-between h-full px-6">
      <!-- Логотип/Название -->
      <div class="flex items-center">
        <h1 class="text-xl font-semibold text-gray-800"></h1>
      </div>

      <!-- Правая часть с информацией о пользователе -->
      <div class="flex items-center gap-4">
        <!-- Рендерим только когда auth готов -->
        <template v-if="authStore.ready">
          <!-- Информация о пользователе -->
          <div v-if="authStore.isAuthenticated" class="flex items-center gap-3">
            <el-avatar 
              :size="32" 
              :src="authStore.user?.avatar"
              class="bg-primary"
            >
              {{ authStore.userName.charAt(0).toUpperCase() }}
            </el-avatar>
            
            <div class="hidden md:block">
              <p class="text-sm font-medium text-gray-900">
                {{ authStore.userName }}
              </p>
              <p class="text-xs text-gray-500 capitalize">
                {{ authStore.userRole }}
              </p>
            </div>

            <!-- Выпадающее меню -->
            <el-dropdown @command="handleCommand" trigger="click">
              <el-button 
                link
                class="flex items-center gap-1"
                :loading="authStore.loading"
              >
                <el-icon><ArrowDown /></el-icon>
              </el-button>
              
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="profile">
                    <el-icon><User /></el-icon>
                    Профиль
                  </el-dropdown-item>
                  <el-dropdown-item divided command="logout">
                    <el-icon><SwitchButton /></el-icon>
                    Выйти
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>

          <!-- Кнопка входа для неавторизованных -->
          <div v-else class="flex items-center gap-2">
            <el-button 
              type="primary" 
              size="small"
              @click="$router.push('/login')"
            >
              Войти
            </el-button>
          </div>
        </template>
      </div>
    </div>
  </el-header>
</template>

<script setup>
import { useAuthStore } from '@/store/auth'
import { useRouter } from 'vue-router'
import { ElMessageBox, ElMessage } from 'element-plus'
import { 
  ArrowDown, 
  User, 
  SwitchButton 
} from '@element-plus/icons-vue'

const authStore = useAuthStore()
const router = useRouter()

const handleCommand = async (command) => {
  switch (command) {
    case 'profile':
      try {
        await router.push('/profile')
      } catch (error) {
        ElMessage.error('Не удалось открыть профиль')
      }
      break
      
    case 'logout':
      try {
        await ElMessageBox.confirm(
          'Вы уверены, что хотите выйти из системы?',
          'Подтверждение',
          {
            confirmButtonText: 'Выйти',
            cancelButtonText: 'Отмена',
            type: 'warning',
          }
        )
        
        await authStore.logout()
        ElMessage.success('Вы успешно вышли из системы')
        await router.push('/login')
      } catch (error) {
        if (error !== 'cancel') {
          ElMessage.error('Ошибка при выходе из системы')
        }
      }
      break
  }
}
</script>

<style lang="scss" scoped>
.el-header {
  height: 64px;
  line-height: 64px;
}

.el-dropdown-menu {
  .el-dropdown-item {
    display: flex;
    align-items: center;
    gap: 8px;
  }
}
</style>