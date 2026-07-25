'use client'

import type { ReactNode } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Compass, Sparkles, Play, Heart, Flame } from 'lucide-react'
import { GENRES_DATA, NEW_RELEASES, POPULAR_INTERNET_TRACKS, EXPANDED_ARTISTS } from '@gansuni/shared'
import { useAudioPlayer } from '@/store/useAudioPlayer'
import { Sidebar } from '@/components/Sidebar'
import { HeaderNav } from '@/components/HeaderNav'

export default function BrowsePage(): ReactNode {
  const play = useAudioPlayer((s) => s.play)

  const onPlayAllNew = () => {
    const first = NEW_RELEASES[0]!
    play(first as any, NEW_RELEASES.map((t) => ({ trackId: t.id, track: t as any })), 0)
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-12">
        <section className="grid lg:grid-cols-[260px_1fr] gap-6 lg:gap-8">
          <Sidebar />

          <div className="min-w-0">
            <HeaderNav />

            <div className="space-y-8">
              {/* HERO BANNER */}
              <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-amber-900/50 via-orange-900/40 to-blue-900/50 border border-white/10 backdrop-blur-xl">
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-amber-400 border border-white/15 text-xs font-bold w-fit mb-3">
                  <Compass size={14} />
                  <span>Browse All Categories</span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-white">Explore Music</h1>
                <p className="mt-2 text-sm text-white/70 max-w-xl">
                  Discover Rabindra Sangeet, Nazrul Geeti, Bangla Folk, Baul Fusion, Hiphop BD, and viral internet hits in high fidelity audio.
                </p>
              </div>

              {/* GENRES & MOODS */}
              <section>
                <h2 className="text-xl font-extrabold text-white mb-4">Genres & Moods</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {GENRES_DATA.map((g) => (
                    <div
                      key={g.id}
                      className="group relative p-5 rounded-2xl overflow-hidden cursor-pointer shadow-lg border border-white/10 transition-all hover:scale-[1.03]"
                      style={{
                        background: `linear-gradient(135deg, ${g.color || '#F59E0B'}88, rgba(0,0,0,0.8))`,
                      }}
                    >
                      <h3 className="text-lg font-bold text-white relative z-10">{g.name}</h3>
                      <p className="text-xs text-white/70 relative z-10 mt-1 line-clamp-2">{g.description}</p>
                      <div className="absolute -bottom-4 -right-4 w-24 h-24 rounded-full bg-white/10 blur-xl group-hover:scale-150 transition-transform" />
                    </div>
                  ))}
                </div>
              </section>

              {/* TOP ARTISTS */}
              <section>
                <h2 className="text-xl font-extrabold text-white mb-4">Top Artists</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
                  {EXPANDED_ARTISTS.map((a) => (
                    <Link
                      key={a.id}
                      href={`/artist/${a.id}`}
                      className="group p-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-center flex flex-col items-center cursor-pointer"
                    >
                      <div className="relative w-20 h-20 rounded-full overflow-hidden mb-2 shadow-lg group-hover:scale-105 transition-transform">
                        <Image src={a.avatarUrl || ''} alt={a.name} fill sizes="80px" className="object-cover" />
                      </div>
                      <div className="font-bold text-xs text-white truncate w-full">{a.name}</div>
                      <div className="text-[10px] text-white/50 truncate w-full mt-0.5">{a.monthlyListeners.toLocaleString()} listeners</div>
                    </Link>
                  ))}
                </div>
              </section>

              {/* NEW RELEASES GRID */}
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
                    <Sparkles size={20} className="text-[#F59E0B]" />
                    <span>New Releases</span>
                  </h2>
                  <button onClick={onPlayAllNew} className="text-xs font-semibold text-[#F59E0B] hover:underline">
                    Play all new
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
                  {NEW_RELEASES.map((t) => (
                    <div
                      key={t.id}
                      onClick={() => play(t as any, NEW_RELEASES.map((tr) => ({ trackId: tr.id, track: tr as any })), NEW_RELEASES.findIndex((tr) => tr.id === t.id))}
                      className="group relative p-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all cursor-pointer"
                    >
                      <div className="relative aspect-square rounded-xl overflow-hidden mb-2 shadow-md">
                        <Image src={t.album?.coverArtUrl || ''} alt={t.title} fill sizes="160px" className="object-cover group-hover:scale-105 transition-transform" />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="w-9 h-9 rounded-full bg-[#F59E0B] text-black flex items-center justify-center">
                            <Play size={16} fill="#000" strokeWidth={0} className="ml-0.5" />
                          </div>
                        </div>
                      </div>
                      <div className="text-xs font-bold truncate text-white">{t.title}</div>
                      <div className="text-[11px] text-white/60 truncate mt-0.5">{t.artist?.name}</div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
