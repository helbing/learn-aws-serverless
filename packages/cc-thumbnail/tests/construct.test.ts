import { Template } from "aws-cdk-lib/assertions"
import { App, Stack } from "aws-cdk-lib"
import { Thumbnail, ThumbnailStackProps } from "../src/index"

describe("Test construct is generate succcess", () => {
  const app = new App()
  const stack = new Stack(app, "TestConstruct")
  new Thumbnail(stack, "testing-cc-thumbnail", {} as ThumbnailStackProps)

  const template = Template.fromStack(stack)

  test("Expect Lambda generate succcess", () => {
    template.hasResourceProperties("AWS::Lambda::Function", {
      Environment: {
        Variables: {
          DEST_BUCKET: "demo-resized",
          RESIZE_WIDTH: "100",
        },
      },
      Handler: "index.handler",
      MemorySize: 1024,
      Runtime: "nodejs18.x",
      Timeout: 60,
    })
  })

  test("Expect S3 bucket generate succcess", () => {
    template.hasResource("AWS::S3::Bucket", {
      Properties: {
        BucketName: "demo",
      },
      UpdateReplacePolicy: "Delete",
      DeletionPolicy: "Delete",
    })
  })

  test("Expect s3 destination bucket generate succcess", () => {
    template.hasResource("AWS::S3::Bucket", {
      Properties: {
        BucketName: "demo-resized",
      },
      UpdateReplacePolicy: "Delete",
      DeletionPolicy: "Delete",
    })
  })
})
