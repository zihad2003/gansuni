import type { Track } from '@gansuni/shared'
import { ownerId } from '@/lib/account'

const DB_NAME = 'gansuni'
const DB_VERSION = 1
const AUDIO_STORE = 'audio'
const COVER_STORE = 'covers'
const LEGACY_META_KEY = 'gansuni-uploads-meta'

function uploadMetaKey() {
  return `gansuni-uploads:${ownerId()}`
}

function offlineMetaKey() {
  return `gansuni-offline:${ownerId()}`
}

function offlineBlobKey(trackId: string) {
  return `offline:${trackId}`
}

const blobUrls = new Map<string, string>()

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains(AUDIO_STORE)) db.createObjectStore(AUDIO_STORE)
      if (!db.objectStoreNames.contains(COVER_STORE)) db.createObjectStore(COVER_STORE)
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

function idbGet<T>(store: string, key: string): Promise<T | undefined> {
  return openDb().then(
    (db) =>
      new Promise((resolve, reject) => {
        const tx = db.transaction(store, 'readonly')
        const req = tx.objectStore(store).get(key)
        req.onsuccess = () => resolve(req.result as T | undefined)
        req.onerror = () => reject(req.error)
      }),
  )
}

function idbPut(store: string, key: string, value: Blob): Promise<void> {
  return openDb().then(
    (db) =>
      new Promise((resolve, reject) => {
        const tx = db.transaction(store, 'readwrite')
        tx.objectStore(store).put(value, key)
        tx.oncomplete = () => resolve()
        tx.onerror = () => reject(tx.error)
      }),
  )
}

function idbDelete(store: string, key: string): Promise<void> {
  return openDb().then(
    (db) =>
      new Promise((resolve, reject) => {
        const tx = db.transaction(store, 'readwrite')
        tx.objectStore(store).delete(key)
        tx.oncomplete = () => resolve()
        tx.onerror = () => reject(tx.error)
      }),
  )
}

export function readUploadMeta(): Track[] {
  if (typeof window === 'undefined') return []
  try {
    const key = uploadMetaKey()
    let raw = localStorage.getItem(key)
    if (!raw && ownerId() === 'guest') {
      const legacy = localStorage.getItem(LEGACY_META_KEY)
      if (legacy) {
        localStorage.setItem(key, legacy)
        raw = legacy
      }
    }
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeUploadMeta(tracks: Track[]) {
  localStorage.setItem(uploadMetaKey(), JSON.stringify(tracks))
}

export function readOfflineTracks(): Track[] {
  if (typeof window === 'undefined') return []
  try {
    const parsed = JSON.parse(localStorage.getItem(offlineMetaKey()) || '[]')
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function isOfflineTrack(trackId: string): boolean {
  return readOfflineTracks().some((track) => track.id === trackId)
}

export async function getOfflineAudioUrl(trackId: string): Promise<string | null> {
  const key = offlineBlobKey(trackId)
  const cached = blobUrls.get(key)
  if (cached) return cached
  const blob = await idbGet<Blob>(AUDIO_STORE, key)
  if (!blob) return null
  const url = URL.createObjectURL(blob)
  blobUrls.set(key, url)
  return url
}

function rememberOffline(track: Track) {
  const next = [track, ...readOfflineTracks().filter((item) => item.id !== track.id)]
  localStorage.setItem(offlineMetaKey(), JSON.stringify(next))
  window.dispatchEvent(new Event('gansuni-offline'))
}

export async function saveOfflineTrack(track: Track): Promise<void> {
  const key = offlineBlobKey(track.id)
  if (track.audioUrl?.startsWith('idb:') || track.id.startsWith('local_')) {
    const existing = await idbGet<Blob>(AUDIO_STORE, track.id)
    if (!existing) throw new Error('That file is not on this device')
    await idbPut(AUDIO_STORE, key, existing)
  } else {
    const videoId = track.youtubeId || (track.id.startsWith('yt_') ? track.id.replace(/^yt_/, '') : null)
    const href = videoId ? `/api/stream?videoId=${encodeURIComponent(videoId)}` : track.audioUrl || ''
    if (!href) throw new Error('This track has no audio to save')
    const res = await fetch(href)
    if (!res.ok) throw new Error('The stream could not be saved')
    const blob = await res.blob()
    if (blob.size < 1024) throw new Error('The audio file came back empty')
    await idbPut(AUDIO_STORE, key, blob)
  }
  rememberOffline({ ...track, audioUrl: `idb:${key}` })
}

export async function removeOfflineTrack(trackId: string): Promise<void> {
  const key = offlineBlobKey(trackId)
  await idbDelete(AUDIO_STORE, key).catch(() => {})
  const url = blobUrls.get(key)
  if (url) URL.revokeObjectURL(url)
  blobUrls.delete(key)
  localStorage.setItem(offlineMetaKey(), JSON.stringify(readOfflineTracks().filter((track) => track.id !== trackId)))
  window.dispatchEvent(new Event('gansuni-offline'))
}

function readDuration(file: File): Promise<number> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file)
    const audio = new Audio()
    audio.preload = 'metadata'
    const done = (ms: number) => {
      URL.revokeObjectURL(url)
      resolve(ms)
    }
    audio.onloadedmetadata = () => {
      const ms = Math.round((audio.duration || 0) * 1000)
      done(Number.isFinite(ms) && ms > 0 ? ms : 180000)
    }
    audio.onerror = () => done(180000)
    audio.src = url
  })
}

async function shrinkCover(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file)
  const max = 480
  const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height))
  const width = Math.max(1, Math.round(bitmap.width * scale))
  const height = Math.max(1, Math.round(bitmap.height * scale))
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) return file
  ctx.drawImage(bitmap, 0, 0, width, height)
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.82))
  return blob || file
}

export async function getLocalAudioUrl(trackId: string): Promise<string | null> {
  const cached = blobUrls.get(trackId)
  if (cached) return cached
  const blob = await idbGet<Blob>(AUDIO_STORE, trackId)
  if (!blob) return null
  const url = URL.createObjectURL(blob)
  blobUrls.set(trackId, url)
  return url
}

export async function getLocalCoverUrl(trackId: string): Promise<string | null> {
  const key = `${trackId}:cover`
  const cached = blobUrls.get(key)
  if (cached) return cached
  const blob = await idbGet<Blob>(COVER_STORE, trackId)
  if (!blob) return null
  const url = URL.createObjectURL(blob)
  blobUrls.set(key, url)
  return url
}

export async function refreshStoredTracks(tracks: Track[]): Promise<Track[]> {
  return Promise.all(
    tracks.map(async (track) => {
      if (!track?.id?.startsWith('local_')) return track
      const cover = await getLocalCoverUrl(track.id)
      return {
        ...track,
        audioUrl: `idb:${track.id}`,
        album: track.album
          ? { ...track.album, coverArtUrl: cover || '' }
          : track.album,
      }
    }),
  )
}

export async function hydrateLocalTracks(): Promise<Track[]> {
  const meta = readUploadMeta()
  const hydrated = await Promise.all(
    meta.map(async (track) => {
      const cover = await getLocalCoverUrl(track.id)
      if (!cover || !track.album) return track
      return { ...track, album: { ...track.album, coverArtUrl: cover } }
    }),
  )
  return hydrated
}

export interface LocalUploadInput {
  audioFile: File
  coverFile?: File | null
  title: string
  artist: string
  album: string
}

export async function saveLocalUpload(input: LocalUploadInput): Promise<Track> {
  const id = `local_${Date.now().toString(36)}`
  const durationMs = await readDuration(input.audioFile)
  await idbPut(AUDIO_STORE, id, input.audioFile)
  let coverUrl = ''
  if (input.coverFile) {
    const cover = await shrinkCover(input.coverFile)
    await idbPut(COVER_STORE, id, cover)
    coverUrl = (await getLocalCoverUrl(id)) || ''
  }
  const now = new Date().toISOString()
  const artist = {
    id: `local_artist_${id}`,
    name: input.artist || 'Unknown Artist',
    slug: 'local-artist',
    verified: false,
    monthlyListeners: 0,
    createdAt: now,
    updatedAt: now,
  }
  const album = {
    id: `local_album_${id}`,
    title: input.album || 'Single',
    slug: 'local-album',
    artistId: artist.id,
    artist,
    coverArtUrl: coverUrl,
    totalTracks: 1,
    durationMs,
    albumType: 'SINGLE' as const,
    createdAt: now,
    updatedAt: now,
  }
  const track: Track = {
    id,
    title: input.title || 'Untitled Track',
    slug: 'local-track',
    artistId: artist.id,
    albumId: album.id,
    artist,
    album,
    audioUrl: `idb:${id}`,
    durationMs,
    trackNumber: 1,
    discNumber: 1,
    explicit: false,
    playCount: 0,
    isPremium: false,
    createdAt: now,
    updatedAt: now,
  }
  writeUploadMeta([track, ...readUploadMeta()])
  return { ...track, album: { ...album, coverArtUrl: coverUrl } }
}

export async function deleteLocalUpload(trackId: string): Promise<void> {
  await idbDelete(AUDIO_STORE, trackId).catch(() => {})
  await idbDelete(COVER_STORE, trackId).catch(() => {})
  const audioUrl = blobUrls.get(trackId)
  if (audioUrl) URL.revokeObjectURL(audioUrl)
  blobUrls.delete(trackId)
  const coverUrl = blobUrls.get(`${trackId}:cover`)
  if (coverUrl) URL.revokeObjectURL(coverUrl)
  blobUrls.delete(`${trackId}:cover`)
  writeUploadMeta(readUploadMeta().filter((t) => t.id !== trackId))
}
