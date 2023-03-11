import * as todoAccess from './todosAcess'
import { getUploadUrl } from './attachmentUtils'
import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'
import * as createError from 'http-errors'

// TODO: Implement businessLogic
const logger = createLogger('businesslogic')
/**
 * Creates a new todo item
 * @param userId
 * @param CreateTodoRequest
 * @returns {object} - todo item
 */
export const createTodo = async (
  userId: string,
  CreateTodoRequest: CreateTodoRequest
): Promise<TodoItem | Error> => {
  const todoId = uuid.v4()
  const Todo: TodoItem = {
    userId,
    todoId,
    createdAt: new Date().toISOString(),
    done: false,
    attachmentUrl: null,
    ...CreateTodoRequest
  }
  try {
    await todoAccess.createTodo(Todo)
    logger.info(`Create Todo : `, {
      Todo
    })
    return Todo as TodoItem
  } catch (e) {
    logger.error(`Create Todo : `, {
      Error: e,
      Todo
    })
    return createError(403, `Unauthorized.`)
  }
}
/**
 * Get todo items
 * @param userId
 * @returns
 */
export const getTodos = async (userId: string): Promise<TodoItem[] | Error> => {
  try {
    const userTodoItems = await todoAccess.getTodos(userId)
    logger.info(`getUserTodos: `, {
      userTodoItems
    })
    return userTodoItems as TodoItem[]
  } catch (e) {
    logger.error(`Get user Todos `, {
      Error: e,
      userId
    })
    return createError(403, `Unauthorized.`)
  }
}
/**
 * Update todo item
 * @param userId
 * @param todoId
 * @param updateRequest
 * @returns
 */
export const updateTodo = async (
  userId: string,
  todoId: string,
  updateRequest: UpdateTodoRequest
): Promise<void | Error> => {
  try {
    await todoAccess.updateTodo(userId, todoId, updateRequest)
    logger.info(`Update todo: `, {
      userId,
      todoId,
      updateRequest
    })
  } catch (e) {
    logger.error(`Update todo: `, {
      Error: e,
      userId,
      todoId,
      updateRequest
    })
    return createError(403, `Unauthorized.`)
  }
}
/**
 * Delete todo item
 * @param userId
 * @param todoId
 * @returns
 */
export const deleteTodo = async (
  userId: string,
  todoId: string
): Promise<void | Error> => {
  try {
    await todoAccess.deleteTodo(userId, todoId)
    logger.info(`Delete todo : `, {
      userId,
      todoId
    })
  } catch (e) {
    logger.error(`Delete todo : `, {
      Error: e,
      userId,
      todoId
    })
    return createError(403, `Unauthorized.`)
  }
}
/**
 * Upload image
 * @param userId 
 * @param todoId 
 * @param attachmentId 
 * @returns 
 */
export const uploadImage = async (
  userId: string,
  todoId: string,
  attachmentId: string
): Promise<string | Error> => {
  try {
    const attachmentData = await getUploadUrl(attachmentId)
    logger.info(`File upload : Generate URL`, {
      userId,
      todoId,
      attachmentData
    })
    const fileUrl = await todoAccess.generateUploadUrl(
      userId,
      todoId,
      attachmentData.uploadUrl
    )
    logger.info(`File upload : Database set`, {
      fileUrl,
      userId,
      todoId,
      uploadUrl: attachmentData.uploadUrl
    })
    return attachmentData.putObject
  } catch (e) {
    logger.error(`File upload : `, {
      Error: e,
      userId,
      todoId
    })
    return createError(403, `Unauthorized.`)
  }
}
