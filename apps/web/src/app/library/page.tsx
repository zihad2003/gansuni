'use client'

import { useState, useMemo, type ReactNode } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Heart, Library, Play, Trash2, Clock, Music, Download } from 'lucide-react'
import { EXPANDED_TRACKS, FEATURED_PLAYLISTS, formatDuration } from '@gansuni/shared'
import { useAudioPlayer } from '@/store/useAudioPlayer'
import { Sidebar } from '@/components/Sidebar'
import { HeaderNav } from '@/components/HeaderNav'

export default function LibraryPage(): ReactNode {
  const [tab, setTab] = useState<'LIKED' | 'PLAYLISTS' | 'DOWNLOADS'>('LIKED')
  const play = useAudioPlayer((s) => s.play)
  const currentTrackId = useAudioPlayer((s) => s.currentTrack?.id)
  const playbackState = useAudioPlayer((s) => s.playbackState)
  const likedTrackIds = useAudioPlayer((s) => s.likedTrackIds)
  const toggleLikeTrack = useAudioPlayer((s) => s.toggleLikeTrack)

  const isCurrentPlaying = (id: string) => currentTrackId === id && (playbackState === 'playing' || playbackState === 'buffering')

  const likedTracks = useMemo(() => {
    return EXPANDED_TRACKS.filter((t) => likedTrackIds.includes(t.id))
  }, [likedTrackIds])

  const totalDurationMs = useMemo(() => {
    return likedTracks.reduce((acc, t) => acc + t.durationMs, 0)
  }, [likedTracks])

  const onPlayLikedAll = () => {
    if (likedTracks.length === 0) return
    const first = likedTracks[0]!
    play(first as any, likedTracks.map((t) => ({ trackId: t.id, track: t as any })), 0)
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-12">
        <section className="grid lg:grid-cols-[260px_1fr] gap-6 lg:gap-8">
          <Sidebar />

          <div className="min-w-0">
            <HeaderNav />

            <div className="space-y-6">
              {/* HERO BANNER FOR LIKED SONGS */}
              <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-purple-900 via-pink-900 to-rose-900 border border-white/15 shadow-2xl flex flex-col sm:flex-row items-start sm:items-center gap-6">
                <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-2xl bg-gradient-to-tr from-purple-600 to-pink-500 flex items-center justify-center text-white shadow-2xl flex-shrink-0">
                  <Heart size={64} fill="currentColor" />
                </div>
                <div className="flex-1">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-pink-300">Playlist</span>
                  <h1 className="text-3xl sm:text-5xl font-black text-white mt-1">Liked Songs</h1>
                  <p className="text-xs sm:text-sm text-white/80 mt-2 font-medium">
                    {likedTracks.length} saved tracks • Total duration: {formatDuration(totalDurationMs)}
                  </p>
                  <div className="mt-4 flex items-center gap-3">
                    <button
                      onClick={onPlayLikedAll}
                      disabled={likedTracks.length === 0}
                      className="gs-button flex items-center gap-2 font-bold px-6 py-2.5 disabled:opacity-50"
                    >
                      <Play size={18} fill="#000" strokeWidth={0} />
                      Play Liked Songs
                    </button>
                  </div>
                </div>
              </div>

              {/* TAB SELECTOR */}
              <div className="flex items-center gap-2 border-b border-white/10 pb-3">
                <button
                  onClick={() => setTab('LIKED')}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                    tab === 'LIKED' ? 'bg-white text-black' : 'text-white/60 hover:text-white'
                  }`}
                >
                  Liked Songs ({likedTracks.length})
                </button>
                <button
                  onClick={() => setTab('PLAYLISTS')}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                    tab === 'PLAYLISTS' ? 'bg-white text-black' : 'text-white/60 hover:text-white'
                  }`}
                >
                  Playlists ({FEATURED_PLAYLISTS.length})
                </button>
                <button
                  onClick={() => setTab('DOWNLOADS')}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                    tab === 'DOWNLOADS' ? 'bg-white text-black' : 'text-white/60 hover:text-white'
                  }`}
                >
                  Downloaded Tracks
                </button>
              </div>

              {/* TAB CONTENT: LIKED */}
              {tab === 'LIKED' && (
                <div>
                  {likedTracks.length === 0 ? (
                    <div className="p-12 text-center bg-white/5 rounded-2xl border border-white/10">
                      <Heart size={40} className="mx-auto text-white/30 mb-3" />
                      <h3 className="text-lg font-bold text-white">No Liked Songs Yet</h3>
                      <p className="text-xs text-white/60 mt-1 max-w-sm mx-auto">
                        Click the heart icon on any song to save your favorite tracks to your library.
                      </p>
                      <Link href="/browse" className="inline-block mt-4 text-xs font-bold text-[#F59E0B] hover:underline">
                        Browse music catalog →
                      </Link>
                    </div>
                  ) : (
                    <div className="glass-card-strong overflow-hidden rounded-2xl divide-y divide-white/5">
                      {likedTracks.map((t, idx) => {
                        const playing = isCurrentPlaying(t.id)
                        return (
                          <div
                            key={t.id}
                            onClick={() => play(t as any, likedTracks.map((tr) => ({ trackId: tr.id, track: tr as any })), idx)}
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
                                className="p-1.5 rounded-full text-[#F59E0B] hover:bg-white/10 transition-colors"
                                title="Remove from Liked"
                              >
                                <Heart size={16} fill="#F59E0B" color="#F59E0B" />
                              </button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* TAB CONTENT: PLAYLISTS */}
              {tab === 'PLAYLISTS' && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {FEATURED_PLAYLISTS.map((pl) => (
                    <Link
                      key={pl.id}
                      href={`/playlist/${pl.id}`}
                      className="group p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all cursor-pointer"
                    >
                      <div className="relative aspect-square rounded-xl overflow-hidden mb-3 shadow-lg">
                        <Image src={pl.coverArtUrl || ''} alt={pl.name} fill sizes="200px" className="object-cover" />
                      </div>
                      <h3 className="font-bold text-sm text-white truncate">{pl.name}</h3>
                      <p className="text-xs text-white/60 line-clamp-2 mt-1">{pl.description}</p>
                    </Link>
                  ))}
                </div>
              )}

              {/* TAB CONTENT: DOWNLOADS */}
              {tab === 'DOWNLOADS' && (
                <div className="p-12 text-center bg-white/5 rounded-2xl border border-white/10">
                  <Download size={40} className="mx-auto text-amber-400 mb-3" />
                  <h3 className="text-lg font-bold text-white">Offline Ready</h3>
                  <p className="text-xs text-white/60 mt-1 max-w-sm mx-auto">
                    Download tracks on Gaansuni Mobile app to listen offline anywhere without cellular data consumption.
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
