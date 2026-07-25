import type { ReactNode } from 'react'
import { EXPANDED_ALBUMS } from '@gansuni/shared'
import AlbumDetailClient from './AlbumDetailClient'

export function generateStaticParams() {
  const params = EXPANDED_ALBUMS.map((a) => ({ id: a.id }))
  return params.length > 0 ? params : [{ id: 'default' }]
}

export default function AlbumPage(): ReactNode {
  return <AlbumDetailClient />
}
