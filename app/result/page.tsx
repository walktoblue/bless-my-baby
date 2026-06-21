'use client'
import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { TabNav } from '@/components/tab-nav'

function ResultContent() {
  const params = useSearchParams()
  const imageUrl = params.get('url') || ''
  const childName = params.get('name') || ''

  const [email, setEmail] = useState('')
  const [emailLoading, setEmailLoading] = useState(false)
  const [emailStatus, setEmailStatus] = useState<'idle' | 'ok' | 'error'>('idle')
  const [emailMsg, setEmailMsg] = useState('')
  const [downloading, setDownloading] = useState(false)

  async function handleDownload() {
    if (!imageUrl) return
    setDownloading(true)
    try {
      const res = await fetch(imageUrl)
      const blob = await res.blob()
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = `bless-my-baby${childName ? `-${childName}` : ''}.png`
      a.click()
      URL.revokeObjectURL(a.href)
    } finally {
      setDownloading(false)
    }
  }

  async function handleEmail(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setEmailLoading(true)
    setEmailStatus('idle')
    try {
      const res = await fetch('/api/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, imageUrl, name: childName }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || '발송 실패')
      setEmailStatus('ok')
      setEmailMsg('이메일을 보냈어요! 📬')
    } catch (err: unknown) {
      setEmailStatus('error')
      setEmailMsg(err instanceof Error ? err.message : '이메일 발송에 실패했어요.')
    } finally {
      setEmailLoading(false)
    }
  }

  if (!imageUrl) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center px-4">
        <p className="text-[#737686]">브로마이드 URL을 찾을 수 없어요.</p>
        <Link href="/" className="text-[var(--primary)] font-medium">← 다시 만들기</Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--background)] pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-[var(--border)] shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center">
          <h1 className="text-lg font-bold text-[var(--primary)]">Bless My Baby</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        <div className="text-center mb-5">
          <h2 className="text-2xl font-bold text-[var(--foreground)] mb-1">완성된 브로마이드 🎉</h2>
          <p className="text-sm text-[#737686]">다운로드하거나 이메일로 받아보세요</p>
        </div>

        {/* Bromide preview */}
        <div className="bg-white rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] overflow-hidden mb-5">
          <div className="relative w-full" style={{ paddingBottom: '141.4%' /* A3 ratio */ }}>
            <Image
              src={imageUrl}
              alt="완성된 브로마이드"
              fill
              className="object-contain"
              unoptimized
            />
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          {/* Download */}
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="w-full bg-[var(--primary)] text-white font-semibold py-3.5 rounded-xl flex items-center justify-center gap-2 hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-60"
          >
            {downloading ? (
              <><span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"/> 다운로드 중...</>
            ) : (
              <>⬇️ 다운로드 (A3 고화질)</>
            )}
          </button>

          {/* Email */}
          <form onSubmit={handleEmail} className="space-y-2">
            <div className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="이메일 주소 입력"
                className="flex-1 px-3 py-3 rounded-xl border border-[var(--border)] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all"
              />
              <button
                type="submit"
                disabled={emailLoading || !email.trim()}
                className="px-4 py-3 rounded-xl border border-[var(--border)] bg-white text-sm font-medium text-[#434655] hover:bg-[#F4F2FD] active:scale-[0.98] transition-all disabled:opacity-50 whitespace-nowrap"
              >
                {emailLoading ? '발송 중...' : '이메일로 받기'}
              </button>
            </div>
            {emailStatus === 'ok' && (
              <p className="text-sm text-[#16A34A] bg-[#F0FDF4] px-3 py-2 rounded-lg">{emailMsg}</p>
            )}
            {emailStatus === 'error' && (
              <p className="text-sm text-[var(--destructive)] bg-[#FFF0EE] px-3 py-2 rounded-lg">{emailMsg}</p>
            )}
            <p className="text-xs text-[#737686] px-1">다운로드와 이메일을 동시에 받을 수 있어요</p>
          </form>
        </div>

        {/* Back */}
        <div className="mt-8 text-center">
          <Link
            href="/"
            className="text-sm text-[#737686] hover:text-[var(--primary)] font-medium transition-colors flex items-center justify-center gap-1"
          >
            ← 다시 만들기
          </Link>
        </div>
      </main>

      <TabNav/>
    </div>
  )
}

export default function ResultPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><span className="animate-spin text-2xl">⏳</span></div>}>
      <ResultContent/>
    </Suspense>
  )
}
