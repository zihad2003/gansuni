import fs from 'fs'
import path from 'path'
import type { Track } from '@gansuni/shared'

const DATA_DIR = path.join(process.cwd(), 'data')
const TRACKS_FILE = path.join(DATA_DIR, 'uploaded_tracks.json')

export function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true })
  }
  if (!fs.existsSync(TRACKS_FILE)) {
    fs.writeFileSync(TRACKS_FILE, JSON.stringify([], null, 2), 'utf-8')
  }
}

export function getUploadedTracks(): Track[] {
  try {
    ensureDataDir()
    const content = fs.readFileSync(TRACKS_FILE, 'utf-8')
    return JSON.parse(content) as Track[]
  } catch (e) {
    console.error('Failed to read uploaded tracks:', e)
    return []
  }
}

export function saveUploadedTrack(track: Track): Track[] {
  try {
    ensureDataDir()
    const existing = getUploadedTracks()
    const updated = [track, ...existing]
    fs.writeFileSync(TRACKS_FILE, JSON.stringify(updated, null, 2), 'utf-8')
    return updated
  } catch (e) {
    console.error('Failed to save uploaded track:', e)
    return []
  }
}

export function deleteUploadedTrack(trackId: string): boolean {
  try {
    ensureDataDir()
    const existing = getUploadedTracks()
    const target = existing.find((t) => t.id === trackId)
    if (!target) return false

    // Clean up files if they exist locally in public/uploads
    if (target.audioUrl && target.audioUrl.startsWith('/uploads/audio/')) {
      const audioPath = path.join(process.cwd(), 'public', target.audioUrl)
      if (fs.existsSync(audioPath)) fs.unlinkSync(audioPath)
    }
    if (target.album?.coverArtUrl?.startsWith('/uploads/covers/')) {
      const coverPath = path.join(process.cwd(), 'public', target.album.coverArtUrl)
      if (fs.existsSync(coverPath)) fs.unlinkSync(coverPath)
    }

    const filtered = existing.filter((t) => t.id !== trackId)
    fs.writeFileSync(TRACKS_FILE, JSON.stringify(filtered, null, 2), 'utf-8')
    return true
  } catch (e) {
    console.error('Failed to delete track:', e)
    return false
  }
}
