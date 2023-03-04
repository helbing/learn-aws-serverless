import { Template } from "aws-cdk-lib/assertions"
import { App, Stack } from "aws-cdk-lib"
import { S3Thumbnail, S3ThumbnailStackProps } from "./index"

describe("Test constructs build success", () => {
  test("Expect throw Error, Bucket is undefined", () => {
    expect(() => {
      new S3Thumbnail(new Stack(), "thumbnail", {} as S3ThumbnailStackProps)
    }).toThrow(new Error("Bucket is undefined"))
  })

  test("Expect throw Error, ResizedWidth between 1 and 300", () => {
    expect(() => {
      new S3Thumbnail(new Stack(), "thumbnail", {
        bucketName: "demo",
        resizeWidth: -1,
      } as S3ThumbnailStackProps)
    }).toThrow(new Error("ResizedWidth between 1 and 300"))
  })

  test("Expect throw Error, No image types", () => {
    expect(() => {
      new S3Thumbnail(new Stack(), "thumbnail", {
        bucketName: "demo",
        imageTypes: [],
      } as S3ThumbnailStackProps)
    }).toThrow(new Error("No image types"))
  })

  test("Expect match snapshot", () => {
    const app = new App()
    const stack = new Stack(app, "s3-thumbnail-test")
    new S3Thumbnail(stack, "thumbnail", {
      bucketName: "demo",
    })
    expect(Template.fromStack(stack).toJSON()).toMatchSnapshot()
  })
})
