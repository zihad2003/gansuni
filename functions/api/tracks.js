const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=60, s-maxage=300',
      ...CORS_HEADERS,
    },
  })
}

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS_HEADERS })
}

const STARTER_CATALOG = [
  {
    id: 'track_1',
    title: 'Aguner Poroshmoni Choyao Prane',
    slug: 'aguner-poroshmoni',
    artistId: 'artist_1',
    artist: {
      id: 'artist_1',
      name: 'Rezwana Choudhury Bannya',
      slug: 'rezwana-choudhury-bannya',
      bio: 'Renowned exponent of Rabindra Sangeet',
      avatarUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
      verified: true,
      monthlyListeners: 850000,
    },
    albumId: 'album_1',
    album: {
      id: 'album_1',
      title: 'Aguner Poroshmoni',
      slug: 'aguner-poroshmoni',
      artistId: 'artist_1',
      coverArtUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
      totalTracks: 1,
      durationMs: 245000,
      albumType: 'SINGLE',
    },
    audioUrl: '/api/stream?videoId=6w97fN5c44E&redirect=1',
    youtubeId: '6w97fN5c44E',
    durationMs: 245000,
    trackNumber: 1,
    discNumber: 1,
    explicit: false,
    playCount: 420000,
    isPremium: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'track_2',
    title: 'Shob Loke Koy Lalon Ki Jat',
    slug: 'shob-loke-koy-lalon-ki-jat',
    artistId: 'artist_2',
    artist: {
      id: 'artist_2',
      name: 'Farida Parveen',
      slug: 'farida-parveen',
      bio: 'Legendary Lalon Sangeet vocalist of Bangladesh',
      avatarUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80',
      verified: true,
      monthlyListeners: 620000,
    },
    albumId: 'album_2',
    album: {
      id: 'album_2',
      title: 'Shob Loke Koy Lalon',
      slug: 'shob-loke-koy-lalon',
      artistId: 'artist_2',
      coverArtUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80',
      totalTracks: 1,
      durationMs: 310000,
      albumType: 'SINGLE',
    },
    audioUrl: '/api/stream?videoId=l1m4E-s1t8Y&redirect=1',
    youtubeId: 'l1m4E-s1t8Y',
    durationMs: 310000,
    trackNumber: 1,
    discNumber: 1,
    explicit: false,
    playCount: 380000,
    isPremium: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'track_3',
    title: 'Nasek Nasek',
    slug: 'nasek-nasek',
    artistId: 'artist_3',
    artist: {
      id: 'artist_3',
      name: 'Coke Studio Bangla',
      slug: 'coke-studio-bangla',
      bio: 'Contemporary Bengali music fusion platform',
      avatarUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80',
      verified: true,
      monthlyListeners: 2400000,
    },
    albumId: 'album_3',
    album: {
      id: 'album_3',
      title: 'Nasek Nasek (Single)',
      slug: 'nasek-nasek-single',
      artistId: 'artist_3',
      coverArtUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80',
      totalTracks: 1,
      durationMs: 280000,
      albumType: 'SINGLE',
    },
    audioUrl: '/api/stream?videoId=QG802l6XUCA&redirect=1',
    youtubeId: 'QG802l6XUCA',
    durationMs: 280000,
    trackNumber: 1,
    discNumber: 1,
    explicit: false,
    playCount: 1850000,
    isPremium: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'track_4',
    title: 'Hok Kolorob',
    slug: 'hok-kolorob',
    artistId: 'artist_4',
    artist: {
      id: 'artist_4',
      name: 'Arnob',
      slug: 'shayan-chowdhury-arnob',
      bio: 'Bengali musician, singer and composer',
      avatarUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&auto=format&fit=crop&q=80',
      verified: true,
      monthlyListeners: 1100000,
    },
    albumId: 'album_4',
    album: {
      id: 'album_4',
      title: 'Hok Kolorob Album',
      slug: 'hok-kolorob-album',
      artistId: 'artist_4',
      coverArtUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&auto=format&fit=crop&q=80',
      totalTracks: 1,
      durationMs: 225000,
      albumType: 'ALBUM',
    },
    audioUrl: '/api/stream?videoId=aJ-LgJc5v_s&redirect=1',
    youtubeId: 'aJ-LgJc5v_s',
    durationMs: 225000,
    trackNumber: 1,
    discNumber: 1,
    explicit: false,
    playCount: 950000,
    isPremium: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'track_5',
    title: 'Karar Oi Louho Kapat',
    slug: 'karar-oi-louho-kapat',
    artistId: 'artist_5',
    artist: {
      id: 'artist_5',
      name: 'Firoza Begum',
      slug: 'firoza-begum',
      bio: 'Iconic Nazrul Geeti singer of the Indian subcontinent',
      avatarUrl: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=600&auto=format&fit=crop&q=80',
      verified: true,
      monthlyListeners: 730000,
    },
    albumId: 'album_5',
    album: {
      id: 'album_5',
      title: 'Karar Oi Louho Kapat',
      slug: 'karar-oi-louho-kapat',
      artistId: 'artist_5',
      coverArtUrl: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=600&auto=format&fit=crop&q=80',
      totalTracks: 1,
      durationMs: 215000,
      albumType: 'SINGLE',
    },
    audioUrl: '/api/stream?videoId=jR_5908N3kE&redirect=1',
    youtubeId: 'jR_5908N3kE',
    durationMs: 215000,
    trackNumber: 1,
    discNumber: 1,
    explicit: false,
    playCount: 610000,
    isPremium: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

export async function onRequestGet(context) {
  try {
    const db = context?.env?.DB
    if (db) {
      const query = `
        SELECT
          t.id, t.title, t.slug, t.audio_url as audioUrl, t.youtube_id as youtubeId,
          t.duration_ms as durationMs, t.track_number as trackNumber, t.disc_number as discNumber,
          t.explicit, t.play_count as playCount, t.is_premium as isPremium, t.created_at as createdAt,
          a.id as artistId, a.name as artistName, a.slug as artistSlug, a.bio as artistBio,
          a.avatar_url as artistAvatarUrl, a.verified as artistVerified, a.monthly_listeners as artistMonthlyListeners,
          alb.id as albumId, alb.title as albumTitle, alb.slug as albumSlug, alb.cover_art_url as albumCoverArtUrl
        FROM tracks t
        LEFT JOIN artists a ON t.artist_id = a.id
        LEFT JOIN albums alb ON t.album_id = alb.id
        ORDER BY t.play_count DESC
      `
      const { results } = await db.prepare(query).all()
      if (results && results.length > 0) {
        const tracks = results.map((r) => ({
          id: r.id,
          title: r.title,
          slug: r.slug,
          artistId: r.artistId,
          artist: {
            id: r.artistId,
            name: r.artistName || 'Unknown Artist',
            slug: r.artistSlug || 'unknown-artist',
            bio: r.artistBio || '',
            avatarUrl: r.artistAvatarUrl || '',
            verified: Boolean(r.artistVerified),
            monthlyListeners: r.artistMonthlyListeners || 0,
          },
          albumId: r.albumId,
          album: {
            id: r.albumId,
            title: r.albumTitle || 'Single',
            slug: r.albumSlug || 'single',
            artistId: r.artistId,
            coverArtUrl: r.albumCoverArtUrl || '',
          },
          audioUrl: r.audioUrl,
          youtubeId: r.youtubeId || null,
          durationMs: r.durationMs,
          trackNumber: r.trackNumber,
          discNumber: r.discNumber,
          explicit: Boolean(r.explicit),
          playCount: r.playCount,
          isPremium: Boolean(r.isPremium),
          createdAt: r.createdAt,
          updatedAt: r.createdAt,
        }))
        return jsonResponse({ userTracks: [], allTracks: tracks })
      }
    }
  } catch (e) {
    console.warn('D1 fetch failed, falling back to starter catalog:', e?.message)
  }

  return jsonResponse({
    userTracks: [],
    allTracks: STARTER_CATALOG,
  })
}
