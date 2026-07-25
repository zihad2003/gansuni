'use client'

import { useState, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight, Search, Sparkles, Download, UploadCloud } from 'lucide-react'
import { AppDownloadModal } from './AppDownloadModal'

interface HeaderNavProps {
  showSearchInput?: boolean
  initialSearchQuery?: string
  onSearchChange?: (q: string) => void
}

export function HeaderNav({
  showSearchInput = false,
  initialSearchQuery = '',
  onSearchChange,
}: HeaderNavProps): ReactNode {
  const router = useRouter()
  const [query, setQuery] = useState(initialSearchQuery)
  const [isDownloadOpen, setIsDownloadOpen] = useState(false)

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setQuery(val)
    if (onSearchChange) onSearchChange(val)
  }

  return (
    <>
      <header className="sticky top-0 z-30 flex items-center justify-between gap-4 py-3.5 px-3 sm:px-5 backdrop-blur-xl bg-black/40 border-b border-white/10 mb-6 rounded-2xl">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => router.back()}
              className="w-9 h-9 rounded-full flex items-center justify-center bg-black/40 hover:bg-black/60 border border-white/10 text-white/80 hover:text-white transition-all"
              aria-label="Go back"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={() => router.forward()}
              className="w-9 h-9 rounded-full flex items-center justify-center bg-black/40 hover:bg-black/60 border border-white/10 text-white/80 hover:text-white transition-all hidden sm:flex"
              aria-label="Go forward"
            >
              <ChevronRight size={20} />
            </button>
          </div>

          {showSearchInput ? (
            <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
              <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/50" />
              <input
                type="text"
                value={query}
                onChange={handleInputChange}
                placeholder="গান, শিল্পী বা অ্যালবাম খুঁজুন... (Search songs)"
                className="w-full pl-10 pr-4 py-2 rounded-full bg-white/10 border border-white/15 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#F59E0B] text-sm transition-all"
              />
            </form>
          ) : (
            <div
              onClick={() => router.push('/search')}
              className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/15 text-white/60 hover:text-white cursor-pointer transition-all text-xs font-medium max-w-xs"
            >
              <Search size={15} />
              <span>Search tracks, artists, albums...</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2.5">
          {/* DOWNLOAD APP BUTTON */}
          <button
            onClick={() => setIsDownloadOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-extrabold bg-gradient-to-r from-amber-500 to-orange-500 text-black hover:opacity-90 active:scale-95 transition-all shadow-md"
          >
            <Download size={14} className="stroke-[2.5]" />
            <span>App Download</span>
          </button>


        </div>
      </header>

      <AppDownloadModal isOpen={isDownloadOpen} onClose={() => setIsDownloadOpen(false)} />
    </>
  )
}
