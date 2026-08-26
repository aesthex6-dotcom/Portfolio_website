import type { CSSProperties } from 'react'
import { cn } from '@/lib/utils'

/**
 * The icon system — Streamline Core Line (1.5px, round-cap) plus a small set
 * of custom glyphs drawn in the same language.
 *
 * Every icon is a quiet, single-weight line mark on a 14×14 grid. No fills,
 * no colored tiles, no multi-hue noise. Hierarchy comes from size + tone
 * (faint → muted → ink) and stroke weight, never from color.
 *
 * Brand marks that can't live in the line language (GitHub's octocat) stay in
 * lucide-react; logos are exempt from the system.
 */

// 35 bundled Streamline Core Line icons, inlined raw at build time.
const STREAMLINE = import.meta.glob('/src/icons/core/*.svg', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

/** Streamline file name → semantic icon name. */
const FILES: Record<string, string> = {
  alert: '/src/icons/core/alert.svg',
  bookmark: '/src/icons/core/bookmark.svg',
  brain: '/src/icons/core/brain.svg',
  check: '/src/icons/core/check.svg',
  cloud: '/src/icons/core/cloud.svg',
  code: '/src/icons/core/code.svg',
  cpu: '/src/icons/core/cpu.svg',
  database: '/src/icons/core/database.svg',
  download: '/src/icons/core/download.svg',
  eye: '/src/icons/core/eye.svg',
  file: '/src/icons/core/file.svg',
  folder: '/src/icons/core/folder.svg',
  globe: '/src/icons/core/globe.svg',
  home: '/src/icons/core/home.svg',
  info: '/src/icons/core/info.svg',
  linkedin: '/src/icons/core/linkedin.svg',
  // NOTE: no `github` here — the octocat can't live in the 1.5px line
  // language, so the brand mark stays in lucide-react (logo-exempt).
  location: '/src/icons/core/location.svg',
  mail: '/src/icons/core/mail.svg',
  monitor: '/src/icons/core/monitor.svg',
  moon: '/src/icons/core/moon.svg',
  music: '/src/icons/core/music.svg',
  pause: '/src/icons/core/pause.svg',
  phone: '/src/icons/core/phone.svg',
  play: '/src/icons/core/play.svg',
  search: '/src/icons/core/search.svg',
  server: '/src/icons/core/server.svg',
  settings: '/src/icons/core/settings.svg',
  share: '/src/icons/core/share.svg',
  'skip-next': '/src/icons/core/skip-next.svg',
  'skip-previous': '/src/icons/core/skip-previous.svg',
  star: '/src/icons/core/star.svg',
  user: '/src/icons/core/user.svg',
  'volume-high': '/src/icons/core/volume-high.svg',
  'volume-off': '/src/icons/core/volume-off.svg',
  x: '/src/icons/core/x.svg',
}

/** Custom glyphs — hand-drawn on the same 14×14 grid. */
const CUSTOM: Record<string, string> = {
  'arrow-left': '<path d="M12.5 7h-10M6.2 2.6 1.6 7l4.6 4.4"/>',
  'arrow-right': '<path d="M1.5 7h10M7.8 2.6 12.4 7 7.8 11.4"/>',
  'arrow-up': '<path d="M7 12.5v-10M2.6 6.2 7 1.6l4.4 4.6"/>',
  'arrow-up-right': '<path d="M4.5 9.5 9.5 4.5M9.5 4.5H5.8m3.7 0v3.7"/>',
  award:
    '<circle cx="7" cy="3.8" r="2.6"/><path d="m4.8 7.3 1.2 4.6L7 10.5l1 1.4 1.2-4.6"/>',
  'badge-check':
    '<path d="M7 1.5 11.5 3.5V7c0 2.8-1.9 4.7-4.5 5.5C4.4 11.7 2.5 9.8 2.5 7V3.5Z"/><path d="m4.9 7 1.4 1.4 2.8-2.9"/>',
  'book-open':
    '<path d="M7 4.5C5.8 3 3.8 2.5 1.5 2.5v9c2.3 0 4.3.5 5.5 2 1.2-1.5 3.2-2 5.5-2v-9c-2.3 0-4.3.5-5.5 2Z"/><path d="M7 4.5v9"/>',
  bot: '<path d="M4 5.5h6a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2Z"/><path d="M7 3.5V5.5M4 8.6h.01M9 8.6h.01"/>',
  'chevron-down': '<path d="m3 5.5 4 4 4-4"/>',
  clock:
    '<circle cx="7" cy="7" r="5.5"/><path d="M7 4v3l2 1.6"/>',
  command:
    '<path d="M10 2.5a1.5 1.5 0 0 0-1.5 1.5v6a1.5 1.5 0 0 0 1.5 1.5 1.5 1.5 0 0 0 1.5-1.5 1.5 1.5 0 0 0-1.5-1.5H4a1.5 1.5 0 0 0-1.5 1.5 1.5 1.5 0 0 0 1.5 1.5 1.5 1.5 0 0 0 1.5-1.5V4a1.5 1.5 0 0 0-1.5-1.5 1.5 1.5 0 0 0-1.5 1.5 1.5 1.5 0 0 0 1.5 1.5h6a1.5 1.5 0 0 0 1.5-1.5 1.5 1.5 0 0 0-1.5-1.5Z"/>',
  copy: '<rect x="2" y="5.5" width="7.5" height="7" rx="1"/><path d="M11.5 8.5H12A1.5 1.5 0 0 0 13.5 7V3A1.5 1.5 0 0 0 12 1.5H7.5A1.5 1.5 0 0 0 6 3v.5"/>',
  'external-link':
    '<path d="M11.5 8.5V12A1.5 1.5 0 0 1 10 13.5H3A1.5 1.5 0 0 1 1.5 12V5A1.5 1.5 0 0 1 3 3.5h3.5M8.5 1.5H12.5v4M12.5 1.5 6 8"/>',
  'file-down':
    '<path d="M9.5 1.5H3.5A1.5 1.5 0 0 0 2 3v8a1.5 1.5 0 0 0 1.5 1.5h7A1.5 1.5 0 0 0 12 11V5Z"/><path d="M9.5 1.5V5H13"/><path d="M7 11V8m0 3-1.4-1.4M7 11l1.4-1.4"/>',
  'git-fork':
    '<circle cx="4.5" cy="3" r="1.5"/><circle cx="4.5" cy="11" r="1.5"/><circle cx="9.5" cy="7" r="1.5"/><path d="M4.5 4.5v2.6c0 .6.4 1.1 1 1.2 1.9.5 3 1 3 2.4v1.8"/>',
  flask: '<path d="M8 1.5V6l4 5.3A1.7 1.7 0 0 1 10.6 13.5h-7.2A1.7 1.7 0 0 1 2 11.3L6 6V1.5M4.5 1.5h5M5 8h4"/>',
  gauge:
    '<path d="M12.5 7.5a5.5 5.5 0 1 0-1.6 3.9"/><path d="M7 8l2.6-3"/>',
  ghost:
    '<path d="M11.5 5.5A4.5 4.5 0 0 0 2.5 5.5v6.5l1.8-1.3 1.8 1.3 1.8-1.3 1.8 1.3 1.8-1.3Z"/><path d="M5.2 6h.01M8.8 6h.01"/>',
  'graduation-cap':
    '<path d="m1.5 6.5 5.5-2.5 5.5 2.5-5.5 2.5Z"/><path d="M4 7.8v2.7c0 .8 1.3 1.5 3 1.5s3-.7 3-1.5V7.8"/><path d="M12.5 6.5v4"/>',
  loader: '<path d="M12 7a5 5 0 1 0-10 0"/>',
  lock: '<rect x="3.5" y="6.5" width="7" height="6" rx="1"/><path d="M5 6.5V5a2 2 0 0 1 4 0v1.5"/>',
  maximize: '<path d="M1.5 8.5v4h4M12.5 5.5v-4h-4M1.5 5.5v-4h4M12.5 8.5v4h-4"/>',
  mic: '<path d="M5.5 1.5h3A1.5 1.5 0 0 1 10 3v4a2.5 2.5 0 0 1-5 0V3A1.5 1.5 0 0 1 6.5 1.5Z"/><path d="M2.5 7.5a4.5 4.5 0 0 0 9 0M7 12v1.5"/>',
  minus: '<path d="M1.5 7h11"/>',
  'pen-line':
    '<path d="m2 12 1.2-3.2L10.5 1.5a1.4 1.4 0 0 1 2 2L5.2 10.8 2 12Z"/><path d="M8.9 3.3l1.8 1.8"/><path d="M2 13h10"/>',
  plus: '<path d="M7 1.5v11M1.5 7h11"/>',
  quote:
    '<path d="M3 6.5h3V10H3.8A3.3 3.3 0 0 0 3 11.8V13M8 6.5h3V10H8.8A3.3 3.3 0 0 0 8 11.8V13"/>',
  rocket:
    '<path d="M7 1.5C5.1 1.5 3.8 3.4 3.8 6c0 2.7 1 4.8 2.7 6.1L7 12.6l.5-.5C9.2 10.8 10.2 8.7 10.2 6c0-2.6-1.3-4.5-3.2-4.5Z"/><path d="M7 4.3a1.4 1.4 0 1 0 0 2.8 1.4 1.4 0 0 0 0-2.8Z"/>',
  'rotate-ccw':
    '<path d="M3.4 6.5A5 5 0 1 1 2.5 9"/><path d="M2.5 3.5v3h3"/>',
  sun: '<circle cx="7" cy="7" r="2.6"/><path d="M7 .9v1.6M7 11.5v1.6M.9 7h1.6M11.5 7h1.6M3 3l1.1 1.1M9.9 9.9 11 11M3 11l1.1-1.1M9.9 4.1 11 3"/>',
  'sun-bright':
    '<circle cx="7" cy="7" r="2.5"/><path d="M7 .4v2.1M7 11.5v2.1M.4 7h2.1M11.5 7h2.1M2.2 2.2l1.5 1.5M10.3 10.3l1.5 1.5M2.2 11.8l1.5-1.5M10.3 3.7l1.5-1.5"/>',
  send: '<path d="M13.5 1.5 1.5 8.5l5.5 1.5L8.5 13Z"/><path d="M7 10 13.5 1.5"/>',
  sparkles:
    '<path d="M7 1.5V5M7 9v3.5M1.5 7H5M9 7h3.5M3.3 3.3l1.5 1.5M9.2 9.2l1.5 1.5"/>',
  target:
    '<circle cx="7" cy="7" r="5.5"/><circle cx="7" cy="7" r="2.5"/><path d="M7 6.7a.3.3 0 1 0 0 .6.3.3 0 0 0 0-.6Z"/>',
  terminal: '<path d="m2.5 4 4 3.5-4 3.5M8.5 11h4"/>',
  trophy:
    '<path d="M5 1.5h4v4a2 2 0 0 1-4 0Z"/><path d="M5 2.5H3.2a1.3 1.3 0 0 0 .3 2.5A2.2 2.2 0 0 0 5 5.8M9 2.5h1.8a1.3 1.3 0 0 1-.3 2.5A2.2 2.2 0 0 1 9 5.8"/><path d="M7 7.5V12M4.5 12.5h5"/><path d="M4.5 11.8V12.5A2 2 0 0 0 7 12.3a2 2 0 0 0 2.5.2v-2"/>',
  users:
    '<circle cx="5" cy="4.5" r="2.5"/><path d="M8.8 13v-1a3 3 0 0 0-3-3h-1.6a3 3 0 0 0-3 3v1M9.5 2.8a2.5 2.5 0 0 1 0 4.9M12 12v-1.3a3 3 0 0 0-1.8-2.8"/>',
}

export type IconName = keyof typeof FILES | keyof typeof CUSTOM

interface IconProps {
  name: IconName
  size?: number
  strokeWidth?: number
  className?: string
  /** When set, the icon becomes visible to screen readers with this label. */
  label?: string
  /** Passed through to the <svg> — e.g. per-category tone in the constellation. */
  style?: CSSProperties
}

export function Icon({ name, size = 16, strokeWidth = 1.5, className, label, style }: IconProps) {
  const file = FILES[name]
  const raw = file ? STREAMLINE[file] : undefined
  const inner = raw
    ? raw.replace(/^<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '')
    : CUSTOM[name]
  if (!inner) return null

  return (
    <svg
      viewBox="0 0 14 14"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn('shrink-0', className)}
      style={style}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      dangerouslySetInnerHTML={{ __html: inner }}
    />
  )
}
