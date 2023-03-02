import * as fs from "fs"
import * as path from "path"
import thumbnail from "../lambda/thumbnail"

describe("Generate thumbnail", () => {
  test("Expect match image", async () => {
    const buffer = fs.readFileSync(
      path.join(__dirname, "../tests/testdata/test.png"),
    )
    const expectBuffer = fs.readFileSync(
      path.join(__dirname, "../tests/testdata/test-thumbnail.png"),
    )
    const resBuffer = await thumbnail(buffer)
    expect(resBuffer.compare(expectBuffer)).toBe(0)
  })
})
