<template>
  <el-config-provider>
    <LoadingIndicator />
    <router-view />
  </el-config-provider>
</template>

<script setup>
import { ref } from 'vue'
const theme = ref({
  colorPrimary: '#8f18ad',
  colorWarning: '#ff4949'
})
</script>

<style>
:root {
  --el-color-primary: #8f18ad;
  --el-color-warning: #ff4949;
}
/* Стили через Tailwind */
</style>
