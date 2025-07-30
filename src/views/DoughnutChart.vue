<template>
  <div>
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
              <span v-if="item.property === 'tarif'">
                <p>{{`Тариф “${ row.tarif }”`}}</p>
              </span>
              <span v-else>
                {{ row[item.property] }}
              </span>
            </template>
          </el-table-column>
          <template #empty>
            <p class="table__empty-text">Преподаватели не добавлены</p>
            <p class="table__empty-link">
              <span>Добавьте</span> первого учителя
            </p>
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
              />
            </transition>
          </div>
          <div class="p-4 rounded-2xl bg-white shadow-md flex items-center flex-col justify-center h-[200px]">
            <transition name="cloud-fade" appear>
              <vue-word-cloud
                style="height: 100%; width: 100%;"
                :words="wordCloudData"
                :font-size-ratio="4"
                :color="([, weight]) => weight > 5 ? 'red' : 'blue'"
                font-family="Arial"
                class="word-cloud-container"
              />
            </transition>
          </div>
        </div>
      </el-col>
    </el-row>
      <div class="my-6">
        <p class="text-2xl font-bold mb-4">Фильтры</p>
        <el-row :gutter="20">
          <el-col :span="8">
            <el-autocomplete
              v-model="state"
              placeholder="Please input"
            />
          </el-col>
          <el-col :span="8">
            <el-date-picker
              v-model="dateRange"
              type="daterange"
              range-separator="-"
              start-placeholder="Дата начала"
              end-placeholder="Дата окончания"
            />
          </el-col>
          <el-col :span="8">
            <el-select v-model="value" placeholder="Select">
              <el-option
                v-for="item in options"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-col>
        </el-row>
      </div>
      <div>
        <p class="text-2xl font-bold mb-4">Панели</p>
        <el-row :gutter="20">
          <el-col class="mb-4" :span="6" v-for="item in 6" :key="item">
            <div class="p-4 rounded-2xl bg-white shadow-md flex items-center flex-col justify-center min-h-[150px]">
              Lorem ipsum dolor sit.
            </div>
          </el-col>
        </el-row>
      </div>
      <div class="my-6">
        <el-button type="danger" @click="showConfirm = true">Показать диалог подтверждения</el-button>
      </div>
      <DialogConfirm
        v-model="showConfirm"
        title="Удалить пользователя?"
        message="Вы действительно хотите удалить этого пользователя?"
        confirmText="Удалить"
        cancelText="Отмена"
        @confirm="handleDelete"
        @cancel="handleCancel"
      />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import DialogConfirm from '@/components/Dialogs/DialogConfirm.vue'
const loading = ref(false)
const state = ref('')
const dateRange = ref('')
const value = ref('')
const options = ref([
  {
    value: 'Option1',
    label: 'Option1',
  },
  {
    value: 'Option2',
    label: 'Option2',
  },
  {
    value: 'Option3',
    label: 'Option3',
  },
  {
    value: 'Option4',
    label: 'Option4',
  },
])
const tableHeader = ref([
  {property:'first_name', label: 'Дата', sortable: true, width: "" },
  {property:'last_name', label: 'Сотрудник', sortable: true, width:""},
  {property:'role', label: 'Номер/Id диалога', width:""},
  {property:'phone', label: 'Оценки по всем метрикам', width:""},
  {property:'email', label: 'Топ 5 слов', width:""},
  {property:'active', label: 'Факт наличия в словарях'},
  {property:'buttons', label: 'Ссылка', align: "right", width:"120"},
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
])
const showConfirm = ref(false)
const wordCloudData = ref([
  ['romance', 9], ['horror', 3], ['fantasy', 7], ['adventure', 3], ['comedy', 2], ['thriller', 1], ['drama', 1], ['action', 10],
  ['sci-fi', 8], ['mystery', 6], ['western', 4], ['musical', 3], ['documentary', 7], ['animation', 9], ['biography', 4],
  ['crime', 6], ['family', 5], ['history', 3], ['war', 8], ['sport', 2], ['superhero', 10], ['zombie', 4], ['vampire', 6]
])
function handleDelete() {
  // Здесь логика удаления
  alert('Пользователь удалён!')
}
function handleCancel() {
  // Здесь логика отмены (опционально)
  console.log('Удаление отменено')
}

function handleWordHover(word, weight) {
  console.log('Наведение на слово:', word, 'вес:', weight)
}

function handleProgress(progress) {
  console.log('Прогресс вычисления облака тегов:', progress)
}
</script>

<style lang="scss" scoped>
.word-cloud-container {
  :deep(.word-cloud-word) {
    transition: all 0.3s ease;
    cursor: pointer;
    &:hover {
      transform: scale(1.1);
      filter: brightness(1.2);
    }
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