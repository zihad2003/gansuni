import type { Album, Artist, Genre, Playlist, PlaylistTrack, Track } from '../types'

const NOW = '2024-06-01T00:00:00.000Z'

function artist(partial: Pick<Artist, 'id' | 'name' | 'slug' | 'bio' | 'avatarUrl' | 'monthlyListeners'>): Artist {
  return {
    verified: true,
    coverImageUrl: partial.avatarUrl,
    createdAt: NOW,
    updatedAt: NOW,
    ...partial,
  }
}

function album(
  partial: Pick<Album, 'id' | 'title' | 'slug' | 'artistId' | 'coverArtUrl' | 'totalTracks' | 'durationMs' | 'albumType'>,
  owner: Artist,
): Album {
  return {
    artist: owner,
    releaseDate: NOW,
    createdAt: NOW,
    updatedAt: NOW,
    ...partial,
  }
}

function track(
  partial: Pick<Track, 'id' | 'title' | 'slug' | 'durationMs' | 'playCount' | 'youtubeId' | 'trackNumber'>,
  owner: Artist,
  release: Album,
): Track {
  return {
    artistId: owner.id,
    albumId: release.id,
    artist: owner,
    album: release,
    audioUrl: `/api/stream?videoId=${partial.youtubeId}`,
    discNumber: 1,
    explicit: false,
    isPremium: false,
    createdAt: NOW,
    updatedAt: NOW,
    ...partial,
  }
}

const bannya = artist({
  id: 'artist_1',
  name: 'Rezwana Choudhury Bannya',
  slug: 'rezwana-choudhury-bannya',
  bio: 'Renowned exponent of Rabindra Sangeet.',
  avatarUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
  monthlyListeners: 850000,
})

const farida = artist({
  id: 'artist_2',
  name: 'Farida Parveen',
  slug: 'farida-parveen',
  bio: 'Legendary Lalon Sangeet vocalist of Bangladesh.',
  avatarUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80',
  monthlyListeners: 620000,
})

const coke = artist({
  id: 'artist_3',
  name: 'Coke Studio Bangla',
  slug: 'coke-studio-bangla',
  bio: 'Contemporary Bengali fusion from Coke Studio Bangla.',
  avatarUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80',
  monthlyListeners: 2400000,
})

const arnob = artist({
  id: 'artist_4',
  name: 'Arnob',
  slug: 'shayan-chowdhury-arnob',
  bio: 'Bengali musician, singer, and composer.',
  avatarUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&auto=format&fit=crop&q=80',
  monthlyListeners: 1100000,
})

const firoza = artist({
  id: 'artist_5',
  name: 'Firoza Begum',
  slug: 'firoza-begum',
  bio: 'Iconic Nazrul Geeti singer.',
  avatarUrl: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=600&auto=format&fit=crop&q=80',
  monthlyListeners: 730000,
})

export const EXPANDED_ARTISTS: Artist[] = [bannya, farida, coke, arnob, firoza]

const albumBannya = album(
  {
    id: 'album_1',
    title: 'Aguner Poroshmoni',
    slug: 'aguner-poroshmoni',
    artistId: bannya.id,
    coverArtUrl: bannya.avatarUrl || '',
    totalTracks: 1,
    durationMs: 245000,
    albumType: 'SINGLE',
  },
  bannya,
)
const albumFarida = album(
  {
    id: 'album_2',
    title: 'Shob Loke Koy Lalon',
    slug: 'shob-loke-koy-lalon',
    artistId: farida.id,
    coverArtUrl: farida.avatarUrl || '',
    totalTracks: 1,
    durationMs: 310000,
    albumType: 'SINGLE',
  },
  farida,
)
const albumCoke = album(
  {
    id: 'album_3',
    title: 'Nasek Nasek',
    slug: 'nasek-nasek-single',
    artistId: coke.id,
    coverArtUrl: coke.avatarUrl || '',
    totalTracks: 1,
    durationMs: 280000,
    albumType: 'SINGLE',
  },
  coke,
)
const albumArnob = album(
  {
    id: 'album_4',
    title: 'Hok Kolorob',
    slug: 'hok-kolorob-album',
    artistId: arnob.id,
    coverArtUrl: arnob.avatarUrl || '',
    totalTracks: 1,
    durationMs: 225000,
    albumType: 'ALBUM',
  },
  arnob,
)
const albumFiroza = album(
  {
    id: 'album_5',
    title: 'Karar Oi Louho Kapat',
    slug: 'karar-oi-louho-kapat',
    artistId: firoza.id,
    coverArtUrl: firoza.avatarUrl || '',
    totalTracks: 1,
    durationMs: 215000,
    albumType: 'SINGLE',
  },
  firoza,
)

export const EXPANDED_ALBUMS: Album[] = [albumBannya, albumFarida, albumCoke, albumArnob, albumFiroza]

export const EXPANDED_TRACKS: Track[] = [
  track(
    {
      id: 'track_1',
      title: 'Aguner Poroshmoni Choyao Prane',
      slug: 'aguner-poroshmoni',
      durationMs: 245000,
      playCount: 420000,
      youtubeId: '6w97fN5c44E',
      trackNumber: 1,
    },
    bannya,
    albumBannya,
  ),
  track(
    {
      id: 'track_2',
      title: 'Shob Loke Koy Lalon Ki Jat',
      slug: 'shob-loke-koy-lalon-ki-jat',
      durationMs: 310000,
      playCount: 380000,
      youtubeId: 'l1m4E-s1t8Y',
      trackNumber: 1,
    },
    farida,
    albumFarida,
  ),
  track(
    {
      id: 'track_3',
      title: 'Nasek Nasek',
      slug: 'nasek-nasek',
      durationMs: 280000,
      playCount: 1850000,
      youtubeId: 'QG802l6XUCA',
      trackNumber: 1,
    },
    coke,
    albumCoke,
  ),
  track(
    {
      id: 'track_4',
      title: 'Hok Kolorob',
      slug: 'hok-kolorob',
      durationMs: 225000,
      playCount: 950000,
      youtubeId: 'aJ-LgJc5v_s',
      trackNumber: 1,
    },
    arnob,
    albumArnob,
  ),
  track(
    {
      id: 'track_5',
      title: 'Karar Oi Louho Kapat',
      slug: 'karar-oi-louho-kapat',
      durationMs: 215000,
      playCount: 610000,
      youtubeId: 'jR_5908N3kE',
      trackNumber: 1,
    },
    firoza,
    albumFiroza,
  ),
]

export const NEW_RELEASES: Track[] = EXPANDED_TRACKS
export const POPULAR_INTERNET_TRACKS: Track[] = [...EXPANDED_TRACKS].sort((a, b) => b.playCount - a.playCount)
export const LIKED_SONGS_DEMO: Track[] = []

function playlistTrack(playlistId: string, song: Track, position: number): PlaylistTrack {
  return {
    playlistId,
    trackId: song.id,
    track: song,
    position,
    addedAt: NOW,
  }
}

export const FEATURED_PLAYLISTS: Playlist[] = [
  {
    id: 'pl_classics',
    name: 'Bangla Classics',
    description: 'Rabindra Sangeet, Nazrul Geeti, and Lalon — songs that stay.',
    coverArtUrl: albumBannya.coverArtUrl,
    ownerId: 'gansuni',
    isPublic: true,
    collaborative: false,
    tracks: [EXPANDED_TRACKS[0], EXPANDED_TRACKS[4], EXPANDED_TRACKS[1]].map((song, i) =>
      playlistTrack('pl_classics', song!, i),
    ),
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: 'pl_fusion',
    name: 'Fusion & Kolorob',
    description: 'Coke Studio Bangla and modern studio songs.',
    coverArtUrl: albumCoke.coverArtUrl,
    ownerId: 'gansuni',
    isPublic: true,
    collaborative: false,
    tracks: [EXPANDED_TRACKS[2], EXPANDED_TRACKS[3]].map((song, i) => playlistTrack('pl_fusion', song!, i)),
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: 'pl_evening',
    name: 'Evening Listening',
    description: 'A short mix of the full Gaansuni catalog.',
    coverArtUrl: albumArnob.coverArtUrl,
    ownerId: 'gansuni',
    isPublic: true,
    collaborative: false,
    tracks: EXPANDED_TRACKS.map((song, i) => playlistTrack('pl_evening', song, i)),
    createdAt: NOW,
    updatedAt: NOW,
  },
]

export const GENRES_DATA: Genre[] = [
  { id: 'g1', name: 'Rabindra Sangeet', slug: 'rabindra-sangeet', color: '#F59E0B', description: 'Timeless compositions by Rabindranath Tagore' },
  { id: 'g2', name: 'Coke Studio Bangla', slug: 'coke-studio-fusion', color: '#E1306C', description: 'Full-length Coke Studio Bangla sessions' },
  { id: 'g3', name: 'Bangla Folk & Baul', slug: 'bangla-folk', color: '#D97706', description: 'Lalon, Baul, and rural Bengal' },
  { id: 'g4', name: 'Nazrul Geeti', slug: 'nazrul-geeti', color: '#6366F1', description: 'Songs of Kazi Nazrul Islam' },
  { id: 'g5', name: 'Adhunik Bangla', slug: 'adhunik', color: '#0EA5E9', description: 'Modern classic and pop studio songs' },
  { id: 'g6', name: 'Bangla Rock', slug: 'bangla-rock', color: '#EF4444', description: 'Band hits, Arnob, and rock classics' },
]
