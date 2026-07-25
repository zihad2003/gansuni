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
  const queueSize = useAudioPlayer((s) => s.queue.length)
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
  const hasTrack = !!track

  const onTogglePlay = useCallback(() => {
    if (!track) return
    if (isPlaying) pause()
    else play()
  }, [track, isPlaying, play, pause])

  return (
    <AnimatePresence initial={false}>
      {hasTrack && (
        <motion.div
          key="mini-player"
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 28 }}
          className="fixed bottom-0 inset-x-0 z-40 px-3 pb-3 sm:px-6 sm:pb-6"
        >
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
                  className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg overflow-hidden flex-shrink-0"
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

              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm sm:text-base truncate" style={{ color: themeColors.textPrimary }}>
                  {track?.title}
                </div>
                <div className="text-xs sm:text-sm truncate mt-0.5" style={{ color: themeColors.textSecondary }}>
                  {track?.artist?.name || track?.album?.artist?.name} • {track?.album?.title}
                </div>
              </div>

              <button
                onClick={() => track && toggleLikeTrack(track.id)}
                className="hidden sm:flex items-center justify-center w-10 h-10 rounded-full transition-all"
                style={{
                  color: isTrackLiked ? '#1DB954' : themeColors.textSecondary,
                }}
                aria-label={isTrackLiked ? 'Remove from Liked Songs' : 'Save to Liked Songs'}
              >
                <Heart size={20} fill={isTrackLiked ? '#1DB954' : 'none'} strokeWidth={2} />
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
                  background: '#1DB954',
                  color: '#000',
                  boxShadow: isPlaying
                    ? `0 0 0 4px rgba(29,185,84,0.15), 0 4px 20px -4px rgba(29,185,84,0.6)`
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
                <IconButton onClick={() => {}} label="Download" theme={themeColors}>
                  <Download size={18} />
                </IconButton>
                <IconButton onClick={() => setShowQueue((v) => !v)} active={showQueue} label="Queue" theme={themeColors} badge={queueSize || undefined}>
                  <ListMusic size={18} />
                </IconButton>
                <IconButton onClick={() => setExpanded((v) => !v)} active={expanded} label="Expand player" theme={themeColors}>
                  <Maximize2 size={18} />
                </IconButton>
              </div>

              <div className="sm:hidden flex items-center gap-1">
                <IconButton onClick={next} label="Next" theme={themeColors}>
                  <SkipForward size={20} fill={themeColors.textPrimary} />
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
    <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center gap-[2px]" style={{ background: '#1DB954' }}>
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
