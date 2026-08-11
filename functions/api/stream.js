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
      'Cache-Control': 'public, max-age=14400, s-maxage=86400',
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

function cleanSearchQuery(raw) {
  return raw
    .replace(/\[.*?\]|\(.*?\)/g, '')
    .replace(/official\s*(music\s*video|video|audio|lyric\s*video|lyrical)?/gi, '')
    .replace(/\b(hd|4k|1080p|full\s*song|remix|cover|prod\b)/gi, '')
    .replace(/\s+/g, ' ')
    .trim()
}

async function tryPipedStream(baseUrl, videoId) {
  const streamUrl = `${baseUrl}/streams/${videoId}`
  const res = await fetch(streamUrl, {
    headers: { Accept: 'application/json' },
    signal: AbortSignal.timeout(6000),
  })
  if (!res.ok) throw new Error(`Piped ${baseUrl} returned ${res.status}`)
  const data = await res.json()
  const audioStreams = data?.audioStreams || []
  if (!audioStreams.length) throw new Error('No audio streams from Piped')
  audioStreams.sort((a, b) => (b.bitrate || 0) - (a.bitrate || 0))
  const best = audioStreams.find((s) => s.mimeType?.startsWith('audio/')) || audioStreams[0]
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

async function tryInvidiousStream(baseUrl, videoId) {
  const streamUrl = `${baseUrl}/api/v1/videos/${videoId}?fields=title,author,lengthSeconds,adaptiveFormats`
  const res = await fetch(streamUrl, {
    headers: { Accept: 'application/json' },
    signal: AbortSignal.timeout(6000),
  })
  if (!res.ok) throw new Error(`Invidious ${baseUrl} returned ${res.status}`)
  const data = await res.json()
  const audioFormats = (data.adaptiveFormats || []).filter(
    (f) => f.type?.startsWith('audio/') && f.url
  )
  if (!audioFormats.length) throw new Error('No audio formats from Invidious')
  audioFormats.sort((a, b) => (b.bitrate || 0) - (a.bitrate || 0))
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

async function tryCobaltApi(videoId) {
  const res = await fetch('https://api.cobalt.tools', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      url: `https://youtube.com/watch?v=${videoId}`,
      isAudioOnly: true,
      audioFormat: 'mp3',
      audioQuality: '320',
    }),
    signal: AbortSignal.timeout(8000),
  })
  if (!res.ok) throw new Error(`Cobalt returned ${res.status}`)
  const data = await res.json()
  if (data.status !== 'redirect' && data.status !== 'stream') {
    throw new Error(data.error?.code || 'Cobalt failed')
  }
  const audioUrl = data.url
  if (!audioUrl) throw new Error('No audio URL from Cobalt')
  return {
    title: data.filename ? data.filename.replace(/\.(mp3|ogg|wav)$/, '') : 'YouTube Audio',
    artist: 'YouTube Artist',
    durationMs: 210000,
    audioUrl,
    quality: '320kbps',
    source: 'cobalt',
  }
}

async function searchYouTubeId(query) {
  for (const instance of PIPED_INSTANCES.slice(0, 3)) {
    try {
      const res = await fetch(
        `${instance}/search?q=${encodeURIComponent(query)}&filter=music_songs`,
        { headers: { Accept: 'application/json' }, signal: AbortSignal.timeout(5000) }
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
  for (const instance of INVIDIOUS_INSTANCES.slice(0, 3)) {
    try {
      const res = await fetch(
        `${instance}/api/v1/search?q=${encodeURIComponent(query)}&type=video&fields=videoId,title`,
        { headers: { Accept: 'application/json' }, signal: AbortSignal.timeout(5000) }
      )
      if (!res.ok) continue
      const data = await res.json()
      if (Array.isArray(data) && data[0]?.videoId) return data[0].videoId
    } catch {}
  }
  return null
}

async function resolveAudioForVideoId(videoId) {
  const errors = []
  for (const instance of PIPED_INSTANCES) {
    try {
      return await tryPipedStream(instance, videoId)
    } catch (e) {
      errors.push(`Piped(${instance}): ${e.message}`)
      continue
    }
  }
  for (const instance of INVIDIOUS_INSTANCES) {
    try {
      return await tryInvidiousStream(instance, videoId)
    } catch (e) {
      errors.push(`Invidious(${instance}): ${e.message}`)
      continue
    }
  }
  try {
    return await tryCobaltApi(videoId)
  } catch (e) {
    errors.push(`Cobalt: ${e.message}`)
  }
  throw new Error(`All audio extraction services failed: ${errors.join(' | ')}`)
}

export async function onRequestGet(context) {
  try {
    const cache = typeof caches !== 'undefined' ? caches.default : null
    if (cache) {
      const cachedResponse = await cache.match(context.request)
      if (cachedResponse) return cachedResponse
    }

    const url = new URL(context.request.url)
    const query = url.searchParams.get('q') || url.searchParams.get('query')
    let videoId = url.searchParams.get('videoId') || url.searchParams.get('v') || url.searchParams.get('id')

    if (!query && !videoId) {
      return jsonResponse({ error: 'Missing query or videoId parameter' }, 400)
    }

    if (!videoId && query) {
      const cleanQuery = cleanSearchQuery(query)
      videoId = await searchYouTubeId(cleanQuery)
    }

    if (!videoId) {
      return jsonResponse({ error: 'Video stream could not be identified for query' }, 404)
    }

    try {
      const result = await resolveAudioForVideoId(videoId)
      if (result) {
        if (result.audioUrl.startsWith('http:')) {
          result.audioUrl = result.audioUrl.replace(/^http:/i, 'https:')
        }
        if (url.searchParams.get('redirect') === '1' || url.searchParams.get('direct') === '1') {
          return new Response(null, {
            status: 302,
            headers: {
              Location: result.audioUrl,
              'Cache-Control': 'public, max-age=14400, s-maxage=86400',
              ...CORS_HEADERS,
            },
          })
        }

        const response = jsonResponse(result)
        if (cache) {
          context.waitUntil(cache.put(context.request, response.clone()))
        }
        return response
      }
    } catch (resolveErr) {
      console.warn('Audio stream resolution failed:', resolveErr.message)
      return jsonResponse(
        {
          error: 'Audio stream resolution failed. Public extractors rate limited or blocked.',
          details: resolveErr.message,
        },
        502
      )
    }
  } catch (error) {
    return jsonResponse({ error: error?.message || 'Failed to resolve stream' }, 500)
  }
}
