'use client'

import { create } from 'zustand'
import {
  DEFAULT_PLAYER_STATE,
  clampVolume,
  clampSpeed,
  shuffleArray,
  type PlayerActions,
  type PlayerState,
  type QueueItem,
  type RepeatMode,
} from '@gansuni/shared'
import type { Track } from '@gansuni/shared'

type PlayerSlice = PlayerState & PlayerActions



interface InternalState {
  likedTrackIds: string[]
  likedTracks: Track[]
  playedHistory: Track[]
  toggleLikeTrack: (trackObj: Track | string) => void
  isLiked: (trackId: string) => boolean
  _audioEl: HTMLAudioElement | null
  _boundEvents: boolean
  _shuffleIndices: number[]
  _shuffleIdx: number
  _ensureAudio: () => HTMLAudioElement
  _bindAudioEvents: () => void
  _resolveAudioUrl: (track: Track) => Promise<string>
  _retryCount: number
}

const MAX_RETRIES = 3
const STREAM_API = '/api/stream'

export const useAudioPlayer = create<PlayerSlice & InternalState>((set, get) => ({
  ...DEFAULT_PLAYER_STATE,
  likedTrackIds: [],
  likedTracks: [],
  playedHistory: [],
  toggleLikeTrack: (trackObj: Track | string) => {
    set((s) => {
      const targetTrack: Track | undefined =
        typeof trackObj === 'string'
          ? (s.currentTrack?.id === trackObj
              ? s.currentTrack
              : s.playedHistory.find((t) => t.id === trackObj) || s.queue.find((q) => q.trackId === trackObj)?.track)
          : trackObj

      const targetId = typeof trackObj === 'string' ? trackObj : trackObj?.id

      if (!targetId) return s

      const exists = s.likedTrackIds.includes(targetId)
      const nextIds = exists
        ? s.likedTrackIds.filter((id) => id !== targetId)
        : [...s.likedTrackIds, targetId]

      const nextTracks = exists
        ? s.likedTracks.filter((t) => t.id !== targetId)
        : targetTrack
        ? [targetTrack, ...s.likedTracks.filter((t) => t.id !== targetId)]
        : s.likedTracks

      return { likedTrackIds: nextIds, likedTracks: nextTracks }
    })
  },
  isLiked: (trackId: string) => get().likedTrackIds.includes(trackId),
  _audioEl: null,
  isSeeking: false,

  _boundEvents: false,
  _shuffleIndices: [],
  _shuffleIdx: -1,
  _retryCount: 0,

  _ensureAudio(): HTMLAudioElement {
    if (typeof window === 'undefined') return null as any
    const cur = get()._audioEl
    if (cur) return cur
    const el = new Audio()
    el.preload = 'auto'
    el.crossOrigin = 'anonymous'
    set({ _audioEl: el, _boundEvents: false })
    get()._bindAudioEvents()
    return el
  },

  _bindAudioEvents() {
    const st = get()
    if (st._boundEvents || !st._audioEl) return
    const audio = st._audioEl

    audio.addEventListener('loadedmetadata', () => {
      set({ duration: (audio.duration || 0) * 1000, playbackState: 'loading' })
    })

    audio.addEventListener('timeupdate', () => {
      if (!get().isSeeking) {
        set({ currentTime: (audio.currentTime || 0) * 1000 })
      }
    })

    audio.addEventListener('play', () => {
      set({ playbackState: 'playing', error: null })
    })

    audio.addEventListener('playing', () => {
      set({ playbackState: 'playing', error: null })
    })

    audio.addEventListener('pause', () => {
      const s = get()
      if (s.playbackState !== 'error') {
        set({ playbackState: 'paused' })
      }
    })

    audio.addEventListener('waiting', () => {
      set({ playbackState: 'buffering' })
    })

    audio.addEventListener('stalled', () => {
      set({ playbackState: 'buffering' })
    })

    audio.addEventListener('suspend', () => {
      set({ playbackState: 'buffering' })
    })

    audio.addEventListener('ended', () => {
      const s = get()
      if (s.repeat === 'one') {
        s.seekTo(0)
        s.resume()
      } else {
        s.next()
      }
    })

    audio.addEventListener('error', async () => {
      const s = get()
      const err = audio.error
      console.warn('Audio playback error:', err?.message, err?.code)
      if (s._retryCount < MAX_RETRIES && s.currentTrack) {
        const nextRetry = s._retryCount + 1
        set({ _retryCount: nextRetry, playbackState: 'loading', error: `Retrying stream (${nextRetry}/${MAX_RETRIES})...` })
        try {
          const resolvedUrl = await s._resolveAudioUrl(s.currentTrack)
          audio.src = resolvedUrl
          await audio.play()
          set({ playbackState: 'playing', error: null, _retryCount: 0 })
        } catch {
          set({ playbackState: 'error', error: 'Stream resolution failed. Click retry.' })
        }
      } else {
        set({ playbackState: 'error', error: 'Playback failed. Click retry or skip.' })
      }
    })

    set({ _boundEvents: true })
  },

  _resolveAudioUrl: async (track: Track): Promise<string> => {
    const videoId = track.youtubeId || track.id
    const res = await fetch(
      `${STREAM_API}?videoId=${encodeURIComponent(videoId)}&q=${encodeURIComponent(track.title + ' ' + (track.artist?.name || ''))}`,
      { signal: AbortSignal.timeout(10000) }
    )
    if (!res.ok) throw new Error(`Stream API returned ${res.status}`)
    const data = await res.json()
    if (data?.audioUrl) {
      set({ error: null })
      return data.audioUrl.replace(/^http:/i, 'https:')
    }
    throw new Error(data?.error || 'No audio URL in stream response')
  },

  play: async (track?: Track, queue?: QueueItem[], startIndex = 0) => {
    const state = get()
    const audio = state._ensureAudio()
    if (!audio) return

    set({ error: null, _retryCount: 0 })

    if (track && state.currentTrack && state.currentTrack.id === track.id) {
      if (state.playbackState === 'playing' || state.playbackState === 'buffering') {
        get().pause()
        return
      } else {
        get().resume()
        return
      }
    }

    const willPlayNewTrack =
      track && (!state.currentTrack || state.currentTrack.id !== track.id)

    if (willPlayNewTrack && track) {
      const finalQueue =
        queue || (state.currentTrack
          ? state.queue
          : [{ trackId: track.id, track }])
      const idx = queue ? startIndex : finalQueue.findIndex((q) => q.trackId === track.id)
      const resolvedIdx = idx >= 0 ? idx : 0

      const shuffled = state.shuffle
        ? shuffleArray(
            finalQueue.map((_, i) => i).filter((i) => i !== resolvedIdx),
          )
        : []
      const shuffleIndices = state.shuffle ? [resolvedIdx, ...shuffled] : []

      set((s) => ({
        queue: finalQueue,
        currentIndex: resolvedIdx,
        currentTrack: track,
        playbackState: 'loading',
        currentTime: 0,
        duration: track.durationMs || 180000,
        _shuffleIndices: shuffleIndices,
        _shuffleIdx: 0,
        playedHistory: [track, ...s.playedHistory.filter((t) => t.id !== track.id)].slice(0, 50),
      }))

      let targetUrl = track.audioUrl || ''
      if (!targetUrl || targetUrl.startsWith('/api/stream') || targetUrl.includes('/api/stream')) {
        try {
          targetUrl = await get()._resolveAudioUrl(track)
        } catch (e: any) {
          set({ playbackState: 'error', error: 'Audio stream unavailable for this track.' })
          return
        }
      }
      if (targetUrl.startsWith('http:')) {
        targetUrl = targetUrl.replace(/^http:/i, 'https:')
      }
      audio.src = targetUrl
      audio.currentTime = 0
      audio.volume = state.muted ? 0 : clampVolume(state.volume)
      audio.playbackRate = clampSpeed(state.speed)

      try {
        await audio.play()
        set({ playbackState: 'playing', error: null, _retryCount: 0 })
      } catch (e: any) {
        console.warn('Primary audio.play failed, retrying:', e)
        try {
          const resolvedUrl = await get()._resolveAudioUrl(track)
          audio.src = resolvedUrl
          await audio.play()
          set({ playbackState: 'playing', error: null, _retryCount: 0 })
        } catch (err2: any) {
          set({ playbackState: 'error', error: 'Audio stream playback failed. Click retry or try another track.' })
        }
      }
      return
    }

    if (state.currentTrack && audio.src) {
      try {
        audio.volume = state.muted ? 0 : clampVolume(state.volume)
        audio.playbackRate = clampSpeed(get().speed)
        await audio.play()
        set({ playbackState: 'playing', error: null })
      } catch (e: any) {
        set({ playbackState: 'error', error: 'Stream playback failed.' })
      }
    }
  },

  resume: async () => {
    const s = get()
    const audio = s._ensureAudio()
    if (!audio) return
    try {
      audio.volume = s.muted ? 0 : clampVolume(s.volume)
      await audio.play()
      set({ playbackState: 'playing', error: null })
    } catch (e) {
      console.warn('Resume error:', e)
    }
  },

  pause: () => {
    const audio = get()._audioEl
    if (audio && !audio.paused) {
      audio.pause()
      set({ playbackState: 'paused' })
    }
  },

  togglePlay: () => {
    const s = get()
    const audio = s._audioEl
    if (!audio || !s.currentTrack) return
    if (audio.paused) {
      s.play()
    } else {
      s.pause()
    }
  },

  next: () => {
    const s = get()
    if (s.queue.length === 0) return

    let nextIndex = 0
    if (s.shuffle && s._shuffleIndices.length > 0) {
      const curIdx = s._shuffleIdx
      const nextShuffleIdx = (curIdx + 1) % s._shuffleIndices.length
      nextIndex = s._shuffleIndices[nextShuffleIdx] ?? 0
      set({ _shuffleIdx: nextShuffleIdx })
    } else {
      if (s.currentIndex >= s.queue.length - 1) {
        if (s.repeat === 'all') {
          nextIndex = 0
        } else {
          s.pause()
          set({ currentTime: 0, playbackState: 'paused' })
          return
        }
      } else {
        nextIndex = s.currentIndex + 1
      }
    }

    const nextItem = s.queue[nextIndex]
    if (nextItem && nextItem.track) {
      s.play(nextItem.track, s.queue, nextIndex)
    }
  },

  previous: () => {
    const s = get()
    if (s.queue.length === 0) return

    if (s.currentTime > 3000) {
      s.seekTo(0)
      return
    }

    let prevIndex = 0
    if (s.shuffle && s._shuffleIndices.length > 0) {
      const curIdx = s._shuffleIdx
      const prevShuffleIdx =
        (curIdx - 1 + s._shuffleIndices.length) % s._shuffleIndices.length
      prevIndex = s._shuffleIndices[prevShuffleIdx] ?? 0
      set({ _shuffleIdx: prevShuffleIdx })
    } else {
      if (s.currentIndex <= 0) {
        prevIndex = s.repeat === 'all' ? s.queue.length - 1 : 0
      } else {
        prevIndex = s.currentIndex - 1
      }
    }

    const prevItem = s.queue[prevIndex]
    if (prevItem && prevItem.track) {
      s.play(prevItem.track, s.queue, prevIndex)
    }
  },

  seekTo: (ms: number) => {
    const audio = get()._audioEl
    if (audio) {
      const sec = ms / 1000
      audio.currentTime = sec
      set({ currentTime: ms })
    }
  },

  setVolume: (volume: number) => {
    const audio = get()._audioEl
    const v = clampVolume(volume)
    if (audio) {
      audio.volume = get().muted ? 0 : v
    }
    set({ volume: v, muted: false })
  },

  toggleMute: () => {
    const s = get()
    const nextMuted = !s.muted
    const audio = s._audioEl
    if (audio) {
      audio.volume = nextMuted ? 0 : clampVolume(s.volume)
    }
    set({ muted: nextMuted })
  },

  setRepeat: (mode: RepeatMode) => {
    set({ repeat: mode })
  },

  toggleRepeat: () => {
    const current = get().repeat
    const nextMode: RepeatMode = current === 'off' ? 'all' : current === 'all' ? 'one' : 'off'
    set({ repeat: nextMode })
  },

  toggleShuffle: () => {
    const s = get()
    const nextShuffle = !s.shuffle
    if (nextShuffle && s.queue.length > 0) {
      const curIdx = s.currentIndex
      const shuffled = shuffleArray(
        s.queue.map((_, i) => i).filter((i) => i !== curIdx),
      )
      set({
        shuffle: true,
        _shuffleIndices: [curIdx, ...shuffled],
        _shuffleIdx: 0,
      })
    } else {
      set({ shuffle: false, _shuffleIndices: [], _shuffleIdx: -1 })
    }
  },

  setSpeed: (speed: number) => {
    const spd = clampSpeed(speed)
    const audio = get()._audioEl
    if (audio) {
      audio.playbackRate = spd
    }
    set({ speed: spd })
  },

  addToQueue: (track: Track | QueueItem) => {
    set((s) => {
      const item: QueueItem = 'id' in track ? { trackId: track.id, track } : track
      return { queue: [...s.queue, item] }
    })
  },

  addNextInQueue: (track: Track | QueueItem) => {
    set((s) => {
      const item: QueueItem = 'id' in track ? { trackId: track.id, track } : track
      const q = [...s.queue]
      q.splice(s.currentIndex + 1, 0, item)
      return { queue: q }
    })
  },

  removeFromQueue: (index: number) => {
    set((s) => {
      const q = [...s.queue]
      q.splice(index, 1)
      let nextIndex = s.currentIndex
      if (index < s.currentIndex) nextIndex -= 1
      return { queue: q, currentIndex: Math.max(0, nextIndex) }
    })
  },

  reorderQueue: (fromIndex: number, toIndex: number) => {
    set((s) => {
      const q = [...s.queue]
      const [moved] = q.splice(fromIndex, 1)
      if (moved) q.splice(toIndex, 0, moved)
      return { queue: q }
    })
  },

  clearQueue: () => {
    set({ queue: [], currentIndex: -1, currentTrack: null })
  },

  setOfflineMode: (enabled: boolean) => {
    set({ isOfflineMode: enabled })
  },

  reset: () => {
    const audio = get()._audioEl
    if (audio) {
      audio.pause()
      audio.src = ''
    }
    set({ ...DEFAULT_PLAYER_STATE, currentTrack: null, queue: [], playbackState: 'idle', _retryCount: 0 })
  },
}))
