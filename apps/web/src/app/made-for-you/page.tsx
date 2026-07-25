'use client'

import type { ReactNode } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Sparkles, Play, Heart, Flame, Radio } from 'lucide-react'
import { EXPANDED_TRACKS, FEATURED_PLAYLISTS } from '@gansuni/shared'
import { useAudioPlayer } from '@/store/useAudioPlayer'
import { Sidebar } from '@/components/Sidebar'
import { HeaderNav } from '@/components/HeaderNav'

export default function MadeForYouPage(): ReactNode {
  const play = useAudioPlayer((s) => s.play)
  const currentTrackId = useAudioPlayer((s) => s.currentTrack?.id)
  const playbackState = useAudioPlayer((s) => s.playbackState)

  const isCurrentPlaying = (id: string) => currentTrackId === id && (playbackState === 'playing' || playbackState === 'buffering')

  const onPlayAll = () => {
    const first = EXPANDED_TRACKS[0]!
    play(first as any, EXPANDED_TRACKS.map((t) => ({ trackId: t.id, track: t as any })), 0)
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
              <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-purple-900/60 via-indigo-900/50 to-amber-900/60 border border-white/10 backdrop-blur-xl">
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-amber-400 border border-white/15 text-xs font-bold w-fit mb-3">
                  <Sparkles size={14} />
                  <span>AI Personalized Recommendations</span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-white">Made For You</h1>
                <p className="mt-2 text-sm text-white/70 max-w-xl">
                  Daily mixes, discovery playlists, and mood recommendations curated specifically based on your unique taste in Bengali music.
                </p>
                <div className="mt-5">
                  <button
                    onClick={onPlayAll}
                    className="gs-button flex items-center gap-2 font-bold px-6 py-2.5"
                  >
                    <Play size={18} fill="#000" strokeWidth={0} />
                    Play Your Mix
                  </button>
                </div>
              </div>

              {/* DAILY MIXES */}
              <section>
                <h2 className="text-xl font-extrabold text-white mb-4 flex items-center gap-2">
                  <Flame size={20} className="text-orange-400" />
                  <span>Daily Mixes</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  <MixCard
                    title="Daily Mix 1"
                    desc="Rabindranath Tagore, Sahana Bajpaie & Soft Acoustic Bengali Songs"
                    coverUrl="https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80"
                    color="from-amber-600/40 to-orange-900/40"
                    onPlay={onPlayAll}
                  />
                  <MixCard
                    title="Daily Mix 2"
                    desc="Pritom Hasan, Coke Studio Bangla, Deora & Viral Internet Fusion"
                    coverUrl="https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80"
                    color="from-purple-600/40 to-pink-900/40"
                    onPlay={onPlayAll}
                  />
                  <MixCard
                    title="Daily Mix 3"
                    desc="Shironamhin, Arnob, Bangla Band Hits & Rock Classics"
                    coverUrl="https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=600&auto=format&fit=crop&q=80"
                    color="from-teal-600/40 to-blue-900/40"
                    onPlay={onPlayAll}
                  />
                </div>
              </section>

              {/* FEATURED PLAYLISTS */}
              <section>
                <h2 className="text-xl font-extrabold text-white mb-4 flex items-center gap-2">
                  <Radio size={20} className="text-amber-400" />
                  <span>Curated Bengali Playlists</span>
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {FEATURED_PLAYLISTS.map((pl) => (
                    <Link
                      key={pl.id}
                      href={`/playlist/${pl.id}`}
                      className="group p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all cursor-pointer"
                    >
                      <div className="relative aspect-square rounded-xl overflow-hidden mb-3 shadow-lg">
                        <Image src={pl.coverArtUrl || ''} alt={pl.name} fill sizes="200px" className="object-cover group-hover:scale-105 transition-transform" />
                        <div className="absolute bottom-2 right-2 w-10 h-10 rounded-full bg-[#F59E0B] text-black flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                          <Play size={16} fill="#000" strokeWidth={0} />
                        </div>
                      </div>
                      <h3 className="font-bold text-sm text-white truncate">{pl.name}</h3>
                      <p className="text-xs text-white/60 line-clamp-2 mt-1">{pl.description}</p>
                    </Link>
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

function MixCard({ title, desc, coverUrl, color, onPlay }: { title: string; desc: string; coverUrl: string; color: string; onPlay: () => void }) {
  return (
    <div className={`group relative p-5 rounded-2xl bg-gradient-to-br ${color} border border-white/10 backdrop-blur-xl transition-all hover:scale-[1.02] flex flex-col justify-between`}>
      <div className="flex items-center justify-between mb-4">
        <div className="relative w-20 h-20 rounded-xl overflow-hidden shadow-xl">
          <Image src={coverUrl} alt={title} fill sizes="80px" className="object-cover" />
        </div>
        <button
          onClick={onPlay}
          className="w-12 h-12 rounded-full bg-[#F59E0B] text-black flex items-center justify-center shadow-xl opacity-90 hover:opacity-100 transition-opacity"
        >
          <Play size={20} fill="#000" strokeWidth={0} className="ml-0.5" />
        </button>
      </div>
      <div>
        <h3 className="text-lg font-extrabold text-white">{title}</h3>
        <p className="text-xs text-white/70 mt-1 leading-relaxed">{desc}</p>
      </div>
    </div>
  )
}
