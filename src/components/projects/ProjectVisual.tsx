import type { Project } from '@/types'
import { cn } from '@/lib/utils'

/**
 * The project cover plate — a quiet, abstract frame, not a fake browser
 * window. No chrome, no monogram tile, no fake code line, no brand gradients.
 * A faint grid, a cool key light, and the project's initial set as a ghosted
 * Sonder watermark — the same voice as the hero title. The real information
 * lives below in the card body; this is just atmosphere.
 */
export function ProjectVisual({
  project,
  className,
  badge = true,
}: {
  project: Project
  className?: string
  /** Show the floating status chip. Cards keep it; cinematic scenes let the
      spec rows below carry the status so the plate stays quiet. */
  badge?: boolean
}) {
  return (
    <div className={cn('relative aspect-[16/10] overflow-hidden rounded-t-2xl', className)}>
      {project.image ? (
        <img
          src={project.image}
          alt={`Screenshot of ${project.title}`}
          className="h-full w-full object-cover"
          loading="lazy"
        />
      ) : (
        <div className="relative h-full w-full bg-surface">
          {/* faint grid, masked to a soft patch of light */}
          <div className="absolute inset-0 bg-grid-faint bg-[size:22px_22px] opacity-25 [mask-image:radial-gradient(ellipse_90%_80%_at_30%_20%,black,transparent)]" />
          {/* cool key light — top-left, resting where the glyph will sit */}
          <div
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(circle at 28% 18%, rgba(245,247,242,0.04), transparent 55%)',
            }}
          />
          {/* ghosted Sonder initial — the glyph as a watermark, not a logo */}
          <span
            aria-hidden
            className="pointer-events-none absolute -bottom-12 -right-2 select-none font-hero text-[10rem] leading-none text-ink opacity-[0.07]"
          >
            {project.glyph}
          </span>
        </div>
      )}

      {/* status badge — optional; scenes suppress it */}
      {badge && (
        <span className="absolute right-3 top-3 rounded-full border border-edge bg-ground/60 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-muted backdrop-blur">
          {project.status}
        </span>
      )}
    </div>
  )
}
