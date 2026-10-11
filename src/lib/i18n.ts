import en from '@/i18n/en.json'
import ja from '@/i18n/ja.json'
import type { UIState } from '@/store/ui'

export type Mode = UIState['mode']

/**
 * Resolve a dotted path (e.g. "nav.about") against a dictionary.
 * Returns `undefined` when any segment is missing.
 */
function lookup(dict: Record<string, unknown>, path: string): unknown {
  let cur: unknown = dict
  for (const seg of path.split('.')) {
    if (cur === null || typeof cur !== 'object' || !(seg in cur)) return undefined
    cur = (cur as Record<string, unknown>)[seg]
  }
  return cur
}

/**
 * Translate a key for the given mode. Falls back to English
 * (or the raw key if even English is missing). Never throws.
 */
export function t(mode: Mode, key: string): string {
  if (mode === 'ja') {
    const v = lookup(ja as unknown as Record<string, unknown>, key)
    if (typeof v === 'string') return v
  }
  const enV = lookup(en as unknown as Record<string, unknown>, key)
  return typeof enV === 'string' ? enV : key
}
