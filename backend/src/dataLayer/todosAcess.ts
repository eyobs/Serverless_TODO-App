import * as AWS from 'aws-sdk'
// import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate';
import { Types } from 'aws-sdk/clients/s3';

var AWSXRay = require('aws-xray-sdk')

const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('TodosAccess')

// TODO: Implement the dataLayer logic

export class TodosAccess {
    constructor(
        private readonly docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient(),
        private readonly s3Client: Types = new AWS.S3({ signatureVersion: 'v4'}),
        private readonly todosTable = process.env.TODOS_TABLE,
        private readonly todosIndex = process.env.INDEX_NAME,
        private readonly s3BucketName = process.env.ATTACHMENT_S3_BUCKET
    ) {}

    async getAllTodos(userId: string): Promise<TodoItem[]> {
        logger.info('function get all todos called')

        const params = {
            TableName: this.todosTable,
            IndexName: this.todosIndex,
            KeyConditionExpression: '#userId = :userId',
            ExpressionAttributeValues: {
                ':userId': userId
            }
        }

        const result = await this.docClient.query(params).promise()

        const items = result.Items
        return items as TodoItem[]
    }

    async createTodoItem(todoItem: TodoItem): Promise<TodoItem> {
        logger.info('function create todo called')

        const params = {
            TableName: this.todosTable,
            Item: todoItem
        }

        const result = await this.docClient.put(params).promise()

        logger.info('todo item created', result)

        return todoItem as TodoItem
    }

    async updateTodoItem(todoId: string, userId: string, todoUpdate: TodoUpdate): Promise<TodoUpdate>{
        logger.info('function update todo called!')

        const result = await this.docClient.update({
            TableName: this.todosTable,
            Key:{
                todoId,
                userId
            },
            UpdateExpression: 'set #name = :name, dueDate = :dueDate, done = :done',
            ExpressionAttributeValues: {
                ':name': todoUpdate.name,
                ':dueDate': todoUpdate.dueDate,
                ':done': todoUpdate.done
            },
            ExpressionAttributeNames: {
                '#name': 'name'
            },
            ReturnValues: "ALL_NEW"
        }).promise()
        logger.info('Todo item updated', result)
        return todoUpdate as TodoUpdate
    }

    async deleteTodoItem(todoId: string, userId: string): Promise<string> {
        logger.info('function delete todo item called!')

        const params = {
            TableName: this.todosTable,
            Key: {
                todoId,
                userId
            }
        }

        const response = await this.docClient.delete(params).promise()
        // console.log(response)
        return "" as string
    }

    async getUploadUrl(todoId: string): Promise<string> {
        logger.info('function update todo attachement called')

        const attachmentUrl = this.s3Client.getSignedUrl('putObject', {
            Bucket: this.s3BucketName,
            Key: todoId,
            Expires: 600
        });

        // await this.docClient.update({
        //     TableName: this.todosTable,
        //     Key:{
        //         todoId,
        //         userId
        //     },
        //     UpdateExpression: 'set attachmentUrl = :attachmentUrl',
        //     ExpressionAttributeValues:{
        //         ':attachmentUrl': attachmentUrl
        //     } 
        // }).promise()
        // console.log(attachmentUrl)
        logger.info('Logging attachmentUrl now!',attachmentUrl)
        return attachmentUrl as string
    }


}