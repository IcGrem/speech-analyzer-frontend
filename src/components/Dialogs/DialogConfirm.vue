<template>
  <el-dialog
    v-model="modelValueProxy"
    :title="titleText"
    width="500"
    align-center
    @close="onCancel"
  >
    <span>{{ messageText }}</span>
    <template #footer>
      <div class="flex justify-end gap-2">
        <el-button @click="onCancel">{{ cancelTextValue }}</el-button>
        <el-button type="primary" @click="onConfirm">{{ confirmTextValue }}</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const emit = defineEmits(['update:modelValue', 'confirm', 'cancel'])
const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true
  },
  title: {
    type: String,
    default: 'Подтверждение'
  },
  message: {
    type: String,
    default: 'Вы уверены?'
  },
  confirmText: {
    type: String,
    default: 'ОК'
  },
  cancelText: {
    type: String,
    default: 'Отмена'
  }
})

const modelValueProxy = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

// Computed свойства для переводов с fallback на дефолтные значения
const titleText = computed(() => props.title || t('common.confirm'))
const messageText = computed(() => props.message || t('messages.confirmAction'))
const confirmTextValue = computed(() => props.confirmText || t('common.ok'))
const cancelTextValue = computed(() => props.cancelText || t('common.cancel'))

const onConfirm = () => {
  emit('confirm')
  emit('update:modelValue', false)
}

const onCancel = () => {
  emit('cancel')
  emit('update:modelValue', false)
}
</script>

<style lang="scss" scoped>
</style>