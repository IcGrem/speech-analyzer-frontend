<template>
  <div class="data-loader">
    <!-- Состояние загрузки -->
    <div v-if="loading" class="loading-state">
      <div class="flex items-center justify-center p-8">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
        <span class="text-gray-600">{{ loadingText }}</span>
      </div>
    </div>
    
    <!-- Состояние ошибки -->
    <div v-else-if="error" class="error-state">
      <div class="flex flex-col items-center justify-center p-8 text-center">
        <div class="text-red-500 text-4xl mb-4">⚠️</div>
        <h3 class="text-lg font-semibold text-gray-700 mb-2">Ошибка загрузки</h3>
        <p class="text-gray-500 mb-4">{{ error }}</p>
        <el-button type="primary" @click="$emit('retry')" size="small">
          Попробовать снова
        </el-button>
      </div>
    </div>
    
    <!-- Состояние пустых данных -->
    <div v-else-if="!data || (Array.isArray(data) && data.length === 0)" class="empty-state">
      <div class="flex flex-col items-center justify-center p-8 text-center">
        <div class="text-gray-400 text-4xl mb-4">📭</div>
        <h3 class="text-lg font-semibold text-gray-700 mb-2">Нет данных</h3>
        <p class="text-gray-500 mb-4">{{ emptyText }}</p>
        <el-button v-if="showRefresh" type="primary" @click="$emit('refresh')" size="small">
          Обновить
        </el-button>
      </div>
    </div>
    
    <!-- Состояние с данными -->
    <div v-else class="data-content">
      <slot :data="data" />
    </div>
  </div>
</template>

<script setup>
defineProps({
  loading: {
    type: Boolean,
    default: false
  },
  error: {
    type: String,
    default: null
  },
  data: {
    type: [Array, Object],
    default: null
  },
  loadingText: {
    type: String,
    default: 'Загрузка данных...'
  },
  emptyText: {
    type: String,
    default: 'Данные отсутствуют'
  },
  showRefresh: {
    type: Boolean,
    default: true
  }
})

defineEmits(['retry', 'refresh'])
</script>

<style scoped>
.data-loader {
  min-height: 200px;
}

.loading-state,
.error-state,
.empty-state {
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style> 