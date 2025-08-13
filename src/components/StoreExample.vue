<template>
  <div class="store-example">
    <!-- Заголовок с информацией о пользователе -->
    <div class="header">
      <h1>Демонстрация хранилищ</h1>
      <div v-if="authLoading" class="loading">Загрузка пользователя...</div>
      <div v-else-if="isAuthenticated" class="user-info">
        <span>Пользователь: {{ userName }}</span>
        <span v-if="isAdmin" class="badge admin">Админ</span>
        <span v-else-if="isUser" class="badge user">Пользователь</span>
      </div>
      <div v-else class="not-authenticated">
        <span>Не авторизован</span>
        <button @click="login" :disabled="authLoading">
          Войти
        </button>
      </div>
    </div>

    <!-- Секция сотрудников -->
    <div class="section">
      <h2>Сотрудники</h2>
      <div v-if="employeesLoading" class="loading">Загрузка сотрудников...</div>
      <div v-else-if="employeesError" class="error">
        <div class="error-message">{{ employeesError }}</div>
        <button @click="retryEmployees" :disabled="employeesLoading">
          Повторить
        </button>
      </div>
      <div v-else-if="hasEmployees" class="employees-list">
        <div class="employees-count">
          Всего сотрудников: {{ employeesCount }}
        </div>
        <div v-for="employee in employeesList" :key="employee.id" class="employee-item">
          <span class="employee-name">{{ employee.name }}</span>
          <span class="employee-role">{{ employee.role }}</span>
        </div>
      </div>
      <div v-else class="empty">
        Нет сотрудников
      </div>
    </div>

    <!-- Секция организаций -->
    <div class="section">
      <h2>Организации</h2>
      <div v-if="organizationsLoading" class="loading">Загрузка организаций...</div>
      <div v-else-if="organizationsError" class="error">
        <div class="error-message">{{ organizationsError }}</div>
        <button @click="retryOrganizations" :disabled="organizationsLoading">
          Повторить
        </button>
      </div>
      <div v-else-if="hasOrganizations" class="organizations-list">
        <div class="organizations-count">
          Всего организаций: {{ organizationsCount }}
        </div>
        <div v-for="org in organizationsList" :key="org.id" class="organization-item">
          <span class="organization-name">{{ org.name }}</span>
          <span class="organization-type">{{ org.type }}</span>
        </div>
      </div>
      <div v-else class="empty">
        Нет организаций
      </div>
    </div>

    <!-- Кнопки управления -->
    <div class="actions">
      <button @click="refreshAll" :disabled="isAnyLoading">
        Обновить все
      </button>
      <button @click="clearAllErrors" :disabled="!hasAnyError">
        Очистить ошибки
      </button>
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from '@/store/auth'
import { useEmployeeStore } from '@/store/employees'
import { useOrganizationStore } from '@/store/organization'
import { storeToRefs } from 'pinia'
import { computed, onMounted } from 'vue'

// Auth Store
const authStore = useAuthStore()
const { 
  loading: authLoading, 
  user, 
  userName, 
  isAuthenticated, 
  isAdmin, 
  isUser 
} = storeToRefs(authStore)
const { login, checkAuthentication } = authStore

// Employee Store
const employeeStore = useEmployeeStore()
const { 
  loading: employeesLoading, 
  error: employeesError, 
  employeesList, 
  hasEmployees, 
  employeesCount 
} = storeToRefs(employeeStore)
const { fetchEmployees, clearError: clearEmployeeError } = employeeStore

// Organization Store
const organizationStore = useOrganizationStore()
const { 
  loading: organizationsLoading, 
  error: organizationsError, 
  organizationsList, 
  hasOrganizations, 
  organizationsCount 
} = storeToRefs(organizationStore)
const { fetchOrganizations, clearError: clearOrganizationError } = organizationStore

// Computed
const isAnyLoading = computed(() => 
  authLoading.value || employeesLoading.value || organizationsLoading.value
)

const hasAnyError = computed(() => 
  employeesError.value || organizationsError.value
)

// Methods
const retryEmployees = async () => {
  clearEmployeeError()
  try {
    await fetchEmployees()
  } catch (error) {
    // Ошибка уже отображается в UI через error state
  }
}

const retryOrganizations = async () => {
  clearOrganizationError()
  try {
    await fetchOrganizations()
  } catch (error) {
    // Ошибка уже отображается в UI через error state
  }
}

const refreshAll = async () => {
  try {
    await Promise.all([
      checkAuthentication(),
      fetchEmployees(),
      fetchOrganizations()
    ])
  } catch (error) {
    // Ошибка уже отображается в UI через error state
  }
}

const clearAllErrors = () => {
  clearEmployeeError()
  clearOrganizationError()
}

const login = async () => {
  try {
    await authStore.login({
      username: 'demo',
      password: 'demo123'
    })
  } catch (error) {
    // Ошибка уже отображается в UI через error state
  }
}

// Lifecycle
onMounted(async () => {
  try {
    await Promise.all([
      checkAuthentication(),
      fetchEmployees(),
      fetchOrganizations()
    ])
  } catch (error) {
    // Ошибка уже отображается в UI через error state
  }
})
</script>

<style scoped>
.store-example {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.header {
  margin-bottom: 30px;
  padding: 20px;
  background: #f5f5f5;
  border-radius: 8px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 10px;
}

.badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;
}

.badge.admin {
  background: #ff4757;
  color: white;
}

.badge.user {
  background: #2ed573;
  color: white;
}

.section {
  margin-bottom: 30px;
  padding: 20px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
}

.loading {
  color: #666;
  font-style: italic;
}

.error {
  color: #ff4757;
  padding: 10px;
  background: #ffe6e6;
  border-radius: 4px;
  margin: 10px 0;
}

.error-message {
  margin-bottom: 10px;
}

.empty {
  color: #666;
  font-style: italic;
  text-align: center;
  padding: 20px;
}

.employees-count,
.organizations-count {
  font-weight: bold;
  margin-bottom: 15px;
  color: #333;
}

.employee-item,
.organization-item {
  display: flex;
  justify-content: space-between;
  padding: 10px;
  border-bottom: 1px solid #f0f0f0;
}

.employee-item:last-child,
.organization-item:last-child {
  border-bottom: none;
}

.employee-name,
.organization-name {
  font-weight: 500;
}

.employee-role,
.organization-type {
  color: #666;
  font-size: 14px;
}

.actions {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

button {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  background: #007bff;
  color: white;
  cursor: pointer;
  font-size: 14px;
}

button:hover:not(:disabled) {
  background: #0056b3;
}

button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.not-authenticated {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 10px;
}
</style> 