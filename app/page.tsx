'use client'
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { TabNav } from '@/components/tab-nav'

const MAX_PHOTOS = 3

// Compress image client-side before upload (phones shoot 5-15MB; resize to ≤1400px JPEG)
async function compressPhoto(file: File): Promise<File> {
  const MAX_DIM = 1400
  const QUALITY = 0.85
  return new Promise(resolve => {
    const img = new window.Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      let w = img.naturalWidth
      let h = img.naturalHeight
      if (w > MAX_DIM || h > MAX_DIM) {
        if (w > h) { h = Math.round(h * MAX_DIM / w); w = MAX_DIM }
        else { w = Math.round(w * MAX_DIM / h); h = MAX_DIM }
      }
      const canvas = document.createElement('canvas')
      canvas.width = w; canvas.height = h
      canvas.getContext('2d')!.drawImage(img, 0, 0, w, h)
      URL.revokeObjectURL(url)
      canvas.toBlob(blob => {
        resolve(new File([blob!], file.name.replace(/\.[^.]+$/, '.jpg'), { type: 'image/jpeg' }))
      }, 'image/jpeg', QUALITY)
    }
    img.onerror = () => { URL.revokeObjectURL(url); resolve(file) }
    img.src = url
  })
}

export default function HomePage() {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)
  const [photos, setPhotos] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [age, setAge] = useState('')
  const [topText, setTopText] = useState('')
  const [date, setDate] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function addFiles(files: FileList | null) {
    if (!files) return
    const next = [...photos]
    const nextPrev = [...previews]
    for (const f of Array.from(files)) {
      if (next.length >= MAX_PHOTOS) break
      next.push(f)
      nextPrev.push(URL.createObjectURL(f))
    }
    setPhotos(next)
    setPreviews(nextPrev)
  }

  function removePhoto(i: number) {
    URL.revokeObjectURL(previews[i])
    setPhotos(p => p.filter((_, idx) => idx !== i))
    setPreviews(p => p.filter((_, idx) => idx !== i))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (photos.length === 0) { setError('사진을 한 장 이상 올려주세요.'); return }

    setLoading(true)
    try {
      // Compress images before upload to stay within Vercel's 4.5MB body limit
      const compressed = await Promise.all(photos.map(compressPhoto))

      const fd = new FormData()
      compressed.forEach(f => fd.append('photos', f))
      fd.append('age', age)
      fd.append('topText', topText)
      fd.append('date', date)
      fd.append('name', name)

      const res = await fetch('/api/generate', { method: 'POST', body: fd })
      let json: { error?: string; url?: string }
      try {
        json = await res.json()
      } catch {
        if (res.status === 413) throw new Error('사진 파일이 너무 커요. 더 작은 사진을 사용해 주세요.')
        throw new Error(`서버 오류 (${res.status})`)
      }
      if (!res.ok) throw new Error(json.error || '오류가 발생했어요.')
      router.push(`/result?url=${encodeURIComponent(json.url!)}&name=${encodeURIComponent(name)}`)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '오류가 발생했어요.')
      setLoading(false)
    }
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
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-[var(--foreground)] mb-1">아이 브로마이드 만들기</h2>
          <p className="text-sm text-[#737686]">아이 사진으로 신체 부위 브로마이드를 만들어보세요</p>
        </div>

        <div className="bg-white rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.04)] p-5">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Photo Upload */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[var(--foreground)]">
                아이 사진 <span className="text-[#737686]">(최대 3장)</span>
              </label>
              <div
                className="border-2 border-dashed border-[rgba(37,99,235,0.35)] rounded-xl bg-[#F8F9FF] flex flex-col items-center justify-center py-10 px-4 cursor-pointer hover:bg-[#EEF2FF] transition-colors"
                onClick={() => fileRef.current?.click()}
              >
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={e => addFiles(e.target.files)}
                />
                <span className="text-4xl mb-2">📷</span>
                <p className="text-sm font-medium text-[var(--primary)] text-center">사진을 올려주세요</p>
                <p className="text-xs text-[#737686] mt-1 text-center">얼굴이 잘 보이는 사진일수록 좋아요</p>
              </div>

              {previews.length > 0 && (
                <div className="flex gap-2 mt-2 flex-wrap">
                  {previews.map((src, i) => (
                    <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden shadow-sm group">
                      <Image src={src} alt={`photo ${i + 1}`} fill className="object-cover"/>
                      <button
                        type="button"
                        onClick={() => removePhoto(i)}
                        className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-lg font-bold"
                      >✕</button>
                    </div>
                  ))}
                  {photos.length < MAX_PHOTOS && (
                    <button
                      type="button"
                      onClick={() => fileRef.current?.click()}
                      className="w-20 h-20 rounded-lg border-2 border-dashed border-[var(--border)] flex items-center justify-center text-[var(--primary)] text-2xl hover:bg-[#F0F4FF] transition-colors"
                    >+</button>
                  )}
                </div>
              )}
            </div>

            {/* Age */}
            <div className="space-y-1">
              <label htmlFor="age" className="block text-sm font-medium text-[var(--foreground)]">아이 나이</label>
              <input
                id="age"
                type="number"
                min="0"
                max="20"
                value={age}
                onChange={e => setAge(e.target.value)}
                placeholder="예: 5"
                className="w-full px-3 py-3 rounded-lg border border-[var(--border)] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all"
              />
            </div>

            {/* Top text */}
            <div className="space-y-1">
              <label htmlFor="topText" className="block text-sm font-medium text-[var(--foreground)]">
                상단 문구 <span className="text-[#737686]">(선택)</span>
              </label>
              <input
                id="topText"
                type="text"
                value={topText}
                onChange={e => setTopText(e.target.value)}
                placeholder="예: 우리 아이 이름 또는 특별한 날"
                className="w-full px-3 py-3 rounded-lg border border-[var(--border)] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all"
              />
            </div>

            {/* Bottom text */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[var(--foreground)]">
                하단 문구 <span className="text-[#737686]">(선택)</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label htmlFor="date" className="block text-xs text-[#737686]">날짜 (생일)</label>
                  <input
                    id="date"
                    type="text"
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    placeholder="예: 2024.11.24"
                    className="w-full px-3 py-2.5 rounded-lg border border-[var(--border)] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="name" className="block text-xs text-[#737686]">이름</label>
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="예: 김사랑"
                    className="w-full px-3 py-2.5 rounded-lg border border-[var(--border)] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Error */}
            {error && (
              <p className="text-sm text-[var(--destructive)] bg-[#FFF0EE] px-3 py-2 rounded-lg">{error}</p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[var(--primary)] text-white font-semibold py-3.5 rounded-xl flex items-center justify-center gap-2 hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"/>
                  브로마이드를 만들고 있어요...
                </>
              ) : (
                <>✨ 브로마이드 만들기</>
              )}
            </button>
          </form>
        </div>

        {/* Privacy notice */}
        <p className="text-center text-xs text-[#737686] mt-4 flex items-center justify-center gap-1">
          <span>🔒</span> 업로드된 사진은 생성 후 즉시 파기됩니다.
        </p>
      </main>

      <TabNav/>
    </div>
  )
}
