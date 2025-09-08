<template>
  <PageWrapper title="Словари">
    <div class="p-6">
        <!-- Фильтры -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Фильтры</h3>
          <el-form :model="filters">
            <el-row :gutter="20">
              <el-col :span="8">
                <el-date-picker
                  v-model="filters.dateRange"
                  type="daterange"
                  :placeholder="$t('pages.pieChart.selectDateRange')"
                  format="DD.MM.YYYY"
                  value-format="YYYY-MM-DD"
                  range-separator="-"
                  :start-placeholder="$t('pages.pieChart.startDate')"
                  :end-placeholder="$t('pages.pieChart.endDate')"
                  @change="handleDateRangeChange"
                  :disabled-date="disableOutsideJuly2025"
                  :default-value="defaultPickerMonth"
                  style="width: 100%;"
                />
              </el-col>
              <el-col :span="8">
                <el-select
                  v-model="filters.employee_ids"
                  multiple
                  filterable
                  :placeholder="$t('pages.pieChart.selectEmployees')"
                  @change="handleFilterChange"
                  :loading="employeesLoading"
                  style="width: 100%;"
                >
                  <el-option
                    v-for="employee in normalizedEmployees"
                    :key="employee.id"
                    :label="employee.label"
                    :value="employee.id"
                  />
                </el-select>
              </el-col>
              <el-col :span="8">
                <div class="flex gap-2">
                  <el-button type="primary" @click="handleFilterChange" :loading="loading">
                    {{ $t('common.apply') }}
                  </el-button>
                  <el-button @click="clearFilters">
                    {{ $t('common.clear') }}
                  </el-button>
                </div>
              </el-col>
            </el-row>
          </el-form>
        </div>

        <!-- Карточки словарей -->
        <div>
          <div>
            <div v-loading="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              <div
                v-for="dictionary in dictionariesList"
                :key="dictionary.id"
                class="bg-white border rounded-lg p-6 transition-all duration-300 cursor-pointer"
                :style="{
                  boxShadow: `0 10px 25px -5px ${dictionary.color}40, 0 8px 10px -6px ${dictionary.color}40`,
                  borderColor: `${dictionary.color}30`,
                  transform: 'translateY(0)'
                }"
                @mouseenter="handleCardHover($event, dictionary, true)"
                @mouseleave="handleCardHover($event, dictionary, false)"
                @click="handleDictionaryClick(dictionary)"
              >
                <div class="text-center">
                  <h4 class="text-2xl font-medium text-gray-500 mb-4">
                    {{ dictionary.description }}
                  </h4>
                  
                  <span 
                    class="text-2xl font-bold mb-4 block"
                    :style="{ color: dictionary.color }"
                  >
                    {{ dictionary.dialogs_count }}
                  </span>
                  
                  <div class="w-full mt-4">
                    <el-button 
                      type="info" 
                      size="small"
                      class="w-full"
                      @click.stop="showDictionaryDetails(dictionary)"
                    >
                      Подробнее
                    </el-button>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Пустое состояние -->
            <div v-if="!loading && !hasDictionaries" class="text-center py-12">
              <div class="mb-4">
                <CustomIcons name="book" icon-class="w-16 h-16 mx-auto text-gray-300" />
              </div>
              <h3 class="text-lg font-medium text-gray-900 mb-2">Словари не найдены</h3>
              <p class="text-gray-500">Попробуйте изменить параметры фильтрации</p>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Модальное окно с деталями словаря -->
      <el-dialog
        v-model="dictionaryDetailsVisible"
        :title="`Словарь: ${selectedDictionary?.description || ''}`"
        width="60%"
        :before-close="handleDictionaryModalClose"
      >
        <div v-if="selectedDictionary?.words" class="space-y-4">
          <div class="flex items-center gap-3 mb-4">
            <div 
              class="w-6 h-6 rounded-full"
              :style="{ backgroundColor: selectedDictionary.color }"
            ></div>
            <span class="text-lg font-medium text-gray-800">
              {{ selectedDictionary.description }}
            </span>
          </div>
          
          <div class="bg-gray-50 p-4 rounded-lg">
            <h4 class="font-medium text-gray-700 mb-3">
              Слова в словаре ({{ selectedDictionary.words.length }}):
            </h4>
            <div class="max-h-96 overflow-y-auto">
              <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                <span 
                  v-for="word in selectedDictionary.words" 
                  :key="word"
                  class="px-3 py-2 bg-white border rounded-md text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  :style="{ borderColor: selectedDictionary.color + '30' }"
                >
                  {{ word }}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <div v-else class="text-center py-8 text-gray-500">
          <CustomIcons name="book" icon-class="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <p>Слова в словаре не найдены</p>
        </div>
        
        <template #footer>
          <div class="flex justify-end">
            <el-button @click="handleDictionaryModalClose">Закрыть</el-button>
          </div>
        </template>
      </el-dialog>
    </PageWrapper>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useLocalization } from '@/composables/useI18n'
import { useDialogsStore } from '@/store/dialogs'
import { useEmployeeStore } from '@/store/employees'
import { useAuthStore } from '@/store/auth'
import { storeToRefs } from 'pinia'
import PageWrapper from '@/components/PageWrapper.vue'
import CustomIcons from '@/components/icons/CustomIcons.vue'
import { getAllDictionariesWithWords } from '@/api/dialogs'

const router = useRouter()
const { t } = useLocalization()
const dialogsStore = useDialogsStore()
const employeeStore = useEmployeeStore()
const authStore = useAuthStore()

// Дата по умолчанию для открытия пикера на июле 2025
const defaultPickerMonth = new Date(2025, 6, 1)

// Ограничение выбора дат только июлем 2025
function disableOutsideJuly2025(date) {
  const y = date.getFullYear()
  const m = date.getMonth()
  return !(y === 2025 && m === 6)
}

// Моковые данные для словарей (в реальном приложении это будет приходить с API)
const dictionariesData = ref([
  {
    "id": "debbf109-8e78-4955-b115-6e5c89857f91",
    "title": "slang",
    "description": "Сленг",
    "color": "#9370DB",
    "dialogs_count": 2173,
    "words": ["вот", "тип", "так", "просто", "ну", "блин", "короче", "кстати"]
  },
  {
    "id": "9d09e674-fd27-4983-8be5-a240f7d19366",
    "title": "diminutives",
    "description": "Уменьшительные",
    "color": "#87CEEB",
    "dialogs_count": 228,
    "words": ["минутка", "столик", "стол", "зал", "ресторанчик"]
  },
  {
    "id": "220c092e-6396-4ca2-a40e-3b8d776a9679",
    "title": "blurriness",
    "description": "Размытость",
    "color": "#FFA500",
    "dialogs_count": 164,
    "words": ["наверное", "возможно", "кажется", "вроде", "примерно"]
  },
  {
    "id": "31eb76d9-b026-4ef8-a92c-a10266af0532",
    "title": "negative",
    "description": "Негатив",
    "color": "#000000",
    "dialogs_count": 21,
    "words": ["дурацкий", "жаловаться", "хрень", "плохо", "ужасно"]
  },
  {
    "id": "725df19f-7aae-4f08-815f-4481cc359d5d",
    "title": "apologies",
    "description": "Извинения",
    "color": "#B8B8B8",
    "dialogs_count": 18,
    "words": ["прощения", "извините", "извиняюсь", "прошу прощения"]
  },
  {
    "id": "6599f8a2-3382-4f1a-9b02-13a4ce644394",
    "title": "NOT",
    "description": "Не",
    "color": "#FF6B6B",
    "dialogs_count": 16,
    "words": ["нет", "не", "ни", "никак", "ничего"]
  },
  {
    "id": "12c2d4c5-77f7-48ff-a2b6-6b0a99985b90",
    "title": "insults",
    "description": "Оскорбления",
    "color": "#F0E68C",
    "dialogs_count": 11,
    "words": ["дурак", "идиот", "тупой", "глупый"]
  },
  {
    "id": "c6f90f13-9e45-48a7-936c-18aa48fc86a3",
    "title": "obscene",
    "description": "Нецензурные",
    "color": "#8B0000",
    "dialogs_count": 9,
    "words": ["мат", "ругательство", "проклятие"]
  },
  {
    "id": "5d2c5ab6-63c4-419f-8230-0e95f15e24bc",
    "title": "expectations",
    "description": "Ожидания",
    "color": "#800000",
    "dialogs_count": 9,
    "words": ["надеюсь", "ожидаю", "планирую", "хочу"]
  },
  {
    "id": "ce4fa362-ef8b-4a03-b3a4-80a7bf15782f",
    "title": "justifiable",
    "description": "Оправдательные",
    "color": "#2F2F2F",
    "dialogs_count": 6,
    "words": ["объясню", "поясню", "уточню", "дополню"]
  }
])

// Состояние загрузки
const loading = ref(false)

// Состояние для модального окна деталей словаря
const dictionaryDetailsVisible = ref(false)
const selectedDictionary = ref(null)

// Вычисляемые свойства для словарей
const dictionariesList = computed(() => dictionariesData.value)
const hasDictionaries = computed(() => dictionariesList.value.length > 0)
const dictionariesCount = computed(() => dictionariesList.value.length)

// Достаём реактивные поля как refs из stores
const { 
  dialogsByDictionariesList,
  dialogsByDictionariesLoading,
  hasDialogsByDictionaries,
  dialogsByDictionariesCount,
} = storeToRefs(dialogsStore)

const { fetchDialogsByDictionaries } = dialogsStore

const { employeesList, loading: employeesLoading } = storeToRefs(employeeStore)
const { fetchEmployees } = employeeStore

// Локальные фильтры для синхронизации с хранилищем
const filters = ref({
  dateRange: null,
  employee_ids: [],
})

// Нормализованный список сотрудников для селекта
const normalizedEmployees = computed(() => {
  return (employeesList.value || []).map(e => {
    const first = e.first_name || e.firstName || e.firstname || ''
    const last = e.last_name || e.lastName || e.lastname || ''
    const name = e.name || `${first} ${last}`.trim()
    return {
      id: e.id ?? e.employee_id ?? e.uuid ?? e._id ?? name,
      label: name || '—'
    }
  })
})

// Обработчики событий - ИСПОЛЬЗУЕМ ЛОКАЛЬНЫЕ ФИЛЬТРЫ
function handleDateRangeChange() {
  // Загружаем обновленные данные словарей с локальными фильтрами
  loadDictionaries()
}

function handleFilterChange() {
  // Загружаем обновленные данные словарей с локальными фильтрами
  loadDictionaries()
}

function clearFilters() {
  filters.value = {
    dateRange: null,
    employee_ids: [],
  }
  
  // Загружаем данные без фильтров
  loadDictionaries()
}

// Функция загрузки словарей с учетом ЛОКАЛЬНЫХ фильтров
async function loadDictionaries() {
  try {
    loading.value = true
    
    // Используем локальные фильтры вместо store фильтров
    const localFilters = {
      start_date: filters.value.dateRange?.[0] || null,
      end_date: filters.value.dateRange?.[1] || null,
      employee_ids: filters.value.employee_ids || []
    }
    
    // Вызываем API для получения словарей с локальными фильтрами
    const response = await fetchDialogsByDictionaries(localFilters)
    
    // Обновляем данные словарей
    if (response && response.data) {
      dictionariesData.value = response.data
    }
    
    // Дополнительно загружаем словари со словами для кнопки "Подробнее"
    try {
      const wordsResponse = await getAllDictionariesWithWords()
      if (wordsResponse && wordsResponse.data) {
        // Обновляем существующие словари, добавляя к ним слова
        dictionariesData.value = dictionariesData.value.map(dict => {
          const dictWithWords = wordsResponse.data.find(dw => dw.id === dict.id);
          return {
            ...dict,
            words: dictWithWords?.words || []
          };
        });
      }
    } catch (wordsError) {
      console.error('Ошибка при загрузке слов словарей:', wordsError)
    }
    
  } catch (error) {
    console.error('Ошибка при загрузке словарей:', error)
  } finally {
    loading.value = false
  }
}

// Обработчик клика по карточке словаря - ПЕРЕДАЕМ ТЕКУЩИЕ ФИЛЬТРЫ
function handleDictionaryClick(dictionary) {
  // Передаем текущие локальные фильтры при переходе на PieChart
  const currentFilters = {
    start_date: filters.value.dateRange?.[0] || null,
    end_date: filters.value.dateRange?.[1] || null,
    employee_ids: filters.value.employee_ids || []
  }
  
  const routeParams = { 
    name: 'Pie', 
    query: { 
      dictionary_id: dictionary.id,
      dictionary_name: dictionary.description,
      // Передаем фильтры через URL
      ...(currentFilters.start_date && { start_date: currentFilters.start_date }),
      ...(currentFilters.end_date && { end_date: currentFilters.end_date }),
      ...(currentFilters.employee_ids.length > 0 && { employee_ids: currentFilters.employee_ids.join(',') })
    } 
  }

  // Переходим на страницу pie с фильтрацией по словарю
  router.push(routeParams)
}

// Показать детали словаря
function showDictionaryDetails(dictionary) {
  selectedDictionary.value = dictionary
  dictionaryDetailsVisible.value = true
}

// Закрыть модальное окно деталей словаря
function handleDictionaryModalClose() {
  dictionaryDetailsVisible.value = false
  selectedDictionary.value = null
}

// Обработчик эффектов наведения для карточек
function handleCardHover(event, dictionary, isHovering) {
  const card = event.currentTarget
  
  if (isHovering) {
    // При наведении: более интенсивная тень и подъем карточки
    card.style.boxShadow = `0 20px 40px -10px ${dictionary.color}60, 0 15px 20px -8px ${dictionary.color}60`
    card.style.transform = 'translateY(-8px)'
  } else {
    // При уходе мыши: возврат к обычной тени
    card.style.boxShadow = `0 10px 25px -5px ${dictionary.color}40, 0 8px 10px -6px ${dictionary.color}40`
    card.style.transform = 'translateY(0)'
  }
}

// Просмотр деталей словаря
function viewDictionaryDetails(dictionary) {
  // Здесь можно добавить логику для открытия модального окна или перехода к странице
}

// Загрузка данных при монтировании
async function fetchData() {
  try {
    // Загружаем сотрудников если их нет
    if (!employeeStore.employees) {
      await employeeStore.fetchEmployees()
    }
    
    // Загружаем словари
    await loadDictionaries()
  } catch (error) {
    console.error('Ошибка при загрузке данных:', error)
  }
}

// Рефреш при изменении auth organization
watch(() => authStore.organizationId, () => loadDictionaries())

onMounted(fetchData)
</script>

<style scoped>
/* Дополнительные стили для страницы */
</style>
