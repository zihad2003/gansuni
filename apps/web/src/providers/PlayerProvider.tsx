'use client'

import { useEffect, type ReactNode } from 'react'
import { useAudioPlayer } from '@/store/useAudioPlayer'
import { useTheme } from '@/providers/ThemeProvider'
import { AmbientBackground } from '@/components/AmbientBackground'
import { MiniPlayer } from '@/components/player/MiniPlayer'

import { MobileBottomNav } from '@/components/MobileBottomNav'

interface PlayerProviderProps {
  children: ReactNode
}

export function PlayerProvider({ children }: PlayerProviderProps): ReactNode {
  const currentTrack = useAudioPlayer((s) => s.currentTrack)
  const { setSourceImage } = useTheme()

  useEffect(() => {
    const cover =
      currentTrack?.album?.coverArtUrl ??
      (currentTrack as any)?.albumCoverArtUrl ??
      null
    setSourceImage(cover)
  }, [currentTrack, setSourceImage])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const isEditing =
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target as HTMLElement)?.isContentEditable
      if (isEditing) return

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
            ms.metadata = new MediaMetadata({
              title: s.currentTrack.title,
              artist: s.currentTrack.artist?.name ?? '',
              album: s.currentTrack.album?.title ?? '',
              artwork: s.currentTrack.album?.coverArtUrl
                ? [
                    {
                      src: s.currentTrack.album.coverArtUrl,
                      sizes: '512x512',
                      type: 'image/jpeg',
                    },
                  ]
                : [],
            })
            ms.playbackState =
              s.playbackState === 'playing' ? 'playing' : 'paused'
            ms.setActionHandler('play', () => s.play())
            ms.setActionHandler('pause', () => s.pause())
            ms.setActionHandler('nexttrack', () => s.next())
            ms.setActionHandler('previoustrack', () => s.previous())
            ms.setActionHandler('seekto', (d) => s.seekTo((d.seekTime ?? 0) * 1000))
            ms.setActionHandler('seekforward', (d) =>
              s.seekTo(s.currentTime + (d.seekOffset ?? 10) * 1000),
            )
            ms.setActionHandler('seekbackward', (d) =>
              s.seekTo(Math.max(0, s.currentTime - (d.seekOffset ?? 10) * 1000)),
            )
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
