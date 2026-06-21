import Link from 'next/link'
import { TabNav } from '@/components/tab-nav'

export default function GalleryPage() {
  return (
    <div className="min-h-screen bg-[var(--background)] pb-24">
      <header className="sticky top-0 z-40 bg-white border-b border-[var(--border)] shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center">
          <h1 className="text-lg font-bold text-[var(--primary)]">Bless My Baby</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="text-5xl mb-4">🖼</div>
        <h2 className="text-xl font-bold text-[var(--foreground)] mb-2">갤러리</h2>
        <p className="text-sm text-[#737686] mb-6">준비 중입니다.</p>
        <Link
          href="/"
          className="inline-block bg-[var(--primary)] text-white text-sm font-semibold px-6 py-2.5 rounded-xl hover:brightness-110 transition-all"
        >
          브로마이드 만들러 가기
        </Link>
      </main>

      <TabNav/>
    </div>
  )
}
