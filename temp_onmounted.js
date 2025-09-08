// Загрузка данных при монтировании
onMounted(() => {
  console.log('onMounted called')
  
  // Загружаем словаи для селекта
  loadDictionaries()
  
  // Получаем параметры из URL
  const routeQuery = route.query
  console.log('route.query:', routeQuery)
  
  // Применяем фильтры из URL если они переданы со страницы словарей
  if (routeQuery.start_date) {
    filters.value.dateRange = [routeQuery.start_date, routeQuery.end_date]
  }
  
  if (routeQuery.employee_ids) {
    filters.value.employee_ids = routeQuery.employee_ids.split(',')
  }
  
  if (routeQuery.dictionary_id && routeQuery.dictionary_name) {
    // Устанавливаем фильтр по словарю
    dictionaryFilter.value = {
      id: routeQuery.dictionary_id,
      name: routeQuery.dictionary_name
    }
    
    console.log('dictionaryFilter.value:', dictionaryFilter.value)
    
    // Применяем фильтр по словарю
    console.log('onMounted - Applying dictionary filter:', dictionaryFilter.value.id)
    
    // Автоматически устанавливаем тип диалога "Менеджер → Клиент" 
    // только если переходим со страницы словарей
    filters.value.conversation_type = 'm2c'
    
    // Обновляем store фильтры с переданными фильтрами
    updateStoreFilters({
      start_date: filters.value.dateRange?.[0] || null,
      end_date: filters.value.dateRange?.[1] || null,
      employee_ids: filters.value.employee_ids || [],
      dictionary_id: dictionaryFilter.value.id,
      conversation_type: 'm2c'
    })
    
    // Обновляем URL параметры
    router.push({
      query: {
        ...routeQuery,
        conversation_type: 'm2c'
      }
    })
    
    // Загружаем диалоги с новыми фильтрами
    loadDialogs()
  } else {
    // Если просто заходим на страницу без параметров словаря,
    // то фильтр по типу диалога должен быть пустым
    filters.value.conversation_type = null
    
    // Обновляем store фильтры (без conversation_type)
    updateStoreFilters({
      dictionary_id: null,
      conversation_type: null
    })
    
    // Загружаем диалоги без фильтра по типу диалога
    loadDialogs()
  }
})
