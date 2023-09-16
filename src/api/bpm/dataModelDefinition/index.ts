import request from '@/config/axios'

export interface DataModelDefinitionVO {
  id: number
  name: string
  description: string
  status: byte
  metaData: string
  sample: string
}

export interface ValidateReqVO {
  dataModelId: number
  json: string
  jsonScheme: string
}

export interface ValidateResult {
  success: boolean
  errorMessage: string
  errorMessageDetail: object
}

// 校验数据模型
export const validateJsonSchema = async (data: ValidateReqVO) => {
  return await request.post({ url: `/bpm/data-model-definition/validate`, data })
}

// 查询数据模型定义列表
export const getDataModelDefinitionPage = async (params) => {
  return await request.get({ url: `/bpm/data-model-definition/page`, params })
}

// 查询数据模型定义详情
export const getDataModelDefinition = async (id: number) => {
  return await request.get({ url: `/bpm/data-model-definition/get?id=` + id })
}

// 新增数据模型定义
export const createDataModelDefinition = async (data: DataModelDefinitionVO) => {
  return await request.post({ url: `/bpm/data-model-definition/create`, data })
}

// 修改数据模型定义
export const updateDataModelDefinition = async (data: DataModelDefinitionVO) => {
  return await request.put({ url: `/bpm/data-model-definition/update`, data })
}

// 删除数据模型定义
export const deleteDataModelDefinition = async (id: number) => {
  return await request.delete({ url: `/bpm/data-model-definition/delete?id=` + id })
}

// 导出数据模型定义 Excel
export const exportDataModelDefinition = async (params) => {
  return await request.download({ url: `/bpm/data-model-definition/export-excel`, params })
}
