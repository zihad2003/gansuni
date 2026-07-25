// =============================================
// DOMAIN ENTITY TYPES — shared across Web + Mobile
// =============================================

export type ID = string
export type ISO8601 = string
export type Milliseconds = number
export type Bytes = number

export interface Artist {
  id: ID
  name: string
  slug: string
  bio?: string | null
  avatarUrl?: string | null
  coverImageUrl?: string | null
  verified: boolean
  monthlyListeners: number
  createdAt: ISO8601
  updatedAt: ISO8601
}

export interface Album {
  id: ID
  title: string
  slug: string
  artistId: ID
  artist?: Artist
  coverArtUrl: string
  releaseDate?: ISO8601 | null
  totalTracks: number
  durationMs: Milliseconds
  albumType: AlbumType
  genres?: Genre[]
  createdAt: ISO8601
  updatedAt: ISO8601
}

export type AlbumType = 'ALBUM' | 'SINGLE' | 'EP' | 'COMPILATION'

export interface Track {
  id: ID
  title: string
  slug: string
  artistId: ID
  albumId: ID
  artist?: Artist
  album?: Album
  audioUrl: string
  durationMs: Milliseconds
  trackNumber: number
  discNumber: number
  explicit: boolean
  lyrics?: string | null
  playCount: number
  isPremium: boolean
  features?: Artist[]
  createdAt: ISO8601
  updatedAt: ISO8601
}

export interface Genre {
  id: ID
  name: string
  slug: string
  color?: string | null
  description?: string | null
  iconUrl?: string | null
}

export interface Playlist {
  id: ID
  name: string
  description?: string | null
  coverArtUrl?: string | null
  ownerId: ID
  isPublic: boolean
  collaborative: boolean
  tracks?: PlaylistTrack[]
  createdAt: ISO8601
  updatedAt: ISO8601
}

export interface PlaylistTrack {
  playlistId: ID
  trackId: ID
  track?: Track
  position: number
  addedAt: ISO8601
}

export type PlaySource =
  | 'PLAYLIST'
  | 'ALBUM'
  | 'ARTIST'
  | 'SEARCH'
  | 'LIBRARY'
  | 'RADIO'
  | 'RECOMMENDATION'

export interface Like {
  id: ID
  userId: ID
  trackId?: ID | null
  albumId?: ID | null
  playlistId?: ID | null
  likedAt: ISO8601
}

export interface Download {
  id: ID
  userId: ID
  trackId: ID
  track?: Track
  fileSize: Bytes
  localPath?: string | null
  quality: AudioQuality
  downloadedAt: ISO8601
  expiresAt?: ISO8601 | null
  sha256Hash?: string | null
}

export type AudioQuality = 'LOW' | 'STANDARD' | 'HIGH' | 'LOSSLESS'

export interface User {
  id: ID
  email: string
  username?: string | null
  displayName: string
  avatarUrl?: string | null
  bio?: string | null
  role: UserRole
  createdAt: ISO8601
  updatedAt: ISO8601
}

export type UserRole = 'USER' | 'ARTIST' | 'PREMIUM' | 'ADMIN'

export interface PlayHistoryItem {
  id: ID
  userId: ID
  trackId: ID
  track?: Track
  playedAt: ISO8601
  progressMs: Milliseconds
  durationMs: Milliseconds
  completed: boolean
  source?: PlaySource | null
}

export type SearchEntityType =
  | 'TRACK'
  | 'ALBUM'
  | 'ARTIST'
  | 'PLAYLIST'
  | 'GENRE'
  | 'USER'

export interface SearchResult {
  entityType: SearchEntityType
  entityId: ID
  title: string
  subtitle?: string | null
  coverUrl?: string | null
  popularity: number
}
