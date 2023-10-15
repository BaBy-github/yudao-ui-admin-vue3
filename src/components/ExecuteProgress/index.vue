<template>
  <el-progress
    v-if="executeStatus === 'success'"
    :percentage="100"
    status="success"
    :show-text="false"
  />
  <el-progress
    v-else-if="executeStatus === 'loading'"
    :percentage="100"
    status="success"
    :indeterminate="true"
    :duration="1"
    :show-text="false"
  />
  <el-progress
    v-else-if="executeStatus === 'error'"
    :percentage="100"
    status="exception"
    :show-text="false"
  />
  <el-progress v-else :percentage="100" :show-text="false" />
</template>
<script lang="ts" setup>
const executeStatus = ref<string>('init')

const success = () => {
  executeStatus.value = 'success'
}
const loading = () => {
  executeStatus.value = 'loading'
}
const error = () => {
  executeStatus.value = 'error'
}
defineExpose({ success, loading, error })
</script>
