import { create } from 'zustand'
import { Audio, AVPlaybackStatus, InterruptionModeAndroid, InterruptionModeIOS } from 'expo-av'
import * as FileSystem from 'expo-file-system'
import {
  DEFAULT_PLAYER_STATE,
  clampVolume,
  clampSpeed,
  shuffleArray,
  type PlayerActions,
  type PlayerState,
  type QueueItem,
  type RepeatMode,
  type Milliseconds,
} from '@gansuni/shared'
import type { Track, Bytes } from '@gansuni/shared'

type PlayerSlice = PlayerState & PlayerActions

interface InternalState {
  likedTrackIds: string[]
  toggleLikeTrack: (trackId: string) => void
  isLiked: (trackId: string) => boolean
  _sound: Audio.Sound | null
  _boundStatus: boolean
  _isProcessingAction: boolean
  _downloads: Map<string, { localUri: string; size: Bytes; quality: 'STANDARD' | 'HIGH' }>
  _shuffleIndices: number[]
  _shuffleIdx: number
}

export const useMobilePlayer = create<PlayerSlice & InternalState>((set, get) => ({
  ...DEFAULT_PLAYER_STATE,
  likedTrackIds: ['t12', 't13', 't14', 't15', 't16', 't17', 't18'],
  toggleLikeTrack: (trackId: string) => {
    set((s) => {
      const exists = s.likedTrackIds.includes(trackId)
      const next = exists
        ? s.likedTrackIds.filter((id) => id !== trackId)
        : [...s.likedTrackIds, trackId]
      return { likedTrackIds: next }
    })
  },
  isLiked: (trackId: string) => get().likedTrackIds.includes(trackId),
  _sound: null,
  _boundStatus: false,
  _isProcessingAction: false,
  _downloads: new Map(),
  _shuffleIndices: [],
  _shuffleIdx: -1,

  _onPlaybackStatusUpdate: (status: AVPlaybackStatus) => {
    if (!status.isLoaded) {
      if (status.error) {
        set({ playbackState: 'error', error: status.error })
      }
      return
    }
    const s = get()
    if (s.isSeeking) return

    const durationMs: Milliseconds = status.durationMillis || s.duration || 0
    const positionMs: Milliseconds = status.positionMillis || 0

    let playbackState = s.playbackState
    if (status.isBuffering) {
      playbackState = 'buffering'
    } else if (status.isPlaying) {
      playbackState = 'playing'
    } else if (status.didJustFinish) {
      playbackState = 'paused'
    } else if (positionMs > 0 || s.playbackState === 'playing' || s.playbackState === 'paused') {
      playbackState = 'paused'
    }

    set({
      currentTime: positionMs,
      duration: durationMs,
      playbackState,
    })

    if (status.didJustFinish) {
      set({ playbackState: 'paused' }, true)
      get().next()
    }
  },

  _ensureAudioMode: async () => {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: true,
        interruptionModeIOS: InterruptionModeIOS.DuckOthers,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        interruptionModeAndroid: InterruptionModeAndroid.DuckOthers,
        playThroughEarpieceAndroid: false,
      })
    } catch {}
  },

  _getTrackSource: async (track: Track): Promise<{ uri: string; isOffline: boolean }> => {
    const state = get()
    if (state.isOfflineMode || state._downloads.has(track.id)) {
      const download = state._downloads.get(track.id)
      if (download) return { uri: download.localUri, isOffline: true }
    }
    return { uri: track.audioUrl, isOffline: false }
  },

  _unloadCurrent: async () => {
    const s = get()
    if (s._sound) {
      try {
        s._sound.setOnPlaybackStatusUpdate(null)
        await s._sound.unloadAsync()
      } catch {}
    }
  },

  play: async (track?: Track, queue?: QueueItem[], startIndex = 0) => {
    const s = get()
    if (s._isProcessingAction) return
    set({ _isProcessingAction: true, error: null })

    try {
      await s._ensureAudioMode()

      const willPlayNew =
        track && (!s.currentTrack || s.currentTrack.id !== track.id)

      if (willPlayNew && track) {
        const finalQueue =
          queue || (s.currentTrack ? s.queue : [{ trackId: track.id, track }])
        const idx = queue ? startIndex : finalQueue.findIndex((q) => q.trackId === track!.id)
        const resolvedIdx = idx >= 0 ? idx : 0

        const shuffleIndices = s.shuffle
          ? shuffleArray(
              finalQueue.map((_, i) => i).filter((i) => i !== resolvedIdx),
            )
          : []

        set({
          queue: finalQueue,
          currentIndex: resolvedIdx,
          currentTrack: track,
          playbackState: 'loading',
          currentTime: 0,
          duration: 0,
          _shuffleIndices: s.shuffle ? [resolvedIdx, ...shuffleIndices] : [],
          _shuffleIdx: 0,
        })

        await s._unloadCurrent()

        const source = await s._getTrackSource(track)
        const { sound } = await Audio.Sound.createAsync(
          { uri: source.uri },
          {
            shouldPlay: true,
            volume: s.muted ? 0 : clampVolume(s.volume),
            rate: clampSpeed(s.speed),
            shouldCorrectPitch: true,
          },
          s._onPlaybackStatusUpdate,
        )
        set({ _sound: sound, _boundStatus: true, playbackState: 'playing' })
        set({ _isProcessingAction: false })
        return
      }

      if (s.currentTrack && s._sound) {
        try {
          await s._sound.setRateAsync(clampSpeed(s.speed), true)
          await s._sound.playAsync()
          set({ playbackState: 'playing' })
        } catch (e: any) {
          set({
            playbackState: 'error',
            error: e?.message || 'Playback failed',
          })
        }
      }
    } catch (e: any) {
      set({
        playbackState: 'error',
        error: e?.message || 'Failed to play audio',
      })
    } finally {
      set({ _isProcessingAction: false })
    }
  },

  pause: async () => {
    const sound = get()._sound
    if (!sound) return
    try {
      await sound.pauseAsync()
      set({ playbackState: 'paused' })
    } catch {}
  },

  togglePlay: () => {
    const s = get()
    if (!s._sound || !s.currentTrack) return
    if (s.playbackState === 'playing' || s.playbackState === 'buffering') {
      s.pause()
    } else {
      s.play()
    }
  },

  resume: () => get().play(),

  next: async () => {
    const s = get()
    if (!s.currentTrack || s.queue.length === 0 || s._isProcessingAction) return

    let nextIdx: number
    if (s.shuffle) {
      const indices = s._shuffleIndices
      if (indices.length === 0) {
        s._shuffleIndices = shuffleArray(s.queue.map((_, i) => i))
      }
      const newShuffleIdx = (s._shuffleIdx + 1) % s._shuffleIndices.length
      nextIdx = s._shuffleIndices[newShuffleIdx] ?? 0
      set({ _shuffleIdx: newShuffleIdx })
    } else {
      if (s.repeat === 'one') {
        if (s._sound) {
          try {
            await s._sound.setPositionAsync(0)
            await s._sound.playAsync()
          } catch {}
        }
        set({ currentTime: 0 })
        return
      }
      nextIdx = (s.currentIndex + 1) % s.queue.length
      if (nextIdx === 0 && s.repeat === 'off' && s.currentIndex > 0) {
        await s.pause()
        set({ currentTime: 0 })
        if (s._sound) {
          try { await s._sound.setPositionAsync(0) } catch {}
        }
        return
      }
    }

    const next = s.queue[nextIdx]
    if (!next) return
    await s.play(next.track ?? ({} as Track), s.queue, nextIdx)
  },

  previous: async () => {
    const s = get()
    if (!s.currentTrack || s.queue.length === 0 || s._isProcessingAction) return

    if (s.currentTime > 3000) {
      if (s._sound) {
        try { await s._sound.setPositionAsync(0) } catch {}
      }
      set({ currentTime: 0 })
      return
    }

    let prevIdx: number
    if (s.shuffle) {
      if (s._shuffleIndices.length === 0) {
        s._shuffleIndices = shuffleArray(s.queue.map((_, i) => i))
      }
      const newShuffleIdx = Math.max(0, s._shuffleIdx - 1)
      prevIdx = s._shuffleIndices[newShuffleIdx] ?? s.currentIndex
      set({ _shuffleIdx: newShuffleIdx })
    } else {
      prevIdx = Math.max(0, s.currentIndex - 1)
    }

    const prev = s.queue[prevIdx]
    if (!prev) return
    await s.play(prev.track ?? ({} as Track), s.queue, prevIdx)
  },

  seekTo: async (timeMs) => {
    const s = get()
    if (!s._sound || !isFinite(timeMs)) return
    const clamped = Math.max(0, Math.min(s.duration || 0, timeMs))
    set({ isSeeking: true, currentTime: clamped })
    try {
      await s._sound.setPositionAsync(clamped)
    } finally {
      set({ isSeeking: false })
    }
  },

  setVolume: async (vol) => {
    const v = clampVolume(vol)
    const s = get()
    if (s._sound) {
      try { await s._sound.setVolumeAsync(v) } catch {}
    }
    set({ volume: v, muted: v === 0 ? true : s.muted })
  },

  toggleMute: async () => {
    const s = get()
    const nextMuted = !s.muted
    if (s._sound) {
      try { await s._sound.setVolumeAsync(nextMuted ? 0 : clampVolume(s.volume || 0.8)) } catch {}
    }
    set({ muted: nextMuted })
  },

  toggleShuffle: () => {
    const s = get()
    const enabled = !s.shuffle
    if (enabled && s.queue.length > 0) {
      const others = s.queue.map((_, i) => i).filter((i) => i !== s.currentIndex)
      set({
        shuffle: true,
        _shuffleIndices: [s.currentIndex, ...shuffleArray(others)],
        _shuffleIdx: 0,
      })
    } else {
      set({ shuffle: false, _shuffleIndices: [], _shuffleIdx: -1 })
    }
  },

  setRepeat: (mode: RepeatMode) => set({ repeat: mode }),

  toggleRepeat: () => {
    const order: RepeatMode[] = ['off', 'all', 'one']
    const i = order.indexOf(get().repeat)
    set({ repeat: order[(i + 1) % order.length] ?? 'off' })
  },

  setSpeed: async (speed) => {
    const sp = clampSpeed(speed)
    const sound = get()._sound
    if (sound) {
      try { await sound.setRateAsync(sp, true) } catch {}
    }
    set({ speed: sp })
  },

  addToQueue: (item) => {
    const qi: QueueItem =
      'audioUrl' in item ? { trackId: item.id, track: item } : (item as QueueItem)
    set((s) => ({ queue: [...s.queue, qi] }))
  },

  addNextInQueue: (item) => {
    const qi: QueueItem =
      'audioUrl' in item ? { trackId: item.id, track: item } : (item as QueueItem)
    set((s) => {
      const idx = s.currentIndex < 0 ? 0 : s.currentIndex + 1
      const q = [...s.queue]
      q.splice(idx, 0, qi)
      return { queue: q }
    })
  },

  removeFromQueue: (index) => {
    set((s) => {
      if (index === s.currentIndex) return {}
      if (index < 0 || index >= s.queue.length) return {}
      const q = [...s.queue]
      q.splice(index, 1)
      let ci = s.currentIndex
      if (index < ci) ci--
      return { queue: q, currentIndex: ci }
    })
  },

  reorderQueue: (fromIndex, toIndex) => {
    set((s) => {
      if (fromIndex === toIndex) return {}
      if (fromIndex < 0 || fromIndex >= s.queue.length) return {}
      if (toIndex < 0 || toIndex >= s.queue.length) return {}
      const q = [...s.queue]
      const [moved] = q.splice(fromIndex, 1)
      q.splice(toIndex, 0, moved!)
      let ci = s.currentIndex
      if (ci === fromIndex) ci = toIndex
      else if (fromIndex < ci && toIndex >= ci) ci--
      else if (fromIndex > ci && toIndex <= ci) ci++
      return { queue: q, currentIndex: ci }
    })
  },

  clearQueue: () => {
    set((s) => {
      if (s.currentIndex < 0) {
        return { queue: [], _shuffleIndices: [], _shuffleIdx: -1 }
      }
      const current = s.queue[s.currentIndex]
      return {
        queue: current ? [current] : [],
        currentIndex: current ? 0 : -1,
        _shuffleIndices: [],
        _shuffleIdx: -1,
      }
    })
  },

  setOfflineMode: (enabled) => set({ isOfflineMode: enabled }),

  reset: async () => {
    const s = get()
    if (s._sound) {
      try {
        s._sound.setOnPlaybackStatusUpdate(null)
        await s._sound.stopAsync()
        await s._sound.unloadAsync()
      } catch {}
    }
    set({
      ...DEFAULT_PLAYER_STATE,
      _sound: null,
      _boundStatus: false,
      _isProcessingAction: false,
      _shuffleIndices: [],
      _shuffleIdx: -1,
    })
  },
}))

export function useCurrentTrack(): Track | null {
  return useMobilePlayer((s) => s.currentTrack)
}

export function useIsPlaying(): boolean {
  return useMobilePlayer((s) => s.playbackState === 'playing' || s.playbackState === 'buffering')
}

export function usePlaybackProgress() {
  return useMobilePlayer((s) => ({
    current: s.currentTime,
    duration: s.duration,
    pct: s.duration > 0 ? Math.min(1, s.currentTime / s.duration) : 0,
  }))
}

export async function downloadTrackForOffline(
  track: Track,
  quality: 'STANDARD' | 'HIGH' = 'STANDARD',
  onProgress?: (pct: number) => void,
): Promise<{ localUri: string; size: Bytes }> {
  const baseDir = FileSystem.cacheDirectory || FileSystem.documentDirectory || ''
  const dir = `${baseDir}gansuni/downloads/`
  await FileSystem.makeDirectoryAsync(dir, { intermediates: true })

  const ext = track.audioUrl.split('?')[0]!.split('.').pop() || 'mp3'
  const localUri = `${dir}${track.id}.${ext}`

  const dl = FileSystem.createDownloadResumable(track.audioUrl, localUri, {}, (d) => {
    if (d.totalBytesExpectedToWrite > 0 && onProgress) {
      onProgress(d.totalBytesWritten / d.totalBytesExpectedToWrite)
    }
  })

  const result = await dl.downloadAsync()
  if (!result) throw new Error('Download failed')

  const info = await FileSystem.getInfoAsync(localUri)
  const size: Bytes = (info as any)?.size || 0

  const state = useMobilePlayer.getState()
  state._downloads.set(track.id, { localUri, size, quality })

  return { localUri, size }
}

export async function removeDownloadedTrack(trackId: string): Promise<void> {
  const state = useMobilePlayer.getState()
  const dl = state._downloads.get(trackId)
  if (dl) {
    try {
      await FileSystem.deleteAsync(dl.localUri, { idempotent: true })
    } catch {}
    state._downloads.delete(trackId)
  }
}

export function isTrackDownloaded(trackId: string): boolean {
  return useMobilePlayer.getState()._downloads.has(trackId)
}
