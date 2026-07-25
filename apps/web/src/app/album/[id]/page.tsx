import type { ReactNode } from 'react'
import { EXPANDED_ALBUMS } from '@gansuni/shared'
import AlbumDetailClient from './AlbumDetailClient'

export function generateStaticParams() {
  return EXPANDED_ALBUMS.map((a) => ({ id: a.id }))
}

export default function AlbumPage(): ReactNode {
  return <AlbumDetailClient />
}
