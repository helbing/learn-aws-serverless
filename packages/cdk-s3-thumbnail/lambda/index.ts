import { S3Event } from "aws-lambda"
import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3"
import middy from "@middy/core"
import { Readable } from "stream"
import { streamToBuffer } from "@jorgeferrero/stream-to-buffer"
import { ThumbnailLambdaEnvs } from "../src/index"
import thumbnail from "./thumbnail"

export const handler = middy().handler(lambdaHandler)

export async function lambdaHandler(event: S3Event) {
  const envs = process.env as ThumbnailLambdaEnvs

  if (envs.DEST_BUCKET == "") {
    throw new DestBucketUnsetError()
  }

  if (event.Records.length == 0 || event.Records.length > 1) {
    throw new IllegalRecordSizeError()
  }

  const record = event.Records[0]
  const key = record.s3.object.key

  if (!typeMatch(envs.SUPPORT_IMAGE_TYPES.split(","), key)) {
    throw new NotSupportImageTypeError()
  }

  const s3 = new S3Client({})

  const image = await s3.send(
    new GetObjectCommand({
      Bucket: record.s3.bucket.name,
      Key: record.s3.object.key,
    }),
  )

  const buffer = await streamToBuffer(image.Body as Readable)
  const resizedBuffer = await thumbnail(buffer, parseInt(envs.RESIZE_WIDTH))

  await s3.send(
    new PutObjectCommand({
      Bucket: envs.DEST_BUCKET,
      Key: record.s3.object.key,
      Body: resizedBuffer,
      ContentType: image.ContentType,
    }),
  )

  return null
}

export function typeMatch(supportImageTypes: string[], key: string) {
  key = decodeURIComponent(key.replace(/\+/g, " "))
  const typeMatch = key.match(/\.([^.]*)$/)
  if (!typeMatch) {
    return false
  }
  const imageType = typeMatch[1].toLowerCase()
  return supportImageTypes.includes(imageType)
}

export class DestBucketUnsetError extends Error {
  constructor() {
    super("Destination bucket unset")
  }
}

export class IllegalRecordSizeError extends Error {
  constructor() {
    super("Illegal record size, s3 event records = 0 or records > 1")
  }
}

export class NotSupportImageTypeError extends Error {
  constructor() {
    super("Not supported image type")
  }
}
