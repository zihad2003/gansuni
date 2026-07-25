'use client'

import { type ReactNode } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Search, Compass, Sparkles, Library } from 'lucide-react'

const navItems = [
  { label: 'Home', href: '/', icon: Home },
  { label: 'Search', href: '/search', icon: Search },
  { label: 'Browse', href: '/browse', icon: Compass },
  { label: 'Made For You', href: '/made-for-you', icon: Sparkles },
  { label: 'Library', href: '/library', icon: Library },
]

export function MobileBottomNav(): ReactNode {
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  return (
    <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-neutral-950/90 backdrop-blur-2xl border-t border-white/10 px-2 py-1.5 flex items-center justify-around shadow-2xl">
      {navItems.map((item) => {
        const Icon = item.icon
        const active = isActive(item.href)
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition-all ${
              active
                ? 'text-[#F59E0B] font-bold scale-105'
                : 'text-white/60 hover:text-white font-medium'
            }`}
          >
            <Icon size={20} strokeWidth={active ? 2.5 : 2} />
            <span className="text-[10px] tracking-tight whitespace-nowrap">{item.label}</span>
          </Link>
        )
      })}
    </div>
  )
}
