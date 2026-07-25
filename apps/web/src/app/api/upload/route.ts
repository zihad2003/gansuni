import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { saveUploadedTrack } from '@/lib/trackStore'
import type { Track } from '@gansuni/shared'

const PUBLIC_UPLOADS_AUDIO = path.join(process.cwd(), 'public', 'uploads', 'audio')
const PUBLIC_UPLOADS_COVERS = path.join(process.cwd(), 'public', 'uploads', 'covers')

function ensureUploadDirs() {
  if (!fs.existsSync(PUBLIC_UPLOADS_AUDIO)) {
    fs.mkdirSync(PUBLIC_UPLOADS_AUDIO, { recursive: true })
  }
  if (!fs.existsSync(PUBLIC_UPLOADS_COVERS)) {
    fs.mkdirSync(PUBLIC_UPLOADS_COVERS, { recursive: true })
  }
}

export async function POST(req: Request) {
  try {
    ensureUploadDirs()

    const formData = await req.formData()
    const audioFile = formData.get('audioFile') as File | null
    const coverFile = formData.get('coverFile') as File | null
    const title = (formData.get('title') as string) || 'Untitled Track'
    const artistName = (formData.get('artist') as string) || 'Unknown Artist'
    const albumTitle = (formData.get('album') as string) || 'Single'
    const genreName = (formData.get('genre') as string) || 'Bangla Pop'

    if (!audioFile) {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 })
    }

    // Save audio file
    const audioExt = audioFile.name.split('.').pop() || 'mp3'
    const timestamp = Date.now()
    const audioFileName = `track_${timestamp}_${Math.random().toString(36).substring(2, 8)}.${audioExt}`
    const audioFilePath = path.join(PUBLIC_UPLOADS_AUDIO, audioFileName)
    
    const audioBuffer = Buffer.from(await audioFile.arrayBuffer())
    fs.writeFileSync(audioFilePath, audioBuffer)
    const audioUrl = `/uploads/audio/${audioFileName}`

    // Save cover file or fallback
    let coverArtUrl = 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80'
    if (coverFile && coverFile.size > 0) {
      const coverExt = coverFile.name.split('.').pop() || 'jpg'
      const coverFileName = `cover_${timestamp}_${Math.random().toString(36).substring(2, 8)}.${coverExt}`
      const coverFilePath = path.join(PUBLIC_UPLOADS_COVERS, coverFileName)
      const coverBuffer = Buffer.from(await coverFile.arrayBuffer())
      fs.writeFileSync(coverFilePath, coverBuffer)
      coverArtUrl = `/uploads/covers/${coverFileName}`
    }

    const trackId = `up_${timestamp}`
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || trackId

    const newTrack: Track = {
      id: trackId,
      title,
      slug,
      artistId: `artist_${timestamp}`,
      artist: {
        id: `artist_${timestamp}`,
        name: artistName,
        slug: artistName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        bio: 'Uploaded artist profile',
        verified: false,
        monthlyListeners: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      albumId: `album_${timestamp}`,
      album: {
        id: `album_${timestamp}`,
        title: albumTitle,
        slug: albumTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        artistId: `artist_${timestamp}`,
        coverArtUrl,
        totalTracks: 1,
        durationMs: 180000,
        albumType: 'SINGLE',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      audioUrl,
      durationMs: 180000,
      trackNumber: 1,
      discNumber: 1,
      explicit: false,
      playCount: 1,
      isPremium: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    const allTracks = saveUploadedTrack(newTrack)

    return NextResponse.json({
      success: true,
      track: newTrack,
      allTracks,
    })
  } catch (error: any) {
    console.error('Upload handler error:', error)
    return NextResponse.json({ error: error?.message || 'Failed to upload audio file' }, { status: 500 })
  }
}
