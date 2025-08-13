import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getOrganizationDailyMetrics, getOrganizationAverageMetrics } from '@/api/organizationMetrics'
import { ErrorHandler } from '@/utils/errorHandler'

export const useOrganizationMetricsStore = defineStore('organizationMetrics', () => {
	const metrics = ref({ labels: [], datasets: [] })
	const averageScores = ref(null)
	const loading = ref(false)
	const error = ref(null)

	const fetchOrganizationDailyMetrics = async (params) => {
		try {
			loading.value = true
			error.value = null
			const response = await getOrganizationDailyMetrics(params)

			if (response && response.data) {
				metrics.value = response.data
			} else {
				metrics.value = { labels: [], datasets: [] }
			}
		} catch (err) {
			error.value = err.response?.data?.message || err.message
			ErrorHandler.handleApiError(err, 'Загрузка дневных метрик организации')
			metrics.value = { labels: [], datasets: [] }
			throw err
		} finally {
			loading.value = false
		}
	}

	const fetchOrganizationAverageMetrics = async (params) => {
		try {
			loading.value = true
			error.value = null
			const response = await getOrganizationAverageMetrics(params)
			if (response && response.data) {
				// Ожидаем структуру: { average_scores: {...}, graphic: { labels, datasets } }
				averageScores.value = response.data.average_scores || null
				// Обновим график, если пришел
				if (response.data.graphic) {
					metrics.value = response.data.graphic
				}
			} else {
				averageScores.value = null
			}
		} catch (err) {
			error.value = err.response?.data?.message || err.message
			ErrorHandler.handleApiError(err, 'Загрузка средних метрик организации')
			averageScores.value = null
			throw err
		} finally {
			loading.value = false
		}
	}

	return {
		metrics,
		averageScores,
		loading,
		error,
		fetchOrganizationDailyMetrics,
		fetchOrganizationAverageMetrics,
	}
}) 