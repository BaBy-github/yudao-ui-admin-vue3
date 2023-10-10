<template>
  <el-space wrap direction="vertical" v-if="refreshCard">
    <el-card v-for="(componentId, index) in componentIds" :key="index">
      <el-space>
        <low-code-component-selector v-model="componentIds[index]" />
        <el-button type="danger" circle @click="removeComponentId(index)"
          ><Icon icon="fa-solid:minus"
        /></el-button>
      </el-space>
    </el-card>
    <el-button circle @click="addComponentId"><Icon icon="fa-solid:plus" /></el-button>
  </el-space>
</template>
<script setup lang="ts">
const props = defineProps<{
  modelValue: string[]
}>()
const refreshCard = ref(true)
const componentIds = computed<any>({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})
const addComponentId = () => {
  refreshCard.value = false
  componentIds.value.push('DataModel:0')
  nextTick(() => {
    refreshCard.value = true
  })
}
const removeComponentId = (index: number) => {
  refreshCard.value = false
  componentIds.value.splice(index, 1)
  nextTick(() => {
    refreshCard.value = true
  })
}
const emit = defineEmits<{
  (e: 'update:modelValue', v: any)
}>()
</script>
