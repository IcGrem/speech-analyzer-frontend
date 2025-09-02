<template>
  <PageWrapper :title="pageTitle">
    <div class="mb-6 p-4 bg-white rounded-lg shadow-sm">
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
            <el-select
              v-model="filters.dictionary_id"
              filterable
              :placeholder="'Выберите словарь'"
              @change="handleDictionaryChange"
              clearable
              style="min-width: 260px;"
            >
              <el-option
                v-for="dictionary in dictionariesList"
                :key="dictionary.id"
                :label="dictionary.description"
                :value="dictionary.id"
              >
                <div class="flex items-center gap-2">
                  <div
                    class="w-3 h-3 rounded-full"
                    :style="{ backgroundColor: dictionary.color }"
                  ></div>
                  <span>{{ dictionary.description }}</span>
                </div>
              </el-option>
            </el-select>
          </el-col>
        </el-row>
        <el-row :gutter="20" class="mt-4">
          <el-col :span="8">
            <el-select
              v-model="filters.conversation_type"
              filterable
              :placeholder="'Выберите тип диалога'"
              @change="handleFilterChange"
              clearable
              style="width: 100%;"
            >
              <el-option
                v-for="type in conversationTypes"
                :key="type.value"
                :label="type.label"
                :value="type.value"
              >
                <div class="flex items-center gap-2">
                  <i :class="[type.icon, type.color]" class="text-sm"></i>
                  <span>{{ type.label }}</span>
                </div>
              </el-option>
            </el-select>
          </el-col>
          <el-col :span="8">
            <!-- Пустая колонка для баланса -->
          </el-col>
          <el-col :span="8">
            <div class="flex justify-end gap-2">
              <el-button type="primary" @click="handleFilterChange">
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

    <el-row>
      <el-col :span="24">
        <el-table
          ref="multipleTableRef"
          :data="dialogs || []"
          style="width: 100%"
          v-loading="loading"
          @sort-change="handleSortChange"
        >
          <el-table-column
            v-for="item in tableHeader"
            :key="item.property"
            :prop="item.property"
            :width="item.width"
            :label="item.label"
            :sortable="item.sortable"
            :align="item.align"
            show-overflow-tooltip
          >
            <template #default="{row}">
              <span v-if="item.property === 'dialog_id'">
                <div class="flex items-center gap-2">
                  <span class="font-mono text-sm">{{ row.dialog_id?.slice(0, 8) }}...</span>
                  <el-button
                    type="text"
                    size="small"
                    @click="copyToClipboard(row.dialog_id)"
                    class="text-gray-500 hover:text-blue-600"
                  >
                    <i class="el-icon-document-copy"></i>
                  </el-button>
                </div>
              </span>
              <span v-else-if="item.property === 'dictionaries'">
                <div v-if="formatDictionaries(row.dictionaries).length > 0" class="flex flex-wrap gap-2">
                  <!-- Показываем только первые 3 тега -->
                  <el-tag
                    v-for="(dict, index) in formatDictionaries(row.dictionaries).slice(0, 3)"
                    :key="dict.description"
                    size="default"
                    effect="plain"
                    :style="{
                      color: dict.color,
                      borderColor: dict.color,
                      backgroundColor: `${dict.color}10`,
                      fontSize: '14px',
                      padding: '8px 12px'
                    }"
                  >
                    {{ dict.description }}
                  </el-tag>

                  <!-- Показываем количество скрытых тегов -->
                  <el-tag
                    v-if="formatDictionaries(row.dictionaries).length > 3"
                    type="info"
                    size="default"
                    effect="plain"
                    class="cursor-pointer hover:bg-blue-50"
                    @click="showAllDictionaries(row.dictionaries, row.dialog_id)"
                  >
                    +{{ formatDictionaries(row.dictionaries).length - 3 }}
                  </el-tag>
                </div>
                <span v-else class="text-gray-400">—</span>
              </span>
              <span v-else-if="item.property === 'overall_score'">
                <span class="font-semibold" :class="getScoreClass(row.overall_score)">
                  {{ row.overall_score }}
                </span>
              </span>
              <span v-else-if="item.property === 'date'">
                {{ formatDate(row.recording_start_date || row.date) }}
              </span>
              <span v-else-if="item.property === 'employee_name'">
                {{ formatEmployeeName(row) }}
              </span>
              <span v-else-if="item.property === 'conversation_type'">
                <el-tooltip 
                  :content="getConversationTypeTooltip(row.conversation_type)" 
                  placement="top"
                  :show-after="500"
                >
                  <div class="flex items-center gap-2 cursor-help">
                    <i :class="[formatConversationType(row.conversation_type).icon, formatConversationType(row.conversation_type).color]" class="text-sm"></i>
                    <span class="font-medium text-sm" :class="formatConversationType(row.conversation_type).color">
                      {{ formatConversationType(row.conversation_type).text }}
                    </span>
                  </div>
                </el-tooltip>
              </span>
              <span v-else-if="item.property === 'actions'">
                <el-button
                  type="primary"
                  size="small"
                  @click="viewDialog(row)"
                >
                  {{ $t('common.view') }}
                </el-button>
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
            v-model:current-page="localPagination.currentPage"
            v-model:page-size="localPagination.pageSize"
            :page-sizes="[10, 20, 50, 100]"
            :total="localPagination.total"
            layout="sizes, prev, pager, next"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            background
          />
        </div>
      </el-col>
    </el-row>

    <!-- Модальное окно просмотра -->
    <el-dialog
      v-model="dialogVisible"
      :title="`Детали диалога ${selectedDialog?.dialog_id || ''}`"
      width="80%"
      :before-close="handleClose"
    >
      <div v-if="dialogDetailsLoading">{{ $t('common.loading') }}</div>
      <div v-else-if="selectedDialog">
        <div v-if="normalizedConversation.length" class="mt-4">
          <p class="font-semibold mb-2 text-gray-800">Разговор</p>
          <div class="max-h-80 overflow-auto space-y-3">
            <div v-for="(msg, idx) in normalizedConversation" :key="idx" class="p-3 rounded border border-gray-200 bg-white hover:bg-gray-50 transition-colors">
              <div class="text-sm text-gray-800 leading-relaxed" v-html="msg.message"></div>
            </div>
          </div>
        </div>
        <div v-else-if="selectedDialog?.conversation && typeof selectedDialog.conversation === 'string'" class="mt-4">
          <p class="font-semibold mb-2 text-gray-800">Полный контент</p>
          <div class="max-h-80 overflow-auto p-4 bg-gray-50 rounded border border-gray-200">
            <div class="whitespace-pre-wrap text-gray-800 leading-relaxed font-mono text-sm" v-html="selectedDialog.conversation"></div>
          </div>
        </div>
      </div>
      <template #footer>
        <el-button @click="dialogVisible = false">{{ $t('common.close') }}</el-button>
      </template>
    </el-dialog>

    <!-- Модальное окно для показа всех словарей -->
    <el-dialog
      v-model="dictionariesModalVisible"
      :title="`Все словари для диалога ${selectedDialogId || ''}`"
      width="60%"
      :before-close="handleDictionariesModalClose"
    >
      <div class="p-4">
        <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div
            v-for="dict in selectedDictionaries"
            :key="dict.description"
            class="p-4 border rounded-lg hover:shadow-md transition-shadow"
            :style="{
              borderColor: dict.color,
              backgroundColor: `${dict.color}05`
            }"
          >
            <div class="flex items-center gap-3">
              <div
                class="w-4 h-4 rounded-full"
                :style="{ backgroundColor: dict.color }"
              ></div>
              <span
                class="font-medium"
                :style="{ color: dict.color }"
              >
                {{ dict.description }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="flex justify-end">
          <el-button @click="handleDictionariesModalClose">Закрыть</el-button>
        </div>
      </template>
    </el-dialog>
  </PageWrapper>
</template>

<script setup>
import PageWrapper from '@/components/PageWrapper.vue'
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useLocalization } from '@/composables/useI18n'
import { useDialogsStore } from '@/store/dialogs'
import { useEmployeeStore } from '@/store/employees'
import { useAuthStore } from '@/store/auth'
import { storeToRefs } from 'pinia'
import { formatDateTime as formatDateTimeUtil } from '@/utils'
import { getDialogById } from '@/api/dialogs'

const route = useRoute()
const router = useRouter()
const { t } = useLocalization()
const dialogsStore = useDialogsStore()
const employeeStore = useEmployeeStore()

// Состояние
const dialogVisible = ref(false)
const selectedDialog = ref(null)
const dialogDetailsLoading = ref(false)

// Получаем employeesLoading из store
const { employeesList, loading: employeesLoading } = storeToRefs(employeeStore)

// Функция закрытия модального окна
function handleClose() {
  dialogVisible.value = false
  selectedDialog.value = null
}

// Состояние для модального окна словарей
const dictionariesModalVisible = ref(false)
const selectedDictionaries = ref([])
const selectedDialogId = ref('')

// Дата по умолчанию для открытия пикера на июле 2025
const defaultPickerMonth = new Date(2025, 6, 1)

// Ограничение выбора дат только июлем 2025
function disableOutsideJuly2025(date) {
  const y = date.getFullYear()
  const m = date.getMonth()
  return !(y === 2025 && m === 6)
}

// Достаём реактивные поля как refs из stores
const {
  dialogs,
  loading,
  pagination,
  filters: storeFilters,
} = storeToRefs(dialogsStore)

const {
  updateFilters: updateStoreFilters,
  updatePagination: updateStorePagination,
  fetchDialogs
} = dialogsStore

const { fetchEmployees } = employeeStore

// Локальные фильтры для синхронизации с хранилищем
const filters = ref({
  dateRange: null,
  employee_ids: [],
  dictionary_id: null,
  conversation_type: null,
  sort_by: 'recording_start_date',
  sort_order: 'desc'
})

// Список словарей для селекта (будет загружаться с API)
const dictionariesList = ref([])

// Типы диалогов для селекта
const conversationTypes = ref([
  { value: 'm2m', label: 'Менеджер → Менеджер', icon: 'el-icon-user-solid', color: 'text-blue-600' },
  { value: 'm2c', label: 'Менеджер → Клиент', icon: 'el-icon-service', color: 'text-green-600' },
  { value: 'unknown', label: 'Неизвестный', icon: 'el-icon-question', color: 'text-gray-500' }
])

// Проверяем параметры из URL для фильтрации по словарю
const dictionaryFilter = computed(() => {
  return {
    id: route.query.dictionary_id,
    name: route.query.dictionary_name
  }
})

// Обновляем заголовок страницы если есть фильтр по словарю
const pageTitle = computed(() => {
  if (dictionaryFilter.value.id) {
    return `${t('pages.pieChart.title')} - ${dictionaryFilter.value.name}`
  }
  return t('pages.pieChart.title')
})

// Локальная копия пагинации для реактивности
const localPagination = ref({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

// Синхронизируем локальную пагинацию с хранилищем
watch(pagination, (newPagination) => {
  localPagination.value.total = newPagination?.total ?? 0
  localPagination.value.pageSize = newPagination?.pageSize ?? 10
}, { deep: true, immediate: true })

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

// Функция для очистки HTML тегов и форматирования сообщений
function cleanAndFormatMessage(message) {
  if (!message || typeof message !== 'string') return ''
  
  // Убираем HTML теги, но сохраняем содержимое
  let cleaned = message
    .replace(/<[^>]*>/g, '') // Убираем все HTML теги
    .replace(/&lt;/g, '<') // Декодируем HTML entities
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\*\*/g, '') // Убираем markdown **
    .replace(/\*/g, '') // Убираем markdown *
    .replace(/`/g, '') // Убираем markdown `
    .replace(/#{1,6}\s/g, '') // Убираем markdown заголовки
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Заменяем markdown ссылки на текст
    .replace(/\s+/g, ' ') // Убираем лишние пробелы
    .replace(/\n\s*\n/g, '\n') // Убираем пустые строки
    .trim()
  
  // Если сообщение содержит информацию о типе разговора, форматируем его
  if (cleaned.includes('Тип разговора:')) {
    cleaned = cleaned.replace(/Тип разговора:\s*/, '')
  }
  
  // Убираем лишние разделители в конце
  cleaned = cleaned.replace(/---\s*$/, '')
  
  return cleaned
}

// Нормализованный разговор для модалки
const normalizedConversation = computed(() => {
  const raw = selectedDialog.value?.conversation
  if (!raw || typeof raw !== 'string') return []
  
  // Просто возвращаем пустой массив, чтобы показывать "Полный контент"
  return []
})

// Функция для форматирования типов диалогов
function formatConversationType(type) {
  if (!type) return { text: '—', color: 'text-gray-400', icon: 'el-icon-question' }

  const typeMap = {
    'm2m': { text: 'Менеджер → Менеджер', color: 'text-blue-600', icon: 'el-icon-user-solid' },
    'm2c': { text: 'Менеджер → Клиент', color: 'text-green-600', icon: 'el-icon-service' },
    'unknown': { text: 'Неизвестный', color: 'text-gray-500', icon: 'el-icon-question' }
  }

  return typeMap[type.toLowerCase()] || { text: type, color: 'text-gray-700', icon: 'el-icon-chat-dot-round' }
}

// Функция для создания подсказок типов диалогов
function getConversationTypeTooltip(type) {
  if (!type) return 'Тип диалога не определен'

  const tooltipMap = {
    'm2m': 'Диалог между менеджерами (Manager to Manager)',
    'm2c': 'Диалог менеджера с клиентом (Manager to Client)',
    'unknown': 'Тип диалога не определен или неизвестен'
  }

  return tooltipMap[type.toLowerCase()] || `Тип диалога: ${type}`
}

// Заголовки: включаем сортировку по клику на заголовок
const tableHeader = computed(() => [
  { property: 'dialog_id', label: t('pages.pieChart.dialogNumber'), sortable: false, width: '200' },
  { property: 'date', label: t('pages.pieChart.date'), sortable: 'custom', width: '150' },
  { property: 'employee_name', label: t('pages.pieChart.employee'), width: '250', sortable: 'custom'},
  { property: 'conversation_type', label: t('pages.pieChart.conversationType'), sortable: false, width: '190' },
  { property: 'overall_score', label: t('pages.pieChart.metrics'), sortable: 'custom', width: '170', align: 'center' },
  { property: 'dictionaries', label: t('pages.pieChart.dictionary'), sortable: false, width: '200', align: 'center' },
  { property: 'actions', label: t('pages.pieChart.link'), width: '120', align: 'right', sortable: false },
])

// Обработчики событий
// Обработчик изменения словаря
function handleDictionaryChange() {
  // Обновляем store фильтры
  updateStoreFilters({
    dictionary_id: filters.value.dictionary_id,
    conversation_type: filters.value.conversation_type
  })
  
  // Обновляем URL параметры
  const newQuery = { ...route.query }
  if (filters.value.dictionary_id) {
    newQuery.dictionary_id = filters.value.dictionary_id
    // Не устанавливаем автоматически conversation_type
  } else {
    delete newQuery.dictionary_id
    delete newQuery.conversation_type
  }
  router.push({ query: newQuery })
  
  // Загружаем диалоги
  loadDialogs()
}

// Функция копирования в буфер обмена
async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text)
    // Можно добавить уведомление об успешном копировании
    console.log('ID диалога скопирован:', text)
  } catch (err) {
    console.error('Ошибка при копировании:', err)
    // Fallback для старых браузеров
    const textArea = document.createElement('textarea')
    textArea.value = text
    document.body.appendChild(textArea)
    textArea.select()
    document.execCommand('copy')
    document.body.removeChild(textArea)
  }
}

// Функция показа всех словарей
function showAllDictionaries(dictionaries, dialogId) {
  selectedDictionaries.value = formatDictionaries(dictionaries)
  selectedDialogId.value = dialogId
  dictionariesModalVisible.value = true
}

// Закрытие модального окна словарей
function handleDictionariesModalClose() {
  dictionariesModalVisible.value = false
  selectedDictionaries.value = []
  selectedDialogId.value = ''
}

// Обработчик изменения фильтров
function handleFilterChange() {
  // Применяем фильтры
  const storeFiltersUpdate = {
    start_date: filters.value.dateRange?.[0] || null,
    end_date: filters.value.dateRange?.[1] || null,
    employee_ids: filters.value.employee_ids || [],
    dictionary_id: filters.value.dictionary_id || null,
    conversation_type: filters.value.conversation_type || null
  }
  
  // Обновляем store фильтры
  updateStoreFilters(storeFiltersUpdate)
  
  // Сбрасываем на первую страницу
  localPagination.value.currentPage = 1
  updateStorePagination({ currentPage: 1 })
  
  // Загружаем диалоги
  loadDialogs()
}

// Очистка фильтров
function clearFilters() {
  filters.value = {
    dateRange: null,
    employee_ids: [],
    dictionary_id: null,
    conversation_type: null,
    sort_by: 'recording_start_date',
    sort_order: 'desc'
  }
  
  // Очищаем store фильтры
  updateStoreFilters({
    start_date: null,
    end_date: null,
    employee_ids: [],
    dictionary_id: null,
    conversation_type: null
  })
  
  // Очищаем URL параметры
  router.push({ query: {} })
  
  // Загружаем диалоги
  loadDialogs()
}

function handleDateRangeChange() {
  if (filters.value.dateRange && filters.value.dateRange.length === 2) {
    filters.value.start_date = filters.value.dateRange[0]
    filters.value.end_date = filters.value.dateRange[1]
  } else {
    filters.value.start_date = null
    filters.value.end_date = null
  }
  localPagination.value.currentPage = 1
  updateStorePagination({ currentPage: 1 })
  handleFilterChange()
}

function handleSortChange({ prop, order }) {
  if (!prop) return
  let sortBy = 'recording_start_date'
  if (prop === 'employee_name') sortBy = 'employee_name'
  if (prop === 'overall_score') sortBy = 'overall_score'
  if (prop === 'date') sortBy = 'recording_start_date'
  if (prop === 'conversation_type') sortBy = 'conversation_type'
  const sortOrder = order === 'ascending' ? 'asc' : 'desc'
  filters.value.sort_by = sortBy
  filters.value.sort_order = sortOrder
  localPagination.value.currentPage = 1
  updateStorePagination({ currentPage: 1 })
  updateStoreFilters(filters.value)
  loadDialogs()
}

function handleSizeChange(size) {
  updateStorePagination({ pageSize: size, currentPage: 1 })
  localPagination.value.pageSize = size
  localPagination.value.currentPage = 1
  loadDialogs()
}

function handleCurrentChange(page) {
  updateStorePagination({ currentPage: page })
  localPagination.value.currentPage = page
  loadDialogs()
}

async function viewDialog(dialog) {
  dialogVisible.value = true
  dialogDetailsLoading.value = true
  selectedDialog.value = null
  
  try {
    const id = dialog.dialog_id || dialog.id
    const response = await getDialogById(id)
    const payload = response?.data?.data ?? response?.data ?? null
    selectedDialog.value = payload || dialog
  } catch (e) {
    // На случай ошибки показываем то, что есть в строке
    selectedDialog.value = dialog
    console.error('Ошибка загрузки деталей диалога:', e)
  } finally {
    dialogDetailsLoading.value = false
  }
}

function formatDictionaries(value) {
  // Если это массив словарей с цветами и описаниями
  if (Array.isArray(value) && value.length > 0) {
    return value.map(dict => ({
      color: dict.color,
      description: dict.description
    }))
  }

  // Если это пустой массив
  if (Array.isArray(value) && value.length === 0) return []

  // Если это строка
  if (typeof value === 'string' && value.trim() !== '') return [{ color: '#6B7280', description: value }]

  // Если это объект, попробуем преобразовать
  if (value && typeof value === 'object') {
    try {
      return [{ color: '#6B7280', description: JSON.stringify(value) }]
    } catch (e) {
      return [{ color: '#6B7280', description: String(value) }]
    }
  }

  return []
}

function getScoreClass(score) {
  const numeric = Number(score)
  if (Number.isNaN(numeric)) return ''

  // Оценка 0 делаем серой
  if (numeric === 0) return 'text-gray-500'

  if (numeric <= 1) return 'text-red-600'
  if (numeric <= 2) return 'text-orange-600'
  if (numeric <= 3) return 'text-yellow-600'
  if (numeric <= 5) return 'text-green-600'
  return 'text-green-600'
}

function formatDate(dateString) {
  return formatDateTimeUtil(dateString, 'ru-RU')
}

function formatEmployeeName(row) {
  // Если есть вложенный объект employee
  if (row.employee) {
    const first = row.employee.first_name || ''
    const last = row.employee.last_name || ''
    const name = `${first} ${last}`.trim()
    return name || '—'
  }

  // Если есть прямое поле employee_name
  if (row.employee_name) {
    return row.employee_name
  }

  return '—'
}

async function loadDialogs() {
  try {
    await fetchDialogs()
    localPagination.value.total = pagination.value?.total ?? 0
    localPagination.value.pageSize = pagination.value?.pageSize ?? 10
  } catch (error) {
    console.error('Ошибка загрузки диалогов:', error)
  }
}

// Синхронизируем локальные фильтры с store
function updateLocalFilters(newFilters) {
  if (!newFilters) return
  
  filters.value.dateRange = newFilters.start_date && newFilters.end_date 
    ? [newFilters.start_date, newFilters.end_date] 
    : null
  filters.value.employee_ids = newFilters?.employee_ids || []
  filters.value.dictionary_id = newFilters?.dictionary_id || null
  filters.value.conversation_type = newFilters?.conversation_type || null
  filters.value.sort_by = newFilters?.sort_by || 'recording_start_date'
  filters.value.sort_order = newFilters?.sort_order || 'desc'
}

// Следим за изменением store фильтров
watch(storeFilters, (newFilters) => {
  updateLocalFilters(newFilters)
}, { deep: true, immediate: true })

// Следим за изменением фильтра по словарю из URL
watch(dictionaryFilter, async (newFilter) => {
  if (newFilter.id) {
    // Устанавливаем фильтр по словарю из URL
    filters.value.dictionary_id = newFilter.id
    updateStoreFilters({ dictionary_id: newFilter.id })
    await fetchDialogs()
  }
}, { immediate: true })

// Загрузка данных при монтировании
onMounted(() => {
  console.log('onMounted called')
  
  // Загружаем словари для селекта
  loadDictionaries()
  
  // Получаем параметры из URL
  const routeQuery = route.query
  console.log('route.query:', routeQuery)
  
  if (routeQuery.dictionary_id && routeQuery.dictionary_name) {
    // Устанавливаем фильтр по словарю
    dictionaryFilter.value = {
      id: routeQuery.dictionary_id,
      name: routeQuery.dictionary_name
    }
    
    console.log('dictionaryFilter.value:', dictionaryFilter.value)
    
    // Применяем фильтр по словарю
    console.log('onMounted - Applying dictionary filter:', dictionaryFilter.value.id)
    
    // Автоматически устанавливаем тип диалога "Менеджер → Клиент" 
    // только если переходим со страницы словарей
    filters.value.conversation_type = 'm2c'
    
    // Обновляем store фильтры
    updateStoreFilters({
      dictionary_id: dictionaryFilter.value.id,
      conversation_type: 'm2c'
    })
    
    // Обновляем URL параметры
    router.push({
      query: {
        ...routeQuery,
        conversation_type: 'm2c'
      }
    })
    
    // Загружаем диалоги с новыми фильтрами
    loadDialogs()
  } else {
    // Если просто заходим на страницу без параметров словаря,
    // то фильтр по типу диалога должен быть пустым
    filters.value.conversation_type = null
    
    // Обновляем store фильтры (без conversation_type)
    updateStoreFilters({
      dictionary_id: null,
      conversation_type: null
    })
    
    // Загружаем диалоги без фильтра по типу диалога
    loadDialogs()
  }
})

// Загрузка словарей для селекта
async function loadDictionaries() {
  try {
    // Загружаем словари из store
    const response = await dialogsStore.fetchDialogsByDictionaries()
    if (response && response.data) {
      dictionariesList.value = response.data
    }
  } catch (error) {
    console.error('Ошибка при загрузке словарей:', error)
  }
}
</script>

<style scoped>
/* Базовые стили для страницы */
</style>