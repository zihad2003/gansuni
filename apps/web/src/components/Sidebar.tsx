'use client'

import type { ReactNode } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { Home, Search, Sparkles, Compass, Library, Heart, Music2, Plus, UploadCloud } from 'lucide-react'
import { FEATURED_PLAYLISTS } from '@gansuni/shared'
import { useAudioPlayer } from '@/store/useAudioPlayer'

export function Sidebar(): ReactNode {
  const pathname = usePathname()
  const likedTrackIds = useAudioPlayer((s) => s.likedTrackIds)

  const isNavActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  return (
    <aside className="hidden lg:flex flex-col gap-3 h-fit sticky top-6">
      <div className="glass-card p-4 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-gradient-to-tr from-[#F59E0B] to-[#F97316] text-black shadow-lg">
          <Music2 size={20} strokeWidth={2.5} />
        </div>
        <div>
          <div className="font-extrabold text-base tracking-tight text-white">গানশুনি</div>
          <div className="text-[10px] text-white/50 font-semibold tracking-wider uppercase">Gaansuni Web</div>
        </div>
      </div>

      <nav className="glass-card p-2 space-y-1">
        <SideNavLink icon={Home} label="Home" href="/" active={isNavActive('/')} />
        <SideNavLink icon={Search} label="Search" href="/search" active={isNavActive('/search')} />
        <SideNavLink icon={Compass} label="Browse All" href="/browse" active={isNavActive('/browse')} />
        <SideNavLink icon={Sparkles} label="Made For You" href="/made-for-you" active={isNavActive('/made-for-you')} />
        <SideNavLink icon={UploadCloud} label="Upload Song" href="/upload" active={isNavActive('/upload')} />
      </nav>

      <div className="glass-card p-4">
        <div className="flex items-center justify-between mb-3">
          <Link href="/library" className="flex items-center gap-2 text-sm font-semibold hover:text-white transition-colors" style={{ color: 'var(--gs-text-secondary)' }}>
            <Library size={18} />
            <span>Your Library</span>
          </Link>
          <button className="p-1.5 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors" aria-label="Add playlist">
            <Plus size={16} />
          </button>
        </div>

        <Link
          href="/library"
          className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/10 transition-all group border border-white/5 bg-gradient-to-r from-purple-900/30 to-pink-900/30 mb-3"
        >
          <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-purple-600 to-pink-500 flex items-center justify-center text-white shadow-md">
            <Heart size={18} fill="currentColor" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-white truncate">Liked Songs</div>
            <div className="text-[11px] text-white/60 truncate">
              {likedTrackIds.length} songs saved
            </div>
          </div>
        </Link>

        <div className="space-y-1">
          {FEATURED_PLAYLISTS.map((p) => (
            <Link
              key={p.id}
              href={`/playlist/${p.id}`}
              className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-white/10 transition-all group text-left"
            >
              <div className="relative w-10 h-10 rounded-md overflow-hidden flex-shrink-0">
                <Image src={p.coverArtUrl || ''} alt={p.name} fill sizes="40px" className="object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate" style={{ color: 'var(--gs-text-primary)' }}>{p.name}</div>
                <div className="text-[11px] truncate" style={{ color: 'var(--gs-text-muted)' }}>
                  Playlist
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </aside>
  )
}

function SideNavLink({ icon: Icon, label, href, active }: { icon: any; label: string; href: string; active?: boolean }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all"
      style={{
        background: active ? 'rgba(255,255,255,0.12)' : 'transparent',
        color: active ? '#F59E0B' : 'var(--gs-text-secondary)',
      }}
    >
      <Icon size={20} />
      <span>{label}</span>
    </Link>
  )
}
