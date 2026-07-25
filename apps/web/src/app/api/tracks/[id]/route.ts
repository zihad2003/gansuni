import { NextResponse } from 'next/server'
import { deleteUploadedTrack } from '@/lib/trackStore'

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const trackId = params.id
    const success = deleteUploadedTrack(trackId)
    if (!success) {
      return NextResponse.json({ error: 'Track not found or failed to delete' }, { status: 404 })
    }
    return NextResponse.json({ success: true, message: 'Track deleted successfully' })
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to delete track' }, { status: 500 })
  }
}
