import { S3EventRecord } from "aws-lambda"
import { mock } from "jest-mock-extended"
import {
  lambdaHandler,
  typeMatch,
  IllegalRecordSizeError,
  NotSupportImageTypeError,
} from "./index"
import { ThumbnailLambdaEnvs } from "../src/index"

describe("Run lambda handler", () => {
  test("Expect throw Error, S3Event records == 0 or records > 1", async () => {
    expect(
      lambdaHandler({
        Records: [mock<S3EventRecord>(), mock<S3EventRecord>()],
      }),
    ).rejects.toThrow(new IllegalRecordSizeError())
  })

  test("Expect throw Error, Not supported image type", async () => {
    const oldEnvs = process.env
    process.env = {
      SUPPORT_IMAGE_TYPES: "jpg,svg",
    } as ThumbnailLambdaEnvs

    const mockRecord = Object.assign(mock<S3EventRecord>, {
      s3: {
        object: {
          key: "xxx.png",
        },
      },
    } as S3EventRecord)

    expect(
      lambdaHandler({
        Records: [mockRecord],
      }),
    ).rejects.toThrow(new NotSupportImageTypeError())

    // reset
    process.env = oldEnvs
  })
})

describe("Check image type", () => {
  test("Expect match success", () => {
    expect(typeMatch(["png"], "xxx.png")).toBeTruthy()
  })

  test("Expect match failed", () => {
    expect(typeMatch(["jpg"], "xxx.png")).toBeFalsy()
  })
})
