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
      'Cache-Control': 'public, max-age=1800, s-maxage=3600',
      ...CORS_HEADERS,
    },
  })
}

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS_HEADERS })
}

const INVIDIOUS_INSTANCES = [
  'https://inv.nadeko.net',
  'https://yewtu.be',
  'https://inv.tux.pizza',
  'https://invidious.flokinet.to',
  'https://iv.melmac.space',
  'https://invidious.fdn.fr',
]

async function searchYouTubeScrape(query, limit = 20) {
  try {
    const res = await fetch(
      `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`,
      {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          'Accept-Language': 'en-US,en;q=0.9',
        },
        signal: AbortSignal.timeout(5000),
      }
    )
    if (!res.ok) return null
    const html = await res.text()
    const match =
      html.match(/var ytInitialData = ({.*?});<\/script>/s) ||
      html.match(/ytInitialData\s*=\s*({.*?});/s)

    if (!match || !match[1]) return null
    const data = JSON.parse(match[1])
    const contents =
      data?.contents?.twoColumnSearchResultsRenderer?.primaryContents?.sectionListRenderer?.contents?.[0]
        ?.itemSectionRenderer?.contents || []

    const tracks = []
    for (const item of contents) {
      if (item.videoRenderer) {
        const v = item.videoRenderer
        const videoId = v.videoId
        if (!videoId || typeof videoId !== 'string') continue

        const title =
          v.title?.runs?.[0]?.text ||
          v.title?.accessibility?.accessibilityData?.label ||
          `${query} Track ${tracks.length + 1}`
        const artistName =
          v.ownerText?.runs?.[0]?.text ||
          v.shortBylineText?.runs?.[0]?.text ||
          'YouTube Creator'

        const durationText = v.lengthText?.simpleText || '3:30'
        const parts = durationText.split(':').map((p) => parseInt(p, 10))
        let durationMs = 210000
        if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
          durationMs = (parts[0] * 60 + parts[1]) * 1000
        } else if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {
          durationMs = (parts[0] * 3600 + parts[1] * 60 + parts[2]) * 1000
        }

        const coverArtUrl =
          v.thumbnail?.thumbnails?.slice(-1)[0]?.url ||
          `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`

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
          playCount: 1500000,
          isPremium: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })

        if (tracks.length >= limit) break
      }
    }

    if (tracks.length > 0) return tracks
  } catch (e) {
    console.warn('Scrape live search error:', e?.message)
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

export async function onRequestGet(context) {
  try {
    const url = new URL(context.request.url)
    const query = url.searchParams.get('q') || url.searchParams.get('query') || 'Rabindra Sangeet'
    const limit = Math.min(30, parseInt(url.searchParams.get('limit') || '20', 10))

    let tracks = await searchYouTubeScrape(query, limit)
    let source = 'YouTube Live Engine'

    if (!tracks || !tracks.length) {
      source = 'Invidious Mirror'
      tracks = await searchInvidiousYouTube(query, limit)
    }

    if (!tracks) tracks = []

    return jsonResponse({
      query,
      source,
      count: tracks.length,
      tracks,
    })
  } catch (error) {
    return jsonResponse({ error: error?.message || 'Failed to fetch live search' }, 500)
  }
}
