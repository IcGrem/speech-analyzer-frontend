import api from './api'

// Получение дневных метрик организации в формате графика
// params: { organization_id: string, metric_types: string[] | string, start_date: string, end_date: string }
export const getOrganizationDailyMetrics = (params) => {
	const { organization_id, metric_types, start_date, end_date } = params

	const queryParams = new URLSearchParams()

	// metric_types может быть массивом или строкой; параметр необязательный
	const metricsParam = Array.isArray(metric_types) ? metric_types.join(',') : metric_types
	if (metricsParam && String(metricsParam).trim().length > 0) {
		queryParams.append('metric_types', metricsParam)
	}
	queryParams.append('start_date', start_date)
	queryParams.append('end_date', end_date)

	return api.get(`/dialogs/get-organization-daily-metrics/${organization_id}?${queryParams.toString()}`)
}

// Получение средних метрик организации (плашки + график)
// params: { organization_id: string, start_date?: string, end_date?: string }
export const getOrganizationAverageMetrics = (params) => {
	const { organization_id, start_date, end_date } = params
	const queryParams = new URLSearchParams()
	if (start_date) queryParams.append('start_date', start_date)
	if (end_date) queryParams.append('end_date', end_date)
	const qs = queryParams.toString()
	const url = qs.length > 0
		? `/dialogs/get-organization-average-metrics/${organization_id}?${qs}`
		: `/dialogs/get-organization-average-metrics/${organization_id}`
	return api.get(url)
} 