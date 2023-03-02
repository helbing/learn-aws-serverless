import { S3Event } from "aws-lambda"
import { ThumbnailLambdaEnvs } from "../src/index"
import { S3 } from "aws-sdk"
import type { Readable } from "stream"
import { Buffer } from "buffer"
import thumbnail from "./thumbnail"

const s3 = new S3()
const envs = process.env as ThumbnailLambdaEnvs

export async function handler(event: S3Event) {
  for (const record of event.Records) {
    const key = record.s3.object.key

    if (!typeMatch(envs.SUPPORT_IMAGE_TYPES.split(","), key)) {
      throw new Error("Not supported image type")
    }

    const image = await s3
      .getObject({
        Bucket: record.s3.bucket.name,
        Key: record.s3.object.key,
      })
      .promise()

    const chunks = []
    for await (const chunk of image.Body as Readable) {
      chunks.push(chunk)
    }

    const resizedBuffer = await thumbnail(
      Buffer.concat(chunks),
      parseInt(envs.RESIZE_WIDTH),
    )

    await s3
      .putObject({
        Bucket: envs.DEST_BUCKET,
        Key: record.s3.object.key,
        Body: resizedBuffer,
        ContentType: "image",
      })
      .promise()
  }
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
