<template>
  <div class="w-[400px] shadow-md rounded-2xl bg-white flex items-center flex-col p-6">
    <p class="text-2xl font-medium mb-3">Авторизация</p>
    <el-form
      autocomplete="off"
      :rules="rules"
      class="form__login flex flex-col gap-4"
    >
      <div>
        <p>Логин</p>
        <el-input
          :class="v.data.login.$error && (v.data.login.$dirty || triedSubmit) ? 'input__error' : ''"
          size="large"
          v-model="v.data.login.$model"
          :errors="v.data.login.$error"
          @blur="v.data.login.$touch"
          @input="v.data.login.$touch"
          autocomplete="off"
        />
        <p class="form__error" v-for="error in v.data.login.$errors" v-if="v.data.login.$dirty || triedSubmit">{{ error.$message }}</p>
      </div>
      <div>
        <p>Пароль</p>
        <el-input
          type="password"
          show-password
          :class="v.data.password.$error && (v.data.password.$dirty || triedSubmit) ? 'input__error' : ''"
          size="large"
          v-model="v.data.password.$model"
          :errors="v.data.password.$error"
          @blur="v.data.password.$touch"
          @input="v.data.password.$touch"
          autocomplete="off"
        />
        <p class="form__error" v-for="error in v.data.password.$errors" v-if="v.data.password.$dirty || triedSubmit">{{ error.$message }}</p>
      </div>
      <el-button :disabled="(triedSubmit && v.$invalid) || isLocked" @click="submit" type="primary" class="w-full mt-4" size="large">
        <template v-if="isLocked">Заблокировано ({{ lockSeconds }})</template>
        <template v-else>Войти</template>
      </el-button>
    </el-form>
  </div>
</template>

<script setup>
import useVuelidate from '@vuelidate/core'
import { useRouter } from 'vue-router'
import { ElNotification } from 'element-plus';
import {helpers, email, required} from '@vuelidate/validators'
import { reactive, ref, computed } from 'vue'
import { useAuthStore } from '@/store/auth'

const router = useRouter()
const authStore = useAuthStore()

const valid = ref(true)
const data = reactive({
  login: '',
  password: ''
})
const triedSubmit = ref(false)
const rules = computed(() => ({
  data: {
    login: {
      email: helpers.withMessage('Вы ввели неверный email', email),
      required : helpers.withMessage('Это поле обязательное', required),
    },
    password:{
      required : helpers.withMessage('Это поле обязательное', required),
    },
  }
}))
const v = useVuelidate(rules,  {data} )

// Брутфорс защита
const MAX_ATTEMPTS = 5
const LOCK_TIME = 30 // секунд
const attempts = ref(0)
const isLocked = ref(false)
const lockSeconds = ref(LOCK_TIME)
let lockTimer = null

function startLock() {
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

const submit = async () => {
  triedSubmit.value = true
  valid.value = await v.value.$validate()
  if (valid.value) {
    // Здесь должна быть логика авторизации
    // Если авторизация неуспешна, увеличиваем attempts
    // Пример:
    // const success = await loginApi(data.login, data.password)
    // if (!success) { ... }
    // Для примера считаем, что всегда ошибка:
    // attempts.value++
    // if (attempts.value >= MAX_ATTEMPTS) {
    //   startLock()
    // }
    try {
      // Имитация API запроса авторизации
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Создаем фейковые данные пользователя
      const userData = {
        id: 1,
        name: data.login.split('@')[0],
        email: data.login,
        role: 'admin'
      }
      
      const token = 'fake-jwt-token-' + Date.now()
      
      // Сохраняем данные через auth store
      authStore.login(userData, token)
      
      ElNotification({
        title: 'Успешно',
        message: 'Вы успешно вошли в систему',
        type: 'success',
        duration: 3000
      })
      
      await router.push({name: 'Home'})
    } catch (error) {
      console.error('Ошибка авторизации:', error)
      attempts.value++
      if (attempts.value >= MAX_ATTEMPTS) {
        startLock()
      }
      
      ElNotification({
        title: 'Ошибка',
        message: 'Неверный логин или пароль',
        type: 'error',
        duration: 5000
      })
    }
  } else {
    ElNotification({
      title: 'Ошибка',
      message: 'Пожалуйста, исправьте ошибки в форме',
      type: 'error',
    })
  }
}
</script>

<style lang="scss" scoped>
.form__login {
  width: 100%;
  .el-form-item  {
    display: flex;
    flex-direction: column;
    width: 100%;
    & > .el-form-item__label {
      width: 100%;
      justify-content: flex-start;
      text-align: left;
    }
    .el-form-item__label-wrapper {
      width: 100%;
      margin: 0 !important;
    }
  }

  .el-form-item__content {
    width: 100%;
  }
}
.el-input {
  ::v-deep .el-input__wrapper {
    box-shadow: none;
    border: 1px solid #dcdfe6;
    &.is-focus {
      border-color: var(--el-color-primary);
    }
  }
  &.input__error {
    ::v-deep .el-input__wrapper {
      box-shadow: none;
      border-color: var(--el-color-danger);
    }
  }
  & + .form__error {
    color: var(--el-color-danger);
  }
}
</style>