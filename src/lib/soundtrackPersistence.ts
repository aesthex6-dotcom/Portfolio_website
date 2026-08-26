import type { Track } from '@/types'

/**
 * localStorage persistence for The Soundtrack.
 *
 * The key is versioned so we can invalidate stored sessions when the
 * schema changes. The `version` field mirrors the playlist version — bump
 * it in playlists.json to drop stale playlists from storage.
 */
const STORAGE_KEY = 'kumar:soundtrack:v1'

export interface PersistedSoundtrack {
  /** Playlist version this snapshot belongs to. */
  version: number
  playlist: Track[]
  currentTrackId: string | null
  volume: number
  currentTime: number
  isOpen: boolean
}

export function loadSoundtrackState(): Partial<PersistedSoundtrack> | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed: unknown = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') return null
    return parsed as Partial<PersistedSoundtrack>
  } catch {
    // Corrupt JSON, private mode, quota — treat as a fresh session.
    return null
  }
}

export function saveSoundtrackState(state: PersistedSoundtrack): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // Storage unavailable — non-critical, playback keeps working in-memory.
  }
}
