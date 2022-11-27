import * as AWS from "aws-sdk"
// import * as AWSXRay from "aws-xray-sdk"
import { DocumentClient } from "aws-sdk/clients/dynamodb"
import { createLogger } from "../utils/logger"
import { TodoItem } from "../models/TodoItem"
import { TodoUpdate } from "../models/TodoUpdate";
// import { Types } from "aws-sdk/clients/s3";

var AWSXRay = require("aws-xray-sdk")

const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger("TodosAccess")

// TODO: Implement the dataLayer logic

export class TodosAccess {
    constructor(
        private readonly docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient(),
        private readonly todosTable = process.env.TODOS_TABLE,
        private readonly todosIndex = process.env.INDEX_NAME,
    ) {}

    async getAllTodos(userId: string): Promise<TodoItem[]> {
        logger.info("function get all todos called")

        const params = {
            TableName: this.todosTable,
            IndexName: this.todosIndex,
            KeyConditionExpression: "#userId = :userId",
            ExpressionAttributeNames: {
                "#userId": "userId"
            },
            ExpressionAttributeValues: {
                ":userId": userId
            }
        }

        const result = await this.docClient.query(params).promise()

        const items = result.Items
        return items as TodoItem[]
    }


    async getTodoItem(todoId: string, userId: string): Promise<TodoItem> {
        logger.info(`function getTodoItem called`)
    
        const params = {
            TableName: this.todosTable,
            Key: {
              todoId,
              userId
            }
        }

        const result = await this.docClient.get(params).promise()
        const item = result.Item
    
        return item as TodoItem
    }


    async createTodoItem(todoItem: TodoItem): Promise<TodoItem> {
        logger.info("function create todo called")

        const params = {
            TableName: this.todosTable,
            Item: todoItem
        }

        const result = await this.docClient.put(params).promise()

        logger.info("todo item created", result)

        return todoItem as TodoItem
    }

    async updateTodoItem(todoId: string, userId: string, todoUpdate: TodoUpdate): Promise<TodoUpdate>{
        logger.info("function update todo called!")

        const params = {
            TableName: this.todosTable,
            Key:{
                todoId,
                userId
            },
            UpdateExpression: "set #name = :name, dueDate = :dueDate, done = :done",
            ExpressionAttributeValues: {
                ":name": todoUpdate.name,
                ":dueDate": todoUpdate.dueDate,
                ":done": todoUpdate.done
            },
            ExpressionAttributeNames: {
                "#name": "name"
            },
            ReturnValues: "ALL_NEW"
        }

        const result = await this.docClient.update(params).promise()
        logger.info("Todo item updated", result)

        const attributes = result.Attributes;
        return attributes as TodoUpdate
    }

    async deleteTodoItem(todoId: string, userId: string){
        logger.info("function delete todo item called!")

        const params = {
            TableName: this.todosTable,
            Key: {
                todoId,
                userId
            }
        }

        await this.docClient.delete(params).promise()
    }

    async updateAttachmentUrl(todoId: string, userId: string, attachmentUrl: string) {
        logger.info(`Updating attachment URL!`)
        
        const params = {
            TableName: this.todosTable,
            Key: {
              todoId,
              userId
            },
            UpdateExpression: 'set attachmentUrl = :attachmentUrl',
            ExpressionAttributeValues: {
              ':attachmentUrl': attachmentUrl
            }
        }

        await this.docClient.update(params).promise()
      }
}