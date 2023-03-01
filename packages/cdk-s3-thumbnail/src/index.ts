import { Duration, RemovalPolicy } from "aws-cdk-lib"
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
   */
  readonly bucketName: string

  /**
   * The width of thumbnail
   *
   * @default 100
   */
  readonly resizeWidth?: number
}

export class Thumbnail extends Construct {
  /**
   * Upload bucket
   */
  public readonly bucket: Bucket

  /**
   * Resized bucket
   */
  public readonly destBucket: Bucket

  /**
   * Lambda function handler
   */
  public readonly handler: NodejsFunction

  /**
   * @param scope {Construct}
   * @param id string
   * @param props {ThumbnailStackProps}
   * @throws {BucketUndefinedError}
   */
  constructor(scope: Construct, id: string, props?: ThumbnailStackProps) {
    super(scope, id)

    if (props?.bucketName == undefined) {
      throw new BucketUndefinedError()
    }

    const bucketName = props?.bucketName || "demo"
    const destBucketName = bucketName + "-resized"
    const resizWidth = (props?.resizeWidth || 100).toString()

    this.handler = new NodejsFunction(this, "thumbnail", {
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

    this.bucket = new Bucket(this, "bucket", {
      bucketName: bucketName,
      // NOTICE: in real-world project, you should set it to
      // RemovalPolicy.RETAIN, and don't auto delete objects
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    })

    this.bucket.grantRead(this.handler)

    this.bucket.addEventNotification(
      EventType.OBJECT_CREATED,
      new LambdaDestination(this.handler),
    )

    this.destBucket = new Bucket(this, "destBucket", {
      bucketName: destBucketName,
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    })

    this.destBucket.grantWrite(this.handler)
  }
}

export class BucketUndefinedError extends Error {
  constructor() {
    super("Bucket is undefined")
  }
}
