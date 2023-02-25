import { S3Event } from "aws-lambda"
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3"
import type { Readable } from "stream"
import thumbnail from "./thumbnail"

const s3Client = new S3Client({})

export async function handler(event: S3Event) {
  try {
    if (!event || event.Records.length == 0) {
      console.log("event is null or count of records is zero")
      return
    }

    event.Records.map(async function (record) {
      const buffer = await getObjectBuffer(
        record.s3.bucket.name,
        record.s3.object.key,
      )

      const resBuffer = await thumbnail(buffer)
    })
  } catch (error) {
    console.log("err:", error)
  }
}

/**
 * getObjectBuffer
 * @param bucket bucket name
 * @param key object key
 * @returns
 */
async function getObjectBuffer(bucket: string, key: string) {
  const response = await s3Client.send(
    new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    }),
  )

  const stream = response.Body as Readable

  return new Promise<Buffer>((resolve, reject) => {
    const chunks: Buffer[] = []
    stream.on("data", (chunk) => chunks.push(chunk))
    stream.once("end", () => resolve(Buffer.concat(chunks)))
    stream.once("error", reject)
  })
}
