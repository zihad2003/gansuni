'use client'

import { useState, useEffect, type ReactNode } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Play, Heart, Clock, Sparkles, Music2, Radio, Headphones, Download, ChevronRight, UploadCloud } from 'lucide-react'
import { useAudioPlayer } from '@/store/useAudioPlayer'
import { formatDuration } from '@gansuni/shared'
import {
  EXPANDED_TRACKS,
  NEW_RELEASES,
  POPULAR_INTERNET_TRACKS,
  FEATURED_PLAYLISTS,
} from '@gansuni/shared'
import { motion } from 'framer-motion'
import { Sidebar } from '@/components/Sidebar'
import { HeaderNav } from '@/components/HeaderNav'

export default function HomePage(): ReactNode {
  const [userUploadedTracks, setUserUploadedTracks] = useState<any[]>([])
  const [liveTracks, setLiveTracks] = useState<any[]>([])

  const play = useAudioPlayer((s) => s.play)
  const currentTrackId = useAudioPlayer((s) => s.currentTrack?.id)
  const playbackState = useAudioPlayer((s) => s.playbackState)
  const likedTrackIds = useAudioPlayer((s) => s.likedTrackIds)
  const toggleLikeTrack = useAudioPlayer((s) => s.toggleLikeTrack)

  useEffect(() => {
    fetch('/api/tracks')
      .then((res) => res.json())
      .then((data) => {
        if (data.userTracks) setUserUploadedTracks(data.userTracks)
      })
      .catch(() => {})

    fetch('/api/live-search?q=Coke%20Studio%20Bangla&limit=20')
      .then((res) => res.json())
      .then((data) => {
        if (data.tracks && Array.isArray(data.tracks) && data.tracks.length > 0) {
          setLiveTracks(data.tracks)
        }
      })
      .catch(() => {})
  }, [])

  const allAvailableTracks = [...userUploadedTracks, ...liveTracks]

  const onPlayTrack = (track: any, trackList: any[]) => {
    const idx = trackList.findIndex((t) => t.id === track.id)
    const resolvedIndex = idx >= 0 ? idx : 0
    play(track as any, trackList.map((t) => ({ trackId: t.id, track: t as any })), resolvedIndex)
  }

  const onPlayAll = () => {
    const first = allAvailableTracks[0]!
    play(first as any, allAvailableTracks.map((t) => ({ trackId: t.id, track: t as any })), 0)
  }

  const isCurrentPlaying = (trackId: string) =>
    currentTrackId === trackId && (playbackState === 'playing' || playbackState === 'buffering')

  const isCurrentTrack = (trackId: string) => currentTrackId === trackId

  return (
    <div className="min-h-screen">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-12">
        <section className="grid lg:grid-cols-[260px_1fr] gap-6 lg:gap-8">
          <Sidebar />

          <div className="min-w-0">
            <HeaderNav />

            <div className="space-y-8 lg:space-y-10">
              {/* HERO BANNER */}
              <motion.section
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="relative overflow-hidden rounded-3xl p-6 sm:p-8 md:p-10"
                style={{
                  background: 'linear-gradient(135deg, rgba(245,158,11,0.25) 0%, rgba(249,115,22,0.15) 50%, rgba(139,92,246,0.2) 100%)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  backdropFilter: 'blur(16px)',
                }}
              >
                <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(245,158,11,0.35), transparent 60%)' }} />
                <div className="absolute -bottom-24 -left-16 w-80 h-80 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.3), transparent 60%)' }} />

                <div className="relative">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-white/15 border border-white/20 text-white">
                    <Sparkles size={12} style={{ color: '#F59E0B' }} />
                    NEW • 25+ High Quality Bengali Songs Added
                  </span>

                  <h1 className="mt-4 text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-[1.1] text-balance text-white">
                    গানশুনি (Gaansuni) — Your gateway to
                    <br />
                    <span style={{
                      background: 'linear-gradient(90deg, #F59E0B 0%, #F97316 50%, #A78BFA 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}>
                      listen to authentic music
                    </span>
                  </h1>

                  <p className="mt-4 max-w-2xl text-sm sm:text-base leading-relaxed text-white/80">
                    Stream new releases, saved favorites, and internet viral hits like <i>Jhumka</i>, <i>Deora</i>, <i>Shada Shada Kala Kala</i>, <i>Boshonto Eshe Geche</i>, and Tagore timeless classics.
                  </p>

                  <div className="mt-7 flex flex-wrap items-center gap-3">
                    <button
                      onClick={onPlayAll}
                      className="gs-button !px-7 !py-3 shadow-lg flex items-center gap-2 font-bold"
                    >
                      <Play size={18} fill="#000" strokeWidth={0} />
                      Play All Songs
                    </button>
                    <Link href="/browse" className="glass-button !px-6 !py-3 flex items-center gap-1">
                      Browse Genres
                      <ChevronRight size={16} />
                    </Link>
                  </div>

                  <div className="mt-8 grid grid-cols-3 max-w-lg gap-4">
                    <QuickStat label="Tracks" value="25+ Hits" />
                    <QuickStat label="Artists" value="7 Icons" />
                    <QuickStat label="Quality" value="Lossless" />
                  </div>
                </div>
              </motion.section>

              {/* USER UPLOADED SONGS SECTION */}
              {userUploadedTracks.length > 0 && (
                <section>
                  <SectionHeader
                    title="আপনার আপলোড করা গান (Your Uploaded Songs)"
                    action={<Link href="/upload" className="text-xs sm:text-sm font-semibold text-amber-400 hover:underline">Manage uploads ({userUploadedTracks.length})</Link>}
                  />
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 sm:gap-4">
                    {userUploadedTracks.map((t) => {
                      const playing = isCurrentPlaying(t.id)
                      const liked = likedTrackIds.includes(t.id)
                      return (
                        <div
                          key={t.id}
                          onClick={() => onPlayTrack(t, userUploadedTracks)}
                          className="group relative p-3 rounded-2xl bg-white/5 border border-amber-500/30 hover:bg-white/10 transition-all cursor-pointer flex flex-col justify-between"
                        >
                          <div className="relative aspect-square rounded-xl overflow-hidden mb-2 shadow-lg">
                            <Image src={t.album?.coverArtUrl || ''} alt={t.title} fill sizes="160px" className="object-cover transition-transform group-hover:scale-105" />
                            <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity ${playing ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                              <div className="w-10 h-10 rounded-full bg-[#F59E0B] text-black flex items-center justify-center shadow-lg">
                                {playing ? <EqualizerAnim /> : <Play size={18} fill="#000" strokeWidth={0} className="ml-0.5" />}
                              </div>
                            </div>
                          </div>
                          <div>
                            <div className="text-sm font-bold truncate text-white">{t.title}</div>
                            <div className="text-xs text-amber-400 truncate mt-0.5">{t.artist?.name}</div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </section>
              )}

              {/* NEW RELEASES SECTION */}
              <section>
                <SectionHeader title="নতুন গান (New Releases)" action={<Link href="/browse" className="text-xs sm:text-sm font-semibold text-amber-400 hover:underline">Explore all</Link>} />
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 sm:gap-4">
                  {NEW_RELEASES.map((t) => {
                    const playing = isCurrentPlaying(t.id)
                    const liked = likedTrackIds.includes(t.id)
                    return (
                      <div
                        key={t.id}
                        onClick={() => onPlayTrack(t, NEW_RELEASES)}
                        className="group relative p-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all cursor-pointer flex flex-col justify-between"
                      >
                        <div className="relative aspect-square rounded-xl overflow-hidden mb-2 shadow-lg">
                          <Image src={t.album?.coverArtUrl || ''} alt={t.title} fill sizes="160px" className="object-cover transition-transform group-hover:scale-105" />
                          <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity ${playing ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                            <div className="w-10 h-10 rounded-full bg-[#F59E0B] text-black flex items-center justify-center shadow-lg">
                              {playing ? <EqualizerAnim /> : <Play size={18} fill="#000" strokeWidth={0} className="ml-0.5" />}
                            </div>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              toggleLikeTrack(t.id)
                            }}
                            className="absolute top-2 right-2 p-1.5 rounded-full bg-black/50 text-white/80 hover:text-[#F59E0B] transition-colors"
                          >
                            <Heart size={14} fill={liked ? '#F59E0B' : 'none'} color={liked ? '#F59E0B' : 'currentColor'} />
                          </button>
                        </div>
                        <div>
                          <div className="text-sm font-bold truncate text-white">{t.title}</div>
                          <div className="text-xs text-white/60 truncate mt-0.5">{t.artist?.name}</div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </section>

              {/* MOST POPULAR ON INTERNET */}
              <section>
                <SectionHeader title="ইন্টারনেটে সবচেয়ে জনপ্রিয় (Most Popular Internet Hits)" />
                <div className="glass-card-strong overflow-hidden rounded-2xl">
                  <div className="divide-y divide-white/5">
                    {POPULAR_INTERNET_TRACKS.map((t, idx) => {
                      const playing = isCurrentPlaying(t.id)
                      const active = isCurrentTrack(t.id)
                      const liked = likedTrackIds.includes(t.id)
                      return (
                        <div
                          key={t.id}
                          onClick={() => onPlayTrack(t, POPULAR_INTERNET_TRACKS)}
                          className="group grid grid-cols-[40px_1fr_minmax(80px,auto)] sm:grid-cols-[32px_1fr_1fr_80px_48px] gap-3 sm:gap-4 px-4 sm:px-5 py-3 items-center hover:bg-white/5 cursor-pointer transition-colors"
                        >
                          <div className="flex items-center justify-center text-sm font-semibold" style={{ color: active ? '#F59E0B' : 'var(--gs-text-muted)' }}>
                            {playing ? <EqualizerAnim /> : (
                              <>
                                <span className="group-hover:hidden">{idx + 1}</span>
                                <Play size={14} fill={active ? '#F59E0B' : 'currentColor'} strokeWidth={0} className="hidden group-hover:block" />
                              </>
                            )}
                          </div>
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="relative w-11 h-11 rounded-lg overflow-hidden flex-shrink-0">
                              <Image src={t.album?.coverArtUrl || ''} alt={t.title} fill sizes="44px" className="object-cover" />
                            </div>
                            <div className="min-w-0">
                              <div className="text-sm sm:text-[15px] font-semibold truncate" style={{ color: active ? '#F59E0B' : 'var(--gs-text-primary)' }}>
                                {t.title}
                              </div>
                              <div className="text-xs truncate text-white/60">
                                {t.artist?.name}
                              </div>
                            </div>
                          </div>
                          <div className="hidden sm:block text-xs truncate text-white/60">
                            {t.album?.title}
                          </div>
                          <div className="flex items-center justify-end text-xs text-white/50 font-medium">
                            {formatDuration(t.durationMs)}
                          </div>
                          <div className="hidden sm:flex items-center justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                toggleLikeTrack(t.id)
                              }}
                              className="p-2 rounded-full hover:bg-white/10 text-white/60 hover:text-[#F59E0B] transition-colors"
                            >
                              <Heart size={16} fill={liked ? '#F59E0B' : 'none'} color={liked ? '#F59E0B' : 'currentColor'} />
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </section>

              {/* FEATURED PLAYLISTS */}
              <section>
                <SectionHeader title="Featured Playlists" />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {FEATURED_PLAYLISTS.map((pl) => (
                    <Link
                      key={pl.id}
                      href={`/playlist/${pl.id}`}
                      className="group relative p-4 rounded-2xl bg-white/5 border border-white/10 hover:scale-[1.02] transition-all cursor-pointer"
                    >
                      <div className="relative aspect-square rounded-xl overflow-hidden shadow-xl mb-3">
                        <Image src={pl.coverArtUrl || ''} alt={pl.name} fill sizes="250px" className="object-cover group-hover:scale-105 transition-transform duration-500" />
                        <div className="absolute bottom-3 right-3 w-12 h-12 rounded-full bg-[#F59E0B] text-black flex items-center justify-center shadow-xl opacity-0 group-hover:opacity-100 transition-opacity">
                          <Play size={20} fill="#000" strokeWidth={0} className="ml-0.5" />
                        </div>
                      </div>
                      <h3 className="font-bold truncate text-base text-white">{pl.name}</h3>
                      <p className="mt-1 text-xs text-white/60 line-clamp-2">{pl.description}</p>
                    </Link>
                  ))}
                </div>
              </section>

              {/* FOOTER */}
              <footer className="pt-8 pb-4 border-t border-white/10">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-white/50">
                  <div className="flex items-center gap-2 font-semibold text-white">
                    <Music2 size={16} style={{ color: '#F59E0B' }} />
                    গানশুনি · Gaansuni Bengali Audio Ecosystem
                  </div>
                  <div>© {new Date().getFullYear()} Gaansuni. Designed for Bengali Music Lovers globally.</div>
                </div>
              </footer>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

function SectionHeader({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <div className="flex items-end justify-between mb-4">
      <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
        {title}
      </h2>
      {action}
    </div>
  )
}

function QuickStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">{value}</div>
      <div className="text-[11px] font-medium uppercase tracking-wider text-white/50 mt-0.5">{label}</div>
    </div>
  )
}

function EqualizerAnim() {
  return (
    <div className="flex items-end gap-[3px] h-4 text-[#F59E0B]">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-[3px] rounded-sm bg-current animate-pulse"
          style={{
            height: '100%',
            animationDelay: `${i * 0.15}s`,
          }}
        />
      ))}
    </div>
  )
}
