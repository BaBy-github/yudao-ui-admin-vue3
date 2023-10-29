<template>
  <div style="margin-top: 16px">
    <el-form-item label="执行java类">
      <el-input
        v-model="serviceTaskForm.class"
        clearable
        @input="updateElementTask()"
        @change="updateElementTask()"
      />
    </el-form-item>
    <el-form-item label="expression">
      <el-input
        v-model="serviceTaskForm.expression"
        clearable
        @input="updateElementTask()"
        @change="updateElementTask()"
      />
    </el-form-item>
    <el-form-item label="delegateExpression">
      <el-input
        v-model="serviceTaskForm.delegateExpression"
        clearable
        @input="updateElementTask()"
        @change="updateElementTask()"
      />
    </el-form-item>
    <el-form-item label="结果变量">
      <el-input
        v-model="serviceTaskForm.resultVariable"
        clearable
        @input="updateElementTask()"
        @change="updateElementTask()"
      />
    </el-form-item>
  </div>
</template>

<script lang="ts" setup>
defineOptions({ name: 'ScriptTask' })
const props = defineProps({
  id: String,
  type: String
})
const defaultTaskForm = ref({
  class: '',
  expression: '',
  delegateExpression: '',
  resultVariable: ''
})
const serviceTaskForm = ref<any>({})
const bpmnElement = ref()

const bpmnInstances = () => (window as any)?.bpmnInstances

const resetTaskForm = () => {
  for (let key in defaultTaskForm.value) {
    let value = bpmnElement.value?.businessObject[key] || defaultTaskForm.value[key]
    serviceTaskForm.value[key] = value
  }
}
const updateElementTask = () => {
  let taskAttr = Object.create(null)
  taskAttr.class = serviceTaskForm.value.class || null
  taskAttr.expression = serviceTaskForm.value.expression || null
  taskAttr.delegateExpression = serviceTaskForm.value.delegateExpression || null
  taskAttr.resultVariable = serviceTaskForm.value.resultVariable || null

  bpmnInstances().modeling.updateProperties(toRaw(bpmnElement.value), taskAttr)
}

onBeforeUnmount(() => {
  bpmnElement.value = null
})

watch(
  () => props.id,
  () => {
    bpmnElement.value = bpmnInstances().bpmnElement
    nextTick(() => {
      resetTaskForm()
    })
  },
  { immediate: true }
)
</script>
