import sharp from "sharp"
import { StatusCodes } from "http-status-codes"
import { S3Event, S3Handler } from "aws-lambda"
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3"

const client: S3Client = new S3Client({ region: process.env.AWS_REGION })

export const handler: S3Handler = async (event: S3Event): Promise<void> => {
  try {
    event.Records.map(async (record) => {
      const resizedBucketName =
        process.env.RESIZED_BUCKET || record.s3.bucket.name + "-resized"

      const resizeKey = decodeURIComponent(
        record.s3.object.key.replace(/\+/g, " "),
      )

      const response = await client.send(
        new GetObjectCommand({
          Bucket: record.s3.bucket.name,
          Key: record.s3.object.key,
        }),
      )

      console.log("resizedBucketName:", resizedBucketName)
      console.log("resizeKey:", resizeKey)
    })
  } catch (error) {
    console.log("err:", error)
  }
}
