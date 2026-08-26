import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import type { Track } from '@/types'
import playlistData from '@/data/playlists.json'
import {
  loadSoundtrackState,
  saveSoundtrackState,
  type PersistedSoundtrack,
} from '@/lib/soundtrackPersistence'
import { clamp } from '@/lib/utils'

const DEFAULT_PLAYLIST: Track[] = playlistData.tracks
const PLAYLIST_VERSION = playlistData.version
const DEFAULT_VOLUME = 0.7
// currentTime updates ~4×/sec — throttle writes so we don't hit localStorage on every tick.
const SAVE_THROTTLE_MS = 1000

/**
 * Low-frequency store state. The provider splits this from playback values
 * (currentTime/duration) so cheap consumers like the launcher and playlist
 * don't re-render ~4×/sec while a track is playing.
 */
export interface SoundtrackState {
  isOpen: boolean
  isPlaying: boolean
  isBuffering: boolean
  currentTrack: Track | null
  playlist: Track[]
  volume: number

  open: () => void
  close: () => void
  toggle: () => void
  play: (track: Track) => void
  pause: () => void
  resume: () => void
  togglePlay: () => void
  next: () => void
  prev: () => void
  setVolume: (v: number) => void
  /** Internal echo — written by the audio element's timeupdate. */
  setCurrentTime: (t: number) => void
  /** User seek intent — display updates now, and useAudio seeks the element. */
  seek: (t: number) => void
  /** Last seek request (nonce so repeated seeks to the same time still fire). */
  seekRequest: { t: number; n: number } | null
  setDuration: (d: number) => void
  setBuffering: (b: boolean) => void
}

/** High-frequency state — changes on every timeupdate. */
export interface SoundtrackPlaybackState {
  currentTime: number
  duration: number
}

const SoundtrackContext = createContext<SoundtrackState | null>(null)
const SoundtrackPlaybackContext = createContext<SoundtrackPlaybackState | null>(null)

export function SoundtrackProvider({ children }: { children: ReactNode }) {
  // Hydrate once — lazy initializers run a single time per mount.
  const [hydrated] = useState(() => loadSoundtrackState())

  // Restore the stored playlist only when it belongs to the current data version.
  const [playlist] = useState<Track[]>(() => {
    const stored = hydrated
    if (stored?.playlist?.length && stored.version === PLAYLIST_VERSION) return stored.playlist
    return DEFAULT_PLAYLIST
  })

  const [currentTrackId, setCurrentTrackId] = useState<string | null>(() => {
    const stored = hydrated
    if (stored?.currentTrackId && playlist.some((t) => t.id === stored.currentTrackId)) {
      return stored.currentTrackId
    }
    return null
  })

  const [volume, setVolumeState] = useState(() => clamp(hydrated?.volume ?? DEFAULT_VOLUME, 0, 1))
  const [currentTime, setCurrentTimeState] = useState(() => hydrated?.currentTime ?? 0)
  const [duration, setDurationState] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  // isPlaying intentionally starts false — never autoplay on refresh.
  const [isPlaying, setIsPlaying] = useState(false)
  const [isBuffering, setIsBuffering] = useState(false)

  const currentTrack = playlist.find((t) => t.id === currentTrackId) ?? null

  // ---- actions (all referentially stable) ----
  const open = useCallback(() => setIsOpen(true), [])
  const close = useCallback(() => setIsOpen(false), [])
  const toggle = useCallback(() => setIsOpen((v) => !v), [])

  const play = useCallback((track: Track) => {
    setCurrentTrackId(track.id)
    setIsPlaying(true)
    setIsBuffering(false)
    setCurrentTimeState(0)
    setDurationState(0)
  }, [])

  const pause = useCallback(() => {
    setIsPlaying(false)
    setIsBuffering(false)
  }, [])
  const resume = useCallback(() => setIsPlaying(true), [])

  /** Play/pause; starts the first track when nothing is selected yet. */
  const togglePlay = useCallback(() => {
    if (!currentTrack) {
      const first = playlist[0]
      if (first) play(first)
      return
    }
    setIsPlaying((v) => !v)
  }, [currentTrack, playlist, play])

  const next = useCallback(() => {
    if (!playlist.length) return
    const idx = currentTrackId ? playlist.findIndex((t) => t.id === currentTrackId) : -1
    const track = playlist[(idx + 1) % playlist.length]
    if (!track) return
    setCurrentTrackId(track.id)
    setCurrentTimeState(0)
    setDurationState(0)
  }, [playlist, currentTrackId])

  const prev = useCallback(() => {
    if (!playlist.length) return
    const idx = currentTrackId ? playlist.findIndex((t) => t.id === currentTrackId) : -1
    const track = playlist[(idx - 1 + playlist.length) % playlist.length]
    if (!track) return
    setCurrentTrackId(track.id)
    setCurrentTimeState(0)
    setDurationState(0)
  }, [playlist, currentTrackId])

  const setVolume = useCallback((v: number) => setVolumeState(clamp(v, 0, 1)), [])
  // timeupdate echo — the audio element is the source of truth for position.
  const setCurrentTime = useCallback((t: number) => setCurrentTimeState(t), [])
  // User seek — updates the display immediately and flags the audio element
  // to be seeked. The nonce lets consecutive seeks to the same time fire.
  const seekNonce = useRef(0)
  const [seekRequest, setSeekRequest] = useState<{ t: number; n: number } | null>(null)
  const seek = useCallback((t: number) => {
    setCurrentTimeState(t)
    setSeekRequest({ t, n: ++seekNonce.current })
  }, [])
  const setDuration = useCallback((d: number) => setDurationState(d), [])
  const setBuffering = useCallback((b: boolean) => setIsBuffering(b), [])

  // ---- persistence ----
  // Always-current snapshot so the pagehide flush writes the latest position.
  const snapshot = useRef<PersistedSoundtrack>({
    version: PLAYLIST_VERSION,
    playlist,
    currentTrackId,
    volume,
    currentTime,
    isOpen,
  })
  useEffect(() => {
    snapshot.current = { version: PLAYLIST_VERSION, playlist, currentTrackId, volume, currentTime, isOpen }
  }, [playlist, currentTrackId, volume, currentTime, isOpen])

  // Save immediately on anything meaningful (pause included — persists position).
  useEffect(() => {
    saveSoundtrackState(snapshot.current)
  }, [isOpen, volume, currentTrackId, playlist, isPlaying])

  // currentTime changes on every timeupdate — throttle those writes.
  const lastSave = useRef(0)
  useEffect(() => {
    const now = Date.now()
    if (now - lastSave.current >= SAVE_THROTTLE_MS) {
      lastSave.current = now
      saveSoundtrackState(snapshot.current)
    }
  }, [currentTime])

  // Final flush when the tab is hidden or closed.
  useEffect(() => {
    const flush = () => {
      if (document.visibilityState === 'hidden') saveSoundtrackState(snapshot.current)
    }
    window.addEventListener('pagehide', flush)
    document.addEventListener('visibilitychange', flush)
    return () => {
      window.removeEventListener('pagehide', flush)
      document.removeEventListener('visibilitychange', flush)
    }
  }, [])

  const uiValue = useMemo<SoundtrackState>(
    () => ({
      isOpen,
      isPlaying,
      isBuffering,
      currentTrack,
      playlist,
      volume,
      open,
      close,
      toggle,
      play,
      pause,
      resume,
      togglePlay,
      next,
      prev,
      setVolume,
      setCurrentTime,
      seek,
      seekRequest,
      setDuration,
      setBuffering,
    }),
    [
      isOpen,
      isPlaying,
      isBuffering,
      currentTrack,
      playlist,
      volume,
      open,
      close,
      toggle,
      play,
      pause,
      resume,
      togglePlay,
      next,
      prev,
      setVolume,
      setCurrentTime,
      seek,
      seekRequest,
      setDuration,
      setBuffering,
    ],
  )

  const playbackValue = useMemo<SoundtrackPlaybackState>(
    () => ({ currentTime, duration }),
    [currentTime, duration],
  )

  return (
    <SoundtrackContext.Provider value={uiValue}>
      <SoundtrackPlaybackContext.Provider value={playbackValue}>
        {children}
      </SoundtrackPlaybackContext.Provider>
    </SoundtrackContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useSoundtrack(): SoundtrackState {
  const ctx = useContext(SoundtrackContext)
  if (!ctx) throw new Error('useSoundtrack must be used inside <SoundtrackProvider>')
  return ctx
}

// eslint-disable-next-line react-refresh/only-export-components
export function useSoundtrackPlayback(): SoundtrackPlaybackState {
  const ctx = useContext(SoundtrackPlaybackContext)
  if (!ctx) throw new Error('useSoundtrackPlayback must be used inside <SoundtrackProvider>')
  return ctx
}
