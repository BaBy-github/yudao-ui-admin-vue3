<template>
  <Dialog
    :title="'云函数' + formData.name"
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
            <el-col :offset="20" :span="2" class="runtime-buttons">
              <el-dropdown @command="switchSameGroupCloudFunction">
                <el-button type="info" plain>
                  <Icon icon="fa-solid:bars" />
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item
                      v-for="cloudFunction in sameGroupCloudFunctions"
                      :command="cloudFunction.id"
                      :key="cloudFunction.id"
                      >{{ cloudFunction.name }}</el-dropdown-item
                    >
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
                        </el-space>
                      </el-aside>
                      <el-main :style="{ padding: 0, height: '42vh' }">
                        <monaco-editor v-model="param.sample" :options="{ language: 'json' }" />
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
const isOutstandingCloudFunction = computed(() => formData.value.parentId === 0) // outstanding理解为一批的云函数的代表，主要其他组件运行时使用
const executeResult = ref<string>('') // 执行结果
const formRules = reactive({
  name: [{ required: true, message: '函数名不能为空', trigger: 'blur' }],
  status: [{ required: true, message: '状态不能为空', trigger: 'blur' }]
})
const formRef = ref() // 表单 Ref

interface paramDef {
  name: string
  sample: string
  id: string
}
const params = ref<paramDef[]>()

/** 点击设置 */
const selectSettingCommand = (command: string | number | object) => {
  console.log(`click on item ${command}`)
}

const activeParamPaneName = ref('')
const editParamTabs = (targetName: TabPaneName | undefined, action: 'remove' | 'add') => {
  if (action === 'remove') {
    params.value = _.reject(params.value, { name: targetName })
    activeParamPaneName.value = _.get(params.value, '[0].id', '')
  } else if (action === 'add') {
    const newParam = {
      name: generateNewParamName(),
      sample: '{}',
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

const swapWithParam = (param, direction) => {
  const paramIndex = _.findIndex(params.value, { id: param.id })
  const swapWithParamIndex = direction === 'left' ? paramIndex - 1 : paramIndex + 1

  const item = _.cloneDeep(params.value[paramIndex])
  params.value[paramIndex] = params.value[swapWithParamIndex]
  params.value[swapWithParamIndex] = item
}

/** 打开弹窗 */
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
      if (type !== 'switch') {
        loadSameParentCloudFunctions()
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
    parentId: isOutstandingCloudFunction ? formData.value.id : formData.value.parentId
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
