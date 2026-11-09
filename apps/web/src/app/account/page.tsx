'use client'

import { useEffect, useState, type ReactNode } from 'react'
import { toast } from 'sonner'
import { Sidebar } from '@/components/Sidebar'
import { HeaderNav } from '@/components/HeaderNav'
import { exportSyncCode, importSyncCode, readSession, signIn, signOut, signUp, type Session } from '@/lib/account'

export default function AccountPage(): ReactNode {
  const [session, setSession] = useState<Session | null>(null)
  const [mode, setMode] = useState<'in' | 'up'>('in')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [syncCode, setSyncCode] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    const sync = () => setSession(readSession())
    sync()
    window.addEventListener('gansuni-account', sync)
    return () => window.removeEventListener('gansuni-account', sync)
  }, [])

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setBusy(true)
    try {
      if (mode === 'up') await signUp(name, email, password)
      else await signIn(email, password)
      setPassword('')
      toast.success(mode === 'up' ? 'Account created' : 'Signed in')
    } catch (err: any) {
      toast.error(err?.message || 'Could not sign in')
    } finally {
      setBusy(false)
    }
  }

  const onCopy = async () => {
    try {
      const code = exportSyncCode()
      setSyncCode(code)
      await navigator.clipboard.writeText(code)
      toast.success('Sync code copied')
    } catch {
      toast.error('Could not copy the sync code')
    }
  }

  const onImport = () => {
    try {
      importSyncCode(syncCode)
      toast.success('Library merged into this account')
    } catch (err: any) {
      toast.error(err?.message || 'Could not read that code')
    }
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-12">
        <section className="grid lg:grid-cols-[260px_1fr] gap-6 lg:gap-8">
          <Sidebar />
          <div className="min-w-0">
            <HeaderNav />
            <div className="max-w-xl space-y-6">
              <div>
                <h1 className="text-3xl font-black text-white">Account</h1>
                <p className="mt-2 text-sm text-white/70">
                  Likes and listening history stay with the signed-in profile on this browser. A sync code copies that library to another device.
                </p>
              </div>

              {session ? (
                <div className="glass-card-strong rounded-3xl p-6 space-y-4">
                  <div>
                    <div className="text-xs uppercase tracking-widest text-amber-400 font-bold">Signed in</div>
                    <div className="text-2xl font-black text-white mt-1">{session.name}</div>
                    <div className="text-sm text-white/60">{session.email}</div>
                  </div>
                  <button onClick={signOut} className="glass-button px-4 py-2 text-sm font-bold">
                    Sign out
                  </button>
                </div>
              ) : (
                <form onSubmit={onSubmit} className="glass-card-strong rounded-3xl p-6 space-y-4">
                  <div className="flex gap-2">
                    <button type="button" onClick={() => setMode('in')} className={`px-4 py-2 rounded-full text-xs font-bold ${mode === 'in' ? 'bg-white text-black' : 'text-white/70'}`}>
                      Sign in
                    </button>
                    <button type="button" onClick={() => setMode('up')} className={`px-4 py-2 rounded-full text-xs font-bold ${mode === 'up' ? 'bg-white text-black' : 'text-white/70'}`}>
                      Create account
                    </button>
                  </div>
                  {mode === 'up' && (
                    <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" className="w-full px-4 py-3 rounded-2xl bg-white/10 border border-white/15 text-white placeholder-white/40" />
                  )}
                  <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required placeholder="Email" className="w-full px-4 py-3 rounded-2xl bg-white/10 border border-white/15 text-white placeholder-white/40" />
                  <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required placeholder="Password" className="w-full px-4 py-3 rounded-2xl bg-white/10 border border-white/15 text-white placeholder-white/40" />
                  <button disabled={busy} className="gs-button px-5 py-2.5 font-bold disabled:opacity-50">
                    {busy ? 'Please wait…' : mode === 'up' ? 'Create account' : 'Sign in'}
                  </button>
                </form>
              )}

              <div className="glass-card-strong rounded-3xl p-6 space-y-3">
                <h2 className="text-lg font-black text-white">Link another device</h2>
                <p className="text-sm text-white/65">
                  Copy the code here, then paste it on the other device while signed into the same profile. Offline audio files stay on the device that saved them.
                </p>
                <textarea
                  value={syncCode}
                  onChange={(e) => setSyncCode(e.target.value)}
                  rows={4}
                  placeholder="Sync code"
                  className="w-full px-4 py-3 rounded-2xl bg-black/30 border border-white/15 text-white text-xs placeholder-white/40"
                />
                <div className="flex flex-wrap gap-2">
                  <button onClick={onCopy} className="gs-button px-4 py-2 text-sm font-bold">Copy my library</button>
                  <button onClick={onImport} className="glass-button px-4 py-2 text-sm font-bold">Merge this code</button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
