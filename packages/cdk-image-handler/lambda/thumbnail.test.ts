import * as fs from "fs"
import * as path from "path"
import sharp from "sharp"
import thumbnail from "./thumbnail"

test("Except generate thumbnail", async () => {
  const buffer = fs.readFileSync(path.join(__dirname, "testdata/test.png"))
  const tnBuffer = await thumbnail(buffer)
  // const image = await sharp(buffer)
  // const metadata = image.metadata()
  // console.log(metadata)
  // const testURL = "https://dummyimage.com/60000.png0x400/efefef/000.png"
  // const buffer = await fetchImageURLToBuffer(testURL)
  // console.log(buffer)
  // console.log()
  // console.log(
  //   Buffer.compare(
  //     buffer,
  //     fs.readFileSync(path.join(__dirname, "testdata/test.png")),
  //   ),
  // )
  // // expect(
  // //   Buffer.compare(
  // //     buffer,
  // //     fs.readFileSync(path.join(__dirname, "testdata/test.png")),
  // //   ),
  // // ).toBe(0)
})
