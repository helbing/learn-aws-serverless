import { Duration, RemovalPolicy, Stack, StackProps } from "aws-cdk-lib"
import * as s3 from "aws-cdk-lib/aws-s3"
import { Construct } from "constructs"
import { ImageHandler } from "@las/cdk-image-handler"

export default class CDKApp extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props)

    const imageHandler = new ImageHandler(this, "fasd", {
      bucketName: "exam",
    })
  }
}
