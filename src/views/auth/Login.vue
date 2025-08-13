<template>
  <div class="w-[400px] shadow-md rounded-2xl bg-white flex items-center flex-col p-6">
    <h1 class="text-2xl font-medium mb-6 text-center">Авторизация</h1>
    
    <el-form
      ref="formRef"
      :model="formData"
      :rules="rules"
      class="w-full"
      @submit.prevent="handleSubmit"
    >
      <el-form-item prop="username" class="mb-4">
        <el-input
          v-model="formData.username"
          placeholder="Введите логин"
          size="large"
          :disabled="authStore.loading"
          autocomplete="username"
          @keyup.enter="handleSubmit"
        >
          <template #prefix>
            <el-icon><User /></el-icon>
          </template>
        </el-input>
      </el-form-item>

      <el-form-item prop="password" class="mb-6">
        <el-input
          v-model="formData.password"
          type="password"
          placeholder="Введите пароль"
          size="large"
          show-password
          :disabled="authStore.loading"
          autocomplete="current-password"
          @keyup.enter="handleSubmit"
        >
          <template #prefix>
            <el-icon><Lock /></el-icon>
          </template>
        </el-input>
      </el-form-item>

      <div class="mt-6">
        <el-button
          type="primary"
          size="large"
          class="w-full"
          :loading="authStore.loading"
          :disabled="isLocked || authStore.loading"
          @click="handleSubmit"
        >
          <template v-if="isLocked">
            Заблокировано ({{ lockSeconds }}с)
          </template>
          <template v-else-if="authStore.loading">
            Вход...
          </template>
          <template v-else>
            Войти
          </template>
        </el-button>
      </div>
    </el-form>

    <!-- Отображение ошибок -->
    <div v-if="authStore.error" class="w-full mt-4">
      <el-alert
        :title="authStore.error"
        type="error"
        show-icon
        :closable="false"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElNotification, ElMessage } from 'element-plus'
import { User, Lock } from '@element-plus/icons-vue'
import { useAuthStore } from '@/store/auth'

const router = useRouter()
const authStore = useAuthStore()
const formRef = ref()

// Форма данных
const formData = reactive({
  username: '',
  password: ''
})

// Правила валидации
const rules = {
  username: [
    { required: true, message: 'Введите логин', trigger: 'blur' }
  ],
  password: [
    { required: true, message: 'Введите пароль', trigger: 'blur' },
    { min: 3, message: 'Пароль должен содержать минимум 3 символа', trigger: 'blur' }
  ]
}

// Защита от брутфорса
const MAX_ATTEMPTS = 5
const LOCK_TIME = 30
const attempts = ref(0)
const isLocked = ref(false)
const lockSeconds = ref(LOCK_TIME)
let lockTimer = null

// Очистка таймера при размонтировании компонента
onUnmounted(() => {
  if (lockTimer) {
    clearInterval(lockTimer)
  }
})

const startLock = () => {
  isLocked.value = true
  lockSeconds.value = LOCK_TIME
  
  lockTimer = setInterval(() => {
    lockSeconds.value--
    if (lockSeconds.value <= 0) {
      isLocked.value = false
      attempts.value = 0
      clearInterval(lockTimer)
    }
  }, 1000)
}

const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    // Валидация формы
    const valid = await formRef.value.validate()
    if (!valid) return

    // Очищаем предыдущие ошибки
    authStore.clearError()

    // Выполняем авторизацию
    const result = await authStore.login({
      username: formData.username,
      password: formData.password
    })

    if (result?.success) {
      ElNotification({
        title: 'Успешно',
        message: `Добро пожаловать, ${authStore.userName}!`,
        type: 'success',
        duration: 3000
      })
      
      // Сброс попыток при успешной авторизации
      attempts.value = 0
      
      // Проверяем, есть ли сохраненный маршрут для редиректа
      const redirectPath = sessionStorage.getItem('redirectAfterLogin')
      if (redirectPath) {
        sessionStorage.removeItem('redirectAfterLogin')
        await router.push(redirectPath)
      } else {
        // Переход на главную страницу
        await router.push('/')
      }
    }
  } catch (error) {
    attempts.value++
    
    // Показываем ошибку пользователю
    ElMessage.error(
      error.response?.data?.detail || 
      'Неверный логин или пароль'
    )

    // Блокировка при превышении попыток
    if (attempts.value >= MAX_ATTEMPTS) {
      startLock()
      ElMessage.warning(
        `Слишком много попыток входа. Попробуйте через ${LOCK_TIME} секунд.`
      )
    }
  }
}
</script>

<style lang="scss" scoped>
.el-form {
  width: 100%;
  
  .el-form-item {
    margin-bottom: 16px;
    
    &:last-child {
      margin-bottom: 0;
    }
  }
}

.el-input {
  :deep(.el-input__wrapper) {
    box-shadow: none;
    border: 1px solid #dcdfe6;
    transition: border-color 0.2s;
    border-radius: 8px;
    
    &.is-focus {
      border-color: var(--el-color-primary);
    }
  }
}

.el-button {
  height: 44px;
  font-weight: 500;
  border-radius: 8px;
}
</style>