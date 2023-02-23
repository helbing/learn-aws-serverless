import * as lambda from "aws-cdk-lib/aws-lambda"
import { Duration, RemovalPolicy } from "aws-cdk-lib"
import * as s3 from "aws-cdk-lib/aws-s3"
import * as s3n from "aws-cdk-lib/aws-s3-notifications"
import { Construct } from "constructs"
import path from "path"

export default function (scope: Construct) {
  const uploadBucket = new s3.Bucket(
    scope,
    "helbing-learn-aws-serverless-upload-image",
    {
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    },
  )
}

// export default class CDKResizeImage {
//   private readonly resizeImageFunctionName: string =
//     process.env.LAMBDA_RESIZE_IMAGE ||
//     "helbing-learn-aws-serverless-resize-image"

//   private readonly uploadBucketName: string =
//     process.env.BUCKET_UPLOAD_IMAGE ||
//     "helbing-learn-aws-serverless-upload-image"

//   private readonly resizedBucketName: string =
//     this.uploadBucketName + "-resized"

//   constructor(scope: Construct) {
//     const resizeImageFunction = new lambda.Function(
//       scope,
//       this.resizeImageFunctionName,
//       {
//         runtime: lambda.Runtime.NODEJS_18_X,
//         handler: "resize-image.handler",
//         code: lambda.Code.fromAsset(path.join(__dirname, "/../functions")),
//         timeout: Duration.minutes(5),
//         memorySize: 128,
//         environment: {
//           RESIZED_BUCKET: this.resizedBucketName,
//         },
//       },
//     )

//     const uploadBucket = new s3.Bucket(scope, this.uploadBucketName, {
//       removalPolicy: RemovalPolicy.DESTROY,
//       autoDeleteObjects: true,
//     })

//     uploadBucket.addEventNotification(
//       s3.EventType.OBJECT_CREATED,
//       new s3n.LambdaDestination(resizeImageFunction),
//     )

//     const resizedBucket = new s3.Bucket(scope, this.resizedBucketName, {
//       versioned: true,
//     })

//     // new cdk.CfnOutput(this, "", {})
//   }
// }
