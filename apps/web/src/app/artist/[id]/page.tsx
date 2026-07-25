import type { ReactNode } from 'react'
import { EXPANDED_ARTISTS } from '@gansuni/shared'
import ArtistDetailClient from './ArtistDetailClient'

export function generateStaticParams() {
  const params = EXPANDED_ARTISTS.map((a) => ({ id: a.id }))
  return params.length > 0 ? params : [{ id: 'default' }]
}

export default function ArtistPage(): ReactNode {
  return <ArtistDetailClient />
}
