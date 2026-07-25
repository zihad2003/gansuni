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

const FALLBACK_AUDIO_URLS = [
  'https://commondatastorage.googleapis.com/codeskulptor-demos/DinoJazz.mp3',
  'https://codeskulptor-demos.commondatastorage.googleapis.com/desolation.mp3',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
]

interface InternalState {
  likedTrackIds: string[]
  toggleLikeTrack: (trackId: string) => void
  isLiked: (trackId: string) => boolean
  _audioEl: HTMLAudioElement | null
  _boundEvents: boolean
  _shuffleIndices: number[]
  _shuffleIdx: number
  _ensureAudio: () => HTMLAudioElement
  _bindAudioEvents: () => void
}

export const useAudioPlayer = create<PlayerSlice & InternalState>((set, get) => ({
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
  _audioEl: null,

  _boundEvents: false,
  _shuffleIndices: [],
  _shuffleIdx: -1,

  _ensureAudio(): HTMLAudioElement {
    if (typeof window === 'undefined') return null as any
    const cur = get()._audioEl
    if (cur) return cur
    const el = new Audio()
    el.preload = 'auto'
    set({ _audioEl: el, _boundEvents: false })
    get()._bindAudioEvents()
    return el
  },

  _bindAudioEvents() {
    const st = get()
    if (st._boundEvents || !st._audioEl) return
    const audio = st._audioEl

    audio.addEventListener('loadedmetadata', () => {
      set({ duration: (audio.duration || 0) * 1000 })
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

    audio.addEventListener('ended', () => {
      const s = get()
      if (s.repeat === 'one') {
        s.seekTo(0)
        s.resume()
      } else {
        s.next()
      }
    })

    audio.addEventListener('error', () => {
      const err = audio.error
      console.warn('Audio playback error:', err?.message)
    })

    set({ _boundEvents: true })
  },

  play: async (track?: Track, queue?: QueueItem[], startIndex = 0) => {
    const state = get()
    const audio = state._ensureAudio()
    if (!audio) return

    set({ error: null })

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

      set({
        queue: finalQueue,
        currentIndex: resolvedIdx,
        currentTrack: track,
        playbackState: 'loading',
        currentTime: 0,
        duration: track.durationMs || 180000,
        _shuffleIndices: shuffleIndices,
        _shuffleIdx: 0,
      })

      const targetUrl = track.audioUrl || FALLBACK_AUDIO_URLS[0]!
      audio.src = targetUrl
      audio.currentTime = 0
      audio.volume = state.muted ? 0 : clampVolume(state.volume)
      audio.playbackRate = clampSpeed(state.speed)

      try {
        audio.load()
        await audio.play()
        set({ playbackState: 'playing', error: null })
      } catch (e: any) {
        console.warn('Primary audio.play failed, attempting fallback MP3 stream:', e)
        try {
          const fallbackUrl = FALLBACK_AUDIO_URLS[Math.abs(track.id.length) % FALLBACK_AUDIO_URLS.length]!
          audio.src = fallbackUrl
          audio.load()
          await audio.play()
          set({ playbackState: 'playing', error: null })
        } catch (err2: any) {
          set({ playbackState: 'paused', error: 'Click Play again to start audio' })
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
        try {
          const fallbackUrl = FALLBACK_AUDIO_URLS[0]!
          audio.src = fallbackUrl
          audio.load()
          await audio.play()
          set({ playbackState: 'playing', error: null })
        } catch (err: any) {
          set({ playbackState: 'paused' })
        }
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
    set({ ...DEFAULT_PLAYER_STATE, currentTrack: null, queue: [], playbackState: 'idle' })
  },
}))
