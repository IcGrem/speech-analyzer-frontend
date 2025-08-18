<template>
  <PageWrapper :title="$t('pages.pieChart.title')">
    <div class="mb-6 p-4 bg-white rounded-lg shadow-sm">
      <el-form :model="filters">
        <el-row :gutter="20"  >
          <el-col :span="9">
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
          <el-col :span="9">
            <el-select
              v-model="filters.employee_ids"
              multiple
              filterable
              :placeholder="$t('pages.pieChart.selectEmployees')"
              @change="handleFilterChange"
              style="min-width: 260px;"
            >
              <el-option
                v-for="employee in normalizedEmployees"
                :key="employee.id"
                :label="employee.label"
                :value="employee.id"
              />
            </el-select>
          </el-col>
          <el-col :span="6">
            <el-button type="primary" @click="handleFilterChange">
              {{ $t('common.apply') }}
            </el-button>
            <el-button @click="clearFilters">
              {{ $t('common.clear') }}
            </el-button>
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
              <span v-if="item.property === 'dictionaries'">
                {{ formatDictionaries(row.dictionaries) }}
              </span>
              <span v-else-if="item.property === 'overall_score'">
                <span class="font-semibold" :class="getScoreClass(row.overall_score)">
                  {{ row.overall_score }}
                </span>
              </span>
              <span v-else-if="item.property === 'date'">
                {{ formatDate(row.date) }}
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
      id="lbfkjuf"
      :title="$t('common.view')"
      width="600px"
    >
      <div v-if="dialogDetailsLoading">{{ $t('common.loading') }}</div>
      <div v-else-if="selectedDialog">
        <div v-if="normalizedConversation.length" class="mt-4">
          <p class="font-semibold mb-2">Разговор</p>
          <div class="max-h-80 overflow-auto space-y-3">
            <div v-for="(msg, idx) in normalizedConversation" :key="idx" class="p-3 rounded border">
              <div class="text-sm text-gray-500 flex justify-between">
                <span>{{ msg.speaker }}</span>
                <span>{{ formatDate(msg.timestamp) }}</span>
              </div>
              <div class="mt-1 whitespace-pre-wrap">{{ msg.message }}</div>
            </div>
          </div>
        </div>
      </div>
      <template #footer>
        <el-button @click="dialogVisible = false">{{ $t('common.close') }}</el-button>
      </template>
    </el-dialog>
  </PageWrapper>
</template>

<script setup>
import PageWrapper from '@/components/PageWrapper.vue'
import { ref, computed, onMounted, watch } from 'vue'
import { useLocalization } from '@/composables/useI18n'
import { useDialogsStore } from '@/store/dialogs'
import { useEmployeeStore } from '@/store/employees'
import { storeToRefs } from 'pinia'
import { formatDateTime as formatDateTimeUtil } from '@/utils'
import { getDialogById } from '@/api/dialogs'

const { t } = useLocalization()
const dialogsStore = useDialogsStore()
const employeeStore = useEmployeeStore()

// Состояние
const dialogVisible = ref(false)
const selectedDialog = ref(null)
const dialogDetailsLoading = ref(false)

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

const { employeesList } = storeToRefs(employeeStore)
const { fetchEmployees } = employeeStore

// Локальные фильтры для синхронизации с хранилищем
const filters = ref({
  dateRange: null,
  employee_ids: [],
  sort_by: 'recording_start_date',
  sort_order: 'desc'
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

// Нормализованный разговор для модалки
const normalizedConversation = computed(() => {
  const raw = selectedDialog.value?.conversation
  if (!raw) return []
  let items = raw
  if (typeof raw === 'string') {
    try {
      items = JSON.parse(raw)
    } catch (e) {
      return []
    }
  }
  if (!Array.isArray(items)) return []
  return items.map(m => ({
    speaker: m.speaker ?? '',
    message: m.message ?? '',
    timestamp: m.timestamp ?? ''
  }))
})

// Заголовки: включаем сортировку по клику на заголовок
const tableHeader = computed(() => [
  { property: 'date', label: t('pages.pieChart.date'), sortable: 'custom', width: '150' },
  { property: 'employee_name', label: t('pages.pieChart.employee'), sortable: 'custom'},
  { property: 'dialog_id', label: t('pages.pieChart.dialogNumber'), sortable: false, width: '300' },
  { property: 'conversation_type', label: t('pages.pieChart.conversationType'), sortable: false, width: '180' },
  { property: 'overall_score', label: t('pages.pieChart.metrics'), sortable: 'custom', width: '150', align: 'center' },
  { property: 'dictionaries', label: t('pages.pieChart.dictionary'), sortable: false, width: '120', align: 'center' },
  { property: 'actions', label: t('pages.pieChart.link'), align: 'right', sortable: false },
])

// Обработчики событий
function handleFilterChange() {
  localPagination.value.currentPage = 1
  updateStorePagination({ currentPage: 1 })
  updateStoreFilters(filters.value)
  loadDialogs()
}

function clearFilters() {
  filters.value = {
    dateRange: null,
    employee_ids: [],
    sort_by: 'recording_start_date',
    sort_order: 'desc'
  }
  localPagination.value.currentPage = 1
  updateStoreFilters(filters.value)
  updateStorePagination({ currentPage: 1 })
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
  if (typeof value === 'string' && value.trim() !== '') return value
  return '-'
}

function getScoreClass(score) {
  const numeric = Number(score)
  if (Number.isNaN(numeric)) return ''
  if (numeric <= 1) return 'text-red-600'
  if (numeric <= 2) return 'text-orange-600'
  if (numeric <= 3) return 'text-yellow-600'
  if (numeric <= 5) return 'text-green-600'
  return 'text-green-600'
}

function formatDate(dateString) {
  return formatDateTimeUtil(dateString, 'ru-RU')
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

// ВОССТАНОВЛЕНО: загрузка сотрудников
async function loadEmployees() {
  try {
    await fetchEmployees()
  } catch (error) {
    console.error('Ошибка загрузки сотрудников:', error)
  }
}

watch(storeFilters, (newFilters) => {
  if (newFilters?.start_date && newFilters?.end_date) {
    filters.value.dateRange = [newFilters.start_date, newFilters.end_date]
  } else {
    filters.value.dateRange = null
  }
  filters.value.employee_ids = newFilters?.employee_ids || []
  filters.value.sort_by = newFilters?.sort_by || 'recording_start_date'
  filters.value.sort_order = newFilters?.sort_order || 'desc'
}, { deep: true })

onMounted(async () => {
  await Promise.all([
    loadEmployees(),
    loadDialogs()
  ])
})
</script>

<style lang="scss" scoped>
.table__empty-text {
  text-align: center;
  color: #909399;
  padding: 20px;
}
</style>