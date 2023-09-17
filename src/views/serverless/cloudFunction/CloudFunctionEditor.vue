<template>
  <Dialog
    :title="'云函数' + formData.name + (isOutstandingCloudFunction ? '<outstanding>' : '')"
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
                    <el-dropdown-item command="rename">重命名</el-dropdown-item>
                    <el-dropdown-item command="b">Action 2</el-dropdown-item>
                    <el-dropdown-item command="c">Action 3</el-dropdown-item>
                    <el-dropdown-item command="e" divided>font size</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </el-col>
            <el-col :offset="19" :span="3" class="runtime-buttons">
              <el-dropdown split-button @command="switchSameGroupCloudFunction" trigger="click">
                {{ formData.name }}
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item :command="outstandingCloudFunction.id">
                      <el-row :style="{ width: '150px' }">
                        <el-col :span="3"
                          ><Icon
                            v-if="formData.id === outstandingCloudFunction.id"
                            icon="fa-solid:circle"
                            :size="10"
                            color="#409EFF"
                        /></el-col>
                        <el-col :span="12">{{ outstandingCloudFunction.name }}</el-col>
                      </el-row>
                    </el-dropdown-item>
                    <el-dropdown-item
                      v-for="(cloudFunction, index) in sameGroupCloudFunctions"
                      :divided="index === 0"
                      :command="cloudFunction.id"
                      :key="cloudFunction.id"
                    >
                      <el-row :style="{ width: '150px' }">
                        <el-col :span="3"
                          ><Icon
                            v-if="formData.id === cloudFunction.id"
                            icon="fa-solid:circle"
                            :size="10"
                            color="#409EFF"
                        /></el-col>
                        <el-col :span="12">{{ cloudFunction.name }}</el-col>
                      </el-row>
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
              <el-tooltip content="运行">
                <el-button @click="execute" type="success" plain>
                  <Icon icon="fa-solid:play" />
                </el-button>
              </el-tooltip>
            </el-col>
          </el-row>
        </el-header>
        <el-container class="editor">
          <el-aside class="code-editor" width="50%" :style="{ height: '78vh' }">
            <monaco-editor v-model="formData.code" :options="{ language: 'javascript' }" />
          </el-aside>
          <el-main class="params-editor" :style="{ padding: 0 }">
            <el-container>
              <el-header height="50vh">
                <el-tabs
                  v-if="refreshParamsTab"
                  v-model="activeParamPaneName"
                  type="border-card"
                  editable
                  @edit="editParamTabs"
                >
                  <el-tab-pane
                    :label="param.name"
                    :name="param.id"
                    v-for="(param, index) in params"
                    :style="{ height: '50vh' }"
                    :key="param.id"
                  >
                    <el-container>
                      <el-aside width="10%">
                        <el-space direction="vertical">
                          <el-tooltip content="重命名参数" placement="left">
                            <el-button size="small" @click="renameParam(param)">
                              <Icon icon="fa-solid:keyboard" />
                            </el-button>
                          </el-tooltip>
                          <el-tooltip content="向左移动" placement="left">
                            <el-button
                              size="small"
                              @click="swapWithParam(param, 'left')"
                              :disabled="index === 0"
                            >
                              <Icon icon="fa-solid:angle-double-left" />
                            </el-button>
                          </el-tooltip>
                          <el-tooltip content="向右移动" placement="left">
                            <el-button
                              size="small"
                              @click="swapWithParam(param, 'right')"
                              :disabled="index === params.length - 1"
                            >
                              <Icon icon="fa-solid:angle-double-right" />
                            </el-button>
                          </el-tooltip>
                          <el-tooltip content="参数配置" placement="left">
                            <el-button size="small" @click="toggleConfigParamForm(param)">
                              <Icon icon="fa-solid:cog" />
                            </el-button>
                          </el-tooltip>
                        </el-space>
                      </el-aside>
                      <el-main :style="{ padding: 0, height: '42vh' }">
                        <el-form v-if="paramConfigFormVisible" size="small">
                          <el-form-item label="参数名">
                            <el-input v-model="param.name" />
                          </el-form-item>
                          <el-form-item label="参数定义来源">
                            <el-radio-group
                              v-model="param.type"
                              @change="(type) => updateParamType(type, param)"
                            >
                              <el-radio-button label="normal">自定义</el-radio-button>
                              <el-radio-button label="component">低代码组件</el-radio-button>
                            </el-radio-group>
                          </el-form-item>
                          <el-form-item
                            label="低代码组件ID"
                            v-show="param.type === paramType.Component"
                          >
                            <el-input
                              v-model="param.componentId"
                              @change="fetchParamReferComponent(param)"
                            />
                          </el-form-item>
                          {{ paramIdMapComponentDetails[param.id] }}
                        </el-form>
                        <monaco-editor
                          v-else
                          v-model="param.sample"
                          :options="{ language: 'json' }"
                        />
                      </el-main>
                    </el-container>
                  </el-tab-pane>
                </el-tabs>
              </el-header>
              <el-footer height="27vh">
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
      <!--      <el-form-item label="函数名" prop="name">-->
      <!--        <el-input v-model="formData.name" placeholder="请输入函数名" />-->
      <!--      </el-form-item>-->
      <!--      <el-form-item label="代码" prop="code">-->
      <!--        <el-input v-model="formData.code" type="textarea" placeholder="请输入代码" />-->
      <!--      </el-form-item>-->
      <!--      <el-form-item label="实际参数列表" prop="parameters">-->
      <!--        <el-input v-model="formData.parameters" placeholder="请输入实际参数列表" />-->
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
      <el-button @click="submitForm" type="primary" :disabled="formLoading">保 存</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>
<script setup lang="ts">
import * as CloudFunctionApi from '@/api/serverless/cloudFunction'
import * as _ from 'lodash'
import { number, string } from 'vue-types'
import { ElNotification, TabPaneName } from 'element-plus'
import { generateUUID } from '@/utils'
import { CloudFunctionVO } from '@/api/serverless/cloudFunction'
import * as DataModelApi from '@/api/bpm/dataModel'
import component from '*.vue'

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('') // 弹窗的标题
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formType = ref('') // 表单的类型：create - 新增；update - 修改
const formData = ref({
  id: number,
  name: string,
  code: string,
  parameters: string,
  parentId: number,
  description: string,
  status: number
})

// outstanding理解为一批的云函数的代表，主要其他组件运行时使用
const isOutstandingCloudFunction = computed(() => {
  return formData.value.parentId === 0
})
const outstandingCloudFunction = ref<CloudFunctionVO>({})
const loadOutstandingCloudFunction = async () => {
  if (!isOutstandingCloudFunction.value) {
    outstandingCloudFunction.value = await CloudFunctionApi.getCloudFunction(
      formData.value.parentId
    )
  } else {
    outstandingCloudFunction.value = formData.value
  }
}
const executeResult = ref<string>('') // 执行结果
const formRules = reactive({
  name: [{ required: true, message: '函数名不能为空', trigger: 'blur' }],
  status: [{ required: true, message: '状态不能为空', trigger: 'blur' }]
})
const formRef = ref() // 表单 Ref

interface paramDef {
  name: string
  sample: string
  type: paramType
  componentId: string
  id: string
}
enum paramType {
  Normal = 'normal',
  Component = 'component'
}
const params = ref<paramDef[]>()

/** 点击设置 */
const selectSettingCommand = (command: string | number | object) => {
  switch (command) {
    case 'rename':
      renameCloudFunction()
      break
    case 'setFontSize':
      setEditorFontSize()
      break
  }
}
const renameCloudFunction = () => {
  ElMessageBox.prompt('重命名', 'Tip', {
    confirmButtonText: 'OK',
    cancelButtonText: 'Cancel',
    inputPattern: '',
    inputErrorMessage: 'Invalid Email'
  })
    .then(({ value }) => {
      formData.value.name = value
    })
    .catch((e) => {
      ElMessage({
        type: 'error',
        message: e
      })
    })
}

const activeParamPaneName = ref('')
const editParamTabs = (targetName: TabPaneName | undefined, action: 'remove' | 'add') => {
  if (action === 'remove') {
    params.value = _.reject(params.value, { name: targetName })
    activeParamPaneName.value = _.get(params.value, '[0].id', '')
  } else if (action === 'add') {
    const newParam: paramDef = {
      name: generateNewParamName(),
      sample: '{}',
      type: paramType.Normal,
      componentId: '',
      id: generateUUID()
    }
    params.value?.push(newParam)
    activeParamPaneName.value = param.value.id
  }
}

const generateNewParamName = () => {
  let i = _.get(params.value, 'length', 0)
  while (true) {
    const newParamName = `param${++i}`
    if (_.isEmpty(_.find(params.value, { name: newParamName }))) {
      return newParamName
    }
  }
}

const renameParam = (param: paramDef) => {
  const newParamName = prompt('请输入新的参数名', param.name)
  if (
    newParamName &&
    newParamName !== param.name &&
    !_.find(params.value, { name: newParamName })
  ) {
    const newParam = {
      name: newParamName,
      sample: param.sample,
      id: param.id
    }
    params.value = _.reject(params.value, { name: param.name }).concat(newParam)
    activeParamPaneName.value = newParam.id
  } else {
    ElNotification.error('参数名已存在或未修改')
  }
}

const refreshParamsTab = ref<boolean>(true)

const swapWithParam = (param, direction) => {
  refreshParamsTab.value = false
  const paramIndex = _.findIndex(params.value, { id: param.id })
  const swapWithParamIndex = direction === 'left' ? paramIndex - 1 : paramIndex + 1

  const item = _.cloneDeep(params.value[paramIndex])
  params.value[paramIndex] = params.value[swapWithParamIndex]
  params.value[swapWithParamIndex] = item
  nextTick(() => {
    refreshParamsTab.value = true
  })
}
/** 配置参数 */
const paramConfigFormVisible = ref<boolean>(false)
const toggleConfigParamForm = () => {
  paramConfigFormVisible.value = !paramConfigFormVisible.value
}
const updateParamType = (type: string, param: paramDef) => {
  param.type = type
}
/** 打开弹窗 */
const getComponentType = (componentId) => {
  return _.split(componentId, ':')[0]
}
const getComponentId = (componentId) => {
  return _.split(componentId, ':')[1]
}
const paramIdMapComponentDetails = ref({})

const fetchParamReferComponent = (param) => {
  if (param.type === paramType.Component) {
    const paramComponentType = getComponentType(param.componentId)
    const componentRealId = getComponentId(param.componentId)

    paramIdMapComponentDetails.value[param.id] = undefined
    if (paramComponentType === 'DataModel') {
      DataModelApi.getDataModel(componentRealId).then((res) => {
        if (res === null) {
          ElNotification.error(`未找到${param.name}引用的组件${param.componentId}`)
        } else {
          paramIdMapComponentDetails.value[param.id] = res
        }
      })
    }
  }
}

const open = async (type: string, id?: number) => {
  dialogVisible.value = true
  dialogTitle.value = t('action.update')
  formType.value = 'update'
  resetForm()
  // 修改时，设置数据
  if (id) {
    // formLoading.value = true
    try {
      formData.value = await CloudFunctionApi.getCloudFunction(id)
      params.value = JSON.parse(formData.value.parameters)
      activeParamPaneName.value = _.get(params.value, '[0].id', '')

      // 查找参数引用组件
      _.forEach(params.value, (param) => {
        fetchParamReferComponent(param)
      })
      if (type !== 'switch') {
        loadSameParentCloudFunctions()
        loadOutstandingCloudFunction()
      }
    } finally {
      formLoading.value = false
    }
  }
}
defineExpose({ open }) // 提供 open 方法，用于打开弹窗

const sameGroupCloudFunctions = ref<CloudFunctionVO[]>([])
const loadSameParentCloudFunctions = async () => {
  sameGroupCloudFunctions.value = await CloudFunctionApi.getCloudFunctionList({
    parentId: isOutstandingCloudFunction.value ? formData.value.id : formData.value.parentId
  })
}
const switchSameGroupCloudFunction = (id: number) => {
  open('switch', id)
}

/** 执行云函数 */
const executeStatus = ref('init')
interface ExecuteResult {
  params: string
  code: string
  success: boolean
  result: any
}
const execute = async () => {
  executeStatus.value = 'loading'
  const resp: ExecuteResult = await CloudFunctionApi.executeCloudFunction({
    code: formData.value.code,
    parameters: `[${_.join(_.map(params.value, 'sample'), ',')}]`
  })
  if (resp.success) {
    executeStatus.value = 'success'
    ElNotification.success('执行成功')
  } else {
    executeStatus.value = 'error'
    ElNotification.error('执行失败。请按提示修复错误')
  }
  executeResult.value = resp.result
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
    const data = formData.value as unknown as CloudFunctionApi.CloudFunctionVO
    if (formType.value === 'create') {
      await CloudFunctionApi.createCloudFunction(data)
      message.success(t('common.createSuccess'))
    } else {
      data.parameters = JSON.stringify(params.value)
      await CloudFunctionApi.updateCloudFunction(data)
      message.success(t('common.updateSuccess'))
    }
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
    code: undefined,
    parameters: undefined,
    description: undefined,
    status: undefined
  }
  formRef.value?.resetFields()
}
</script>
