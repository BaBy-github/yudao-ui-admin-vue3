<template>
  <Dialog
    :title="'数据模型' + dialogTitle"
    v-model="dialogVisible"
    width="100%"
    :style="{ height: '100vh' }"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      v-loading="formLoading"
    >
      <el-container>
        <el-header class="action-bar" height="5vh" :style="{ padding: '0 0 1vh 0' }">
          <el-row>
            <el-col :span="2">
              <el-dropdown @command="selectSettingCommand">
                <el-button type="info" plain>
                  <Icon icon="fa-solid:bars" />
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item command="a">Action 1</el-dropdown-item>
                    <el-dropdown-item command="b">Action 2</el-dropdown-item>
                    <el-dropdown-item command="c">Action 3</el-dropdown-item>
                    <el-dropdown-item command="e" divided>font size</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </el-col>
            <el-col :offset="19" :span="3" class="runtime-buttons">
              <el-tooltip content="运行">
                <el-button @click="validateSample" type="success" plain>
                  <Icon icon="fa-solid:play" />
                </el-button>
              </el-tooltip>
            </el-col>
          </el-row>
        </el-header>
        <el-container class="editor" :style="{ height: '76vh' }">
          <el-aside class="code-editor" width="50%" :style="{ height: '76vh' }">
            <el-card :style="{ height: '100%' }">
              <monaco-editor v-model="formData.metaData" :style="{ height: '72vh' }" />
            </el-card>
          </el-aside>
          <el-main class="params-editor" :style="{ padding: 0 }">
            <el-container>
              <el-header height="50vh">
                <el-card :style="{ height: '100%' }">
                  <monaco-editor v-model="formData.sample" :style="{ height: '45vh' }" />
                </el-card>
              </el-header>
              <el-footer height="25vh">
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
                <el-card :style="{ height: '100%' }">
                  <template #header>
                    <span>执行结果</span>
                  </template>
                  <div>{{ executeResult }}</div>
                </el-card>
              </el-footer>
            </el-container>
          </el-main>
        </el-container>
      </el-container>

      <!--      <el-form-item label="模型名字" prop="name">-->
      <!--        <el-input v-model="formData.name" placeholder="请输入模型名字" />-->
      <!--      </el-form-item>-->
      <!--      <el-form-item label="描述" prop="description">-->
      <!--        <el-input v-model="formData.description" type="textarea" placeholder="请输入描述" />-->
      <!--      </el-form-item>-->
      <!--      <el-form-item label="状态" prop="status">-->
      <!--        <el-select v-model="formData.status" placeholder="请选择状态">-->
      <!--          <el-option-->
      <!--            v-for="dict in getIntDictOptions(DICT_TYPE.COMMON_STATUS)"-->
      <!--            :key="dict.value"-->
      <!--            :label="dict.label"-->
      <!--            :value="dict.value"-->
      <!--          />-->
      <!--        </el-select>-->
      <!--      </el-form-item>-->
      <!--      <el-form-item label="元数据" prop="metaData">-->
      <!--        <monaco-editor v-model="formData.metaData" class="monaco-editor" />-->
      <!--      </el-form-item>-->
      <!--      <el-form-item label="示例" prop="sample">-->
      <!--        <monaco-editor v-model="formData.sample" class="monaco-editor" />-->
      <!--      </el-form-item>-->
    </el-form>
    <template #footer>
      <el-button @click="submitForm" type="primary" :disabled="formLoading">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>
<script setup lang="ts">
import * as DataModelDefinitionApi from '@/api/bpm/dataModelDefinition'
import 'json-schema-editor-vue/lib/json-schema-editor-vue.css'
import { validateJsonSchema, ValidateReqVO, ValidateResult } from '@/api/bpm/dataModelDefinition'
import * as CloudFunctionApi from '@/api/serverless/cloudFunction'
import * as _ from 'lodash'
import { ElNotification } from 'element-plus'

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('') // 弹窗的标题
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formType = ref('') // 表单的类型：create - 新增；update - 修改
const formData = ref({
  id: undefined,
  name: undefined,
  description: undefined,
  status: undefined,
  metaData: undefined,
  sample: undefined
})
const formRules = reactive({
  name: [{ required: true, message: '模型名字不能为空', trigger: 'blur' }],
  status: [{ required: true, message: '状态不能为空', trigger: 'change' }],
  metaData: [{ required: true, message: '元数据不能为空', trigger: 'blur' }],
  sample: [{ required: true, message: '示例不能为空', trigger: 'blur' }]
})
const formRef = ref() // 表单 Ref

/** 打开弹窗 */
const open = async (type: string, id?: number) => {
  dialogVisible.value = true
  dialogTitle.value = t('action.' + type)
  formType.value = type
  resetForm()
  // 修改时，设置数据
  if (id) {
    formLoading.value = true
    try {
      formData.value = await DataModelDefinitionApi.getDataModelDefinition(id)
    } finally {
      formLoading.value = false
    }
  }
}
defineExpose({ open }) // 提供 open 方法，用于打开弹窗

/** 提交表单 */
const emit = defineEmits(['success']) // 定义 success 事件，用于操作成功后的回调
const submitForm = async () => {
  // 校验表单
  if (!formRef) return
  const valid = await formRef.value.validate()
  if (!valid) return
  // 提交请求
  formLoading.value = true
  try {
    const data = formData.value as unknown as DataModelDefinitionApi.DataModelDefinitionVO
    if (formType.value === 'create') {
      await DataModelDefinitionApi.createDataModelDefinition(data)
      message.success(t('common.createSuccess'))
    } else {
      await DataModelDefinitionApi.updateDataModelDefinition(data)
      message.success(t('common.updateSuccess'))
    }
    dialogVisible.value = false
    // 发送操作成功的事件
    emit('success')
  } finally {
    formLoading.value = false
  }
}

/** 重置表单 */
const resetForm = () => {
  formData.value = {
    id: undefined,
    name: undefined,
    description: undefined,
    status: undefined,
    metaData: undefined,
    sample: undefined
  }
  formRef.value?.resetFields()
}

/** 校验 */
const executeResult = ref<string>('')
const executeStatus = ref<string>('init')
const validateSample = async () => {
  executeStatus.value = 'loading'
  const data: ValidateReqVO = {
    json: formData.value.sample,
    jsonScheme: formData.value.metaData
  }
  const resp: ValidateResult = await DataModelDefinitionApi.validateJsonSchema(data)
  if (resp.success) {
    executeStatus.value = 'success'
    ElNotification.success('执行成功')
    executeResult.value = 'true'
  } else {
    executeStatus.value = 'error'
    ElNotification.error('执行失败。请按提示修复错误')
    executeResult.value = resp.errorMessage
  }
}
</script>
<style scoped>
.monaco-editor {
  width: 100%;
  height: 300px;
}
</style>
