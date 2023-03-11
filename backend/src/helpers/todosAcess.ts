import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate'

const XAWS = AWSXRay.captureAWS(AWS)
const logger = createLogger('TodosAccess')
const databaseTable = process.env.TODOS_TABLE

// TODO: Implement the dataLayer logic
const secondaryIndex = process.env.TODOS_INDEX
const docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient()
/**
 * Check if an item exists
 * @param userId
 * @param todoId
 * @returns Object
 */
export const isExisting = async (
  userId: string,
  todoId: string
): Promise<unknown> => {
  const itemExist = await docClient
    .get({
      TableName: databaseTable,
      Key: {
        userId,
        todoId
      }
    })
    .promise()
  if (!itemExist) logger.info(`${todoId} - Query failed, item not found`)
  return !!itemExist.Item
}

/**
 * Generate upload url and update DynamoDB with new url
 * @param userId
 * @param todoId
 * @param attachmentUrl
 */
export const generateUploadUrl = async (
  userId: string,
  todoId: string,
  attachmentUrl: string
): Promise<void> => {
  if (!isExisting(userId, todoId)) {
    logger.info(`Generate image URL -> Invalid todoId`, {
      todoId,
      userId,
      attachmentUrl
    })
    throw new Error(`Invalid todo`)
  }
  const DatabaseSet = await docClient
    .update({
      TableName: databaseTable,
      Key: {
        userId,
        todoId
      },
      UpdateExpression: 'set attachmentUrl = :attachmentUrl',
      ExpressionAttributeValues: {
        ':attachmentUrl': attachmentUrl
      }
    })
    .promise()
  logger.info('generateUploadUrl -> ', {
    userId,
    todoId,
    attachmentUrl,
    DatabaseSet
  })
}
/**
 * Create new tudo
 * @param {object} todoItem - todo item data
 * @returns {object} - the new todo item
 */
export const createTodo = async (todoItem: TodoItem): Promise<TodoItem> => {
  await docClient
    .put({
      TableName: databaseTable,
      Item: todoItem
    })
    .promise()
  logger.info('New todo item created: ', {
    todoItem
  })
  return todoItem
}
/**
 * Get todo list
 * @param userId
 * @returns {array} - todo item list
 */
export const getTodos = async (userId: string): Promise<TodoItem[]> => {
  const Query = await docClient
    .query({
      TableName: databaseTable,
      IndexName: secondaryIndex,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId
      }
    })
    .promise()
  if (!Query) throw new Error(`Failed, try again!`)
  const todosList = Query.Items
  logger.info(`Get user todods ->`, {
    todos: todosList as TodoItem[]
  })
  return todosList as TodoItem[]
}
/**
 * Delete todo item
 * @param userId 
 * @param todoId 
 */
export const deleteTodo = async (
  userId: string,
  todoId: string
): Promise<void> => {
  if (!isExisting(userId, todoId)) {
    logger.info(`Delete todo -> Invalid todoId`, {
      todoId
    })
    throw new Error(`Invalid todo`)
  }
  await docClient
    .delete({
      TableName: databaseTable,
      Key: {
        userId,
        todoId
      }
    })
    .promise()
  logger.info(`Delete todo -> `, {
    todoId
  })
}
/**
 *
 * @param userId - user uniwue id
 * @param todoId - todo item unique id
 * @param todoData -
 * @returns
 */
export const updateTodo = async (
  userId: string,
  todoId: string,
  todoData: TodoUpdate
): Promise<void> => {
  if (!isExisting(userId, todoId)) {
    logger.info(`Invalid todo item id: `, {
      todoId
    })
    throw new Error(`Invalid todo`)
  }
  const updatedTodo = await docClient
    .update({
      TableName: databaseTable,
      Key: {
        userId,
        todoId
      },
      UpdateExpression: 'set #name = :name, dueDate = :dueDate, done = :done',
      ExpressionAttributeNames: {
        '#name': 'name'
      },
      ExpressionAttributeValues: {
        ':name': todoData.name,
        ':dueDate': todoData.dueDate,
        ':done': todoData.done
      }
    })
    .promise()
  logger.info(`Todo item updated: `, {
    updatedTodo
  })
  return
}
