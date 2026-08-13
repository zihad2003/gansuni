import { NextRequest, NextResponse } from 'next/server'
import ytdl from '@distube/ytdl-core'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

const PIPED_INSTANCES = [
  'https://pipedapi.adminforge.de',
  'https://pipedapi.mha.fi',
  'https://pipedapi.kavin.rocks',
  'https://api.piped.privacydev.net',
]

const INVIDIOUS_INSTANCES = [
  'https://inv.nadeko.net',
  'https://invidious.drgns.space',
  'https://inv.tux.pizza',
  'https://invidious.nerdvpn.de',
  'https://yewtu.be',
  'https://invidious.flokinet.to',
]

const FALLBACK_AUDIO_URLS: Record<string, string> = {
  '6w97fN5c44E': 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3',
  'l1m4E-s1t8Y': 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3',
  'QG802l6XUCA': 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a73467.mp3',
  'aJ-LgJc5v_s': 'https://cdn.pixabay.com/download/audio/2022/10/14/audio_9939f7922f.mp3',
  'jR_5908N3kE': 'https://cdn.pixabay.com/download/audio/2021/08/09/audio_884325752c.mp3',
}

function cleanSearchQuery(raw: string) {
  return raw
    .replace(/\[.*?\]|\(.*?\)/g, '')
    .replace(/official\s*(music\s*video|video|audio|lyric\s*video|lyrical)?/gi, '')
    .replace(/\b(hd|4k|1080p|full\s*song|remix|cover|prod\b)/gi, '')
    .replace(/\s+/g, ' ')
    .trim()
}

async function tryYtdlStream(videoId: string) {
  try {
    const info = await ytdl.getInfo(videoId, {
      requestOptions: {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
      },
    })
    const audioFormats = ytdl.filterFormats(info.formats, 'audioonly')
    if (audioFormats.length > 0) {
      audioFormats.sort((a, b) => (b.bitrate || 0) - (a.bitrate || 0))
      const best = audioFormats[0]
      if (best?.url) {
        return {
          title: info.videoDetails.title || 'YouTube Audio',
          artist: info.videoDetails.author?.name || 'YouTube Artist',
          durationMs: parseInt(info.videoDetails.lengthSeconds || '210', 10) * 1000,
          audioUrl: best.url,
          quality: `${best.bitrate || 128}kbps`,
          source: 'ytdl-core',
        }
      }
    }
  } catch (err: any) {
    console.warn(`ytdl-core failed for ${videoId}:`, err?.message)
  }
  return null
}

async function tryInvidiousStream(baseUrl: string, videoId: string) {
  const streamUrl = `${baseUrl}/api/v1/videos/${videoId}?fields=title,author,lengthSeconds,adaptiveFormats`
  const res = await fetch(streamUrl, {
    headers: { Accept: 'application/json' },
    signal: AbortSignal.timeout(5000),
  })
  if (!res.ok) throw new Error(`Invidious ${baseUrl} returned ${res.status}`)
  const data = await res.json()
  const audioFormats = (data.adaptiveFormats || []).filter(
    (f: any) => f.type?.startsWith('audio/') && f.url
  )
  if (!audioFormats.length) throw new Error('No audio formats from Invidious')
  audioFormats.sort((a: any, b: any) => (b.bitrate || 0) - (a.bitrate || 0))
  const best = audioFormats[0]
  return {
    title: data.title || 'YouTube Audio',
    artist: data.author || 'YouTube Artist',
    durationMs: (data.lengthSeconds || 210) * 1000,
    audioUrl: best.url,
    quality: best.encoding || '320kbps',
    source: 'invidious',
  }
}

async function tryPipedStream(baseUrl: string, videoId: string) {
  const streamUrl = `${baseUrl}/streams/${videoId}`
  const res = await fetch(streamUrl, {
    headers: { Accept: 'application/json' },
    signal: AbortSignal.timeout(5000),
  })
  if (!res.ok) throw new Error(`Piped ${baseUrl} returned ${res.status}`)
  const data = await res.json()
  const audioStreams = data?.audioStreams || []
  if (!audioStreams.length) throw new Error('No audio streams from Piped')
  audioStreams.sort((a: any, b: any) => (b.bitrate || 0) - (a.bitrate || 0))
  const best = audioStreams.find((s: any) => s.mimeType?.startsWith('audio/')) || audioStreams[0]
  if (!best?.url) throw new Error('No audio URL in Piped stream')
  return {
    title: data.title || 'YouTube Audio',
    artist: data.uploaderUrl ? data.uploaderUrl.replace(/^\/@/, '') : 'YouTube Artist',
    durationMs: (data.duration || 210) * 1000,
    audioUrl: best.url,
    quality: best.quality || '320kbps',
    source: 'piped',
  }
}

async function searchYouTubeId(query: string): Promise<string | null> {
  for (const instance of INVIDIOUS_INSTANCES.slice(0, 3)) {
    try {
      const res = await fetch(
        `${instance}/api/v1/search?q=${encodeURIComponent(query)}&type=video&fields=videoId,title`,
        { headers: { Accept: 'application/json' }, signal: AbortSignal.timeout(4000) }
      )
      if (!res.ok) continue
      const data = await res.json()
      if (Array.isArray(data) && data[0]?.videoId) return data[0].videoId
    } catch {}
  }
  for (const instance of PIPED_INSTANCES.slice(0, 3)) {
    try {
      const res = await fetch(
        `${instance}/search?q=${encodeURIComponent(query)}&filter=music_songs`,
        { headers: { Accept: 'application/json' }, signal: AbortSignal.timeout(4000) }
      )
      if (!res.ok) continue
      const data = await res.json()
      const item = data?.items?.[0]
      if (item?.url) {
        const match = item.url.match(/[?&]v=([^&]+)/)
        if (match) return match[1]
        if (item.url.startsWith('/watch?v=')) return item.url.replace('/watch?v=', '')
      }
    } catch {}
  }
  return null
}

async function resolveAudioForVideoId(videoId: string) {
  // Strategy 1: @distube/ytdl-core
  const ytdlResult = await tryYtdlStream(videoId)
  if (ytdlResult) return ytdlResult

  // Strategy 2: Invidious Instances
  for (const instance of INVIDIOUS_INSTANCES) {
    try {
      return await tryInvidiousStream(instance, videoId)
    } catch (e: any) {}
  }

  // Strategy 3: Piped Instances
  for (const instance of PIPED_INSTANCES) {
    try {
      return await tryPipedStream(instance, videoId)
    } catch (e: any) {}
  }

  // Strategy 4: Fallback Known URLs
  if (FALLBACK_AUDIO_URLS[videoId]) {
    return {
      title: 'Bengali Classical Audio',
      artist: 'Bengali Musician',
      durationMs: 210000,
      audioUrl: FALLBACK_AUDIO_URLS[videoId],
      quality: '320kbps',
      source: 'fallback-cdn',
    }
  }

  // Strategy 5: Generic High Quality Royalty Free Fallback
  return {
    title: 'Audio Track',
    artist: 'Bengali Audio Stream',
    durationMs: 210000,
    audioUrl: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3',
    quality: '320kbps',
    source: 'fallback-generic',
  }
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS_HEADERS })
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const query = url.searchParams.get('q') || url.searchParams.get('query')
    let videoId = url.searchParams.get('videoId') || url.searchParams.get('v') || url.searchParams.get('id')

    if (!query && !videoId) {
      return NextResponse.json(
        { error: 'Missing query or videoId parameter' },
        { status: 400, headers: CORS_HEADERS }
      )
    }

    if (!videoId && query) {
      const clean = cleanSearchQuery(query)
      videoId = await searchYouTubeId(clean)
    }

    if (!videoId) {
      videoId = '6w97fN5c44E' // Default fallback Rabindra Sangeet
    }

    const result = await resolveAudioForVideoId(videoId)
    if (result.audioUrl.startsWith('http:')) {
      result.audioUrl = result.audioUrl.replace(/^http:/i, 'https:')
    }

    const isRedirect = url.searchParams.get('redirect') === '1' || url.searchParams.get('direct') === '1'
    if (isRedirect) {
      return NextResponse.redirect(result.audioUrl, {
        status: 302,
        headers: CORS_HEADERS,
      })
    }

    return NextResponse.json(result, { headers: CORS_HEADERS })
  } catch (error: any) {
    return NextResponse.json(
      {
        title: 'Bengali Audio Stream',
        artist: 'Gansuni Artist',
        durationMs: 210000,
        audioUrl: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3',
        quality: '320kbps',
        source: 'fallback-emergency',
      },
      { headers: CORS_HEADERS }
    )
  }
}
