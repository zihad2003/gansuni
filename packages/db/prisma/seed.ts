import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function seed() {
  console.log('🌱 Starting database seed...')

  const genres = [
    { name: 'Bangla Folk', slug: 'bangla-folk', color: '#1DB954' },
    { name: 'Rabindra Sangeet', slug: 'rabindra-sangeet', color: '#E1306C' },
    { name: 'Nazrul Geeti', slug: 'nazrul-geeti', color: '#F59E0B' },
    { name: 'Adhunik', slug: 'adhunik', color: '#6366F1' },
    { name: 'Baul', slug: 'baul', color: '#8B5CF6' },
    { name: 'Hiphop Bangladesh', slug: 'hiphop-bd', color: '#EC4899' },
    { name: 'Indie', slug: 'indie', color: '#14B8A6' },
    { name: 'Classical', slug: 'classical', color: '#F43F5E' },
  ]

  for (const genre of genres) {
    await prisma.genre.upsert({
      where: { slug: genre.slug },
      create: genre,
      update: genre,
    })
    console.log(`  ✅ Genre: ${genre.name}`)
  }

  const demoArtist = await prisma.artist.upsert({
    where: { slug: 'demo-artist' },
    create: {
      name: 'Demo Artist',
      slug: 'demo-artist',
      bio: 'A talented Bengali artist bringing soulful melodies to life.',
      verified: true,
      monthlyListeners: 125000,
    },
    update: {
      monthlyListeners: 125000,
    },
  })
  console.log(`  ✅ Artist: ${demoArtist.name}`)

  const demoAlbum = await prisma.album.upsert({
    where: { slug: 'demo-album' },
    create: {
      title: 'Demo Album',
      slug: 'demo-album',
      artistId: demoArtist.id,
      coverArtUrl: 'https://picsum.photos/seed/gansuni-album/600/600',
      releaseDate: new Date('2024-01-15'),
      totalTracks: 3,
      durationMs: 720000,
      albumType: 'ALBUM',
    },
    update: {},
  })
  console.log(`  ✅ Album: ${demoAlbum.title}`)

  const tracks = [
    {
      title: 'Amar Sonar Bangla',
      slug: 'amar-sonar-bangla',
      durationMs: 240000,
      trackNumber: 1,
      explicit: false,
      audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    },
    {
      title: 'Mon Re Krishi Kaj Jano Na',
      slug: 'mon-re-krishi',
      durationMs: 240000,
      trackNumber: 2,
      explicit: false,
      audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    },
    {
      title: 'Ogo Nodi Opono Dheu',
      slug: 'ogo-nodi-opono',
      durationMs: 240000,
      trackNumber: 3,
      explicit: false,
      audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    },
  ]

  for (const track of tracks) {
    await prisma.track.upsert({
      where: { slug: track.slug },
      create: {
        ...track,
        artistId: demoArtist.id,
        albumId: demoAlbum.id,
      },
      update: {},
    })
    console.log(`  ✅ Track: ${track.title}`)
  }

  console.log('\n✅ Database seeding completed successfully!')
}

seed()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
