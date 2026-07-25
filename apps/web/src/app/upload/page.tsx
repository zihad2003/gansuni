'use client'

import { useState, useEffect, type ReactNode } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { UploadCloud, Play, Trash2, Music, CheckCircle2 } from 'lucide-react'
import { formatDuration } from '@gansuni/shared'
import { useAudioPlayer } from '@/store/useAudioPlayer'
import { Sidebar } from '@/components/Sidebar'
import { HeaderNav } from '@/components/HeaderNav'
import { UploadModal } from '@/components/UploadModal'

export default function UploadPage(): ReactNode {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [uploadedTracks, setUploadedTracks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const play = useAudioPlayer((s) => s.play)
  const currentTrackId = useAudioPlayer((s) => s.currentTrack?.id)
  const playbackState = useAudioPlayer((s) => s.playbackState)

  const isCurrentPlaying = (id: string) => currentTrackId === id && (playbackState === 'playing' || playbackState === 'buffering')

  const fetchUploadedTracks = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/tracks')
      const data = await res.json()
      if (data.userTracks) {
        setUploadedTracks(data.userTracks)
      }
    } catch (e) {
      console.error('Failed to load user tracks:', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUploadedTracks()
  }, [])

  const handleDelete = async (trackId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm('Are you sure you want to delete this uploaded song?')) return

    try {
      const res = await fetch(`/api/tracks/${trackId}`, { method: 'DELETE' })
      if (res.ok) {
        setUploadedTracks((prev) => prev.filter((t) => t.id !== trackId))
      }
    } catch (err) {
      console.error('Delete track error:', err)
    }
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
              <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-amber-900/60 via-orange-900/50 to-indigo-900/60 border border-white/15 backdrop-blur-xl shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                <div>
                  <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-amber-400 border border-white/15 text-xs font-bold w-fit mb-3">
                    <UploadCloud size={14} />
                    <span>Custom Music Storage</span>
                  </div>
                  <h1 className="text-3xl sm:text-4xl font-extrabold text-white">Upload Your MP3 Songs</h1>
                  <p className="mt-2 text-sm text-white/70 max-w-xl">
                    Upload your own real MP3 audio files to your local Gaansuni library. Stream your personal music collection anywhere.
                  </p>
                </div>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="gs-button flex items-center gap-2 font-bold px-6 py-3 shadow-xl text-sm flex-shrink-0"
                >
                  <UploadCloud size={18} />
                  <span>Upload New MP3</span>
                </button>
              </div>

              {/* UPLOADED SONGS LIST */}
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
                    <Music size={20} className="text-[#F59E0B]" />
                    <span>Your Uploads ({uploadedTracks.length})</span>
                  </h2>
                </div>

                {uploadedTracks.length === 0 ? (
                  <div className="p-12 text-center bg-white/5 rounded-2xl border border-white/10">
                    <UploadCloud size={48} className="mx-auto text-amber-400/50 mb-3" />
                    <h3 className="text-lg font-bold text-white">No Uploaded Songs Yet</h3>
                    <p className="text-xs text-white/60 mt-1 max-w-md mx-auto">
                      Upload your personal MP3 audio tracks to add them to your cloud music library.
                    </p>
                    <button
                      onClick={() => setIsModalOpen(true)}
                      className="mt-5 gs-button inline-flex items-center gap-2 font-bold px-6 py-2.5"
                    >
                      <UploadCloud size={16} />
                      <span>Upload Songs Now</span>
                    </button>
                  </div>
                ) : (
                  <div className="glass-card-strong overflow-hidden rounded-2xl divide-y divide-white/5">
                    {uploadedTracks.map((t, idx) => {
                      const playing = isCurrentPlaying(t.id)
                      return (
                        <div
                          key={t.id}
                          onClick={() => play(t as any, uploadedTracks.map((tr) => ({ trackId: tr.id, track: tr as any })), idx)}
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
                              onClick={(e) => handleDelete(t.id, e)}
                              className="p-1.5 rounded-full hover:bg-red-500/20 text-white/50 hover:text-red-400 transition-colors"
                              title="Delete Uploaded Song"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </section>
            </div>
          </div>
        </section>
      </div>

      <UploadModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          fetchUploadedTracks()
        }}
      />
    </div>
  )
}
