import * as fs from "fs"
import * as path from "path"
import { S3EventRecord } from "aws-lambda"
import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3"
import { StatusCodes } from "http-status-codes"
import { SdkStream } from "@aws-sdk/types"
import { Readable } from "stream"
import { mock } from "jest-mock-extended"
import { mockClient } from "aws-sdk-client-mock"
import { lambdaHandler, typeMatch } from "./index"
import { ThumbnailLambdaEnvs } from "../src/index"

describe("Run lambda handler", () => {
  const defaultEnvs = {
    ...process.env,
    ...({
      DEST_BUCKET: "demo-resized",
      RESIZE_WIDTH: "100",
      SUPPORT_IMAGE_TYPES: "png,jpg,svg",
    } as ThumbnailLambdaEnvs),
  }

  const mockS3 = mockClient(S3Client)

  const mockRecord = Object.assign(mock<S3EventRecord>, {
    s3: {
      bucket: {
        name: "demo",
      },
      object: {
        key: "xxx.png",
      },
    },
  } as S3EventRecord)

  beforeEach(() => {
    jest.resetModules()
    process.env = { ...defaultEnvs }
  })

  test("Expect throw Error, Destination bucket unset", async () => {
    process.env.DEST_BUCKET = ""

    await expect(
      lambdaHandler({
        Records: [mockRecord],
      }),
    ).rejects.toThrow(new Error("Destination bucket unset"))
  })

  test("Expect throw Error, S3Event records == 0 or records > 1", async () => {
    await expect(
      lambdaHandler({
        Records: [mock<S3EventRecord>(), mock<S3EventRecord>()],
      }),
    ).rejects.toThrow(
      new Error("Illegal record size, s3 event records = 0 or records > 1"),
    )
  })

  test("Expect throw Error, Not supported image type", async () => {
    process.env.SUPPORT_IMAGE_TYPES = "jpg,svg"

    await expect(
      lambdaHandler({
        Records: [mockRecord],
      }),
    ).rejects.toThrow(new Error("Not supported image type"))
  })

  test("Expect throw Error, S3 get object failed", async () => {
    mockS3.on(GetObjectCommand).resolves({
      $metadata: {
        httpStatusCode: StatusCodes.BAD_GATEWAY,
      },
    })

    await expect(
      lambdaHandler({
        Records: [mockRecord],
      }),
    ).rejects.toThrow(new Error("S3 get object failed"))
  })

  test("Expect throw Error, S3 put object failed", async () => {
    mockS3.on(GetObjectCommand).resolves({
      $metadata: {
        httpStatusCode: StatusCodes.OK,
      },
      Body: fs.createReadStream(
        path.join(__dirname, "../tests/testdata/test.png"),
      ) as unknown as SdkStream<Readable>,
    })

    mockS3.on(PutObjectCommand).resolves({
      $metadata: {
        httpStatusCode: StatusCodes.BAD_GATEWAY,
      },
    })

    await expect(
      lambdaHandler({
        Records: [mockRecord],
      }),
    ).rejects.toThrow(new Error("S3 put object failed"))
  })

  test("Expect success", async () => {
    mockS3.on(GetObjectCommand).resolves({
      $metadata: {
        httpStatusCode: StatusCodes.OK,
      },
      Body: fs.createReadStream(
        path.join(__dirname, "../tests/testdata/test.png"),
      ) as unknown as SdkStream<Readable>,
    })

    mockS3.on(PutObjectCommand).resolves({
      $metadata: {
        httpStatusCode: StatusCodes.CREATED,
      },
    })

    await expect(
      lambdaHandler({
        Records: [mockRecord],
      }),
    ).resolves.not.toThrow()
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
