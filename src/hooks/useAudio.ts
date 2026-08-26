import { useEffect, useRef } from 'react'
import { useSoundtrack } from '@/store/soundtrackStore'
import { loadSoundtrackState } from '@/lib/soundtrackPersistence'

/**
 * Manages a singleton HTMLAudioElement that syncs with the soundtrack store.
 * Call this once — typically in the top-level <Soundtrack /> component.
 *
 * Subscribes only to the low-frequency UI context, so a 4×/sec timeupdate
 * never re-renders the tree that owns the audio element.
 */
export function useAudio() {
  const {
    currentTrack,
    isPlaying,
    volume,
    setCurrentTime,
    setDuration,
    setBuffering,
    next,
    seekRequest,
  } = useSoundtrack()

  const audioRef = useRef<HTMLAudioElement | null>(null)
  // One-shot position restore for the persisted track (never autoplay, just seek).
  const restoreRef = useRef<{ time: number; trackId: string } | null>(null)

  // Create the audio element once and note the persisted position.
  useEffect(() => {
    const audio = new Audio()
    audio.preload = 'metadata'
    audioRef.current = audio

    const restored = loadSoundtrackState()
    const trackId = restored?.currentTrackId
    const time = restored?.currentTime
    if (trackId && time != null && time > 0) {
      restoreRef.current = { time, trackId }
    }

    return () => {
      audio.pause()
      audio.src = ''
      audioRef.current = null
    }
  }, [])

  // Sync track changes
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    if (currentTrack) {
      audio.src = currentTrack.url
      audio.load()

      // Keep the hydrated position only for the exact restored track so a
      // refresh resumes mid-track; every other change starts clean.
      const shouldRestore = restoreRef.current?.trackId === currentTrack.id
      if (!shouldRestore) {
        restoreRef.current = null
        setCurrentTime(0)
        setDuration(0)
      }
    } else {
      audio.pause()
      audio.src = ''
    }
  }, [currentTrack, setCurrentTime, setDuration])

  // Sync play/pause
  useEffect(() => {
    const audio = audioRef.current
    if (!audio || !currentTrack) return

    if (isPlaying) {
      audio.play().catch(() => {
        // Gracefully handle — placeholder URLs won't load
      })
    } else {
      audio.pause()
    }
  }, [isPlaying, currentTrack])

  // Sync volume
  useEffect(() => {
    const audio = audioRef.current
    if (audio) audio.volume = volume
  }, [volume])

  // Apply explicit user seeks to the element. This is separate from the
  // timeupdate echo (setCurrentTime) — only a real seek request moves audio.
  useEffect(() => {
    if (!seekRequest) return
    const audio = audioRef.current
    if (!audio || !Number.isFinite(audio.duration) || audio.duration <= 0) return
    audio.currentTime = Math.min(seekRequest.t, audio.duration)
  }, [seekRequest])

  // Listen to audio events
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const onTimeUpdate = () => setCurrentTime(audio.currentTime)
    const onLoadedMetadata = () => {
      setDuration(audio.duration || 0)
      // Seek to the restored position on the first metadata load only.
      const pending = restoreRef.current
      restoreRef.current = null
      if (pending && audio.duration) {
        audio.currentTime = Math.min(pending.time, audio.duration)
      }
    }
    const onEnded = () => next()
    const onError = () => {
      // A track that won't load (bad URL / network) is non-critical — show a quiet
      // failure by clearing the buffering cue rather than throwing.
      setBuffering(false)
    }
    // Network stalls while a track streams → surface a subtle loading cue.
    const onWaiting = () => setBuffering(true)
    const onPlaying = () => setBuffering(false)
    const onCanPlay = () => setBuffering(false)

    audio.addEventListener('timeupdate', onTimeUpdate)
    audio.addEventListener('loadedmetadata', onLoadedMetadata)
    audio.addEventListener('ended', onEnded)
    audio.addEventListener('error', onError)
    audio.addEventListener('waiting', onWaiting)
    audio.addEventListener('stalled', onWaiting)
    audio.addEventListener('playing', onPlaying)
    audio.addEventListener('canplay', onCanPlay)

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate)
      audio.removeEventListener('loadedmetadata', onLoadedMetadata)
      audio.removeEventListener('ended', onEnded)
      audio.removeEventListener('error', onError)
      audio.removeEventListener('waiting', onWaiting)
      audio.removeEventListener('stalled', onWaiting)
      audio.removeEventListener('playing', onPlaying)
      audio.removeEventListener('canplay', onCanPlay)
    }
  }, [setCurrentTime, setDuration, setBuffering, next])
}
