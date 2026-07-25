import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { FEATURED_PLAYLISTS } from '@gansuni/shared'

const PLAYLISTS_FILE = path.join(process.cwd(), 'data', 'user_playlists.json')

function getUserPlaylists(): any[] {
  try {
    if (!fs.existsSync(PLAYLISTS_FILE)) return FEATURED_PLAYLISTS
    const raw = fs.readFileSync(PLAYLISTS_FILE, 'utf-8')
    return JSON.parse(raw)
  } catch {
    return FEATURED_PLAYLISTS
  }
}

function saveUserPlaylists(playlists: any[]) {
  const dir = path.dirname(PLAYLISTS_FILE)
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(PLAYLISTS_FILE, JSON.stringify(playlists, null, 2))
}

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const playlists = getUserPlaylists()
    const playlist = playlists.find((p) => p.id === id) || FEATURED_PLAYLISTS.find((p) => p.id === id)

    if (!playlist) {
      return NextResponse.json({ error: 'Playlist not found' }, { status: 404 })
    }

    return NextResponse.json({ playlist })
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to fetch playlist' }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    let playlists = getUserPlaylists()
    const exists = playlists.some((p) => p.id === id)

    if (!exists) {
      return NextResponse.json({ error: 'Playlist not found or cannot be deleted' }, { status: 404 })
    }

    playlists = playlists.filter((p) => p.id !== id)
    saveUserPlaylists(playlists)

    return NextResponse.json({ success: true, message: 'Playlist deleted successfully' })
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to delete playlist' }, { status: 500 })
  }
}
