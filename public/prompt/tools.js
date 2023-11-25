export const TOOLS = {
  BPMN_CANVAS: [
    {
      type: 'function',
      function: {
        name: 'createShape',
        description: 'Create a shape in the BPMN diagram',
        parameters: {
          type: 'object',
          properties: {
            shapeId: {
              type: 'string',
              description: 'The id of the shape'
            },
            shapeType: {
              type: 'string',
              description: 'The type of the shape',
              enum: [
                'bpmn:Task',
                'bpmn:UserTask',
                'bpmn:ServiceTask',
                'bpmn:ScriptTask',
                'bpmn:SendTask',
                'bpmn:ReceiveTask',
                'bpmn:ManualTask',
                'bpmn:BusinessRuleTask',
                'bpmn:CallActivity',
                'bpmn:ExclusiveGateway',
                'bpmn:ParallelGateway',
                'bpmn:InclusiveGateway',
                'bpmn:EventBasedGateway',
                'bpmn:ComplexGateway',
                'bpmn:StartEvent',
                'bpmn:EndEvent',
                'bpmn:IntermediateThrowEvent',
                'bpmn:IntermediateCatchEvent',
                'bpmn:DataObject',
                'bpmn:DataStore',
                'bpmn:DataInput',
                'bpmn:DataOutput',
                'bpmn:Lane',
                'bpmn:Pool'
              ]
            },
            shapeName: {
              type: 'string',
              description: 'The name of the shape'
            },
            positionX: {
              type: 'number',
              description: 'The x position of the shape in bpmn'
            },
            positionY: {
              type: 'number',
              description: 'The y position of the shape in bpmn'
            }
          },
          required: ['shapeId', 'shapeType', 'shapeName', 'positionX', 'positionY']
        }
      }
    },
    {
      type: 'function',
      function: {
        name: 'connectShapes',
        description: 'Create SequenceFlow to connect two elements in the BPMN diagram。',
        parameters: {
          type: 'object',
          properties: {
            sourceShapeId: {
              type: 'string',
              description: 'The id of the start element to connect.'
            },
            targetShapeId: {
              type: 'string',
              description: 'The id of the end element to connect.'
            }
          },
          required: ['sourceShapeId', 'targetShapeId']
        }
      }
    },
    {
      type: 'function',
      function: {
        name: 'removeElement',
        description: 'Remove an element from the BPMN diagram',
        parameters: {
          type: 'object',
          properties: {
            element_id: {
              type: 'string',
              description: 'The element id under the bpmn2 namespace.'
            }
          },
          required: ['elementId']
        }
      }
    }
  ]
}
