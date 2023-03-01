import { S3Event } from "aws-lambda"
import { ThumbnailLambdaEnvs } from "../src/index"

const envs = process.env as ThumbnailLambdaEnvs

export async function handler(event: S3Event) {
  console.log("---")
  console.log(event)
  console.log(envs)
  console.log("---")
}
