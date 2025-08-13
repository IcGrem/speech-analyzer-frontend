import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getEmployees } from '@/api/employees'
import { ErrorHandler } from '@/utils/errorHandler'

export const useEmployeeStore = defineStore('employee', () => {
  // State
  const employees = ref(null)
  const loading = ref(false)
  const error = ref(null)

  // Getters
  const employeesList = computed(() => employees.value || [])
  const hasEmployees = computed(() => employees.value && employees.value.length > 0)
  const employeesCount = computed(() => employees.value?.length || 0)

  // Actions
  const clearError = () => {
    error.value = null
  }

  const fetchEmployees = async () => {
    try {
      loading.value = true
      error.value = null
      employees.value = await getEmployees()
    } catch (err) {
      error.value = err.response?.data?.message || err.message
      ErrorHandler.handleApiError(err, 'Загрузка сотрудников', { notify: false })
      throw err
    } finally {
      loading.value = false
    }
  }

  const refreshEmployees = async () => {
    return await fetchEmployees()
  }

  return { 
    // State
    employees, 
    loading,
    error,
    
    // Getters
    employeesList,
    hasEmployees,
    employeesCount,
    
    // Actions
    clearError,
    fetchEmployees,
    refreshEmployees
  }
})