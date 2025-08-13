<template>
  <PageWrapper :title="$t('pages.pieChart.title')">
    <el-row :gutter="20">
      <el-col :span="20">
        <el-table
          ref="multipleTableRef"
          :data="users"
          style="width: 100%"
          v-loading="loading"
        >
          <el-table-column
            v-for="item in tableHeader"
            :property="item.property"
            :width="item.width"
            :label="item.label"
            :sortable="item.sortable"
            :align="item.align"
            show-overflow-tooltip
          >
            <template #default="{row}">
              <span v-if="item.property === 'role'">
                <p class="text-blue-600">{{ row.role }}</p>
              </span>
              <span v-else>
                {{ row[item.property] }}
              </span>
            </template>
          </el-table-column>
          <template #empty>
            <p class="table__empty-text">{{ $t('common.empty') }}</p>
          </template>
        </el-table>
        <div class="flex items-center justify-center mt-4">
          <el-pagination
            size="small"
            background
            layout="prev, pager, next"
            :total="50"
            class="mt-4"
          />
        </div>
      </el-col>
      <el-col :span="4">
        <div class="flex flex-col gap-4">
          <div class="p-4 rounded-2xl bg-white shadow-md flex items-center flex-col justify-center h-[200px]">
            <transition name="cloud-fade" appear>
              <vue-word-cloud
                style="height: 100%; width: 100%;"
                :words="wordCloudData"
                :font-size-ratio="4"
                :color="([, weight]) => weight > 5 ? 'red' : 'blue'"
                font-family="Arial"
                class="word-cloud-container"
                :rotation="rotation"
                @word-click="handleWordClick"
              />
            </transition>
          </div>
          <div class="p-4 rounded-2xl bg-white shadow-md flex items-center flex-col justify-center h-[200px]">
            <transition name="cloud-fade" appear>
              <vue-word-cloud
                style="height: 100%; width: 100%;"
                :words="wordCloudData"
                :animation-duration="3000"
                :animation-overlap="5"
                :font-size-ratio="4"
                :color="([, weight]) => weight > 5 ? 'red' : 'blue'"
                font-family="Arial"
                class="word-cloud-container"
                :rotation="rotation"
                @word-click="handleWordClick"
              >
                <template #default="{text, weight, word}">
                  <div :title="weight" style="cursor: pointer;" @click="handleWordClick(word, weight)">
                    {{ text }}
                  </div>
                </template>
              </vue-word-cloud>
            </transition>
          </div>
          {{ wordText }}
        </div>
      </el-col>
    </el-row>
  </PageWrapper>
</template>

<script setup>
import PageWrapper from '@/components/PageWrapper.vue'
import { ref, computed } from 'vue'
import { useLocalization } from '@/composables/useI18n'
const loading = ref(false)

const { t } = useLocalization()

const tableHeader = computed(() => [
  {property:'first_name', label: t('pages.pieChart.date'), sortable: true, width: "" },
  {property:'last_name', label: t('pages.pieChart.employee'), sortable: true, width:""},
  {property:'role', label: t('pages.pieChart.dialogNumber'), width:""},
  {property:'phone', label: t('pages.pieChart.metrics'), width:""},
  {property:'email', label: t('pages.pieChart.topWords'), width:""},
  {property:'active', label: t('pages.pieChart.dictionary')},
  {property:'buttons', label: t('pages.pieChart.link'), align: "right", width:"120"},
])
const users = ref([
  {
    first_name: "11.11.2024",
    last_name: "Иванов",
    role: "33222221",
    phone: "8",
    email: "Lorem ipsum dolor sit.",
    active: "-",
    buttons: "link"
  },
  {
    first_name: "11.11.2022",
    last_name: "Александров",
    role: "3355511",
    phone: "8",
    email: "Lorem ipsum dolor sit.",
    active: "-",
    buttons: "link"
  },
  {
    first_name: "11.11.2022",
    last_name: "Петров",
    role: "33222221",
    phone: "8",
    email: "Lorem ipsum dolor sit.",
    active: "-",
    buttons: "link"
  },
  {
    first_name: "11.11.2022",
    last_name: "Сидоров",
    role: "33222221",
    phone: "8",
    email: "Lorem ipsum dolor sit.",
    active: "-",
    buttons: "link"
  },
  {
    first_name: "11.11.2022",
    last_name: "Кузнецов",
    role: "33222221",
    phone: "8",
    email: "Lorem ipsum dolor sit.",
    active: "-",
    buttons: "link"
  },
  {
    first_name: "11.11.2022",
    last_name: "Смирнов",
    role: "33222221",
    phone: "8",
    email: "Lorem ipsum dolor sit.",
    active: "-",
    buttons: "link"
  },
  {
    first_name: "11.11.2022",
    last_name: "Васильев",
    role: "33222221",
    phone: "8",
    email: "Lorem ipsum dolor sit.",
    active: "-",
    buttons: "link"
  },
  {
    first_name: "11.11.2022",
    last_name: "Павлов",
    role: "33222221",
    phone: "8",
    email: "Lorem ipsum dolor sit.",
    active: "-",
    buttons: "link"
  },
  {
    first_name: "11.11.2022",
    last_name: "Федоров",
    role: "33222221",
    phone: "8",
    email: "Lorem ipsum dolor sit.",
    active: "-",
    buttons: "link"
  },
  {
    first_name: "11.11.2022",
    last_name: "Михайлов",
    role: "33222221",
    phone: "8",
    email: "Lorem ipsum dolor sit.",
    active: "-",
    buttons: "link"
  },
])
const wordCloudData = ref([
  ['romance', 9], ['horror', 3], ['fantasy', 7], ['adventure', 3], ['comedy', 2], ['thriller', 1], ['drama', 1], ['action', 10],
  ['sci-fi', 8], ['mystery', 6], ['western', 4], ['musical', 3], ['documentary', 7], ['animation', 9], ['biography', 4],
  ['crime', 6], ['family', 5], ['history', 3], ['war', 8], ['sport', 2], ['superhero', 10], ['zombie', 4], ['vampire', 6]
])
const wordText = ref(null)

// Функция для вращения слов
const rotation = () => {
  return Math.random() * 60 - 30 // От -30° до +30° для более плавного эффекта
}

function handleWordClick(word, weight) {
  wordText.value = word[0]
}

function handleProgress(progress) {
  // no-op in production
}
</script>

<style lang="scss" scoped>
.word-cloud-container {
  :deep(.word-cloud-word) {
    transition: all 0.3s ease;
    cursor: pointer;
    animation: slowRotate 8s ease-in-out infinite;
    &:hover {
      transform: scale(1.1);
      filter: brightness(1.2);
      animation-play-state: paused;
    }
  }
}

@keyframes slowRotate {
  0% {
    transform: rotate(0deg);
  }
  25% {
    transform: rotate(2deg);
  }
  50% {
    transform: rotate(0deg);
  }
  75% {
    transform: rotate(-2deg);
  }
  100% {
    transform: rotate(0deg);
  }
}

.cloud-fade-enter-active {
  transition: all 1s ease;
}

.cloud-fade-enter-from {
  opacity: 0;
  transform: scale(0.5);
}

.cloud-fade-enter-to {
  opacity: 1;
  transform: scale(1);
}
</style>