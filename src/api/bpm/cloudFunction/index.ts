import request from '@/config/axios'

export interface CloudFunctionVO {
  id: number
  name: string
  code: string
  parameters: string
  parentId: number
  description: string
  status: number
}

export interface CloudFunctionExecuteVO {
  code: string
  parameters: string
}

// 执行云函数
export async function executeCloudFunction(data: CloudFunctionExecuteVO) {
  return await request.post({ url: `/bpm/cloud-function/execute`, data })
}

// 查询云函数列表
export const getCloudFunctionPage = async (params) => {
  return await request.get({ url: `/bpm/cloud-function/page`, params })
}

// 查询菜单列表
export const getCloudFunctionList = (params) => {
  return request.get({ url: '/bpm/cloud-function/list', params })
}

// 查询云函数详情
export const getCloudFunction = async (id: number) => {
  return await request.get({ url: `/bpm/cloud-function/get?id=` + id })
}

// 新增云函数
export const createCloudFunction = async (data: CloudFunctionVO) => {
  return await request.post({ url: `/bpm/cloud-function/create`, data })
}

// 修改云函数
export const updateCloudFunction = async (data: CloudFunctionVO) => {
  return await request.put({ url: `/bpm/cloud-function/update`, data })
}

// 删除云函数
export const deleteCloudFunction = async (id: number) => {
  return await request.delete({ url: `/bpm/cloud-function/delete?id=` + id })
}

// 导出云函数 Excel
export const exportCloudFunction = async (params) => {
  return await request.download({ url: `/bpm/cloud-function/export-excel`, params })
}