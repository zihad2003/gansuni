import { NextResponse } from 'next/server'
import { getUploadedTracks } from '@/lib/trackStore'
import { EXPANDED_TRACKS } from '@gansuni/shared'

export async function GET() {
  try {
    const userTracks = getUploadedTracks()
    const allTracks = [...userTracks, ...EXPANDED_TRACKS]
    return NextResponse.json({
      userTracks,
      allTracks,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to fetch tracks' }, { status: 500 })
  }
}
