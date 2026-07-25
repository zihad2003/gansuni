import type { ReactNode } from 'react'
import { FEATURED_PLAYLISTS } from '@gansuni/shared'
import PlaylistDetailClient from './PlaylistDetailClient'

export function generateStaticParams() {
  const params = FEATURED_PLAYLISTS.map((p) => ({ id: p.id }))
  return params.length > 0 ? params : [{ id: 'default' }]
}

export default function PlaylistPage(): ReactNode {
  return <PlaylistDetailClient />
}
