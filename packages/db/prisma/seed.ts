import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function seed() {
  console.log('🌱 Starting database seed for Gaansuni...')

  const genres = [
    { name: 'Bangla Folk', slug: 'bangla-folk', color: '#F59E0B' },
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
    where: { slug: 'gaansuni-artist' },
    create: {
      name: 'Gaansuni Master Artist',
      slug: 'gaansuni-artist',
      bio: 'Iconic Bengali artist bringing authentic acoustic melodies to Gaansuni.',
      verified: true,
      monthlyListeners: 850000,
    },
    update: {
      monthlyListeners: 850000,
    },
  })
  console.log(`  ✅ Artist: ${demoArtist.name}`)

  const demoAlbum = await prisma.album.upsert({
    where: { slug: 'gaansuni-classics' },
    create: {
      title: 'Gaansuni Master Classics',
      slug: 'gaansuni-classics',
      artistId: demoArtist.id,
      coverArtUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
      releaseDate: new Date('2025-01-01'),
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
      audioUrl: 'https://raw.githubusercontent.com/mdn/webaudio-examples/main/audio-analyser/vibes.mp3',
    },
    {
      title: 'Mon Re Krishi Kaj Jano Na',
      slug: 'mon-re-krishi',
      durationMs: 240000,
      trackNumber: 2,
      explicit: false,
      audioUrl: 'https://commondatastorage.googleapis.com/codeskulptor-demos/DinoJazz.mp3',
    },
    {
      title: 'Ogo Nodi Opono Dheu',
      slug: 'ogo-nodi-opono',
      durationMs: 240000,
      trackNumber: 3,
      explicit: false,
      audioUrl: 'https://raw.githubusercontent.com/rafaelreis-hotmart/Audio-Sample-files/main/sample.mp3',
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
      update: {
        audioUrl: track.audioUrl,
      },
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
