import React, { type ReactNode, useEffect } from 'react'
import { useMobilePlayer, useCurrentTrack } from '@/store/useMobilePlayer'
import { useTheme } from '@/providers/ThemeProvider'
import { AmbientBackground } from '@/components/AmbientBackground'
import { MiniPlayer } from '@/components/player/MiniPlayer'
import { router } from 'expo-router'

interface PlayerProviderProps {
  children: ReactNode
}

export function PlayerProvider({ children }: PlayerProviderProps) {
  const currentTrack = useCurrentTrack()
  const { setSourceImage } = useTheme()
  const playbackState = useMobilePlayer((s) => s.playbackState)

  useEffect(() => {
    const cover =
      currentTrack?.album?.coverArtUrl ??
      (currentTrack as any)?.albumCoverArtUrl ??
      null
    setSourceImage(cover)
  }, [currentTrack, setSourceImage])

  useEffect(() => {
    try {
      const unsub = useMobilePlayer.subscribe(
        (s) => ({
          ct: s.currentTrack,
          ps: s.playbackState,
        }),
        () => {
          // NOTE: react-native-track-player handles lockscreen controls separately
          // Here we set basic NowPlaying info for older APIs
        },
      )
      return () => unsub()
    } catch {}
  }, [])

  return (
    <>
      <AmbientBackground />
      {children}
      {currentTrack && <MiniPlayer onPress={() => router.push('/player')} />}
    </>
  )
}
