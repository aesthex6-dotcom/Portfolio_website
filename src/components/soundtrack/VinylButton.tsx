import { useSoundtrack } from '@/store/soundtrackStore'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { cn } from '@/lib/utils'
import vinylSrc from '@/icons/vinyl.svg'

/**
 * The music trigger — presentational. It does not position itself; the
 * utility dock owns placement so the floating controls behave as one system.
 */
export function VinylButton() {
  const { open, isPlaying } = useSoundtrack()
  const reduced = usePrefersReducedMotion()

  return (
    <button
      type="button"
      onClick={open}
      aria-label="Open The Soundtrack"
      className="grid h-14 w-14 cursor-pointer place-items-center rounded-full border border-edge bg-surface shadow-lift transition-[border-color,box-shadow] duration-300 hover:border-edge-strong hover:shadow-glow-2"
    >
      <img
        src={vinylSrc}
        alt=""
        draggable={false}
        className={cn('h-10 w-10 select-none', isPlaying && !reduced && 'animate-spin-slow')}
      />
    </button>
  )
}
