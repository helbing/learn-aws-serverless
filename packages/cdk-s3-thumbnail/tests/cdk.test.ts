import { Template } from "aws-cdk-lib/assertions"
import { App, Stack } from "aws-cdk-lib"
import {
  Thumbnail,
  ThumbnailStackProps,
  BucketUndefinedError,
  ValidateResizeWidthError,
  NoImageTypesError,
} from "../src/index"

describe("Test constructs build success", () => {
  test("Expect throw BucketUndefinedError", () => {
    expect(() => {
      new Thumbnail(new Stack(), "thumbnail", {} as ThumbnailStackProps)
    }).toThrow(BucketUndefinedError)
  })

  test("Expect throw ValidateResizeWidthError", () => {
    expect(() => {
      new Thumbnail(new Stack(), "thumbnail", {
        bucketName: "demo",
        resizeWidth: -1,
      } as ThumbnailStackProps)
    }).toThrow(ValidateResizeWidthError)
  })

  test("Expect throw NoImageTypesError", () => {
    expect(() => {
      new Thumbnail(new Stack(), "thumbnail", {
        bucketName: "demo",
        imageTypes: [],
      } as ThumbnailStackProps)
    }).toThrow(NoImageTypesError)
  })

  test("Expect match snapshot", () => {
    const app = new App()
    const stack = new Stack(app, "s3-thumbnail-test")
    new Thumbnail(stack, "thumbnail", {
      bucketName: "demo",
    })
    expect(Template.fromStack(stack).toJSON()).toMatchSnapshot()
  })
})
