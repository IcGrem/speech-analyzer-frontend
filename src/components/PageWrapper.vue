<template>
  <div class="page-wrapper rounded-2xl bg-white shadow-2xl overflow-x-hidden py-8 m-auto max-w-[1400px]">
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
  max-width: 1400px; /* default for <= 1920 */
}
/* >= 1921px: expand to 1800 */
@media (min-width: 1921px) {
  .page-wrapper {
    max-width: 1800px;
  }
}
</style>