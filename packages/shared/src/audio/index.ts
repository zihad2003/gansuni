import type { Milliseconds, PlaySource, Track } from '../types'

// =============================================
// AUDIO PLAYER STATE — shared contract (Web + Mobile)
// =============================================

export type RepeatMode = 'off' | 'all' | 'one'

export type PlaybackState = 'idle' | 'loading' | 'playing' | 'paused' | 'buffering' | 'error'

export interface ShuffleState {
  enabled: boolean
  orderedQueue: string[]
  shuffledIndices: number[]
  currentShuffledIdx: number
}

export interface QueueItem {
  trackId: string
  track?: Track
  sourceContext?: PlaySource
  contextId?: string
}

export interface PlayerState {
  currentTrack: Track | null
  currentIndex: number
  queue: QueueItem[]
  playbackState: PlaybackState
  currentTime: Milliseconds
  duration: Milliseconds
  volume: number
  muted: boolean
  shuffle: boolean
  repeat: RepeatMode
  speed: number
  error: string | null
  isSeeking: boolean
  isOfflineMode: boolean
}

export interface PlayerActions {
  play: (track?: Track, queue?: QueueItem[], startIndex?: number) => Promise<void> | void
  pause: () => void
  togglePlay: () => void
  resume: () => void
  next: () => void
  previous: () => void
  seekTo: (time: Milliseconds) => void
  setVolume: (volume: number) => void
  toggleMute: () => void
  toggleShuffle: () => void
  setRepeat: (mode: RepeatMode) => void
  toggleRepeat: () => void
  setSpeed: (speed: number) => void
  addToQueue: (track: Track | QueueItem) => void
  addNextInQueue: (track: Track | QueueItem) => void
  removeFromQueue: (index: number) => void
  reorderQueue: (fromIndex: number, toIndex: number) => void
  clearQueue: () => void
  setOfflineMode: (enabled: boolean) => void
  reset: () => void
}

export type PlayerStore = PlayerState & PlayerActions

export const DEFAULT_PLAYER_STATE: PlayerState = {
  currentTrack: null,
  currentIndex: -1,
  queue: [],
  playbackState: 'idle',
  currentTime: 0,
  duration: 0,
  volume: 0.8,
  muted: false,
  shuffle: false,
  repeat: 'off',
  speed: 1,
  error: null,
  isSeeking: false,
  isOfflineMode: false,
}

export function formatDuration(ms: Milliseconds): string {
  if (!ms || ms < 0) return '0:00'
  const totalSeconds = Math.floor(ms / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

export function formatDurationVerbose(ms: Milliseconds): string {
  if (!ms || ms < 0) return '0s'
  const totalSeconds = Math.floor(ms / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  const parts: string[] = []
  if (hours > 0) parts.push(`${hours}h`)
  if (minutes > 0) parts.push(`${minutes}m`)
  if (seconds > 0) parts.push(`${seconds}s`)

  return parts.join(' ') || '0s'
}

export function clampVolume(vol: number): number {
  return Math.max(0, Math.min(1, vol))
}

export function clampSpeed(speed: number): number {
  const VALID_SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2]
  return VALID_SPEEDS.reduce((prev, curr) =>
    Math.abs(curr - speed) < Math.abs(prev - speed) ? curr : prev,
  )
}
