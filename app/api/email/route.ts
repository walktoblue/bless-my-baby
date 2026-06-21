import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { email, imageUrl, name } = await req.json()

    if (!email || !imageUrl) {
      return NextResponse.json({ error: '이메일과 이미지 URL이 필요합니다.' }, { status: 400 })
    }

    const html = `
<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
  <h1 style="color:#2563EB;font-size:24px;margin-bottom:8px">Bless My Baby</h1>
  <p style="color:#1A1B22;font-size:16px;margin-bottom:24px">${name ? `${name}의 ` : ''}브로마이드가 완성되었어요!</p>
  <a href="${imageUrl}" style="display:inline-block;background:#2563EB;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;margin-bottom:24px">브로마이드 다운로드</a>
  <p style="color:#737686;font-size:13px">버튼이 보이지 않으면 이 링크를 브라우저에 붙여넣으세요:<br><a href="${imageUrl}" style="color:#2563EB">${imageUrl}</a></p>
  <hr style="border:none;border-top:1px solid #E3E1EC;margin:24px 0">
  <p style="color:#737686;font-size:12px">업로드된 사진은 생성 후 즉시 파기됩니다.</p>
</div>`

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Bless My Baby <onboarding@resend.dev>',
        to: email,
        subject: '완성된 브로마이드가 도착했어요',
        html,
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      console.error('Resend API error:', err)
      return NextResponse.json({ error: '이메일 발송에 실패했어요.' }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Email route error:', err)
    return NextResponse.json({ error: '이메일 발송에 실패했어요.' }, { status: 500 })
  }
}
