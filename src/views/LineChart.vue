<template>
  <PageWrapper title="Словари по сотрудникам">
    <FilterCard class="mb-4">
      <el-row :gutter="12">
        <el-col :span="10">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            :disabled-date="disableExceptJul2025"
            range-separator="-"
            start-placeholder="Дата начала"
            end-placeholder="Дата окончания"
            unlink-panels
            clearable
            @change="onDateChange"
            style="width: 100%;"
          />
        </el-col>
        <el-col :span="10">
          <el-select
            v-model="selectedEmployees"
            placeholder="Все сотрудники"
            multiple
            collapse-tags
            collapse-tags-tooltip
            filterable
            style="width: 100%;"
          >
            <el-option
              v-for="name in employeeNames"
              :key="name"
              :label="name"
              :value="name"
            />
          </el-select>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" class="w-full" @click="refreshData">Обновить</el-button>
        </el-col>
      </el-row>
    </FilterCard>
    <div class="max-w-full mx-auto h-[500px]">
      <div v-if="employeeAverageLoading" class="w-full h-[500px] flex justify-center items-center">
        <LoadingIndicator />
      </div>
      <div v-else-if="employeeAverageError" class="w-full h-[500px] flex justify-center items-center">
        <el-alert :title="employeeAverageError" type="error" :closable="false" show-icon />
      </div>
      <div v-else-if="barData.labels?.length && barData.datasets?.length" class="w-full h-[500px]">
                                                                                                   <Bar :data="barData" :options="chartOptions" />
      </div>
      <div v-else class="w-full h-[500px] flex justify-center items-center">
        <el-empty description="Нет данных для отображения графика" />
      </div>
    </div>
  </PageWrapper>
</template>

<script setup>

import { onMounted, computed, ref, watch } from 'vue'
import { Bar } from 'vue-chartjs'
import { Chart, registerables } from 'chart.js'
import ChartDataLabels from 'chartjs-plugin-datalabels'
import { useDialogsStore } from '@/store/dialogs'
import { useEmployeeStore } from '@/store/employees'
import { useAuthStore } from '@/store/auth'
import { storeToRefs } from 'pinia'
import LoadingIndicator from '@/components/LoadingIndicator.vue'
import { useRouter } from 'vue-router'
import { getAllDictionaries } from '@/api/dialogs'
import FilterCard from '@/components/FilterCard.vue'
Chart.register(...registerables, ChartDataLabels)

// Формат значения: целое без .0, иначе 1 знак после запятой
function formatDictValue(value) {
  const num = Number(value)
  if (!Number.isFinite(num)) return String(value)
  return Number.isInteger(num) ? String(num) : num.toFixed(1)
}

// Внешний тултип, который рисуется вне канваса и не перекрывает область клика
function externalTooltipHandler(context) {
  const { chart, tooltip } = context
  let tooltipEl = chart.canvas.parentNode.querySelector('div.chartjs-external-tooltip')

  if (!tooltipEl) {
    tooltipEl = document.createElement('div')
    tooltipEl.className = 'chartjs-external-tooltip'
    tooltipEl.style.pointerEvents = 'none'
    tooltipEl.style.position = 'absolute'
    tooltipEl.style.transform = 'translate(-50%, -100%)'
    tooltipEl.style.background = '#ffffff'
    tooltipEl.style.color = '#2e2e2e'
    tooltipEl.style.padding = '12px'
    tooltipEl.style.borderRadius = '4px'
    tooltipEl.style.fontSize = '12px'
    tooltipEl.style.lineHeight = '16px'
    tooltipEl.style.whiteSpace = 'nowrap'
    tooltipEl.style.zIndex = '20'
    tooltipEl.style.border = '2px solid #402de6'
    tooltipEl.style.boxShadow = '0 4px 12px rgba(0,0,0,0.12)'

    const caret = document.createElement('div')
    caret.style.position = 'absolute'
    caret.style.left = '50%'
    caret.style.bottom = '-6px'
    caret.style.transform = 'translateX(-50%)'
    caret.style.width = '0'
    caret.style.height = '0'
    caret.style.borderLeft = '6px solid transparent'
    caret.style.borderRight = '6px solid transparent'
    caret.style.borderTop = '6px solid #ffffff'
    caret.className = 'chartjs-external-tooltip-caret'

    tooltipEl.appendChild(caret)
    chart.canvas.parentNode.style.position = 'relative'
    chart.canvas.parentNode.appendChild(tooltipEl)
  }

  // Hide
  if (tooltip.opacity === 0) {
    tooltipEl.style.opacity = '0'
    return
  }

  // Content
  const dp = tooltip.dataPoints && tooltip.dataPoints[0]
  if (!dp) {
    tooltipEl.style.opacity = '0'
    return
  }
  const dataset = dp.dataset || {}
  const dataIndex = dp.dataIndex
  const labelFromDp = typeof dp.label === 'string' ? dp.label : ''
  const fallbackEmployee = Array.isArray(chart.data?.labels) ? chart.data.labels[dataIndex] : ''
  const employeeName = labelFromDp || fallbackEmployee || ''

  const rawArr = Array.isArray(dataset.rawData) ? dataset.rawData : null
  const raw = rawArr ? rawArr[dataIndex] : (Array.isArray(dataset.data) ? dataset.data[dataIndex] : dp.raw)
  const txt = formatDictValue(raw)
  const dictLine = `${dataset.label || ''}: ${txt}`

  tooltipEl.innerHTML = ''

  const main = document.createElement('div')
  main.style.fontWeight = '600'
  main.style.marginBottom = '4px'
  main.textContent = dictLine

  const sub = document.createElement('div')
  sub.style.color = '#6b7280'
  sub.style.fontSize = '12px'
  sub.textContent = employeeName

  const caret = document.createElement('div')
  caret.style.position = 'absolute'
  caret.style.left = '50%'
  caret.style.bottom = '-6px'
  caret.style.transform = 'translateX(-50%)'
  caret.style.width = '0'
  caret.style.height = '0'
  caret.style.borderLeft = '6px solid transparent'
  caret.style.borderRight = '6px solid transparent'
  caret.style.borderTop = '6px solid #ffffff'

  tooltipEl.appendChild(main)
  tooltipEl.appendChild(sub)
  tooltipEl.appendChild(caret)

  const { offsetLeft: positionX, offsetTop: positionY } = chart.canvas

  tooltipEl.style.opacity = '1'
  tooltipEl.style.left = positionX + tooltip.caretX + 'px'
  tooltipEl.style.top = positionY + tooltip.caretY - 12 + 'px'
}

// Метрики для запроса (обязательный параметр metric_types)
const metrics = [
  { value: 'greeting_farewell_score', label: 'Приветствие и прощание' },
  { value: 'completeness_score', label: 'Полнота ответа' },
  { value: 'tone_score', label: 'Тон общения' },
  { value: 'openness_helpfulness_score', label: 'Открытость и готовность помочь' },
  { value: 'listening_score', label: 'Умение слушать' },
  { value: 'empathy_score', label: 'Эмпатия' },
  { value: 'speech_quality_score', label: 'Грамотная речь' },
  { value: 'response_time_score', label: 'Время ответа' },
  { value: 'overall_score', label: 'Итоговая оценка' },
]

const dialogsStore = useDialogsStore()
const employeeStore = useEmployeeStore()
const authStore = useAuthStore()
const { employeeAverageMetrics, employeeAverageLoading, employeeAverageError } = storeToRefs(dialogsStore)
const { organizationId: authOrganizationId, user: authUser } = storeToRefs(authStore)
const router = useRouter()

// Дату по умолчанию не отправляем: начальное значение null
const dateRange = ref(null)
const selectedEmployees = ref([])

// Карта словарей по описанию: description -> { id, color }
const dictionariesIndex = ref(new Map())

// Нормализатор имени для сопоставления
const normalizeName = (str) => (str || '').replace(/\s+/g, ' ').replace(/\.+$/,'').trim()

// Карта имя -> id для сотрудников
const nameToIdMap = computed(() => {
  const raw = employeeStore.employees
  const arr = Array.isArray(raw) ? raw : (raw?.data || [])
  const map = new Map()
  for (const e of (arr || [])) {
    const first = e.first_name || e.firstName || e.firstname || ''
    const last = e.last_name || e.lastName || e.lastname || ''
    const fallbackName = `${first} ${last}`.trim() || e.name || ''
    const key = normalizeName(fallbackName)
    const id = e.id ?? e.employee_id ?? e.uuid ?? e._id ?? null
    if (key && id) map.set(key, String(id))
  }
  return map
})

// Загрузка словарей для получения их id/цвета
const loadDictionariesIndex = async () => {
  try {
    const res = await getAllDictionaries()
    const list = res?.data || []
    const map = new Map()
    for (const d of list) {
      if (d?.description) map.set(String(d.description), { id: d.id, color: d.color })
    }
    dictionariesIndex.value = map
  } catch (e) {
    // молча, не критично
  }
}

// Организация: берём из auth, иначе из сотрудников, иначе из sessionStorage
const organizationId = computed(() => {
  if (authOrganizationId?.value) return authOrganizationId.value
  const raw = employeeStore.employees
  const employeesArr = Array.isArray(raw) ? raw : (raw?.data || [])
  if (Array.isArray(employeesArr) && employeesArr.length > 0) return employeesArr[0]?.organization_id || null
  const fromSession = sessionStorage.getItem('organizationId')
  return fromSession || authUser?.value?.organization_id || null
})

const refreshData = async () => {
  if (!organizationId.value) return
  const params = {
    organization_id: organizationId.value,
    metric_types: metrics.map(m => m.value),
  }
  if (Array.isArray(dateRange.value) && dateRange.value[0] && dateRange.value[1]) {
    params.start_date = dateRange.value[0].toISOString()
    params.end_date = dateRange.value[1].toISOString()
  }
  await dialogsStore.fetchEmployeeAverageMetrics(params)
}

const fetchData = async () => {
  if (!employeeStore.employees) {
    await employeeStore.fetchEmployees()
  }
  await Promise.all([
    refreshData(),
    loadDictionariesIndex(),
  ])
}

// Доступные имена сотрудников из набора данных
const employeeNames = computed(() => {
  const m = employeeAverageMetrics.value
  if (!m || !Array.isArray(m.datasets)) return []
  return m.datasets.map(d => d.label).filter(Boolean)
})


const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  indexAxis: 'y', // Сотрудники по оси Y (слева)
  plugins: {
    legend: { 
      display: true, 
      position: 'bottom', 
      labels: { 
        filter: (legendItem, data) => {
          const label = legendItem.text
          const firstIdx = data.datasets.findIndex(d => d.label === label)
          return legendItem.datasetIndex === firstIdx
        } 
      } 
    },
    title: { display: true, text: '' },
    tooltip: {
      enabled: false,
      mode: 'nearest',
      intersect: true,
      external: (ctx) => externalTooltipHandler(ctx)
    },
    datalabels: {
      display: true,
      color: '#ffffff', // Белый цвет для значений
      font: {
        weight: 'bold',
        size: 12
      },
      formatter: (value, context) => {
        const dataset = context.dataset
        const rawData = dataset.rawData
        if (rawData && rawData[context.dataIndex] !== undefined) {
          return formatDictValue(rawData[context.dataIndex])
        }
        return formatDictValue(value)
      },
      anchor: 'center',
      align: 'center'
    }
  },
  scales: {
    x: { 
      stacked: true,
      beginAtZero: true,
      ticks: { 
        display: false // Убираем цифры по оси X
      }
    },
    y: {
      stacked: true,
      ticks: { display: true }
    },
  },
  interaction: { mode: 'nearest', intersect: true },
  datasets: {
    bar: {
      barPercentage: 0.8,
      categoryPercentage: 0.9,
      borderSkipped: false,
      borderRadius: 2,
      borderWidth: 2,
      borderColor: '#ffffff',
    }
  },
  onHover: (event, elements, chart) => {
    const canvas = chart?.canvas
    if (canvas) canvas.style.cursor = elements?.length ? 'pointer' : 'default'
  },
  onClick: (event, elements, chart) => {
    const el = elements && elements[0]
    if (!el) return
    const dictName = chart?.data?.datasets?.[el.datasetIndex]?.label
    const employeeLabel = chart?.data?.labels?.[el.index]
    if (!dictName || !employeeLabel) return

    const dictMeta = dictionariesIndex.value.get(String(dictName))
    const dictionaryId = dictMeta?.id || null
    const employeeId = nameToIdMap.value.get(normalizeName(employeeLabel)) || null

    const query = {
      dictionary_name: String(dictName),
      ...(dictionaryId ? { dictionary_id: String(dictionaryId) } : {}),
      ...(employeeId ? { employee_ids: String(employeeId) } : {}),
    }

    // Пробрасываем выбранный диапазон дат при наличии
    if (Array.isArray(dateRange.value) && dateRange.value[0] && dateRange.value[1]) {
      const fmt = (d) => (d instanceof Date ? d.toISOString().slice(0,10) : String(d).slice(0,10))
      query.start_date = fmt(dateRange.value[0])
      query.end_date = fmt(dateRange.value[1])
    }

    router.push({ name: 'Pie', query })
  }
}))


const barData = computed(() => {
  const src = employeeAverageMetrics.value || { labels: [], datasets: [] }
  const originalLabels = Array.isArray(src.labels) ? src.labels : [] // Словари
  let originalDatasets = Array.isArray(src.datasets) ? src.datasets : [] // Сотрудники

  if (selectedEmployees.value && selectedEmployees.value.length > 0) {
    originalDatasets = originalDatasets.filter(ds => ds.label && selectedEmployees.value.includes(ds.label))
  }

  // Транспонируем: сотрудники -> labels (ось Y), словари -> datasets (ось X)
  const newLabels = originalDatasets.map(ds => ds.label) // Сотрудники по оси Y (слева)
  const employeeCount = newLabels.length
  const segmentHeight = 100 / employeeCount // Равные части для каждого сотрудника

  // Извлекаем словари и их цвета
  const dictItems = Array.isArray(src.labels)
    ? src.labels.map((it, i) => typeof it === 'object'
        ? { text: it.description, color: it.color || getColorForDictionary(i) }
        : { text: String(it), color: getColorForDictionary(i) })
    : []

  // Транспонирование: сотрудники -> labels (ось Y), словари -> datasets (ось X)
  const newDatasets = dictItems.map((dict, dictIndex) => {
    const rawValues = originalDatasets.map(emp => (emp.data?.[dictIndex] ?? 0))
    return {
      label: dict.text,                 // подпись словаря в легенде
      data: Array(newLabels.length).fill(segmentHeight), // равные доли
      rawData: rawValues,               // реальные числа для белых меток
      backgroundColor: dict.color,      // цвет из бэкенда
      borderColor: '#ffffff',
      borderWidth: 2,
    }
  })

  return { labels: newLabels, datasets: newDatasets }
})

// Функция для получения цвета для словаря
const getColorForDictionary = (index) => {
  const colors = [
    '#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899',
    '#f43f5e', '#ef4444', '#f97316', '#eab308', '#22c55e'
  ]
  return colors[index % colors.length]
}

// Ограничение выбора дат: только 01.07.2025 — 31.07.2025
const disableExceptJul2025 = (date) => {
  if (!(date instanceof Date)) return true
  const y = date.getFullYear()
  const m = date.getMonth() // 0..11; 6 = July
  const d = date.getDate()
  return !(y === 2025 && m === 6 && d >= 1 && d <= 31)
}

const onDateChange = () => {
  // Динамическое обновление по дате (если дата очищена — запрос без дат)
  refreshData()
}

// Рефреш при изменении auth organization
watch(() => authOrganizationId?.value, () => refreshData())

onMounted(fetchData)
</script>

<style lang="scss" scoped>

</style>