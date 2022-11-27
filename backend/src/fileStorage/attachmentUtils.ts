import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'

const XAWS = AWSXRay.captureAWS(AWS)

// TODO: Implement the fileStogare logic

const s3BucketName = process.env.ATTACHMENT_S3_BUCKET
const urlExpiration = 6000

export class AttachmentUtils
 {
    constructor(
        private readonly s3 = new XAWS.S3({ signatureVersion: 'v4' }),
        private readonly bucketName = s3BucketName
    ) {}

    async getAttachmentUrl(attachmentId: string): Promise<string>{
        return `https://${this.bucketName}.s3.amazonaws.com/${attachmentId}`
    }

    async getUploadUrl(attachmentId: string): Promise<string> {

        const params = {
            Bucket: this.bucketName,
            Key: attachmentId,
            Expires: urlExpiration
        }
        const url = this.s3.getSignedUrl('putObject', params)

        return url
    }
}