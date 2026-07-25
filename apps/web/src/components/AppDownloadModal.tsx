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
      alert('Gaansuni PWA App install instructions:\n\nAndroid Chrome: Click menu ⋮ -> "Add to Home screen" or "Install App".\niOS Safari: Click Share button ➔ "Add to Home Screen".')
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
              গানশুনি অ্যাপ (Gaansuni App)
              <Sparkles size={16} className="text-amber-500" />
            </h2>
            <p className="text-xs text-white/60">Offline Music Streaming • High Quality 320kbps</p>
          </div>
        </div>

        <div className="space-y-3 my-5">
          <div className="flex items-start gap-3 p-3 rounded-2xl bg-white/5 border border-white/10">
            <CheckCircle2 size={18} className="text-amber-500 mt-0.5 shrink-0" />
            <div className="text-xs">
              <span className="font-bold text-white block">অফলাইন মিউজিক ডাউনলোড</span>
              <span className="text-white/70">ইন্টারনেট ছাড়াও পছন্দের সব গান ফ্রি শুনুন।</span>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-2xl bg-white/5 border border-white/10">
            <CheckCircle2 size={18} className="text-amber-500 mt-0.5 shrink-0" />
            <div className="text-xs">
              <span className="font-bold text-white block">সুপারফাস্ট প্লেব্যাক & জিরো বাফারিং</span>
              <span className="text-white/70">মোবাইল ফ্রেন্ডলি অ্যাপ ইন্টারফেস।</span>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-2xl bg-white/5 border border-white/10">
            <ShieldCheck size={18} className="text-amber-500 mt-0.5 shrink-0" />
            <div className="text-xs">
              <span className="font-bold text-white block">১০০% ফ্রি & লিগ্যাল ওপেন সোর্স</span>
              <span className="text-white/70">পিসি ও মোবাইল দুই জায়গাতেই ইন্সটলযোগ্য।</span>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          {isInstalled ? (
            <div className="w-full py-3 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-bold text-center text-sm">
              ✓ অ্যাপ অলরেডি ইন্সটল করা আছে
            </div>
          ) : (
            <button
              onClick={handleInstallPWA}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-black font-extrabold text-sm flex items-center justify-center gap-2 hover:opacity-95 active:scale-98 transition-all shadow-xl"
            >
              <Download size={18} />
              <span>ইন্সটল অ্যাপ / Install Mobile App</span>
            </button>
          )}

          <a
            href="https://github.com/zihad2003/gansuni/releases"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all border border-white/10"
          >
            <Smartphone size={16} className="text-amber-500" />
            <span>ডাউনলোড অ্যান্ড্রয়েড APK (Direct APK Download)</span>
          </a>
        </div>
      </div>
    </div>
  )
}
