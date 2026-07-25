'use client'

import { useState, useEffect, useMemo, type ReactNode } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Search, Play, Heart, Music, Mic2, Disc, Clock, X, Loader2, Sparkles } from 'lucide-react'
import { EXPANDED_TRACKS, EXPANDED_ARTISTS, EXPANDED_ALBUMS, formatDuration } from '@gansuni/shared'
import { useAudioPlayer } from '@/store/useAudioPlayer'
import { Sidebar } from '@/components/Sidebar'
import { HeaderNav } from '@/components/HeaderNav'

export default function SearchPage(): ReactNode {
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<'ALL' | 'TRACKS' | 'ARTISTS' | 'ALBUMS'>('ALL')
  const [liveTracks, setLiveTracks] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)

  const play = useAudioPlayer((s) => s.play)
  const currentTrackId = useAudioPlayer((s) => s.currentTrack?.id)
  const playbackState = useAudioPlayer((s) => s.playbackState)
  const likedTrackIds = useAudioPlayer((s) => s.likedTrackIds)
  const toggleLikeTrack = useAudioPlayer((s) => s.toggleLikeTrack)

  const isCurrentPlaying = (id: string) => currentTrackId === id && (playbackState === 'playing' || playbackState === 'buffering')

  useEffect(() => {
    if (!query.trim()) {
      setLiveTracks([])
      setIsSearching(false)
      return
    }

    const timer = setTimeout(async () => {
      try {
        setIsSearching(true)
        const res = await fetch(`/api/live-search?q=${encodeURIComponent(query.trim())}`)
        const data = await res.json()
        if (data.tracks) {
          setLiveTracks(data.tracks)
        }
      } catch (e) {
        console.error('Search API error:', e)
      } finally {
        setIsSearching(false)
      }
    }, 400)

    return () => clearTimeout(timer)
  }, [query])

  const displayTracks = query.trim() ? (liveTracks.length > 0 ? liveTracks : EXPANDED_TRACKS.filter((t) => t.title.toLowerCase().includes(query.toLowerCase()))) : EXPANDED_TRACKS

  const filteredArtists = useMemo(() => {
    if (!query.trim()) return EXPANDED_ARTISTS
    const q = query.toLowerCase()
    return EXPANDED_ARTISTS.filter((a) => a.name.toLowerCase().includes(q) || a.bio?.toLowerCase().includes(q))
  }, [query])

  const filteredAlbums = useMemo(() => {
    if (!query.trim()) return EXPANDED_ALBUMS
    const q = query.toLowerCase()
    return EXPANDED_ALBUMS.filter((al) => al.title.toLowerCase().includes(q))
  }, [query])

  const onPlayTrack = (track: any) => {
    const idx = displayTracks.findIndex((t) => t.id === track.id)
    play(track as any, displayTracks.map((t) => ({ trackId: t.id, track: t as any })), Math.max(0, idx))
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-12">
        <section className="grid lg:grid-cols-[260px_1fr] gap-6 lg:gap-8">
          <Sidebar />

          <div className="min-w-0">
            <HeaderNav showSearchInput initialSearchQuery={query} onSearchChange={setQuery} />

            <div className="space-y-6">
              {/* FILTER PILLS */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2">
                {(['ALL', 'TRACKS', 'ARTISTS', 'ALBUMS'] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all border ${
                      filter === f
                        ? 'bg-[#F59E0B] text-black border-[#F59E0B]'
                        : 'bg-white/5 text-white/70 border-white/10 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    {f === 'ALL' ? 'All' : f === 'TRACKS' ? 'Songs' : f === 'ARTISTS' ? 'Artists' : 'Albums'}
                  </button>
                ))}
              </div>

              {/* SEARCH RESULTS HEADER */}
              {query.trim() && (
                <div className="text-sm text-white/60 flex items-center gap-2">
                  {isSearching && <Loader2 size={16} className="animate-spin text-[#F59E0B]" />}
                  <span>Found <span className="font-semibold text-white">{displayTracks.length}</span> live tracks for <span className="font-semibold text-white">"{query}"</span>:</span>
                </div>
              )}

              {/* TRACKS SECTION */}
              {(filter === 'ALL' || filter === 'TRACKS') && (
                <section>
                  <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                    <Music size={18} className="text-[#F59E0B]" />
                    <span>Songs ({displayTracks.length})</span>
                  </h2>

                  {displayTracks.length === 0 ? (
                    <div className="p-8 text-center bg-white/5 rounded-2xl border border-white/10 text-white/60 text-sm">
                      No songs found
                    </div>
                  ) : (
                    <div className="glass-card-strong overflow-hidden rounded-2xl divide-y divide-white/5">
                      {displayTracks.map((t, idx) => {
                        const playing = isCurrentPlaying(t.id)
                        const liked = likedTrackIds.includes(t.id)
                        return (
                          <div
                            key={t.id}
                            onClick={() => onPlayTrack(t)}
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
                            <div className="hidden sm:flex items-center justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  toggleLikeTrack(t.id)
                                }}
                                className="p-1.5 rounded-full hover:bg-white/10 text-white/60 hover:text-[#F59E0B]"
                              >
                                <Heart size={16} fill={liked ? '#F59E0B' : 'none'} color={liked ? '#F59E0B' : 'currentColor'} />
                              </button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </section>
              )}

              {/* ARTISTS SECTION */}
              {(filter === 'ALL' || filter === 'ARTISTS') && (
                <section>
                  <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                    <Mic2 size={18} className="text-[#F97316]" />
                    <span>Artists ({filteredArtists.length})</span>
                  </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {filteredArtists.map((a) => (
                      <Link
                        key={a.id}
                        href={`/artist/${a.id}`}
                        className="group p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-center flex flex-col items-center cursor-pointer"
                      >
                        <div className="relative w-24 h-24 rounded-full overflow-hidden mb-3 shadow-lg group-hover:scale-105 transition-transform">
                          <Image src={a.avatarUrl || ''} alt={a.name} fill sizes="96px" className="object-cover" />
                        </div>
                        <div className="font-bold text-sm text-white truncate w-full">{a.name}</div>
                        <div className="text-xs text-white/50 truncate w-full mt-1">Artist • {a.monthlyListeners.toLocaleString()} listeners</div>
                      </Link>
                    ))}
                  </div>
                </section>
              )}

              {/* ALBUMS SECTION */}
              {(filter === 'ALL' || filter === 'ALBUMS') && (
                <section>
                  <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                    <Disc size={18} className="text-purple-400" />
                    <span>Albums ({filteredAlbums.length})</span>
                  </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {filteredAlbums.map((al) => (
                      <Link
                        key={al.id}
                        href={`/album/${al.id}`}
                        className="group p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all cursor-pointer"
                      >
                        <div className="relative w-full aspect-square rounded-xl overflow-hidden mb-3 shadow-lg group-hover:scale-105 transition-transform">
                          <Image src={al.coverArtUrl || ''} alt={al.title} fill sizes="200px" className="object-cover" />
                        </div>
                        <div className="font-bold text-sm text-white truncate">{al.title}</div>
                        <div className="text-xs text-white/50 truncate mt-1">Album • {al.totalTracks} tracks</div>
                      </Link>
                    ))}
                  </div>
                </section>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
