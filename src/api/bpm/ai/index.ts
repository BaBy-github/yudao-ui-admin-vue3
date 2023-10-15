import request from '@/config/axios'

// 创建工作流的表单定义
export const commandBpmn = async (chatRequestBody: ChatRequestBody) => {
  return await request.post({
    url: '/bpm/ai/command-bpmn',
    data: chatRequestBody
  })
}

interface ChatRequestBody {
  model: string
  messages: ChatMessage[]
  temperature?: number
}
interface ChatMessage {
  role: string
  content: string
}
