import request from '@/config/axios'

export interface HttpConnectorVO {
  id: number
  name: string
  method: byte
  url: string
  headers: string
  params: string
  body: string
  response: string
  description: string
  status: byte
}

// 查询HTTP连接器列表
export const getHttpConnectorPage = async (params) => {
  return await request.get({ url: `/serverless/http-connector/page`, params })
}

// 查询HTTP连接器详情
export const getHttpConnector = async (id: number) => {
  return await request.get({ url: `/serverless/http-connector/get?id=` + id })
}

// 新增HTTP连接器
export const createHttpConnector = async (data: HttpConnectorVO) => {
  return await request.post({ url: `/serverless/http-connector/create`, data })
}

// 修改HTTP连接器
export const updateHttpConnector = async (data: HttpConnectorVO) => {
  return await request.put({ url: `/serverless/http-connector/update`, data })
}

// 删除HTTP连接器
export const deleteHttpConnector = async (id: number) => {
  return await request.delete({ url: `/serverless/http-connector/delete?id=` + id })
}

// 导出HTTP连接器 Excel
export const exportHttpConnector = async (params) => {
  return await request.download({ url: `/serverless/http-connector/export-excel`, params })
}
