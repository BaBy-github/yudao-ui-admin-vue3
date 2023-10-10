<template>
  <Dialog :title="'组件绑定'" v-model="dialogVisible" width="50%">
    <el-form ref="formRef" :model="formData" :rules="formRules" v-loading="formLoading">
      <el-scrollbar height="50vh">
        <low-code-component-selector-group v-model="formData.componentRefs" />
      </el-scrollbar>
    </el-form>
    <template #footer>
      <el-button @click="submitForm" type="primary" :disabled="formLoading">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>
<script setup lang="ts">
import * as _ from 'lodash'
import * as ComponentRefApi from '@/api/bpm/componentRef'
import { ElMessage } from 'element-plus'

const { t } = useI18n()

const props = defineProps<{
  selfComponentId: string
  allowSelectComponentType: string[]
}>()
const dialogVisible = ref(false) // 弹窗的是否展示
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formData = ref({
  componentRefs: []
})
const refComponentIds = ref<string[]>([])
const formRules = reactive({
  name: [{ required: true, message: '模型名字不能为空', trigger: 'blur' }],
  sample: [{ required: true, message: '示例不能为空', trigger: 'blur' }]
})
const open = async () => {
  dialogVisible.value = true
  if (props.selfComponentId) {
    formLoading.value = true
    try {
      const componentRefs = await ComponentRefApi.getComponentRefList(props.selfComponentId)
      formData.value.componentRefs = _.map(componentRefs, 'refComponentId')
    } finally {
      formLoading.value = false
    }
  }
}
/** 提交表单 */
const emit = defineEmits(['success']) // 定义 success 事件，用于操作成功后的回调
const formRef = ref()
const submitForm = async () => {
  // 校验表单
  if (!formRef) return
  const valid = await formRef.value.validate()
  if (!valid) return
  // 提交请求
  formLoading.value = true
  try {
    dialogVisible.value = false
    await ComponentRefApi.bindingComponentRefs(props.selfComponentId, formData.value.componentRefs)
    ElMessage.success(t('common.updateSuccess'))
    // 发送操作成功的事件
    emit('success')
  } finally {
    formLoading.value = false
  }
}

defineExpose({ open }) // 提供 open 方法，用于打开弹窗
</script>
