import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function seed() {
  console.log('🌱 Starting database seed for Gaansuni (Genres only, zero hardcoded tracks)...')

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

  console.log('\n✅ Database seeding completed with 0 static hardcoded tracks!')
}

seed()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
