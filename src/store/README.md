# Единообразный подход к хранилищам

## Структура хранилища

Каждое хранилище должно следовать единообразной структуре:

### 1. State (Состояние)
```javascript
// Обязательные поля
const loading = ref(false)
const error = ref(null)

// Специфичные для хранилища поля
const data = ref(null)
```

### 2. Getters (Вычисляемые свойства)
```javascript
// Безопасный доступ к данным
const dataList = computed(() => data.value || [])

// Проверка наличия данных
const hasData = computed(() => data.value && data.value.length > 0)

// Количество элементов
const dataCount = computed(() => data.value?.length || 0)
```

### 3. Actions (Действия)
```javascript
// Очистка ошибок
const clearError = () => {
  error.value = null
}

// Асинхронные операции с обработкой ошибок
const fetchData = async () => {
  try {
    loading.value = true
    error.value = null
    data.value = await apiCall()
  } catch (err) {
    error.value = err.response?.data?.message || err.message
    ErrorHandler.handleApiError(err, 'Контекст операции')
    throw err
  } finally {
    loading.value = false
  }
}
```

## Использование storeToRefs

`storeToRefs` - это утилита Pinia, которая сохраняет реактивность при деструктуризации хранилища. **Рекомендуется использовать для state и getters, но НЕ для actions.**

### ✅ Правильное использование

```vue
<template>
  <div>
    <div v-if="loading">Загрузка...</div>
    <div v-else-if="error">{{ error }}</div>
    <div v-else-if="hasData">
      <div v-for="item in dataList" :key="item.id">
        {{ item.name }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { useYourStore } from '@/store/yourStore'
import { storeToRefs } from 'pinia'
import { onMounted } from 'vue'

const store = useYourStore()

// ✅ Используем storeToRefs для state и getters
const { loading, error, dataList, hasData } = storeToRefs(store)

// ✅ Actions используем напрямую
const { fetchData, clearError } = store

onMounted(async () => {
  try {
    await fetchData()
  } catch (error) {
    console.error('Не удалось загрузить данные')
  }
})
</script>
```

### ❌ Неправильное использование

```javascript
// ❌ НЕ используйте деструктуризацию без storeToRefs
const { loading, error, dataList } = store // Потеряется реактивность!

// ❌ НЕ используйте storeToRefs для actions
const { fetchData, clearError } = storeToRefs(store) // Не нужно
```

## Шаблон для нового хранилища

```javascript
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { ErrorHandler } from '@/utils/errorHandler'
import { yourApiFunction } from '@/api/yourApi'

export const useYourStore = defineStore('yourStore', () => {
  // State
  const data = ref(null)
  const loading = ref(false)
  const error = ref(null)

  // Getters
  const dataList = computed(() => data.value || [])
  const hasData = computed(() => data.value && data.value.length > 0)
  const dataCount = computed(() => data.value?.length || 0)

  // Actions
  const clearError = () => {
    error.value = null
  }

  const fetchData = async () => {
    try {
      loading.value = true
      error.value = null
      data.value = await yourApiFunction()
    } catch (err) {
      error.value = err.response?.data?.message || err.message
      ErrorHandler.handleApiError(err, 'Загрузка данных')
      throw err
    } finally {
      loading.value = false
    }
  }

  const addItem = async (item) => {
    try {
      loading.value = true
      error.value = null
      
      // API вызов
      const response = await addItemApi(item)
      
      // Обновление локальных данных
      if (data.value) {
        data.value.push(response.data)
      }
    } catch (err) {
      error.value = err.response?.data?.message || err.message
      ErrorHandler.handleApiError(err, 'Добавление элемента')
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    // State
    data,
    loading,
    error,
    
    // Getters
    dataList,
    hasData,
    dataCount,
    
    // Actions
    clearError,
    fetchData,
    addItem
  }
})
```

## Примеры использования в компонентах

### Простой компонент с одним хранилищем

```vue
<template>
  <div>
    <div v-if="loading" class="loading">Загрузка...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else-if="hasData" class="content">
      <div v-for="item in dataList" :key="item.id">
        {{ item.name }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { useYourStore } from '@/store/yourStore'
import { storeToRefs } from 'pinia'
import { onMounted } from 'vue'

const store = useYourStore()
const { loading, error, dataList, hasData } = storeToRefs(store)
const { fetchData, clearError } = store

onMounted(async () => {
  try {
    await fetchData()
  } catch (error) {
    console.error('Не удалось загрузить данные')
  }
})
</script>
```

### Компонент с несколькими хранилищами

```vue
<template>
  <div>
    <div v-if="authLoading || employeesLoading">Загрузка...</div>
    <div v-else>
      <h1>Добро пожаловать, {{ userName }}!</h1>
      <div v-if="hasEmployees">
        <h2>Сотрудники ({{ employeesCount }})</h2>
        <div v-for="employee in employeesList" :key="employee.id">
          {{ employee.name }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from '@/store/auth'
import { useEmployeeStore } from '@/store/employees'
import { storeToRefs } from 'pinia'
import { onMounted } from 'vue'

// Auth store
const authStore = useAuthStore()
const { loading: authLoading, user, userName } = storeToRefs(authStore)
const { checkAuthentication } = authStore

// Employee store
const employeeStore = useEmployeeStore()
const { 
  loading: employeesLoading, 
  employeesList, 
  hasEmployees, 
  employeesCount 
} = storeToRefs(employeeStore)
const { fetchEmployees } = employeeStore

onMounted(async () => {
  try {
    await Promise.all([
      checkAuthentication(),
      fetchEmployees()
    ])
  } catch (error) {
    console.error('Ошибка инициализации')
  }
})
</script>
```

### Компонент с обработкой ошибок

```vue
<template>
  <div>
    <div v-if="loading" class="loading">
      <LoadingIndicator />
    </div>
    <div v-else-if="error" class="error">
      <div class="error-message">{{ error }}</div>
      <button @click="retry" :disabled="loading">
        Повторить
      </button>
    </div>
    <div v-else-if="hasData" class="content">
      <div v-for="item in dataList" :key="item.id">
        {{ item.name }}
      </div>
    </div>
    <div v-else class="empty">
      Нет данных
    </div>
  </div>
</template>

<script setup>
import { useYourStore } from '@/store/yourStore'
import { storeToRefs } from 'pinia'
import { onMounted } from 'vue'
import LoadingIndicator from '@/components/LoadingIndicator.vue'

const store = useYourStore()
const { loading, error, dataList, hasData } = storeToRefs(store)
const { fetchData, clearError } = store

const retry = async () => {
  clearError()
  try {
    await fetchData()
  } catch (error) {
    console.error('Не удалось загрузить данные')
  }
}

onMounted(retry)
</script>
```

## Преимущества единообразного подхода

1. **Консистентность**: Все хранилища имеют одинаковую структуру
2. **Обработка ошибок**: Централизованная обработка через `ErrorHandler`
3. **Состояние загрузки**: Единообразное управление состоянием загрузки
4. **Безопасность**: Безопасный доступ к данным через геттеры
5. **Читаемость**: Понятная структура и именование
6. **Тестируемость**: Легко тестировать благодаря единообразию
7. **Реактивность**: Правильное использование `storeToRefs` сохраняет реактивность

## Рекомендации

1. **Всегда используйте `storeToRefs`** для state и getters в компонентах
2. **НЕ используйте `storeToRefs`** для actions - используйте их напрямую
3. Всегда используйте `try/catch/finally` для асинхронных операций
4. Очищайте ошибки перед новыми операциями
5. Используйте `ErrorHandler.handleApiError()` для уведомлений
6. Создавайте геттеры для безопасного доступа к данным
7. Группируйте возвращаемые значения по категориям (State, Getters, Actions)
8. Добавляйте комментарии для сложной логики
9. Используйте TypeScript для лучшей типизации (если проект поддерживает) 