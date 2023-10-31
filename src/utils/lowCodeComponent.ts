import * as _ from 'lodash'

export const lowCodeComponentIs = (
  lowCodeComponentTypeEnumKey: string,
  componentId: string
): boolean => {
  return _.startsWith(componentId, lowCodeComponentTypeEnumKey)
}

export const getRealId = (componentId: string): string => {
  return componentId.split('_')[1]
}
