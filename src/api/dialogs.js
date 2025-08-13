import api from './api';

export const getDialogs = () => {
  return api.get('/dialogs/get-dialogs');
};

export const getEmployeeMetrics = (params) => {
  const { organization_id, metric_type, employee_ids, start_date, end_date } = params;
  
  const queryParams = new URLSearchParams();
  queryParams.append('metric_type', metric_type);
  queryParams.append('start_date', start_date);
  queryParams.append('end_date', end_date);
  
  if (employee_ids) {
    queryParams.append('employee_ids', employee_ids);
  }
  
  return api.get(`/dialogs/get-employee-metrics/${organization_id}?${queryParams.toString()}`);
};