import sharp from "sharp"

/**
 * Generate thumbnail
 * @param stream
 * @param size tnumbnail width, height auto, default 100
 * @returns
 * @throws {Error}
 */
export default async function thumbnail(stream: Buffer, size?: number) {
  return sharp(stream)
    .resize({ width: size || 100 })
    .toBuffer()
}
