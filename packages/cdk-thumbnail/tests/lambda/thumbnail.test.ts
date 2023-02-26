import * as fs from "fs"
import * as path from "path"
import thumbnail from "../../lambda/thumbnail"

describe("Generate thumbnail", () => {
  const buffer = fs.readFileSync(path.join(__dirname, "../testdata/test.png"))

  test("Expect succcess", async () => {
    const expectBuffer = fs.readFileSync(
      path.join(__dirname, "../testdata/test-thumbnail.png"),
    )
    const resBuffer = await thumbnail(buffer)
    expect(resBuffer.compare(expectBuffer)).toBe(0)
  })
})
