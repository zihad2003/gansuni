'use client'

import type { ReactNode } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { Play, Heart, CheckCircle2, UserCheck } from 'lucide-react'
import { EXPANDED_ARTISTS, EXPANDED_TRACKS, formatDuration } from '@gansuni/shared'
import { useAudioPlayer } from '@/store/useAudioPlayer'
import { Sidebar } from '@/components/Sidebar'
import { HeaderNav } from '@/components/HeaderNav'

export default function ArtistDetailPage(): ReactNode {
  const params = useParams()
  const artistId = params?.id as string

  const artist = EXPANDED_ARTISTS.find((a) => a.id === artistId) || EXPANDED_ARTISTS[0]!

  const play = useAudioPlayer((s) => s.play)
  const currentTrackId = useAudioPlayer((s) => s.currentTrack?.id)
  const playbackState = useAudioPlayer((s) => s.playbackState)
  const likedTrackIds = useAudioPlayer((s) => s.likedTrackIds)
  const toggleLikeTrack = useAudioPlayer((s) => s.toggleLikeTrack)

  const isCurrentPlaying = (id: string) => currentTrackId === id && (playbackState === 'playing' || playbackState === 'buffering')

  const artistTracks = EXPANDED_TRACKS.filter((t) => t.artistId === artist.id)
  const tracksToPlay = artistTracks.length > 0 ? artistTracks : EXPANDED_TRACKS.slice(0, 5)

  const onPlayAll = () => {
    const first = tracksToPlay[0]!
    play(first as any, tracksToPlay.map((t) => ({ trackId: t.id, track: t as any })), 0)
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-12">
        <section className="grid lg:grid-cols-[260px_1fr] gap-6 lg:gap-8">
          <Sidebar />

          <div className="min-w-0">
            <HeaderNav />

            <div className="space-y-6">
              {/* ARTIST HERO BANNER */}
              <div className="relative overflow-hidden rounded-3xl p-6 sm:p-10 bg-gradient-to-r from-teal-900/80 via-neutral-900 to-indigo-900/80 border border-white/15 shadow-2xl flex flex-col sm:flex-row items-center gap-6">
                <div className="relative w-36 h-36 sm:w-44 sm:h-44 rounded-full overflow-hidden shadow-2xl flex-shrink-0 border-4 border-white/10">
                  <Image src={artist.avatarUrl || ''} alt={artist.name} fill sizes="200px" className="object-cover" priority />
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs font-extrabold uppercase tracking-wider text-emerald-400">
                    <CheckCircle2 size={16} />
                    <span>Verified Artist</span>
                  </div>
                  <h1 className="text-3xl sm:text-5xl font-black text-white mt-1">{artist.name}</h1>
                  <p className="text-xs sm:text-sm text-white/70 mt-2 font-medium">
                    {artist.monthlyListeners.toLocaleString()} monthly listeners
                  </p>
                  <p className="text-xs text-white/60 mt-2 max-w-xl leading-relaxed">{artist.bio}</p>

                  <div className="mt-5 flex items-center justify-center sm:justify-start gap-3">
                    <button onClick={onPlayAll} className="gs-button flex items-center gap-2 font-bold px-6 py-2.5">
                      <Play size={18} fill="#000" strokeWidth={0} />
                      Play Top Tracks
                    </button>
                  </div>
                </div>
              </div>

              {/* POPULAR TRACKS */}
              <section>
                <h2 className="text-xl font-extrabold text-white mb-4">Popular Songs</h2>
                <div className="glass-card-strong overflow-hidden rounded-2xl divide-y divide-white/5">
                  {tracksToPlay.map((t, idx) => {
                    const playing = isCurrentPlaying(t.id)
                    const liked = likedTrackIds.includes(t.id)
                    return (
                      <div
                        key={t.id}
                        onClick={() => play(t as any, tracksToPlay.map((tr) => ({ trackId: tr.id, track: tr as any })), idx)}
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
                            <div className="text-xs text-white/60 truncate">{t.playCount.toLocaleString()} plays</div>
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
              </section>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
