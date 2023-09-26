<template>
  {{ selectedComponentType }}:{{ selectedComponentId }}
  <el-space wrap :size="20">
    <el-select v-model="selectedComponentType" class="m-2" placeholder="Select">
      <el-option
        v-for="lowCodeComponentTypeOption in lowCodeComponentTypeOptions"
        :key="lowCodeComponentTypeOption.value"
        :label="lowCodeComponentTypeOption.label"
        :value="lowCodeComponentTypeOption.value"
      />
    </el-select>
    <el-input v-model="selectedComponentId" />
    <el-button :icon="Search" circle @click="searchComponent" />
    <Dialog title="搜索组件" width="100%" :style="{ height: '100vh' }" v-model="dialogVisible">
      <data-model-search
        v-if="selectedComponentType === 'DataModel'"
        @update:selected-id="updateSelectedComponentId"
      />
      <cloud-function-search
        v-else-if="selectedComponentType === 'CloudFunction'"
        @update:selected-id="updateSelectedComponentId"
      />
      <http-connector-search
        v-else-if="selectedComponentType === 'HttpConnector'"
        @update:selected-id="updateSelectedComponentId"
      />
      <http-receiver-search
        v-else-if="selectedComponentType === 'HttpReceiver'"
        @update:selected-id="updateSelectedComponentId"
      />
    </Dialog>
  </el-space>
</template>
<script setup lang="ts">
import { Search } from '@element-plus/icons-vue'
import DataModelSearch from '@/views/bpm/dataModel/index.vue'
import CloudFunctionSearch from '@/views/serverless/cloudFunction/index.vue'
import HttpConnectorSearch from '@/views/serverless/httpConnector/index.vue'
import HttpReceiverSearch from '@/views/serverless/httpReceiver/index.vue'

const emit = defineEmits<{
  (e: 'update:modelValue', v: any)
}>()
const props = defineProps<{
  modelValue: any
}>()
const componentId = computed<any>({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})
const lowCodeComponentTypeOptions = ref<any>([
  { lable: 'DataModel', value: 'DataModel' },
  { lable: 'CloudFunction', value: 'CloudFunction' },
  { lable: 'HttpConnector', value: 'HttpConnector' },
  { lable: 'HttpReceiver', value: 'HttpReceiver' }
])
const selectedComponentType = ref<string>('DataModel')
const selectedComponentId = ref<string>('')
const updateSelectedComponentId = (selectedId) => {
  selectedComponentId.value = selectedId
}
const searchComponent = () => {
  dialogVisible.value = true
}
const dialogVisible = ref<boolean>(false)
</script>
<script setup lang="ts"></script>
