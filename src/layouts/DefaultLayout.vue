<template>
  <div class="h-screen overflow-hidden">
    <el-container class="h-full is-vertical">
      <AppHeader />
      <el-container>
        <AppSidebar :menu="menu" />
        <el-main class="transition-all duration-300">
          <router-view v-slot="{ Component, route }">
            <transition
              :name="route.meta?.transition || 'fade'"
              mode="out-in"
              appear
            >
              <component :is="Component" :key="route.path" />
            </transition>
          </router-view>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/store/auth'
import { STORAGE_KEYS } from '@/constants'
import { ElNotification } from 'element-plus'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const menu = [
  {
    name: 'Общие показатели',
    path: '/',
    customIcon: 'analytics'
  },
  {
    name: 'Динамика метрик',
    path: '/about',
    customIcon: 'dashboard'
  },
  {
    name: 'Метрики по сотрудникам',
    path: '/bar',
    customIcon: 'chart'
  },
  {
    name: 'Словари по сотрудникам',
    path: '/line',
    customIcon: 'calendar'
  },
  {
    name: 'Анализ диалогов',
    path: '/pie',
    customIcon: 'favorite'
  },
  {
    name: 'Словари',
    path: '/dictionaries',
    customIcon: 'book'
  }
]
</script>

<style lang="scss" scoped>
// Плавная анимация fade
.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

// Анимация slide-left
.slide-left-enter-active,
.slide-left-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-left-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.slide-left-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}

// Анимация slide-right
.slide-right-enter-active,
.slide-right-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-right-enter-from {
  opacity: 0;
  transform: translateX(-30px);
}

.slide-right-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style>