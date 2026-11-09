'use client'

import { useEffect, type ReactNode } from 'react'
import { useAudioPlayer } from '@/store/useAudioPlayer'
import { useTheme } from '@/providers/ThemeProvider'
import { AmbientBackground } from '@/components/AmbientBackground'
import { MiniPlayer } from '@/components/player/MiniPlayer'
import { refreshStoredTracks } from '@/lib/localLibrary'
import { migrateLegacyPlayer, playerStorageKey } from '@/lib/account'
import { MobileBottomNav } from '@/components/MobileBottomNav'

interface PlayerProviderProps {
  children: ReactNode
}

export function PlayerProvider({ children }: PlayerProviderProps): ReactNode {
  const currentTrack = useAudioPlayer((s) => s.currentTrack)
  const playbackState = useAudioPlayer((s) => s.playbackState)
  const { setSourceImage } = useTheme()

  useEffect(() => {
    const cover =
      currentTrack?.album?.coverArtUrl ??
      (currentTrack as any)?.albumCoverArtUrl ??
      null
    setSourceImage(cover)
  }, [currentTrack, setSourceImage])

  useEffect(() => {
    migrateLegacyPlayer()
    let key = playerStorageKey()
    let prevSig = ''

    const apply = (raw: string | null) => {
      let saved: any = {}
      try {
        saved = raw ? JSON.parse(raw) : {}
      } catch {
        saved = {}
      }
      const likedTracks = Array.isArray(saved.likedTracks) ? saved.likedTracks : []
      const playedHistory = Array.isArray(saved.playedHistory) ? saved.playedHistory : []
      const volume = typeof saved.volume === 'number' ? saved.volume : 0.8
      const muted = !!saved.muted
      const repeat = saved.repeat === 'all' || saved.repeat === 'one' ? saved.repeat : 'off'
      const shuffle = !!saved.shuffle
      prevSig = [
        (saved.likedTrackIds || []).join(','),
        playedHistory.map((t: { id: string }) => t.id).join(','),
        volume,
        muted,
        repeat,
        shuffle,
      ].join('|')
      useAudioPlayer.setState({
        likedTrackIds: Array.isArray(saved.likedTrackIds) ? saved.likedTrackIds : [],
        likedTracks,
        playedHistory,
        volume,
        muted,
        repeat,
        shuffle,
      })
      void Promise.all([refreshStoredTracks(likedTracks), refreshStoredTracks(playedHistory)]).then(
        ([nextLiked, nextHistory]) => {
          useAudioPlayer.setState({ likedTracks: nextLiked, playedHistory: nextHistory })
        },
      )
      const audio = useAudioPlayer.getState()._ensureAudio()
      if (audio) audio.volume = muted ? 0 : volume
    }

    apply(localStorage.getItem(key))

    const onAccount = () => {
      key = playerStorageKey()
      apply(localStorage.getItem(key))
    }
    window.addEventListener('gansuni-account', onAccount)

    const unsubPersist = useAudioPlayer.subscribe((state) => {
      const sig = [
        state.likedTrackIds.join(','),
        state.playedHistory.map((t) => t.id).join(','),
        state.volume,
        state.muted,
        state.repeat,
        state.shuffle,
      ].join('|')
      if (sig === prevSig) return
      prevSig = sig
      try {
        localStorage.setItem(
          key,
          JSON.stringify({
            likedTrackIds: state.likedTrackIds,
            likedTracks: state.likedTracks,
            playedHistory: state.playedHistory,
            volume: state.volume,
            muted: state.muted,
            repeat: state.repeat,
            shuffle: state.shuffle,
          }),
        )
      } catch {}
    })
    return () => {
      unsubPersist()
      window.removeEventListener('gansuni-account', onAccount)
    }
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const isEditing =
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target as HTMLElement)?.isContentEditable
      if (isEditing) return
      if (e.target instanceof HTMLButtonElement || e.target instanceof HTMLAnchorElement || e.target instanceof HTMLSelectElement) {
        return
      }

      const player = useAudioPlayer.getState()

      switch (e.code) {
        case 'Space':
          e.preventDefault()
          player.togglePlay()
          break
        case 'ArrowRight':
          if (e.shiftKey) {
            player.next()
          } else {
            player.seekTo(player.currentTime + 5000)
          }
          break
        case 'ArrowLeft':
          if (e.shiftKey) {
            player.previous()
          } else {
            player.seekTo(Math.max(0, player.currentTime - 5000))
          }
          break
        case 'ArrowUp':
          e.preventDefault()
          player.setVolume(player.volume + 0.05)
          break
        case 'ArrowDown':
          e.preventDefault()
          player.setVolume(player.volume - 0.05)
          break
        case 'KeyM':
          player.toggleMute()
          break
        case 'KeyS':
          player.toggleShuffle()
          break
        case 'KeyR':
          player.toggleRepeat()
          break
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    let prevKey = ''
    const unsub = useAudioPlayer.subscribe((state) => {
      const key = `${state.currentTrack?.id ?? ''}|${state.playbackState}|${Math.floor(state.currentTime / 5000)}`
      if (key === prevKey) return
      prevKey = key
      try {
        const s = useAudioPlayer.getState()
        if (s.currentTrack && s.currentTrack.id && typeof navigator !== 'undefined') {
          if ('mediaSession' in navigator) {
            const ms = navigator.mediaSession
            const artwork = s.currentTrack.album?.coverArtUrl
              ? [
                  {
                    src: s.currentTrack.album.coverArtUrl,
                    sizes: '512x512',
                    type: 'image/jpeg',
                  },
                  {
                    src: s.currentTrack.album.coverArtUrl,
                    sizes: '192x192',
                    type: 'image/jpeg',
                  },
                ]
              : []

            ms.metadata = new MediaMetadata({
              title: s.currentTrack.title,
              artist: s.currentTrack.artist?.name ?? '',
              album: s.currentTrack.album?.title ?? '',
              artwork,
            })

            const isActive = s.playbackState === 'playing' || s.playbackState === 'buffering'
            ms.playbackState = isActive ? 'playing' : 'paused'

            ms.setActionHandler('play', () => s.resume())
            ms.setActionHandler('pause', () => s.pause())
            ms.setActionHandler('stop', () => s.reset())
            ms.setActionHandler('nexttrack', () => s.next())
            ms.setActionHandler('previoustrack', () => s.previous())
            ms.setActionHandler('seekto', (d) => s.seekTo((d.seekTime ?? 0) * 1000))
            ms.setActionHandler('seekforward', (d) =>
              s.seekTo(s.currentTime + (d.seekOffset ?? 10) * 1000),
            )
            ms.setActionHandler('seekbackward', (d) =>
              s.seekTo(Math.max(0, s.currentTime - (d.seekOffset ?? 10) * 1000)),
            )

            if ('setPositionState' in ms) {
              try {
                ;(ms as any).setPositionState({
                  duration: (s.duration || 0) / 1000,
                  playbackRate: s.speed,
                  position: (s.currentTime || 0) / 1000,
                })
              } catch {}
            }
          }
        }
      } catch {}
    })
    return () => unsub()
  }, [])

  return (
    <>
      <AmbientBackground />
      <div className="flex flex-col min-h-screen">
        <main className="flex-1 pb-40 sm:pb-32">{children}</main>
        <MiniPlayer />
        <MobileBottomNav />
      </div>
    </>
  )
}
