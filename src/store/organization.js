import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getOrganizations } from '@/api/organizations'
import { ErrorHandler } from '@/utils/errorHandler'

export const useOrganizationStore = defineStore('organization', () => {
  // State
  const organizations = ref(null)
  const loading = ref(false)
  const error = ref(null)

  // Getters
  const organizationsList = computed(() => organizations.value || [])
  const hasOrganizations = computed(() => organizations.value && organizations.value.length > 0)

  // Actions
  const clearError = () => {
    error.value = null
  }

  const fetchOrganizations = async () => {
    try {
      loading.value = true
      error.value = null
      organizations.value = await getOrganizations()
    } catch (err) {
      error.value = err.response?.data?.message || err.message
      ErrorHandler.handleApiError(err, 'Загрузка организаций')
      throw err
    } finally {
      loading.value = false
    }
  }

  return { 
    // State
    organizations, 
    loading,
    error,
    
    // Getters
    organizationsList,
    hasOrganizations,
    
    // Actions
    clearError,
    fetchOrganizations 
  }
})