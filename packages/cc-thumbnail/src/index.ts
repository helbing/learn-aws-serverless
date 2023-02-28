import { Duration, RemovalPolicy, CfnOutput } from "aws-cdk-lib"
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs"
import { Runtime } from "aws-cdk-lib/aws-lambda"
import { EventType, Bucket } from "aws-cdk-lib/aws-s3"
import { LambdaDestination } from "aws-cdk-lib/aws-s3-notifications"
import { Construct } from "constructs"
import * as path from "path"

export interface ThumbnailLambdaEnvs {
  [key: string]: string
  /**
   * Destination bucekt name
   */
  DEST_BUCKET: string

  /**
   * Thumbnail width
   */
  RESIZE_WIDTH: string
}

export interface ThumbnailStackProps {
  /**
   * The bucket name which will trigger event to lambada
   * @default demo
   */
  readonly bucketName: string

  /**
   * The width of thumbnail
   * @default 100
   */
  readonly resizeWidth: number
}

export class Thumbnail extends Construct {
  constructor(scope: Construct, id: string, props?: ThumbnailStackProps) {
    super(scope, id)

    const bucketName = props?.bucketName || "demo"
    const resizWidth = (props?.resizeWidth || 100).toString()
    const destBucketName = bucketName + "-resized"

    const handler = new NodejsFunction(this, "thumbnail", {
      runtime: Runtime.NODEJS_18_X,
      entry: path.join(__dirname, "../lambda/index.ts"),
      timeout: Duration.minutes(1),
      memorySize: 1024,
      bundling: {
        forceDockerBundling: true,
        esbuildArgs: {
          "--bundle": "",
          "--platform": "node",
          "--external:sharp": "",
        },
      },
      environment: {
        DEST_BUCKET: destBucketName,
        RESIZE_WIDTH: resizWidth,
      } as ThumbnailLambdaEnvs,
    })

    const bucket = new Bucket(this, "bucket", {
      bucketName: bucketName,
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    })

    bucket.grantRead(handler)

    bucket.addEventNotification(
      EventType.OBJECT_CREATED,
      new LambdaDestination(handler),
    )

    new CfnOutput(this, "bucketName", {
      value: bucket.bucketName,
    })

    new CfnOutput(this, "bucketARN", {
      value: bucket.bucketArn,
    })

    const destBucket = new Bucket(this, "destBucket", {
      bucketName: destBucketName,
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    })

    destBucket.grantWrite(handler)

    new CfnOutput(this, "destBucketName", {
      value: destBucket.bucketName,
    })

    new CfnOutput(this, "destBucketARN", {
      value: destBucket.bucketArn,
    })
  }
}
