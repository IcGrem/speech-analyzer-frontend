<template>
  <div class="relative h-full">
    <el-aside :width="isCollapsed ? '80px' : '360px'" class="shadow-md transition-all duration-300 ease-in-out h-full">
      <!-- Кнопка сворачивания -->
      <el-tooltip
        :content="isCollapsed ? 'Развернуть меню' : 'Свернуть меню'"
        placement="left"
        :show-after="300"
        :hide-after="0"
        popper-class="menu-tooltip"
      >
        <button 
          @click="toggleCollapse"
          class="flex items-center justify-center p-2 rounded-full shadow-md bg-white hover:shadow-lg transition-all duration-200 absolute top-[50%] translate-y-[-50%] right-[-25px] w-[50px] h-[50px] cursor-pointer z-10"
        >
          <svg 
            width="20" 
            height="20" 
            viewBox="0 0 24 24" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            class="transition-transform duration-300 ease-in-out"
            :class="isCollapsed ? 'rotate-180' : ''"
          >
            <path d="M15 19L8 12L15 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </el-tooltip>

      <div class="flex flex-col h-full justify-between">
        <!-- Меню -->
        <div class="flex-1 overflow-hidden">
          <MainMenu :menu="menu" :is-collapsed="isCollapsed" />
        </div>
        <!-- Переключатель темы -->
        <!-- <div class="px-4 py-2 border-t border-gray-200">
          <ThemeToggle />
        </div> -->

        <!-- Кнопка выхода -->
        <el-tooltip
          v-if="isCollapsed"
          content="Выйти"
          placement="right"
          :show-after="300"
          :hide-after="0"
          popper-class="menu-tooltip"
        >
          <div
            @click="confirmExit"
            class="border-t border-gray-200 text-gray-500 flex items-center gap-3 cursor-pointer hover:bg-gray-100 transition-all duration-200 w-[80px] justify-center p-2"
          >
            <div class="flex-shrink-0 w-6 h-6 flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 transition-colors duration-300">
                <path d="M9.60034 23.1001H3.30037C2.66386 23.1001 2.05341 22.8403 1.60333 22.3777C1.15325 21.9151 0.900391 21.2877 0.900391 20.6335V3.36681C0.900391 2.71261 1.15325 2.08521 1.60333 1.62262C2.05341 1.16003 2.66386 0.900146 3.30037 0.900146H9.60034" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M17.1006 17.9999L23.1005 12L17.1006 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M23.0996 12H8.69971" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
          </div>
        </el-tooltip>

        <!-- Кнопка выхода для развернутого сайдбара -->
        <div
          v-else
          @click="confirmExit"
          class="border-t border-gray-200 text-gray-500 flex items-center gap-3 cursor-pointer hover:bg-gray-100 transition-all duration-200 w-full px-4 py-3 justify-start"
        >
          <div class="flex-shrink-0 w-6 h-6 flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 transition-colors duration-300">
              <path d="M9.60034 23.1001H3.30037C2.66386 23.1001 2.05341 22.8403 1.60333 22.3777C1.15325 21.9151 0.900391 21.2877 0.900391 20.6335V3.36681C0.900391 2.71261 1.15325 2.08521 1.60333 1.62262C2.05341 1.16003 2.66386 0.900146 3.30037 0.900146H9.60034" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M17.1006 17.9999L23.1005 12L17.1006 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M23.0996 12H8.69971" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <span class="transition-all duration-300 ease-in-out whitespace-nowrap">Выйти</span>
        </div>
      </div>
    </el-aside>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/store/auth'
import { ElMessageBox } from 'element-plus'

const props = defineProps({
  menu: {
    type: Array,
    required: true
  }
})

const emit = defineEmits(['confirmExit'])
const router = useRouter()
const authStore = useAuthStore()

const isCollapsed = ref(false)

// Загружаем состояние из localStorage при монтировании
onMounted(() => {
  const savedState = localStorage.getItem('sidebarCollapsed')
  if (savedState !== null) {
    try {
      isCollapsed.value = JSON.parse(savedState)
    } catch (error) {
      isCollapsed.value = false
    }
  }
})

const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value
  // Сохраняем состояние в localStorage
  localStorage.setItem('sidebarCollapsed', JSON.stringify(isCollapsed.value))
}

const confirmExit = async () => {
  try {
    await ElMessageBox.confirm(
      'Вы уверены, что хотите выйти из системы?',
      'Подтверждение выхода',
      {
        confirmButtonText: 'Выйти',
        cancelButtonText: 'Отмена',
        type: 'warning',
      }
    )
    
    // Выполняем логаут
    await authStore.logout()
    
    // Перенаправляем на страницу логина
    await router.push('/login')
    
    emit('confirmExit')
  } catch (error) {
    if (error !== 'cancel') {
      // Покажем дружелюбное сообщение, не логируя в консоль
      ElMessageBox.alert('Ошибка при выходе', 'Ошибка', { type: 'error' })
    }
  }
}
</script>

<style lang="scss" scoped>
</style>