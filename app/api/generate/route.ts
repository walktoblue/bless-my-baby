import { NextRequest, NextResponse } from 'next/server'
import sharp from 'sharp'
import { v4 as uuidv4 } from 'uuid'
import { getSupabaseAdmin } from '@/lib/supabase'
import { buildSvg, FACE, W, H } from '@/lib/template'

export const maxDuration = 60
export const dynamic = 'force-dynamic'

// Face extraction: portrait-crop the uploaded photo
async function extractFace(buf: Buffer): Promise<Buffer> {
  const meta = await sharp(buf).metadata()
  const w = meta.width!
  const h = meta.height!

  // Crop a square from the top-center (face is usually there in portrait/selfie shots)
  const size = Math.min(w, Math.round(h * 0.6))
  const left = Math.max(0, Math.round((w - size) / 2))
  const top = 0

  const fw = FACE.rx * 2 + 20
  const fh = FACE.ry * 2 + 20

  const cropped = await sharp(buf)
    .extract({ left, top, width: size, height: size })
    .resize(fw, fh, { fit: 'cover', position: 'top' })
    .ensureAlpha()
    .toBuffer()

  // Oval mask (white oval on transparent bg → dest-in crop)
  const mask = Buffer.from(
    `<svg width="${fw}" height="${fh}" xmlns="http://www.w3.org/2000/svg">` +
    `<ellipse cx="${fw / 2}" cy="${fh / 2}" rx="${fw / 2 - 10}" ry="${fh / 2 - 6}" fill="white"/>` +
    `</svg>`
  )
  const maskBuf = await sharp(mask).png().toBuffer()

  return sharp(cropped)
    .composite([{ input: maskBuf, blend: 'dest-in' }])
    .png()
    .toBuffer()
}

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData()
    const photos = form.getAll('photos') as File[]
    const age = (form.get('age') as string) || ''
    const topText = (form.get('topText') as string) || ''
    const date = (form.get('date') as string) || ''
    const name = (form.get('name') as string) || ''

    if (!photos || photos.length === 0) {
      return NextResponse.json({ error: '사진을 올려주세요.' }, { status: 400 })
    }

    // Build SVG template
    const svg = buildSvg({ topText, date, name, age })
    const svgBuf = Buffer.from(svg, 'utf-8')

    // Render SVG to PNG at target resolution
    const base = await sharp(svgBuf, { density: 96 })
      .resize(W, H)
      .png()
      .toBuffer()

    // Extract face from first (best-quality) photo
    const photoBytes = Buffer.from(await photos[0].arrayBuffer())
    const faceBuf = await extractFace(photoBytes)

    // Position the face oval on the template
    const faceLeft = Math.round(FACE.cx - FACE.rx - 10) * (W / 3508)
    const faceTop  = Math.round(FACE.cy - FACE.ry - 10) * (H / 4961)

    const result = await sharp(base)
      .composite([{ input: faceBuf, left: Math.round(faceLeft), top: Math.round(faceTop) }])
      .png({ compressionLevel: 6 })
      .toBuffer()

    // Upload to Supabase Storage
    const filename = `${uuidv4()}.png`
    const { error: uploadErr } = await getSupabaseAdmin().storage
      .from('bromides')
      .upload(filename, result, { contentType: 'image/png', upsert: false })

    if (uploadErr) {
      console.error('Supabase upload error:', uploadErr)
      return NextResponse.json({ error: '이미지 저장에 실패했어요.' }, { status: 500 })
    }

    const { data: { publicUrl } } = getSupabaseAdmin().storage
      .from('bromides')
      .getPublicUrl(filename)

    return NextResponse.json({ url: publicUrl, filename })
  } catch (err) {
    console.error('Generate error:', err)
    return NextResponse.json({ error: '브로마이드 생성에 실패했어요. 다시 시도해주세요.' }, { status: 500 })
  }
}
