import { S3EventRecord } from "aws-lambda"
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3"
import { mock } from "jest-mock-extended"
import { mockClient } from "aws-sdk-client-mock"
import {
  lambdaHandler,
  typeMatch,
  DestBucketUnsetError,
  IllegalRecordSizeError,
  NotSupportImageTypeError,
} from "./index"
import { ThumbnailLambdaEnvs } from "../src/index"

const s3Mock = mockClient(S3Client)

describe("Run lambda handler", () => {
  const defaultEnvs = {
    ...process.env,
    ...({
      DEST_BUCKET: "demo-resized",
      RESIZE_WIDTH: "100",
      SUPPORT_IMAGE_TYPES: "png,jpg,svg",
    } as ThumbnailLambdaEnvs),
  }

  beforeEach(() => {
    jest.resetModules()
    process.env = { ...defaultEnvs }
  })

  test("Expect throw Error, Destination bucket unset", () => {
    process.env.DEST_BUCKET = ""

    lambdaHandler({
      Records: [mock<S3EventRecord>()],
    }).catch((error) => {
      expect(error).toBeInstanceOf(DestBucketUnsetError)
    })
  })

  test("Expect throw Error, S3Event records == 0 or records > 1", () => {
    lambdaHandler({
      Records: [mock<S3EventRecord>(), mock<S3EventRecord>()],
    }).catch((error) => {
      expect(error).toBeInstanceOf(IllegalRecordSizeError)
    })
  })

  test("Expect throw Error, Not supported image type", () => {
    process.env.SUPPORT_IMAGE_TYPES = "jpg,svg"
    const mockRecord = Object.assign(mock<S3EventRecord>, {
      s3: {
        object: {
          key: "xxx.png",
        },
      },
    } as S3EventRecord)

    lambdaHandler({
      Records: [mockRecord],
    }).catch((error) => {
      expect(error).toBeInstanceOf(NotSupportImageTypeError)
    })
  })

  // test("Expect success", async () => {
  //   const oldEnvs = process.env
  //   process.env = {
  //     SUPPORT_IMAGE_TYPES: "png",
  //   } as ThumbnailLambdaEnvs

  //   const mockRecord = Object.assign(mock<S3EventRecord>, {
  //     s3: {
  //       object: {
  //         key: "xxx.png",
  //       },
  //     },
  //   } as S3EventRecord)
  // })
})

describe("Check image type", () => {
  test("Expect match success", () => {
    expect(typeMatch(["png"], "xxx.png")).toBeTruthy()
  })

  test("Expect match failed", () => {
    expect(typeMatch(["jpg"], "xxx.png")).toBeFalsy()
  })
})
