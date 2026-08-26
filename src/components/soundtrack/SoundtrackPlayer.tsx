import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useRef } from 'react'
import { useSoundtrack, useSoundtrackPlayback } from '@/store/soundtrackStore'
import { useDraggableWindow } from '@/hooks/useDraggableWindow'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { cn, formatTime } from '@/lib/utils'
import { Icon } from '@/components/ui/Icon'
import { PlaylistView } from './PlaylistView'

const FALLBACK_COVER = 'linear-gradient(135deg, #1f1f1f, #171717)'

/** Floating player panel — draggable anywhere on desktop, bottom sheet on mobile. */
export function SoundtrackPlayer() {
  const {
    isOpen,
    close,
    isPlaying,
    isBuffering,
    currentTrack,
    volume,
    togglePlay,
    next,
    prev,
    setVolume,
    seek,
  } = useSoundtrack()
  const { currentTime, duration } = useSoundtrackPlayback()
  const closeRef = useRef<HTMLButtonElement>(null)

  const isMobile = useMediaQuery('(max-width: 639px)')
  const win = useDraggableWindow({ id: 'soundtrack', defaultPos: { right: 24, bottom: 200 }, isMobile })

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0
  const artwork = currentTrack?.artwork
  const cover = artwork ? `linear-gradient(135deg, ${artwork.from}, ${artwork.to})` : FALLBACK_COVER

  // Focus into the panel, close on Escape, raise on open.
  useEffect(() => {
    if (!isOpen) return
    win.raise()
    closeRef.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  // `win.raise` is stable; `win` itself is recreated each render, so it must not be a dep.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, close, win.raise])

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!duration) return
    const rect = e.currentTarget.getBoundingClientRect()
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    seek(pct * duration)
  }

  // Mobile: full-width bottom sheet. Desktop: floating draggable window.
  const windowClass = isMobile
    ? 'no-print fixed inset-x-3 bottom-3 z-[75] flex max-h-[70vh] w-auto flex-col overflow-hidden rounded-2xl border border-edge bg-surface shadow-lift'
    : 'no-print flex w-[calc(100vw-3rem)] max-w-80 origin-bottom-right flex-col overflow-hidden rounded-2xl border border-edge bg-surface shadow-lift'

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={win.ref}
          className={windowClass}
          style={isMobile ? undefined : win.style}
          initial={{ opacity: 0, y: 24, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 24, scale: 0.97 }}
          transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
          role="dialog"
          aria-label="The Soundtrack player"
          onPointerDown={win.raise}
        >
          {/* Header — drag handle on desktop */}
          <div
            {...(!isMobile ? win.bind : {})}
            className="flex items-center justify-between border-b border-edge px-4 py-3"
          >
            <p className="font-display text-sm font-semibold text-ink">
              <span className="mr-1.5 text-faint">♫</span>
              The Soundtrack
            </p>
            <div className="flex items-center gap-1">
              {!isMobile && (
                <button
                  type="button"
                  onClick={win.reset}
                  className="grid h-7 w-7 place-items-center rounded-full text-faint transition-colors hover:bg-raised hover:text-ink"
                  aria-label="Reset position"
                  title="Reset to default position"
                >
                  <Icon name="target" size={13} />
                </button>
              )}
              <button
                ref={closeRef}
                type="button"
                onClick={close}
                className="grid h-8 w-8 place-items-center rounded-full text-faint transition-colors hover:bg-raised hover:text-ink"
                aria-label="Close player"
              >
                <Icon name="x" size={15} />
              </button>
            </div>
          </div>

          {/* Now Playing — artwork crossfades on track change */}
          <div className="flex items-center gap-3 px-4 pt-4 pb-2">
            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-edge/60 shadow-card">
              <AnimatePresence initial={false}>
                <motion.div
                  key={currentTrack?.id ?? 'empty'}
                  className="absolute inset-0"
                  style={{ background: cover }}
                  initial={{ opacity: 0, scale: 1.06 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                />
              </AnimatePresence>
            </div>
            <div className="min-w-0 flex-1" aria-live="polite">
              {currentTrack ? (
                <>
                  <p className="truncate font-display text-[15px] font-semibold text-ink">
                    {currentTrack.title}
                  </p>
                  <p className="truncate text-[12px] text-muted">{currentTrack.artist}</p>
                </>
              ) : (
                <p className="text-[13px] text-faint">Ready whenever you are.</p>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="px-4 pb-1">
            <div
              role="slider"
              tabIndex={0}
              aria-label="Track progress"
              aria-valuemin={0}
              aria-valuemax={duration || 0}
              aria-valuenow={Math.floor(currentTime)}
              aria-valuetext={duration ? `${formatTime(currentTime)} of ${formatTime(duration)}` : undefined}
              onClick={handleProgressClick}
              onKeyDown={(e) => {
                if (!duration) return
                if (e.key === 'ArrowRight') seek(Math.min(duration, currentTime + 5))
                if (e.key === 'ArrowLeft') seek(Math.max(0, currentTime - 5))
              }}
              className="group relative h-1.5 w-full cursor-pointer rounded-full bg-raised"
            >
              <div
                className="absolute inset-y-0 left-0 rounded-full bg-accent transition-[width] duration-150 ease-out"
                style={{ width: `${progress}%` }}
              />
              <div
                className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border border-accent bg-white opacity-0 transition-[left,opacity] duration-150 group-hover:opacity-100"
                style={{ left: `${progress}%` }}
              />
            </div>
            <div className="mt-1 flex justify-between font-mono text-[10px] text-faint">
              <span>{formatTime(currentTime)}</span>
              <span>{duration > 0 ? formatTime(duration) : '0:00'}</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-4 py-3">
            <button
              type="button"
              onClick={prev}
              className="grid h-9 w-9 place-items-center rounded-full text-muted transition-all hover:bg-raised hover:text-ink active:scale-95"
              aria-label="Previous track"
            >
              <Icon name="skip-previous" size={15} />
            </button>

            <button
              type="button"
              onClick={togglePlay}
              className={cn(
                'grid h-10 w-10 place-items-center rounded-full text-white transition-transform hover:scale-105 active:scale-95',
                currentTrack
                  ? 'bg-accent text-base'
                  : 'bg-raised text-faint',
              )}
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isBuffering && currentTrack ? (
                <Icon name="loader" size={16} className="animate-spin" />
              ) : isPlaying ? (
                <Icon name="pause" size={15} />
              ) : (
                <Icon name="play" size={15} className="ml-0.5" />
              )}
            </button>

            <button
              type="button"
              onClick={next}
              className="grid h-9 w-9 place-items-center rounded-full text-muted transition-all hover:bg-raised hover:text-ink active:scale-95"
              aria-label="Next track"
            >
              <Icon name="skip-next" size={15} />
            </button>
          </div>

          {/* Volume */}
          <div className="flex items-center gap-2 px-4 pb-3">
            <Icon name="volume-high" size={14} className="shrink-0 text-faint" />
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="range-input w-full"
              aria-label="Volume"
            />
          </div>

          {/* Divider */}
          <div className="border-t border-edge" />

          {/* Playlist */}
          <div className="px-3 py-3">
            <p className="mb-2 px-1 font-mono text-[10px] uppercase tracking-[0.2em] text-faint">
              Up Next
            </p>
            <PlaylistView />
          </div>

          {/* Credits — honest attribution for the streamed audio */}
          {currentTrack?.source && (
            <p className="border-t border-edge px-4 py-2 text-[9px] leading-snug text-faint">
              {currentTrack.source}
              {currentTrack.license ? ` · ${currentTrack.license}` : ''}
            </p>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
