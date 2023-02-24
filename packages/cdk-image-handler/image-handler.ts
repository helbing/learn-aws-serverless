import { Duration, RemovalPolicy } from "aws-cdk-lib"
import * as s3 from "aws-cdk-lib/aws-s3"
import { Construct } from "constructs"

export interface ImageHandlerStackProps {
  /**
   * The bucket name which will trigger event to lambada
   *
   * @default - demo
   */
  readonly bucketName: string
}

export class ImageHandler extends Construct {
  constructor(scope: Construct, id: string, props?: ImageHandlerStackProps) {
    super(scope, id)

    const bucket = new s3.Bucket(this, props?.bucketName || "demo", {
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    })
  }
}
