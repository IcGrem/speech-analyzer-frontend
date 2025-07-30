<template>
  <div class="page-wrapper rounded-2xl bg-white shadow-2xl overflow-x-hidden py-8 max-w-[1300px] m-auto">
    <el-scrollbar>
      <div class="px-8 w-full">
      <PageTitle :title="title" />
        <slot/>
      </div>
    </el-scrollbar>
  </div>
</template>

<script setup>
const props = defineProps(['title'])
</script>

<style lang="scss" scoped>
.page-wrapper {
  height: calc(100vh - 100px);
}
</style>