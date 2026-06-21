'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function TabNav() {
  const path = usePathname()
  const tabs = [
    { href: '/',        icon: '✨', label: 'Create'  },
    { href: '/gallery', icon: '🖼', label: 'Gallery' },
    { href: '/profile', icon: '👤', label: 'Profile' },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex justify-around items-center py-2 px-4 bg-white border-t border-[var(--border)] md:hidden shadow-[0_-4px_20px_rgba(0,0,0,0.04)]">
      {tabs.map(t => {
        const active = path === t.href
        return (
          <Link
            key={t.href}
            href={t.href}
            className={`flex flex-col items-center gap-0.5 px-6 py-1 rounded-lg transition-colors ${
              active ? 'text-[var(--primary)]' : 'text-[#737686]'
            }`}
          >
            <span className="text-xl leading-none">{t.icon}</span>
            <span className={`text-xs font-medium ${active ? 'font-bold' : ''}`}>{t.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
