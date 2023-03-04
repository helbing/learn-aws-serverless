import { Duration, RemovalPolicy } from "aws-cdk-lib"
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs"
import { Runtime, Tracing } from "aws-cdk-lib/aws-lambda"
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

  /**
   * SupportImageType
   *
   * @default png,jpg
   */
  SUPPORT_IMAGE_TYPES: string
}

export enum imageTypes {
  PNG = "png",
  JPEG = "jpg",
  GIF = "gif",
  SVG = "svg",
  WEBP = "webp",
}

export interface S3ThumbnailStackProps {
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

  /**
   * Image types
   *
   * @default [imageTypes.PNG, imageTypes.JPEG]
   */
  readonly imageTypes?: imageTypes[]
}

export class S3Thumbnail extends Construct {
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
  constructor(scope: Construct, id: string, props?: S3ThumbnailStackProps) {
    super(scope, id)

    const bucketName = props?.bucketName
    const destBucketName = bucketName + "-resized"
    if (bucketName == undefined) {
      throw new Error("Bucket is undefined")
    }

    const resizWidth = props?.resizeWidth || 100
    if (resizWidth < 1 || resizWidth > 300) {
      throw new Error("ResizedWidth between 1 and 300")
    }

    const supportImageTypes = props?.imageTypes || [
      imageTypes.PNG,
      imageTypes.JPEG,
    ]
    if (supportImageTypes.length == 0) {
      throw new Error("No image types")
    }

    this.bucket = new Bucket(this, "bucket", {
      bucketName: bucketName,
      removalPolicy: RemovalPolicy.DESTROY,
      // NOTICE: in real-world application don't auto delete objects
      autoDeleteObjects: true,
    })

    this.destBucket = new Bucket(this, "destBucket", {
      bucketName: destBucketName,
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    })

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
        DEST_BUCKET: this.destBucket.bucketName,
        RESIZE_WIDTH: resizWidth.toString(),
        SUPPORT_IMAGE_TYPES: supportImageTypes.toString(),
      } as ThumbnailLambdaEnvs,
      tracing: Tracing.ACTIVE, // enable x-ray
    })

    this.bucket.grantRead(this.handler)
    this.destBucket.grantWrite(this.handler)

    this.bucket.addEventNotification(
      EventType.OBJECT_CREATED,
      new LambdaDestination(this.handler),
    )
  }
}
