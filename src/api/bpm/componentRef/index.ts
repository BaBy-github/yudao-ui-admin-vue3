import request from '@/config/axios'

export interface ComponentRefVO {
  id: number
  componentId: string
  refComponentId: string
}

// 查询组件关联列表
export const getComponentRefPage = async (params) => {
  return await request.get({ url: `/bpm/component-ref/page`, params })
}

// 查询组件关联详情
export const getComponentRef = async (id: number) => {
  return await request.get({ url: `/bpm/component-ref/get?id=` + id })
}

// 新增组件关联
export const createComponentRef = async (data: ComponentRefVO) => {
  return await request.post({ url: `/bpm/component-ref/create`, data })
}

// 修改组件关联
export const updateComponentRef = async (data: ComponentRefVO) => {
  return await request.put({ url: `/bpm/component-ref/update`, data })
}

// 删除组件关联
export const deleteComponentRef = async (id: number) => {
  return await request.delete({ url: `/bpm/component-ref/delete?id=` + id })
}

// 导出组件关联 Excel
export const exportComponentRef = async (params) => {
  return await request.download({ url: `/bpm/component-ref/export-excel`, params })
}
