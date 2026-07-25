export async function onRequestGet(context) {
  try {
    const url = new URL(context.request.url)
    const query = url.searchParams.get('q') || url.searchParams.get('query') || 'Coke Studio Bangla'
    const limit = Math.min(30, parseInt(url.searchParams.get('limit') || '20', 10))

    const allTracks = []
    const trackTitlesSet = new Set()

    // 1. iTunes Apple Music Catalog
    try {
      const itunesRes = await fetch(
        `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&country=BD&entity=song&limit=${limit}`,
        { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', Accept: 'application/json' } }
      )
      if (itunesRes.ok) {
        const itunesData = await itunesRes.json()
        for (const item of (itunesData?.results || [])) {
          if (!item?.trackName) continue
          const title = item.trackName
          const artistName = item.artistName || 'Artist'
          const normKey = `${title.toLowerCase()}_${artistName.toLowerCase()}`
          if (trackTitlesSet.has(normKey)) continue
          trackTitlesSet.add(normKey)

          const coverArtUrl = (item.artworkUrl100 || '').replace('100x100bb', '600x600bb')
          const durationMs = item.trackTimeMillis || 240000

          allTracks.push({
            id: `itunes_${item.trackId}`,
            title,
            slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            artistId: `artist_${item.artistId || Math.random()}`,
            artist: {
              id: `artist_${item.artistId || Math.random()}`,
              name: artistName,
              slug: artistName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
              bio: `Official release by ${artistName}`,
              avatarUrl: coverArtUrl,
              verified: true,
              monthlyListeners: Math.floor(Math.random() * 800000) + 200000,
              createdAt: item.releaseDate || new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
            albumId: `album_${item.collectionId || Math.random()}`,
            album: {
              id: `album_${item.collectionId || Math.random()}`,
              title: item.collectionName || 'Single',
              slug: (item.collectionName || 'single').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
              artistId: `artist_${item.artistId || Math.random()}`,
              coverArtUrl,
              releaseDate: item.releaseDate,
              totalTracks: item.trackCount || 1,
              durationMs,
              albumType: item.trackCount > 1 ? 'ALBUM' : 'SINGLE',
              createdAt: item.releaseDate || new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
            audioUrl: `https://discoveryprovider.audius.co/v1/tracks/search?query=${encodeURIComponent(artistName + ' ' + title)}&app_name=Gaansuni`,
            durationMs,
            trackNumber: item.trackNumber || 1,
            discNumber: item.discNumber || 1,
            explicit: item.trackExplicitness === 'explicit',
            playCount: Math.floor(Math.random() * 3000000) + 500000,
            isPremium: false,
            createdAt: item.releaseDate || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          })
        }
      }
    } catch {}

    // 2. Audius Open Catalog
    try {
      const audiusRes = await fetch(
        `https://discoveryprovider.audius.co/v1/tracks/search?query=${encodeURIComponent(query)}&app_name=Gaansuni`,
        { headers: { Accept: 'application/json' } }
      )
      if (audiusRes.ok) {
        const audiusData = await audiusRes.json()
        for (const item of (audiusData?.data || [])) {
          if (!item?.title) continue
          const title = item.title
          const artistName = item.user?.name || item.user?.handle || 'Bengali Artist'
          const normKey = `${title.toLowerCase()}_${artistName.toLowerCase()}`
          if (trackTitlesSet.has(normKey)) continue
          trackTitlesSet.add(normKey)

          const coverArtUrl = item.artwork?.['480x480'] || item.artwork?.['150x150'] || item.user?.profile_picture?.['480x480'] || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80'
          const durationSec = Math.max(120, parseInt(item.duration || '240', 10))
          const durationMs = durationSec * 1000

          allTracks.push({
            id: `audius_${item.id}`,
            title,
            slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            artistId: `artist_${item.user?.id || item.id}`,
            artist: {
              id: `artist_${item.user?.id || item.id}`,
              name: artistName,
              slug: artistName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
              bio: item.user?.bio || `Official release by ${artistName}`,
              avatarUrl: coverArtUrl,
              verified: true,
              monthlyListeners: item.user?.follower_count || Math.floor(Math.random() * 500000) + 200000,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
            albumId: `album_${item.id}`,
            album: {
              id: `album_${item.id}`,
              title: `${title} - Full Version`,
              slug: `${title}-album`.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
              artistId: `artist_${item.user?.id || item.id}`,
              coverArtUrl,
              totalTracks: 1,
              durationMs,
              albumType: 'SINGLE',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
            audioUrl: `https://discoveryprovider.audius.co/v1/tracks/${item.id}/stream?app_name=Gaansuni`,
            durationMs,
            trackNumber: 1,
            discNumber: 1,
            explicit: false,
            playCount: item.play_count || Math.floor(Math.random() * 3000000) + 500000,
            isPremium: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          })
        }
      }
    } catch {}

    // 3. JioSaavn Web API
    try {
      const saavnRes = await fetch(
        `https://www.jiosaavn.com/api.php?__call=search.getResults&_format=json&_marker=0&api_version=4&ctx=web6dot0&p=1&n=${limit}&q=${encodeURIComponent(query)}`,
        { headers: { 'User-Agent': 'Mozilla/5.0' } }
      )
      if (saavnRes.ok) {
        const saavnData = await saavnRes.json()
        for (const item of (saavnData?.results || [])) {
          if (!item || (!item.title && !item.song)) continue
          const title = (item.title || item.song).replace(/&quot;/g, '"').replace(/&#039;/g, "'")
          const artistName = (item.more_info?.artistMap?.primary_artists?.[0]?.name || item.singers || 'Artist').replace(/&quot;/g, '"')
          const normKey = `${title.toLowerCase()}_${artistName.toLowerCase()}`
          if (trackTitlesSet.has(normKey)) continue
          trackTitlesSet.add(normKey)

          let coverArtUrl = item.image || ''
          coverArtUrl = coverArtUrl.replace('150x150', '500x500').replace('50x50', '500x500')
          if (!coverArtUrl || coverArtUrl.includes('default')) {
            coverArtUrl = 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80'
          }

          const streamUrl = (item.more_info?.vlink || item.media_url || `https://discoveryprovider.audius.co/v1/tracks/search?query=${encodeURIComponent(title)}&app_name=Gaansuni`).replace(/^http:/i, 'https:')
          const durationSec = parseInt(item.more_info?.duration || item.duration || '210', 10)
          const durationMs = durationSec > 0 ? durationSec * 1000 : 210000

          allTracks.push({
            id: `saavn_${item.id}`,
            title,
            slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            artistId: `artist_${item.id}`,
            artist: {
              id: `artist_${item.id}`,
              name: artistName,
              slug: artistName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
              bio: `Official release by ${artistName}`,
              avatarUrl: coverArtUrl,
              verified: true,
              monthlyListeners: Math.floor(Math.random() * 500000) + 200000,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
            albumId: `album_${item.album_id || item.id}`,
            album: {
              id: `album_${item.album_id || item.id}`,
              title: (item.album || 'Single').replace(/&quot;/g, '"'),
              slug: (item.album || 'single').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
              artistId: `artist_${item.id}`,
              coverArtUrl,
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
          })
        }
      }
    } catch {}

    return Response.json({
      query,
      source: 'Multi-Source Hybrid Search Engine (iTunes + Audius + JioSaavn)',
      count: allTracks.length,
      tracks: allTracks,
    })
  } catch (error) {
    return Response.json({ error: error?.message || 'Failed to fetch live music' }, { status: 500 })
  }
}
