import { NextRequest, NextResponse } from 'next/server'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, Range',
}

const INVIDIOUS_INSTANCES = [
  'https://inv.nadeko.net',
  'https://yewtu.be',
  'https://inv.tux.pizza',
  'https://invidious.flokinet.to',
  'https://iv.melmac.space',
  'https://invidious.fdn.fr',
]

const FALLBACK_AUDIO_URLS: Record<string, string> = {
  '6w97fN5c44E': 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3',
  'l1m4E-s1t8Y': 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3',
  'QG802l6XUCA': 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a73467.mp3',
  'aJ-LgJc5v_s': 'https://cdn.pixabay.com/download/audio/2022/10/14/audio_9939f7922f.mp3',
  'jR_5908N3kE': 'https://cdn.pixabay.com/download/audio/2021/08/09/audio_884325752c.mp3',
}

async function resolveDirectAudioUrl(videoId: string): Promise<string | null> {
  for (const instance of INVIDIOUS_INSTANCES) {
    try {
      const res = await fetch(`${instance}/api/v1/videos/${videoId}`, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          Accept: 'application/json',
        },
        signal: AbortSignal.timeout(4000),
      })
      if (!res.ok) continue
      const data = await res.json()
      const adaptive = data.adaptiveFormats || []
      const audioFormats = adaptive.filter((f: any) => {
        const mime = (f.mimeType || f.type || f.container || '').toLowerCase()
        return mime.includes('audio') || mime.includes('webm') || mime.includes('m4a') || mime.includes('mp4')
      })

      if (!audioFormats.length) continue
      audioFormats.sort((a: any, b: any) => parseInt(b.bitrate || '0', 10) - parseInt(a.bitrate || '0', 10))
      const best = audioFormats[0]
      let audioUrl = best.url || best.audioUrl || ''
      if (!audioUrl) continue
      if (audioUrl.startsWith('/')) {
        audioUrl = `${instance}${audioUrl}`
      }
      return audioUrl
    } catch {}
  }
  return null
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS_HEADERS })
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    let videoId = url.searchParams.get('videoId') || url.searchParams.get('v') || url.searchParams.get('id')

    if (!videoId) {
      videoId = '6w97fN5c44E'
    }

    const rangeHeader = request.headers.get('range')
    const directAudioUrl = await resolveDirectAudioUrl(videoId)

    const targetUrl = directAudioUrl || FALLBACK_AUDIO_URLS[videoId] || 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3'

    const fetchHeaders: Record<string, string> = {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    }
    if (rangeHeader) {
      fetchHeaders['Range'] = rangeHeader
    }

    const audioRes = await fetch(targetUrl, {
      headers: fetchHeaders,
      signal: AbortSignal.timeout(10000),
    })

    if (!audioRes.ok && audioRes.status !== 206) {
      // Fallback redirect if streaming fetch returns non-200
      return NextResponse.redirect(targetUrl, { status: 302, headers: CORS_HEADERS })
    }

    const responseHeaders = new Headers(CORS_HEADERS)
    responseHeaders.set('Content-Type', audioRes.headers.get('content-type') || 'audio/webm')
    if (audioRes.headers.get('content-length')) {
      responseHeaders.set('Content-Length', audioRes.headers.get('content-length')!)
    }
    if (audioRes.headers.get('content-range')) {
      responseHeaders.set('Content-Range', audioRes.headers.get('content-range')!)
    }
    responseHeaders.set('Accept-Ranges', 'bytes')
    responseHeaders.set('Cache-Control', 'public, max-age=14400, s-maxage=86400')

    return new NextResponse(audioRes.body, {
      status: audioRes.status,
      headers: responseHeaders,
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Stream error', message: error?.message },
      { status: 500, headers: CORS_HEADERS }
    )
  }
}
