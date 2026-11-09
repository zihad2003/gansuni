export interface Session {
  id: string
  name: string
  email: string
}

interface StoredAccount extends Session {
  salt: string
  hash: string
}

const ACCOUNTS_KEY = 'gansuni-accounts'
const SESSION_KEY = 'gansuni-session'
const LEGACY_PLAYER_KEY = 'gansuni-player'

function readAccounts(): StoredAccount[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(ACCOUNTS_KEY) || '[]')
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeAccounts(accounts: StoredAccount[]) {
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts))
}

export function readSession(): Session | null {
  if (typeof window === 'undefined') return null
  try {
    const parsed = JSON.parse(localStorage.getItem(SESSION_KEY) || 'null')
    if (!parsed?.id || !parsed?.email) return null
    return { id: parsed.id, name: parsed.name || 'Listener', email: parsed.email }
  } catch {
    return null
  }
}

export function ownerId(): string {
  return readSession()?.id || 'guest'
}

export function playerStorageKey(): string {
  return `gansuni-player:${ownerId()}`
}

export function migrateLegacyPlayer() {
  if (typeof window === 'undefined') return
  const guestKey = 'gansuni-player:guest'
  if (!localStorage.getItem(guestKey) && localStorage.getItem(LEGACY_PLAYER_KEY)) {
    localStorage.setItem(guestKey, localStorage.getItem(LEGACY_PLAYER_KEY) || '')
  }
}

function notify() {
  window.dispatchEvent(new Event('gansuni-account'))
}

function setSession(session: Session) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session))
  notify()
}

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

function hexToBytes(hex: string): Uint8Array {
  const out = new Uint8Array(hex.length / 2)
  for (let i = 0; i < out.length; i++) out[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16)
  return out
}

async function hashPassword(password: string, salt: Uint8Array): Promise<string> {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits'])
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: salt as BufferSource, iterations: 120000, hash: 'SHA-256' },
    key,
    256,
  )
  return bytesToHex(new Uint8Array(bits))
}

export async function signUp(name: string, email: string, password: string): Promise<Session> {
  const normalized = email.trim().toLowerCase()
  if (!normalized.includes('@')) throw new Error('Enter a valid email')
  if (password.length < 4) throw new Error('Password needs at least 4 characters')
  const accounts = readAccounts()
  if (accounts.some((account) => account.email === normalized)) {
    throw new Error('An account with this email already exists on this browser')
  }
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const account: StoredAccount = {
    id: `user_${crypto.randomUUID()}`,
    name: name.trim() || 'Listener',
    email: normalized,
    salt: bytesToHex(salt),
    hash: await hashPassword(password, salt),
  }
  writeAccounts([...accounts, account])
  const session = { id: account.id, name: account.name, email: account.email }
  setSession(session)
  return session
}

export async function signIn(email: string, password: string): Promise<Session> {
  const account = readAccounts().find((item) => item.email === email.trim().toLowerCase())
  if (!account) throw new Error('No account with that email on this browser')
  const hash = await hashPassword(password, hexToBytes(account.salt))
  if (hash !== account.hash) throw new Error('Wrong password')
  const session = { id: account.id, name: account.name, email: account.email }
  setSession(session)
  return session
}

export function signOut() {
  localStorage.removeItem(SESSION_KEY)
  notify()
}

export function exportSyncCode(): string {
  migrateLegacyPlayer()
  const payload = {
    v: 1,
    savedAt: new Date().toISOString(),
    player: JSON.parse(localStorage.getItem(playerStorageKey()) || 'null'),
  }
  const bytes = new TextEncoder().encode(JSON.stringify(payload))
  let binary = ''
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte)
  })
  return btoa(binary)
}

export function importSyncCode(code: string) {
  migrateLegacyPlayer()
  const binary = atob(code.trim())
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0))
  const payload = JSON.parse(new TextDecoder().decode(bytes))
  if (!payload || payload.v !== 1 || !payload.player) throw new Error('That sync code is not a Gaansuni library')
  const current = JSON.parse(localStorage.getItem(playerStorageKey()) || '{}')
  const incoming = payload.player
  const likedIds = Array.from(new Set([...(current.likedTrackIds || []), ...(incoming.likedTrackIds || [])]))
  const byId = new Map<string, { id: string }>()
  for (const track of [...(incoming.likedTracks || []), ...(current.likedTracks || [])]) {
    if (track?.id) byId.set(track.id, track)
  }
  const seen = new Set<string>()
  const history = []
  for (const track of [...(incoming.playedHistory || []), ...(current.playedHistory || [])]) {
    if (!track?.id || seen.has(track.id)) continue
    seen.add(track.id)
    history.push(track)
  }
  localStorage.setItem(
    playerStorageKey(),
    JSON.stringify({
      ...current,
      likedTrackIds: likedIds,
      likedTracks: likedIds.map((id) => byId.get(id)).filter(Boolean),
      playedHistory: history.slice(0, 50),
      volume: typeof current.volume === 'number' ? current.volume : incoming.volume,
      muted: current.muted ?? incoming.muted ?? false,
      repeat: current.repeat || incoming.repeat || 'off',
      shuffle: current.shuffle ?? incoming.shuffle ?? false,
    }),
  )
  notify()
}
