import request from '@/config/axios'
import * as _ from 'lodash'

export const chat = async (messages: ChatMessage[], tools?: any[]) => {
  _.forEach(messages, (message: ChatMessage) => {
    if (_.has(message, 'tool_calls')) {
      delete message.content
    }
  })
  const data = {
    model: 'gpt-3.5-turbo-1106',
    messages
  }
  if (!_.isEmpty(tools)) {
    data['tools'] = tools
  }
  return await request.post({
    url: '/bpm/ai/command-bpmn',
    data
  })
}

export interface ChatMessage {
  role: string
  content?: string
  finish_reason?: string
  tool_calls?: any[]
}
