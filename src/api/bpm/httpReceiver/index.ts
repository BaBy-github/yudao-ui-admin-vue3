import request from '@/config/axios'

export interface HttpReceiverVO {
  id: number
  name: string
  requestBody: string
}

// 查询HTTP接收器列表
export const getHttpReceiverPage = async (params) => {
  return await request.get({ url: `/bpm/http-receiver/page`, params })
}

// 查询HTTP接收器详情
export const getHttpReceiver = async (id: number) => {
  return await request.get({ url: `/bpm/http-receiver/get?id=` + id })
}

// 新增HTTP接收器
export const createHttpReceiver = async (data: HttpReceiverVO) => {
  return await request.post({ url: `/bpm/http-receiver/create`, data })
}

// 修改HTTP接收器
export const updateHttpReceiver = async (data: HttpReceiverVO) => {
  return await request.put({ url: `/bpm/http-receiver/update`, data })
}

// 删除HTTP接收器
export const deleteHttpReceiver = async (id: number) => {
  return await request.delete({ url: `/bpm/http-receiver/delete?id=` + id })
}

// 导出HTTP接收器 Excel
export const exportHttpReceiver = async (params) => {
  return await request.download({ url: `/bpm/http-receiver/export-excel`, params })
}
