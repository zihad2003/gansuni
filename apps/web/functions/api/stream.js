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

const FALLBACK_AUDIO_URLS = {
  '6w97fN5c44E': 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3',
  'l1m4E-s1t8Y': 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3',
  'QG802l6XUCA': 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a73467.mp3',
  'aJ-LgJc5v_s': 'https://cdn.pixabay.com/download/audio/2022/10/14/audio_9939f7922f.mp3',
  'jR_5908N3kE': 'https://cdn.pixabay.com/download/audio/2021/08/09/audio_884325752c.mp3',
}

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
    signal: AbortSignal.timeout(5000),
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
    signal: AbortSignal.timeout(5000),
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

async function searchYouTubeId(query) {
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

async function resolveAudioForVideoId(videoId) {
  for (const instance of INVIDIOUS_INSTANCES) {
    try {
      return await tryInvidiousStream(instance, videoId)
    } catch (e) {
      continue
    }
  }

  for (const instance of PIPED_INSTANCES) {
    try {
      return await tryPipedStream(instance, videoId)
    } catch (e) {
      continue
    }
  }

  if (FALLBACK_AUDIO_URLS[videoId]) {
    return {
      title: 'Bengali Audio',
      artist: 'Bengali Musician',
      durationMs: 210000,
      audioUrl: FALLBACK_AUDIO_URLS[videoId],
      quality: '320kbps',
      source: 'fallback-cdn',
    }
  }

  return {
    title: 'Audio Stream',
    artist: 'Bengali Artist',
    durationMs: 210000,
    audioUrl: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3',
    quality: '320kbps',
    source: 'fallback-generic',
  }
}

export async function onRequestGet(context) {
  try {
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
      videoId = '6w97fN5c44E'
    }

    const result = await resolveAudioForVideoId(videoId)
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

    return jsonResponse(result)
  } catch (error) {
    return jsonResponse({
      title: 'Bengali Audio Stream',
      artist: 'Gansuni Artist',
      durationMs: 210000,
      audioUrl: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3',
      quality: '320kbps',
      source: 'fallback-emergency',
    })
  }
}
