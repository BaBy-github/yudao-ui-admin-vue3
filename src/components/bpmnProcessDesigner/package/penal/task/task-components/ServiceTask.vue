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

    <http-connector-editor ref="httpConnectorEditorRef" @success="updateServiceTaskDocumentation" />
    <p class="listener-filed__title">
      <span><Icon icon="ep:menu" />注入字段：</span>
      <el-button size="small" disabled type="primary" @click="openServiceTaskFieldForm(null)"
        >添加字段</el-button
      >
    </p>
    <el-table
      :data="fieldsListOfServiceTask"
      size="small"
      max-height="240"
      fit
      border
      style="flex: none"
    >
      <el-table-column label="序号" width="50px" type="index" />
      <el-table-column label="字段名称" min-width="100px" prop="name" />
      <el-table-column
        label="字段类型"
        min-width="80px"
        show-overflow-tooltip
        :formatter="(row) => fieldTypeObject[row.fieldType]"
      />
      <el-table-column
        label="字段值/表达式"
        min-width="100px"
        show-overflow-tooltip
        :formatter="(row) => row.stringValue || row.expression"
      />
      <el-table-column label="操作" width="100px">
        <template #default="scope">
          <el-button
            size="small"
            disabled
            link
            @click="openServiceTaskFieldForm(scope.row, scope.$index)"
            >编辑</el-button
          >
          <el-divider direction="vertical" />
          <el-button
            size="small"
            disabled
            link
            style="color: #ff4d4f"
            @click="removeListenerField(scope.row, scope.$index)"
            >移除</el-button
          >
        </template>
      </el-table-column>
    </el-table>
    <XButton
      type="primary"
      preIcon="ep:plus"
      title="编辑连接器"
      @click="editHttpConnectorDocumentation"
    />
    <!-- 注入西段 编辑/创建 部分 -->
    <el-dialog
      title="字段配置"
      v-model="serviceTaskFieldFormModelVisible"
      width="600px"
      append-to-body
      destroy-on-close
    >
      <el-form
        :model="serviceTaskFieldForm"
        size="small"
        label-width="96px"
        ref="serviceTaskFieldFormRef"
        style="height: 136px"
      >
        <el-form-item
          label="字段名称："
          prop="name"
          :rules="{ required: true, trigger: ['blur', 'change'] }"
        >
          <el-input v-model="serviceTaskFieldForm.name" clearable />
        </el-form-item>
        <el-form-item
          label="字段类型："
          prop="fieldType"
          :rules="{ required: true, trigger: ['blur', 'change'] }"
        >
          <el-select v-model="serviceTaskFieldForm.fieldType">
            <el-option
              v-for="i in Object.keys(fieldTypeObject)"
              :key="i"
              :label="fieldTypeObject[i]"
              :value="i"
            />
          </el-select>
        </el-form-item>
        <el-form-item
          v-if="serviceTaskFieldForm.fieldType === 'string'"
          label="字段值："
          prop="stringValue"
          key="field-string"
          :rules="{ required: true, trigger: ['blur', 'change'] }"
        >
          <el-input v-model="serviceTaskFieldForm.stringValue" clearable />
        </el-form-item>
        <el-form-item
          v-if="serviceTaskFieldForm.fieldType === 'expression'"
          label="表达式："
          prop="expression"
          key="field-expression"
          :rules="{ required: true, trigger: ['blur', 'change'] }"
        >
          <el-input v-model="serviceTaskFieldForm.expression" clearable />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button size="small" @click="serviceTaskFieldFormModelVisible = false">取 消</el-button>
        <el-button size="small" type="primary" @click="saveServiceTaskField">确 定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { fieldType } from '@/components/bpmnProcessDesigner/package/penal/listeners/utilSelf'
import * as _ from 'lodash'
import {
  getElementDocumentation,
  setElementDocumentation,
  updateElementExtensions
} from '@/components/bpmnProcessDesigner/package/utils'
import HttpConnectorEditor from '@/views/serverless/httpConnector/HttpConnectorEditor.vue'
import { getRealId, lowCodeComponentIs } from '@/utils/lowCodeComponent'
import { LowCodeComponentTypeEnum } from '@/utils/constants'

defineOptions({ name: 'ScriptTask' })
const props = defineProps({
  id: String,
  type: String
})

const prefix = inject('prefix')
const defaultTaskForm = ref({
  class: '',
  expression: '',
  delegateExpression: '',
  resultVariable: ''
})
const serviceTaskForm = ref<any>({})
const bpmnElement = ref()

const bpmnInstances = () => (window as any)?.bpmnInstances

// field
const fieldsListOfServiceTask = ref<any>([])
const fieldTypeObject = ref(fieldType)
const serviceTaskFieldFormRef = ref()
const serviceTaskFieldForm = ref<any>({}) // Service Task 注入字段 详情表单
const editingServiceTaskFieldIndex = ref(-1) // 字段所在下标，-1 为新增
const serviceTaskFieldFormModelVisible = ref(false) // 注入字段表单弹窗 显示状态

// 打开字段编辑弹窗
const openServiceTaskFieldForm = (field, index?) => {
  serviceTaskFieldForm.value = field ? JSON.parse(JSON.stringify(field)) : {}
  editingServiceTaskFieldIndex.value = field ? index : -1
  serviceTaskFieldFormModelVisible.value = true
  nextTick(() => {
    if (serviceTaskFieldFormRef.value) serviceTaskFieldFormRef.value.clearValidate()
  })
}
// 保存java类注入字段
const saveServiceTaskField = async () => {
  let validateStatus = await serviceTaskFieldFormRef.value.validate()
  if (!validateStatus) return // 验证不通过直接返回
  if (editingServiceTaskFieldIndex.value === -1) {
    fieldsListOfServiceTask.value.push(serviceTaskFieldForm.value)
  } else {
    fieldsListOfServiceTask.value.splice(
      editingServiceTaskFieldIndex.value,
      1,
      serviceTaskFieldForm.value
    )
  }
  updateElementExtensions(bpmnElement.value, fieldsListOfServiceTask.value)
  console.log(bpmnInstances().bpmnElement.businessObject.extensionElements)
  serviceTaskFieldFormModelVisible.value = false
  nextTick(() => {
    serviceTaskFieldForm.value = {}
  })
}

const resetTaskForm = () => {
  for (let key in defaultTaskForm.value) {
    let value = bpmnElement.value?.businessObject[key] || defaultTaskForm.value[key]
    serviceTaskForm.value[key] = value
  }
  const fields =
    bpmnElement.value?.businessObject.extensionElements.values.filter(
      (ex) => ex.$type === `${prefix}:Field`
    ) ?? []
  fieldsListOfServiceTask.value = _.map(fields, (field) => ({
    ...field,
    fieldType: field.stringValue ? 'string' : 'expression'
  }))
}
const updateElementTask = () => {
  let taskAttr = Object.create(null)
  taskAttr.class = serviceTaskForm.value.class || null
  taskAttr.expression = serviceTaskForm.value.expression || null
  taskAttr.delegateExpression = serviceTaskForm.value.delegateExpression || null
  taskAttr.resultVariable = serviceTaskForm.value.resultVariable || null
  console.log('updateElementTask  taskAttr', taskAttr)

  bpmnInstances().modeling.updateProperties(toRaw(bpmnElement.value), taskAttr)
}

// 编辑流程引用的http连接器实例
const httpConnectorEditorRef = ref<any>()
const editingComponentId = ref<string>('')
const editHttpConnectorDocumentation = () => {
  editingComponentId.value = _.find(fieldsListOfServiceTask.value, { name: 'lowCodeComponentId' })
    ?.stringValue
  if (_.isEmpty(editingComponentId.value)) return
  if (lowCodeComponentIs(LowCodeComponentTypeEnum.HTTP_CONNECTOR, editingComponentId.value)) {
    const documentation = getElementDocumentation(bpmnElement.value)
    const documentationMap = JSON.parse(_.isEmpty(documentation) ? '{}' : documentation)
    httpConnectorEditorRef.value.open(
      'serviceTask',
      getRealId(editingComponentId.value),
      documentationMap[editingComponentId.value]
    )
  }
}
const updateServiceTaskDocumentation = (httpConnector) => {
  const documentationStr = getElementDocumentation(bpmnElement.value)
  const documentationObj = JSON.parse(_.isEmpty(documentationStr) ? '{}' : documentationStr)
  documentationObj[editingComponentId.value] = httpConnector
  setElementDocumentation(bpmnElement.value, JSON.stringify(documentationObj))
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
