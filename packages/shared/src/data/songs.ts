import type { Track, Playlist, Artist, Album, Genre } from '../types'

export const EXPANDED_ARTISTS: Artist[] = [
  {
    id: 'a1',
    name: 'Rabindranath Tagore',
    slug: 'rabindranath-tagore',
    bio: 'Bengali polymath, poet, writer, playwright, composer, philosopher, social reformer and painter.',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80',
    coverImageUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1200&auto=format&fit=crop&q=80',
    verified: true,
    monthlyListeners: 850400,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'a2',
    name: 'Coke Studio Bangla',
    slug: 'coke-studio-bangla',
    bio: 'Music platform showcasing legendary Bengali heritage combined with modern global genres.',
    avatarUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/4d/8f/f3/4d8ff378-a4fb-6dc4-f3f5-c6b6d73216e9/25UM1IM34721.rgb.jpg/600x600bb.jpg',
    coverImageUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=1200&auto=format&fit=crop&q=80',
    verified: true,
    monthlyListeners: 1420900,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
]

export const EXPANDED_ALBUMS: Album[] = [
  {
    id: 'al1',
    title: 'Coke Studio Bangla Season 2 & 3',
    slug: 'cs-bangla-season-2-3',
    artistId: 'a2',
    coverArtUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/4d/8f/f3/4d8ff378-a4fb-6dc4-f3f5-c6b6d73216e9/25UM1IM34721.rgb.jpg/600x600bb.jpg',
    totalTracks: 10,
    durationMs: 3100000,
    albumType: 'ALBUM',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
]

// Zero default/hardcoded tracks — relies 100% on live endpoints
export const EXPANDED_TRACKS: Track[] = []

export const NEW_RELEASES: Track[] = []
export const POPULAR_INTERNET_TRACKS: Track[] = []
export const LIKED_SONGS_DEMO: Track[] = []

export const FEATURED_PLAYLISTS: Playlist[] = [
  {
    id: 'p1',
    name: 'Coke Studio Bangla Full Hits',
    description: 'Full-length official Coke Studio Bangla season releases and fusion hits',
    coverArtUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/4d/8f/f3/4d8ff378-a4fb-6dc4-f3f5-c6b6d73216e9/25UM1IM34721.rgb.jpg/600x600bb.jpg',
    ownerId: 'u1',
    isPublic: true,
    collaborative: false,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 'p2',
    name: 'Morning Tagore Classics (Full Songs)',
    description: 'Complete full-length Rabindra Sangeet recordings and acoustic compositions',
    coverArtUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
    ownerId: 'u1',
    isPublic: true,
    collaborative: false,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
]

export const GENRES_DATA: Genre[] = [
  { id: 'g1', name: 'Rabindra Sangeet', slug: 'rabindra-sangeet', color: '#F59E0B', description: 'Timeless full compositions by Rabindranath Tagore' },
  { id: 'g2', name: 'Coke Studio Fusion', slug: 'coke-studio-fusion', color: '#E1306C', description: 'Full-length Coke Studio Bangla orchestration' },
  { id: 'g3', name: 'Bangla Folk & Baul', slug: 'bangla-folk', color: '#F59E0B', description: 'Complete acoustic melodies from rural Bengal' },
  { id: 'g4', name: 'Adhunik Bangla', slug: 'adhunik', color: '#6366F1', description: 'Modern classic & pop Bengali studio songs' },
]
