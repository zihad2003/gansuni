import { NextResponse } from 'next/server'
import type { Track } from '@gansuni/shared'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const query = searchParams.get('q') || searchParams.get('query') || 'Coke Studio Bangla'
    const limit = Math.min(25, parseInt(searchParams.get('limit') || '15', 10))

    // 1. Try Primary Open Saavn API mirrors for Full-Length 320kbps Bengali MP3 Streams
    const saavnEndpoints = [
      `https://saavn.dev/api/search/songs?query=${encodeURIComponent(query)}&limit=${limit}`,
      `https://saavn.me/search/songs?query=${encodeURIComponent(query)}&limit=${limit}`,
      `https://jiosaavn-api-private-us.vercel.app/search/songs?query=${encodeURIComponent(query)}&limit=${limit}`,
    ]

    for (const saavnUrl of saavnEndpoints) {
      try {
        const saavnRes = await fetch(saavnUrl, {
          headers: { 'Accept': 'application/json' },
          next: { revalidate: 3600 },
        })

        if (saavnRes.ok) {
          const saavnData = await saavnRes.json()
          const results = saavnData?.data?.results || saavnData?.results || saavnData?.data || []

        if (Array.isArray(results) && results.length > 0) {
          const saavnTracks: Track[] = results.map((item: any) => {
            const trackId = `saavn_${item.id}`
            const title = item.name || item.title || 'Untitled Track'
            const artistName = item.primaryArtists || item.artists?.primary?.[0]?.name || 'Bangla Artist'
            const albumTitle = item.album?.name || item.album || 'Single'

            // Extract best quality 500x500 artwork image
            const images = item.image || []
            const bestImage = Array.isArray(images)
              ? (images.find((img: any) => img.quality === '500x500')?.link || images[images.length - 1]?.link || images[0]?.link || '')
              : (typeof images === 'string' ? images : '')

            // Extract best quality 320kbps / 160kbps MP3 audio stream URL
            const downloadUrls = item.downloadUrl || item.media_url || []
            let streamUrl = ''

            if (Array.isArray(downloadUrls)) {
              const bestQuality =
                downloadUrls.find((d: any) => d.quality === '320kbps')?.url ||
                downloadUrls.find((d: any) => d.quality === '320kbps')?.link ||
                downloadUrls.find((d: any) => d.quality === '160kbps')?.url ||
                downloadUrls.find((d: any) => d.quality === '160kbps')?.link ||
                downloadUrls[downloadUrls.length - 1]?.url ||
                downloadUrls[downloadUrls.length - 1]?.link ||
                downloadUrls[0]?.url ||
                downloadUrls[0]?.link ||
                ''
              streamUrl = bestQuality
            } else if (typeof downloadUrls === 'string') {
              streamUrl = downloadUrls
            }
            if (streamUrl) {
              streamUrl = streamUrl.replace(/^http:/i, 'https:')
            }

            const durationSec = parseInt(item.duration || '210', 10)
            const durationMs = durationSec > 0 ? durationSec * 1000 : 210000

            return {
              id: trackId,
              title,
              slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
              artistId: `artist_${item.id}`,
              artist: {
                id: `artist_${item.id}`,
                name: artistName,
                slug: artistName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                bio: `Official release by ${artistName}`,
                avatarUrl: bestImage,
                verified: true,
                monthlyListeners: Math.floor(Math.random() * 500000) + 200000,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              },
              albumId: `album_${item.album?.id || item.id}`,
              album: {
                id: `album_${item.album?.id || item.id}`,
                title: albumTitle,
                slug: albumTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                artistId: `artist_${item.id}`,
                coverArtUrl: bestImage,
                totalTracks: 1,
                durationMs,
                albumType: 'SINGLE',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              },
              audioUrl: streamUrl,
              durationMs,
              trackNumber: 1,
              discNumber: 1,
              explicit: false,
              playCount: Math.floor(Math.random() * 3000000) + 500000,
              isPremium: false,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            }
          }).filter((t: Track) => !!t.audioUrl)

          if (saavnTracks.length > 0) {
            return NextResponse.json({
              query,
              source: 'Saavn Open API (Full 320kbps MP3)',
              count: saavnTracks.length,
              tracks: saavnTracks,
            })
          }
          }
        }
      } catch (saavnErr) {
        // Try next mirror endpoint
      }
    }

    // 2. Fallback to iTunes API
    const targetUrl = `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=song&limit=${limit}`
    const res = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json',
      },
      cache: 'no-store',
    })

    if (!res.ok) {
      throw new Error(`iTunes API responded with status ${res.status}`)
    }

    const data = await res.json()
    const results = (data.results || []).filter((item: any) => item && item.previewUrl)

    const tracks: Track[] = results.map((item: any) => {
      const trackId = `itunes_${item.trackId}`
      const artistName = item.artistName || 'Unknown Artist'
      const albumTitle = item.collectionName || 'Single'
      const coverArtUrl = (item.artworkUrl100 || item.artworkUrl60 || '').replace('100x100bb', '600x600bb')

      return {
        id: trackId,
        title: item.trackName || 'Untitled Track',
        slug: (item.trackName || 'track').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        artistId: `artist_${item.artistId || Math.random()}`,
        artist: {
          id: `artist_${item.artistId || Math.random()}`,
          name: artistName,
          slug: artistName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          bio: `Official release by ${artistName}`,
          avatarUrl: coverArtUrl,
          verified: true,
          monthlyListeners: Math.floor(Math.random() * 500000) + 100000,
          createdAt: item.releaseDate || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        albumId: `album_${item.collectionId || Math.random()}`,
        album: {
          id: `album_${item.collectionId || Math.random()}`,
          title: albumTitle,
          slug: albumTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          artistId: `artist_${item.artistId || Math.random()}`,
          coverArtUrl,
          releaseDate: item.releaseDate,
          totalTracks: item.trackCount || 1,
          durationMs: item.trackTimeMillis || 240000,
          albumType: item.trackCount > 1 ? 'ALBUM' : 'SINGLE',
          createdAt: item.releaseDate || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        audioUrl: (item.previewUrl || '').replace(/^http:/i, 'https:'),
        durationMs: item.trackTimeMillis || 240000,
        trackNumber: item.trackNumber || 1,
        discNumber: item.discNumber || 1,
        explicit: item.trackExplicitness === 'explicit',
        playCount: Math.floor(Math.random() * 2000000) + 500000,
        isPremium: false,
        createdAt: item.releaseDate || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    })

    return NextResponse.json({
      query,
      source: 'iTunes API Preview Streams',
      count: tracks.length,
      tracks,
    })
  } catch (error: any) {
    console.error('Live music search error:', error)
    return NextResponse.json({ error: error?.message || 'Failed to fetch live music' }, { status: 500 })
  }
}
