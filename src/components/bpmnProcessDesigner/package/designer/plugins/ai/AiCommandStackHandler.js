import { ElNotification } from 'element-plus'
import { uuid } from '@/components/bpmnProcessDesigner/package/utils'

export default class AiCommandStackHandler {
  constructor(commandStack, modeling, elementRegistry, elementFactory, canvas) {
    this._commandStack = commandStack
    this._modeling = modeling
    this._elementRegistry = elementRegistry
    this._elementFactory = elementFactory
    this._canvas = canvas
  }

  $inject = ['commandStack', 'modeling', 'elementRegistry', 'canvas', 'elementFactory']
  executeCommandsHistory = []
  testBuildBpmnByCommand = async (startXml) => {
    const commands = [
      ['createShape', 'bpmn:StartEvent', '开始', 200, 300, 'Event_0oe7mo8'],
      ['createShape', 'bpmn:UserTask', '部门经理审批', 350, 300, 'Activity_0z2uxf6'],
      ['createShape', 'bpmn:ExclusiveGateway', '判断请假天数', 500, 300, 'Gateway_0nz9mag'],
      ['createShape', 'bpmn:UserTask', 'HR审批', 600, 200, 'Activity_0a8h7mz'],
      ['createShape', 'bpmn:EndEvent', '结束', 600, 300, 'Event_0oe7m18'],
      ['connect', 'Event_0oe7mo8', 'Activity_0z2uxf6'],
      ['connect', 'Activity_0z2uxf6', 'Gateway_0nz9mag'],
      ['connect', 'Gateway_0nz9mag', 'Activity_0a8h7mz'],
      ['connect', 'Gateway_0nz9mag', 'Event_0oe7m18'],
      ['connect', 'Activity_0a8h7mz', 'Event_0oe7m18']
    ]
    await this.commandBpmn(startXml, commands, 300)
  }

  commandBpmn = async (startXml, commands, waitTimeOut) => {
    const executeResult = await this.executeCommands(commands, waitTimeOut)
    this.executeCommandsHistory.push({ startXml, commands, executeResult })
  }

  executeCommands = async (commands, waitTimeOut) => {
    ElNotification.success('开始绘制流程')

    const commandElements = []
    const needRemoveElements = []

    let commandsExecutingIndex = 0
    try {
      for (; commandsExecutingIndex < commands.length; commandsExecutingIndex++) {
        let command = commands[commandsExecutingIndex]
        let shape
        if (command[0] === 'createShape') {
          shape = this.createShapeWithId(command[1], command[2], command[3], command[4], command[5])
        } else if (command[0] === 'getElement') {
          shape = this._elementRegistry.get(command[1])
        } else if (command[0] === 'connect') {
          shape = this._modeling.connect(
            this._elementRegistry.get(command[1]),
            this._elementRegistry.get(command[2])
          )
        } else if (command[0] === 'remove') {
          shape = this._elementRegistry.get(command[1])
          needRemoveElements.push(shape)
        }
        commandElements.push(shape)
        waitTimeOut ? await this.wait(waitTimeOut) : ''
      }
    } catch (err) {
      console.error(err)
      return {
        executedCommandsCount: commandsExecutingIndex,
        message: err.message
      }
    } finally {
      this._modeling.removeElements(needRemoveElements)
    }
    return {
      executedCommandsCount: commandsExecutingIndex,
      message: ''
    }
  }

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

  createShapeWithId = (bpmnShapeType, shapeName, x, y, id) => {
    const newShape = this.createShape(bpmnShapeType, shapeName, x, y)
    this._modeling.updateProperties(newShape, { id })
    return newShape
  }
}
