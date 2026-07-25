import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { FEATURED_PLAYLISTS } from '@gansuni/shared'

const PLAYLISTS_FILE = path.join(process.cwd(), 'data', 'user_playlists.json')

function ensureDataDir() {
  const dir = path.dirname(PLAYLISTS_FILE)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
  if (!fs.existsSync(PLAYLISTS_FILE)) {
    fs.writeFileSync(PLAYLISTS_FILE, JSON.stringify(FEATURED_PLAYLISTS, null, 2))
  }
}

function getUserPlaylists(): any[] {
  ensureDataDir()
  try {
    const raw = fs.readFileSync(PLAYLISTS_FILE, 'utf-8')
    return JSON.parse(raw)
  } catch {
    return FEATURED_PLAYLISTS
  }
}

function saveUserPlaylists(playlists: any[]) {
  ensureDataDir()
  fs.writeFileSync(PLAYLISTS_FILE, JSON.stringify(playlists, null, 2))
}

export async function GET() {
  try {
    const playlists = getUserPlaylists()
    return NextResponse.json({
      playlists,
      count: playlists.length,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to fetch playlists' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name, description, coverArtUrl } = body

    if (!name || typeof name !== 'string') {
      return NextResponse.json({ error: 'Playlist name is required' }, { status: 400 })
    }

    const playlists = getUserPlaylists()
    const newId = `pl_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`

    const newPlaylist = {
      id: newId,
      name: name.trim(),
      description: (description || '').trim() || 'Custom user playlist',
      coverArtUrl: coverArtUrl || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
      ownerId: 'u1',
      isPublic: true,
      collaborative: false,
      tracks: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    playlists.unshift(newPlaylist)
    saveUserPlaylists(playlists)

    return NextResponse.json({
      success: true,
      playlist: newPlaylist,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to create playlist' }, { status: 500 })
  }
}
