const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, HEAD, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, Range',
}

const INVIDIOUS_INSTANCES = [
  'https://inv.nadeko.net',
  'https://invidious.drgns.space',
  'https://yewtu.be',
  'https://invidious.flokinet.to',
  'https://iv.melmac.space',
  'https://invidious.nerqv.ps.kg',
]

const PIPED_INSTANCES = [
  'https://api.piped.video',
  'https://pipedapi.kavin.rocks',
  'https://pipedapi.tokhmi.xyz',
  'https://api.piped.privacydev.net',
]

const FALLBACK_AUDIO_URLS = {
  '6w97fN5c44E': 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3',
  'l1m4E-s1t8Y': 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3',
  'QG802l6XUCA': 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a73467.mp3',
  'aJ-LgJc5v_s': 'https://cdn.pixabay.com/download/audio/2022/10/14/audio_9939f7922f.mp3',
  'jR_5908N3kE': 'https://cdn.pixabay.com/download/audio/2021/08/09/audio_884325752c.mp3',
}

function fetchWithTimeout(url, options = {}, ms = 3000) {
  const controller = new AbortController()
  const id = setTimeout(() => controller.abort(), ms)
  return fetch(url, {
    ...options,
    signal: controller.signal,
  }).finally(() => clearTimeout(id))
}

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS_HEADERS })
}

export async function onRequestHead(context) {
  const getRes = await onRequestGet(context)
  return new Response(null, {
    status: getRes.status,
    headers: getRes.headers,
  })
}

async function resolveAudioStreamUrl(videoId) {
  // 1. Try Piped APIs (usually fastest direct audio streams)
  const fetchPiped = async (inst) => {
    const res = await fetchWithTimeout(`${inst}/streams/${videoId}`, {
      headers: { Accept: 'application/json' }
    }, 2500)
    if (!res.ok) throw new Error(`Piped ${inst} status ${res.status}`)
    const data = await res.json()
    const streams = data.audioStreams || []
    if (!streams.length) throw new Error(`No audio streams on Piped ${inst}`)
    // Prioritize M4A / AAC (itag 140) for mobile Safari compatibility
    const m4aStream = streams.find((s) => (s.mimeType || '').includes('audio/mp4') || (s.mimeType || '').includes('m4a'))
    const best = m4aStream || streams[0]
    if (!best?.url) throw new Error(`Empty stream url on Piped ${inst}`)
    return { url: best.url, mimeType: best.mimeType || 'audio/mp4' }
  }

  // 2. Try Invidious APIs
  const fetchInvidious = async (inst) => {
    const res = await fetchWithTimeout(
      `${inst}/api/v1/videos/${videoId}`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15',
          Accept: 'application/json',
        },
      },
      2500
    )
    if (!res.ok) throw new Error(`Invidious ${inst} status ${res.status}`)
    const data = await res.json()
    const adaptive = data.adaptiveFormats || []
    const audioFormats = adaptive.filter((f) => {
      const mime = (f.mimeType || f.type || f.container || '').toLowerCase()
      return mime.includes('audio') || mime.includes('webm') || mime.includes('m4a') || mime.includes('mp4')
    })
    if (!audioFormats.length) throw new Error(`Invidious ${inst} no audio format`)
    audioFormats.sort((a, b) => parseInt(b.bitrate || '0', 10) - parseInt(a.bitrate || '0', 10))
    const m4aFormat = audioFormats.find((f) => (f.mimeType || '').includes('mp4') || (f.mimeType || '').includes('m4a'))
    const best = m4aFormat || audioFormats[0]
    let audioUrl = best.url || best.audioUrl || ''
    if (!audioUrl) throw new Error(`Invidious ${inst} empty url`)
    if (audioUrl.startsWith('/')) {
      audioUrl = `${inst}${audioUrl}`
    }
    return { url: audioUrl, mimeType: best.mimeType || 'audio/mp4' }
  }

  try {
    return await Promise.any([
      ...PIPED_INSTANCES.map((inst) => fetchPiped(inst)),
      ...INVIDIOUS_INSTANCES.map((inst) => fetchInvidious(inst)),
    ])
  } catch {
    // 3. Fallback to direct Invidious proxy link (itag 140 is AAC M4A 128k)
    return {
      url: `https://inv.nadeko.net/latest_version?id=${videoId}&itag=140`,
      mimeType: 'audio/mp4',
    }
  }
}

export async function onRequestGet(context) {
  try {
    const url = new URL(context.request.url)
    let videoId = url.searchParams.get('videoId') || url.searchParams.get('v') || url.searchParams.get('id')

    if (!videoId) {
      videoId = '6w97fN5c44E'
    }

    const redirectOnly = url.searchParams.get('redirect') === '1'
    const rangeHeader = context.request.headers.get('range')

    const resolved = await resolveAudioStreamUrl(videoId)
    const targetUrl = resolved?.url || FALLBACK_AUDIO_URLS[videoId] || 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3'
    const mimeType = resolved?.mimeType || 'audio/mp4'

    if (redirectOnly) {
      return new Response(null, {
        status: 302,
        headers: {
          Location: targetUrl,
          ...CORS_HEADERS,
        },
      })
    }

    const fetchHeaders = {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    }
    if (rangeHeader) {
      fetchHeaders['Range'] = rangeHeader
    }

    let audioRes = await fetchWithTimeout(targetUrl, { headers: fetchHeaders }, 6000).catch(() => null)

    // If fetch failed or returned non-200/206 (e.g. 403 IP block), redirect browser directly to target URL or fallback
    if (!audioRes || (!audioRes.ok && audioRes.status !== 206)) {
      const fallbackUrl = `https://inv.nadeko.net/latest_version?id=${videoId}&itag=140`
      return new Response(null, {
        status: 302,
        headers: {
          Location: targetUrl.startsWith('http') ? targetUrl : fallbackUrl,
          ...CORS_HEADERS,
        },
      })
    }

    const responseHeaders = new Headers(CORS_HEADERS)
    responseHeaders.set('Content-Type', audioRes.headers.get('content-type') || mimeType)
    if (audioRes.headers.get('content-range')) {
      responseHeaders.set('Content-Range', audioRes.headers.get('content-range'))
    }
    responseHeaders.set('Accept-Ranges', 'bytes')
    responseHeaders.set('Cache-Control', 'public, max-age=14400, s-maxage=86400')

    return new Response(audioRes.body, {
      status: audioRes.status,
      headers: responseHeaders,
    })
  } catch (error) {
    // If any unexpected error occurs, redirect to inv.nadeko.net proxy
    const url = new URL(context.request.url)
    const videoId = url.searchParams.get('videoId') || '6w97fN5c44E'
    return new Response(null, {
      status: 302,
      headers: {
        Location: `https://inv.nadeko.net/latest_version?id=${videoId}&itag=140`,
        ...CORS_HEADERS,
      },
    })
  }
}
