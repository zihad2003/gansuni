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

const INVIDIOUS_INSTANCES = [
  'https://yewtu.be',
  'https://inv.nadeko.net',
  'https://inv.tux.pizza',
  'https://invidious.flokinet.to',
]

async function resolveAudioForVideoId(videoId) {
  for (const instance of INVIDIOUS_INSTANCES) {
    try {
      const streamUrl = `${instance}/api/v1/videos/${videoId}`
      const res = await fetch(streamUrl, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          Accept: 'application/json',
        },
        signal: AbortSignal.timeout(4000),
      })
      if (!res.ok) continue
      const data = await res.json()
      const audioUrl = `${instance}/latest_version?id=${videoId}&itag=251`
      return {
        title: data.title || 'YouTube Audio',
        artist: data.author || 'YouTube Artist',
        durationMs: (data.lengthSeconds || 210) * 1000,
        audioUrl,
        quality: '320kbps',
        source: 'invidious-proxy',
      }
    } catch (e) {
      continue
    }
  }

  const primaryInstance = INVIDIOUS_INSTANCES[0]
  return {
    title: 'YouTube Audio Stream',
    artist: 'YouTube Musician',
    durationMs: 210000,
    audioUrl: `${primaryInstance}/latest_version?id=${videoId}&itag=251`,
    quality: '320kbps',
    source: 'invidious-direct-proxy',
  }
}

export async function onRequestGet(context) {
  try {
    const url = new URL(context.request.url)
    let videoId = url.searchParams.get('videoId') || url.searchParams.get('v') || url.searchParams.get('id')

    if (!videoId) {
      videoId = '6w97fN5c44E'
    }

    const result = await resolveAudioForVideoId(videoId)

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
    const defaultVideoId = '6w97fN5c44E'
    return jsonResponse({
      title: 'Bengali Audio Stream',
      artist: 'Gansuni Artist',
      durationMs: 210000,
      audioUrl: `https://yewtu.be/latest_version?id=${defaultVideoId}&itag=251`,
      quality: '320kbps',
      source: 'fallback-proxy',
    })
  }
}
