import { toRaw } from 'vue'
import * as _ from 'lodash'

const bpmnInstances = () => (window as any)?.bpmnInstances
// 创建监听器实例
export function createListenerObject(options, isTask, prefix) {
  const listenerObj = Object.create(null)
  listenerObj.event = options.event
  isTask && (listenerObj.id = options.id) // 任务监听器特有的 id 字段
  switch (options.listenerType) {
    case 'scriptListener':
      listenerObj.script = createScriptObject(options, prefix)
      break
    case 'expressionListener':
      listenerObj.expression = options.expression
      break
    case 'delegateExpressionListener':
      listenerObj.delegateExpression = options.delegateExpression
      break
    default:
      listenerObj.class = options.class
  }
  // 注入字段
  if (options.fields) {
    listenerObj.fields = options.fields.map((field) => {
      return createFieldObject(field, prefix)
    })
  }
  // 任务监听器的 定时器 设置
  if (isTask && options.event === 'timeout' && !!options.eventDefinitionType) {
    const timeDefinition = bpmnInstances().moddle.create('bpmn:FormalExpression', {
      body: options.eventTimeDefinitions
    })
    const TimerEventDefinition = bpmnInstances().moddle.create('bpmn:TimerEventDefinition', {
      id: `TimerEventDefinition_${uuid(8)}`,
      [`time${options.eventDefinitionType.replace(/^\S/, (s) => s.toUpperCase())}`]: timeDefinition
    })
    listenerObj.eventDefinitions = [TimerEventDefinition]
  }
  return bpmnInstances().moddle.create(
    `${prefix}:${isTask ? 'TaskListener' : 'ExecutionListener'}`,
    listenerObj
  )
}

// 创建 监听器的注入字段 实例
export function createFieldObject(option, prefix) {
  const { name, fieldType, string, expression } = option
  const fieldConfig = fieldType === 'string' ? { name, string } : { name, expression }
  return bpmnInstances().moddle.create(`${prefix}:Field`, fieldConfig)
}

// 创建脚本实例
export function createScriptObject(options, prefix) {
  const { scriptType, scriptFormat, value, resource } = options
  const scriptConfig =
    scriptType === 'inlineScript' ? { scriptFormat, value } : { scriptFormat, resource }
  return bpmnInstances().moddle.create(`${prefix}:Script`, scriptConfig)
}

// 更新元素扩展属性
export function updateElementExtensions(element, extensionList) {
  const extensions = bpmnInstances().moddle.create('bpmn:ExtensionElements', {
    values: extensionList
  })
  bpmnInstances().modeling.updateProperties(toRaw(element), {
    extensionElements: extensions
  })
}

export function getElementPropertyList(prefix = 'flowable') {
  const bpmnElement = getProcessElement()
  const otherExtensionList = [] // 其他扩展配置
  const bpmnElementProperties =
    bpmnElement.businessObject?.extensionElements?.values.filter((ex) => {
      if (ex.$type !== `${prefix}:Properties`) {
        otherExtensionList.push(ex)
      }
      return ex.$type === `${prefix}:Properties`
    }) ?? []

  // 保存所有的 扩展属性字段
  const bpmnElementPropertyList = bpmnElementProperties.reduce(
    (pre, current) => pre.concat(current.values),
    []
  )
  return JSON.parse(JSON.stringify(bpmnElementPropertyList ?? []))
}
// DataObject
export function getDataObjectList() {
  const processElement = getProcessElement()
  return _.filter(processElement.businessObject.flowElements, { $type: 'bpmn:DataObject' })
}

export function getRefDataObject(element) {
  if (_.get(element, 'businessObject.$type', '') !== 'bpmn:DataObjectReference') return
  return element.businessObject.dataObjectRef
}

// Documentation
export function getElementDocumentation(element) {
  const documentations = element?.businessObject?.documentation
  return documentations && documentations.length ? documentations[0].text : ''
}

export function getProcessElement() {
  return (
    bpmnInstances().elementRegistry.find((el) => el.type === 'bpmn:Process') ??
    bpmnInstances().elementRegistry.find((el) => el.type === 'bpmn:Collaboration')
  )
}

export function getProcessDocumentation() {
  const processElement = getProcessElement()
  return getElementDocumentation(processElement)
}
export function setElementDocumentation(element, value) {
  const documentations = bpmnInstances().bpmnFactory.create('bpmn:Documentation', {
    text: value
  })
  bpmnInstances().modeling.updateProperties(toRaw(element), {
    documentation: [documentations]
  })
}

// 创建一个id
export function uuid(length = 8, chars?) {
  let result = ''
  const charsString = chars || '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
  for (let i = length; i > 0; --i) {
    result += charsString[Math.floor(Math.random() * charsString.length)]
  }
  return result
}
