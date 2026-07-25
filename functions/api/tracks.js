// Static tracks API — returns embedded tracks from shared package data
// On Cloudflare Pages, there's no filesystem, so uploaded tracks aren't persisted server-side.
// Upload functionality is local-only (dev mode).

export async function onRequestGet() {
  return Response.json({
    userTracks: [],
    allTracks: [],
  })
}
