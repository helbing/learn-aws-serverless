import { S3Event } from "aws-lambda"
import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3"
import middy from "@middy/core"
import { Logger, injectLambdaContext } from "@aws-lambda-powertools/logger"
import { Tracer, captureLambdaHandler } from "@aws-lambda-powertools/tracer"
import {
  Metrics,
  logMetrics,
  MetricUnits,
} from "@aws-lambda-powertools/metrics"
import eventNormalizerMiddleware from "@middy/event-normalizer"
import { Readable } from "stream"
import { streamToBuffer } from "@jorgeferrero/stream-to-buffer"
import { StatusCodes } from "http-status-codes"
import { ThumbnailLambdaEnvs } from "../src/index"
import thumbnail from "./thumbnail"

const serviceName = "serverlessS3Thumbnail"
const logger = new Logger({ serviceName: serviceName })
const tracer = new Tracer({ serviceName: serviceName })
const metrics = new Metrics({ serviceName: serviceName })
tracer.provider.setLogger(logger)

export const handler = middy()
  .use(eventNormalizerMiddleware())
  .use(injectLambdaContext(logger, { logEvent: true }))
  .use(captureLambdaHandler(tracer))
  .use(logMetrics(metrics))
  .handler(lambdaHandler)

export async function lambdaHandler(event: S3Event) {
  const envs = process.env as ThumbnailLambdaEnvs

  if (envs.DEST_BUCKET == "") {
    metrics.addMetric(
      "S3ThumbnailErrorDestinationBucketUnset",
      MetricUnits.Count,
      1,
    )
    throw new Error("Destination bucket unset")
  }

  if (event.Records.length == 0 || event.Records.length > 1) {
    metrics.addMetric("S3ThumbnailErrorIllegalRecordSize", MetricUnits.Count, 1)
    throw new Error("Illegal record size, s3 event records = 0 or records > 1")
  }

  const record = event.Records[0]
  const key = record.s3.object.key

  if (!typeMatch(envs.SUPPORT_IMAGE_TYPES.split(","), key)) {
    metrics.addMetric(
      "S3ThumbnailErrorNotSupportedImageType",
      MetricUnits.Count,
      1,
    )
    throw new Error("Not supported image type")
  }

  const s3 = new S3Client({})

  const image = await s3.send(
    new GetObjectCommand({
      Bucket: record.s3.bucket.name,
      Key: record.s3.object.key,
    }),
  )

  tracer.addResponseAsMetadata(image)

  if (image.$metadata.httpStatusCode != StatusCodes.OK) {
    metrics.addMetric("S3ThumbnailErrorS3GetObjectFailed", MetricUnits.Count, 1)
    throw new Error("S3 get object failed")
  }

  const buffer = await streamToBuffer(image.Body as Readable)
  const resizedBuffer = await thumbnail(buffer, parseInt(envs.RESIZE_WIDTH))

  const result = await s3.send(
    new PutObjectCommand({
      Bucket: envs.DEST_BUCKET,
      Key: record.s3.object.key,
      Body: resizedBuffer,
      ContentType: image.ContentType,
    }),
  )

  tracer.addResponseAsMetadata(result)

  if (
    result.$metadata.httpStatusCode != StatusCodes.OK &&
    result.$metadata.httpStatusCode != StatusCodes.CREATED
  ) {
    metrics.addMetric("S3ThumbnailErrorS3PutObjectFailed", MetricUnits.Count, 1)
    throw new Error("S3 put object failed")
  }

  metrics.addMetric("S3ThumbnailHandleSuccess", MetricUnits.Count, 1)
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
