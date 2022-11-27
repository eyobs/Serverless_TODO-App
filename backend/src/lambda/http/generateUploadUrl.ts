import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'

import { getUserId } from '../utils'
import { generateUploadUrl, updateAttachmentUrl } from '../../businessLogic/todos'

import * as uuid from 'uuid'

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId
    // TODO: Return a presigned URL to upload a file for a TODO item with the provided id

    const userId = getUserId(event)
    const attachmentId = uuid.v4()

    const url = await generateUploadUrl(attachmentId)
    await updateAttachmentUrl(userId, todoId, attachmentId)

    return {
      statusCode: 201,
      body: JSON.stringify({
        uploadUrl : url
      })
    }
  }
)

handler
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  )
