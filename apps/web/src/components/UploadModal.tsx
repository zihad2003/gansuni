'use client'

import { useState, useRef, type ReactNode } from 'react'
import Image from 'next/image'
import { UploadCloud, Music, Image as ImageIcon, X, Check, Loader2, Play } from 'lucide-react'
import { useAudioPlayer } from '@/store/useAudioPlayer'

interface UploadModalProps {
  isOpen: boolean
  onClose: () => void
}

export function UploadModal({ isOpen, onClose }: UploadModalProps): ReactNode {
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [coverPreview, setCoverPreview] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [artist, setArtist] = useState('')
  const [album, setAlbum] = useState('')
  const [genre, setGenre] = useState('Bangla Pop')
  const [isUploading, setIsUploading] = useState(false)
  const [uploadedTrack, setUploadedTrack] = useState<any | null>(null)
  const [error, setError] = useState<string | null>(null)

  const audioInputRef = useRef<HTMLInputElement>(null)
  const coverInputRef = useRef<HTMLInputElement>(null)
  
  const play = useAudioPlayer((s) => s.play)

  if (!isOpen) return null

  const handleAudioSelect = (file: File) => {
    setAudioFile(file)
    setError(null)
    if (!title) {
      // Auto fill title from filename
      const name = file.name.replace(/\.[^/.]+$/, '').replace(/_/g, ' ')
      setTitle(name)
    }
  }

  const handleCoverSelect = (file: File) => {
    setCoverFile(file)
    const reader = new FileReader()
    reader.onload = (e) => setCoverPreview(e.target?.result as string)
    reader.readAsDataURL(file)
  }

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!audioFile) {
      setError('Please select an MP3 audio file to upload')
      return
    }

    setIsUploading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('audioFile', audioFile)
      if (coverFile) formData.append('coverFile', coverFile)
      formData.append('title', title || 'Untitled Track')
      formData.append('artist', artist || 'Unknown Artist')
      formData.append('album', album || 'Single')
      formData.append('genre', genre)

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Upload failed')

      setUploadedTrack(data.track)
    } catch (err: any) {
      setError(err?.message || 'Failed to upload song')
    } finally {
      setIsUploading(false)
    }
  }

  const handlePlayUploaded = () => {
    if (uploadedTrack) {
      play(uploadedTrack, [uploadedTrack], 0)
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-xl bg-neutral-900 border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-colors"
        >
          <X size={18} />
        </button>

        {uploadedTrack ? (
          <div className="text-center py-6">
            <div className="w-16 h-16 rounded-full bg-[#1DB954]/20 text-[#1DB954] border border-[#1DB954]/40 flex items-center justify-center mx-auto mb-4">
              <Check size={32} />
            </div>
            <h2 className="text-2xl font-black text-white">গান সফলভাবে আপলোড হয়েছে!</h2>
            <p className="text-sm text-white/70 mt-1">
              "{uploadedTrack.title}" by {uploadedTrack.artist?.name} is ready for playback.
            </p>

            <div className="mt-6 flex justify-center gap-3">
              <button
                onClick={handlePlayUploaded}
                className="spotify-button flex items-center gap-2 font-bold px-6 py-2.5"
              >
                <Play size={18} fill="#000" strokeWidth={0} />
                Play Now
              </button>
              <button
                onClick={() => {
                  setUploadedTrack(null)
                  setAudioFile(null)
                  setCoverFile(null)
                  setCoverPreview(null)
                  setTitle('')
                  setArtist('')
                }}
                className="glass-button px-6 py-2.5"
              >
                Upload Another
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleUploadSubmit} className="space-y-5">
            <div>
              <h2 className="text-2xl font-black text-white flex items-center gap-2">
                <UploadCloud size={24} className="text-[#1DB954]" />
                <span>গান আপলোড করুন (Upload MP3)</span>
              </h2>
              <p className="text-xs text-white/60 mt-1">
                Upload your custom MP3, WAV, M4A, or FLAC songs directly into your local Gansuni library.
              </p>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-500/20 border border-red-500/40 text-red-300 text-xs font-semibold">
                {error}
              </div>
            )}

            {/* AUDIO FILE DROPZONE */}
            <div
              onClick={() => audioInputRef.current?.click()}
              className="border-2 border-dashed border-white/20 hover:border-[#1DB954] rounded-2xl p-6 text-center cursor-pointer transition-all bg-white/5 hover:bg-white/10"
            >
              <input
                ref={audioInputRef}
                type="file"
                accept="audio/*,.mp3,.wav,.m4a,.flac,.ogg"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleAudioSelect(e.target.files[0])}
              />
              <Music size={32} className="mx-auto text-[#1DB954] mb-2" />
              {audioFile ? (
                <div>
                  <span className="text-sm font-bold text-white">{audioFile.name}</span>
                  <span className="text-xs text-emerald-400 block mt-0.5">
                    {(audioFile.size / (1024 * 1024)).toFixed(2)} MB • Ready to upload
                  </span>
                </div>
              ) : (
                <div>
                  <span className="text-sm font-bold text-white">Select or Drag MP3 Audio File</span>
                  <span className="text-xs text-white/50 block mt-1">Supports MP3, WAV, M4A, FLAC, OGG</span>
                </div>
              )}
            </div>

            {/* METADATA INPUTS */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-white/70 block mb-1">Track Title (গানের নাম)</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Jhumka"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/10 border border-white/15 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#1DB954] text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-white/70 block mb-1">Artist Name (শিল্পী)</label>
                <input
                  type="text"
                  required
                  value={artist}
                  onChange={(e) => setArtist(e.target.value)}
                  placeholder="e.g. Muza / Shahi Chowdhury"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/10 border border-white/15 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#1DB954] text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-white/70 block mb-1">Album Title (অ্যালবাম)</label>
                <input
                  type="text"
                  value={album}
                  onChange={(e) => setAlbum(e.target.value)}
                  placeholder="e.g. Single / Album Name"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/10 border border-white/15 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#1DB954] text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-white/70 block mb-1">Genre (ধরণ)</label>
                <select
                  value={genre}
                  onChange={(e) => setGenre(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/10 border border-white/15 text-white focus:outline-none focus:ring-2 focus:ring-[#1DB954] text-sm"
                >
                  <option value="Bangla Pop" className="bg-neutral-900 text-white">Bangla Pop</option>
                  <option value="Rabindra Sangeet" className="bg-neutral-900 text-white">Rabindra Sangeet</option>
                  <option value="Nazrul Geeti" className="bg-neutral-900 text-white">Nazrul Geeti</option>
                  <option value="Bangla Folk & Baul" className="bg-neutral-900 text-white">Bangla Folk & Baul</option>
                  <option value="Bangla Rock" className="bg-neutral-900 text-white">Bangla Rock</option>
                  <option value="Hiphop BD" className="bg-neutral-900 text-white">Hiphop BD</option>
                </select>
              </div>
            </div>

            {/* COVER IMAGE PICKER */}
            <div>
              <label className="text-xs font-bold text-white/70 block mb-1">Cover Artwork (কভার ছবি - optional)</label>
              <div className="flex items-center gap-3">
                <input
                  ref={coverInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleCoverSelect(e.target.files[0])}
                />
                <button
                  type="button"
                  onClick={() => coverInputRef.current?.click()}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white text-xs font-semibold"
                >
                  <ImageIcon size={16} />
                  <span>Choose Cover Image</span>
                </button>
                {coverPreview && (
                  <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-white/20">
                    <Image src={coverPreview} alt="Cover preview" fill className="object-cover" />
                  </div>
                )}
              </div>
            </div>

            <div className="pt-3 flex justify-end gap-3">
              <button type="button" onClick={onClose} className="glass-button px-5 py-2 text-xs font-semibold">
                Cancel
              </button>
              <button
                type="submit"
                disabled={isUploading || !audioFile}
                className="spotify-button flex items-center gap-2 font-bold px-6 py-2.5 disabled:opacity-50 text-xs"
              >
                {isUploading ? <Loader2 size={16} className="animate-spin" /> : <UploadCloud size={16} />}
                <span>{isUploading ? 'Uploading...' : 'Save & Upload'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
