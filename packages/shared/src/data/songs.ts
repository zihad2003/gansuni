import type { Track, Playlist, Artist, Album, Genre } from '../types'

export const EXPANDED_ARTISTS: Artist[] = []
export const EXPANDED_ALBUMS: Album[] = []
export const EXPANDED_TRACKS: Track[] = []

export const NEW_RELEASES: Track[] = []
export const POPULAR_INTERNET_TRACKS: Track[] = []
export const LIKED_SONGS_DEMO: Track[] = []

export const FEATURED_PLAYLISTS: Playlist[] = []

export const GENRES_DATA: Genre[] = [
  { id: 'g1', name: 'Rabindra Sangeet', slug: 'rabindra-sangeet', color: '#F59E0B', description: 'Timeless compositions by Rabindranath Tagore' },
  { id: 'g2', name: 'Coke Studio Fusion', slug: 'coke-studio-fusion', color: '#E1306C', description: 'Full-length Coke Studio Bangla orchestration' },
  { id: 'g3', name: 'Bangla Folk & Baul', slug: 'bangla-folk', color: '#F59E0B', description: 'Acoustic melodies from rural Bengal' },
  { id: 'g4', name: 'Adhunik Bangla', slug: 'adhunik', color: '#6366F1', description: 'Modern classic & pop Bengali studio songs' },
]
