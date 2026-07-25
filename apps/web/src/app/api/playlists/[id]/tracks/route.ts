import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const PLAYLISTS_FILE = path.join(process.cwd(), 'data', 'user_playlists.json')

function getUserPlaylists(): any[] {
  try {
    if (!fs.existsSync(PLAYLISTS_FILE)) return []
    const raw = fs.readFileSync(PLAYLISTS_FILE, 'utf-8')
    return JSON.parse(raw)
  } catch {
    return []
  }
}

function saveUserPlaylists(playlists: any[]) {
  const dir = path.dirname(PLAYLISTS_FILE)
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(PLAYLISTS_FILE, JSON.stringify(playlists, null, 2))
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const playlistId = params.id
    const body = await req.json()
    const { track } = body

    if (!track || !track.id) {
      return NextResponse.json({ error: 'Track object with id is required' }, { status: 400 })
    }

    const playlists = getUserPlaylists()
    const targetIdx = playlists.findIndex((p) => p.id === playlistId)

    if (targetIdx === -1) {
      return NextResponse.json({ error: 'Playlist not found' }, { status: 404 })
    }

    const pl = playlists[targetIdx]!
    if (!pl.tracks) pl.tracks = []

    const exists = pl.tracks.some((t: any) => t.id === track.id)
    if (!exists) {
      pl.tracks.push(track)
      pl.updatedAt = new Date().toISOString()
      playlists[targetIdx] = pl
      saveUserPlaylists(playlists)
    }

    return NextResponse.json({ success: true, playlist: pl })
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to add track to playlist' }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const playlistId = params.id
    const { searchParams } = new URL(req.url)
    const trackId = searchParams.get('trackId')

    if (!trackId) {
      return NextResponse.json({ error: 'trackId query parameter is required' }, { status: 400 })
    }

    const playlists = getUserPlaylists()
    const targetIdx = playlists.findIndex((p) => p.id === playlistId)

    if (targetIdx === -1) {
      return NextResponse.json({ error: 'Playlist not found' }, { status: 404 })
    }

    const pl = playlists[targetIdx]!
    if (pl.tracks) {
      pl.tracks = pl.tracks.filter((t: any) => t.id !== trackId)
      pl.updatedAt = new Date().toISOString()
      playlists[targetIdx] = pl
      saveUserPlaylists(playlists)
    }

    return NextResponse.json({ success: true, playlist: pl })
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to remove track from playlist' }, { status: 500 })
  }
}
