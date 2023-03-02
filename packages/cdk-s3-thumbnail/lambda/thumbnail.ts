import sharp from "sharp"
import { Buffer } from "buffer"

export default async function thumbnail(buffer: Buffer, size?: number) {
  return sharp(buffer)
    .resize({ width: size || 100 })
    .toBuffer()
}
