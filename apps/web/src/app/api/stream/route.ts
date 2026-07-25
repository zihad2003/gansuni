import { NextResponse } from 'next/server'
import ytdl from '@distube/ytdl-core'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const urlOrId = searchParams.get('url') || searchParams.get('v') || searchParams.get('id')

    if (!urlOrId) {
      return NextResponse.json({ error: 'Missing video URL or ID parameter' }, { status: 400 })
    }

    const videoUrl = urlOrId.startsWith('http') ? urlOrId : `https://www.youtube.com/watch?v=${urlOrId}`
    
    if (!ytdl.validateURL(videoUrl)) {
      return NextResponse.json({ error: 'Invalid YouTube video URL' }, { status: 400 })
    }

    const info = await ytdl.getInfo(videoUrl)
    const audioFormats = ytdl.filterFormats(info.formats, 'audioonly')
    
    if (!audioFormats || audioFormats.length === 0) {
      return NextResponse.json({ error: 'No audio stream available' }, { status: 404 })
    }

    // Select highest quality audio format
    const bestAudio = audioFormats.sort((a, b) => (b.bitrate || 0) - (a.bitrate || 0))[0]

    return NextResponse.json({
      title: info.videoDetails.title,
      durationMs: parseInt(info.videoDetails.lengthSeconds || '180', 10) * 1000,
      audioUrl: bestAudio?.url,
      mimeType: bestAudio?.mimeType,
    })
  } catch (error: any) {
    console.error('Stream extractor error:', error)
    return NextResponse.json({ error: error?.message || 'Failed to extract full audio stream' }, { status: 500 })
  }
}
