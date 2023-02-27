import sharp from "sharp"

export default async function thumbnail(stream: Buffer, size?: number) {
  return sharp(stream)
    .resize({ width: size || 100 })
    .toBuffer()
}
