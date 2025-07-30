<template>
  <div 
    id="loading" 
    class="loading-overlay fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
    style="display: none;"
  >
    <div class="loading-content bg-white bg-opacity-90 backdrop-blur-sm rounded-xl p-4 flex items-center space-x-3 shadow-lg border border-gray-200">
      <div class="loading-spinner animate-spin rounded-full h-6 w-6 border-2 border-gray-300 border-t-blue-600"></div>
      <span class="text-gray-700 text-sm font-medium">Загрузка...</span>
    </div>
  </div>
</template>

<script setup>
// Компонент для отображения индикатора загрузки
</script>

<style scoped>
.loading-overlay {
  transition: opacity 0.2s ease-in-out;
}

.loading-content {
  animation: loadingPulse 2s ease-in-out infinite;
}

.loading-spinner {
  animation: spin 1s linear infinite;
}

@keyframes loadingPulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style> 