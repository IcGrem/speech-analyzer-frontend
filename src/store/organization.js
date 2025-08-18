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
      const response = await getOrganizations()
      if (response && response.data) {
        organizations.value = Array.isArray(response.data) ? response.data : (response.data.data || [])
      } else {
        organizations.value = []
      }
    } catch (err) {
      error.value = err.response?.data?.message || err.message
      ErrorHandler.handleApiError(err, 'Загрузка организаций', { notify: false })
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