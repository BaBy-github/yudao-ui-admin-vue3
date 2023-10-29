<template>
  <div style="margin-top: 16px">
    {{ fieldsListOfListener }}
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
    <p class="listener-filed__title">
      <span><Icon icon="ep:menu" />注入字段：</span>
      <el-button size="small" type="primary" @click="openListenerFieldForm(null)"
        >添加字段</el-button
      >
    </p>
    <el-table
      :data="fieldsListOfListener"
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
          <el-button size="small" link @click="openListenerFieldForm(scope.row, scope.$index)"
            >编辑</el-button
          >
          <el-divider direction="vertical" />
          <!--          <el-button-->
          <!--            size="small"-->
          <!--            link-->
          <!--            style="color: #ff4d4f"-->
          <!--            @click="removeListenerField(scope.row, scope.$index)"-->
          <!--            >移除</el-button-->
          <!--          >-->
        </template>
      </el-table-column>
    </el-table>
    <!-- 注入西段 编辑/创建 部分 -->
    <el-dialog
      title="字段配置"
      v-model="listenerFieldFormModelVisible"
      width="600px"
      append-to-body
      destroy-on-close
    >
      <el-form
        :model="listenerFieldForm"
        size="small"
        label-width="96px"
        ref="listenerFieldFormRef"
        style="height: 136px"
      >
        <el-form-item
          label="字段名称："
          prop="name"
          :rules="{ required: true, trigger: ['blur', 'change'] }"
        >
          <el-input v-model="listenerFieldForm.name" clearable />
        </el-form-item>
        <el-form-item
          label="字段类型："
          prop="fieldType"
          :rules="{ required: true, trigger: ['blur', 'change'] }"
        >
          <el-select v-model="listenerFieldForm.fieldType">
            <el-option
              v-for="i in Object.keys(fieldTypeObject)"
              :key="i"
              :label="fieldTypeObject[i]"
              :value="i"
            />
          </el-select>
        </el-form-item>
        <el-form-item
          v-if="listenerFieldForm.fieldType === 'string'"
          label="字段值："
          prop="string"
          key="field-string"
          :rules="{ required: true, trigger: ['blur', 'change'] }"
        >
          <el-input v-model="listenerFieldForm.string" clearable />
        </el-form-item>
        <el-form-item
          v-if="listenerFieldForm.fieldType === 'expression'"
          label="表达式："
          prop="expression"
          key="field-expression"
          :rules="{ required: true, trigger: ['blur', 'change'] }"
        >
          <el-input v-model="listenerFieldForm.expression" clearable />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button size="small" @click="listenerFieldFormModelVisible = false">取 消</el-button>
        <el-button size="small" type="primary" @click="saveListenerFiled">确 定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { fieldType } from '@/components/bpmnProcessDesigner/package/penal/listeners/utilSelf'
import * as _ from 'lodash'

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
const fieldsListOfListener = ref<any>([])
const fieldTypeObject = ref(fieldType)
const listenerFieldFormRef = ref()
const listenerFieldForm = ref<any>({}) // 监听器 注入字段 详情表单
const editingListenerFieldIndex = ref(-1) // 字段所在下标，-1 为新增
const listenerFieldFormModelVisible = ref(false) // 注入字段表单弹窗 显示状态
const listenerForm = ref<any>({})

// 打开字段编辑弹窗
const openListenerFieldForm = (field, index?) => {
  listenerFieldForm.value = field ? JSON.parse(JSON.stringify(field)) : {}
  editingListenerFieldIndex.value = field ? index : -1
  listenerFieldFormModelVisible.value = true
  nextTick(() => {
    if (listenerFieldFormRef.value) listenerFieldFormRef.value.clearValidate()
  })
}
// 保存监听器注入字段
const saveListenerFiled = async () => {
  // let validateStatus = await listenerFieldFormRef.value.validate()
  // if (!validateStatus) return // 验证不通过直接返回
  // if (editingListenerFieldIndex.value === -1) {
  //   fieldsListOfListener.value.push(listenerFieldForm.value)
  //   // listenerForm.value.fields.push(listenerFieldForm.value)
  // } else {
  //   fieldsListOfListener.value.splice(editingListenerFieldIndex.value, 1, listenerFieldForm.value)
  //   // listenerForm.value.fields.splice(editingListenerFieldIndex.value, 1, listenerFieldForm.value)
  // }
  // listenerFieldFormModelVisible.value = false
  // nextTick(() => {
  //   listenerFieldForm.value = {}
  // })
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
  fieldsListOfListener.value = _.map(fields, (field) => ({
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
