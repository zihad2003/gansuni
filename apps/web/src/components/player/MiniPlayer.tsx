'use client'

import Image from 'next/image'
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  Volume2,
  VolumeX,
  Heart,
  ListMusic,
  Maximize2,
  Download,
  X,
  ChevronDown,
  Music2,
  Minimize2,
} from 'lucide-react'
import { useAudioPlayer } from '@/store/useAudioPlayer'
import { useTheme } from '@/providers/ThemeProvider'
import { formatDuration } from '@gansuni/shared'
import { ProgressBar } from './ProgressBar'
import { VolumeSlider } from './VolumeSlider'
import { useCallback, useState, type ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export function MiniPlayer(): ReactNode {
  const track = useAudioPlayer((s) => s.currentTrack)
  const playbackState = useAudioPlayer((s) => s.playbackState)
  const currentTime = useAudioPlayer((s) => s.currentTime)
  const duration = useAudioPlayer((s) => s.duration)
  const volume = useAudioPlayer((s) => s.volume)
  const muted = useAudioPlayer((s) => s.muted)
  const shuffle = useAudioPlayer((s) => s.shuffle)
  const repeat = useAudioPlayer((s) => s.repeat)
  const queue = useAudioPlayer((s) => s.queue)
  const currentIndex = useAudioPlayer((s) => s.currentIndex)
  const likedTrackIds = useAudioPlayer((s) => s.likedTrackIds)
  const toggleLikeTrack = useAudioPlayer((s) => s.toggleLikeTrack)
  const { themeColors } = useTheme()
  const [showQueue, setShowQueue] = useState(false)
  const [expanded, setExpanded] = useState(false)

  const isTrackLiked = track ? likedTrackIds.includes(track.id) : false

  const play = useAudioPlayer((s) => s.play)
  const pause = useAudioPlayer((s) => s.pause)
  const next = useAudioPlayer((s) => s.next)
  const prev = useAudioPlayer((s) => s.previous)
  const seekTo = useAudioPlayer((s) => s.seekTo)
  const setVolume = useAudioPlayer((s) => s.setVolume)
  const toggleMute = useAudioPlayer((s) => s.toggleMute)
  const toggleShuffle = useAudioPlayer((s) => s.toggleShuffle)
  const toggleRepeat = useAudioPlayer((s) => s.toggleRepeat)

  const isPlaying = playbackState === 'playing' || playbackState === 'buffering'
  const isLoading = playbackState === 'loading'
  const isError = playbackState === 'error'
  const isBuffering = playbackState === 'buffering'
  const hasTrack = !!track

  const getStatusLabel = () => {
    if (isLoading) return 'Resolving stream...'
    if (isBuffering) return 'Buffering...'
    if (isError) return 'Stream error — tap to retry'
    return ''
  }

  const onTogglePlay = useCallback(() => {
    if (!track) return
    if (isError) {
      useAudioPlayer.getState().play()
      return
    }
    if (isPlaying) pause()
    else play()
  }, [track, isPlaying, isError, play, pause])

  const onDownload = useCallback(() => {
    if (!track) return
    const audioUrl = track.audioUrl
    if (!audioUrl) return
    const a = document.createElement('a')
    a.href = audioUrl
    a.download = `${track.title || 'track'}.mp3`
    a.target = '_blank'
    a.rel = 'noopener noreferrer'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }, [track])

  const onPlayQueueTrack = useCallback((queueItem: any, idx: number) => {
    if (queueItem?.track) {
      play(queueItem.track, queue, idx)
    }
  }, [play, queue])

  return (
    <>
      {/* EXPANDED FULLSCREEN PLAYER MODAL */}
      <AnimatePresence>
        {expanded && hasTrack && (
          <motion.div
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-50 flex flex-col justify-between p-6 sm:p-10 bg-neutral-950/95 backdrop-blur-3xl text-white overflow-y-auto"
          >
            {/* AMBIENT COVER ART BACKDROP */}
            {track?.album?.coverArtUrl && (
              <div className="absolute inset-0 z-0 opacity-25 pointer-events-none overflow-hidden">
                <Image src={track.album.coverArtUrl} alt="" fill className="object-cover blur-3xl scale-125" />
              </div>
            )}

            {/* TOP BAR */}
            <div className="relative z-10 flex items-center justify-between">
              <button
                onClick={() => setExpanded(false)}
                className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                title="Minimize player"
              >
                <ChevronDown size={24} />
              </button>

              <div className="text-center">
                <div className="text-[11px] uppercase tracking-widest text-amber-400 font-extrabold">PLAYING FROM GAANSUNI</div>
                <div className="text-sm font-extrabold text-white truncate max-w-xs">{track?.album?.title || 'Single'}</div>
              </div>

              <button
                onClick={onDownload}
                className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                title="Download MP3"
              >
                <Download size={20} />
              </button>
            </div>

            {/* CENTER CONTENT */}
            <div className="relative z-10 my-auto flex flex-col items-center max-w-md mx-auto w-full py-6">
              <div className="relative w-64 h-64 sm:w-80 sm:h-80 rounded-3xl overflow-hidden shadow-2xl border border-white/20 mb-8 group">
                {track?.album?.coverArtUrl ? (
                  <Image src={track.album.coverArtUrl} alt={track?.title || ''} fill className="object-cover" priority sizes="320px" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-tr from-amber-600 to-orange-600 flex items-center justify-center">
                    <Music2 size={64} />
                  </div>
                )}
              </div>

              <div className="w-full flex items-center justify-between gap-4 mb-6">
                <div className="min-w-0">
                  <h2 className="text-2xl sm:text-3xl font-black text-white truncate">{track?.title}</h2>
                  <p className="text-base text-amber-400 font-semibold truncate mt-1">{track?.artist?.name || track?.album?.artist?.name}</p>
                </div>
                <button
                  onClick={() => track && toggleLikeTrack(track.id)}
                  className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors flex-shrink-0"
                >
                  <Heart size={24} fill={isTrackLiked ? '#F59E0B' : 'none'} color={isTrackLiked ? '#F59E0B' : 'currentColor'} />
                </button>
              </div>

              {/* PROGRESS BAR */}
              <div className="w-full space-y-2 mb-6">
                <ProgressBar current={currentTime} duration={duration} onSeek={seekTo} accent="#F59E0B" />
                <div className="flex items-center justify-between text-xs text-white/50 font-medium">
                  <span>{formatDuration(currentTime)}</span>
                  <span>{formatDuration(duration)}</span>
                </div>
              </div>

              {/* CONTROLS */}
              <div className="flex items-center justify-between w-full max-w-xs mb-2">
                <button onClick={toggleShuffle} className={`p-2 rounded-full transition-colors ${shuffle ? 'text-amber-400' : 'text-white/60 hover:text-white'}`}>
                  <Shuffle size={20} />
                </button>
                <button onClick={prev} className="p-3 rounded-full text-white hover:scale-110 transition-transform">
                  <SkipBack size={32} fill="currentColor" />
                </button>
                <button
                  onClick={onTogglePlay}
                  disabled={isLoading}
                  className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#F59E0B] to-[#F97316] text-black flex items-center justify-center shadow-2xl hover:scale-105 active:scale-95 transition-transform"
                >
                  {isLoading ? (
                    <span className="w-6 h-6 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  ) : isPlaying ? (
                    <Pause size={30} fill="#000" strokeWidth={0} />
                  ) : (
                    <Play size={30} fill="#000" strokeWidth={0} className="ml-1" />
                  )}
                </button>
                <button onClick={next} className="p-3 rounded-full text-white hover:scale-110 transition-transform">
                  <SkipForward size={32} fill="currentColor" />
                </button>
                <button onClick={toggleRepeat} className={`p-2 rounded-full transition-colors ${repeat !== 'off' ? 'text-amber-400' : 'text-white/60 hover:text-white'}`}>
                  {repeat === 'one' ? <Repeat1 size={20} /> : <Repeat size={20} />}
                </button>
              </div>

              {getStatusLabel() && (
                <div className={`text-xs font-medium mb-4 ${isError ? 'text-red-400' : 'text-white/50'}`}>
                  {getStatusLabel()}
                </div>
              )}

              {/* VOLUME SLIDER */}
              <div className="w-full flex items-center gap-3 max-w-xs">
                <button onClick={toggleMute} className="text-white/60 hover:text-white">
                  {muted || volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
                </button>
                <VolumeSlider volume={muted ? 0 : volume} onChange={setVolume} accent="#F59E0B" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* BOTTOM MINI PLAYER */}
      <AnimatePresence initial={false}>
        {hasTrack && (
          <motion.div
            key="mini-player"
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 28 }}
            className="fixed bottom-[56px] lg:bottom-0 inset-x-0 z-40 px-2 pb-2 sm:px-6 sm:pb-6"
          >
            {/* QUEUE PANEL */}
            <AnimatePresence>
              {showQueue && (
                <motion.div
                  initial={{ opacity: 0, y: 20, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: 'auto' }}
                  exit={{ opacity: 0, y: 20, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="mb-2 glass-card-strong rounded-2xl overflow-hidden max-h-64 overflow-y-auto no-scrollbar"
                >
                  <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
                    <h3 className="text-sm font-bold text-white">Queue ({queue.length} tracks)</h3>
                    <button onClick={() => setShowQueue(false)} className="p-1 rounded-full hover:bg-white/10 text-white/60 hover:text-white transition-colors">
                      <X size={16} />
                    </button>
                  </div>
                  <div className="divide-y divide-white/5">
                    {queue.map((item, idx) => {
                      const isActive = idx === currentIndex
                      return (
                        <div
                          key={`${item.trackId}-${idx}`}
                          onClick={() => onPlayQueueTrack(item, idx)}
                          className="flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 cursor-pointer transition-colors"
                        >
                          <div className="text-xs font-semibold w-6 text-center" style={{ color: isActive ? '#F59E0B' : 'var(--gs-text-muted)' }}>
                            {isActive ? '▶' : idx + 1}
                          </div>
                          {item.track?.album?.coverArtUrl && (
                            <div className="relative w-8 h-8 rounded-md overflow-hidden flex-shrink-0">
                              <Image src={item.track.album.coverArtUrl} alt="" fill sizes="32px" className="object-cover" />
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <div className="text-xs font-semibold truncate" style={{ color: isActive ? '#F59E0B' : 'white' }}>{item.track?.title}</div>
                            <div className="text-[11px] text-white/50 truncate">{item.track?.artist?.name}</div>
                          </div>
                          <div className="text-[11px] text-white/40">{formatDuration(item.track?.durationMs || 0)}</div>
                        </div>
                      )
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div
              className="glass-card-strong theme-transition-all overflow-hidden"
              style={{
                boxShadow: `0 -8px 32px -8px ${themeColors.glowColor}, 0 2px 8px -2px rgba(0,0,0,0.5)`,
              }}
            >
              <ProgressBar
                current={currentTime}
                duration={duration}
                onSeek={seekTo}
                accent={themeColors.accent}
              />

              <div className="flex items-center gap-3 sm:gap-4 px-3 sm:px-5 py-3 sm:py-4">
                <div className="relative flex-shrink-0">
                  <div
                    className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg overflow-hidden flex-shrink-0 cursor-pointer"
                    onClick={() => setExpanded(true)}
                    style={{
                      boxShadow: `0 2px 16px -4px ${themeColors.glowColor}`,
                    }}
                  >
                    {track?.album?.coverArtUrl ? (
                      <Image
                        src={track.album.coverArtUrl}
                        alt={track.title}
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                        sizes="64px"
                        priority
                      />
                    ) : (
                      <div
                        className="w-full h-full"
                        style={{ background: themeColors.dominant }}
                      />
                    )}
                  </div>
                  {isPlaying && <EqualizerBadge />}
                </div>

                <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setExpanded(true)}>
                  <div className="font-semibold text-sm sm:text-base truncate" style={{ color: themeColors.textPrimary }}>
                    {track?.title}
                  </div>
                  <div className="text-xs sm:text-sm truncate mt-0.5 flex items-center gap-2" style={{ color: themeColors.textSecondary }}>
                    <span>{track?.artist?.name || track?.album?.artist?.name} • {track?.album?.title}</span>
                    {(playbackState === 'loading' || playbackState === 'buffering') && (
                      <span className="text-[10px] text-amber-400 font-medium animate-pulse">Resolving stream...</span>
                    )}
                    {playbackState === 'error' && (
                      <span className="text-[10px] text-red-400 font-medium">Tap to retry</span>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => track && toggleLikeTrack(track.id)}
                  className="hidden sm:flex items-center justify-center w-10 h-10 rounded-full transition-all"
                  style={{
                    color: isTrackLiked ? '#F59E0B' : themeColors.textSecondary,
                  }}
                  aria-label={isTrackLiked ? 'Remove from Liked Songs' : 'Save to Liked Songs'}
                >
                  <Heart size={20} fill={isTrackLiked ? '#F59E0B' : 'none'} strokeWidth={2} />
                </button>

                <div className="hidden md:flex items-center gap-1 sm:gap-2">
                  <IconButton onClick={toggleShuffle} active={shuffle} label="Shuffle" theme={themeColors}>
                    <Shuffle size={18} />
                  </IconButton>
                  <IconButton onClick={prev} label="Previous" theme={themeColors}>
                    <SkipBack size={22} fill={themeColors.textPrimary} />
                  </IconButton>
                </div>

                <button
                  onClick={onTogglePlay}
                  disabled={isLoading}
                  className="flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-full transition-all active:scale-95 disabled:opacity-50 flex-shrink-0"
                  style={{
                    background: 'linear-gradient(135deg, #F59E0B, #F97316)',
                    color: '#000',
                    boxShadow: isPlaying
                      ? `0 0 0 4px rgba(245,158,11,0.15), 0 4px 20px -4px rgba(245,158,11,0.6)`
                      : `0 2px 12px -4px rgba(0,0,0,0.5)`,
                  }}
                  aria-label={isPlaying ? 'Pause' : 'Play'}
                >
                  {isLoading ? (
                    <span className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  ) : isPlaying ? (
                    <Pause size={22} fill="#000" strokeWidth={0} />
                  ) : (
                    <Play size={22} fill="#000" strokeWidth={0} className="ml-0.5" />
                  )}
                </button>

                <div className="hidden md:flex items-center gap-1 sm:gap-2">
                  <IconButton onClick={next} label="Next" theme={themeColors}>
                    <SkipForward size={22} fill={themeColors.textPrimary} />
                  </IconButton>
                  <IconButton onClick={toggleRepeat} active={repeat !== 'off'} label="Repeat" theme={themeColors}>
                    {repeat === 'one' ? <Repeat1 size={18} /> : <Repeat size={18} />}
                  </IconButton>
                </div>

                <div className="hidden lg:flex items-center gap-2 ml-2 min-w-[140px]">
                  <button
                    onClick={toggleMute}
                    className="p-1.5 rounded-full transition-colors hover:bg-white/10"
                    style={{ color: themeColors.textSecondary }}
                    aria-label={muted ? 'Unmute' : 'Mute'}
                  >
                    {muted || volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
                  </button>
                  <VolumeSlider
                    volume={muted ? 0 : volume}
                    onChange={setVolume}
                    accent={themeColors.accent}
                  />
                </div>

                <div className="hidden xl:flex items-center gap-1 ml-2">
                  <IconButton onClick={onDownload} label="Download" theme={themeColors}>
                    <Download size={18} />
                  </IconButton>
                  <IconButton onClick={() => setShowQueue((v) => !v)} active={showQueue} label="Queue" theme={themeColors} badge={queue.length || undefined}>
                    <ListMusic size={18} />
                  </IconButton>
                  <IconButton onClick={() => setExpanded((v) => !v)} active={expanded} label="Expand player" theme={themeColors}>
                    <Maximize2 size={18} />
                  </IconButton>
                </div>

                <div className="sm:hidden flex items-center gap-1">
                  <IconButton onClick={toggleMute} label={muted ? 'Unmute' : 'Mute'} theme={themeColors}>
                    {muted || volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
                  </IconButton>
                  <IconButton onClick={() => setExpanded(true)} label="Expand player" theme={themeColors}>
                    <Maximize2 size={20} />
                  </IconButton>
                </div>
              </div>

              <div className="flex md:hidden items-center justify-between px-4 pb-3 text-[11px]" style={{ color: themeColors.textMuted }}>
                <span>{formatDuration(currentTime)}</span>
                <span>{formatDuration(duration)}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

function IconButton({
  children,
  onClick,
  active,
  label,
  theme,
  badge,
}: {
  children: React.ReactNode
  onClick: () => void
  active?: boolean
  label: string
  theme: { accent: string; textSecondary: string; accentHover: string }
  badge?: number
}) {
  return (
    <button
      onClick={onClick}
      className="relative flex items-center justify-center w-9 h-9 rounded-full transition-all hover:bg-white/10 active:scale-95"
      style={{
        color: active ? theme.accent : theme.textSecondary,
      }}
      aria-label={label}
      aria-pressed={active}
    >
      {children}
      {badge != null && badge > 0 && (
        <span
          className="absolute -top-0.5 -right-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full"
          style={{ background: theme.accent, color: '#000', minWidth: '16px', textAlign: 'center' }}
        >
          {badge > 99 ? '99+' : badge}
        </span>
      )}
    </button>
  )
}

function EqualizerBadge() {
  return (
    <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center gap-[2px]" style={{ background: '#F59E0B' }}>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-[2px] bg-black rounded-full animate-bar-equalizer"
          style={{
            height: '8px',
            animationDelay: `${i * 0.18}s`,
            transformOrigin: 'bottom',
          }}
        />
      ))}
    </div>
  )
}
