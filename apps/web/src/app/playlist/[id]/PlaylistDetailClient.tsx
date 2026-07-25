'use client'

import type { ReactNode } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { Play, Heart, Clock, Music2, Shuffle } from 'lucide-react'
import { FEATURED_PLAYLISTS, EXPANDED_TRACKS, formatDuration } from '@gansuni/shared'
import { useAudioPlayer } from '@/store/useAudioPlayer'
import { Sidebar } from '@/components/Sidebar'
import { HeaderNav } from '@/components/HeaderNav'

export default function PlaylistDetailClient(): ReactNode {
  const params = useParams()
  const playlistId = params?.id as string

  const playlist = FEATURED_PLAYLISTS.find((p) => p.id === playlistId) || {
    id: playlistId || 'default',
    name: 'Playlist',
    description: 'Custom music playlist',
    coverArtUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
  }

  const play = useAudioPlayer((s) => s.play)
  const currentTrackId = useAudioPlayer((s) => s.currentTrack?.id)
  const playbackState = useAudioPlayer((s) => s.playbackState)
  const likedTrackIds = useAudioPlayer((s) => s.likedTrackIds)
  const toggleLikeTrack = useAudioPlayer((s) => s.toggleLikeTrack)

  const isCurrentPlaying = (id: string) => currentTrackId === id && (playbackState === 'playing' || playbackState === 'buffering')

  const tracks = EXPANDED_TRACKS

  const onPlayAll = () => {
    const first = tracks[0]!
    play(first as any, tracks.map((t) => ({ trackId: t.id, track: t as any })), 0)
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-12">
        <section className="grid lg:grid-cols-[260px_1fr] gap-6 lg:gap-8">
          <Sidebar />

          <div className="min-w-0">
            <HeaderNav />

            <div className="space-y-6">
              {/* PLAYLIST HEADER */}
              <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-emerald-900/60 via-neutral-900 to-indigo-900/60 border border-white/15 flex flex-col sm:flex-row items-start sm:items-center gap-6 shadow-2xl">
                <div className="relative w-36 h-36 sm:w-44 sm:h-44 rounded-2xl overflow-hidden shadow-2xl flex-shrink-0">
                  <Image src={playlist.coverArtUrl || ''} alt={playlist.name} fill sizes="200px" className="object-cover" priority />
                </div>
                <div className="flex-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Playlist</span>
                  <h1 className="text-2xl sm:text-4xl font-extrabold text-white mt-1">{playlist.name}</h1>
                  <p className="text-xs sm:text-sm text-white/70 mt-2 leading-relaxed">{playlist.description}</p>
                  <div className="mt-4 flex items-center gap-3">
                    <button onClick={onPlayAll} className="gs-button flex items-center gap-2 font-bold px-6 py-2.5">
                      <Play size={18} fill="#000" strokeWidth={0} />
                      Play All ({tracks.length})
                    </button>
                  </div>
                </div>
              </div>

              {/* TRACKLIST TABLE */}
              <div className="glass-card-strong overflow-hidden rounded-2xl divide-y divide-white/5">
                {tracks.map((t, idx) => {
                  const playing = isCurrentPlaying(t.id)
                  const liked = likedTrackIds.includes(t.id)
                  return (
                    <div
                      key={t.id}
                      onClick={() => play(t as any, tracks.map((tr) => ({ trackId: tr.id, track: tr as any })), idx)}
                      className="group grid grid-cols-[36px_1fr_minmax(80px,auto)] sm:grid-cols-[32px_1fr_1fr_80px_48px] gap-3 px-4 py-3 items-center hover:bg-white/5 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center justify-center text-sm font-semibold text-white/50">
                        {playing ? (
                          <span className="text-[#F59E0B] font-bold">▶</span>
                        ) : (
                          <>
                            <span className="group-hover:hidden">{idx + 1}</span>
                            <Play size={14} fill="currentColor" strokeWidth={0} className="hidden group-hover:block text-white" />
                          </>
                        )}
                      </div>
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="relative w-10 h-10 rounded-md overflow-hidden flex-shrink-0">
                          <Image src={t.album?.coverArtUrl || ''} alt={t.title} fill sizes="40px" className="object-cover" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-white truncate">{t.title}</div>
                          <div className="text-xs text-white/60 truncate">{t.artist?.name}</div>
                        </div>
                      </div>
                      <div className="hidden sm:block text-xs text-white/60 truncate">{t.album?.title}</div>
                      <div className="text-xs text-white/50 text-right">{formatDuration(t.durationMs)}</div>
                      <div className="hidden sm:flex items-center justify-end">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleLikeTrack(t.id)
                          }}
                          className="p-1.5 rounded-full hover:bg-white/10 text-white/60 hover:text-[#F59E0B] transition-colors"
                        >
                          <Heart size={16} fill={liked ? '#F59E0B' : 'none'} color={liked ? '#F59E0B' : 'currentColor'} />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
