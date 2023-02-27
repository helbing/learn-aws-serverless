import { Capture, Match, Template } from "aws-cdk-lib/assertions"
import { Stack } from "aws-cdk-lib"
import { Runtime } from "aws-cdk-lib/aws-lambda"
import { Thumbnail, ThumbnailStackProps } from "../src/index"

describe("Test construct", () => {
  test("Except dest bucket is demo-resized", () => {
    const stack = new Stack()
    new Thumbnail(stack, "testing", {} as ThumbnailStackProps)

    const template = Template.fromStack(stack)
    console.log(template)
  })
})
