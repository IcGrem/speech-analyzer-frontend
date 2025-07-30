<template>
  <div>
    <div class="flex flex-col">
      <div class="flex items-center text-xl" v-for="item in menu" :key="item.path">
        <router-link :to="item.path" custom v-slot="{ href, navigate, isActive, isExactActive }">
          <el-tooltip
            v-if="props.isCollapsed"
            :content="item.name"
            placement="right"
            :show-after="300"
            :hide-after="0"
            popper-class="menu-tooltip"
          >
            <a
              :href="href"
              @click="navigate"
              class="block transition-all duration-300 ease-in-out flex items-center gap-3"
              :class="[
                getMenuClass(item, isActive, isExactActive),
                props.isCollapsed ? 'w-[80px] justify-center p-2' : 'w-full px-4 py-3 justify-start'
              ]"
            >
              <div class="flex-shrink-0 w-6 h-6 flex items-center justify-center">
                <component
                  v-if="item.icon && !item.customIcon && !item.svgIcon"
                  :is="item.icon"
                  class="w-5 h-5 transition-colors duration-300"
                  :class="isActive || isExactActive ? 'text-[var(--el-color-primary)]' : 'text-gray-500'"
                />
                <CustomIcons
                  v-else-if="item.customIcon"
                  :name="item.customIcon"
                  icon-class="w-5 h-5 transition-colors duration-300"
                />
                <div
                  v-else-if="item.svgIcon"
                  v-html="item.svgIcon"
                  class="w-5 h-5 transition-colors duration-300"
                  :class="isActive || isExactActive ? 'text-[var(--el-color-primary)]' : 'text-gray-500'"
                />
              </div>
              
              <span
                v-if="!props.isCollapsed"
                class="flex-1 transition-all duration-300 ease-in-out whitespace-nowrap overflow-hidden text-ellipsis"
                style="max-width: 280px;"
              >
                {{ item.name }}
              </span>
            </a>
          </el-tooltip>
          
          <!-- Для развернутого сайдбара без тултипа -->
          <a
            v-else
            :href="href"
            @click="navigate"
            class="block transition-all duration-300 ease-in-out flex items-center gap-3"
            :class="[
              getMenuClass(item, isActive, isExactActive),
              'w-full px-4 py-3 justify-start'
            ]"
          >
            <div class="flex-shrink-0 w-6 h-6 flex items-center justify-center">
              <component
                v-if="item.icon && !item.customIcon && !item.svgIcon"
                :is="item.icon"
                class="w-5 h-5 transition-colors duration-300"
                :class="isActive || isExactActive ? 'text-[var(--el-color-primary)]' : 'text-gray-500'"
              />
              <CustomIcons
                v-else-if="item.customIcon"
                :name="item.customIcon"
                icon-class="w-5 h-5 transition-colors duration-300"
              />
              <div
                v-else-if="item.svgIcon"
                v-html="item.svgIcon"
                class="w-5 h-5 transition-colors duration-300"
                :class="isActive || isExactActive ? 'text-[var(--el-color-primary)]' : 'text-gray-500'"
              />
            </div>
            
            <span class="flex-1 transition-all duration-300 ease-in-out whitespace-nowrap overflow-hidden text-ellipsis" style="max-width: 280px;">
              {{ item.name }}
            </span>
          </a>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import CustomIcons from './icons/CustomIcons.vue'

const props = defineProps({
  menu: {
    type: Array,
    required: true
  },
  isCollapsed: {
    type: Boolean,
    default: false
  }
})

function getMenuClass(item, isActive, isExactActive) {
  if (item.path === '/') {
    return isExactActive 
      ? `bg-[var(--el-color-primary-light-9)] border-r-4 border-[var(--el-color-primary)] text-[var(--el-color-primary)] font-bold` 
      : `text-gray-600 hover:bg-gray-100`
  }
  return isActive 
    ? `bg-[var(--el-color-primary-light-9)] border-r-4 border-[var(--el-color-primary)] text-[var(--el-color-primary)] font-bold` 
    : `text-gray-600 hover:bg-gray-100`
}
</script>

<style lang="scss" scoped>
// Дополнительные стили для иконок
a {
  &:hover {
    .w-5.h-5 {
      transform: scale(1.1);
      transition: transform 0.2s ease;
    }
  }
}

// Предотвращаем прыжки при анимации
.flex {
  min-height: 48px; // Фиксированная высота для пунктов меню
}

// Плавные переходы для всех элементов
* {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}
</style>

