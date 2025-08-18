import api from './api';

export const getDialogs = (params = {}) => {
	const {
		page,
		size,
		start_date,
		end_date,
		employee_ids,
		sort_by,
		sort_order,
	} = params;

	const queryParams = new URLSearchParams();
	if (page !== undefined) queryParams.append('page', String(page));
	if (size !== undefined) queryParams.append('size', String(size));
	if (sort_by) queryParams.append('sort_by', String(sort_by));
	if (sort_order) queryParams.append('sort_order', String(sort_order));
	if (start_date) queryParams.append('start_date', String(start_date));
	if (end_date) queryParams.append('end_date', String(end_date));
	if (employee_ids && Array.isArray(employee_ids) && employee_ids.length > 0) {
		queryParams.append('employee_ids', employee_ids.join(','));
	}

	const qs = queryParams.toString();
	const url = qs.length > 0
		? `/dialogs/get-dialogs?${qs}`
		: '/dialogs/get-dialogs';

	return api.get(url);
};

export const getEmployeeMetrics = (params) => {
	const { organization_id, metric_type, employee_ids, start_date, end_date } = params;
	
	const queryParams = new URLSearchParams();
	queryParams.append('metric_type', metric_type);
	queryParams.append('start_date', start_date);
	queryParams.append('end_date', end_date);
	
	if (employee_ids && Array.isArray(employee_ids) && employee_ids.length > 0) {
		queryParams.append('employee_ids', employee_ids.join(','));
	}
	
	return api.get(`/dialogs/get-employee-metrics/${organization_id}?${queryParams.toString()}`);
};

// Добавлено: получение средних метрик сотрудников организации в формате графика
// params: { organization_id: string, metric_types: string[] | string, start_date?: string, end_date?: string }
export const getEmployeeAverageMetrics = (params) => {
  const { organization_id, metric_types, start_date, end_date } = params;

  const queryParams = new URLSearchParams();
  const metricsParam = Array.isArray(metric_types) ? metric_types.join(',') : metric_types;
  if (metricsParam && String(metricsParam).trim().length > 0) {
    queryParams.append('metric_types', metricsParam);
  }
  if (start_date) queryParams.append('start_date', start_date);
  if (end_date) queryParams.append('end_date', end_date);

  const qs = queryParams.toString();
  const url = qs.length > 0
    ? `/dialogs/get-employee-average-metrics/${organization_id}?${qs}`
    : `/dialogs/get-employee-average-metrics/${organization_id}`;

  return api.get(url);
};

// Новое: получение деталей диалога по ID
export const getDialogById = (dialog_id) => {
  return api.get(`/dialogs/get-dialog/${dialog_id}`);
};