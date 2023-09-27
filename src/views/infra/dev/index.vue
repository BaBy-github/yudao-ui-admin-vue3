<script lang="ts" setup>
import LowCodeComponentSelector from '@/components/LowCodeComponentSelector/index.vue'
const componentId = ref('')
</script>

<template>
  <low-code-component-selector v-model="componentId" /><div>{{ componentId }}</div>
</template>

<style scoped lang="scss"></style>
