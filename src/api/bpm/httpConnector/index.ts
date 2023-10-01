import request from '@/config/axios'

export interface HttpConnectorVO {
  id: number
  name: string
  method: string
  url: string
  headers: string
  params: string
  authConfig: string
  body: string
  response: string
  description: string
  status: number
}

export interface HttpConnectorExecuteVO {
  method: string
  url: string
  headers: string
  params: string
  body: string
}

// 执行HTTP连接器
export const executeHttpConnector = async (data: HttpConnectorExecuteVO) => {
  return await request.post({ url: `/bpm/http-connector/execute`, data })
}

// 查询HTTP连接器列表
export const getHttpConnectorPage = async (params) => {
  return await request.get({ url: `/bpm/http-connector/page`, params })
}

// 查询HTTP连接器详情
export const getHttpConnector = async (id: number) => {
  return await request.get({ url: `/bpm/http-connector/get?id=` + id })
}

// 新增HTTP连接器
export const createHttpConnector = async (data: HttpConnectorVO) => {
  return await request.post({ url: `/bpm/http-connector/create`, data })
}

// 修改HTTP连接器
export const updateHttpConnector = async (data: HttpConnectorVO) => {
  return await request.put({ url: `/bpm/http-connector/update`, data })
}

// 删除HTTP连接器
export const deleteHttpConnector = async (id: number) => {
  return await request.delete({ url: `/bpm/http-connector/delete?id=` + id })
}

// 导出HTTP连接器 Excel
export const exportHttpConnector = async (params) => {
  return await request.download({ url: `/bpm/http-connector/export-excel`, params })
}
