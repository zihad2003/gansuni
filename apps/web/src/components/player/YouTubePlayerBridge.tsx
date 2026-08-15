'use client'

import { useEffect, useRef } from 'react'
import { useAudioPlayer } from '@/store/useAudioPlayer'

declare global {
  interface Window {
    onYouTubeIframeAPIReady?: () => void
    YT?: any
  }
}

export function YouTubePlayerBridge(): JSX.Element {
  const playerRef = useRef<any>(null)
  const isReadyRef = useRef<boolean>(false)
  const intervalRef = useRef<any>(null)
  const lastSeekRef = useRef<number | null>(null)

  const currentTrack = useAudioPlayer((s) => s.currentTrack)
  const playbackState = useAudioPlayer((s) => s.playbackState)
  const volume = useAudioPlayer((s) => s.volume)
  const muted = useAudioPlayer((s) => s.muted)
  const seekTargetMs = useAudioPlayer((s) => (s as any)._seekTargetMs)

  // 1. Load YouTube IFrame API Script
  useEffect(() => {
    if (typeof window === 'undefined') return

    if (window.YT && window.YT.Player) {
      initPlayer()
      return
    }

    const tag = document.createElement('script')
    tag.src = 'https://www.youtube.com/iframe_api'
    const firstScriptTag = document.getElementsByTagName('script')[0]
    firstScriptTag?.parentNode?.insertBefore(tag, firstScriptTag)

    window.onYouTubeIframeAPIReady = () => {
      initPlayer()
    }

    function initPlayer() {
      if (playerRef.current) return
      playerRef.current = new window.YT.Player('yt-hidden-audio-player', {
        height: '100%',
        width: '100%',
        playerVars: {
          autoplay: 1,
          controls: 0,
          disablekb: 1,
          fs: 0,
          playsinline: 1,
          rel: 0,
          modestbranding: 1,
        },
        events: {
          onReady: () => {
            isReadyRef.current = true
            if (typeof window !== 'undefined') {
              (window as any).__ytPlayer = playerRef.current
            }
            const s = useAudioPlayer.getState()
            const vId =
              s.currentTrack?.youtubeId ||
              (s.currentTrack?.id?.startsWith('yt_') ? s.currentTrack.id.replace(/^yt_/, '') : null)

            if (vId && playerRef.current) {
              try {
                playerRef.current.loadVideoById(vId)
                if (s.playbackState === 'playing') {
                  playerRef.current.playVideo()
                }
              } catch (e) {
                console.warn('onReady playback error:', e)
              }
            }
          },
          onStateChange: (event: any) => {
            const YTState = window.YT.PlayerState
            if (event.data === YTState.ENDED) {
              useAudioPlayer.getState().next()
            } else if (event.data === YTState.PLAYING) {
              useAudioPlayer.setState({ playbackState: 'playing', error: null })
            } else if (event.data === YTState.PAUSED) {
              const current = useAudioPlayer.getState().playbackState
              if (current === 'playing') {
                useAudioPlayer.setState({ playbackState: 'paused' })
              }
            } else if (event.data === YTState.BUFFERING) {
              useAudioPlayer.setState({ playbackState: 'loading' })
            }
          },
          onError: () => {
            console.warn('YouTube Player error, trying next track...')
            useAudioPlayer.setState({ playbackState: 'error', error: 'Playback error on YouTube track.' })
          },
        },
      })
      if (typeof window !== 'undefined') {
        (window as any).__ytPlayer = playerRef.current
      }
    }
  }, [])

  // 2. Track & Playback State Sync
  useEffect(() => {
    if (!currentTrack) return

    const videoId =
      currentTrack.youtubeId ||
      (currentTrack.id?.startsWith('yt_') ? currentTrack.id.replace(/^yt_/, '') : null)

    if (videoId && isReadyRef.current && playerRef.current) {
      try {
        const p = playerRef.current
        const currVid = p.getVideoData ? p.getVideoData()?.video_id : null

        if (currVid !== videoId) {
          p.loadVideoById(videoId)
        }

        if (playbackState === 'playing') {
          p.playVideo()
        } else if (playbackState === 'paused') {
          p.pauseVideo()
        }

        p.setVolume(muted ? 0 : Math.round(volume * 100))
      } catch (e) {
        console.warn('YT Player control error:', e)
      }
    }
  }, [currentTrack, playbackState, volume, muted])

  // 3. Seeking Listener
  useEffect(() => {
    if (seekTargetMs != null && seekTargetMs !== lastSeekRef.current && isReadyRef.current && playerRef.current) {
      lastSeekRef.current = seekTargetMs
      try {
        const sec = seekTargetMs / 1000
        playerRef.current.seekTo(sec, true)
      } catch (e) {
        console.warn('YT seekTo error:', e)
      }
    }
  }, [seekTargetMs])

  // 4. Time Update Poller (250ms for smooth progress bar tracking)
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      if (!isReadyRef.current || !playerRef.current) return
      const s = useAudioPlayer.getState()
      const isYTTrack =
        s.currentTrack?.youtubeId || s.currentTrack?.id?.startsWith('yt_')

      if (isYTTrack && s.playbackState === 'playing') {
        try {
          const p = playerRef.current
          if (p.getCurrentTime && p.getDuration) {
            const cur = Math.round(p.getCurrentTime() * 1000)
            const dur = Math.round(p.getDuration() * 1000)
            if (dur > 0) {
              useAudioPlayer.setState({ currentTime: cur, duration: dur })
            }
          }
        } catch {}
      }
    }, 250)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  return (
    <div className="fixed bottom-0 right-0 w-4 h-4 pointer-events-none opacity-10 overflow-hidden z-0">
      <div id="yt-hidden-audio-player" className="w-full h-full" />
    </div>
  )
}
