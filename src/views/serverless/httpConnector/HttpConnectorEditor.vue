<template>
  <Dialog
    :title="'云函数' + formData.name"
    v-model="dialogVisible"
    width="100%"
    :style="{ height: '100vh' }"
  >
    <el-form ref="formRef" :model="formData" :rules="formRules" v-loading="formLoading">
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
                    <el-dropdown-item command="rename">重命名</el-dropdown-item>
                    <el-dropdown-item command="b">Action 2</el-dropdown-item>
                    <el-dropdown-item command="c">Action 3</el-dropdown-item>
                    <el-dropdown-item command="e" divided>font size</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </el-col>
            <el-col :offset="19" :span="3" class="runtime-buttons">
              <el-tooltip content="运行">
                <el-button @click="execute" type="success" plain>
                  <Icon icon="fa-solid:play" />
                </el-button>
              </el-tooltip>
            </el-col>
          </el-row>
        </el-header>
        <el-main class="params-editor" :style="{ padding: 0 }">
          <el-container class="editor">
            <el-main class="params-editor" :style="{ padding: 0 }">
              <el-container>
                <el-header height="48vh" :style="{ padding: 0 }">
                  <el-card>
                    <el-row>
                      <el-col :span="4">
                        <el-select
                          v-model="formData.method"
                          placeholder="请选择请求方法"
                          size="large"
                        >
                          <el-option
                            v-for="dict in getIntDictOptions(DICT_TYPE.HTTP_METHOD_TYPE)"
                            :key="dict.value"
                            :label="dict.label"
                            :value="dict.label"
                          />
                        </el-select>
                      </el-col>
                      <el-col :span="20">
                        <el-input
                          v-model="formData.url"
                          placeholder="请输入请求地址"
                          size="large"
                        />
                      </el-col>
                    </el-row>
                    <el-tabs>
                      <el-tab-pane label="Params" :style="{ height: '30vh' }">
                        <key-value-editor
                          v-model="paramsKeyValues"
                          ref="paramsKeyValuesEditorRef"
                        />
                      </el-tab-pane>
                      <el-tab-pane label="Authorization" :style="{ height: '30vh' }">
                        <el-select v-model="authConfig.type">
                          <el-option
                            v-for="authConfigTypeOption in authConfigTypeOptions"
                            :label="authConfigTypeOption.label"
                            :key="authConfigTypeOption.value"
                            :value="authConfigTypeOption.value"
                          />
                        </el-select>
                      </el-tab-pane>
                      <el-tab-pane label="Headers" :style="{ height: '30vh' }">
                        <key-value-editor
                          v-model="headersKeyValues"
                          ref="headersKeyValuesEditorRef"
                        />
                      </el-tab-pane>
                      <el-tab-pane label="Body" :style="{ height: '30vh' }">
                        <monaco-editor v-model="formData.body" />
                      </el-tab-pane>
                    </el-tabs>
                  </el-card>
                </el-header>
                <el-main :style="{ padding: 0 }">
                  <el-card>
                    <monaco-editor v-model="executeResponseBody" />
                  </el-card>
                </el-main>
              </el-container>
            </el-main>
            <el-aside class="code-editor" width="30%" :style="{ height: '76vh' }"> 1</el-aside>
          </el-container>
        </el-main>
      </el-container>
      <!--      <el-form-item label="连接器名" prop="name">-->
      <!--        <el-input v-model="formData.name" placeholder="请输入连接器名" />-->
      <!--      </el-form-item>-->
      <!--      <el-form-item label="请求方法" prop="method">-->
      <!--        <el-select v-model="formData.method" placeholder="请选择请求方法">-->
      <!--          <el-option-->
      <!--            v-for="dict in getIntDictOptions(DICT_TYPE.HTTP_METHOD_TYPE)"-->
      <!--            :key="dict.value"-->
      <!--            :label="dict.label"-->
      <!--            :value="dict.value"-->
      <!--          />-->
      <!--        </el-select>-->
      <!--      </el-form-item>-->
      <!--      <el-form-item label="请求地址" prop="url">-->
      <!--        <el-input v-model="formData.url" placeholder="请输入请求地址" />-->
      <!--      </el-form-item>-->
      <!--      <el-form-item label="请求头" prop="headers">-->
      <!--        <el-input v-model="formData.headers" type="textarea" placeholder="请输入请求头" />-->
      <!--      </el-form-item>-->
      <!--      <el-form-item label="请求参数" prop="params">-->
      <!--        <el-input v-model="formData.params" type="textarea" placeholder="请输入请求参数" />-->
      <!--      </el-form-item>-->
      <!--      <el-form-item label="请求体" prop="body">-->
      <!--        <el-input v-model="formData.body" type="textarea" placeholder="请输入请求体" />-->
      <!--      </el-form-item>-->
      <!--      <el-form-item label="响应" prop="response">-->
      <!--        <el-input v-model="formData.response" placeholder="请输入响应" />-->
      <!--      </el-form-item>-->
      <!--      <el-form-item label="描述">-->
      <!--        <Editor v-model="formData.description" height="150px" />-->
      <!--      </el-form-item>-->
      <!--      <el-form-item label="状态" prop="status">-->
      <!--        <el-radio-group v-model="formData.status">-->
      <!--          <el-radio-->
      <!--            v-for="dict in getIntDictOptions(DICT_TYPE.COMMON_STATUS)"-->
      <!--            :key="dict.value"-->
      <!--            :label="dict.value"-->
      <!--          >-->
      <!--            {{ dict.label }}-->
      <!--          </el-radio>-->
      <!--        </el-radio-group>-->
      <!--      </el-form-item>-->
    </el-form>
    <template #footer>
      <el-button @click="submitForm" type="primary" :disabled="formLoading">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>
<script setup lang="ts">
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import * as HttpConnectorApi from '@/api/bpm/httpConnector'
import * as _ from 'lodash'
import KeyValueEditor from '@/components/KeyValueEditor/index.vue'

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('') // 弹窗的标题
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formType = ref('') // 表单的类型：create - 新增；update - 修改
const formData = ref({
  id: 0,
  name: '',
  method: 'GET',
  url: '',
  headers: '[]',
  params: '[]',
  authConfig: '',
  body: '',
  response: '',
  description: '',
  status: 0
})
const formRules = reactive({
  name: [{ required: true, message: '连接器名不能为空', trigger: 'blur' }],
  status: [{ required: true, message: '状态不能为空', trigger: 'blur' }]
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
    // formLoading.value = true
    try {
      formData.value = await HttpConnectorApi.getHttpConnector(id)
      paramsKeyValues.value = JSON.parse(_.get(formData, 'value.params', '[]'))
      if (paramsKeyValuesEditorRef) {
        paramsKeyValuesEditorRef.value.addKeyValueItemNextTick(-1)
      }
      headersKeyValues.value = JSON.parse(_.get(formData, 'value.headers', '[]'))
      if (headersKeyValuesEditorRef) {
        headersKeyValuesEditorRef.value.addKeyValueItemNextTick(-1)
      }
      headersKeyValues.value = JSON.parse(_.get(formData, 'value.headers', '[]'))
      authConfig.value.type = JSON.parse(_.get(formData, 'value.authConfig.type', 'noAuth'))
    } finally {
      formLoading.value = false
    }
  }
}
defineExpose({ open }) // 提供 open 方法，用于打开弹窗

/** Params */
const paramsKeyValues = ref<KeyValueItem[]>([])
const paramsKeyValuesEditorRef = ref()
/** Headers */
const headersKeyValues = ref<KeyValueItem[]>([])
const headersKeyValuesEditorRef = ref()
/** Authorization */
const authConfigTypeOptions = ref([
  { label: 'No Auth', value: 'noAuth' },
  { label: 'My System Token', value: 'mySystemToken' }
])
const authConfig = ref<AuthConfig>({ type: authConfigTypeOptions.value[0].value })
interface AuthConfig {
  type: string
}
/** 执行连接器 */
interface ExecuteResult {
  httpStatus: number
  httpResult: object
  body: string
}
const executeResponseBody = ref<string>('')
const execute = async () => {
  const resp: ExecuteResult = await HttpConnectorApi.executeHttpConnector({
    params: JSON.stringify(paramsKeyValuesEditorRef.value.getNotEmptyKeyValueItems()),
    headers: JSON.stringify(headersKeyValuesEditorRef.value.getNotEmptyKeyValueItems()),
    body: formData.value.body,
    method: formData.value.method,
    url: formData.value.url
  })
  executeResponseBody.value = resp.body
}

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
    const data = formData.value as unknown as HttpConnectorApi.HttpConnectorVO
    data.params = JSON.stringify(paramsKeyValuesEditorRef.value.getNotEmptyKeyValueItems())
    data.headers = JSON.stringify(headersKeyValuesEditorRef.value.getNotEmptyKeyValueItems())
    data.authConfig = JSON.stringify(authConfig.value)
    if (formType.value === 'create') {
      await HttpConnectorApi.createHttpConnector(data)
      message.success(t('common.createSuccess'))
    } else {
      await HttpConnectorApi.updateHttpConnector(data)
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
    id: 0,
    name: '',
    method: 'GET',
    url: '',
    headers: '[]',
    params: '[]',
    body: '',
    authConfig: '{"type":"noAuth"}',
    response: '',
    description: '',
    status: 0
  }
  formRef.value?.resetFields()
}
</script>
