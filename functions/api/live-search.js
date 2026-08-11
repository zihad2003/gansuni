const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...CORS_HEADERS,
    },
  })
}

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS_HEADERS })
}

const PIPED_INSTANCES = [
  'https://pipedapi.kavin.rocks',
  'https://api.piped.privacydev.net',
  'https://piped-api.garudalinux.org',
  'https://pipedapi.adminforge.de',
  'https://pipedapi.silkky.cloud',
  'https://pipedapi.mha.fi',
  'https://piped-api.lunar.icu',
]

const INVIDIOUS_INSTANCES = [
  'https://vid.puffyan.us',
  'https://invidious.privacyredirect.com',
  'https://iv.datura.network',
  'https://invidious.nerdvpn.de',
  'https://inv.nadeko.net',
  'https://invidious.drgns.space',
  'https://inv.tux.pizza',
]

async function searchPipedYouTube(query, limit = 20) {
  for (const instance of PIPED_INSTANCES) {
    try {
      const res = await fetch(
        `${instance}/search?q=${encodeURIComponent(query)}&filter=music_songs`,
        {
          headers: { Accept: 'application/json' },
          signal: AbortSignal.timeout(6000),
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
          audioUrl: `/api/stream?videoId=${videoId}`,
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

async function searchInvidiousYouTube(query, limit = 20) {
  for (const instance of INVIDIOUS_INSTANCES) {
    try {
      const res = await fetch(
        `${instance}/api/v1/search?q=${encodeURIComponent(query)}&type=video`,
        {
          headers: { Accept: 'application/json' },
          signal: AbortSignal.timeout(6000),
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
          audioUrl: `/api/stream?videoId=${videoId}`,
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

async function searchYouTubeScrape(query, limit = 20) {
  try {
    const res = await fetch(
      `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept-Language': 'en-US,en;q=0.9',
        },
        signal: AbortSignal.timeout(6000),
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
      const title = titleMatch ? titleMatch[1] : `${query} Track ${index + 1}`
      const artistName = authorMatch ? authorMatch[1] : 'YouTube Creator'
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
        audioUrl: `/api/stream?videoId=${id}`,
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

export async function onRequestGet(context) {
  try {
    const url = new URL(context.request.url)
    const query = url.searchParams.get('q') || url.searchParams.get('query') || 'Coke Studio Bangla'
    const limit = Math.min(30, parseInt(url.searchParams.get('limit') || '20', 10))

    let tracks = await searchPipedYouTube(query, limit)
    if (!tracks || !tracks.length) {
      tracks = await searchInvidiousYouTube(query, limit)
    }
    if (!tracks || !tracks.length) {
      tracks = await searchYouTubeScrape(query, limit)
    }

    if (!tracks) tracks = []

    return jsonResponse({
      query,
      source: 'YouTube Live Search Engine',
      count: tracks.length,
      tracks,
    })
  } catch (error) {
    return jsonResponse({ error: error?.message || 'Failed to fetch YouTube live search' }, 500)
  }
}
