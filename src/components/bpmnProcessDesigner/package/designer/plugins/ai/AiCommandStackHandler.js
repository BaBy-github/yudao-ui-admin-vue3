import { ElNotification } from 'element-plus'
import { uuid } from '@/components/bpmnProcessDesigner/package/utils'

export default class AiCommandStackHandler {
  constructor(commandStack, modeling, elementRegistry, elementFactory, canvas) {
    this._modeling = modeling
    this._elementRegistry = elementRegistry
    this._elementFactory = elementFactory
    this._canvas = canvas
  }

  $inject = ['commandStack', 'modeling', 'elementRegistry', 'canvas', 'elementFactory']
  executeCommandsHistory = []

  wait = async (timeout) => {
    return new Promise((resolve) => setTimeout(resolve, timeout))
  }

  createShape = (bpmnShapeType, shapeName, x, y) => {
    const rootElement = this._canvas.getRootElement()

    let branchShape = this._elementFactory.createShape({
      type: bpmnShapeType
    })
    branchShape.businessObject.name = shapeName
    return this._modeling.createShape(branchShape, { x, y }, rootElement)
  }

  createShapeWithId = (shapeId, shapeType, shapeName, positionX, positionY) => {
    const newShape = this.createShape(shapeType, shapeName, positionX, positionY)
    this._modeling.updateProperties(newShape, { id: shapeId })
    return newShape
  }

  createShapeWithIdWrapper = (params) => {
    return this.createShapeWithId(
      params['shapeId'],
      params['shapeType'],
      params['shapeName'],
      params['positionX'],
      params['positionY']
    )
  }

  connectShapes = (sourceShapeId, targetShapeId) => {
    return this._modeling.connect(
      this._elementRegistry.get(sourceShapeId),
      this._elementRegistry.get(targetShapeId)
    )
  }

  connectShapesWrapper = (params) => {
    return this.connectShapes(params['sourceShapeId'], params['targetShapeId'])
  }

  removeElement = (elementId) => {
    this._modeling.removeElements([this._elementRegistry.get(elementId)])
  }
  removeElementWrapper = (params) => {
    this.removeElement(params['elementId'])
  }

  availableFunctions = {
    createShape: this.createShapeWithIdWrapper,
    connectShapes: this.connectShapesWrapper,
    removeElement: this.removeElementWrapper
  }

  callTool = async (toolCalls) => {
    const messages = []
    for (let index = 0; index < toolCalls.length; index++) {
      const toolCall = toolCalls[index]

      const functionToCall = this.availableFunctions[toolCall.function.name]
      const functionArgs = JSON.parse(toolCall.function.arguments)
      functionToCall(functionArgs)

      messages.push({
        tool_call_id: toolCall.id,
        role: 'tool',
        name: functionToCall,
        content: JSON.stringify({ sucess: true })
      })
    }
    return messages
  }
}
