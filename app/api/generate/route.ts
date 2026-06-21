import { NextRequest, NextResponse } from 'next/server'
import sharp from 'sharp'
import { v4 as uuidv4 } from 'uuid'
import { buildSvg, FACE, W, H } from '@/lib/template'

export const maxDuration = 60
export const dynamic = 'force-dynamic'

async function extractFace(buf: Buffer): Promise<Buffer> {
  const meta = await sharp(buf).metadata()
  const w = meta.width!
  const h = meta.height!

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
    console.log('[generate] step: parse form')
    const form = await req.formData()
    const photos = form.getAll('photos') as File[]
    const age = (form.get('age') as string) || ''
    const topText = (form.get('topText') as string) || ''
    const date = (form.get('date') as string) || ''
    const name = (form.get('name') as string) || ''

    if (!photos || photos.length === 0) {
      return NextResponse.json({ error: '사진을 올려주세요.' }, { status: 400 })
    }

    console.log('[generate] step: build SVG')
    const svg = buildSvg({ topText, date, name, age })
    const svgBuf = Buffer.from(svg, 'utf-8')
    console.log(`[generate] SVG size: ${svgBuf.length} bytes`)

    console.log('[generate] step: render SVG -> PNG')
    const base = await sharp(svgBuf, { density: 96 })
      .resize(W, H)
      .png()
      .toBuffer()
    console.log(`[generate] base PNG: ${base.length} bytes`)

    console.log('[generate] step: extract face')
    const photoBytes = Buffer.from(await photos[0].arrayBuffer())
    const faceBuf = await extractFace(photoBytes)
    console.log(`[generate] face PNG: ${faceBuf.length} bytes`)

    console.log('[generate] step: composite')
    const faceLeft = Math.round(FACE.cx - FACE.rx - 10) * (W / 3508)
    const faceTop  = Math.round(FACE.cy - FACE.ry - 10) * (H / 4961)

    const result = await sharp(base)
      .composite([{ input: faceBuf, left: Math.round(faceLeft), top: Math.round(faceTop) }])
      .png({ compressionLevel: 6 })
      .toBuffer()
    console.log(`[generate] result PNG: ${result.length} bytes`)

    console.log('[generate] step: upload to Supabase')
    const filename = `${uuidv4()}.png`
    const supabaseUrl = process.env.SUPABASE_URL!
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
    console.log(`[generate] SUPABASE_URL present: ${!!supabaseUrl}, key present: ${!!serviceKey}`)

    const uploadRes = await fetch(
      `${supabaseUrl}/storage/v1/object/bromides/${filename}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${serviceKey}`,
          'apikey': serviceKey,
          'Content-Type': 'image/png',
        },
        body: new Uint8Array(result),
      }
    )

    if (!uploadRes.ok) {
      const errText = await uploadRes.text()
      console.error('[generate] upload failed:', uploadRes.status, errText)
      return NextResponse.json({ error: '이미지 저장에 실패했어요.' }, { status: 500 })
    }

    const publicUrl = `${supabaseUrl}/storage/v1/object/public/bromides/${filename}`
    console.log('[generate] done:', publicUrl)

    return NextResponse.json({ url: publicUrl, filename })
  } catch (err) {
    console.error('Generate error:', err)
    return NextResponse.json({ error: '브로마이드 생성에 실패했어요. 다시 시도해주세요.' }, { status: 500 })
  }
}
