import { motion } from 'framer-motion'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { cn } from '@/lib/utils'

/** The house ease — calm, settled, cinematic. */
const EASE = [0.16, 1, 0.3, 1] as const

interface PhotoFrameProps {
  /** Drawing reference — e.g. "FIG. 01" */
  figure?: string
  /** Frame label — e.g. "PORTRAIT" */
  label?: string
  /** Placeholder caption when no photo is set — e.g. "Photo reserved" */
  caption?: string
  /** Photo URL; empty string renders the reserved frame. */
  photo?: string
  /** Alt text used only when a photo is present. */
  imgAlt?: string
  /** Shape of the mount. */
  aspect?: 'square' | 'portrait'
  /** Extra sizing classes (the frame is always aspect-locked). */
  className?: string
  /** Delay before the masked wipe-in, in seconds. */
  delay?: number
  /** Custom object-position for the photo (e.g., "center 30%" to center face). */
  objectPosition?: string
}

/**
 * PhotoFrame — a premium mount for a photograph.
 *
 * Drawn like a drawing registration: outer hairline, inner hairline, corner
 * ticks and a lit interior, so an empty mount is a deliberate reserved space
 * rather than a hollow box. When `photo` is empty a quiet aperture + caption
 * holds the frame; the moment a URL arrives the photograph mounts in its
 * place — monochrome-treated, beneath the same frame lines.
 *
 * The frame places itself with a masked wipe (clip-path curtain).
 */
export function PhotoFrame({
  figure = 'FIG. 01',
  label = 'PORTRAIT',
  caption = 'Photo reserved',
  photo,
  imgAlt = '',
  aspect = 'square',
  className,
  delay = 0.6,
  objectPosition,
}: PhotoFrameProps) {
  const reduced = usePrefersReducedMotion()

  return (
    <motion.div
      initial={reduced ? false : { clipPath: 'inset(0 0 100% 0)' }}
      animate={{ clipPath: 'inset(0 0 0% 0)' }}
      transition={{ duration: reduced ? 0 : 1.2, delay: reduced ? 0 : delay, ease: EASE }}
      className={cn(
        'relative shrink-0',
        aspect === 'square' ? 'aspect-square' : 'aspect-[4/5]',
        className,
      )}
    >
      {/* Lit interior — a ground plane inside the frame, never a hollow box. */}
      <div
        className="absolute inset-0 bg-[radial-gradient(120%_120%_at_28%_18%,rgba(245,247,242,0.05),transparent_58%)]"
        aria-hidden
      />

      {/* Outer hairline + registration ticks. The mount carries a whisper of
          backing fill and a soft drop — the frame is an object seated in the
          room, not a drawn rectangle. */}
      <div
        className="absolute inset-0 border border-edge bg-[rgba(245,247,242,0.015)] shadow-[inset_0_1px_0_rgba(245,247,242,0.05),0_16px_36px_rgba(0,0,0,0.3)]"
        aria-hidden
      />
      <span className="absolute -left-px -top-px h-3 w-3 border-l border-t border-edge-strong" aria-hidden />
      <span className="absolute -right-px -top-px h-3 w-3 border-r border-t border-edge-strong" aria-hidden />
      <span className="absolute -bottom-px -left-px h-3 w-3 border-b border-l border-edge-strong" aria-hidden />
      <span className="absolute -bottom-px -right-px h-3 w-3 border-b border-r border-edge-strong" aria-hidden />

      {/* Inner hairline — steps the frame, gives it depth. */}
      <div className="absolute inset-2 border border-edge/60" aria-hidden />

      {photo ? (
        <>
          <motion.img
            src={photo}
            alt={imgAlt}
            loading="eager"
            decoding="async"
            draggable={false}
            initial={reduced ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: reduced ? 0 : 0.9, ease: EASE }}
            className="absolute inset-2.5 object-cover grayscale contrast-[1.03] brightness-[0.94]"
            style={{ objectPosition: objectPosition }}
          />
          {/* Legibility scrim — the frame labels must stay readable over any
              photo, so the plate dims the bottom of the mount. */}
          <div
            className="pointer-events-none absolute inset-x-2.5 bottom-2.5 h-14 bg-gradient-to-t from-black/45 to-transparent"
            aria-hidden
          />
        </>
      ) : (
        <div className="absolute inset-2 flex flex-col items-center justify-center gap-4">
          {/* Aperture reference — a lens waiting for a subject, with a faint
              internal shading so it reads as an opening, not a ring. */}
          <div className="relative h-[42%] w-[42%] rounded-full border border-edge/80" aria-hidden>
            <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_35%_30%,rgba(245,247,242,0.05),transparent_70%)]" />
            <span
              className="absolute left-1/2 top-1/2 h-px w-3 -translate-x-1/2 -translate-y-1/2 bg-edge-strong"
              aria-hidden
            />
          </div>
          <p className="px-2 text-center font-mono text-[9px] uppercase tracking-[0.24em] text-faint">
            {caption}
          </p>
        </div>
      )}

      {/* Frame annotation — the drawing labels itself. */}
      <div className="pointer-events-none absolute inset-2 flex items-end justify-between">
        <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-faint">
          {figure}
        </span>
        <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-faint">
          {label}
        </span>
      </div>
    </motion.div>
  )
}
