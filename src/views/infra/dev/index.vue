<script lang="ts" setup>
import LowCodeComponentSelector from '@/components/LowCodeComponentSelector/index.vue'
import LowCodeComponentSelectorGroup from '@/components/LowCodeComponentSelector/LowCodeComponentSelectorGroup.vue'
const componentId = ref('')
const componentIds = ref(['DataModel_1'])
</script>

<template>
  <low-code-component-selector v-model="componentId" />
  <br />
  <div>{{ componentId }}</div>
  <el-divider />
  <low-code-component-selector-group v-model="componentIds" />
  <br />
  <div>{{ componentIds }}</div>
</template>

<style scoped lang="scss"></style>
