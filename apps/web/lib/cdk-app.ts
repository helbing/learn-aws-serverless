import { Duration, RemovalPolicy, Stack, StackProps } from "aws-cdk-lib"
import * as s3 from "aws-cdk-lib/aws-s3"
import { Construct } from "constructs"

export default class CDKApp extends Stack {
  private readonly resizeImageFunctionName: string =
    process.env.LAMBDA_RESIZE_IMAGE ||
    "helbing-learn-aws-serverless-resize-image"

  private readonly uploadBucketName: string =
    process.env.BUCKET_UPLOAD_IMAGE ||
    "helbing-learn-aws-serverless-upload-image"

  private readonly resizedBucketName: string =
    this.uploadBucketName + "-resized"

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props)

    this.resizeImage()
  }
  private resizeImage() {
    const uploadBucket = new s3.Bucket(this, this.uploadBucketName, {
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    })
  }
}
