import { Template } from "aws-cdk-lib/assertions"
import { App, Stack } from "aws-cdk-lib"
import {
  Thumbnail,
  ThumbnailStackProps,
  BucketUndefinedError,
} from "../src/index"

describe("Test constructs build succcess", () => {
  test("Expect throw BucketUndefinedError", () => {
    expect(() => {
      new Thumbnail(new Stack(), "thumbnail", {} as ThumbnailStackProps)
    }).toThrow(BucketUndefinedError)
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
