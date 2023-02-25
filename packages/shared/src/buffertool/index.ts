import { fetch } from "undici"
import { Readable } from "node:stream"

export async function fetchImageURLToBuffer(imageURL: string) {
  const response = await fetch(imageURL)
  const buffer = await response.arrayBuffer()
  console.log("---")
  console.log(123, buffer)
  console.log("---")
  // const arrayBuffer = await (await resposne.blob()).arrayBuffer()
  // return Buffer.from(arrayBuffer)
}
