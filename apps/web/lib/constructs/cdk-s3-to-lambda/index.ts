import { Duration, RemovalPolicy } from "aws-cdk-lib"
import * as s3 from "aws-cdk-lib/aws-s3"
import { Construct } from "constructs"

export interface S3ToLambdaStackProps {
  /**
   * The bucket name which will trigger event to lambada
   *
   * @default - demo
   */
  readonly bucketName: string
}

export class S3ToLambda extends Construct {
  constructor(scope: Construct, id: string, props?: S3ToLambdaStackProps) {
    super(scope, id)

    const bucket = new s3.Bucket(this, props?.bucketName || "example", {
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    })
  }
}
