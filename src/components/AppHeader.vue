<template>
  <el-header class="shadow-md">
    <div class="flex items-center justify-between h-full">
      <div class="flex items-center gap-4">
        <h1 class="text-xl font-semibold">{{ $t('navigation.home') }}</h1>
      </div>
      <div class="flex items-center gap-4">
        <!-- <LanguageSwitcher />
        <ThemeToggle /> -->
      </div>
    </div>
  </el-header>
</template>

<script setup>
import LanguageSwitcher from './LanguageSwitcher.vue'
import ThemeToggle from './ThemeToggle.vue'
</script>

<style lang="scss" scoped>

</style>