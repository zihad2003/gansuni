import { NextRequest, NextResponse } from 'next/server'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

const INVIDIOUS_INSTANCES = [
  'https://inv.nadeko.net',
  'https://invidious.drgns.space',
  'https://inv.tux.pizza',
  'https://invidious.nerdvpn.de',
  'https://yewtu.be',
]

const PIPED_INSTANCES = [
  'https://pipedapi.adminforge.de',
  'https://pipedapi.mha.fi',
  'https://pipedapi.kavin.rocks',
]

async function searchInvidiousYouTube(query: string, limit = 20) {
  for (const instance of INVIDIOUS_INSTANCES) {
    try {
      const res = await fetch(
        `${instance}/api/v1/search?q=${encodeURIComponent(query)}&type=video`,
        {
          headers: { Accept: 'application/json' },
          signal: AbortSignal.timeout(4000),
        }
      )
      if (!res.ok) continue
      const data = await res.json()
      if (!Array.isArray(data) || !data.length) continue

      const tracks = []
      for (const item of data) {
        if (!item.videoId) continue
        const videoId = item.videoId
        const title = item.title || 'YouTube Audio'
        const artistName = item.author || 'YouTube Creator'
        const durationSec = Math.max(30, parseInt(item.lengthSeconds || '210', 10))
        const durationMs = durationSec * 1000
        const coverArtUrl = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`

        tracks.push({
          id: `yt_${videoId}`,
          youtubeId: videoId,
          title,
          slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          artistId: `yt_artist_${videoId}`,
          artist: {
            id: `yt_artist_${videoId}`,
            name: artistName,
            slug: artistName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            bio: `YouTube Creator: ${artistName}`,
            avatarUrl: coverArtUrl,
            verified: true,
            monthlyListeners: 1500000,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          albumId: `yt_album_${videoId}`,
          album: {
            id: `yt_album_${videoId}`,
            title: `${title} (Single)`,
            slug: `${title}-single`.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            artistId: `yt_artist_${videoId}`,
            coverArtUrl,
            totalTracks: 1,
            durationMs,
            albumType: 'SINGLE',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          audioUrl: `/api/stream?videoId=${videoId}&redirect=1`,
          durationMs,
          trackNumber: 1,
          discNumber: 1,
          explicit: false,
          playCount: item.viewCount || 1200000,
          isPremium: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })

        if (tracks.length >= limit) break
      }

      if (tracks.length > 0) return tracks
    } catch {}
  }
  return null
}

async function searchPipedYouTube(query: string, limit = 20) {
  for (const instance of PIPED_INSTANCES) {
    try {
      const res = await fetch(
        `${instance}/search?q=${encodeURIComponent(query)}&filter=music_songs`,
        {
          headers: { Accept: 'application/json' },
          signal: AbortSignal.timeout(4000),
        }
      )
      if (!res.ok) continue
      const data = await res.json()
      const items = data?.items || []
      if (!items.length) continue

      const tracks = []
      for (const item of items) {
        if (!item.url) continue
        const match = item.url.match(/[?&]v=([^&]+)/) || item.url.match(/\/watch\?v=([^&]+)/)
        const videoId = match ? match[1] : item.url.replace('/watch?v=', '')
        if (!videoId) continue

        const title = item.title || 'YouTube Audio'
        const artistName = item.uploaderName || item.uploaderUrl?.replace(/^\/@/, '') || 'YouTube Creator'
        const durationSec = Math.max(30, parseInt(item.duration || '210', 10))
        const durationMs = durationSec * 1000
        const coverArtUrl = item.thumbnail || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`

        tracks.push({
          id: `yt_${videoId}`,
          youtubeId: videoId,
          title,
          slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          artistId: `yt_artist_${videoId}`,
          artist: {
            id: `yt_artist_${videoId}`,
            name: artistName,
            slug: artistName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            bio: `YouTube Creator: ${artistName}`,
            avatarUrl: coverArtUrl,
            verified: true,
            monthlyListeners: 1500000,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          albumId: `yt_album_${videoId}`,
          album: {
            id: `yt_album_${videoId}`,
            title: `${title} (Single)`,
            slug: `${title}-single`.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            artistId: `yt_artist_${videoId}`,
            coverArtUrl,
            totalTracks: 1,
            durationMs,
            albumType: 'SINGLE',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          audioUrl: `/api/stream?videoId=${videoId}&redirect=1`,
          durationMs,
          trackNumber: 1,
          discNumber: 1,
          explicit: false,
          playCount: item.views || 1200000,
          isPremium: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })

        if (tracks.length >= limit) break
      }

      if (tracks.length > 0) return tracks
    } catch {}
  }
  return null
}

async function searchYouTubeScrape(query: string, limit = 20) {
  try {
    const res = await fetch(
      `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`,
      {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept-Language': 'en-US,en;q=0.9',
        },
        signal: AbortSignal.timeout(4000),
      }
    )
    if (!res.ok) return null
    const html = await res.text()
    const matches = [...html.matchAll(/"videoId":"([a-zA-Z0-9_-]{11})"/g)]
    const videoIds = [...new Set(matches.map((m) => m[1]))].slice(0, limit)
    if (!videoIds.length) return null

    return videoIds.map((id, index) => {
      const titleMatch = html.match(new RegExp(`"videoId":"${id}".*?"title":\\{"runs":\\[\\{"text":"([^"]+)"\\}\\]\\}`))
      const authorMatch = html.match(new RegExp(`"videoId":"${id}".*?"ownerText":\\{"runs":\\[\\{"text":"([^"]+)"\\}\\]\\}`))
      const title: string = (titleMatch && titleMatch[1]) ? titleMatch[1] : `${query} Track ${index + 1}`
      const artistName: string = (authorMatch && authorMatch[1]) ? authorMatch[1] : 'YouTube Creator'
      const coverArtUrl = `https://i.ytimg.com/vi/${id}/hqdefault.jpg`

      return {
        id: `yt_${id}`,
        youtubeId: id,
        title,
        slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        artistId: `yt_artist_${id}`,
        artist: {
          id: `yt_artist_${id}`,
          name: artistName,
          slug: artistName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          bio: `YouTube Creator: ${artistName}`,
          avatarUrl: coverArtUrl,
          verified: true,
          monthlyListeners: 1500000,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        albumId: `yt_album_${id}`,
        album: {
          id: `yt_album_${id}`,
          title: `${title} (Single)`,
          slug: `${title}-single`.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          artistId: `yt_artist_${id}`,
          coverArtUrl,
          totalTracks: 1,
          durationMs: 210000,
          albumType: 'SINGLE',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        audioUrl: `/api/stream?videoId=${id}&redirect=1`,
        durationMs: 210000,
        trackNumber: 1,
        discNumber: 1,
        explicit: false,
        playCount: 1500000,
        isPremium: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    })
  } catch {}
  return null
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS_HEADERS })
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const query = url.searchParams.get('q') || url.searchParams.get('query') || 'Rabindra Sangeet'
    const limit = Math.min(30, parseInt(url.searchParams.get('limit') || '20', 10))

    let tracks = await searchInvidiousYouTube(query, limit)
    let source = 'Invidious Mirror'

    if (!tracks || !tracks.length) {
      source = 'Piped Mirror'
      tracks = await searchPipedYouTube(query, limit)
    }

    if (!tracks || !tracks.length) {
      source = 'YouTube Scrape Fallback'
      tracks = await searchYouTubeScrape(query, limit)
    }

    if (!tracks) tracks = []

    return NextResponse.json(
      {
        query,
        source,
        count: tracks.length,
        tracks,
      },
      { headers: CORS_HEADERS }
    )
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch live search' },
      { status: 500, headers: CORS_HEADERS }
    )
  }
}
