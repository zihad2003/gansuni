import type { ReactNode } from 'react'
import { FEATURED_PLAYLISTS } from '@gansuni/shared'
import PlaylistDetailClient from './PlaylistDetailClient'

export function generateStaticParams() {
  return FEATURED_PLAYLISTS.map((p) => ({ id: p.id }))
}

export default function PlaylistPage(): ReactNode {
  return <PlaylistDetailClient />
}
