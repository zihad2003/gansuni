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
    signal: AbortSignal.timeout(8000),
  })
  if (!res.ok) throw new Error(`Piped ${baseUrl} returned ${res.status}`)
  const data = await res.json()
  const audioStreams = data?.audioStreams || []
  if (!audioStreams.length) throw new Error('No audio streams from Piped')
  audioStreams.sort((a, b) => (b.bitrate || 0) - (a.bitrate || 0))
  const best = audioStreams.find(s => s.mimeType?.startsWith('audio/')) || audioStreams[0]
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
    signal: AbortSignal.timeout(8000),
  })
  if (!res.ok) throw new Error(`Invidious ${baseUrl} returned ${res.status}`)
  const data = await res.json()
  const audioFormats = (data.adaptiveFormats || []).filter(
    f => f.type?.startsWith('audio/') && f.url
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
    signal: AbortSignal.timeout(12000),
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
        { headers: { Accept: 'application/json' }, signal: AbortSignal.timeout(8000) }
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
        { headers: { Accept: 'application/json' }, signal: AbortSignal.timeout(8000) }
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
  throw new Error(`All extractors failed: ${errors.join(' | ')}`)
}

const FALLBACK_STREAMS = [
  'https://raw.githubusercontent.com/mdn/webaudio-examples/main/audio-analyser/vibes.mp3',
  'https://commondatastorage.googleapis.com/codeskulptor-demos/DinoJazz.mp3',
  'https://commondatastorage.googleapis.com/codeskulptor-assets/sounddogs/soundtrack.mp3',
]

export async function onRequestGet(context) {
  try {
    const url = new URL(context.request.url)
    const query = url.searchParams.get('q') || url.searchParams.get('query')
    const videoId = url.searchParams.get('videoId') || url.searchParams.get('v') || url.searchParams.get('id')

    if (!query && !videoId) {
      return jsonResponse({ error: 'Missing query or videoId parameter' }, 400)
    }

    let targetVideoId = videoId
    if (!targetVideoId && query) {
      const cleanQuery = cleanSearchQuery(query)
      targetVideoId = await searchYouTubeId(cleanQuery)
    }

    if (!targetVideoId) {
      const fallbackIndex = Math.abs((query || 'fallback').length) % FALLBACK_STREAMS.length
      return jsonResponse({
        title: query || 'Fallback Track',
        artist: 'Gaansuni Artist',
        durationMs: 240000,
        audioUrl: FALLBACK_STREAMS[fallbackIndex],
        quality: '320kbps',
        source: 'fallback',
      })
    }

    try {
      const result = await resolveAudioForVideoId(targetVideoId)
      if (result) {
        if (result.audioUrl.startsWith('http:')) {
          result.audioUrl = result.audioUrl.replace(/^http:/i, 'https:')
        }
        return jsonResponse(result)
      }
    } catch (resolveErr) {
      console.warn('YouTube resolve failed:', resolveErr.message)
      const fallbackIndex = Math.abs(targetVideoId.length) % FALLBACK_STREAMS.length
      return jsonResponse({
        title: query || 'YouTube Track',
        artist: 'Gaansuni Artist',
        durationMs: 210000,
        audioUrl: FALLBACK_STREAMS[fallbackIndex],
        quality: '320kbps',
        source: 'fallback',
      })
    }
  } catch (error) {
    return jsonResponse({ error: error?.message || 'Failed to resolve stream' }, 500)
  }
}
