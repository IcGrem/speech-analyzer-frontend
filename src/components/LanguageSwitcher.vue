<template>
  <div class="language-switcher">
    <el-dropdown @command="handleLanguageChange">
      <span class="el-dropdown-link">
        {{ currentLanguageLabel }}
        <el-icon class="el-icon--right">
          <arrow-down />
        </el-icon>
      </span>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item command="ru">
            🇷🇺 Русский
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { ArrowDown } from '@element-plus/icons-vue'
import { useLocalization } from '@/composables/useI18n'

const { locale, setLanguage } = useLocalization()

const currentLanguageLabel = computed(() => {
  const labels = {
    ru: '🇷🇺 Русский'
  }
  return labels[locale.value] || labels.ru
})

const handleLanguageChange = (lang) => {
  setLanguage(lang)
}
</script>

<style lang="scss" scoped>
.language-switcher {
  .el-dropdown-link {
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 8px 12px;
    border-radius: 4px;
    transition: background-color 0.3s;
    
    &:hover {
      background-color: var(--el-fill-color-light);
    }
  }
}
</style> 