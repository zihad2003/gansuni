import type { ReactNode } from 'react'
import { EXPANDED_ARTISTS } from '@gansuni/shared'
import ArtistDetailClient from './ArtistDetailClient'

export function generateStaticParams() {
  return EXPANDED_ARTISTS.map((a) => ({ id: a.id }))
}

export default function ArtistPage(): ReactNode {
  return <ArtistDetailClient />
}
