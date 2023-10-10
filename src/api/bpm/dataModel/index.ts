import request from '@/config/axios'

export interface DataModelVO {
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
  return await request.post({ url: `/bpm/data-model/validate`, data })
}

// 查询数据模型定义列表
export const getDataModelPage = async (params) => {
  return await request.get({ url: `/bpm/data-model/page`, params })
}

// 查询数据模型定义详情
export const getDataModel = async (id: number) => {
  return await request.get({ url: `/bpm/data-model/get?id=` + id })
}

// 新增数据模型定义
export const createDataModel = async (data: DataModelVO) => {
  return await request.post({ url: `/bpm/data-model/create`, data })
}

// 修改数据模型定义
export const updateDataModel = async (data: DataModelVO) => {
  return await request.put({ url: `/bpm/data-model/update`, data })
}

// 删除数据模型定义
export const deleteDataModel = async (id: number) => {
  return await request.delete({ url: `/bpm/data-model/delete?id=` + id })
}

// 导出数据模型定义 Excel
export const exportDataModel = async (params) => {
  return await request.download({ url: `/bpm/data-model/export-excel`, params })
}
