import { Template } from "aws-cdk-lib/assertions"
import { App, Stack } from "aws-cdk-lib"
import {
  S3Thumbnail,
  S3ThumbnailStackProps,
  BucketUndefinedError,
  ValidateResizeWidthError,
  NoImageTypesError,
} from "../src/index"

describe("Test constructs build success", () => {
  test("Expect throw BucketUndefinedError", () => {
    expect(() => {
      new S3Thumbnail(new Stack(), "thumbnail", {} as S3ThumbnailStackProps)
    }).toThrow(BucketUndefinedError)
  })

  test("Expect throw ValidateResizeWidthError", () => {
    expect(() => {
      new S3Thumbnail(new Stack(), "thumbnail", {
        bucketName: "demo",
        resizeWidth: -1,
      } as S3ThumbnailStackProps)
    }).toThrow(ValidateResizeWidthError)
  })

  test("Expect throw NoImageTypesError", () => {
    expect(() => {
      new S3Thumbnail(new Stack(), "thumbnail", {
        bucketName: "demo",
        imageTypes: [],
      } as S3ThumbnailStackProps)
    }).toThrow(NoImageTypesError)
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
