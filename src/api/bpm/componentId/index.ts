import request from '@/config/axios'
import * as _ from 'lodash'
import { LowCodeComponentTypeEnum } from '@/utils/constants'
import { getDataModel } from '@/api/bpm/dataModel'

const getComponentType = (componentId) => {
  return _.split(componentId, ':')[0]
}
const getComponentId = (componentId) => {
  return _.split(componentId, ':')[1]
}
// 查询低代码组件
export const getComponents = async (componentIds: number) => {
  const components = []
  for (let i = 0; i < componentIds.length; i++) {
    if (getComponentType(componentIds[i]) === LowCodeComponentTypeEnum.DATA_MODEL) {
      components.push(await getDataModel(getComponentId(componentIds[i])))
    }
  }
  return components
}
