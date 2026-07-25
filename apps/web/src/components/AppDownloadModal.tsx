'use client'

import { useState, useEffect } from 'react'
import { Download, Smartphone, CheckCircle2, X, Sparkles, ShieldCheck } from 'lucide-react'

interface AppDownloadModalProps {
  isOpen: boolean
  onClose: () => void
}

export function AppDownloadModal({ isOpen, onClose }: AppDownloadModalProps) {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstall)

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true)
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall)
    }
  }, [])

  const handleInstallPWA = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      if (outcome === 'accepted') {
        setIsInstalled(true)
      }
      setDeferredPrompt(null)
    } else {
      alert('Gaansuni PWA App Install Instructions:\n\nAndroid Chrome: Tap menu ⋮ -> "Add to Home screen" or "Install App".\niOS Safari: Tap Share icon ➔ "Add to Home Screen".')
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md p-6 bg-gradient-to-b from-neutral-900 to-black border border-amber-500/30 rounded-3xl shadow-2xl overflow-hidden">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-all"
        >
          <X size={18} />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg text-black font-extrabold text-lg">
            GS
          </div>
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-1.5">
              Gaansuni App
              <Sparkles size={16} className="text-amber-500" />
            </h2>
            <p className="text-xs text-white/60">Offline Music Streaming • High Quality 320kbps</p>
          </div>
        </div>

        <div className="space-y-3 my-5">
          <div className="flex items-start gap-3 p-3 rounded-2xl bg-white/5 border border-white/10">
            <CheckCircle2 size={18} className="text-amber-500 mt-0.5 shrink-0" />
            <div className="text-xs">
              <span className="font-bold text-white block">Offline Music Downloads</span>
              <span className="text-white/70">Listen to all your favorite tracks without internet.</span>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-2xl bg-white/5 border border-white/10">
            <CheckCircle2 size={18} className="text-amber-500 mt-0.5 shrink-0" />
            <div className="text-xs">
              <span className="font-bold text-white block">Superfast Playback & Zero Buffering</span>
              <span className="text-white/70">Mobile-optimized interface and instant streaming.</span>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-2xl bg-white/5 border border-white/10">
            <ShieldCheck size={18} className="text-amber-500 mt-0.5 shrink-0" />
            <div className="text-xs">
              <span className="font-bold text-white block">100% Free & Open Source</span>
              <span className="text-white/70">Installable on Desktop and Mobile devices.</span>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          {isInstalled ? (
            <div className="w-full py-3 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-bold text-center text-sm">
              ✓ App Already Installed
            </div>
          ) : (
            <button
              onClick={handleInstallPWA}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-black font-extrabold text-sm flex items-center justify-center gap-2 hover:opacity-95 active:scale-98 transition-all shadow-xl"
            >
              <Download size={18} />
              <span>Install Mobile App / PWA</span>
            </button>
          )}

          <a
            href="https://github.com/zihad2003/gansuni/releases"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all border border-white/10"
          >
            <Smartphone size={16} className="text-amber-500" />
            <span>Direct Android APK Download</span>
          </a>
        </div>
      </div>
    </div>
  )
}
