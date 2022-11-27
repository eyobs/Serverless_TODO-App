import { TodosAccess } from '../dataLayer/todosAcess'
import { AttachmentUtils } from '../fileStorage/attachmentUtils';
import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'
import { TodoUpdate } from '../models/TodoUpdate';


// TODO: Implement businessLogic

const logger = createLogger('TodosAccess')
const attachmentUtils = new AttachmentUtils()
const todosAcess = new TodosAccess()


export async function getTodosForUser(userId: string): Promise<TodoItem[]> {
    logger.info('Get todos for user function called')
    return todosAcess.getAllTodos(userId)
}


export async function createTodo(CreateTodo: CreateTodoRequest, userId: string): Promise<TodoItem> {
    logger.info('Create todo function called')

    const createdAt = new Date().toISOString()
    const todoId = uuid.v4()
    const newItem = {
        userId,
        todoId,
        createdAt,
        done: false,
        AttachmentUrl: null,
        ...CreateTodo
    }
    
    return await todosAcess.createTodoItem(newItem)
}

export async function updateTodo(todoId:string, userId:string, todoUpdate: UpdateTodoRequest): Promise<TodoUpdate> {
    logger.info('update todo function called')
    return  await todosAcess.updateTodoItem(todoId, userId, todoUpdate)
}

export async function deleteTodo(todoId: string, userId:string){
    logger.info('function delete todo called')
    await todosAcess.deleteTodoItem(todoId, userId)
}


export async function generateUploadUrl(attachmentId: string): Promise<string> {
    logger.info(`Generating upload URL for attachment ${attachmentId}`)
    const uploadUrl = await attachmentUtils.getUploadUrl(attachmentId)
  
    return uploadUrl
}


export async function updateAttachmentUrl(userId: string, todoId: string, attachmentId: string) {
    logger.info(`Generating attachment URL for attachment ${attachmentId}`)
  
    const attachmentUrl = await attachmentUtils.getAttachmentUrl(attachmentId)
    const item = await todosAcess.getTodoItem(todoId, userId)
  
    if (item.userId !== userId) {
      throw new Error('User not authorized to update item')
    }
    
    logger.info(`Attachement URL ${attachmentUrl}`)
    await todosAcess.updateAttachmentUrl(todoId, userId, attachmentUrl)
  }
  

